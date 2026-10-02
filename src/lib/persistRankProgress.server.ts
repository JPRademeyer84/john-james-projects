import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * READ ONLY Ubuntu snapshot for rank-progress.
 * teamMemberCount is the count of ua_sponsor_tree rows where sponsor_id = userId
 * (direct legs only; downline depth is not walked).
 * Never writes. Never touches Aureus.
 */
export async function loadRankProgressSnapshot(ubuntu: SupabaseClient, userId: string | number) {
  const id = Number(userId)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("userId must be an existing Ubuntu ua_users.id")
  }

  const { data: user, error: userError } = await ubuntu
    .from("ua_users")
    .select("id, is_active")
    .eq("id", id)
    .maybeSingle()
  if (userError) throw new Error(userError.message)
  if (!user) {
    throw new Error("Ubuntu user not found")
  }

  const { data: rankRow, error: rankError } = await ubuntu
    .from("ua_user_ranks")
    .select("rank_code")
    .eq("user_id", id)
    .maybeSingle()
  if (rankError) throw new Error(rankError.message)

  const { data: volumeRow, error: volumeError } = await ubuntu
    .from("ua_team_volume")
    .select("team_qv")
    .eq("user_id", String(id))
    .maybeSingle()
  if (volumeError) throw new Error(volumeError.message)

  const { data: legs, error: legsError } = await ubuntu
    .from("ua_sponsor_tree")
    .select("user_id")
    .eq("sponsor_id", id)
  if (legsError) throw new Error(legsError.message)

  const directLegs: Array<{ userId: string; rank: string }> = []
  for (const row of legs || []) {
    const childId = Number(row.user_id)
    const { data: childRank, error: childRankError } = await ubuntu
      .from("ua_user_ranks")
      .select("rank_code")
      .eq("user_id", childId)
      .maybeSingle()
    if (childRankError) throw new Error(childRankError.message)
    directLegs.push({
      userId: String(childId),
      rank: String(childRank?.rank_code || ""),
    })
  }

  return {
    userId: String(user.id),
    isActive: user.is_active === true,
    currentRank: String(rankRow?.rank_code || "SSA"),
    teamVolume: String(volumeRow?.team_qv || "0"),
    teamMemberCount: (legs || []).length,
    directLegs,
  }
}
