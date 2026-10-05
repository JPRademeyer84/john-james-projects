import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"
import { persistUbuntuPspWebhook } from "../../../lib/persistPsp.server"
import { AUREUS_PSP_REFUSED } from "../../../lib/ubuntuPsp.mjs"

export const Route = createFileRoute("/api/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as Record<string, unknown>
        if (
          Object.prototype.hasOwnProperty.call(body, "remainingUnderlying") ||
          Object.prototype.hasOwnProperty.call(body, "aureusSharePrice") ||
          Object.prototype.hasOwnProperty.call(body, "members")
        ) {
          return Response.json({
            ok: false,
            error: "Client commerce fields are rejected",
            checkoutEnabled: false,
          }, { status: 400 })
        }
        if (
          Object.prototype.hasOwnProperty.call(body, "aureusPspKey") ||
          Object.prototype.hasOwnProperty.call(body, "nowpayments")
        ) {
          return Response.json({ ok: false, error: AUREUS_PSP_REFUSED, checkoutEnabled: false }, { status: 400 })
        }

        const secret = String(process.env.UA_PSP_WEBHOOK_SECRET || "")
        const signature = request.headers.get("x-ua-psp-signature") || String(body.signature || "")
        const kind = String(body.kind || "").toUpperCase()
        const orderId = String(body.orderId || "").trim()
        const paymentId = String(body.paymentId || "").trim()
        if (!orderId || !paymentId || (kind !== "CARD" && kind !== "FRACTION")) {
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

        const order = { id: orderId, kind, total: String(existing[totalField] ?? "") }
        try {
          const persisted = await persistUbuntuPspWebhook(ubuntu, {
            secret,
            signature,
            payload: {
              paymentId,
              orderId,
              kind,
              amount: String(body.amount || order.total),
              currency: body.currency == null ? "USD" : String(body.currency),
            },
            order,
          })
          return Response.json({
            ok: true,
            recorded: true,
            idempotent: persisted.idempotent === true,
            provider: "UA_PSP_STAGING",
            checkoutEnabled: false,
            next: "confirm-payment",
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Ubuntu PSP webhook failed"
          const unauthorized = message.includes("signature") || message.includes("UA_PSP_WEBHOOK_SECRET")
          const refused = message.includes("Aureus")
          return Response.json({
            ok: false,
            error: message,
            checkoutEnabled: false,
          }, { status: unauthorized ? 401 : refused ? 400 : 400 })
        }
      },
    },
  },
})
