/** Rank promotion progress. Uses next-rank requirements only. Checkout stays closed. */

import {
  STANDARD_25_RANKS,
  RANK_REQUIREMENTS,
  countQualifiedLegs,
  entitlementForRank,
} from "./rankEngine.mjs"
import { compareMoney, formatMoney2, parseMoney } from "./money.mjs"

function nextRankAbove(currentRank) {
  const code = String(currentRank || "").toUpperCase()
  const current = STANDARD_25_RANKS.find((row) => row.code === code)
  if (!current) {
    throw new Error(`Unknown corporate rank: ${currentRank}`)
  }
  const next = STANDARD_25_RANKS.find((row) => row.position === current.position + 1)
  return next ? next.code : null
}

function promotionMet(active, canPromote, qualified) {
  return active === true && canPromote === true && qualified === true
}

/**
 * Progress toward the next corporate rank only.
 * Entitlement is always taken from STANDARD_25; a client entitlement field is ignored.
 */
export function rankProgress(input) {
  const currentRank = String(input?.currentRank || "").toUpperCase()
  const current = STANDARD_25_RANKS.find((row) => row.code === currentRank)
  if (!current) {
    throw new Error(`Unknown corporate rank: ${input?.currentRank}`)
  }

  const entitlement = entitlementForRank(currentRank)
  const nextRank = nextRankAbove(currentRank)
  const nextRequirements = nextRank ? RANK_REQUIREMENTS[nextRank] : null
  const active = input?.isActive !== false
  const canPromote = nextRank != null

  const haveVolume = formatMoney2(parseMoney(input?.teamVolume ?? "0"))
  const needVolume = nextRequirements?.minTeamVolume != null ? String(nextRequirements.minTeamVolume) : "0"
  const volumeQualified = compareMoney(parseMoney(haveVolume), parseMoney(needVolume)) >= 0

  const haveMembers = Number(input?.teamMemberCount) || 0
  const needMembers = Number(nextRequirements?.minTeamMembers) || 0
  const membersQualified = haveMembers >= needMembers

  const requiredRank = nextRequirements?.qualifiedLegs?.rank != null ? String(nextRequirements.qualifiedLegs.rank) : null
  const needLegs = Number(nextRequirements?.qualifiedLegs?.count) || 0
  const legs = Array.isArray(input?.directLegs) ? input.directLegs : []
  const haveLegs = requiredRank ? countQualifiedLegs(legs, requiredRank) : 0
  const legsQualified = haveLegs >= needLegs

  return {
    currentRank,
    entitlement,
    nextRank,
    nextRequirements,
    progress: {
      teamVolume: {
        have: haveVolume,
        need: needVolume,
        met: promotionMet(active, canPromote, volumeQualified),
      },
      teamMembers: {
        have: haveMembers,
        need: needMembers,
        met: promotionMet(active, canPromote, membersQualified),
      },
      qualifiedLegs: {
        have: haveLegs,
        need: needLegs,
        requiredRank,
        met: promotionMet(active, canPromote, legsQualified),
      },
    },
    checkoutEnabled: false,
  }
}
