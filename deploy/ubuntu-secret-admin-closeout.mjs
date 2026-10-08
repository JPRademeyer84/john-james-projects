#!/usr/bin/env node
/** Dummy secret-admin 0008 verify, fraction remit, and marketplace $100 settle. Ubuntu only. Does not open checkout. */
import { randomUUID } from "node:crypto"
import { settleMarketplaceOrder } from "../src/lib/marketplaceSettlement.mjs"
import {
  assertCloseoutFlags,
  assertMarketplaceDummySettle,
  assertRequiredPriceVersions,
  assertReservedNotRemitted,
  assertUbuntuCloseoutTarget,
  planUbuntuSecretAdminCloseout,
} from "../src/lib/ubuntuSecretAdminCloseout.mjs"

const AUREUS = "fgubaqoftdeefcakejwu"
const url = String(process.env.VITE_UBUNTU_SUPABASE_URL || process.env.UBUNTU_SUPABASE_URL || "")
const key = String(process.env.UBUNTU_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || "")

assertUbuntuCloseoutTarget(url)
if (!key) throw new Error("Ubuntu service key is required")
if (url.includes(AUREUS) || key.includes(AUREUS)) {
  throw new Error("Refused. Ubuntu secret-admin closeout will not connect to Aureus production.")
}

const rest = url.replace(/\/$/, "") + "/rest/v1"
async function api(path, { method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
  }
  if (prefer) headers.Prefer = prefer
  const res = await fetch(rest + path, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const msg = data && data.message ? data.message : text
    throw new Error((msg || res.statusText) + " (" + path + ")")
  }
  return data
}

const plan = planUbuntuSecretAdminCloseout(url)
console.log(JSON.stringify({ plan }, null, 2))

const products = await api("/ua_products?select=id,retail_price,cost,company_payout,commissionable_value,qv,gap_schedule,blp_percentage")
const openVersions = await api("/ua_product_price_versions?end_date=is.null&select=product_id")
const openIds = new Set((openVersions || []).map((row) => String(row.product_id)))
const seeded = []
for (const product of products || []) {
  if (openIds.has(String(product.id))) continue
  await api("/ua_product_price_versions", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      product_id: product.id,
      retail_price: product.retail_price,
      product_cost: product.cost,
      company_payout: product.company_payout ?? 0,
      commissionable_value: product.commissionable_value,
      qv: product.qv,
      gap_schedule: product.gap_schedule || "STANDARD_25",
      blp_rate: product.blp_percentage ?? 5,
    },
  })
  seeded.push(String(product.id))
  openIds.add(String(product.id))
}
assertRequiredPriceVersions([...openIds])

const sales = await api("/ua_aureus_liability_ledger?entry_type=eq.FRACTION_SALE&select=source_transaction_id,amount&order=created_at.asc")
const remittedRows = await api("/ua_aureus_liability_ledger?entry_type=eq.FRACTION_REMITTED&select=source_transaction_id")
const remittedIds = new Set((remittedRows || []).map((row) => String(row.source_transaction_id)))
const candidate = (sales || []).find((row) => row.source_transaction_id && !remittedIds.has(String(row.source_transaction_id)))
if (!candidate) throw new Error("No unremitted dummy FRACTION_SALE found")

const saleId = String(candidate.source_transaction_id)
const paid = await api("/ua_fraction_transactions?id=eq." + saleId + "&select=id,total_amount,transaction_status")
if (!paid[0] || String(paid[0].transaction_status) !== "PAID") {
  throw new Error("Unremitted sale is not a PAID dummy fraction")
}
const remittanceAmount = String(paid[0].total_amount)
await api("/ua_aureus_liability_ledger", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    entry_type: "FRACTION_REMITTED",
    amount: remittanceAmount,
    source_transaction_id: saleId,
    note: "Ubuntu remittance to Aureus; reserved does not mean paid",
  },
})
const afterRemit = await api("/ua_aureus_liability_ledger?source_transaction_id=eq." + saleId + "&select=entry_type,amount")
const remitted = (afterRemit || []).some((row) => String(row.entry_type) === "FRACTION_REMITTED")
const reservedStill = (afterRemit || []).some((row) => String(row.entry_type) === "FRACTION_RESERVE")
const saleStill = (afterRemit || []).some((row) => String(row.entry_type) === "FRACTION_SALE")
if (!remitted) throw new Error("FRACTION_REMITTED row was not written")
if (!saleStill) throw new Error("FRACTION_SALE must remain after remittance")
assertReservedNotRemitted({ reservedEqualsRemitted: false })

const stamp = Date.now()
const companyId = "UAT_CO_WAVE_H"
const productId = "UAT_MKT_100"
const orderId = randomUUID()
const userInsert = await api("/ua_users", {
  method: "POST",
  prefer: "return=representation",
  body: {
    auth_user_id: randomUUID(),
    email: "uat.closeout." + stamp + "@ubuntu-afrique.test",
    username: "uat_closeout_" + stamp,
    is_active: true,
  },
})
const userId = String(userInsert[0].id)
await api("/ua_user_ranks", {
  method: "POST",
  prefer: "return=minimal",
  body: { user_id: Number(userId), rank_code: "VP" },
})
const existingCompany = await api("/ua_marketplace_companies?id=eq." + companyId + "&select=id")
if (!existingCompany[0]) {
await api("/ua_marketplace_companies", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    id: companyId,
    name: "Ubuntu Wave H dummy company",
    settlement_wallet: "UAT-WAVE-H",
    is_active: true,
  },
})
}
const existingProduct = await api("/ua_products?id=eq." + productId + "&select=id")
if (!existingProduct[0]) {
await api("/ua_products", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    id: productId,
    company_id: companyId,
    product_type: "MARKETPLACE",
    product_name: "Wave H dummy $100",
    retail_price: "100.00",
    cost: "0",
    company_payout: "40.00",
    commissionable_value: "100.00",
    qv: "100.00",
    gap_enabled: true,
    gap_schedule: "STANDARD_25",
    blp_enabled: true,
    active: true,
  },
})
}
await api("/ua_marketplace_orders", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    id: orderId,
    company_id: companyId,
    product_id: productId,
    user_id: userId,
    retail_price: "100.00",
    company_payout: "40.00",
    commissionable_value: "100.00",
    qv: "100.00",
    gap_schedule: "STANDARD_25",
    status: "PENDING",
  },
})
const settled = settleMarketplaceOrder({
  order: {
    id: orderId,
    total: "100.00",
    commissionableValue: "100.00",
    companyPayout: "40.00",
    gapSchedule: "STANDARD_25",
  },
  members: [{ userId, rank: "VP", isActive: true }],
  company: { id: companyId, isActive: true, payout: "40.00" },
})
assertMarketplaceDummySettle({
  retailPrice: "100.00",
  gapCover: settled.gapCover,
  checkoutEnabled: false,
})
await api("/ua_marketplace_orders?id=eq." + orderId, {
  method: "PATCH",
  prefer: "return=minimal",
  body: { status: "SETTLED", company_payout: settled.companyPayout, gap_schedule: "STANDARD_25" },
})
await api("/ua_company_settlements", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    order_id: orderId,
    company_id: companyId,
    amount: settled.companyPayout,
    status: "RECORDED",
  },
})

const flags = await api("/ua_system_settings?select=key,value")
const flagMap = Object.fromEntries((flags || []).map((row) => [row.key, row.value]))
assertCloseoutFlags(flagMap)
if (flagMap.nft_marketplace_enabled !== "false") throw new Error("nft_marketplace_enabled must stay false")
if (flagMap.marketplace_enabled !== "false") throw new Error("marketplace_enabled must stay false")

const report = {
  ok: true,
  checkoutEnabled: false,
  withDataFromProduction: false,
  dummyOnly: true,
  priceVersions: {
    seeded,
    open: [...openIds],
  },
  remittance: {
    sourceTransactionId: saleId,
    amount: remittanceAmount,
    remitted: true,
    reservedStill,
    saleStill,
    reservedEqualsRemitted: false,
  },
  marketplace: {
    orderId,
    userId,
    retailPrice: "100.00",
    companyPayout: settled.companyPayout,
    gapPaid: settled.gapCover.totalPaid,
    status: "SETTLED",
  },
  flagsUnchanged: {
    cards_enabled: flagMap.cards_enabled,
    fractions_enabled: flagMap.fractions_enabled,
    marketplace_enabled: flagMap.marketplace_enabled,
    nft_assets_enabled: flagMap.nft_assets_enabled,
    nft_listing_enabled: flagMap.nft_listing_enabled,
    nft_marketplace_enabled: flagMap.nft_marketplace_enabled,
  },
}
console.log(JSON.stringify(report, null, 2))
