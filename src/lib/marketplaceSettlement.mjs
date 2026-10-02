/** Marketplace settlement uses shared Gap Cover STANDARD_25 only. */
import { processGapCover } from "./gapCover.mjs"
import { compareMoney, formatMoney2, parseMoney } from "./money.mjs"
import { assertCompanyActive } from "./marketplaceCompany.mjs"

const SHARED_GAP = "STANDARD_25"
const SHARED_GAP_ERROR = "Marketplace uses shared Gap Cover STANDARD_25 only"

export function quoteMarketplaceProduct(input) {
  const productId = String(input?.productId || "").trim()
  if (!productId) throw new Error("productId is required")
  if (input?.gapSchedule !== SHARED_GAP) {
    throw new Error(SHARED_GAP_ERROR)
  }
  if (input?.companyPayout == null || String(input.companyPayout).trim() === "") {
    throw new Error("companyPayout is required")
  }
  const retailPrice = formatMoney2(parseMoney(input?.retailPrice))
  const companyPayout = formatMoney2(parseMoney(input.companyPayout))
  const commissionableValue = formatMoney2(parseMoney(input?.commissionableValue || input?.retailPrice))
  const qv = formatMoney2(parseMoney(input?.qv || commissionableValue))
  if (parseMoney(companyPayout) < 0n) {
    throw new Error("companyPayout cannot be negative")
  }
  if (compareMoney(parseMoney(companyPayout), parseMoney(retailPrice)) >= 0) {
    throw new Error("companyPayout must be less than retailPrice")
  }
  return {
    productId,
    retailPrice,
    companyPayout,
    commissionableValue,
    qv,
    gapSchedule: SHARED_GAP,
    checkoutEnabled: false,
  }
}

export function settleMarketplaceOrder({ order, members, company }) {
  if (!order || !order.id) throw new Error("order is required")
  if (order.gapSchedule && order.gapSchedule !== SHARED_GAP) {
    throw new Error(SHARED_GAP_ERROR)
  }
  assertCompanyActive(company)
  const commissionableValue = order.commissionableValue || order.total
  const gapCover = processGapCover({
    commissionableValue,
    members,
    scheduleId: SHARED_GAP,
  })
  return {
    status: "SETTLED",
    orderId: String(order.id),
    gapCover,
    companyPayout: formatMoney2(parseMoney(order.companyPayout || company?.payout || "0.00")),
    checkoutEnabled: false,
  }
}
