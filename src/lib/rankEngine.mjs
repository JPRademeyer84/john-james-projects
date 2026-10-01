/** One corporate rank engine. No card/fraction/marketplace/NFT ranks. */

export const STANDARD_25_SCHEDULE_ID = "STANDARD_25"
export const COMP_PLAN_VERSION = "GAP_COVER_V1"

export const STANDARD_25_RANKS = Object.freeze([
  { code: "SSA", title: "Shares Sales Associate", position: 1, entitlement: "10" },
  { code: "ASM", title: "Associate Sales Manager", position: 2, entitlement: "16" },
  { code: "BSM", title: "Business Sales Manager", position: 3, entitlement: "20" },
  { code: "SSM", title: "Senior Sales Manager", position: 4, entitlement: "23" },
  { code: "VP", title: "Vice President", position: 5, entitlement: "25" },
])

const ENTITLEMENT_BY_CODE = Object.fromEntries(
  STANDARD_25_RANKS.map((rank) => [rank.code, rank.entitlement])
)

export function getStandardSchedule() {
  return {
    id: STANDARD_25_SCHEDULE_ID,
    maxEntitlement: "25",
    ranks: STANDARD_25_RANKS,
  }
}

export function entitlementForRank(rankCode) {
  const code = String(rankCode || "").toUpperCase()
  const entitlement = ENTITLEMENT_BY_CODE[code]
  if (entitlement == null) {
    throw new Error(`Unknown corporate rank: ${rankCode}`)
  }
  return entitlement
}

export function rankMeetsOrExceeds(memberRank, requiredRank) {
  const member = STANDARD_25_RANKS.find((row) => row.code === String(memberRank || "").toUpperCase())
  const required = STANDARD_25_RANKS.find((row) => row.code === String(requiredRank || "").toUpperCase())
  if (!member || !required) return false
  return member.position >= required.position
}

/**
 * A qualified leg starts from a personally sponsored member.
 * Two leaders under the same personal leg count as one leg.
 */
export function countQualifiedLegs(directLegs, requiredRank) {
  if (!Array.isArray(directLegs)) {
    throw new Error("directLegs must be an array of personally sponsored legs")
  }
  let qualified = 0
  for (const leg of directLegs) {
    const members = [leg, ...(Array.isArray(leg?.descendants) ? leg.descendants : [])]
    const hit = members.some((member) => rankMeetsOrExceeds(member?.rank, requiredRank))
    if (hit) qualified += 1
  }
  return qualified
}

export const RANK_REQUIREMENTS = Object.freeze({
  SSA: { activationConfigurable: true, entitlement: "10" },
  ASM: { minTeamMembers: 10, minTeamVolume: "1000", entitlement: "16" },
  BSM: { qualifiedLegs: { rank: "ASM", count: 2 }, minTeamVolume: "5000", entitlement: "20" },
  SSM: { qualifiedLegs: { rank: "BSM", count: 2 }, minTeamVolume: "25000", entitlement: "23" },
  VP: { qualifiedLegs: { rank: "SSM", count: 2 }, minTeamVolume: "100000", entitlement: "25" },
})
