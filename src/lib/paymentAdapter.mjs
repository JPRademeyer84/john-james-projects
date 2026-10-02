/** Ubuntu Afrique staging payment observation. Does not confirm payment. */

import { compareMoney, formatMoney, formatMoney2, parseMoney } from "./money.mjs"

const PAYMENT_TOTAL_MISMATCH = "Payment amount must match the Ubuntu price-version total"

function canonicalAmount(input) {
  const scaled = parseMoney(input)
  const two = formatMoney2(scaled)
  if (compareMoney(parseMoney(two), scaled) === 0) return two
  return formatMoney(scaled)
}

export function assertPaymentMatchesOrder(order, paidAmount) {
  if (!order || order.total == null || String(order.total).trim() === "") {
    throw new Error(PAYMENT_TOTAL_MISMATCH)
  }
  let expected
  let paid
  try {
    expected = parseMoney(order.total)
    paid = parseMoney(paidAmount)
  } catch {
    throw new Error(PAYMENT_TOTAL_MISMATCH)
  }
  if (compareMoney(paid, expected) !== 0) {
    throw new Error(PAYMENT_TOTAL_MISMATCH)
  }
}

export function recordPaymentEvent({ orderId, kind, paymentId, amount, provider, order } = {}) {
  const normalizedKind = String(kind || "").toUpperCase()
  if (normalizedKind !== "CARD" && normalizedKind !== "FRACTION") {
    throw new Error("kind must be CARD or FRACTION")
  }
  const id = String(orderId || "").trim()
  const payId = String(paymentId || "").trim()
  if (!id) throw new Error("orderId is required")
  if (!payId) throw new Error("paymentId is required")
  if (order != null) {
    assertPaymentMatchesOrder(order, amount)
  }
  const resolvedProvider = String(provider ?? "").trim() || "UA_STAGING"
  return {
    status: "RECORDED",
    orderId: id,
    kind: normalizedKind,
    paymentId: payId,
    amount: canonicalAmount(amount),
    provider: resolvedProvider,
  }
}
