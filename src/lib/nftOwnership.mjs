/** NFT ownership, listing lock, and idempotent staging purchase. */

export function createNftStore() {
  return {
    assets: new Map(),
    listings: new Map(),
    sales: new Map(),
    salesByPayment: new Map(),
    history: [],
    qv: [],
    wallet: [],
    commissions: [],
    payments: [],
  }
}

function required(value, field) {
  const text = String(value || "").trim()
  if (!text) throw new Error(field + " is required")
  return text
}

export function createNftAsset(store, input) {
  const id = required(input?.id, "id")
  if (store.assets.has(id)) throw new Error("NFT already exists")
  const asset = {
    id,
    currentOwnerId: required(input.ownerId, "ownerId"),
    originalSellerId: null,
    resaleCount: 0,
    status: "OWNED",
  }
  store.assets.set(id, asset)
  return { ...asset, nftMarketplaceEnabled: false, checkoutEnabled: false }
}

export function createNftListing(store, input) {
  const nftId = required(input?.nftId, "nftId")
  const asset = store.assets.get(nftId)
  if (!asset) throw new Error("NFT not found")
  const sellerId = required(input.sellerId, "sellerId")
  if (asset.currentOwnerId !== sellerId) throw new Error("Seller does not own this NFT")
  if (asset.status === "LISTED" || asset.status === "RESERVED") {
    throw new Error("NFT listing is unavailable")
  }
  const id = required(input.id || `LIST-${nftId}`, "id")
  if (store.listings.has(id)) throw new Error("Listing already exists")
  const listing = {
    id,
    nftId,
    sellerId,
    price: String(input.price),
    sponsorId: input.sponsorId == null ? "" : String(input.sponsorId),
    status: "LISTED",
  }
  store.listings.set(id, listing)
  asset.status = "LISTED"
  return { ...listing, nftMarketplaceEnabled: false, checkoutEnabled: false }
}

export function purchaseNftListing(store, input) {
  const paymentId = required(input?.paymentId, "paymentId")
  const existing = store.salesByPayment.get(paymentId)
  if (existing) {
    return { ...existing, idempotent: true, checkoutEnabled: false, nftMarketplaceEnabled: false }
  }

  const listingId = required(input.listingId, "listingId")
  const listing = store.listings.get(listingId)
  if (!listing || listing.status !== "LISTED") {
    throw new Error("NFT listing is unavailable")
  }
  const asset = store.assets.get(listing.nftId)
  if (!asset || asset.currentOwnerId !== listing.sellerId) {
    throw new Error("NFT listing is unavailable")
  }
  const buyerId = required(input.buyerId, "buyerId")
  if (buyerId === listing.sellerId) throw new Error("Buyer cannot purchase their own NFT")

  listing.status = "LOCKED"
  asset.status = "RESERVED"

  const saleId = `SALE-${paymentId}`
  const sale = {
    id: saleId,
    nftId: listing.nftId,
    listingId,
    paymentId,
    sellerId: listing.sellerId,
    buyerId,
    price: listing.price,
    resaleCount: asset.resaleCount,
    originalSellerIdBefore: asset.originalSellerId,
    sponsorId: listing.sponsorId || input.sponsorId,
    status: "PAYMENT_CONFIRMED",
  }
  store.sales.set(saleId, sale)
  store.salesByPayment.set(paymentId, {
    sale,
    counts: {
      paymentSettlements: 1,
      orders: 1,
      commissions: 1,
      qvTransactions: 1,
      ownershipTransactions: 1,
      walletSettlements: 1,
    },
  })
  store.payments.push({ paymentId, saleId })
  return store.salesByPayment.get(paymentId)
}

export function transferNftSale(store, saleResult, distribution) {
  const sale = store.sales.get(saleResult.sale.id)
  const listing = store.listings.get(sale.listingId)
  const asset = store.assets.get(sale.nftId)
  if (!sale || !listing || !asset) throw new Error("NFT sale is unavailable")
  if (listing.status === "SOLD") {
    return { ...store.salesByPayment.get(sale.paymentId), idempotent: true }
  }
  if (listing.status !== "LOCKED") throw new Error("NFT listing is unavailable")

  const originalSellerId = distribution.originalSellerId
  asset.originalSellerId = originalSellerId
  asset.currentOwnerId = sale.buyerId
  asset.resaleCount += 1
  asset.status = "OWNED"
  listing.status = "SOLD"
  sale.status = "TRANSFERRED"
  sale.originalSellerId = originalSellerId
  sale.specialKind = distribution.specialKind

  store.history.push({
    nftId: asset.id,
    fromOwnerId: sale.sellerId,
    toOwnerId: sale.buyerId,
    saleId: sale.id,
    originalSellerId,
  })
  store.commissions.push({ saleId: sale.id, allocations: distribution.allocations })
  store.qv.push({ saleId: sale.id, qv: distribution.networkGap })
  store.wallet.push({ saleId: sale.id, amount: distribution.currentSeller })

  const settled = {
    sale: { ...sale },
    asset: { ...asset },
    distribution,
    counts: {
      paymentSettlements: 1,
      orders: 1,
      commissions: 1,
      qvTransactions: 1,
      ownershipTransactions: 1,
      walletSettlements: 1,
    },
    checkoutEnabled: false,
    nftMarketplaceEnabled: false,
  }
  store.salesByPayment.set(sale.paymentId, settled)
  return settled
}

export function settleNftPurchase(store, input, distribute) {
  const purchased = purchaseNftListing(store, input)
  if (purchased.idempotent && purchased.asset) return purchased
  const listing = store.listings.get(purchased.sale.listingId)
  const asset = store.assets.get(purchased.sale.nftId)
  const distribution = distribute({
    price: listing.price,
    resaleCount: purchased.sale.resaleCount,
    sponsorId: listing.sponsorId || input.sponsorId,
    originalSellerId: asset.originalSellerId,
    sellerId: listing.sellerId,
    members: input.members,
  })
  return transferNftSale(store, purchased, distribution)
}
