import { quoteCard } from "./cardEconomics.mjs"
import { quoteFractions } from "./fractionEngine.mjs"
import { processGapCover } from "./gapCover.mjs"
import { creditConfirmVolume } from "./volumeEngine.mjs"

export function createPendingCardOrder({
  orderId,
  userId,
  productType,
  quantity = 1,
  sponsorId = "",
}) {
  const quote = quoteCard(productType, quantity)
  return {
    id: String(orderId),
    kind: "CARD",
    userId: String(userId),
    productId: quote.productType,
    quantity: quote.quantity,
    total: quote.totals.retailPrice,
    commissionableValue: quote.totals.retailPrice,
    qv: quote.totals.qv,
    cost: quote.totals.cost,
    gap: quote.totals.gap,
    blp: quote.totals.blp,
    ubuntuAfriqueGross: quote.totals.ubuntuAfriqueGross,
    sponsorId: sponsorId ? String(sponsorId) : "",
    status: "PENDING_PAYMENT",
    quote,
  }
}

export function createPendingFractionOrder({
  orderId,
  userId,
  quantity,
  aureusSharePrice,
  aureusPhase,
  remainingUnderlying,
  sponsorId = "",
}) {
  const quote = quoteFractions({
    quantity,
    aureusSharePrice,
    aureusPhase,
    remainingUnderlying,
  })
  return {
    id: String(orderId),
    kind: "FRACTION",
    userId: String(userId),
    productId: "AUREUS_FRACTION",
    quantity: quote.quantity,
    total: quote.total,
    commissionableValue: quote.total,
    qv: quote.qv,
    cost: quote.allocationComponent,
    gap: quote.gap,
    blp: quote.blp,
    ubuntuAfriqueGross: quote.ubuntuAfriqueGross,
    aureusPhase: quote.aureusPhase,
    aureusSharePrice: quote.aureusSharePrice,
    underlyingShareEquivalent: quote.underlyingShareEquivalent,
    allocationComponent: quote.allocationComponent,
    remainingUnderlying: quote.remainingUnderlying,
    sponsorId: sponsorId ? String(sponsorId) : "",
    status: "PENDING_PAYMENT",
    quote,
  }
}

export function confirmCommercePayment({
  order,
  paymentId,
  members,
  scheduleId = "STANDARD_25",
  uplineUserIds = [],
  now = new Date(),
}) {
  if (!order || !order.id) {
    throw new Error("order is required")
  }
  if (!paymentId) {
    throw new Error("paymentId is required")
  }
  if (order.status === "PAID") {
    if (order.paymentId && order.paymentId !== String(paymentId)) {
      throw new Error("Order already settled against a different payment")
    }
    return order
  }
  if (order.status !== "PENDING_PAYMENT") {
    throw new Error(`Order ${order.id} cannot be confirmed from ${order.status}`)
  }

  const gap = processGapCover({
    commissionableValue: order.commissionableValue,
    members,
    scheduleId,
  })
  const volume = creditConfirmVolume({
    order,
    uplineUserIds: uplineUserIds.length ? uplineUserIds : (members || []).map((row) => row.userId),
    now,
  })

  const confirmed = {
    ...order,
    status: "PAID",
    paymentId: String(paymentId),
    gapCover: {
      totalPaid: gap.totalPaid,
      unclaimedGap: gap.unclaimedGap,
      payments: gap.payments,
      compPlanVersion: gap.compPlanVersion,
    },
    volume,
    blpAccrual: volume.blpAccrual,
  }

  if (order.kind === "FRACTION") {
    confirmed.ownership = {
      userId: order.userId,
      quantity: order.quantity,
      aureusPhase: order.aureusPhase,
      aureusSharePrice: order.aureusSharePrice,
      underlyingShareEquivalent: order.underlyingShareEquivalent,
    }
  }

  return confirmed
}