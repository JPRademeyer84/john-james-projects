import assert from "node:assert/strict"
import { test } from "node:test"
import {
  RANK_REQUIREMENTS,
  applyRankPromotion,
  evaluateRankQualification,
} from "../src/lib/rankEngine.mjs"

test("ASM: 9 members and 1000 volume does not qualify; 10 members and 1000 does", () => {
  const below = evaluateRankQualification({
    currentRank: "SSA",
    teamVolume: "1000",
    teamMemberCount: 9,
    directLegs: [],
    isActive: true,
  })
  assert.equal(below.qualifiedRank, "SSA")
  assert.equal(below.promoted, false)
  assert.equal(below.nextRank, "ASM")
  assert.equal(below.missing.teamMembers, 1)
  assert.equal(below.missing.teamVolume, "0.00")

  const met = evaluateRankQualification({
    currentRank: "SSA",
    teamVolume: "1000",
    teamMemberCount: 10,
    directLegs: [],
    isActive: true,
  })
  assert.equal(met.qualifiedRank, "ASM")
  assert.equal(met.promoted, true)
  assert.equal(met.nextRank, "ASM")
  assert.equal(met.missing.teamMembers, 0)
  assert.equal(RANK_REQUIREMENTS.ASM.minTeamMembers, 10)
  assert.equal(RANK_REQUIREMENTS.ASM.minTeamVolume, "1000")
})

test("BSM: two ASM legs and 5000 volume qualify; two ASMs under one personal leg count as one", () => {
  const qualified = evaluateRankQualification({
    currentRank: "ASM",
    teamVolume: "5000",
    teamMemberCount: 2,
    isActive: true,
    directLegs: [
      { rank: "ASM", descendants: [] },
      { rank: "ASM", descendants: [] },
    ],
  })
  assert.equal(qualified.qualifiedRank, "BSM")
  assert.equal(qualified.promoted, true)
  assert.equal(qualified.missing.qualifiedLegs, 0)

  const compressed = evaluateRankQualification({
    currentRank: "ASM",
    teamVolume: "5000",
    teamMemberCount: 2,
    isActive: true,
    directLegs: [
      { rank: "SSA", descendants: [{ rank: "ASM" }, { rank: "ASM" }] },
    ],
  })
  assert.equal(compressed.qualifiedRank, "ASM")
  assert.equal(compressed.promoted, false)
  assert.equal(compressed.missing.qualifiedLegs, 1)
  assert.equal(RANK_REQUIREMENTS.BSM.qualifiedLegs.rank, "ASM")
  assert.equal(RANK_REQUIREMENTS.BSM.qualifiedLegs.count, 2)
  assert.equal(RANK_REQUIREMENTS.BSM.minTeamVolume, "5000")
})

test("VP: two SSM legs and 100000 volume qualify", () => {
  const qualified = evaluateRankQualification({
    currentRank: "SSM",
    teamVolume: "100000",
    teamMemberCount: 2,
    isActive: true,
    directLegs: [
      { rank: "SSM", descendants: [] },
      { rank: "SSM", descendants: [] },
    ],
  })
  assert.equal(qualified.qualifiedRank, "VP")
  assert.equal(qualified.promoted, true)
  assert.equal(qualified.nextRank, "VP")
  assert.equal(RANK_REQUIREMENTS.VP.qualifiedLegs.rank, "SSM")
  assert.equal(RANK_REQUIREMENTS.VP.qualifiedLegs.count, 2)
  assert.equal(RANK_REQUIREMENTS.VP.minTeamVolume, "100000")
})

test("inactive isActive false never promotes even when volume and legs are met", () => {
  const inactive = evaluateRankQualification({
    currentRank: "SSA",
    teamVolume: "100000",
    teamMemberCount: 50,
    isActive: false,
    directLegs: [
      { rank: "SSM", descendants: [] },
      { rank: "SSM", descendants: [] },
    ],
  })
  assert.equal(inactive.qualifiedRank, "SSA")
  assert.equal(inactive.promoted, false)
  assert.equal(inactive.nextRank, "ASM")
  assert.equal(inactive.currentRank, "SSA")
})

test("applyRankPromotion never demotes VP to SSA", () => {
  const denied = applyRankPromotion({ currentRank: "VP", qualifiedRank: "SSA" })
  assert.equal(denied.promoted, false)
  assert.equal(denied.from, "VP")
  assert.equal(denied.to, "VP")
})

test("evaluate uses RANK_REQUIREMENTS, not a client-supplied entitlement", () => {
  const overridden = evaluateRankQualification({
    currentRank: "SSA",
    teamVolume: "999",
    teamMemberCount: 10,
    directLegs: [],
    isActive: true,
    entitlement: "25",
    qualifiedRank: "VP",
    rank: "VP",
    minTeamVolume: "1",
    minTeamMembers: 1,
  })
  assert.equal(overridden.qualifiedRank, "SSA")
  assert.equal(overridden.promoted, false)
  assert.equal(RANK_REQUIREMENTS.ASM.entitlement, "16")

  const met = evaluateRankQualification({
    currentRank: "SSA",
    teamVolume: RANK_REQUIREMENTS.ASM.minTeamVolume,
    teamMemberCount: RANK_REQUIREMENTS.ASM.minTeamMembers,
    directLegs: [],
    isActive: true,
    entitlement: "25",
  })
  assert.equal(met.qualifiedRank, "ASM")
  assert.notEqual(met.qualifiedRank, "VP")
})

test("unknown currentRank throws and active SSA stays at least SSA", () => {
  assert.throws(
    () => evaluateRankQualification({
      currentRank: "NFT",
      teamVolume: "0",
      teamMemberCount: 0,
      directLegs: [],
      isActive: true,
    }),
    /Unknown corporate rank/
  )
  const ssa = evaluateRankQualification({
    currentRank: "SSA",
    teamVolume: "0",
    teamMemberCount: 0,
    directLegs: [],
    isActive: true,
  })
  assert.equal(ssa.qualifiedRank, "SSA")
  assert.equal(ssa.promoted, false)
  assert.equal(ssa.nextRank, "ASM")
})
