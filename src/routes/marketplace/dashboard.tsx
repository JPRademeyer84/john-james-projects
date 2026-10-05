import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { filterMarketplaceCatalog } from "../../lib/ubuntuCatalog.mjs"

export const Route = createFileRoute("/marketplace/dashboard")({
  component: MarketplaceDashboardPage,
})

function MarketplaceDashboardPage() {
  const [companies, setCompanies] = useState<unknown[]>([])
  const [products, setProducts] = useState<unknown[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    void loadCatalog()
  }, [])

  async function loadCatalog() {
    try {
      const [companyRes, productRes] = await Promise.all([
        fetch("/api/marketplace/companies"),
        fetch("/api/marketplace/products"),
      ])
      const companyJson = await companyRes.json()
      const productJson = await productRes.json()
      if (companyJson.ok) setCompanies(companyJson.companies || [])
      if (productJson.ok) setProducts(productJson.products || [])
      if (!companyJson.ok) setError(companyJson.error || "Company dashboard failed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Company dashboard failed")
    }
  }

  const catalog = filterMarketplaceCatalog({ companies, products })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-semibold text-gold">Company dashboard</span>
          <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">Catalog</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="mb-4 text-sm text-gold/80">Coming Soon. No affiliate leak. Checkout closed.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <h1 className="font-display text-3xl font-bold">Ubuntu companies</h1>
        <ul className="mt-6 space-y-3">
          {catalog.companies.map((company) => (
            <li key={company.id} className="rounded-xl border border-border bg-card p-4">
              {company.name}
              <span className="ml-3 text-sm text-muted-foreground">
                {catalog.products.filter((row) => row.companyId === company.id).length} products
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
