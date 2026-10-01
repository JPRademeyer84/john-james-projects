import { createFileRoute } from "@tanstack/react-router"
import { createPendingCardOrder } from "../../../lib/commerceOrders.mjs"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"

export const Route = createFileRoute("/api/cards/order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        try {
          const order = createPendingCardOrder({
            orderId: String(body.orderId || crypto.randomUUID()),
            userId: String(body.userId || ""),
            productType: String(body.productType || ""),
            quantity: Number(body.quantity || 1),
            sponsorId: String(body.sponsorId || ""),
          })
          if (!order.userId) {
            return Response.json({ ok: false, error: "userId is required" }, { status: 400 })
          }

          let ubuntu
          try {
            ubuntu = getUbuntuServerClient()
          } catch (err) {
            return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu write refused" }, { status: 500 })
          }

          if (ubuntu) {
            const { error } = await ubuntu.from("ua_card_orders").insert({
              id: order.id,
              user_id: Number.isInteger(Number(order.userId)) ? Number(order.userId) : null,
              product_id: order.productId,
              quantity: order.quantity,
              unit_price: order.quote.unit.retailPrice,
              total: order.total,
              qv: order.qv,
              order_status: "PENDING_PAYMENT",
              sponsor_id: order.sponsorId || null,
            })
            if (error) {
              return Response.json({ ok: false, error: error.message }, { status: 500 })
            }
          }

          return Response.json({ ok: true, order, persisted: Boolean(ubuntu), checkoutEnabled: false })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Order failed" }, { status: 400 })
        }
      },
    },
  },
})