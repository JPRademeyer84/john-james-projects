import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient } from "../../../../lib/ubuntuServer.server"
import {
  loadMarketplaceMedia,
  persistMarketplaceMedia,
  persistMarketplaceMediaArchive,
} from "../../../../lib/persistMarketplaceMedia.server"

function authorize(request: Request, secret: string) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  if (header !== expected && secret !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

export const Route = createFileRoute("/api/admin/marketplace/media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const auth = authorize(request, String(url.searchParams.get("confirmSecret") || ""))
        if (!auth.ok) return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu read refused", checkoutEnabled: false }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false }, { status: 503 })
        }
        const companyId = String(url.searchParams.get("companyId") || "").trim()
        const media = await loadMarketplaceMedia(ubuntu, companyId || undefined)
        return Response.json({ ok: true, media, checkoutEnabled: false })
      },
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as Record<string, unknown>
        const auth = authorize(request, String(body.confirmSecret || ""))
        if (!auth.ok) return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        if (Object.prototype.hasOwnProperty.call(body, "members") || Object.prototype.hasOwnProperty.call(body, "rank")) {
          return Response.json({ ok: false, error: "Client-supplied rank chains are rejected", checkoutEnabled: false }, { status: 400 })
        }
        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu write refused", checkoutEnabled: false }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false }, { status: 503 })
        }
        try {
          const media = await persistMarketplaceMedia(ubuntu, {
            id: body.id,
            companyId: body.companyId,
            productId: body.productId,
            kind: body.kind,
            contentType: body.contentType,
            byteSize: body.byteSize,
            publicUrl: body.publicUrl,
          })
          return Response.json({ ok: true, media, checkoutEnabled: false })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Media persist failed", checkoutEnabled: false }, { status: 400 })
        }
      },
      PATCH: async ({ request }) => {
        const body = await request.json().catch(() => ({})) as Record<string, unknown>
        const auth = authorize(request, String(body.confirmSecret || ""))
        if (!auth.ok) return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        const mediaId = String(body.mediaId || body.id || "").trim()
        if (!mediaId) {
          return Response.json({ ok: false, error: "mediaId is required", checkoutEnabled: false }, { status: 400 })
        }
        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu write refused", checkoutEnabled: false }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false }, { status: 503 })
        }
        try {
          const media = await persistMarketplaceMediaArchive(ubuntu, mediaId)
          return Response.json({ ok: true, media, checkoutEnabled: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Media archive failed"
          const missing = message.includes("not found")
          return Response.json({ ok: false, error: message, checkoutEnabled: false }, { status: missing ? 404 : 400 })
        }
      },
    },
  },
})