import type { SupabaseClient } from "@supabase/supabase-js"
import { summarizeLiability } from "./liabilityEngine.mjs"

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