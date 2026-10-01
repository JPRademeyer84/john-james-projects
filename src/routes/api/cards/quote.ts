import { createFileRoute } from "@tanstack/react-router"
import { quoteCard } from "../../../lib/cardEconomics.mjs"

export const Route = createFileRoute("/api/cards/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        try {
          const quote = quoteCard(String(body.productType || ""), Number(body.quantity || 1))
          return Response.json({ ok: true, quote, checkoutEnabled: false })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Quote failed" }, { status: 400 })
        }
      },
    },
  },
})