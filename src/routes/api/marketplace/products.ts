import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"
import { loadMarketplaceProducts } from "../../../lib/persistMarketplaceSettlement.server"

export const Route = createFileRoute("/api/marketplace/products")({
  server: {
    handlers: {
      GET: async () => {
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
        const products = (await loadMarketplaceProducts(ubuntu)).filter((row) => row.active)
        return Response.json({ ok: true, products, checkoutEnabled: false })
      },
    },
  },
})
