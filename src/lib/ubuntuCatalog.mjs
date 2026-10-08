/** Ubuntu Afrique catalog pages. Flags stay off. Purchase stays closed. No affiliate leak. */

const AFFILIATE_KEYS = [
  "sponsorId",
  "sponsor_id",
  "affiliate",
  "affiliateCode",
  "settlementWallet",
  "settlement_wallet",
  "rank",
  "members",
]

export function catalogFlags(input) {
  return {
    marketplaceEnabled: input?.marketplaceEnabled === true,
    nftMarketplaceEnabled: input?.nftMarketplaceEnabled === true,
    checkoutEnabled: false,
    comingSoon: input?.marketplaceEnabled !== true || input?.nftMarketplaceEnabled !== true,
    purchaseOpen: false,
  }
}

export function companySlug(company) {
  return String(company?.id || company?.slug || "").trim()
}

export function publicCompanyCard(company) {
  if (!company) return null
  return {
    id: String(company.id),
    slug: companySlug(company),
    name: String(company.name || company.id),
    isActive: company.isActive === true,
    checkoutEnabled: false,
  }
}

export function publicProductCard(product) {
  if (!product) return null
  return {
    productId: String(product.productId || product.id || ""),
    companyId: String(product.companyId || ""),
    name: String(product.name || product.productId || ""),
    retailPrice: String(product.retailPrice || "0"),
    checkoutEnabled: false,
  }
}

export function publicNftListingCard(listing) {
  if (!listing) return null
  return {
    id: String(listing.id),
    nftId: String(listing.nftId || ""),
    price: String(listing.price || "0"),
    status: String(listing.status || ""),
    checkoutEnabled: false,
    nftMarketplaceEnabled: false,
  }
}

export function assertNoAffiliateLeak(row) {
  if (!row || typeof row !== "object") return true
  for (const key of AFFILIATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      throw new Error("Affiliate fields are not shown on Ubuntu catalog pages")
    }
  }
  return true
}

export function filterMarketplaceCatalog({ companies, products, query, slug } = {}) {
  const needle = String(query || "").trim().toLowerCase()
  const companyCards = (companies || []).map(publicCompanyCard).filter(Boolean)
  const productCards = (products || []).map(publicProductCard).filter(Boolean)
  const wantedSlug = String(slug || "").trim()
  const bySlug = wantedSlug
    ? companyCards.filter((row) => row.slug === wantedSlug)
    : companyCards
  const visibleCompanies = needle
    ? bySlug.filter((row) => row.name.toLowerCase().includes(needle) || row.id.toLowerCase().includes(needle))
    : bySlug
  const visibleCompanyIds = new Set(visibleCompanies.map((row) => row.id))
  const visibleProducts = productCards.filter((row) => {
    if (wantedSlug && !visibleCompanyIds.has(row.companyId)) return false
    if (!needle) return !wantedSlug || visibleCompanyIds.has(row.companyId)
    return (
      row.name.toLowerCase().includes(needle) ||
      row.productId.toLowerCase().includes(needle) ||
      visibleCompanyIds.has(row.companyId)
    )
  })
  visibleCompanies.forEach(assertNoAffiliateLeak)
  visibleProducts.forEach(assertNoAffiliateLeak)
  return {
    companies: visibleCompanies,
    products: visibleProducts,
    checkoutEnabled: false,
    marketplaceEnabled: false,
    comingSoon: true,
  }
}

export function filterNftPreview(listings) {
  const cards = (listings || []).map(publicNftListingCard).filter(Boolean)
  cards.forEach(assertNoAffiliateLeak)
  return {
    listings: cards,
    checkoutEnabled: false,
    nftMarketplaceEnabled: false,
    comingSoon: true,
    purchaseOpen: false,
  }
}
