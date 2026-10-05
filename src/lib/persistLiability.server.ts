import type { SupabaseClient } from "@supabase/supabase-js"
import { summarizeLiability } from "./liabilityEngine.mjs"
import { formatMoney2, parseMoney } from "./money.mjs"

export async function persistLiabilityRemitted(
  ubuntu: SupabaseClient,
  input: { sourceTransactionId: string; amount: string; note?: string }
) {
  const { data: prior, error: priorError } = await ubuntu
    .from("ua_aureus_liability_ledger")
    .select("id")
    .eq("source_transaction_id", input.sourceTransactionId)
    .eq("entry_type", "FRACTION_REMITTED")
    .maybeSingle()
  if (priorError && !String(priorError.message || "").includes("does not exist")) {
    throw new Error(priorError.message)
  }
  if (prior) return { idempotent: true }

  const { error } = await ubuntu.from("ua_aureus_liability_ledger").insert({
    entry_type: "FRACTION_REMITTED",
    amount: input.amount,
    source_transaction_id: input.sourceTransactionId,
    note: input.note || "Ubuntu remittance to Aureus; reserved does not mean paid",
  })
  if (error && String(error.message || "").toLowerCase().includes("duplicate")) {
    return { idempotent: true }
  }
  if (error) throw new Error(error.message)
  return { idempotent: false }
}

export async function loadLiabilityEntries(
  ubuntu: SupabaseClient,
  sourceTransactionId?: string
) {
  let query = ubuntu
    .from("ua_aureus_liability_ledger")
    .select("entry_type, amount, source_transaction_id, note")
  if (sourceTransactionId) {
    query = query.eq("source_transaction_id", sourceTransactionId)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)
  const entries = (data || []).map((row) => ({
    entryType: String(row.entry_type),
    amount: String(row.amount),
    sourceTransactionId: row.source_transaction_id,
    note: row.note,
  }))
  return { entries, summary: summarizeLiability(entries) }
}

export async function remitPaidFractionLiability(
  ubuntu: SupabaseClient,
  sourceTransactionId: string
) {
  const id = String(sourceTransactionId || "").trim()
  if (!id) throw new Error("sourceTransactionId is required")

  async function loadEntry(entryType: string) {
    const { data, error } = await ubuntu
      .from("ua_aureus_liability_ledger")
      .select("id, amount")
      .eq("source_transaction_id", id)
      .eq("entry_type", entryType)
      .maybeSingle()
    if (error && !String(error.message || "").includes("does not exist")) {
      throw new Error(error.message)
    }
    return data
  }

  if (await loadEntry("FRACTION_SALE_REVERSAL")) {
    throw new Error("Refunded fraction sale cannot be remitted")
  }

  const sale = await loadEntry("FRACTION_SALE")
  if (!sale) {
    if (await loadEntry("FRACTION_RESERVE")) {
      throw new Error("Reserved does not mean paid; remittance requires a FRACTION_SALE")
    }
    throw new Error("Paid fraction sale is required before remittance")
  }

  const { data: order, error: orderError } = await ubuntu
    .from("ua_fraction_transactions")
    .select("id, total_amount, transaction_status")
    .eq("id", id)
    .maybeSingle()
  if (orderError) throw new Error(orderError.message)
  if (!order) throw new Error("Ubuntu fraction transaction not found")
  if (String(order.transaction_status || "") !== "PAID") {
    throw new Error("Fraction must be PAID before remittance")
  }

  const amount = formatMoney2(parseMoney(String(order.total_amount)))
  const remitted = await persistLiabilityRemitted(ubuntu, {
    sourceTransactionId: id,
    amount,
    note: "Ubuntu remittance to Aureus; reserved does not mean paid",
  })
  const loaded = await loadLiabilityEntries(ubuntu, id)
  return {
    ...remitted,
    sourceTransactionId: id,
    amount,
    reservedEqualsRemitted: false,
    saleAmount: sale.amount == null ? null : String(sale.amount),
    ...loaded,
  }
}