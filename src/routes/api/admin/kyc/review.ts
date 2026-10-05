import { createFileRoute } from "@tanstack/react-router"
import { persistKycReview } from "../../../../lib/persistKyc.server"
import { authorizeUbuntuStaff } from "../../../../lib/ubuntuAdminAuthorize.server"
import { assertNoAureusKycInput } from "../../../../lib/ubuntuKyc.mjs"

export const Route = createFileRoute("/api/admin/kyc/review")({
  server: {
    handlers: {
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
        const auth = await authorizeUbuntuStaff(request, body, "KYC")
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        }
        if (!auth.ubuntu) {
          return Response.json({
            ok: false,
            error: "Ubuntu Afrique database is not configured",
            checkoutEnabled: false,
          }, { status: 503 })
        }
        try {
          const kyc = await persistKycReview(auth.ubuntu, {
            userId: String(body.userId || ""),
            decision: String(body.decision || ""),
            reason: body.reason == null ? undefined : String(body.reason),
            reviewerUserId: auth.actorUserId,
            actorVia: auth.via,
          })
          return Response.json({ ok: true, kyc, via: auth.via, checkoutEnabled: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Ubuntu KYC review failed"
          const missing = message.includes("not found")
          return Response.json({ ok: false, error: message, checkoutEnabled: false }, { status: missing ? 404 : 400 })
        }
      },
    },
  },
})
