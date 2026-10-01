import { addMoney, formatMoney2, parseMoney } from "./money.mjs"
import { blpContribution } from "./blpEngine.mjs"

export function currentBlpPeriod(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(date.getTime())) {
    throw new Error("now must be a valid date")
  }
  const year = date.getUTCFullYear()
  const monthIndex = date.getUTCMonth()
  const month = String(monthIndex + 1).padStart(2, "0")
  return {
    periodId: year + "-" + month,
    startsAt: new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0)).toISOString(),
    endsAt: new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0)).toISOString(),
  }
}

export function creditConfirmVolume({ order, uplineUserIds = [], now = new Date() }) {
  if (!order || !order.id) {
    throw new Error("order is required")
  }
  const qv = parseMoney(order.qv || "0")
  if (qv < 0n) {
    throw new Error("qv cannot be negative")
  }
  const buyerId = String(order.userId || "").trim()
  if (!buyerId) {
    throw new Error("order.userId is required")
  }

  const teamUserIds = []
  const seen = new Set()
  for (const raw of [buyerId, ...uplineUserIds]) {
    const id = String(raw || "").trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    teamUserIds.push(id)
  }

  const contribution = blpContribution(order.commissionableValue)
  const period = currentBlpPeriod(now)
  return {
    sourceTransactionId: String(order.id),
    buyerId,
    qv: formatMoney2(qv),
    teamUserIds,
    blpAccrual: {
      periodId: period.periodId,
      startsAt: period.startsAt,
      endsAt: period.endsAt,
      commissionableAdded: contribution.commissionableValue,
      blpAdded: contribution.blpTotal,
    },
  }
}

export function sumBlpAccruals(accruals) {
  if (!Array.isArray(accruals)) {
    throw new Error("accruals must be an array")
  }
  const commissionable = accruals.reduce(
    (sum, row) => addMoney(sum, parseMoney(row.commissionableAdded || "0")),
    0n
  )
  const blp = accruals.reduce((sum, row) => addMoney(sum, parseMoney(row.blpAdded || "0")), 0n)
  return {
    commissionableSales: formatMoney2(commissionable),
    blpTotal: formatMoney2(blp),
  }
}