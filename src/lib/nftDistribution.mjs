/** NFT 5/5/5/5/80. Network Gap uses shared STANDARD_25 scaled 5/25. */
import { processGapCover } from "./gapCover.mjs"
import { addMoney, formatMoney2, parseMoney, percentOf } from "./money.mjs"

export const NFT_SPLIT = Object.freeze({
  aureus: "5",
  sun: "5",
  special: "5",
  networkGap: "5",
  currentSeller: "80",
})

export const NFT_STANDARD_MAX = "25"
export const AUREUS_SHARE_SOLD_GATE = 1_400_000
export const NFT_PRODUCTION_DISABLED =
  "NFT production trading is disabled until 1,400,000 Aureus shares are sold"

export function nftProductionTradingAllowed({ nftMarketplaceEnabled, aureusSharesSold } = {}) {
  return nftMarketplaceEnabled === true && Number(aureusSharesSold) >= AUREUS_SHARE_SOLD_GATE
}

export function assertNftStagingOnly(input = {}) {
  if (input.staging === true) return
  if (nftProductionTradingAllowed(input)) return
  throw new Error(NFT_PRODUCTION_DISABLED)
}

export function specialRecipient({ resaleCount, originalSellerId, sponsorId }) {
  const firstResale = Number(resaleCount || 0) === 0 || !originalSellerId
  if (firstResale) {
    return { kind: "SPONSOR", recipientId: String(sponsorId || ""), firstResale: true }
  }
  return { kind: "ORIGINAL_SELLER", recipientId: String(originalSellerId), firstResale: false }
}

export function nextOriginalSellerId({ originalSellerId, sellerId }) {
  return String(originalSellerId || sellerId || "")
}

export function quoteNftDistribution(price) {
  const sale = parseMoney(price)
  if (sale <= 0n) throw new Error("NFT price must be greater than zero")
  const aureus = percentOf(sale, NFT_SPLIT.aureus)
  const sun = percentOf(sale, NFT_SPLIT.sun)
  const special = percentOf(sale, NFT_SPLIT.special)
  const networkGap = percentOf(sale, NFT_SPLIT.networkGap)
  const currentSeller = percentOf(sale, NFT_SPLIT.currentSeller)
  const total = aureus + sun + special + networkGap + currentSeller
  if (total !== sale) {
    throw new Error("NFT allocation checksum is not 100%")
  }
  return {
    price: formatMoney2(sale),
    aureus: formatMoney2(aureus),
    sun: formatMoney2(sun),
    special: formatMoney2(special),
    networkGap: formatMoney2(networkGap),
    currentSeller: formatMoney2(currentSeller),
    checksum: "100.00",
    nftMarketplaceEnabled: false,
    checkoutEnabled: false,
  }
}

export function gapCommissionableValue(price) {
  const sale = parseMoney(price)
  return formatMoney2((sale * parseMoney(NFT_SPLIT.networkGap)) / parseMoney(NFT_STANDARD_MAX))
}

export function distributeNftSale({
  price,
  resaleCount = 0,
  sponsorId,
  originalSellerId,
  sellerId,
  members,
} = {}) {
  const quote = quoteNftDistribution(price)
  const special = specialRecipient({ resaleCount, originalSellerId, sponsorId })
  if (!special.recipientId) {
    throw new Error(special.kind === "SPONSOR" ? "sponsorId is required" : "originalSellerId is required")
  }
  const gapCover = processGapCover({
    commissionableValue: gapCommissionableValue(price),
    members: members || [],
    scheduleId: "STANDARD_25",
  })
  const gapPaid = parseMoney(gapCover.totalPaid)
  const gapUnclaimed = parseMoney(gapCover.unclaimedGap)
  const gapBucket = gapPaid + gapUnclaimed
  if (gapBucket !== parseMoney(quote.networkGap)) {
    throw new Error("NFT Network Gap checksum is not 5%")
  }

  const allocations = [
    { bucket: "AUREUS", recipientId: "AUREUS", amount: quote.aureus },
    { bucket: "SUN", recipientId: "SUN", amount: quote.sun },
    { bucket: special.kind, recipientId: special.recipientId, amount: quote.special },
    { bucket: "NETWORK_GAP", recipientId: "UBUNTU_AFRIQUE", amount: quote.networkGap },
    { bucket: "CURRENT_SELLER", recipientId: String(sellerId || ""), amount: quote.currentSeller },
  ]
  if (!allocations[4].recipientId) throw new Error("sellerId is required")

  const checksumTotal = allocations.reduce((sum, row) => addMoney(sum, parseMoney(row.amount)), 0n)
  if (checksumTotal !== parseMoney(quote.price)) {
    throw new Error("NFT allocation checksum is not 100%")
  }

  return {
    ...quote,
    specialKind: special.kind,
    specialRecipientId: special.recipientId,
    firstResale: special.firstResale,
    originalSellerId: nextOriginalSellerId({ originalSellerId, sellerId }),
    gapCover,
    allocations,
    nftMarketplaceEnabled: false,
    checkoutEnabled: false,
  }
}
