import { createFileRoute } from "@tanstack/react-router"
import { listCardProducts } from "../../../lib/cardEconomics.mjs"

export const Route = createFileRoute("/api/cards/products")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ ok: true, products: listCardProducts(), checkoutEnabled: false })
      },
    },
  },
})