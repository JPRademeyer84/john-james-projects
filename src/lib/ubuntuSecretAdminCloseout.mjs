/** Ubuntu Afrique Wave H secret-admin closeout. Refuses Aureus. Does not open checkout. */
export const AUREUS_PROD_REF = "fgubaqoftdeefcakejwu"
export const UBUNTU_REF = "rbyipalrasawbjpsppgu"
export const CLOSEOUT_REFUSED = "Refused. Ubuntu secret-admin closeout will not connect to Aureus production."
export const REQUIRED_PRICE_PRODUCTS = ["CARD_PLASTIC", "CARD_METAL", "AUREUS_FRACTION"]

export function assertUbuntuCloseoutTarget(url) {
  const target = String(url || "")
  if (!target) throw new Error("Ubuntu Afrique secret-admin closeout target is required")
  if (target.includes(AUREUS_PROD_REF) || target.includes("fgubaqoftdeefcakejwu")) {
    throw new Error(CLOSEOUT_REFUSED)
  }
  return target
}

export function planUbuntuSecretAdminCloseout(url) {
  const target = assertUbuntuCloseoutTarget(url)
  return {
    target,
    checkoutEnabled: false,
    marketplaceEnabled: false,
    nftMarketplaceEnabled: false,
    withDataFromProduction: false,
    writesFinancialRows: true,
    dummyOnly: true,
    requiredPriceProducts: REQUIRED_PRICE_PRODUCTS,
    steps: [
      "Refuse Aureus production",
      "Verify or apply 0008 price versions",
      "Secret-admin remit a paid dummy fraction via persistLiabilityRemitted",
      "Secret-admin marketplace dummy settle $100 / Gap $25",
      "Leave public checkout closed",
      "Do not flip marketplace or nft flags",
    ],
  }
}

export function assertCloseoutFlags(flags) {
  const off = [
    "marketplace_enabled",
    "nft_assets_enabled",
    "nft_listing_enabled",
    "nft_marketplace_enabled",
  ]
  const missing = off.filter((key) => String(flags?.[key] ?? "") !== "false")
  if (missing.length) {
    throw new Error("Closeout flags must stay false: " + missing.join(", "))
  }
  return true
}

export function assertMarketplaceDummySettle(result) {
  if (!result || result.checkoutEnabled !== false) {
    throw new Error("Marketplace dummy settle must keep checkoutEnabled false")
  }
  if (String(result.retailPrice) !== "100.00") {
    throw new Error("Marketplace dummy settle must be $100.00")
  }
  if (String(result.gapCover?.totalPaid) !== "25.00") {
    throw new Error("Marketplace dummy settle must reconcile Gap $25.00")
  }
  if (String(result.gapCover?.compPlanVersion) !== "GAP_COVER_V1") {
    throw new Error("Marketplace dummy settle must use GAP_COVER_V1")
  }
  return true
}

export function assertReservedNotRemitted(summary) {
  if (!summary) throw new Error("Liability summary is required")
  if (summary.reservedEqualsRemitted === true) {
    throw new Error("Reserved does not mean remitted")
  }
  return true
}

export function assertRequiredPriceVersions(productIds) {
  const have = new Set((productIds || []).map((id) => String(id)))
  const missing = REQUIRED_PRICE_PRODUCTS.filter((id) => !have.has(id))
  if (missing.length) {
    throw new Error("0008 price versions missing: " + missing.join(", "))
  }
  return true
}
