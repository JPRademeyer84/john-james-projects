import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient, loadGapCoverMembers } from "../../../../lib/ubuntuServer.server"
import { persistNftSettlement } from "../../../../lib/persistNft.server"

function authorize(request: Request, body: Record<string, unknown>) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromBody = String(body.confirmSecret || "")
  if (header !== expected && fromBody !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

export const Route = createFileRoute("/api/admin/nft/settle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as Record<string, unknown>
        const auth = authorize(request, body)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        }
        if (Object.prototype.hasOwnProperty.call(body, "members") || Object.prototype.hasOwnProperty.call(body, "rank")) {
          return Response.json({
            ok: false,
            error: "Client-supplied rank chains are rejected",
            checkoutEnabled: false,
          }, { status: 400 })
        }

        const listingId = String(body.listingId || "").trim()
        const buyerId = String(body.buyerId || "").trim()
        const paymentId = String(body.paymentId || "").trim()
        const sellerUserId = String(body.sellerUserId || "").trim()
        if (!listingId || !buyerId || !paymentId) {
          return Response.json({
            ok: false,
            error: "listingId, buyerId, and paymentId are required",
            checkoutEnabled: false,
          }, { status: 400 })
        }

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Ubuntu write refused",
            checkoutEnabled: false,
          }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({
            ok: false,
            error: "Ubuntu Afrique database is not configured",
            checkoutEnabled: false,
          }, { status: 503 })
        }

        const members = await loadGapCoverMembers(ubuntu, sellerUserId)
        try {
          const settled = await persistNftSettlement(ubuntu, { listingId, buyerId, paymentId, members })
          return Response.json({ ...settled, ok: true, checkoutEnabled: false, nftMarketplaceEnabled: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : "NFT settle failed"
          const unavailable = message.includes("unavailable")
          return Response.json({
            ok: false,
            error: message,
            checkoutEnabled: false,
            nftMarketplaceEnabled: false,
          }, { status: unavailable ? 409 : 400 })
        }
      },
    },
  },
})
