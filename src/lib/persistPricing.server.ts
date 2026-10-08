import type { SupabaseClient } from "@supabase/supabase-js"
import { formatMoney2, parseMoney } from "./money.mjs"

const PRICE_PRODUCTS = new Set(["CARD_PLASTIC", "CARD_METAL", "AUREUS_FRACTION"])

function mapPriceVersion(row) {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    retailPrice: formatMoney2(parseMoney(row.retail_price)),
    productCost: formatMoney2(parseMoney(row.product_cost)),
    commissionableValue: formatMoney2(parseMoney(row.commissionable_value)),
    qv: formatMoney2(parseMoney(row.qv)),
    gapSchedule: String(row.gap_schedule || "STANDARD_25"),
    blpRate: formatMoney2(parseMoney(row.blp_rate)),
  }
}

export async function loadCurrentPriceVersion(ubuntu: SupabaseClient, productId: string) {
  const id = String(productId || "").trim()
  if (!PRICE_PRODUCTS.has(id)) {
    throw new Error("Ubuntu product not found: " + id)
  }

  const { data: current, error: currentError } = await ubuntu
    .from("ua_product_price_versions")
    .select("id, product_id, retail_price, product_cost, commissionable_value, qv, gap_schedule, blp_rate")
    .eq("product_id", id)
    .is("end_date", null)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (currentError) throw new Error(currentError.message)
  if (current) return mapPriceVersion(current)

  const { data: product, error: productError } = await ubuntu
    .from("ua_products")
    .select("id, retail_price, cost, company_payout, commissionable_value, qv, gap_schedule, blp_percentage")
    .eq("id", id)
    .maybeSingle()
  if (productError) throw new Error(productError.message)
  if (!product) throw new Error("Ubuntu product not found: " + id)
  if (product.retail_price == null || product.cost == null || product.commissionable_value == null || product.qv == null) {
    throw new Error("Ubuntu product price is incomplete: " + id)
  }

  const { data: inserted, error: insertError } = await ubuntu
    .from("ua_product_price_versions")
    .insert({
      product_id: product.id,
      retail_price: product.retail_price,
      product_cost: product.cost,
      company_payout: product.company_payout ?? 0,
      commissionable_value: product.commissionable_value,
      qv: product.qv,
      gap_schedule: product.gap_schedule || "STANDARD_25",
      blp_rate: product.blp_percentage ?? 5,
    })
    .select("id, product_id, retail_price, product_cost, commissionable_value, qv, gap_schedule, blp_rate")
    .single()
  if (insertError) throw new Error(insertError.message)
  return mapPriceVersion(inserted)
}

export async function applyMissingOpenPriceVersions(ubuntu: SupabaseClient) {
  const { data: products, error } = await ubuntu
    .from("ua_products")
    .select("id, retail_price, cost, company_payout, commissionable_value, qv, gap_schedule, blp_percentage")
  if (error) throw new Error(error.message)

  const seeded: string[] = []
  const existing: string[] = []
  for (const product of products || []) {
    const { data: current, error: currentError } = await ubuntu
      .from("ua_product_price_versions")
      .select("id")
      .eq("product_id", product.id)
      .is("end_date", null)
      .limit(1)
      .maybeSingle()
    if (currentError) throw new Error(currentError.message)
    if (current) {
      existing.push(String(product.id))
      continue
    }
    if (product.retail_price == null || product.cost == null || product.commissionable_value == null || product.qv == null) {
      throw new Error("Ubuntu product price is incomplete: " + product.id)
    }
    const { error: insertError } = await ubuntu.from("ua_product_price_versions").insert({
      product_id: product.id,
      retail_price: product.retail_price,
      product_cost: product.cost,
      company_payout: product.company_payout ?? 0,
      commissionable_value: product.commissionable_value,
      qv: product.qv,
      gap_schedule: product.gap_schedule || "STANDARD_25",
      blp_rate: product.blp_percentage ?? 5,
    })
    if (insertError) throw new Error(insertError.message)
    seeded.push(String(product.id))
  }

  return { seeded, existing, checkoutEnabled: false as const }
}
