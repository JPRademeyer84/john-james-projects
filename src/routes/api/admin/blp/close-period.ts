import { createFileRoute } from "@tanstack/react-router"
import { distributeBlpPeriod } from "../../../../lib/blpEngine.mjs"
import { persistBlpPeriod } from "../../../../lib/persistBlp.server"
import { currentBlpPeriod } from "../../../../lib/volumeEngine.mjs"
import { getUbuntuServerClient, loadBlpMembers } from "../../../../lib/ubuntuServer.server"

function authorizeBlp(request: Request, body: Record<string, unknown>) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromBody = String(body.confirmSecret || "")
  if (header !== expected && fromBody !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

export const Route = createFileRoute("/api/admin/blp/close-period")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        const auth = authorizeBlp(request, body)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error }, { status: auth.status })
        }
        if (Array.isArray(body.members) && body.members.length) {
          return Response.json({ ok: false, error: "Client-supplied rank chains are rejected" }, { status: 400 })
        }
        if (body.commissionableSales != null && String(body.commissionableSales).trim() !== "") {
          return Response.json({
            ok: false,
            error: "commissionableSales is taken from the open Ubuntu BLP period, not the client",
          }, { status: 400 })
        }

        const computed = currentBlpPeriod()
        const periodId = String(body.periodId || computed.periodId).trim()

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu write refused" }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured" }, { status: 503 })
        }

        const { data: period, error: periodError } = await ubuntu
          .from("ua_blp_periods")
          .select("id, starts_at, ends_at, commissionable_sales, blp_total, status")
          .eq("id", periodId)
          .maybeSingle()
        if (periodError) {
          return Response.json({ ok: false, error: periodError.message }, { status: 500 })
        }
        if (!period) {
          return Response.json({ ok: false, error: "Open BLP period not found" }, { status: 404 })
        }

        const members = (await loadBlpMembers(ubuntu)).filter((row) => row.isActive === true)
        let result
        try {
          result = distributeBlpPeriod({
            periodId,
            commissionableSales: String(period.commissionable_sales || "0"),
            members,
          })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "BLP failed" }, { status: 400 })
        }

        try {
          const persisted = await persistBlpPeriod(ubuntu, {
            periodId: result.periodId,
            startsAt: String(period.starts_at || computed.startsAt),
            endsAt: String(period.ends_at || computed.endsAt),
            commissionableSales: result.commissionableSales,
            blpTotal: result.blpTotal,
            unclaimedTotal: result.unclaimedTotal,
            payouts: result.payouts,
          })
          return Response.json({
            ok: true,
            period: result,
            persisted: true,
            idempotent: Boolean(persisted.idempotent),
            monthlyVolumeReset: Boolean(persisted.monthlyVolumeReset),
          })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Persist failed" }, { status: 500 })
        }
      },
    },
  },
})