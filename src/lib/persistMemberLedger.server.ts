import type { SupabaseClient } from "@supabase/supabase-js"
import { loadRankProgressSnapshot } from "./persistRankProgress.server"
import { rankProgress } from "./rankProgress.mjs"
import { buildMemberOverview } from "./memberLedger.mjs"

export async function resolveUbuntuMember(
  ubuntu: SupabaseClient,
  input: { authUserId?: string; email?: string; aureusUserId?: number }
) {
  const select = "id, email, username, is_active, pending_aureus_provision, aureus_user_id, auth_user_id"
  if (input.authUserId) {
    const { data, error } = await ubuntu.from("ua_users").select(select).eq("auth_user_id", input.authUserId).maybeSingle()
    if (error) throw new Error(error.message)
    if (data) return data
    const { data: byAureusAuth, error: aureusAuthError } = await ubuntu
      .from("ua_users")
      .select(select)
      .eq("aureus_auth_user_id", input.authUserId)
      .maybeSingle()
    if (aureusAuthError) throw new Error(aureusAuthError.message)
    if (byAureusAuth) return byAureusAuth
  }
  if (Number.isInteger(input.aureusUserId) && Number(input.aureusUserId) > 0) {
    const { data, error } = await ubuntu
      .from("ua_users")
      .select(select)
      .eq("aureus_user_id", input.aureusUserId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (data) return data
  }
  if (input.email) {
    const { data, error } = await ubuntu
      .from("ua_users")
      .select(select)
      .eq("email", String(input.email).toLowerCase().trim())
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (data) return data
  }
  return null
}

export async function loadMemberLedgerSnapshot(ubuntu: SupabaseClient, userId: string | number) {
  const id = Number(userId)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("userId must be an existing Ubuntu ua_users.id")
  }

  const { data: user, error: userError } = await ubuntu
    .from("ua_users")
    .select("id, email, username, is_active")
    .eq("id", id)
    .maybeSingle()
  if (userError) throw new Error(userError.message)
  if (!user) throw new Error("Ubuntu user not found")

  const [
    { data: wallet, error: walletError },
    { data: cards, error: cardError },
    { data: fractions, error: fractionError },
    { data: volume, error: volumeError },
  ] = await Promise.all([
    ubuntu.from("ua_wallet_ledger").select("entry_type, amount, status").eq("user_id", String(id)),
    ubuntu.from("ua_card_orders").select("order_status, total").eq("user_id", id),
    ubuntu.from("ua_fraction_ownership").select("quantity, underlying_share_equivalent").eq("user_id", id),
    ubuntu.from("ua_team_volume").select("personal_qv, team_qv, monthly_team_qv").eq("user_id", String(id)).maybeSingle(),
  ])
  if (walletError) throw new Error(walletError.message)
  if (cardError) throw new Error(cardError.message)
  if (fractionError) throw new Error(fractionError.message)
  if (volumeError) throw new Error(volumeError.message)

  const rankSnapshot = await loadRankProgressSnapshot(ubuntu, id)
  const progress = rankProgress(rankSnapshot)

  return buildMemberOverview({
    userId: String(user.id),
    username: user.username,
    email: user.email,
    currentRank: progress.currentRank,
    walletEntries: (wallet || []).map((row) => ({
      entryType: String(row.entry_type),
      amount: String(row.amount),
      status: String(row.status || "posted"),
    })),
    cardRows: (cards || []).map((row) => ({
      orderStatus: String(row.order_status),
      total: String(row.total),
    })),
    fractionRows: (fractions || []).map((row) => ({
      quantity: Number(row.quantity) || 0,
      underlyingShareEquivalent: String(row.underlying_share_equivalent || "0"),
    })),
    personalQv: String(volume?.personal_qv || "0"),
    teamQv: String(volume?.team_qv || "0"),
    monthlyTeamQv: String(volume?.monthly_team_qv || "0"),
    progress,
  })
}
