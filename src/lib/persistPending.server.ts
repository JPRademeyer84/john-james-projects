import type { SupabaseClient } from "@supabase/supabase-js"
import { pendingCardInsert, pendingFractionInsert } from "./commerceOrders.mjs"

export async function persistPendingCardOrder(ubuntu: SupabaseClient, order: Record<string, unknown>) {
  const row = pendingCardInsert(order)
  if (!Number.isInteger(row.user_id) || row.user_id <= 0) {
    throw new Error("Ubuntu user not found")
  }
  const { data: existing, error: existingError } = await ubuntu
    .from("ua_card_orders")
    .select("id, order_status")
    .eq("id", row.id)
    .maybeSingle()
  if (existingError && !String(existingError.message || "").includes("does not exist")) {
    throw new Error(existingError.message)
  }
  if (existing) {
    return { row: existing, idempotent: true }
  }
  const { error } = await ubuntu.from("ua_card_orders").insert({
    ...row,
    price_version_id: row.price_version_id ?? null,
  })
  if (error) throw new Error(error.message)
  return { row, idempotent: false }
}

export async function persistPendingFractionOrder(ubuntu: SupabaseClient, order: Record<string, unknown>) {
  const row = pendingFractionInsert(order)
  if (!Number.isInteger(row.buyer_id) || row.buyer_id <= 0) {
    throw new Error("Ubuntu user not found")
  }
  const { data: existing, error: existingError } = await ubuntu
    .from("ua_fraction_transactions")
    .select("id, transaction_status")
    .eq("id", row.id)
    .maybeSingle()
  if (existingError && !String(existingError.message || "").includes("does not exist")) {
    throw new Error(existingError.message)
  }
  if (existing) {
    return { row: existing, idempotent: true }
  }
  const { error } = await ubuntu.from("ua_fraction_transactions").insert({
    ...row,
    price_version: row.price_version ?? null,
  })
  if (error) throw new Error(error.message)
  return { row, idempotent: false }
}
