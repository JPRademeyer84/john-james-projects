import { createFileRoute } from "@tanstack/react-router"
import { distributeBlpPeriod } from "../../../../lib/blpEngine.mjs"
import { persistBlpPeriod } from "../../../../lib/persistBlp.server"
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

        const periodId = String(body.periodId || "").trim()
        const startsAt = String(body.startsAt || "").trim()
        const endsAt = String(body.endsAt || "").trim()
        const commissionableSales = String(body.commissionableSales || "").trim()
        if (!periodId || !startsAt || !endsAt || !commissionableSales) {
          return Response.json({
            ok: false,
            error: "periodId, startsAt, endsAt, and commissionableSales are required",
          }, { status: 400 })
        }

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu write refused" }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured" }, { status: 503 })
        }

        const members = await loadBlpMembers(ubuntu)
        let result
        try {
          result = distributeBlpPeriod({ periodId, commissionableSales, members })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "BLP failed" }, { status: 400 })
        }

        try {
          const persisted = await persistBlpPeriod(ubuntu, {
            periodId: result.periodId,
            startsAt,
            endsAt,
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
          })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Persist failed" }, { status: 500 })
        }
      },
    },
  },
})