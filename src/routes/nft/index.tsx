import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { filterNftPreview } from "../../lib/ubuntuCatalog.mjs"

export const Route = createFileRoute("/nft/")({
  component: NftPreviewPage,
})

function NftPreviewPage() {
  const [listings, setListings] = useState<unknown[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    void loadListings()
  }, [])

  async function loadListings() {
    try {
      const res = await fetch("/api/nft/listings")
      const json = await res.json()
      if (json.ok) setListings(json.listings || [])
      else setError(json.error || "NFT listings failed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "NFT listings failed")
    }
  }

  const preview = filterNftPreview(listings)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-semibold text-gold">NFT listing preview</span>
          <div className="flex gap-6 text-sm">
            <Link to="/dashboard/nft" className="text-muted-foreground hover:text-foreground">Shareholder</Link>
            <Link to="/marketplace" className="text-muted-foreground hover:text-foreground">Marketplace</Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="mb-4 text-sm text-gold/80">Coming Soon. nft_marketplace_enabled stays false. Purchase stays 403.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <h1 className="font-display text-3xl font-bold">Listed NFTs</h1>
        <ul className="mt-6 space-y-3">
          {preview.listings.map((row) => (
            <li key={row.id} className="rounded-xl border border-border bg-card p-4">
              {row.nftId} — ${row.price} — {row.status}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
