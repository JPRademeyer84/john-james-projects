import { createFileRoute } from "@tanstack/react-router"
import { phaseAvailability } from "../../../lib/fractionEngine.mjs"
import { getUbuntuServerClient, loadUnderlyingInventory } from "../../../lib/ubuntuServer.server"

export const Route = createFileRoute("/api/fractions/availability")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get("remainingUnderlying")) {
          return Response.json({
            ok: false,
            error: "remainingUnderlying is taken from Ubuntu inventory, not the client",
            checkoutEnabled: false,
          }, { status: 400 })
        }

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({ ok: false, error: err instanceof Error ? err.message : "Ubuntu read refused" }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false }, { status: 503 })
        }

        const price = url.searchParams.get("aureusSharePrice") || "100.00"
        try {
          const inventory = await loadUnderlyingInventory(ubuntu)
          return Response.json({
            ok: true,
            availability: phaseAvailability(inventory.remainingUnderlying, price),
            inventory,
            checkoutEnabled: false,
          })
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Availability failed",
            checkoutEnabled: false,
          }, { status: 400 })
        }
      },
    },
  },
})