import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"
import { loadNftListings } from "../../../lib/persistNft.server"

export const Route = createFileRoute("/api/nft/listings")({
  server: {
    handlers: {
      GET: async () => {
        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json({
            ok: false,
            error: err instanceof Error ? err.message : "Ubuntu read refused",
            checkoutEnabled: false,
            nftMarketplaceEnabled: false,
          }, { status: 500 })
        }
        if (!ubuntu) {
          return Response.json({
            ok: false,
            error: "Ubuntu Afrique database is not configured",
            checkoutEnabled: false,
            nftMarketplaceEnabled: false,
          }, { status: 503 })
        }
        const listings = (await loadNftListings(ubuntu)).filter((row) => row.status === "LISTED")
        return Response.json({
          ok: true,
          listings,
          checkoutEnabled: false,
          nftMarketplaceEnabled: false,
        })
      },
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
