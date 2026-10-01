import { formatMoney2, parseMoney, percentOf } from "./money.mjs"

export const CARD_PRODUCTS = {
  CARD_PLASTIC: {
    productType: "CARD_PLASTIC",
    name: "Aureus Plastic Card",
    retailPrice: "100.00",
    cost: "55.00",
    qv: "100.00",
    gapMaxPercent: "25",
    blpPercent: "5",
  },
  CARD_METAL: {
    productType: "CARD_METAL",
    name: "Aureus Metal Card",
    retailPrice: "150.00",
    cost: "75.00",
    qv: "150.00",
    gapMaxPercent: "25",
    blpPercent: "5",
  },
}

export function quoteCard(productType, quantity = 1) {
  const product = CARD_PRODUCTS[productType]
  if (!product) {
    throw new Error(`Unknown card product: ${productType}`)
  }
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error("quantity must be a positive integer")
  }

  const retail = parseMoney(product.retailPrice)
  const cost = parseMoney(product.cost)
  const gap = percentOf(retail, product.gapMaxPercent)
  const blp = percentOf(retail, product.blpPercent)
  const gross = retail - cost - gap - blp
  const qv = parseMoney(product.qv)

  return {
    productType: product.productType,
    name: product.name,
    quantity: qty,
    unit: {
      retailPrice: formatMoney2(retail),
      cost: formatMoney2(cost),
      gap: formatMoney2(gap),
      blp: formatMoney2(blp),
      ubuntuAfriqueGross: formatMoney2(gross),
      qv: formatMoney2(qv),
    },
    totals: {
      retailPrice: formatMoney2(retail * BigInt(qty)),
      cost: formatMoney2(cost * BigInt(qty)),
      gap: formatMoney2(gap * BigInt(qty)),
      blp: formatMoney2(blp * BigInt(qty)),
      ubuntuAfriqueGross: formatMoney2(gross * BigInt(qty)),
      qv: formatMoney2(qv * BigInt(qty)),
    },
  }
}

export function listCardProducts() {
  return Object.keys(CARD_PRODUCTS).map((type) => quoteCard(type, 1))
}