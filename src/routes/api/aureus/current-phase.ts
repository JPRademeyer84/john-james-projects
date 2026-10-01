import { createFileRoute } from "@tanstack/react-router"
import { DEFAULT_PHASE } from "../../../lib/fractionEngine.mjs"

export const Route = createFileRoute("/api/aureus/current-phase")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          ok: true,
          phase: DEFAULT_PHASE.phase,
          aureusSharePrice: DEFAULT_PHASE.aureusSharePrice,
          fractionUnitPrice: "10.00",
          checkoutEnabled: false,
        })
      },
    },
  },
})