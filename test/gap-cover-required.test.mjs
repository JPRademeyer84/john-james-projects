import assert from "node:assert/strict"
import { test } from "node:test"
import { processGapCover } from "../src/lib/gapCover.mjs"
import { countQualifiedLegs, entitlementForRank } from "../src/lib/rankEngine.mjs"

test("130 full chain $100: SSA 10 + ASM 6 + BSM 4 + SSM 3 + VP 2 = 25", () => {
  const result = processGapCover({
    commissionableValue: "100.00",
    scheduleId: "STANDARD_25",
    members: [
      { userId: "ssa", rank: "SSA" },
      { userId: "asm", rank: "ASM" },
      { userId: "bsm", rank: "BSM" },
      { userId: "ssm", rank: "SSM" },
      { userId: "vp", rank: "VP" },
    ],
  })

  assert.equal(result.payments[0].amount, "10.00")
  assert.equal(result.payments[1].amount, "6.00")
  assert.equal(result.payments[2].amount, "4.00")
  assert.equal(result.payments[3].amount, "3.00")
  assert.equal(result.payments[4].amount, "2.00")
  assert.equal(result.totalPaid, "25.00")
  assert.equal(result.unclaimedGap, "0.00")
  assert.equal(result.compPlanVersion, "GAP_COVER_V1")
})

test("131 compression SSA → BSM → VP on $100: 10 + 10 + 5 = 25", () => {
  const result = processGapCover({
    commissionableValue: "100.00",
    members: [
      { userId: "ssa", rank: "SSA" },
      { userId: "bsm", rank: "BSM" },
      { userId: "vp", rank: "VP" },
    ],
  })

  assert.equal(result.payments[0].amount, "10.00")
  assert.equal(result.payments[1].amount, "10.00")
  assert.equal(result.payments[2].amount, "5.00")
  assert.equal(result.totalPaid, "25.00")
  assert.equal(result.unclaimedGap, "0.00")
})

test("132 unclaimed gap ends at ASM on $100: paid 16, Ubuntu Afrique retains 9", () => {
  const result = processGapCover({
    commissionableValue: "100.00",
    members: [
      { userId: "ssa", rank: "SSA" },
      { userId: "asm", rank: "ASM" },
    ],
  })

  assert.equal(result.payments[0].amount, "10.00")
  assert.equal(result.payments[1].amount, "6.00")
  assert.equal(result.totalPaid, "16.00")
  assert.equal(result.unclaimedGap, "9.00")
  assert.equal(result.unclaimedGapPercent, "9.00")
})

test("independent legs: two ASMs under one personal leg count as one", () => {
  const incorrect = countQualifiedLegs(
    [
      {
        userId: "direct-a",
        rank: "SSA",
        descendants: [
          { userId: "asm-1", rank: "ASM" },
          { userId: "asm-2", rank: "ASM" },
        ],
      },
    ],
    "ASM"
  )
  assert.equal(incorrect, 1)

  const correct = countQualifiedLegs(
    [
      { userId: "direct-a", rank: "SSA", descendants: [{ userId: "asm-1", rank: "ASM" }] },
      { userId: "direct-b", rank: "SSA", descendants: [{ userId: "asm-2", rank: "ASM" }] },
    ],
    "ASM"
  )
  assert.equal(correct, 2)
})

test("standard entitlements match the matrix", () => {
  assert.equal(entitlementForRank("SSA"), "10")
  assert.equal(entitlementForRank("ASM"), "16")
  assert.equal(entitlementForRank("BSM"), "20")
  assert.equal(entitlementForRank("SSM"), "23")
  assert.equal(entitlementForRank("VP"), "25")
})
