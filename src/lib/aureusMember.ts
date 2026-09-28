import { aureusRead, ubuntu } from "./supabase"

export type AureusMemberProfile = {
  id: number
  email: string
  username: string
  full_name: string | null
  phone: string | null
  country_of_residence: string | null
  is_admin: boolean | null
  is_active: boolean | null
  role: string | null
  created_at: string | null
}

export function isAureusAdmin(profile: AureusMemberProfile | null) {
  if (!profile) return false
  const role = String(profile.role || "").toLowerCase()
  return Boolean(profile.is_admin) || role === "admin" || role === "super_admin"
}

export async function loadAureusMemberByAuthId(authUserId: string) {
  if (!aureusRead) return null
  const { data, error } = await aureusRead
    .from("users")
    .select("id, email, username, full_name, phone, country_of_residence, is_admin, is_active, role, created_at")
    .eq("auth_user_id", authUserId)
    .maybeSingle()
  if (error) throw error
  return data as AureusMemberProfile | null
}

export async function loadAureusMemberDashboard(profile: AureusMemberProfile) {
  if (!aureusRead) {
    return { shares: 0, invested: 0, commissions: 0, pending: 0, purchases: [], commissionsRows: [] as Array<Record<string, unknown>> }
  }

  const [{ data: balances }, { data: purchases }, { data: commissions }] = await Promise.all([
    aureusRead.from("user_share_balances").select("net_shares").eq("user_id", profile.id).maybeSingle(),
    aureusRead
      .from("aureus_share_purchases")
      .select("shares_purchased, total_amount, status, created_at, payment_method")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(25),
    aureusRead
      .from("multi_level_commissions")
      .select("amount, status, created_at")
      .eq("referrer_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(25),
  ])

  const purchaseRows = purchases || []
  const commissionRows = commissions || []
  const invested = purchaseRows.reduce((sum, row) => sum + Number(row.total_amount || 0), 0)
  const earned = commissionRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const pending = commissionRows
    .filter((row) => String(row.status || "").toLowerCase() === "pending")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)

  return {
    shares: Number(balances?.net_shares || 0),
    invested,
    commissions: earned,
    pending,
    purchases: purchaseRows,
    commissionsRows: commissionRows,
  }
}

export async function loadUbuntuMemberByAuthId(authUserId: string) {
  const { data, error } = await ubuntu
    .from("ua_users")
    .select("id, username, email, pending_aureus_provision, identity_source")
    .eq("auth_user_id", authUserId)
    .maybeSingle()
  if (error) throw error
  return data
}
