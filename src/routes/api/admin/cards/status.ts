import { createFileRoute } from "@tanstack/react-router"
import { advanceCardFulfilment } from "../../../../lib/commerceOrders.mjs"
import { getUbuntuServerClient } from "../../../../lib/ubuntuServer.server"

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

export const Route = createFileRoute("/api/admin/cards/status")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        const auth = authorize(request, body)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        }

        const orderId = String(body.orderId || "").trim()
        const nextStatus = String(body.status || "").trim().toUpperCase()
        if (!orderId || !nextStatus) {
          return Response.json({
            ok: false,
            error: "orderId and status are required",
            checkoutEnabled: false,
          }, { status: 400 })
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
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false }, { status: 503 })
        }

        const { data: existing, error: existingError } = await ubuntu
          .from("ua_card_orders")
          .select("id, order_status, fulfilment_status")
          .eq("id", orderId)
          .maybeSingle()
        if (existingError) {
          return Response.json({ ok: false, error: existingError.message, checkoutEnabled: false }, { status: 500 })
        }
        if (!existing) {
          return Response.json({ ok: false, error: "Card order not found", checkoutEnabled: false }, { status: 404 })
        }
        if (String(existing.order_status || "") !== "PAID") {
          return Response.json({
            ok: false,
            error: "Card fulfilment starts after PAID",
            checkoutEnabled: false,
          }, { status: 409 })
        }

        let fulfilmentStatus
        try {
          fulfilmentStatus = advanceCardFulfilment(existing.fulfilment_status || "PROCESSING", nextStatus)
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Invalid card fulfilment transition",
            checkoutEnabled: false,
          }, { status: 400 })
        }

        const { error: updateError } = await ubuntu
          .from("ua_card_orders")
          .update({
            fulfilment_status: fulfilmentStatus,
            fulfilment_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("order_status", "PAID")
        if (updateError) {
          return Response.json({ ok: false, error: updateError.message, checkoutEnabled: false }, { status: 500 })
        }

        return Response.json({
          ok: true,
          orderId,
          orderStatus: "PAID",
          fulfilmentStatus,
          checkoutEnabled: false,
        })
      },
    },
  },
})