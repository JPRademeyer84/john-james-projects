import type { SupabaseClient } from "@supabase/supabase-js"
import { pendingCardInsert, pendingFractionInsert } from "./commerceOrders.mjs"

export async function persistPendingCardOrder(ubuntu: SupabaseClient, order: Record<string, unknown>) {
  const row = pendingCardInsert(order)
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
  const { error } = await ubuntu.from("ua_card_orders").insert(row)
  if (error) throw new Error(error.message)
  return { row, idempotent: false }
}

export async function persistPendingFractionOrder(ubuntu: SupabaseClient, order: Record<string, unknown>) {
  const row = pendingFractionInsert(order)
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
  const { error } = await ubuntu.from("ua_fraction_transactions").insert(row)
  if (error) throw new Error(error.message)
  return { row, idempotent: false }
}