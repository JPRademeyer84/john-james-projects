import type { SupabaseClient } from "@supabase/supabase-js"
import { createMarketplaceCompany } from "./marketplaceCompany.mjs"

export async function persistMarketplaceCompany(
  ubuntu: SupabaseClient,
  company: {
    id?: unknown
    name?: unknown
    settlementWallet?: unknown
    isActive?: unknown
  }
) {
  const created = createMarketplaceCompany(company)
  const { error } = await ubuntu.from("ua_marketplace_companies").upsert(
    {
      id: created.id,
      name: created.name,
      settlement_wallet: created.settlementWallet,
      is_active: created.isActive,
    },
    { onConflict: "id" }
  )
  if (error) throw new Error(error.message)
  return created
}

export async function loadMarketplaceCompanies(ubuntu: SupabaseClient) {
  const { data, error } = await ubuntu
    .from("ua_marketplace_companies")
    .select("id, name, settlement_wallet, is_active")
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    settlementWallet: String(row.settlement_wallet),
    isActive: row.is_active === true,
  }))
}
