import type { SupabaseClient } from "@supabase/supabase-js"
import { persistPaymentEvent } from "./persistPayment.server"
import { verifyUbuntuPspWebhook } from "./ubuntuPsp.mjs"

export async function persistUbuntuPspWebhook(
  ubuntu: SupabaseClient,
  input: {
    secret: string
    signature: string
    payload: {
      paymentId: string
      orderId: string
      kind: string
      amount: string
      currency?: string
    }
    order: { id: string; total: string; kind?: string }
  }
) {
  const event = verifyUbuntuPspWebhook(input)
  const persisted = await persistPaymentEvent(ubuntu, event)
  return {
    ...persisted,
    event,
    checkoutEnabled: false as const,
  }
}
