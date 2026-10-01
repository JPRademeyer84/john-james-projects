import { createFileRoute } from "@tanstack/react-router"
import { createPendingFractionOrder } from "../../../lib/commerceOrders.mjs"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"

export const Route = createFileRoute("/api/fractions/order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        try {
          const order = createPendingFractionOrder({
            orderId: String(body.orderId || crypto.randomUUID()),
            userId: String(body.userId || ""),
            quantity: Number(body.quantity || 1),
            aureusSharePrice: String(body.aureusSharePrice || "100.00"),
            aureusPhase: Number(body.aureusPhase || 10),
            remainingUnderlying: body.remainingUnderlying ? String(body.remainingUnderlying) : undefined,
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
            const { error } = await ubuntu.from("ua_fraction_transactions").insert({
              id: order.id,
              buyer_id: Number.isInteger(Number(order.userId)) ? Number(order.userId) : null,
              quantity: order.quantity,
              fraction_price: "10.00",
              total_amount: order.total,
              aureus_phase: order.aureusPhase,
              aureus_share_price: order.aureusSharePrice,
              underlying_share_equivalent: order.underlyingShareEquivalent,
              allocation_component: order.allocationComponent,
              qv: order.qv,
              transaction_status: "PENDING_PAYMENT",
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