import { createFileRoute } from "@tanstack/react-router"
import { confirmCommercePayment, createPendingCardOrder, createPendingFractionOrder } from "../../../../lib/commerceOrders.mjs"
import { getUbuntuServerClient, loadGapCoverMembers } from "../../../../lib/ubuntuServer.server"
import { persistGapCoverResult } from "../../../../lib/persistGap.server"
import { persistConfirmVolume } from "../../../../lib/persistVolume.server"

function authorizeConfirm(request: Request, body: Record<string, unknown>) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromBody = String(body.confirmSecret || "")
  if (header !== expected && fromBody !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

export const Route = createFileRoute("/api/admin/commerce/confirm-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        const auth = authorizeConfirm(request, body)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error }, { status: auth.status })
        }

        const paymentId = String(body.paymentId || "").trim()
        const kind = String(body.kind || "").toUpperCase()
        if (!paymentId || (kind !== "CARD" && kind !== "FRACTION")) {
          return Response.json({ ok: false, error: "paymentId and kind=CARD|FRACTION are required" }, { status: 400 })
        }

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu write refused" }, { status: 500 })
        }

        let order
        try {
          if (kind === "CARD") {
            order = createPendingCardOrder({
              orderId: String(body.orderId || ""),
              userId: String(body.userId || ""),
              productType: String(body.productType || ""),
              quantity: Number(body.quantity || 1),
              sponsorId: String(body.sponsorId || ""),
            })
          } else {
            order = createPendingFractionOrder({
              orderId: String(body.orderId || ""),
              userId: String(body.userId || ""),
              quantity: Number(body.quantity || 1),
              aureusSharePrice: String(body.aureusSharePrice || "100.00"),
              aureusPhase: Number(body.aureusPhase || 10),
              remainingUnderlying: body.remainingUnderlying ? String(body.remainingUnderlying) : undefined,
              sponsorId: String(body.sponsorId || ""),
            })
          }
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Order rebuild failed" }, { status: 400 })
        }

        if (ubuntu && body.orderId) {
          const table = kind === "CARD" ? "ua_card_orders" : "ua_fraction_transactions"
          const statusField = kind === "CARD" ? "order_status" : "transaction_status"
          const { data: existing } = await ubuntu.from(table).select("*").eq("id", String(body.orderId)).maybeSingle()
          if (existing && String(existing[statusField] || "") === "PAID") {
            return Response.json({
              ok: true,
              order: { ...order, status: "PAID", paymentId: existing.payment_id || paymentId },
              idempotent: true,
            })
          }
        }

        const sellerId = String(body.sellerId || order.sponsorId || order.userId)
        let members: Array<{ userId: string; rank: string }> = []
        if (ubuntu) {
          members = await loadGapCoverMembers(ubuntu, sellerId)
        }
        if (Array.isArray(body.members) && body.members.length) {
          return Response.json({ ok: false, error: "Client-supplied rank chains are rejected" }, { status: 400 })
        }

        const uplineUserIds = [sellerId, ...members.map((row) => row.userId)]
        let confirmed
        try {
          confirmed = confirmCommercePayment({ order, paymentId, members, uplineUserIds })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Confirm failed" }, { status: 400 })
        }

        if (ubuntu && confirmed.gapCover) {
          try {
            await persistGapCoverResult(
              ubuntu,
              confirmed.id,
              sellerId,
              confirmed.productId,
              {
                commissionableValue: confirmed.commissionableValue,
                compPlanVersion: confirmed.gapCover.compPlanVersion,
                payments: confirmed.gapCover.payments,
              }
            )
            if (kind === "CARD") {
              await ubuntu.from("ua_card_orders").update({
                order_status: "PAID",
                payment_id: paymentId,
              }).eq("id", confirmed.id)
            } else {
              await ubuntu.from("ua_fraction_transactions").update({
                transaction_status: "PAID",
                payment_id: paymentId,
              }).eq("id", confirmed.id)
              if (confirmed.ownership && Number.isInteger(Number(confirmed.userId))) {
                await ubuntu.from("ua_fraction_ownership").insert({
                  user_id: Number(confirmed.userId),
                  source_transaction_id: confirmed.id,
                  quantity: confirmed.quantity,
                  aureus_phase: confirmed.aureusPhase,
                  aureus_share_price: confirmed.aureusSharePrice,
                  underlying_share_equivalent: confirmed.underlyingShareEquivalent,
                })
              }
            }
            if (confirmed.volume) {
              await persistConfirmVolume(ubuntu, confirmed.volume)
            }
          } catch (err) {
            return Response.json({ ok: false, error: err instanceof Error ? err.message : "Persist failed" }, { status: 500 })
          }
        }

        return Response.json({ ok: true, order: confirmed, persisted: Boolean(ubuntu) })
      },
    },
  },
})