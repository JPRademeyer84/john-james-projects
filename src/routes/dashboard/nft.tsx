import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { filterNftPreview } from "../../lib/ubuntuCatalog.mjs"

export const Route = createFileRoute("/dashboard/nft")({
  component: NftShareholderPage,
})

function NftShareholderPage() {
  const [listings, setListings] = useState<unknown[]>([])
  const [assets, setAssets] = useState<unknown[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    void loadPreview()
  }, [])

  async function loadPreview() {
    try {
      const listingRes = await fetch("/api/nft/listings")
      const listingJson = await listingRes.json()
      if (listingJson.ok) setListings(listingJson.listings || [])
      const ledgerRes = await fetch("/api/member/ledger", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ua_session") || ""}`,
        },
      })
      const ledger = await ledgerRes.json()
      if (ledger.ok && ledger.userId) {
        const assetRes = await fetch("/api/nft/my-assets?ownerId=" + encodeURIComponent(String(ledger.userId)))
        const assetJson = await assetRes.json()
        if (assetJson.ok) setAssets(assetJson.assets || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "NFT shareholder preview failed")
    }
  }

  const preview = filterNftPreview(listings)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-semibold text-gold">NFT shareholder</span>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Member book</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="mb-4 text-sm text-gold/80">Coming Soon. Read-only preview. Purchase stays 403. nft_marketplace_enabled stays false.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <h1 className="font-display text-3xl font-bold">Your Ubuntu NFT book</h1>
        <p className="mt-2 text-muted-foreground">{Array.isArray(assets) ? assets.length : 0} owned assets</p>
        <h2 className="mt-10 font-display text-2xl font-bold">Listing preview</h2>
        <ul className="mt-4 space-y-3">
          {preview.listings.map((row) => (
            <li key={row.id} className="rounded-xl border border-border bg-card p-4">
              {row.nftId} — ${row.price}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
