import { createFileRoute } from "@tanstack/react-router"
import { confirmCommercePayment, orderFromCardRow, orderFromFractionRow } from "../../../../lib/commerceOrders.mjs"
import { getUbuntuServerClient, loadGapCoverMembers, loadUbuntuUser } from "../../../../lib/ubuntuServer.server"
import { persistGapCoverResult } from "../../../../lib/persistGap.server"
import { persistConfirmVolume } from "../../../../lib/persistVolume.server"
import { persistFractionInventory } from "../../../../lib/persistInventory.server"
import { loadPaymentEvent } from "../../../../lib/persistPayment.server"
import { assertPaymentCurrency, assertRecordedPaymentForConfirm } from "../../../../lib/paymentAdapter.mjs"
import { addMoney, formatMoney2, parseMoney } from "../../../../lib/money.mjs"

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
        const orderId = String(body.orderId || "").trim()
        if (!paymentId || !orderId || (kind !== "CARD" && kind !== "FRACTION")) {
          return Response.json({ ok: false, error: "paymentId, orderId, and kind=CARD|FRACTION are required" }, { status: 400 })
        }
        if (Object.prototype.hasOwnProperty.call(body, "amount") || Object.prototype.hasOwnProperty.call(body, "total")) {
          return Response.json({
            ok: false,
            error: "Payment amount is taken from the recorded Ubuntu payment event, not the client",
            checkoutEnabled: false,
          }, { status: 400 })
        }
        try {
          assertPaymentCurrency(body.currency)
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Payment currency must be USD",
            checkoutEnabled: false,
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

        const table = kind === "CARD" ? "ua_card_orders" : "ua_fraction_transactions"
        const statusField = kind === "CARD" ? "order_status" : "transaction_status"
        const { data: existing, error: existingError } = await ubuntu.from(table).select("*").eq("id", orderId).maybeSingle()
        if (existingError) {
          return Response.json({ ok: false, error: existingError.message }, { status: 500 })
        }
        if (!existing) {
          return Response.json({ ok: false, error: "Pending order not found" }, { status: 404 })
        }

        const recordedTotal = kind === "CARD" ? existing.total : existing.total_amount
        let recorded
        try {
          recorded = await loadPaymentEvent(ubuntu, paymentId)
          assertRecordedPaymentForConfirm({
            event: recorded
              ? {
                  paymentId: String(recorded.payment_id),
                  orderId: String(recorded.order_id),
                  kind: String(recorded.kind),
                  amount: String(recorded.amount),
                  status: String(recorded.status),
                }
              : null,
            order: { id: orderId, total: recordedTotal == null ? "" : String(recordedTotal) },
            paymentId,
            kind,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Recorded payment event is required"
          const missing = message.includes("required")
          return Response.json({
            ok: false,
            error: message,
            checkoutEnabled: false,
          }, { status: missing ? 409 : 400 })
        }

        if (String(existing[statusField] || "") === "PAID") {
          if (existing.payment_id && String(existing.payment_id) !== paymentId) {
            return Response.json({
              ok: false,
              error: "Order already settled against a different payment",
              checkoutEnabled: false,
            }, { status: 409 })
          }
          return Response.json({
            ok: true,
            order: { id: orderId, status: "PAID", paymentId: existing.payment_id || paymentId },
            idempotent: true,
            checkoutEnabled: false,
          })
        }

        const buyerId = kind === "CARD" ? existing.user_id : existing.buyer_id
        try {
          await loadUbuntuUser(ubuntu, String(buyerId || ""))
        } catch (err) {
          const message = err instanceof Error ? err.message : "Ubuntu user not found"
          const inactive = message.includes("not active")
          const missing = message.includes("not found") || message.includes("ua_users.id")
          return Response.json({
            ok: false,
            error: message,
            checkoutEnabled: false,
          }, { status: inactive ? 403 : missing ? 404 : 400 })
        }

        let order
        try {
          if (kind === "CARD") {
            order = orderFromCardRow(existing)
          } else {
            const { data: inventory } = await ubuntu
              .from("ua_underlying_inventory")
              .select("remaining_underlying, sold_underlying")
              .eq("id", "AUREUS_100K")
              .maybeSingle()
            const { data: reserve, error: reserveError } = await ubuntu
              .from("ua_aureus_liability_ledger")
              .select("amount")
              .eq("source_transaction_id", orderId)
              .eq("entry_type", "FRACTION_RESERVE")
              .maybeSingle()
            if (reserveError && !String(reserveError.message || "").includes("does not exist")) {
              throw new Error(reserveError.message)
            }
            let remainingForRebuild =
              inventory?.remaining_underlying != null ? String(inventory.remaining_underlying) : undefined
            if (reserve?.amount != null && remainingForRebuild != null) {
              remainingForRebuild = formatMoney2(
                addMoney(parseMoney(remainingForRebuild), parseMoney(String(reserve.amount)))
              )
            }
            order = orderFromFractionRow(existing, remainingForRebuild)
            if (inventory?.sold_underlying != null) {
              order.soldUnderlying = String(inventory.sold_underlying)
            }
          }
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Order rebuild failed" }, { status: 400 })
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
                fulfilment_status: confirmed.fulfilmentStatus || "PROCESSING",
                fulfilment_at: new Date().toISOString(),
              }).eq("id", confirmed.id)
            } else {
              await persistFractionInventory(ubuntu, {
                sourceTransactionId: confirmed.id,
                underlyingShareEquivalent: confirmed.ownership.underlyingShareEquivalent,
              })
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