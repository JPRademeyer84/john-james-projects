import { addMoney, formatMoney2, parseMoney, percentOf } from "./money.mjs"

export const BLP_TOTAL_PERCENT = "5"
export const BLP_POOLS = Object.freeze({
  ASM: { percent: "1.5", weight: 1, monthlyVolume: "300.00" },
  BSM: { percent: "1.5", weight: 2, monthlyVolume: "1500.00" },
  SSM: { percent: "1", weight: 3, monthlyVolume: "7500.00" },
  VP: { percent: "1", weight: 5, monthlyVolume: "30000.00" },
})

export function blpContribution(commissionableValue) {
  const value = parseMoney(commissionableValue)
  return {
    commissionableValue: formatMoney2(value),
    blpTotal: formatMoney2(percentOf(value, BLP_TOTAL_PERCENT)),
    pools: Object.fromEntries(
      Object.entries(BLP_POOLS).map(([rank, spec]) => [rank, formatMoney2(percentOf(value, spec.percent))])
    ),
  }
}

export function isBlpQualified(rank, qualifiedMonthlyVolume) {
  const spec = BLP_POOLS[String(rank || "").toUpperCase()]
  if (!spec) return false
  return parseMoney(qualifiedMonthlyVolume) >= parseMoney(spec.monthlyVolume)
}

export function distributeBlpPeriod({
  periodId,
  commissionableSales,
  members,
}) {
  const sales = parseMoney(commissionableSales)
  if (sales < 0n) {
    throw new Error("commissionableSales cannot be negative")
  }
  if (!Array.isArray(members)) {
    throw new Error("members must be an array")
  }

  const contribution = blpContribution(formatMoney2(sales))
  const payouts = []
  const unclaimed = {}

  for (const [rank, spec] of Object.entries(BLP_POOLS)) {
    const poolAmount = parseMoney(contribution.pools[rank])
    const eligible = members.filter((member) => {
      return String(member.rank || "").toUpperCase() === rank && isBlpQualified(rank, member.qualifiedMonthlyVolume)
    })

    if (eligible.length === 0 || poolAmount === 0n) {
      unclaimed[rank] = formatMoney2(poolAmount)
      continue
    }

    const points = eligible.map((member) => {
      const volume = parseMoney(member.qualifiedMonthlyVolume)
      return { member, points: volume * BigInt(spec.weight) }
    })
    const totalPoints = points.reduce((sum, row) => sum + row.points, 0n)
    let paid = 0n

    points.forEach((row, index) => {
      let amount
      if (index === points.length - 1) {
        amount = poolAmount - paid
      } else {
        amount = (poolAmount * row.points) / totalPoints
        paid += amount
      }
      payouts.push({
        periodId: String(periodId),
        userId: String(row.member.userId),
        rank,
        qualifiedMonthlyVolume: formatMoney2(parseMoney(row.member.qualifiedMonthlyVolume)),
        weight: spec.weight,
        points: row.points.toString(),
        amount: formatMoney2(amount),
        entryType: "BLP",
      })
    })
    unclaimed[rank] = "0.00"
  }

  const totalPaid = payouts.reduce((sum, row) => addMoney(sum, parseMoney(row.amount)), 0n)
  const unclaimedTotal = Object.values(unclaimed).reduce((sum, value) => addMoney(sum, parseMoney(value)), 0n)

  return {
    periodId: String(periodId),
    commissionableSales: formatMoney2(sales),
    blpTotal: contribution.blpTotal,
    pools: contribution.pools,
    payouts,
    unclaimed,
    totalPaid: formatMoney2(totalPaid),
    unclaimedTotal: formatMoney2(unclaimedTotal),
  }
}