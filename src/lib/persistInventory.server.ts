import type { SupabaseClient } from "@supabase/supabase-js"
import { consumeUnderlyingInventory, convertReserveToSale, reserveUnderlyingInventory } from "./fractionEngine.mjs"
import { compareMoney, parseMoney } from "./money.mjs"

const INVENTORY_ID = "AUREUS_100K"

function isDuplicate(error: { message?: string; code?: string } | null) {
  if (!error) return false
  if (error.code === "23505") return true
  return String(error.message || "").toLowerCase().includes("duplicate")
}

async function findLedgerEntry(
  ubuntu: SupabaseClient,
  sourceTransactionId: string,
  entryType: "FRACTION_RESERVE" | "FRACTION_SALE"
) {
  const { data, error } = await ubuntu
    .from("ua_aureus_liability_ledger")
    .select("id, amount")
    .eq("source_transaction_id", sourceTransactionId)
    .eq("entry_type", entryType)
    .maybeSingle()
  if (error && !String(error.message || "").includes("does not exist")) {
    throw new Error(error.message)
  }
  return data
}

async function loadInventoryRow(ubuntu: SupabaseClient) {
  const { data: inventory, error } = await ubuntu
    .from("ua_underlying_inventory")
    .select("remaining_underlying, sold_underlying")
    .eq("id", INVENTORY_ID)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!inventory) {
    throw new Error("Ubuntu underlying inventory row is missing")
  }
  return inventory
}

async function insertLedger(
  ubuntu: SupabaseClient,
  entryType: "FRACTION_RESERVE" | "FRACTION_SALE",
  amount: string,
  sourceTransactionId: string,
  note: string
) {
  const { error } = await ubuntu.from("ua_aureus_liability_ledger").insert({
    entry_type: entryType,
    amount,
    source_transaction_id: sourceTransactionId,
    note,
  })
  if (isDuplicate(error)) return { duplicate: true }
  if (error) throw new Error(error.message)
  return { duplicate: false }
}

async function deleteLedger(
  ubuntu: SupabaseClient,
  sourceTransactionId: string,
  entryType: "FRACTION_RESERVE" | "FRACTION_SALE"
) {
  await ubuntu
    .from("ua_aureus_liability_ledger")
    .delete()
    .eq("source_transaction_id", sourceTransactionId)
    .eq("entry_type", entryType)
}

export async function persistFractionReserve(
  ubuntu: SupabaseClient,
  input: { sourceTransactionId: string; underlyingShareEquivalent: string }
) {
  const prior = await findLedgerEntry(ubuntu, input.sourceTransactionId, "FRACTION_RESERVE")
  if (prior) return { idempotent: true }
  const sale = await findLedgerEntry(ubuntu, input.sourceTransactionId, "FRACTION_SALE")
  if (sale) return { idempotent: true }

  const inventory = await loadInventoryRow(ubuntu)
  const next = reserveUnderlyingInventory({
    remainingUnderlying: String(inventory.remaining_underlying || "0"),
    reservedUnderlying: "0",
    underlyingShareEquivalent: input.underlyingShareEquivalent,
  })

  const inserted = await insertLedger(
    ubuntu,
    "FRACTION_RESERVE",
    next.underlyingShareEquivalent,
    input.sourceTransactionId,
    "Ubuntu fraction reserve; not remitted"
  )
  if (inserted.duplicate) return { idempotent: true }

  const { data: updated, error: updateError } = await ubuntu
    .from("ua_underlying_inventory")
    .update({
      remaining_underlying: next.remainingUnderlying,
      updated_at: new Date().toISOString(),
    })
    .eq("id", INVENTORY_ID)
    .eq("remaining_underlying", inventory.remaining_underlying)
    .select("id")
  if (updateError) throw new Error(updateError.message)
  if (!updated || updated.length === 0) {
    await deleteLedger(ubuntu, input.sourceTransactionId, "FRACTION_RESERVE")
    throw new Error("Purchase exceeds remaining underlying share inventory")
  }

  return { idempotent: false, inventory: next }
}

export async function persistFractionInventory(
  ubuntu: SupabaseClient,
  input: { sourceTransactionId: string; underlyingShareEquivalent: string }
) {
  const sale = await findLedgerEntry(ubuntu, input.sourceTransactionId, "FRACTION_SALE")
  if (sale) return { idempotent: true }

  const inventory = await loadInventoryRow(ubuntu)
  const reserve = await findLedgerEntry(ubuntu, input.sourceTransactionId, "FRACTION_RESERVE")

  if (reserve) {
    if (reserve.amount == null) {
      throw new Error("Fraction reserve amount is missing")
    }
    const reservedAmount = String(reserve.amount)
    if (compareMoney(parseMoney(input.underlyingShareEquivalent), parseMoney(reservedAmount)) !== 0) {
      throw new Error("Fraction sale amount does not match the Ubuntu reserve")
    }
    const next = convertReserveToSale({
      remainingUnderlying: String(inventory.remaining_underlying || "0"),
      reservedUnderlying: reservedAmount,
      soldUnderlying: String(inventory.sold_underlying || "0"),
      underlyingShareEquivalent: input.underlyingShareEquivalent,
    })
    const inserted = await insertLedger(
      ubuntu,
      "FRACTION_SALE",
      next.underlyingShareEquivalent,
      input.sourceTransactionId,
      "Ubuntu fraction confirm inventory consume"
    )
    if (inserted.duplicate) return { idempotent: true }

    const { data: updated, error: updateError } = await ubuntu
      .from("ua_underlying_inventory")
      .update({
        sold_underlying: next.soldUnderlying,
        updated_at: new Date().toISOString(),
      })
      .eq("id", INVENTORY_ID)
      .eq("sold_underlying", inventory.sold_underlying)
      .select("id")
    if (updateError) throw new Error(updateError.message)
    if (!updated || updated.length === 0) {
      await deleteLedger(ubuntu, input.sourceTransactionId, "FRACTION_SALE")
      throw new Error("Underlying sold balance changed during confirm")
    }
    return { idempotent: false, inventory: next }
  }

  const next = consumeUnderlyingInventory({
    remainingUnderlying: String(inventory.remaining_underlying || "0"),
    soldUnderlying: String(inventory.sold_underlying || "0"),
    underlyingShareEquivalent: input.underlyingShareEquivalent,
  })

  const inserted = await insertLedger(
    ubuntu,
    "FRACTION_SALE",
    next.underlyingShareEquivalent,
    input.sourceTransactionId,
    "Ubuntu fraction confirm inventory consume"
  )
  if (inserted.duplicate) return { idempotent: true }

  const { data: updated, error: updateError } = await ubuntu
    .from("ua_underlying_inventory")
    .update({
      remaining_underlying: next.remainingUnderlying,
      sold_underlying: next.soldUnderlying,
      updated_at: new Date().toISOString(),
    })
    .eq("id", INVENTORY_ID)
    .eq("remaining_underlying", inventory.remaining_underlying)
    .select("id")
  if (updateError) throw new Error(updateError.message)
  if (!updated || updated.length === 0) {
    await deleteLedger(ubuntu, input.sourceTransactionId, "FRACTION_SALE")
    throw new Error("Purchase exceeds remaining underlying share inventory")
  }

  return { idempotent: false, inventory: next }
}
