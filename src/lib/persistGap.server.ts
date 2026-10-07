import type { SupabaseClient } from "@supabase/supabase-js"

export async function persistGapCoverResult(
  ubuntu: SupabaseClient,
  sourceTransactionId: string,
  sellerId: string,
  productId: string,
  result: {
    commissionableValue: string
    compPlanVersion: string
    payments: Array<{
      recipientId: string
      recipientRank: string
      commissionType: string
      previousEntitlement: string
      newEntitlement: string
      gapPercentage: string
      amount: string
    }>
  }
) {
  for (const payment of result.payments) {
    const { error: commissionError } = await ubuntu.from("ua_commission_transactions").insert({
      source_transaction_id: sourceTransactionId,
      product_id: productId || null,
      seller_id: sellerId,
      recipient_user_id: payment.recipientId,
      recipient_rank: payment.recipientRank,
      commission_type: payment.commissionType,
      commissionable_value: result.commissionableValue,
      previous_entitlement: payment.previousEntitlement,
      new_entitlement: payment.newEntitlement,
      gap_percentage: payment.gapPercentage,
      amount: payment.amount,
      status: "posted",
      comp_plan_version: result.compPlanVersion,
    })
    if (commissionError && !String(commissionError.message || "").includes("duplicate") && commissionError.code !== "23505") {
      throw new Error(commissionError.message)
    }

    const { data: existingWallet, error: existingWalletError } = await ubuntu
      .from("ua_wallet_ledger")
      .select("id")
      .eq("source_transaction_id", sourceTransactionId)
      .eq("user_id", payment.recipientId)
      .eq("entry_type", "GAP_COMMISSION")
      .eq("status", "posted")
      .limit(1)
      .maybeSingle()
    if (existingWalletError && !String(existingWalletError.message || "").includes("does not exist")) {
      throw new Error(existingWalletError.message)
    }
    if (existingWallet) continue

    const { error: walletError } = await ubuntu.from("ua_wallet_ledger").insert({
      user_id: payment.recipientId,
      entry_type: "GAP_COMMISSION",
      amount: payment.amount,
      source_transaction_id: sourceTransactionId,
      status: "posted",
    })
    if (walletError && !String(walletError.message || "").includes("duplicate") && walletError.code !== "23505") {
      throw new Error(walletError.message)
    }
  }
}