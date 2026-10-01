import { createFileRoute } from "@tanstack/react-router"
import { INITIAL_UNDERLYING_SHARES, phaseAvailability } from "../../../lib/fractionEngine.mjs"

export const Route = createFileRoute("/api/fractions/availability")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const remaining = url.searchParams.get("remainingUnderlying") || INITIAL_UNDERLYING_SHARES
        const price = url.searchParams.get("aureusSharePrice") || "100.00"
        try {
          return Response.json({ ok: true, availability: phaseAvailability(remaining, price), checkoutEnabled: false })
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Availability failed" }, { status: 400 })
        }
      },
    },
  },
})