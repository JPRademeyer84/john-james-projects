import { addMoney, compareMoney, formatMoney2, parseMoney, percentOf } from "./money.mjs"
import { COMP_PLAN_VERSION, entitlementForRank, getStandardSchedule } from "./rankEngine.mjs"

export { COMP_PLAN_VERSION }

/**
 * Corporate Differential Gap Cover.
 * highest_paid starts at 0. Walk seller then upline.
 * Unclaimed remainder stays with Ubuntu Afrique and is not redistributed.
 */
export function processGapCover({ commissionableValue, members, scheduleId = "STANDARD_25" }) {
  const schedule = getStandardSchedule()
  if (scheduleId !== schedule.id) {
    throw new Error(`Unsupported commission schedule: ${scheduleId}`)
  }
  if (!Array.isArray(members)) {
    throw new Error("Gap Cover requires a seller/upline member list")
  }

  const value = parseMoney(commissionableValue)
  if (value <= 0n) {
    throw new Error("commissionableValue must be greater than zero")
  }

  const maxEntitlement = parseMoney(schedule.maxEntitlement)
  let highestPaid = parseMoney("0")
  const payments = []

  for (const member of members) {
    if (compareMoney(highestPaid, maxEntitlement) >= 0) break
    const entitlement = parseMoney(entitlementForRank(member.rank))
    if (compareMoney(entitlement, highestPaid) <= 0) continue

    const gap = entitlement - highestPaid
    const amount = percentOf(value, formatPercentNumber(gap))
    payments.push({
      recipientId: String(member.userId),
      recipientRank: String(member.rank).toUpperCase(),
      commissionType: "GAP_COMMISSION",
      previousEntitlement: formatMoney2(highestPaid),
      newEntitlement: formatMoney2(entitlement),
      gapPercentage: formatMoney2(gap),
      amount: formatMoney2(amount),
      compPlanVersion: COMP_PLAN_VERSION,
    })
    highestPaid = entitlement
  }

  const unclaimedPercent = maxEntitlement - highestPaid
  const unclaimedAmount = percentOf(value, formatPercentNumber(unclaimedPercent))
  const totalPaid = payments.reduce((sum, row) => addMoney(sum, parseMoney(row.amount)), 0n)

  return {
    scheduleId: schedule.id,
    compPlanVersion: COMP_PLAN_VERSION,
    commissionableValue: formatMoney2(value),
    maxEntitlement: formatMoney2(maxEntitlement),
    highestPaidEntitlement: formatMoney2(highestPaid),
    totalPaid: formatMoney2(totalPaid),
    unclaimedGapPercent: formatMoney2(unclaimedPercent),
    unclaimedGap: formatMoney2(unclaimedAmount),
    payments,
  }
}

function formatPercentNumber(scaledPercent) {
  return formatMoney2(scaledPercent)
}
