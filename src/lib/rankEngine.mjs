/** One corporate rank engine. No card/fraction/marketplace/NFT ranks. */

import { formatMoney2, parseMoney } from "./money.mjs"

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

function rankRow(rankCode) {
  const code = String(rankCode || "").toUpperCase()
  const row = STANDARD_25_RANKS.find((rank) => rank.code === code)
  if (!row) {
    throw new Error(`Unknown corporate rank: ${rankCode}`)
  }
  return row
}

function memberCount(input) {
  const members = Number(input?.teamMemberCount)
  return Number.isFinite(members) ? members : 0
}

function requirementMet(rankCode, input) {
  const requirement = RANK_REQUIREMENTS[rankCode]
  if (!requirement) return false
  if (requirement.activationConfigurable) return input?.isActive === true
  if (requirement.minTeamMembers != null && memberCount(input) < requirement.minTeamMembers) return false
  if (requirement.minTeamVolume != null) {
    if (parseMoney(input?.teamVolume ?? "0") < parseMoney(requirement.minTeamVolume)) return false
  }
  if (requirement.qualifiedLegs) {
    const legs = countQualifiedLegs(input?.directLegs, requirement.qualifiedLegs.rank)
    if (legs < requirement.qualifiedLegs.count) return false
  }
  return true
}

function missingForNext(nextRank, input) {
  const missing = { teamVolume: formatMoney2(0n), teamMembers: 0, qualifiedLegs: 0 }
  if (!nextRank) return missing
  const requirement = RANK_REQUIREMENTS[nextRank]
  if (!requirement) return missing
  if (requirement.minTeamVolume != null) {
    const have = parseMoney(input?.teamVolume ?? "0")
    const need = parseMoney(requirement.minTeamVolume)
    if (have < need) missing.teamVolume = formatMoney2(need - have)
  }
  if (requirement.minTeamMembers != null) {
    const have = memberCount(input)
    if (have < requirement.minTeamMembers) missing.teamMembers = requirement.minTeamMembers - have
  }
  if (requirement.qualifiedLegs) {
    const legs = countQualifiedLegs(Array.isArray(input?.directLegs) ? input.directLegs : [], requirement.qualifiedLegs.rank)
    if (legs < requirement.qualifiedLegs.count) missing.qualifiedLegs = requirement.qualifiedLegs.count - legs
  }
  return missing
}

/**
 * Highest corporate rank currently met. Never demotes below currentRank.
 * Entitlement and rank codes supplied on the input are ignored; RANK_REQUIREMENTS decides.
 * isActive false keeps currentRank. nextRank stays the immediate next rank.
 */
export function evaluateRankQualification(input) {
  const current = rankRow(input?.currentRank)
  const next = STANDARD_25_RANKS.find((rank) => rank.position === current.position + 1) || null
  const nextRank = next ? next.code : null
  const missing = missingForNext(nextRank, input)

  if (input?.isActive !== true) {
    return {
      currentRank: current.code,
      qualifiedRank: current.code,
      nextRank,
      promoted: false,
      missing,
    }
  }

  let qualified = current
  for (const rank of STANDARD_25_RANKS) {
    if (rank.position < current.position) continue
    if (requirementMet(rank.code, input)) qualified = rank
  }

  return {
    currentRank: current.code,
    qualifiedRank: qualified.code,
    nextRank,
    promoted: qualified.position > current.position,
    missing,
  }
}

/** Promote only when qualifiedRank is strictly above currentRank. Never demotes. */
export function applyRankPromotion(input) {
  const from = rankRow(input?.currentRank)
  const to = rankRow(input?.qualifiedRank)
  if (to.position > from.position) {
    return { from: from.code, to: to.code, promoted: true }
  }
  return { from: from.code, to: from.code, promoted: false }
}
