import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"
import {
  aureusRestMaybeSingle,
  aureusRestSelect,
  commissionAmount,
} from "./aureusAdminRest.server"
import {
  buildAureusReadMirrorRow,
  buildUbuntuMemberProvision,
  normalizeAureusEmail,
  requireAureusUserId,
  summarizeAureusLedger,
} from "./ubuntuAureusMirror.mjs"

const MEMBER_SELECT =
  "id, email, username, is_active, pending_aureus_provision, aureus_user_id, auth_user_id, aureus_auth_user_id, identity_source"

function throwIf(error: { message?: string } | null) {
  if (error) throw new Error(error.message || "Ubuntu write refused")
}

async function loadTakenUsernames(ubuntu: SupabaseClient, exceptId?: number) {
  const { data, error } = await ubuntu.from("ua_users").select("id, username")
  throwIf(error)
  return (data || [])
    .filter((row) => Number(row.id) !== Number(exceptId || 0))
    .map((row) => String(row.username || ""))
}

export async function provisionUbuntuMemberFromAureus(
  ubuntu: SupabaseClient,
  input: {
    aureusUserId: number | string
    email: string
    username?: string
    authUserId?: string | null
    isActive?: boolean
  }
) {
  const aureusUserId = requireAureusUserId(input.aureusUserId)
  const email = normalizeAureusEmail(input.email)

  const byAureus = await ubuntu
    .from("ua_users")
    .select(MEMBER_SELECT)
    .eq("aureus_user_id", aureusUserId)
    .maybeSingle()
  throwIf(byAureus.error)

  let existing = byAureus.data
  if (!existing) {
    const byEmail = await ubuntu.from("ua_users").select(MEMBER_SELECT).eq("email", email).maybeSingle()
    throwIf(byEmail.error)
    if (byEmail.data?.aureus_user_id && Number(byEmail.data.aureus_user_id) !== aureusUserId) {
      throw new Error("Ubuntu email is already linked to a different Aureus user")
    }
    existing = byEmail.data
  }

  if (existing) {
    const { data, error } = await ubuntu
      .from("ua_users")
      .update({
        email,
        aureus_user_id: aureusUserId,
        aureus_auth_user_id: input.authUserId || existing.aureus_auth_user_id || null,
        identity_source: "aureus",
        pending_aureus_provision: false,
        is_active: input.isActive !== false,
      })
      .eq("id", existing.id)
      .select(MEMBER_SELECT)
      .single()
    throwIf(error)
    return data
  }

  const provision = buildUbuntuMemberProvision({
    aureusUserId,
    email,
    username: input.username,
    authUserId: input.authUserId,
    isActive: input.isActive,
    takenUsernames: await loadTakenUsernames(ubuntu),
  })
  const { data, error } = await ubuntu
    .from("ua_users")
    .insert({
      ...provision,
      auth_user_id: randomUUID(),
    })
    .select(MEMBER_SELECT)
    .single()
  throwIf(error)
  return data
}

export async function refreshAureusReadMirror(
  ubuntu: SupabaseClient,
  input: Parameters<typeof buildAureusReadMirrorRow>[0]
) {
  const row = buildAureusReadMirrorRow(input)
  const { data, error } = await ubuntu
    .from("ua_aa_user_mirror")
    .upsert(row, { onConflict: "aureus_user_id" })
    .select("*")
    .single()
  throwIf(error)
  return data
}

export async function loadAureusReadMirror(ubuntu: SupabaseClient, aureusUserId: number | string) {
  const id = requireAureusUserId(aureusUserId)
  const { data, error } = await ubuntu.from("ua_aa_user_mirror").select("*").eq("aureus_user_id", id).maybeSingle()
  throwIf(error)
  return data
}

export async function loadAureusReadsAndRefreshMirror(
  ubuntu: SupabaseClient,
  input: { aureusUserId: number | string; email: string; username?: string; authUserId?: string | null }
) {
  const userId = requireAureusUserId(input.aureusUserId)
  const [{ data: profile }, { data: balances }, { data: purchases }, { data: commissions }] = await Promise.all([
    aureusRestMaybeSingle<Record<string, unknown>>(
      `users?id=eq.${userId}&select=id,email,username,full_name,phone,country_of_residence,is_admin,is_active,role,created_at,auth_user_id`
    ),
    aureusRestMaybeSingle<{ net_shares?: number }>(`user_share_balances?user_id=eq.${userId}&select=net_shares`),
    aureusRestSelect<Array<Record<string, unknown>>>(
      `aureus_share_purchases?user_id=eq.${userId}&select=shares_purchased,total_amount,status,created_at,payment_method&order=created_at.desc&limit=25`
    ),
    aureusRestSelect<Array<Record<string, unknown>>>(
      `multi_level_commissions?referrer_id=eq.${userId}&select=*&order=created_at.desc&limit=25`
    ),
  ])

  const member = await provisionUbuntuMemberFromAureus(ubuntu, {
    aureusUserId: userId,
    email: String(profile?.email || input.email),
    username: String(profile?.username || input.username || ""),
    authUserId: profile?.auth_user_id ? String(profile.auth_user_id) : input.authUserId || null,
    isActive: profile ? profile.is_active !== false : true,
  })

  const ledger = summarizeAureusLedger({
    purchases: purchases || [],
    commissions: commissions || [],
    netShares: balances?.net_shares,
    commissionAmount,
  })

  const mirror = await refreshAureusReadMirror(ubuntu, {
    aureusUserId: userId,
    ubuntuUserId: member.id,
    email: String(profile?.email || input.email),
    username: String(profile?.username || member.username || ""),
    fullName: profile?.full_name,
    phone: profile?.phone,
    country: profile?.country_of_residence,
    isAdmin: profile?.is_admin === true,
    isActive: profile ? profile.is_active !== false : true,
    role: profile?.role,
    authUserId: profile?.auth_user_id,
    ...ledger,
  })

  return { member, profile, ledger, mirror, purchases: purchases || [], commissions: commissions || [] }
}
