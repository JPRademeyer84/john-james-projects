import { createFileRoute } from "@tanstack/react-router"
import { quoteFractions } from "../../../lib/fractionEngine.mjs"

export const Route = createFileRoute("/api/fractions/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        try {
          const quote = quoteFractions({
            quantity: Number(body.quantity || 1),
            aureusSharePrice: String(body.aureusSharePrice || "100.00"),
            aureusPhase: Number(body.aureusPhase || 10),
            remainingUnderlying: body.remainingUnderlying ? String(body.remainingUnderlying) : undefined,
          })
          return Response.json({ ok: true, quote, checkoutEnabled: false })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Quote failed" }, { status: 400 })
        }
      },
    },
  },
})