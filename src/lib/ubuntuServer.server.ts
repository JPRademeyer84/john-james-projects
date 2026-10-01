import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const AUREUS_PROD_REF = "fgubaqoftdeefcakejwu"

function assertUbuntuWriteTarget(url: string) {
  if (url.includes(AUREUS_PROD_REF)) {
    throw new Error(
      "Ubuntu Afrique write client is pointed at Aureus production. Refused. Use a separate Ubuntu Afrique Supabase project."
    )
  }
}

function ubuntuServerEnv() {
  const url = String(process.env.UBUNTU_SUPABASE_URL || process.env.VITE_UBUNTU_SUPABASE_URL || "")
  const key = String(
    process.env.UBUNTU_SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.VITE_UBUNTU_SUPABASE_ANON_KEY ||
      ""
  )
  return { url, key, configured: Boolean(url && key) }
}

export function getUbuntuServerClient(): SupabaseClient | null {
  const env = ubuntuServerEnv()
  if (!env.configured) return null
  assertUbuntuWriteTarget(env.url)
  return createClient(env.url, env.key, { auth: { persistSession: false } })
}

export async function loadGapCoverMembers(ubuntu: SupabaseClient, sellerId: string) {
  const numericId = Number(sellerId)
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return []
  }

  const members: Array<{ userId: string; rank: string }> = []
  const seen = new Set<number>()
  let currentId: number | null = numericId

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId)
    const { data: rankRow } = await ubuntu
      .from("ua_user_ranks")
      .select("rank_code")
      .eq("user_id", currentId)
      .maybeSingle()

    if (rankRow?.rank_code) {
      members.push({ userId: String(currentId), rank: String(rankRow.rank_code) })
    } else if (members.length === 0) {
      break
    }

    const { data: treeRow } = await ubuntu
      .from("ua_sponsor_tree")
      .select("sponsor_id")
      .eq("user_id", currentId)
      .maybeSingle()

    currentId = treeRow?.sponsor_id ? Number(treeRow.sponsor_id) : null
  }

  return members
}
export async function loadBlpMembers(ubuntu: SupabaseClient) {
  const { data: ranks, error: rankError } = await ubuntu
    .from("ua_user_ranks")
    .select("user_id, rank_code")
  if (rankError) throw new Error(rankError.message)

  const { data: volumes, error: volumeError } = await ubuntu
    .from("ua_team_volume")
    .select("user_id, monthly_team_qv")
  if (volumeError) throw new Error(volumeError.message)

  const volumeByUser = new Map(
    (volumes || []).map((row) => [String(row.user_id), String(row.monthly_team_qv || "0")])
  )
  return (ranks || []).map((row) => ({
    userId: String(row.user_id),
    rank: String(row.rank_code || ""),
    qualifiedMonthlyVolume: volumeByUser.get(String(row.user_id)) || "0",
  }))
}
export async function loadUnderlyingInventory(ubuntu: SupabaseClient) {
  const { data, error } = await ubuntu
    .from("ua_underlying_inventory")
    .select("remaining_underlying, sold_underlying")
    .eq("id", "AUREUS_100K")
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) {
    throw new Error("Ubuntu underlying inventory row is missing")
  }
  return {
    remainingUnderlying: String(data.remaining_underlying ?? "0"),
    soldUnderlying: String(data.sold_underlying ?? "0"),
  }
}