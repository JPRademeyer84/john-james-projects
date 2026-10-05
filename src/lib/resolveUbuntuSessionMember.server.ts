import type { SupabaseClient } from "@supabase/supabase-js"
import { resolveUbuntuMember } from "./persistMemberLedger.server"
import { verifyUaSession } from "./uaSession.server"

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || ""
  return header.startsWith("Bearer ") ? header.slice(7) : ""
}

export async function resolveSessionMember(ubuntu: SupabaseClient, token: string) {
  try {
    const session = verifyUaSession(token)
    return await resolveUbuntuMember(ubuntu, {
      email: session.email,
      aureusUserId: session.aureusUserId,
    })
  } catch {
    const { data, error } = await ubuntu.auth.getUser(token)
    if (error || !data.user) {
      throw new Error("Invalid session")
    }
    return await resolveUbuntuMember(ubuntu, {
      authUserId: data.user.id,
      email: data.user.email || "",
    })
  }
}
