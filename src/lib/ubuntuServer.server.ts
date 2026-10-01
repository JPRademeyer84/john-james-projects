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
