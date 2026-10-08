/** NFT financial + ownership reconciliation. Staging only. */
import { addMoney, formatMoney2, parseMoney } from "./money.mjs"
import { quoteNftDistribution } from "./nftDistribution.mjs"

export function reconNftSale({ price, allocations } = {}) {
  const quote = quoteNftDistribution(price)
  if (!Array.isArray(allocations) || allocations.length === 0) {
    throw new Error("NFT recon requires allocations")
  }
  const total = allocations.reduce((sum, row) => addMoney(sum, parseMoney(row.amount)), 0n)
  if (total !== parseMoney(quote.price)) {
    throw new Error("NFT allocation checksum is not 100%")
  }
  const byBucket = Object.fromEntries(allocations.map((row) => [row.bucket, row.amount]))
  if (byBucket.AUREUS !== quote.aureus || byBucket.SUN !== quote.sun) {
    throw new Error("NFT platform buckets do not match 5/5")
  }
  if (byBucket.NETWORK_GAP !== quote.networkGap || byBucket.CURRENT_SELLER !== quote.currentSeller) {
    throw new Error("NFT seller/gap buckets do not match 80/5")
  }
  return {
    ok: true,
    checksum: "100.00",
    price: quote.price,
    nftMarketplaceEnabled: false,
    checkoutEnabled: false,
  }
}

export function reconNftOwnership({ asset, history } = {}) {
  if (!asset?.id) throw new Error("NFT asset is required")
  const rows = Array.isArray(history) ? history.filter((row) => row.nftId === asset.id) : []
  if (rows.length === 0) {
    if (asset.originalSellerId) throw new Error("Original seller set without ownership history")
    return { ok: true, transfers: 0, currentOwnerId: asset.currentOwnerId, originalSellerId: null }
  }
  const first = rows[0]
  const last = rows[rows.length - 1]
  if (last.toOwnerId !== asset.currentOwnerId) {
    throw new Error("NFT current owner does not match last transfer")
  }
  const original = first.originalSellerId || first.fromOwnerId
  if (asset.originalSellerId && asset.originalSellerId !== original) {
    throw new Error("Original seller changed after first resale")
  }
  for (const row of rows) {
    if (row.originalSellerId && row.originalSellerId !== original) {
      throw new Error("Original seller changed after first resale")
    }
  }
  return {
    ok: true,
    transfers: rows.length,
    currentOwnerId: asset.currentOwnerId,
    originalSellerId: asset.originalSellerId || original,
    nftMarketplaceEnabled: false,
    checkoutEnabled: false,
  }
}

export function reconNftStore(store) {
  const sales = [...store.sales.values()].filter((sale) => sale.status === "TRANSFERRED")
  for (const sale of sales) {
    const settled = store.salesByPayment.get(sale.paymentId)
    if (!settled?.distribution) throw new Error("Transferred NFT sale is missing distribution")
    reconNftSale({ price: sale.price, allocations: settled.distribution.allocations })
    reconNftOwnership({
      asset: store.assets.get(sale.nftId),
      history: store.history,
    })
  }
  return {
    ok: true,
    sales: sales.length,
    checksum: sales.length ? "100.00" : formatMoney2(0n),
    nftMarketplaceEnabled: false,
    checkoutEnabled: false,
  }
}
