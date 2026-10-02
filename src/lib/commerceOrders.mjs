import { quoteCard } from "./cardEconomics.mjs"
import { consumeUnderlyingInventory, quoteFractions } from "./fractionEngine.mjs"
import { processGapCover } from "./gapCover.mjs"
import { creditConfirmVolume } from "./volumeEngine.mjs"
import { formatMoney2, parseMoney, percentOf } from "./money.mjs"

export const CARD_FULFILMENT_STATUSES = Object.freeze([
  "PROCESSING",
  "ORDERED_FROM_PROVIDER",
  "READY_FOR_SHIPPING",
  "SHIPPED",
  "DELIVERED",
])

export function applyPriceVersionSnapshot(order, version) {
  if (!order || !version || !version.id || version.retailPrice == null || String(version.retailPrice).trim() === "") {
    throw new Error("Ubuntu price version snapshot is required")
  }
  const qty = BigInt(order.quantity)
  const unit = parseMoney(version.retailPrice)
  const costUnit = parseMoney(version.productCost || "0")
  const qvUnit = parseMoney(version.qv || version.retailPrice)
  const commissionableUnit = parseMoney(version.commissionableValue || version.retailPrice)
  const total = unit * qty
  const cost = costUnit * qty
  const qv = qvUnit * qty
  const commissionable = commissionableUnit * qty
  const gap = percentOf(commissionable, "25")
  const blp = percentOf(commissionable, String(version.blpRate || "5"))
  const gross = total - cost - gap - blp
  const unitPrice = formatMoney2(unit)
  const next = {
    ...order,
    total: formatMoney2(total),
    commissionableValue: formatMoney2(commissionable),
    qv: formatMoney2(qv),
    cost: formatMoney2(cost),
    gap: formatMoney2(gap),
    blp: formatMoney2(blp),
    ubuntuAfriqueGross: formatMoney2(gross),
    snapshotUnitPrice: unitPrice,
  }
  if (order.kind === "CARD") {
    next.priceVersionId = String(version.id)
    next.quote = {
      ...order.quote,
      unit: {
        ...order.quote.unit,
        retailPrice: unitPrice,
        cost: formatMoney2(costUnit),
        gap: formatMoney2(percentOf(unit, "25")),
        blp: formatMoney2(percentOf(unit, String(version.blpRate || "5"))),
        ubuntuAfriqueGross: formatMoney2(unit - costUnit - percentOf(unit, "25") - percentOf(unit, String(version.blpRate || "5"))),
        qv: formatMoney2(qvUnit),
      },
      totals: {
        ...order.quote.totals,
        retailPrice: formatMoney2(total),
        cost: formatMoney2(cost),
        gap: formatMoney2(gap),
        blp: formatMoney2(blp),
        ubuntuAfriqueGross: formatMoney2(gross),
        qv: formatMoney2(qv),
      },
    }
  } else {
    next.priceVersion = String(version.id)
    next.quote = {
      ...order.quote,
      fractionUnitPrice: unitPrice,
      total: formatMoney2(total),
    }
  }
  return next
}

export function advanceCardFulfilment(currentStatus, nextStatus) {
  const from = String(currentStatus || "").toUpperCase()
  const to = String(nextStatus || "").toUpperCase()
  const path = CARD_FULFILMENT_STATUSES
  const i = path.indexOf(from)
  const j = path.indexOf(to)
  if (i < 0 || j !== i + 1) {
    throw new Error("Invalid card fulfilment transition")
  }
  return to
}

export function requireUbuntuUserId(userId) {
  const id = Number(userId)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("userId must be an existing Ubuntu ua_users.id")
  }
  return id
}

export function assertUbuntuUserActive(user) {
  if (!user || user.isActive !== true) {
    throw new Error("Ubuntu user is not active")
  }
  return user
}

const PRICE_VERSION_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function rejectClientSuppliedPrice(input) {
  for (const key of ["retailPrice", "unitPrice"]) {
    if (input[key] != null && String(input[key]).trim() !== "") {
      throw new Error("Price is taken from Ubuntu price versions, not the client")
    }
  }
  for (const key of ["priceVersionId", "priceVersion"]) {
    if (input[key] != null && typeof input[key] === "object") {
      throw new Error("Price is taken from Ubuntu price versions, not the client")
    }
  }
}

function readPriceVersionId(value) {
  if (value == null || String(value).trim() === "") return ""
  const id = String(value).trim()
  if (!PRICE_VERSION_UUID.test(id)) {
    throw new Error("priceVersionId must be a Ubuntu price version id")
  }
  return id
}

export function createPendingCardOrder({
  orderId,
  userId,
  productType,
  quantity = 1,
  sponsorId = "",
  priceVersionId = "",
  retailPrice,
  unitPrice,
  priceVersion,
}) {
  rejectClientSuppliedPrice({ retailPrice, unitPrice, priceVersionId, priceVersion })
  const versionId = readPriceVersionId(priceVersionId)
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
    ...(versionId ? { priceVersionId: versionId } : {}),
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
  priceVersion = "",
  retailPrice,
  unitPrice,
  priceVersionId,
}) {
  rejectClientSuppliedPrice({ retailPrice, unitPrice, priceVersionId, priceVersion })
  const versionId = readPriceVersionId(priceVersion)
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
    ...(versionId ? { priceVersion: versionId } : {}),
    status: "PENDING_PAYMENT",
    quote,
  }
}

export function pendingCardInsert(order) {
  if (!order || order.kind !== "CARD" || order.status !== "PENDING_PAYMENT") {
    throw new Error("pending card order is required")
  }
  return {
    id: String(order.id),
    user_id: Number.isInteger(Number(order.userId)) ? Number(order.userId) : null,
    product_id: order.productId,
    quantity: order.quantity,
    unit_price: order.snapshotUnitPrice || order.quote.unit.retailPrice,
    total: order.total,
    qv: order.qv,
    order_status: "PENDING_PAYMENT",
    sponsor_id: order.sponsorId || null,
    ...(order.priceVersionId ? { price_version_id: readPriceVersionId(order.priceVersionId) } : {}),
  }
}

export function pendingFractionInsert(order) {
  if (!order || order.kind !== "FRACTION" || order.status !== "PENDING_PAYMENT") {
    throw new Error("pending fraction order is required")
  }
  return {
    id: String(order.id),
    buyer_id: Number.isInteger(Number(order.userId)) ? Number(order.userId) : null,
    quantity: order.quantity,
    fraction_price: order.snapshotUnitPrice || order.quote.fractionUnitPrice || "10.00",
    total_amount: order.total,
    aureus_phase: order.aureusPhase,
    aureus_share_price: order.aureusSharePrice,
    underlying_share_equivalent: order.underlyingShareEquivalent,
    allocation_component: order.allocationComponent,
    qv: order.qv,
    transaction_status: "PENDING_PAYMENT",
    sponsor_id: order.sponsorId || null,
    ...(order.priceVersion ? { price_version: readPriceVersionId(order.priceVersion) } : {}),
  }
}

export function orderFromCardRow(row) {
  if (!row || !row.id) {
    throw new Error("Pending order not found")
  }
  const pending = createPendingCardOrder({
    orderId: String(row.id),
    userId: String(row.user_id || ""),
    productType: String(row.product_id || ""),
    quantity: Number(row.quantity || 1),
    sponsorId: String(row.sponsor_id || ""),
    priceVersionId: row.price_version_id || "",
  })
  if (row.unit_price != null && String(row.unit_price).trim() !== "") {
    pending.snapshotUnitPrice = formatMoney2(parseMoney(row.unit_price))
    if (pending.quote?.unit) pending.quote.unit.retailPrice = pending.snapshotUnitPrice
  }
  if (row.total != null && String(row.total).trim() !== "") {
    pending.total = formatMoney2(parseMoney(row.total))
    pending.commissionableValue = pending.total
    if (pending.quote?.totals) pending.quote.totals.retailPrice = pending.total
  }
  return pending
}

export function orderFromFractionRow(row, remainingUnderlying) {
  if (!row || !row.id) {
    throw new Error("Pending order not found")
  }
  const pending = createPendingFractionOrder({
    orderId: String(row.id),
    userId: String(row.buyer_id || ""),
    quantity: Number(row.quantity || 1),
    aureusSharePrice: String(row.aureus_share_price || "100.00"),
    aureusPhase: Number(row.aureus_phase || 10),
    remainingUnderlying,
    sponsorId: String(row.sponsor_id || ""),
    priceVersion: row.price_version || "",
  })
  if (row.fraction_price != null && String(row.fraction_price).trim() !== "") {
    pending.snapshotUnitPrice = formatMoney2(parseMoney(row.fraction_price))
    if (pending.quote) pending.quote.fractionUnitPrice = pending.snapshotUnitPrice
  }
  if (row.total_amount != null && String(row.total_amount).trim() !== "") {
    pending.total = formatMoney2(parseMoney(row.total_amount))
    pending.commissionableValue = pending.total
    if (pending.quote) pending.quote.total = pending.total
  }
  return pending
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

  if (order.kind === "CARD") {
    confirmed.fulfilmentStatus = "PROCESSING"
  }

  if (order.kind === "FRACTION") {
    confirmed.ownership = {
      userId: order.userId,
      quantity: order.quantity,
      aureusPhase: order.aureusPhase,
      aureusSharePrice: order.aureusSharePrice,
      underlyingShareEquivalent: order.underlyingShareEquivalent,
    }
    confirmed.inventory = consumeUnderlyingInventory({
      remainingUnderlying: order.remainingUnderlying,
      soldUnderlying: order.soldUnderlying || "0",
      underlyingShareEquivalent: order.underlyingShareEquivalent,
    })
  }

  return confirmed
}
