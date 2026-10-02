import type { SupabaseClient } from "@supabase/supabase-js"

export type FinanceSummary = {
  gapCommission: { count: number; amountSum: string }
  walletLedger: { count: number }
  blpPeriods: Array<{
    id: string
    status: string
    commissionableSales: string
    blpTotal: string
  }>
  cardOrdersByStatus: Record<string, number>
  fractionTransactionsByStatus: Record<string, number>
  remainingUnderlying: string
  userRankCount: number
}

function emptySummary(): FinanceSummary {
  return {
    gapCommission: { count: 0, amountSum: "0" },
    walletLedger: { count: 0 },
    blpPeriods: [],
    cardOrdersByStatus: {},
    fractionTransactionsByStatus: {},
    remainingUnderlying: "0",
    userRankCount: 0,
  }
}

function isMissingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const message = String(error.message || "").toLowerCase()
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    message.includes("does not exist") ||
    message.includes("could not find the table") ||
    message.includes("schema cache")
  )
}

function sumAmountRows(rows: Array<{ amount?: unknown }> | null): string {
  let total = 0
  for (const row of rows || []) {
    const value = Number(row.amount ?? 0)
    if (Number.isFinite(value)) total += value
  }
  return String(total)
}

function countByField<T extends string>(
  rows: Array<Record<string, unknown>> | null,
  field: T,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of rows || []) {
    const key = String(row[field] ?? "UNKNOWN")
    out[key] = (out[key] || 0) + 1
  }
  return out
}

async function loadGapCommission(ubuntu: SupabaseClient) {
  const { count, error: countError } = await ubuntu
    .from("ua_commission_transactions")
    .select("*", { count: "exact", head: true })
  if (isMissingRelation(countError)) return { count: 0, amountSum: "0" }
  if (countError) throw countError

  const { data: aggregateRows, error: aggregateError } = await ubuntu
    .from("ua_commission_transactions")
    .select("amount.sum()")
  if (!aggregateError && aggregateRows?.length) {
    const raw = aggregateRows[0] as { sum?: unknown; amount?: unknown }
    const sumValue = raw.sum ?? raw.amount
    if (sumValue != null && String(sumValue).trim() !== "") {
      return { count: count ?? 0, amountSum: String(sumValue) }
    }
  }

  if (aggregateError && !isMissingRelation(aggregateError)) {
    const { data: amountRows, error: amountError } = await ubuntu
      .from("ua_commission_transactions")
      .select("amount")
    if (isMissingRelation(amountError)) return { count: count ?? 0, amountSum: "0" }
    if (amountError) throw amountError
    return { count: count ?? 0, amountSum: sumAmountRows(amountRows) }
  }

  return { count: count ?? 0, amountSum: "0" }
}

async function loadWalletLedgerCount(ubuntu: SupabaseClient) {
  const { count, error } = await ubuntu
    .from("ua_wallet_ledger")
    .select("*", { count: "exact", head: true })
  if (isMissingRelation(error)) return 0
  if (error) throw error
  return count ?? 0
}

async function loadBlpPeriods(ubuntu: SupabaseClient) {
  const { data, error } = await ubuntu
    .from("ua_blp_periods")
    .select("id, status, commissionable_sales, blp_total")
    .order("id", { ascending: false })
    .limit(24)
  if (isMissingRelation(error)) return []
  if (error) throw error
  return (data || []).map((row) => ({
    id: String(row.id),
    status: String(row.status ?? ""),
    commissionableSales: String(row.commissionable_sales ?? "0"),
    blpTotal: String(row.blp_total ?? "0"),
  }))
}

async function loadCardOrderCounts(ubuntu: SupabaseClient) {
  const { data, error } = await ubuntu.from("ua_card_orders").select("order_status")
  if (isMissingRelation(error)) return {}
  if (error) throw error
  return countByField(data, "order_status")
}

async function loadFractionCounts(ubuntu: SupabaseClient) {
  const { data, error } = await ubuntu.from("ua_fraction_transactions").select("transaction_status")
  if (isMissingRelation(error)) return {}
  if (error) throw error
  return countByField(data, "transaction_status")
}

async function loadRemainingUnderlying(ubuntu: SupabaseClient) {
  const { data, error } = await ubuntu
    .from("ua_underlying_inventory")
    .select("remaining_underlying")
    .eq("id", "AUREUS_100K")
    .maybeSingle()
  if (isMissingRelation(error)) return "0"
  if (error) throw error
  if (!data) return "0"
  return String(data.remaining_underlying ?? "0")
}

async function loadUserRankCount(ubuntu: SupabaseClient) {
  const { count, error } = await ubuntu
    .from("ua_user_ranks")
    .select("*", { count: "exact", head: true })
  if (isMissingRelation(error)) return 0
  if (error) throw error
  return count ?? 0
}

export async function loadFinanceSummary(ubuntu: SupabaseClient): Promise<FinanceSummary> {
  const summary = emptySummary()

  try {
    summary.gapCommission = await loadGapCommission(ubuntu)
  } catch {
    summary.gapCommission = { count: 0, amountSum: "0" }
  }

  try {
    summary.walletLedger.count = await loadWalletLedgerCount(ubuntu)
  } catch {
    summary.walletLedger.count = 0
  }

  try {
    summary.blpPeriods = await loadBlpPeriods(ubuntu)
  } catch {
    summary.blpPeriods = []
  }

  try {
    summary.cardOrdersByStatus = await loadCardOrderCounts(ubuntu)
  } catch {
    summary.cardOrdersByStatus = {}
  }

  try {
    summary.fractionTransactionsByStatus = await loadFractionCounts(ubuntu)
  } catch {
    summary.fractionTransactionsByStatus = {}
  }

  try {
    summary.remainingUnderlying = await loadRemainingUnderlying(ubuntu)
  } catch {
    summary.remainingUnderlying = "0"
  }

  try {
    summary.userRankCount = await loadUserRankCount(ubuntu)
  } catch {
    summary.userRankCount = 0
  }

  return summary
}
