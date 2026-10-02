import assert from "node:assert/strict"
import { test } from "node:test"
import { blpContribution, distributeBlpPeriod, isBlpQualified } from "../src/lib/blpEngine.mjs"
import { resetMonthlyTeamQv } from "../src/lib/volumeEngine.mjs"

test("BLP contribution on $100 is 5.00 split 1.50/1.50/1.00/1.00", () => {
  const row = blpContribution("100.00")
  assert.equal(row.blpTotal, "5.00")
  assert.equal(row.pools.ASM, "1.50")
  assert.equal(row.pools.BSM, "1.50")
  assert.equal(row.pools.SSM, "1.00")
  assert.equal(row.pools.VP, "1.00")
})

test("monthly qualification: ASM 300, BSM 1500, SSM 7500, VP 30000", () => {
  assert.equal(isBlpQualified("ASM", "299.99"), false)
  assert.equal(isBlpQualified("ASM", "300.00"), true)
  assert.equal(isBlpQualified("BSM", "1499.99"), false)
  assert.equal(isBlpQualified("VP", "30000.00"), true)
  assert.equal(isBlpQualified("SSA", "1000.00"), false)
})

test("ASM pool splits by volume x weight; empty ranks stay unclaimed with Ubuntu Afrique", () => {
  const result = distributeBlpPeriod({
    periodId: "2026-10",
    commissionableSales: "100.00",
    members: [
      { userId: "a1", rank: "ASM", qualifiedMonthlyVolume: "300.00" },
      { userId: "a2", rank: "ASM", qualifiedMonthlyVolume: "600.00" },
    ],
  })
  assert.equal(result.blpTotal, "5.00")
  assert.equal(result.payouts.length, 2)
  assert.equal(result.payouts[0].amount, "0.50")
  assert.equal(result.payouts[1].amount, "1.00")
  assert.equal(result.totalPaid, "1.50")
  assert.equal(result.unclaimed.BSM, "1.50")
  assert.equal(result.unclaimed.SSM, "1.00")
  assert.equal(result.unclaimed.VP, "1.00")
  assert.equal(result.unclaimedTotal, "3.50")
})

test("inactive Ubuntu members do not receive BLP payout; their pool share stays unclaimed", () => {
  const result = distributeBlpPeriod({
    periodId: "2026-10",
    commissionableSales: "100.00",
    members: [
      { userId: "a1", rank: "ASM", qualifiedMonthlyVolume: "300.00", isActive: false },
      { userId: "a2", rank: "ASM", qualifiedMonthlyVolume: "600.00", isActive: true },
    ],
  })
  assert.equal(result.payouts.length, 1)
  assert.equal(result.payouts[0].userId, "a2")
  assert.equal(result.payouts[0].amount, "1.50")
  assert.equal(result.unclaimed.ASM, "0.00")
  const onlyInactive = distributeBlpPeriod({
    periodId: "2026-10",
    commissionableSales: "100.00",
    members: [{ userId: "a1", rank: "ASM", qualifiedMonthlyVolume: "300.00", isActive: false }],
  })
  assert.equal(onlyInactive.payouts.length, 0)
  assert.equal(onlyInactive.unclaimed.ASM, "1.50")
  assert.equal(onlyInactive.unclaimedTotal, "5.00")
})

test("after BLP close, monthly team QV resets so last month cannot qualify next month", () => {
  const closed = resetMonthlyTeamQv([
    { userId: "a1", rank: "ASM", qualifiedMonthlyVolume: "600.00" },
    { userId: "v1", rank: "VP", qualifiedMonthlyVolume: "30000.00" },
  ])
  assert.equal(closed[0].qualifiedMonthlyVolume, "0.00")
  assert.equal(closed[1].qualifiedMonthlyVolume, "0.00")
  assert.equal(isBlpQualified("ASM", closed[0].qualifiedMonthlyVolume), false)
  assert.equal(isBlpQualified("VP", closed[1].qualifiedMonthlyVolume), false)
  const nextMonth = distributeBlpPeriod({
    periodId: "2026-11",
    commissionableSales: "100.00",
    members: closed,
  })
  assert.equal(nextMonth.totalPaid, "0.00")
  assert.equal(nextMonth.unclaimedTotal, "5.00")
})