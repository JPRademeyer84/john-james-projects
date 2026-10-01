import { createFileRoute } from "@tanstack/react-router"
import { createPendingCardOrder, createPendingFractionOrder } from "../../../../lib/commerceOrders.mjs"
import { persistPendingCardOrder, persistPendingFractionOrder } from "../../../../lib/persistPending.server"
import { getUbuntuServerClient } from "../../../../lib/ubuntuServer.server"

function authorizeCreate(request: Request, body: Record<string, unknown>) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromBody = String(body.confirmSecret || "")
  if (header !== expected && fromBody !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

export const Route = createFileRoute("/api/admin/commerce/create-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        const auth = authorizeCreate(request, body)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error }, { status: auth.status })
        }
        if (Array.isArray(body.members) && body.members.length) {
          return Response.json({ ok: false, error: "Client-supplied rank chains are rejected" }, { status: 400 })
        }

        const kind = String(body.kind || "").toUpperCase()
        if (kind !== "CARD" && kind !== "FRACTION") {
          return Response.json({ ok: false, error: "kind=CARD|FRACTION is required" }, { status: 400 })
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

        try {
          if (kind === "CARD") {
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
            const persisted = await persistPendingCardOrder(ubuntu, order)
            return Response.json({
              ok: true,
              order,
              persisted: true,
              idempotent: Boolean(persisted.idempotent),
              checkoutEnabled: false,
            })
          }

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
          const persisted = await persistPendingFractionOrder(ubuntu, order)
          return Response.json({
            ok: true,
            order,
            persisted: true,
            idempotent: Boolean(persisted.idempotent),
            checkoutEnabled: false,
          })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Order create failed" }, { status: 400 })
        }
      },
    },
  },
})