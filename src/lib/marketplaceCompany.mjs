function requiredText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(field + " is required")
  }
  return value.trim()
}

export function createMarketplaceCompany(input) {
  const id = requiredText(input?.id, "id")
  const name = requiredText(input?.name, "name")
  const settlementWallet = String(input?.settlementWallet || "").trim()
  const isActive = input?.isActive == null ? true : input.isActive === true
  return {
    id,
    name,
    settlementWallet,
    isActive,
    checkoutEnabled: false,
  }
}

export function assertCompanyActive(company) {
  if (!company || company.isActive !== true) {
    throw new Error("Marketplace company is not active")
  }
}