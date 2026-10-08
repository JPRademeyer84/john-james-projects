import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/nft/order")({
  server: {
    handlers: {
      POST: async () => {
        return Response.json(
          {
            ok: false,
            error: "Public checkout is not open",
            checkoutEnabled: false,
            nftMarketplaceEnabled: false,
          },
          { status: 403 }
        )
      },
    },
  },
})
