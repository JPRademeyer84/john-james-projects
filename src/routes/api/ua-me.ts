import { createFileRoute } from "@tanstack/react-router"
import { verifyUaSession } from "../../lib/uaSession.server"
import {
  aureusRestMaybeSingle,
  aureusRestSelect,
  commissionAmount,
} from "../../lib/aureusAdminRest.server"

export const Route = createFileRoute("/api/ua-me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const header = request.headers.get("authorization") || ""
        const token = header.startsWith("Bearer ") ? header.slice(7) : ""
        let session
        try {
          session = verifyUaSession(token)
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Unauthorized" }, { status: 401 })
        }

        const fallback = {
          ok: true,
          profile: {
            id: session.aureusUserId,
            email: session.email,
            username: "",
            is_admin: false,
            role: null,
          },
          ledger: { shares: 0, invested: 0, commissions: 0, pending: 0 },
        }

        try {
          const userId = session.aureusUserId
          const [{ data: profile, error: profileError }, { data: balances }, { data: purchases }, { data: commissions }] =
            await Promise.all([
              aureusRestMaybeSingle<Record<string, unknown>>(
                `users?id=eq.${userId}&select=id,email,username,full_name,phone,country_of_residence,is_admin,is_active,role,created_at,auth_user_id`
              ),
              aureusRestMaybeSingle<{ net_shares?: number }>(
                `user_share_balances?user_id=eq.${userId}&select=net_shares`
              ),
              aureusRestSelect<Array<Record<string, unknown>>>(
                `aureus_share_purchases?user_id=eq.${userId}&select=shares_purchased,total_amount,status,created_at,payment_method&order=created_at.desc&limit=25`
              ),
              aureusRestSelect<Array<Record<string, unknown>>>(
                `multi_level_commissions?referrer_id=eq.${userId}&select=*&order=created_at.desc&limit=25`
              ),
            ])

          if (profileError || !profile) {
            return Response.json({
              ...fallback,
              warning: profileError?.message || "Aureus profile not found",
            })
          }

          const purchaseRows = purchases || []
          const commissionRows = commissions || []
          const invested = purchaseRows.reduce((sum, row) => sum + Number(row.total_amount || 0), 0)
          const earned = commissionRows.reduce((sum, row) => sum + commissionAmount(row), 0)
          const pending = commissionRows
            .filter((row) => String(row.status || "").toLowerCase() === "pending")
            .reduce((sum, row) => sum + commissionAmount(row), 0)

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
          return Response.json({
            ...fallback,
            warning: err instanceof Error ? err.message : "Aureus profile unavailable",
          })
        }
      },
    },
  },
})
