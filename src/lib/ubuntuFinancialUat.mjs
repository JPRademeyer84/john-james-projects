/** Ubuntu Afrique financial UAT. Dummy secret-admin create/record/confirm. Refuses Aureus. */
export const AUREUS_PROD_REF = "fgubaqoftdeefcakejwu"
export const UBUNTU_REF = "rbyipalrasawbjpsppgu"
export const FINANCIAL_UAT_REFUSED = "Refused. Ubuntu financial UAT will not connect to Aureus production."

export function assertUbuntuFinancialUatTarget(url) {
  const target = String(url || "")
  if (!target) throw new Error("Ubuntu Afrique financial UAT target is required")
  if (target.includes(AUREUS_PROD_REF) || target.includes("fgubaqoftdeefcakejwu")) {
    throw new Error(FINANCIAL_UAT_REFUSED)
  }
  return target
}

export function planUbuntuFinancialUat(url) {
  const target = assertUbuntuFinancialUatTarget(url)
  return {
    target,
    checkoutEnabled: false,
    nftMarketplaceEnabled: false,
    withDataFromProduction: false,
    writesFinancialRows: true,
    dummyOnly: true,
    steps: [
      "Refuse Aureus production",
      "Seed Ubuntu price versions if missing",
      "Insert dummy Ubuntu user",
      "Secret-admin create pending CARD or FRACTION",
      "Secret-admin record UA_STAGING payment",
      "Secret-admin confirm payment",
      "Leave public checkout closed",
      "Do not flip feature flags",
    ],
  }
}