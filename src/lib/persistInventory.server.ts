import type { SupabaseClient } from "@supabase/supabase-js"
import { consumeUnderlyingInventory } from "./fractionEngine.mjs"

export async function persistFractionInventory(
  ubuntu: SupabaseClient,
  input: { sourceTransactionId: string; underlyingShareEquivalent: string }
) {
  const { data: prior, error: priorError } = await ubuntu
    .from("ua_aureus_liability_ledger")
    .select("id")
    .eq("source_transaction_id", input.sourceTransactionId)
    .eq("entry_type", "FRACTION_SALE")
    .maybeSingle()
  if (priorError && !String(priorError.message || "").includes("does not exist")) {
    throw new Error(priorError.message)
  }
  if (prior) {
    return { idempotent: true }
  }

  const { data: inventory, error: inventoryError } = await ubuntu
    .from("ua_underlying_inventory")
    .select("remaining_underlying, sold_underlying")
    .eq("id", "AUREUS_100K")
    .maybeSingle()
  if (inventoryError) throw new Error(inventoryError.message)
  if (!inventory) {
    throw new Error("Ubuntu underlying inventory row is missing")
  }

  const next = consumeUnderlyingInventory({
    remainingUnderlying: String(inventory.remaining_underlying || "0"),
    soldUnderlying: String(inventory.sold_underlying || "0"),
    underlyingShareEquivalent: input.underlyingShareEquivalent,
  })

  const { error: saleError } = await ubuntu.from("ua_aureus_liability_ledger").insert({
    entry_type: "FRACTION_SALE",
    amount: next.underlyingShareEquivalent,
    source_transaction_id: input.sourceTransactionId,
    note: "Ubuntu fraction confirm inventory consume",
  })
  if (saleError && String(saleError.message || "").includes("duplicate")) {
    return { idempotent: true }
  }
  if (saleError) throw new Error(saleError.message)

  const { data: updated, error: updateError } = await ubuntu
    .from("ua_underlying_inventory")
    .update({
      remaining_underlying: next.remainingUnderlying,
      sold_underlying: next.soldUnderlying,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "AUREUS_100K")
    .eq("remaining_underlying", inventory.remaining_underlying)
    .select("id")
  if (updateError) throw new Error(updateError.message)
  if (!updated || updated.length === 0) {
    await ubuntu
      .from("ua_aureus_liability_ledger")
      .delete()
      .eq("source_transaction_id", input.sourceTransactionId)
      .eq("entry_type", "FRACTION_SALE")
    throw new Error("Purchase exceeds remaining underlying share inventory")
  }

  return { idempotent: false, inventory: next }
}