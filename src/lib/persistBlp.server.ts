import type { SupabaseClient } from "@supabase/supabase-js"

export async function persistBlpPeriod(
  ubuntu: SupabaseClient,
  result: {
    periodId: string
    startsAt: string
    endsAt: string
    commissionableSales: string
    blpTotal: string
    unclaimedTotal: string
    payouts: Array<{
      userId: string
      rank: string
      qualifiedMonthlyVolume: string
      weight: number
      points: string
      amount: string
    }>
  }
) {
  const { data: existing, error: existingError } = await ubuntu
    .from("ua_blp_periods")
    .select("id, status")
    .eq("id", result.periodId)
    .maybeSingle()
  if (existingError && !String(existingError.message || "").includes("does not exist")) {
    throw new Error(existingError.message)
  }
  if (existing && String(existing.status || "") === "CLOSED") {
    return { idempotent: true }
  }

  const { error: periodError } = await ubuntu.from("ua_blp_periods").upsert({
    id: result.periodId,
    starts_at: result.startsAt,
    ends_at: result.endsAt,
    commissionable_sales: result.commissionableSales,
    blp_total: result.blpTotal,
    status: "OPEN",
  })
  if (periodError) throw new Error(periodError.message)

  for (const payout of result.payouts) {
    const { error: blpError } = await ubuntu.from("ua_blp_transactions").insert({
      period_id: result.periodId,
      user_id: payout.userId,
      rank_code: payout.rank,
      qualified_monthly_volume: payout.qualifiedMonthlyVolume,
      weight: payout.weight,
      points: payout.points,
      amount: payout.amount,
      status: "posted",
    })
    if (blpError && !String(blpError.message || "").includes("duplicate")) {
      throw new Error(blpError.message)
    }

    const { error: walletError } = await ubuntu.from("ua_wallet_ledger").insert({
      user_id: payout.userId,
      entry_type: "BLP",
      amount: payout.amount,
      source_transaction_id: "BLP:" + result.periodId,
      status: "posted",
    })
    if (walletError && !String(walletError.message || "").includes("duplicate")) {
      throw new Error(walletError.message)
    }
  }

  const { error: resetError } = await ubuntu
    .from("ua_team_volume")
    .update({
      monthly_team_qv: "0.00",
      updated_at: new Date().toISOString(),
    })
    .gt("monthly_team_qv", 0)
  if (resetError) throw new Error(resetError.message)

  const { error: closeError } = await ubuntu
    .from("ua_blp_periods")
    .update({ status: "CLOSED" })
    .eq("id", result.periodId)
  if (closeError) throw new Error(closeError.message)

  return { idempotent: false, unclaimedTotal: result.unclaimedTotal, monthlyVolumeReset: true }
}