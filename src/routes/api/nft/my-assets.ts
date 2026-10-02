import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"
import { loadNftAssetsForOwner } from "../../../lib/persistNft.server"

export const Route = createFileRoute("/api/nft/my-assets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const ownerId = String(url.searchParams.get("ownerId") || "").trim()
        if (!ownerId) {
          return Response.json({
            ok: false,
            error: "ownerId is required",
            checkoutEnabled: false,
            nftMarketplaceEnabled: false,
          }, { status: 400 })
        }
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
        const assets = await loadNftAssetsForOwner(ubuntu, ownerId)
        return Response.json({
          ok: true,
          assets,
          checkoutEnabled: false,
          nftMarketplaceEnabled: false,
        })
      },
    },
  },
})
