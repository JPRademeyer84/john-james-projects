import { createFileRoute } from "@tanstack/react-router"
import { signUaSession } from "../../lib/uaSession.server"
import { aureusRestMaybeSingle } from "../../lib/aureusAdminRest.server"
import { loadAureusReadsAndRefreshMirror } from "../../lib/persistAureusReadMirror.server"
import { getUbuntuServerClient } from "../../lib/ubuntuServer.server"

const AUREUS_LOGIN_URLS = [
  "https://www.aureus.africa/api/initiate-login",
  "https://aureus.africa/api/initiate-login",
]

export const Route = createFileRoute("/api/ua-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        const email = String(body.email || "").trim()
        const password = String(body.password || "")
        if (!email || !password) {
          return Response.json({ ok: false, error: "Email and password are required" }, { status: 400 })
        }

        let lastError = "Aureus login failed"
        let loginJson: any = null
        for (const url of AUREUS_LOGIN_URLS) {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ emailOrUsername: email, password }),
          })
          loginJson = await res.json().catch(() => null)
          if (loginJson?.success && loginJson.user?.id) {
            lastError = ""
            break
          }
          if (loginJson?.challengeRequired) {
            return Response.json({
              ok: false,
              challengeRequired: true,
              challengeType: loginJson.challengeType,
              message: loginJson.message || "Additional verification is required on Aureus Africa.",
            }, { status: 200 })
          }
          lastError = loginJson?.error || `Aureus login HTTP ${res.status}`
        }

        if (!loginJson?.success || !loginJson.user?.id) {
          return Response.json({ ok: false, error: lastError, tryUbuntu: true }, { status: 401 })
        }

        const user = loginJson.user
        let isAdmin = false
        let role = ""
        try {
          const { data } = await aureusRestMaybeSingle<{ is_admin?: boolean; role?: string }>(
            `users?id=eq.${Number(user.id)}&select=is_admin,role`
          )
          isAdmin = Boolean(data?.is_admin) || String(data?.role || "").toLowerCase() === "admin" || String(data?.role || "").toLowerCase() === "super_admin"
          role = String(data?.role || "")
        } catch {
          isAdmin = false
          role = ""
        }

        const token = signUaSession({ aureusUserId: Number(user.id), email: String(user.email) })
        let ubuntuUserId = null
        let provisionWarning = ""
        try {
          const ubuntu = getUbuntuServerClient()
          if (ubuntu) {
            const refreshed = await loadAureusReadsAndRefreshMirror(ubuntu, {
              aureusUserId: Number(user.id),
              email: String(user.email),
              username: String(user.username || ""),
              authUserId: user.auth_user_id || null,
            })
            ubuntuUserId = refreshed.member?.id || null
          }
        } catch (err) {
          provisionWarning = err instanceof Error ? err.message : "Ubuntu member provision failed"
        }

        return Response.json({
          ok: true,
          identitySource: "aureus",
          token,
          ubuntuUserId,
          provisioned: Boolean(ubuntuUserId),
          warning: provisionWarning || undefined,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            auth_user_id: user.auth_user_id,
            is_admin: isAdmin,
            role,
          },
        })
      },
    },
  },
})
