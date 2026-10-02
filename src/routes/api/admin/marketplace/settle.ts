import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient, loadGapCoverMembers } from "../../../../lib/ubuntuServer.server"
import { settleMarketplaceOrder } from "../../../../lib/marketplaceSettlement.mjs"
import { persistMarketplaceSettlement } from "../../../../lib/persistMarketplaceSettlement.server"

function authorize(request: Request, body: Record<string, unknown>) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromBody = String(body.confirmSecret || "")
  if (header !== expected && fromBody !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

function relationMissing(error?: { message?: string; code?: string } | null) {
  if (!error) return false
  const message = String(error.message || "")
  return (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("Could not find the table") ||
    error.code === "PGRST205" ||
    error.code === "42P01"
  )
}

export const Route = createFileRoute("/api/admin/marketplace/settle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as Record<string, unknown>
        const auth = authorize(request, body)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        }
        if (Object.prototype.hasOwnProperty.call(body, "members") || Object.prototype.hasOwnProperty.call(body, "rank")) {
          return Response.json({
            ok: false,
            error: "Client-supplied rank chains are rejected",
            checkoutEnabled: false,
          }, { status: 400 })
        }
        if (
          Object.prototype.hasOwnProperty.call(body, "remainingUnderlying") ||
          Object.prototype.hasOwnProperty.call(body, "aureusSharePrice")
        ) {
          return Response.json({
            ok: false,
            error: "remainingUnderlying and aureusSharePrice are taken from Ubuntu, not the client",
            checkoutEnabled: false,
          }, { status: 400 })
        }
        if (Object.prototype.hasOwnProperty.call(body, "gapSchedule") && String(body.gapSchedule) !== "STANDARD_25") {
          return Response.json({
            ok: false,
            error: "Marketplace uses shared Gap Cover STANDARD_25 only",
            checkoutEnabled: false,
          }, { status: 400 })
        }

        const orderId = String(body.orderId || "").trim()
        if (!orderId) {
          return Response.json({ ok: false, error: "orderId is required", checkoutEnabled: false }, { status: 400 })
        }

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Ubuntu write refused",
            checkoutEnabled: false,
          }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({
            ok: false,
            error: "Ubuntu Afrique database is not configured",
            checkoutEnabled: false,
          }, { status: 503 })
        }

        const { data: order, error: orderError } = await ubuntu
          .from("ua_marketplace_orders")
          .select("id, company_id, product_id, user_id, retail_price, company_payout, commissionable_value, qv, gap_schedule, status")
          .eq("id", orderId)
          .maybeSingle()
        if (orderError) {
          return Response.json({ ok: false, error: orderError.message, checkoutEnabled: false }, { status: 500 })
        }
        if (!order) {
          return Response.json({ ok: false, error: "Pending marketplace order not found", checkoutEnabled: false }, { status: 404 })
        }

        let company = {
          id: String(order.company_id),
          isActive: true,
          payout: String(order.company_payout || "0.00"),
        }
        const { data: companyRow, error: companyError } = await ubuntu
          .from("ua_marketplace_companies")
          .select("id, is_active")
          .eq("id", order.company_id)
          .maybeSingle()
        if (companyError && !relationMissing(companyError)) {
          return Response.json({ ok: false, error: companyError.message, checkoutEnabled: false }, { status: 500 })
        }
        if (!companyError) {
          company = {
            id: String(companyRow?.id || order.company_id),
            isActive: companyRow?.is_active === true,
            payout: String(order.company_payout || "0.00"),
          }
        }

        const sellerUserId = String(body.sellerUserId || order.user_id || "").trim()
        const members = await loadGapCoverMembers(ubuntu, sellerUserId)
        const settleInput = {
          id: String(order.id),
          companyId: String(order.company_id),
          productId: String(order.product_id),
          userId: order.user_id == null ? undefined : String(order.user_id),
          total: String(order.commissionable_value || order.retail_price),
          retailPrice: String(order.retail_price),
          companyPayout: String(order.company_payout),
          commissionableValue: String(order.commissionable_value || order.retail_price),
          qv: String(order.qv),
          gapSchedule: String(order.gap_schedule || "STANDARD_25"),
        }

        let settled
        try {
          settled = settleMarketplaceOrder({ order: settleInput, members, company })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Marketplace settle failed"
          const inactive = message.includes("Marketplace company is not active")
          return Response.json({ ok: false, error: message, checkoutEnabled: false }, { status: inactive ? 403 : 400 })
        }

        if (String(order.status) === "SETTLED") {
          return Response.json({
            ok: true,
            settled: true,
            gapCover: settled.gapCover,
            checkoutEnabled: false,
            idempotent: true,
          })
        }

        try {
          await persistMarketplaceSettlement(ubuntu, {
            order: settleInput,
            companyPayout: settled.companyPayout,
            status: "SETTLED",
          })
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Marketplace settlement persist failed",
            checkoutEnabled: false,
          }, { status: 500 })
        }

        return Response.json({
          ok: true,
          settled: true,
          gapCover: settled.gapCover,
          checkoutEnabled: false,
        })
      },
    },
  },
})
