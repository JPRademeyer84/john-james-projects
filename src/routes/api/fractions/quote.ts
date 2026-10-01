import { createFileRoute } from "@tanstack/react-router"
import { quoteFractions } from "../../../lib/fractionEngine.mjs"
import { getUbuntuServerClient, loadUnderlyingInventory } from "../../../lib/ubuntuServer.server"

export const Route = createFileRoute("/api/fractions/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        if (body.remainingUnderlying != null && String(body.remainingUnderlying).trim() !== "") {
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

        try {
          const inventory = await loadUnderlyingInventory(ubuntu)
          const quote = quoteFractions({
            quantity: Number(body.quantity || 1),
            aureusSharePrice: String(body.aureusSharePrice || "100.00"),
            aureusPhase: Number(body.aureusPhase || 10),
            remainingUnderlying: inventory.remainingUnderlying,
          })
          return Response.json({
            ok: true,
            quote,
            inventory,
            checkoutEnabled: false,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Quote failed"
          const soldThrough = message.includes("exceeds remaining underlying")
          return Response.json({ ok: false, error: message, checkoutEnabled: false }, { status: soldThrough ? 409 : 400 })
        }
      },
    },
  },
})