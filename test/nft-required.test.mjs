import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { test } from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"

const projectRoot = fileURLToPath(new URL("..", import.meta.url))
const distributionPath = `${projectRoot}/src/lib/nftDistribution.mjs`
const ownershipPath = `${projectRoot}/src/lib/nftOwnership.mjs`
const reconPath = `${projectRoot}/src/lib/nftRecon.mjs`
const publicOrderPath = `${projectRoot}/src/routes/api/nft/order.ts`

const compressionMembers = [
  { userId: "ssa", rank: "SSA" },
  { userId: "bsm", rank: "BSM" },
  { userId: "vp", rank: "VP" },
]

async function loadDistribution() {
  return import(pathToFileURL(distributionPath).href)
}

async function loadOwnership() {
  return import(pathToFileURL(ownershipPath).href)
}

async function loadRecon() {
  return import(pathToFileURL(reconPath).href)
}

test(
  "139 first NFT resale $1000 is 50/50/50/50/800 to Sponsor",
  { skip: !existsSync(distributionPath) },
  async () => {
    const { distributeNftSale } = await loadDistribution()
    const result = distributeNftSale({
      price: "1000.00",
      resaleCount: 0,
      sponsorId: "SPONSOR",
      sellerId: "A",
      members: compressionMembers,
    })
    assert.equal(result.aureus, "50.00")
    assert.equal(result.sun, "50.00")
    assert.equal(result.special, "50.00")
    assert.equal(result.networkGap, "50.00")
    assert.equal(result.currentSeller, "800.00")
    assert.equal(result.specialKind, "SPONSOR")
    assert.equal(result.specialRecipientId, "SPONSOR")
    assert.equal(result.checksum, "100.00")
    assert.equal(result.checkoutEnabled, false)
    assert.equal(result.nftMarketplaceEnabled, false)
  }
)

test(
  "140 second NFT resale $1000 pays Original Seller not Sponsor",
  { skip: !existsSync(distributionPath) },
  async () => {
    const { distributeNftSale } = await loadDistribution()
    const result = distributeNftSale({
      price: "1000.00",
      resaleCount: 1,
      sponsorId: "SPONSOR",
      originalSellerId: "A",
      sellerId: "B",
      members: compressionMembers,
    })
    assert.equal(result.aureus, "50.00")
    assert.equal(result.sun, "50.00")
    assert.equal(result.special, "50.00")
    assert.equal(result.networkGap, "50.00")
    assert.equal(result.currentSeller, "800.00")
    assert.equal(result.specialKind, "ORIGINAL_SELLER")
    assert.equal(result.specialRecipientId, "A")
    assert.equal(result.originalSellerId, "A")
    assert.equal(result.checksum, "100.00")
  }
)

test(
  "141 original seller stays A after B and C resell",
  { skip: !existsSync(distributionPath) || !existsSync(ownershipPath) || !existsSync(reconPath) },
  async () => {
    const { distributeNftSale } = await loadDistribution()
    const { createNftStore, createNftAsset, createNftListing, settleNftPurchase } = await loadOwnership()
    const { reconNftOwnership } = await loadRecon()
    const store = createNftStore()
    createNftAsset(store, { id: "NFT-A", ownerId: "A" })
    createNftListing(store, { id: "L1", nftId: "NFT-A", sellerId: "A", sponsorId: "SPONSOR", price: "1000.00" })
    const first = settleNftPurchase(
      store,
      { listingId: "L1", buyerId: "B", paymentId: "P1", members: compressionMembers },
      distributeNftSale
    )
    assert.equal(first.asset.originalSellerId, "A")
    assert.equal(first.asset.currentOwnerId, "B")

    createNftListing(store, { id: "L2", nftId: "NFT-A", sellerId: "B", sponsorId: "SPONSOR", price: "1000.00" })
    const second = settleNftPurchase(
      store,
      { listingId: "L2", buyerId: "C", paymentId: "P2", members: compressionMembers },
      distributeNftSale
    )
    assert.equal(second.asset.originalSellerId, "A")
    assert.equal(second.distribution.specialKind, "ORIGINAL_SELLER")
    assert.notEqual(second.distribution.specialRecipientId, "B")

    createNftListing(store, { id: "L3", nftId: "NFT-A", sellerId: "C", sponsorId: "SPONSOR", price: "1000.00" })
    const third = settleNftPurchase(
      store,
      { listingId: "L3", buyerId: "D", paymentId: "P3", members: compressionMembers },
      distributeNftSale
    )
    assert.equal(third.asset.originalSellerId, "A")
    assert.notEqual(third.distribution.specialRecipientId, "C")
    const recon = reconNftOwnership({ asset: third.asset, history: store.history })
    assert.equal(recon.originalSellerId, "A")
    assert.equal(recon.currentOwnerId, "D")
  }
)

test(
  "142 NFT compression SSA to BSM to VP is 20 + 20 + 10",
  { skip: !existsSync(distributionPath) },
  async () => {
    const { distributeNftSale } = await loadDistribution()
    const result = distributeNftSale({
      price: "1000.00",
      resaleCount: 0,
      sponsorId: "SPONSOR",
      sellerId: "A",
      members: compressionMembers,
    })
    assert.equal(result.gapCover.totalPaid, "50.00")
    assert.equal(result.gapCover.payments[0].amount, "20.00")
    assert.equal(result.gapCover.payments[1].amount, "20.00")
    assert.equal(result.gapCover.payments[2].amount, "10.00")
    assert.equal(result.gapCover.compPlanVersion, "GAP_COVER_V1")
  }
)

test(
  "143 duplicate NFT payment event settles once",
  { skip: !existsSync(distributionPath) || !existsSync(ownershipPath) },
  async () => {
    const { distributeNftSale } = await loadDistribution()
    const { createNftStore, createNftAsset, createNftListing, settleNftPurchase } = await loadOwnership()
    const store = createNftStore()
    createNftAsset(store, { id: "NFT-DUP", ownerId: "A" })
    createNftListing(store, { id: "LDUP", nftId: "NFT-DUP", sellerId: "A", sponsorId: "SPONSOR", price: "1000.00" })
    const first = settleNftPurchase(
      store,
      { listingId: "LDUP", buyerId: "B", paymentId: "PAY-DUP", members: compressionMembers },
      distributeNftSale
    )
    const second = settleNftPurchase(
      store,
      { listingId: "LDUP", buyerId: "B", paymentId: "PAY-DUP", members: compressionMembers },
      distributeNftSale
    )
    const third = settleNftPurchase(
      store,
      { listingId: "LDUP", buyerId: "B", paymentId: "PAY-DUP", members: compressionMembers },
      distributeNftSale
    )
    assert.equal(first.counts.paymentSettlements, 1)
    assert.equal(first.counts.orders, 1)
    assert.equal(first.counts.commissions, 1)
    assert.equal(first.counts.qvTransactions, 1)
    assert.equal(first.counts.ownershipTransactions, 1)
    assert.equal(first.counts.walletSettlements, 1)
    assert.equal(second.idempotent, true)
    assert.equal(third.idempotent, true)
    assert.equal(store.sales.size, 1)
    assert.equal(store.history.length, 1)
    assert.equal(store.commissions.length, 1)
    assert.equal(store.qv.length, 1)
    assert.equal(store.wallet.length, 1)
    assert.equal(store.assets.get("NFT-DUP").currentOwnerId, "B")
  }
)

test(
  "144 double NFT purchase transfers once",
  { skip: !existsSync(distributionPath) || !existsSync(ownershipPath) },
  async () => {
    const { distributeNftSale } = await loadDistribution()
    const { createNftStore, createNftAsset, createNftListing, settleNftPurchase } = await loadOwnership()
    const store = createNftStore()
    createNftAsset(store, { id: "NFT-RACE", ownerId: "A" })
    createNftListing(store, { id: "LRACE", nftId: "NFT-RACE", sellerId: "A", sponsorId: "SPONSOR", price: "1000.00" })
    const first = settleNftPurchase(
      store,
      { listingId: "LRACE", buyerId: "B", paymentId: "PAY-B", members: compressionMembers },
      distributeNftSale
    )
    assert.equal(first.asset.currentOwnerId, "B")
    assert.throws(
      () =>
        settleNftPurchase(
          store,
          { listingId: "LRACE", buyerId: "C", paymentId: "PAY-C", members: compressionMembers },
          distributeNftSale
        ),
      /unavailable/
    )
    assert.equal(store.assets.get("NFT-RACE").currentOwnerId, "B")
    assert.equal(store.history.length, 1)
    assert.equal(store.commissions.length, 1)
  }
)

test(
  "139-144 public NFT order path stays closed",
  { skip: !existsSync(publicOrderPath) },
  () => {
    const source = readFileSync(publicOrderPath, "utf8")
    assert.match(source, /Public checkout is not open/)
    assert.match(source, /status: 403/)
    assert.match(source, /nftMarketplaceEnabled: false/)
    assert.doesNotMatch(source, /fgubaqoftdeefcakejwu/)
  }
)

test(
  "152 production NFT trading stays off below 1,400,000 shares",
  { skip: !existsSync(distributionPath) },
  async () => {
    const { nftProductionTradingAllowed, assertNftStagingOnly } = await loadDistribution()
    assert.equal(nftProductionTradingAllowed({ nftMarketplaceEnabled: false, aureusSharesSold: 1_400_000 }), false)
    assert.equal(nftProductionTradingAllowed({ nftMarketplaceEnabled: true, aureusSharesSold: 1_399_999 }), false)
    assert.throws(
      () => assertNftStagingOnly({ nftMarketplaceEnabled: false, aureusSharesSold: 1_400_000 }),
      /1,400,000/
    )
    assert.doesNotThrow(() => assertNftStagingOnly({ staging: true }))
  }
)
