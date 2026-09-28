import { createFileRoute } from "@tanstack/react-router"
import { createClient } from "@supabase/supabase-js"
import { verifyUaSession } from "../../lib/uaSession.server"

export const Route = createFileRoute("/api/ua-me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const header = request.headers.get("authorization") || ""
        const token = header.startsWith("Bearer ") ? header.slice(7) : ""
        try {
          const session = verifyUaSession(token)
          const service = process.env.AUREUS_SERVICE_ROLE_KEY || ""
          const aureusUrl = process.env.VITE_AUREUS_SUPABASE_URL || "https://fgubaqoftdeefcakejwu.supabase.co"
          if (!service) {
            return Response.json({
              ok: true,
              profile: { id: session.aureusUserId, email: session.email, username: "", is_admin: false, role: null },
              ledger: { shares: 0, invested: 0, commissions: 0, pending: 0 },
            })
          }
          const admin = createClient(aureusUrl, service, { auth: { persistSession: false, autoRefreshToken: false } })
          const [{ data: profile }, { data: balances }, { data: purchases }, { data: commissions }] = await Promise.all([
            admin.from("users").select("id, email, username, full_name, phone, country_of_residence, is_admin, is_active, role, created_at, auth_user_id").eq("id", session.aureusUserId).maybeSingle(),
            admin.from("user_share_balances").select("net_shares").eq("user_id", session.aureusUserId).maybeSingle(),
            admin.from("aureus_share_purchases").select("shares_purchased, total_amount, status, created_at, payment_method").eq("user_id", session.aureusUserId).order("created_at", { ascending: false }).limit(25),
            admin.from("multi_level_commissions").select("amount, status, created_at").eq("referrer_id", session.aureusUserId).order("created_at", { ascending: false }).limit(25),
          ])
          const purchaseRows = purchases || []
          const commissionRows = commissions || []
          const invested = purchaseRows.reduce((sum, row) => sum + Number(row.total_amount || 0), 0)
          const earned = commissionRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
          const pending = commissionRows.filter((row) => String(row.status || "").toLowerCase() === "pending").reduce((sum, row) => sum + Number(row.amount || 0), 0)
          return Response.json({
            ok: true,
            profile,
            ledger: {
              shares: Number(balances?.net_shares || 0),
              invested,
              commissions: earned,
              pending,
            },
          })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Unauthorized" }, { status: 401 })
        }
      },
    },
  },
})
