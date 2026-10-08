const AUREUS_URL =
  process.env.VITE_AUREUS_SUPABASE_URL || "https://fgubaqoftdeefcakejwu.supabase.co"

export function getAureusServiceKey(): string {
  const key = process.env.AUREUS_SERVICE_ROLE_KEY || ""
  if (!key || key.includes("not-configured")) return ""
  for (let i = 0; i < key.length; i += 1) {
    if (key.charCodeAt(i) > 127) {
      return ""
    }
  }
  return key
}

function restHeaders(key: string): HeadersInit {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
    Prefer: "return=representation",
  }
}

export async function aureusRestSelect<T>(pathAndQuery: string): Promise<{
  data: T | null
  error: { message: string } | null
}> {
  const key = getAureusServiceKey()
  if (!key) {
    return { data: null, error: { message: "AUREUS_SERVICE_ROLE_KEY missing" } }
  }
  const url = `${AUREUS_URL.replace(/\/$/, "")}/rest/v1/${pathAndQuery}`
  const res = await fetch(url, { headers: restHeaders(key) })
  const text = await res.text()
  if (!res.ok) {
    return { data: null, error: { message: `Aureus REST ${res.status}: ${text.slice(0, 200)}` } }
  }
  try {
    return { data: JSON.parse(text) as T, error: null }
  } catch {
    return { data: null, error: { message: "Aureus REST returned non-JSON" } }
  }
}

export async function aureusRestMaybeSingle<T>(pathAndQuery: string): Promise<{
  data: T | null
  error: { message: string } | null
}> {
  const result = await aureusRestSelect<T[] | T>(pathAndQuery)
  if (result.error) return { data: null, error: result.error }
  const rows = result.data
  if (Array.isArray(rows)) {
    return { data: (rows[0] as T) || null, error: null }
  }
  return { data: rows, error: null }
}

export function commissionAmount(row: Record<string, unknown>): number {
  const value = row.amount ?? row.commission_amount ?? row.commission ?? row.total_amount ?? 0
  return Number(value || 0)
}
