import type { SupabaseClient } from "@supabase/supabase-js"
import { buildAdminAlert } from "./financialAlert.mjs"

function relationMissing(error?: { message?: string; code?: string } | null) {
  if (!error) return false
  const message = String(error.message || "")
  return (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("Could not find the table") ||
    error.code === "PGRST205" ||
    error.code === "42P01"
  )
}

export async function persistAdminAlert(
  ubuntu: SupabaseClient,
  input: { type?: unknown; message?: unknown; source?: unknown; reference?: unknown }
) {
  const alert = buildAdminAlert(input)
  const { error } = await ubuntu.from("ua_admin_alerts").insert({
    alert_type: alert.type,
    priority: alert.priority,
    source: alert.source,
    reference: alert.reference,
    message: alert.message,
  })
  if (error && !relationMissing(error)) throw new Error(error.message)
  return alert
}

export async function loadAdminAlerts(ubuntu: SupabaseClient) {
  const { data, error } = await ubuntu
    .from("ua_admin_alerts")
    .select("id, alert_type, priority, source, reference, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200)
  if (error && relationMissing(error)) return []
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    type: String(row.alert_type),
    priority: String(row.priority),
    source: String(row.source),
    reference: row.reference == null ? null : String(row.reference),
    message: String(row.message),
    createdAt: row.created_at,
    checkoutEnabled: false,
  }))
}