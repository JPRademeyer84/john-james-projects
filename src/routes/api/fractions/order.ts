import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/fractions/order")({
  server: {
    handlers: {
      POST: async () => {
        return Response.json(
          { ok: false, error: "Public checkout is not open", checkoutEnabled: false },
          { status: 403 }
        )
      },
    },
  },
})