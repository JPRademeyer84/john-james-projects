import type { SupabaseClient } from "@supabase/supabase-js"
import { compareMoney, parseMoney } from "./money.mjs"

function isDuplicate(error: { message?: string; code?: string } | null) {
  if (!error) return false
  if (error.code === "23505") return true
  return String(error.message || "").toLowerCase().includes("duplicate")
}

function samePayment(existing: Record<string, unknown>, event: { orderId: string; kind: string; amount: string }) {
  return (
    String(existing.order_id) === String(event.orderId) &&
    String(existing.kind) === String(event.kind) &&
    compareMoney(parseMoney(existing.amount), parseMoney(event.amount)) === 0
  )
}

async function loadPaymentEvent(ubuntu: SupabaseClient, paymentId: string) {
  const { data, error } = await ubuntu
    .from("ua_payment_events")
    .select("payment_id, order_id, kind, amount, provider, status")
    .eq("payment_id", paymentId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function persistPaymentEvent(
  ubuntu: SupabaseClient,
  event: {
    orderId: string
    kind: string
    paymentId: string
    amount: string
    provider?: string
    status?: string
  }
) {
  const paymentId = String(event.paymentId || "").trim()
  if (!paymentId) throw new Error("paymentId is required")

  const existing = await loadPaymentEvent(ubuntu, paymentId)
  if (existing) {
    if (!samePayment(existing, event)) {
      throw new Error("payment_id is already recorded for a different Ubuntu payment")
    }
    return { idempotent: true, status: "RECORDED" as const }
  }

  const row = {
    payment_id: paymentId,
    order_id: String(event.orderId),
    kind: String(event.kind),
    amount: event.amount,
    provider: String(event.provider || "").trim() || "UA_STAGING",
    status: "RECORDED",
  }
  const { error } = await ubuntu.from("ua_payment_events").insert(row)
  if (isDuplicate(error)) {
    const raced = await loadPaymentEvent(ubuntu, paymentId)
    if (raced && samePayment(raced, event)) {
      return { idempotent: true, status: "RECORDED" as const }
    }
    throw new Error("payment_id is already recorded for a different Ubuntu payment")
  }
  if (error) throw new Error(error.message)
  return { idempotent: false, status: "RECORDED" as const }
}
