import { createFileRoute } from "@tanstack/react-router"
import { verifyUaSession } from "../../../lib/uaSession.server"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"
import { resolveUbuntuMember } from "../../../lib/persistMemberLedger.server"
import { loadKycProfile, persistKycSubmit } from "../../../lib/persistKyc.server"
import { assertNoAureusKycInput } from "../../../lib/ubuntuKyc.mjs"

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || ""
  return header.startsWith("Bearer ") ? header.slice(7) : ""
}

async function resolveMember(request: Request) {
  const token = bearerToken(request)
  if (!token) return { error: "Session required", status: 401, member: null, ubuntu: null }
  let ubuntu
  try {
    ubuntu = getUbuntuServerClient()
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ubuntu read refused", status: 500, member: null, ubuntu: null }
  }
  if (!ubuntu) {
    return { error: "Ubuntu Afrique database is not configured", status: 503, member: null, ubuntu: null }
  }
  let member = null
  try {
    const session = verifyUaSession(token)
    member = await resolveUbuntuMember(ubuntu, { email: session.email, aureusUserId: session.aureusUserId })
  } catch {
    const { data, error } = await ubuntu.auth.getUser(token)
    if (error || !data.user) {
      return { error: "Invalid session", status: 401, member: null, ubuntu }
    }
    member = await resolveUbuntuMember(ubuntu, { authUserId: data.user.id, email: data.user.email || "" })
  }
  if (!member) {
    return { error: "Ubuntu member book not found", status: 404, member: null, ubuntu }
  }
  return { error: null, status: 200, member, ubuntu }
}

export const Route = createFileRoute("/api/member/kyc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const resolved = await resolveMember(request)
        if (resolved.error || !resolved.ubuntu || !resolved.member) {
          return Response.json({ ok: false, error: resolved.error, checkoutEnabled: false }, { status: resolved.status })
        }
        const kyc = await loadKycProfile(resolved.ubuntu, resolved.member.id)
        return Response.json({ ok: true, kyc, checkoutEnabled: false })
      },
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as Record<string, unknown>
        try {
          assertNoAureusKycInput(body)
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Aureus KYC refused",
            checkoutEnabled: false,
          }, { status: 400 })
        }
        if (Object.prototype.hasOwnProperty.call(body, "userId")) {
          return Response.json({
            ok: false,
            error: "userId is taken from the Ubuntu session, not the client",
            checkoutEnabled: false,
          }, { status: 400 })
        }
        const resolved = await resolveMember(request)
        if (resolved.error || !resolved.ubuntu || !resolved.member) {
          return Response.json({ ok: false, error: resolved.error, checkoutEnabled: false }, { status: resolved.status })
        }
        try {
          const kyc = await persistKycSubmit(resolved.ubuntu, {
            userId: resolved.member.id,
            fullName: String(body.fullName || ""),
            country: String(body.country || ""),
            status: body.status,
          })
          return Response.json({ ok: true, kyc, checkoutEnabled: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Ubuntu KYC submit failed"
          const conflict = message.includes("cannot be resubmitted")
          return Response.json({ ok: false, error: message, checkoutEnabled: false }, { status: conflict ? 409 : 400 })
        }
      },
    },
  },
})
