import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export const AUREUS_PROD_REF = "fgubaqoftdeefcakejwu"

export function getUbuntuEnv() {
  const url = String(import.meta.env.VITE_UBUNTU_SUPABASE_URL || "")
  const key = String(import.meta.env.VITE_UBUNTU_SUPABASE_ANON_KEY || "")
  return { url, key, configured: Boolean(url && key) }
}

export function assertUbuntuWriteTarget(url: string) {
  if (url.includes(AUREUS_PROD_REF)) {
    throw new Error(
      "Ubuntu Afrique write client is pointed at Aureus production. Refused. Use a separate Ubuntu Afrique Supabase project."
    )
  }
}

const env = getUbuntuEnv()
assertUbuntuWriteTarget(env.url)

export const ubuntu: SupabaseClient = createClient(
  env.configured ? env.url : "https://ubuntu-afrique-not-configured.invalid",
  env.configured ? env.key : "not-configured"
)
