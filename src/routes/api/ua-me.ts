import { createFileRoute } from "@tanstack/react-router"
import { verifyUaSession } from "../../lib/uaSession.server"
import { loadAureusReadMirror, loadAureusReadsAndRefreshMirror } from "../../lib/persistAureusReadMirror.server"
import { getUbuntuServerClient } from "../../lib/ubuntuServer.server"
import { mirrorToUaMe } from "../../lib/ubuntuAureusMirror.mjs"

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

        const ubuntu = getUbuntuServerClient()
        if (ubuntu) {
          try {
            const refreshed = await loadAureusReadsAndRefreshMirror(ubuntu, {
              aureusUserId: session.aureusUserId,
              email: session.email,
            })
            if (refreshed.profile) {
              return Response.json({
                ok: true,
                ubuntuUserId: refreshed.member?.id || null,
                mirrored: true,
                profile: refreshed.profile,
                ledger: {
                  shares: refreshed.ledger.netShares,
                  invested: refreshed.ledger.invested,
                  commissions: refreshed.ledger.commissions,
                  pending: refreshed.ledger.pendingCommissions,
                },
              })
            }
          } catch {
            const stored = await loadAureusReadMirror(ubuntu, session.aureusUserId).catch(() => null)
            const shown = mirrorToUaMe(stored)
            if (shown) {
              return Response.json({
                ok: true,
                ubuntuUserId: stored?.ubuntu_user_id || null,
                warning: "Aureus profile unavailable; showing Ubuntu AA read-mirror",
                ...shown,
              })
            }
          }

          const stored = await loadAureusReadMirror(ubuntu, session.aureusUserId).catch(() => null)
          const shown = mirrorToUaMe(stored)
          if (shown) {
            return Response.json({
              ok: true,
              ubuntuUserId: stored?.ubuntu_user_id || null,
              warning: "Aureus profile not found; showing Ubuntu AA read-mirror",
              ...shown,
            })
          }
        }

        return Response.json({
          ...fallback,
          warning: "Aureus profile not found",
        })
      },
    },
  },
})
