import type { SupabaseClient } from "@supabase/supabase-js"
import { addMoney, formatMoney2, parseMoney, subtractMoney } from "./money.mjs"

function floorZero(scaled) {
  return formatMoney2(scaled < 0n ? 0n : scaled)
}

export async function persistCardRefund(
  ubuntu: SupabaseClient,
  refunded: {
    id: string
    productId?: string
    sponsorId?: string
    userId?: string
    reversal: {
      sourceTransactionId: string
      reversalType: string
      amount: string
      qvReversed: string
      blpReversed: string
      commissionableReversed: string
      gapReversals: Array<{
        recipientId: string
        recipientRank: string
        commissionType: string
        previousEntitlement: string
        newEntitlement: string
        gapPercentage: string
        amount: string
        compPlanVersion?: string
      }>
      reason: string
    }
    volume?: { teamUserIds?: string[]; blpAccrual?: { periodId: string } }
  }
) {
  const sourceId = String(refunded.reversal.sourceTransactionId)
  const { data: prior, error: priorError } = await ubuntu
    .from("ua_transaction_reversals")
    .select("id")
    .eq("source_transaction_id", sourceId)
    .eq("reversal_type", "CARD_REFUND")
    .maybeSingle()
  if (priorError && !String(priorError.message || "").includes("does not exist")) {
    throw new Error(priorError.message)
  }
  if (prior) {
    return { idempotent: true }
  }

  const { error: reversalError } = await ubuntu.from("ua_transaction_reversals").insert({
    source_transaction_id: sourceId,
    reversal_type: "CARD_REFUND",
    amount: refunded.reversal.amount,
    reason: refunded.reversal.reason || null,
  })
  if (reversalError && String(reversalError.message || "").toLowerCase().includes("duplicate")) {
    return { idempotent: true }
  }
  if (reversalError) throw new Error(reversalError.message)

  for (const payment of refunded.reversal.gapReversals) {
    const { error: commissionError } = await ubuntu.from("ua_commission_transactions").insert({
      source_transaction_id: sourceId,
      product_id: refunded.productId || null,
      seller_id: refunded.sponsorId || refunded.userId || null,
      recipient_user_id: payment.recipientId,
      recipient_rank: payment.recipientRank,
      commission_type: "REVERSAL",
      commissionable_value: refunded.reversal.commissionableReversed,
      previous_entitlement: payment.previousEntitlement,
      new_entitlement: payment.newEntitlement,
      gap_percentage: payment.gapPercentage,
      amount: payment.amount,
      status: "posted",
      comp_plan_version: payment.compPlanVersion || "GAP_COVER_V1",
    })
    if (commissionError && !String(commissionError.message || "").includes("duplicate")) {
      throw new Error(commissionError.message)
    }

    const { error: walletError } = await ubuntu.from("ua_wallet_ledger").insert({
      user_id: payment.recipientId,
      entry_type: "REVERSAL",
      amount: payment.amount,
      source_transaction_id: sourceId,
      status: "posted",
    })
    if (walletError && !String(walletError.message || "").includes("duplicate")) {
      throw new Error(walletError.message)
    }
  }

  const reversalSource = sourceId + ":REVERSAL"
  const { error: qvError } = await ubuntu.from("ua_qv_transactions").insert({
    user_id: String(refunded.userId || ""),
    source_transaction_id: reversalSource,
    qv: formatMoney2(-parseMoney(refunded.reversal.qvReversed || "0")),
  })
  if (qvError && !String(qvError.message || "").includes("duplicate")) {
    throw new Error(qvError.message)
  }

  const teamUserIds = refunded.volume?.teamUserIds || []
  for (const userId of teamUserIds) {
    const { data: current, error: readError } = await ubuntu
      .from("ua_team_volume")
      .select("personal_qv, team_qv, monthly_team_qv, lifetime_team_qv")
      .eq("user_id", userId)
      .maybeSingle()
    if (readError) throw new Error(readError.message)
    const qv = parseMoney(refunded.reversal.qvReversed || "0")
    const { error: volumeError } = await ubuntu.from("ua_team_volume").upsert({
      user_id: userId,
      personal_qv: floorZero(
        userId === String(refunded.userId)
          ? subtractMoney(parseMoney(current?.personal_qv || "0"), qv)
          : parseMoney(current?.personal_qv || "0")
      ),
      team_qv: floorZero(subtractMoney(parseMoney(current?.team_qv || "0"), qv)),
      monthly_team_qv: floorZero(subtractMoney(parseMoney(current?.monthly_team_qv || "0"), qv)),
      lifetime_team_qv: floorZero(subtractMoney(parseMoney(current?.lifetime_team_qv || "0"), qv)),
      updated_at: new Date().toISOString(),
    })
    if (volumeError) throw new Error(volumeError.message)
  }

  const periodId = refunded.volume?.blpAccrual?.periodId
  if (periodId) {
    const { error: contribError } = await ubuntu.from("ua_blp_contributions").insert({
      period_id: periodId,
      source_transaction_id: reversalSource,
      commissionable_value: formatMoney2(-parseMoney(refunded.reversal.commissionableReversed || "0")),
      blp_amount: formatMoney2(-parseMoney(refunded.reversal.blpReversed || "0")),
    })
    if (contribError && !String(contribError.message || "").includes("duplicate")) {
      throw new Error(contribError.message)
    }

    const { data: latest, error: latestError } = await ubuntu
      .from("ua_blp_periods")
      .select("commissionable_sales, blp_total, status")
      .eq("id", periodId)
      .maybeSingle()
    if (latestError) throw new Error(latestError.message)
    if (latest && String(latest.status || "") === "OPEN") {
      const { error: periodError } = await ubuntu
        .from("ua_blp_periods")
        .update({
          commissionable_sales: floorZero(
            subtractMoney(parseMoney(latest.commissionable_sales || "0"), parseMoney(refunded.reversal.commissionableReversed || "0"))
          ),
          blp_total: floorZero(
            subtractMoney(parseMoney(latest.blp_total || "0"), parseMoney(refunded.reversal.blpReversed || "0"))
          ),
        })
        .eq("id", periodId)
        .eq("status", "OPEN")
      if (periodError) throw new Error(periodError.message)
    }
  }

  const { error: orderError } = await ubuntu
    .from("ua_card_orders")
    .update({
      order_status: "REFUNDED",
      fulfilment_status: "REFUNDED",
      fulfilment_at: new Date().toISOString(),
    })
    .eq("id", refunded.id)
    .eq("order_status", "PAID")
  if (orderError) throw new Error(orderError.message)

  return { idempotent: false }
}