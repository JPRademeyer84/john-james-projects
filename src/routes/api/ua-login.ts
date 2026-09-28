import { createFileRoute } from "@tanstack/react-router"
import { createClient } from "@supabase/supabase-js"
import { signUaSession } from "../../lib/uaSession.server"

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
        const service = process.env.AUREUS_SERVICE_ROLE_KEY || ""
        const aureusUrl = process.env.VITE_AUREUS_SUPABASE_URL || "https://fgubaqoftdeefcakejwu.supabase.co"
        if (service && !service.includes("not-configured")) {
          const admin = createClient(aureusUrl, service, { auth: { persistSession: false, autoRefreshToken: false } })
          const { data } = await admin
            .from("users")
            .select("is_admin, role")
            .eq("id", user.id)
            .maybeSingle()
          isAdmin = Boolean(data?.is_admin) || String(data?.role || "").toLowerCase() === "admin" || String(data?.role || "").toLowerCase() === "super_admin"
          role = String(data?.role || "")
        }

        const token = signUaSession({ aureusUserId: Number(user.id), email: String(user.email) })
        return Response.json({
          ok: true,
          identitySource: "aureus",
          token,
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
