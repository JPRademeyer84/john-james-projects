import { createFileRoute } from "@tanstack/react-router"
import { assertPaymentMatchesOrder, recordPaymentEvent } from "../../../../lib/paymentAdapter.mjs"
import { persistPaymentEvent } from "../../../../lib/persistPayment.server"
import { getUbuntuServerClient } from "../../../../lib/ubuntuServer.server"

function authorize(request: Request, body: Record<string, unknown>) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false as const, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromBody = String(body.confirmSecret || "")
  if (header !== expected && fromBody !== expected) {
    return { ok: false as const, status: 401, error: "Confirm secret required" }
  }
  return { ok: true as const }
}

function clientAmount(body: Record<string, unknown>) {
  if (body.amount == null) return undefined
  if (typeof body.amount === "string" && body.amount.trim() === "") return undefined
  return body.amount
}

export const Route = createFileRoute("/api/admin/commerce/record-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        const auth = authorize(request, body as Record<string, unknown>)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        }

        const paymentId = String(body.paymentId || "").trim()
        const kind = String(body.kind || "").toUpperCase()
        const orderId = String(body.orderId || "").trim()
        if (!paymentId || !orderId || (kind !== "CARD" && kind !== "FRACTION")) {
          return Response.json({
            ok: false,
            error: "paymentId, orderId, and kind=CARD|FRACTION are required",
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
          return Response.json({
            ok: false,
            error: "Ubuntu Afrique database is not configured",
            checkoutEnabled: false,
          }, { status: 503 })
        }

        const table = kind === "CARD" ? "ua_card_orders" : "ua_fraction_transactions"
        const statusField = kind === "CARD" ? "order_status" : "transaction_status"
        const totalField = kind === "CARD" ? "total" : "total_amount"
        const { data: existing, error: existingError } = await ubuntu
          .from(table)
          .select(`id, ${statusField}, ${totalField}`)
          .eq("id", orderId)
          .maybeSingle()
        if (existingError) {
          return Response.json({ ok: false, error: existingError.message, checkoutEnabled: false }, { status: 500 })
        }
        if (!existing) {
          return Response.json({ ok: false, error: "Pending order not found", checkoutEnabled: false }, { status: 404 })
        }
        if (String(existing[statusField] || "") !== "PENDING_PAYMENT") {
          return Response.json({
            ok: false,
            error: "Order is not pending payment",
            checkoutEnabled: false,
          }, { status: 409 })
        }

        const rawTotal = existing[totalField]
        if (rawTotal == null || String(rawTotal).trim() === "") {
          return Response.json({
            ok: false,
            error: "Payment amount must match the Ubuntu price-version total",
            checkoutEnabled: false,
          }, { status: 400 })
        }

        const order = { id: orderId, kind, total: String(rawTotal).trim() }
        const supplied = clientAmount(body as Record<string, unknown>)
        const provider = body.provider == null ? undefined : String(body.provider)

        try {
          if (supplied !== undefined) {
            assertPaymentMatchesOrder(order, supplied)
          }
          const event = recordPaymentEvent({
            orderId,
            kind,
            paymentId,
            amount: order.total,
            provider,
            order,
          })
          await persistPaymentEvent(ubuntu, event)
        } catch (err) {
          const message = err instanceof Error ? err.message : "Payment record failed"
          const conflict = message.includes("already recorded")
          return Response.json({ ok: false, error: message, checkoutEnabled: false }, { status: conflict ? 409 : 400 })
        }

        return Response.json({
          ok: true,
          recorded: true,
          checkoutEnabled: false,
          next: "confirm-payment",
        })
      },
    },
  },
})
