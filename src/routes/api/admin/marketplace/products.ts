import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient } from "../../../../lib/ubuntuServer.server"
import { loadMarketplaceProducts, persistMarketplaceProduct } from "../../../../lib/persistMarketplaceSettlement.server"

function authorize(request: Request, url: URL, body: Record<string, unknown> = {}) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromQuery = String(url.searchParams.get("confirmSecret") || "")
  const fromBody = String(body.confirmSecret || "")
  if (header !== expected && fromQuery !== expected && fromBody !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

function rejectClientCommerce(url: URL, body: Record<string, unknown> = {}) {
  if (url.searchParams.has("remainingUnderlying") || Object.prototype.hasOwnProperty.call(body, "remainingUnderlying")) {
    return { ok: false, error: "remainingUnderlying is taken from Ubuntu inventory, not the client" }
  }
  if (url.searchParams.has("aureusSharePrice") || Object.prototype.hasOwnProperty.call(body, "aureusSharePrice")) {
    return { ok: false, error: "aureusSharePrice and aureusPhase are taken from Ubuntu ua_aureus_phases, not the client" }
  }
  if (
    url.searchParams.has("members") ||
    Object.prototype.hasOwnProperty.call(body, "members") ||
    url.searchParams.has("rank") ||
    Object.prototype.hasOwnProperty.call(body, "rank")
  ) {
    return { ok: false, error: "Client-supplied rank chains are rejected" }
  }
  const schedule = String(body.gapSchedule || url.searchParams.get("gapSchedule") || "STANDARD_25")
  if (schedule !== "STANDARD_25") {
    return { ok: false, error: "Marketplace uses shared Gap Cover STANDARD_25 only" }
  }
  return { ok: true }
}

export const Route = createFileRoute("/api/admin/marketplace/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const auth = authorize(request, url)
        if (!auth.ok) return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        const rejected = rejectClientCommerce(url)
        if (!rejected.ok) return Response.json({ ok: false, error: rejected.error, checkoutEnabled: false }, { status: 400 })
        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Ubuntu read refused",
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
        const products = await loadMarketplaceProducts(ubuntu)
        return Response.json({ ok: true, products, checkoutEnabled: false })
      },
      POST: async ({ request }) => {
        const url = new URL(request.url)
        const body = await request.json().catch(() => ({})) as Record<string, unknown>
        const auth = authorize(request, url, body)
        if (!auth.ok) return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        const rejected = rejectClientCommerce(url, body)
        if (!rejected.ok) return Response.json({ ok: false, error: rejected.error, checkoutEnabled: false }, { status: 400 })
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
        try {
          const product = await persistMarketplaceProduct(ubuntu, {
            productId: String(body.productId || ""),
            companyId: String(body.companyId || ""),
            name: String(body.name || ""),
            retailPrice: String(body.retailPrice || ""),
            companyPayout: String(body.companyPayout || ""),
            qv: body.qv == null ? undefined : String(body.qv),
          })
          return Response.json({ ok: true, product, checkoutEnabled: false })
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Product persist failed",
            checkoutEnabled: false,
          }, { status: 400 })
        }
      },
    },
  },
})
