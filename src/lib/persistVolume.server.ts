import type { SupabaseClient } from "@supabase/supabase-js"
import { addMoney, formatMoney2, parseMoney } from "./money.mjs"

function moneyOrZero(value) {
  return formatMoney2(parseMoney(value || "0"))
}

export async function persistConfirmVolume(
  ubuntu: SupabaseClient,
  credit: {
    sourceTransactionId: string
    buyerId: string
    qv: string
    teamUserIds: string[]
    blpAccrual: {
      periodId: string
      startsAt: string
      endsAt: string
      commissionableAdded: string
      blpAdded: string
    }
  }
) {
  const { data: existingQv, error: existingQvError } = await ubuntu
    .from("ua_qv_transactions")
    .select("id")
    .eq("source_transaction_id", credit.sourceTransactionId)
    .maybeSingle()
  if (existingQvError && !String(existingQvError.message || "").includes("does not exist")) {
    throw new Error(existingQvError.message)
  }
  if (existingQv) {
    return { idempotent: true }
  }

  const { error: qvError } = await ubuntu.from("ua_qv_transactions").insert({
    user_id: credit.buyerId,
    source_transaction_id: credit.sourceTransactionId,
    qv: credit.qv,
  })
  if (qvError) {
    const text = String(qvError.message || "")
    if (qvError.code === "23505" || text.toLowerCase().includes("duplicate") || text.includes("ua_qv_txn_source")) {
      return { idempotent: true }
    }
    throw new Error(qvError.message)
  }

  for (const userId of credit.teamUserIds) {
    const { data: current, error: readError } = await ubuntu
      .from("ua_team_volume")
      .select("personal_qv, team_qv, monthly_team_qv, lifetime_team_qv")
      .eq("user_id", userId)
      .maybeSingle()
    if (readError) throw new Error(readError.message)

    const qv = parseMoney(credit.qv)
    const personal = parseMoney(current?.personal_qv || "0")
    const { error: volumeError } = await ubuntu.from("ua_team_volume").upsert({
      user_id: userId,
      personal_qv: formatMoney2(userId === credit.buyerId ? addMoney(personal, qv) : personal),
      team_qv: formatMoney2(addMoney(parseMoney(current?.team_qv || "0"), qv)),
      monthly_team_qv: formatMoney2(addMoney(parseMoney(current?.monthly_team_qv || "0"), qv)),
      lifetime_team_qv: formatMoney2(addMoney(parseMoney(current?.lifetime_team_qv || "0"), qv)),
      updated_at: new Date().toISOString(),
    })
    if (volumeError) throw new Error(volumeError.message)
  }

  const { data: period, error: periodReadError } = await ubuntu
    .from("ua_blp_periods")
    .select("id, status, commissionable_sales, blp_total")
    .eq("id", credit.blpAccrual.periodId)
    .maybeSingle()
  if (periodReadError && !String(periodReadError.message || "").includes("does not exist")) {
    throw new Error(periodReadError.message)
  }
  if (period && String(period.status || "") === "CLOSED") {
    throw new Error("BLP period " + credit.blpAccrual.periodId + " is already closed")
  }
  if (!period) {
    const { error: insertPeriodError } = await ubuntu.from("ua_blp_periods").insert({
      id: credit.blpAccrual.periodId,
      starts_at: credit.blpAccrual.startsAt,
      ends_at: credit.blpAccrual.endsAt,
      commissionable_sales: "0",
      blp_total: "0",
      status: "OPEN",
    })
    if (insertPeriodError && !String(insertPeriodError.message || "").includes("duplicate")) {
      throw new Error(insertPeriodError.message)
    }
  }

  const { error: contribError } = await ubuntu.from("ua_blp_contributions").insert({
    period_id: credit.blpAccrual.periodId,
    source_transaction_id: credit.sourceTransactionId,
    commissionable_value: credit.blpAccrual.commissionableAdded,
    blp_amount: credit.blpAccrual.blpAdded,
  })
  if (contribError && String(contribError.message || "").includes("duplicate")) {
    return { idempotent: true }
  }
  if (contribError) throw new Error(contribError.message)

  const { data: latest, error: latestError } = await ubuntu
    .from("ua_blp_periods")
    .select("commissionable_sales, blp_total")
    .eq("id", credit.blpAccrual.periodId)
    .maybeSingle()
  if (latestError) throw new Error(latestError.message)

  const { error: periodUpdateError } = await ubuntu
    .from("ua_blp_periods")
    .update({
      commissionable_sales: moneyOrZero(
        formatMoney2(addMoney(parseMoney(latest?.commissionable_sales || "0"), parseMoney(credit.blpAccrual.commissionableAdded)))
      ),
      blp_total: moneyOrZero(
        formatMoney2(addMoney(parseMoney(latest?.blp_total || "0"), parseMoney(credit.blpAccrual.blpAdded)))
      ),
    })
    .eq("id", credit.blpAccrual.periodId)
    .eq("status", "OPEN")
  if (periodUpdateError) throw new Error(periodUpdateError.message)

  return { idempotent: false }
}