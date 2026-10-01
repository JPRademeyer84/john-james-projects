import { createFileRoute } from "@tanstack/react-router"
import { FRACTION_UNIT_PRICE } from "../../../lib/fractionEngine.mjs"
import { getUbuntuServerClient, loadActiveAureusPhase, loadUnderlyingInventory } from "../../../lib/ubuntuServer.server"

export const Route = createFileRoute("/api/aureus/current-phase")({
  server: {
    handlers: {
      GET: async () => {
        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu read refused" }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false }, { status: 503 })
        }

        try {
          const [phase, inventory] = await Promise.all([
            loadActiveAureusPhase(ubuntu),
            loadUnderlyingInventory(ubuntu),
          ])
          return Response.json({
            ok: true,
            phase: phase.phase,
            aureusSharePrice: phase.aureusSharePrice,
            fractionUnitPrice: FRACTION_UNIT_PRICE,
            remainingUnderlying: inventory.remainingUnderlying,
            soldUnderlying: inventory.soldUnderlying,
            checkoutEnabled: false,
          })
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Phase load failed",
            checkoutEnabled: false,
          }, { status: 500 })
        }
      },
    },
  },
})
