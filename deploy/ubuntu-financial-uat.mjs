#!/usr/bin/env node
/** Dummy secret-admin CARD or FRACTION create/record/confirm on Ubuntu only. Does not open checkout. */
import { randomUUID } from "node:crypto"
import {
  applyPriceVersionSnapshot,
  createPendingCardOrder,
  createPendingFractionOrder,
  pendingCardInsert,
  pendingFractionInsert,
  confirmCommercePayment,
  orderFromCardRow,
  orderFromFractionRow,
} from "../src/lib/commerceOrders.mjs"
import { reserveUnderlyingInventory, convertReserveToSale } from "../src/lib/fractionEngine.mjs"
import { addMoney, formatMoney2, parseMoney } from "../src/lib/money.mjs"
import { recordPaymentEvent, assertPaymentCurrency, assertRecordedPaymentForConfirm } from "../src/lib/paymentAdapter.mjs"
import { assertUbuntuFinancialUatTarget, planUbuntuFinancialUat } from "../src/lib/ubuntuFinancialUat.mjs"

const AUREUS = "fgubaqoftdeefcakejwu"
const kind = String(process.argv[2] || "card").trim().toUpperCase() === "FRACTION" ? "FRACTION" : "CARD"
const url = String(process.env.VITE_UBUNTU_SUPABASE_URL || process.env.UBUNTU_SUPABASE_URL || "")
const key = String(process.env.UBUNTU_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || "")

assertUbuntuFinancialUatTarget(url)
if (!key) throw new Error("Ubuntu service key is required")
if (url.includes(AUREUS) || key.includes(AUREUS)) throw new Error("Refused. Ubuntu financial UAT will not connect to Aureus production.")

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

async function ensurePriceVersion(productId) {
  const existing = await api("/ua_product_price_versions?product_id=eq." + productId + "&end_date=is.null&select=id,product_id,retail_price,product_cost,commissionable_value,qv,gap_schedule,blp_rate&order=effective_date.desc&limit=1")
  if (Array.isArray(existing) && existing[0]) return existing[0]
  const products = await api("/ua_products?id=eq." + productId + "&select=id,retail_price,cost,company_payout,commissionable_value,qv,gap_schedule,blp_percentage")
  const product = products[0]
  if (!product) throw new Error(productId + " product missing")
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
  const seeded = await api("/ua_product_price_versions?product_id=eq." + productId + "&end_date=is.null&select=id,product_id,retail_price,product_cost,commissionable_value,qv,gap_schedule,blp_rate&order=effective_date.desc&limit=1")
  if (!seeded[0]) throw new Error("Ubuntu price version missing after seed")
  return seeded[0]
}

function mapVersion(row) {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    retailPrice: String(row.retail_price),
    productCost: String(row.product_cost),
    commissionableValue: String(row.commissionable_value),
    qv: String(row.qv),
    gapSchedule: String(row.gap_schedule || "STANDARD_25"),
    blpRate: String(row.blp_rate),
  }
}

const plan = planUbuntuFinancialUat(url)
console.log(JSON.stringify({ plan, kind }, null, 2))

const stamp = Date.now()
const inserted = await api("/ua_users", {
  method: "POST",
  prefer: "return=representation",
  body: {
    auth_user_id: randomUUID(),
    email: "uat.dummy." + stamp + "@ubuntu-afrique.test",
    username: "uat_dummy_" + stamp,
    is_active: true,
  },
})
const userId = String(inserted[0].id)
const orderId = randomUUID()
const paymentId = "UAT-PAY-" + stamp
assertPaymentCurrency("USD")

let pending
if (kind === "CARD") {
  const priceVersion = mapVersion(await ensurePriceVersion("CARD_PLASTIC"))
  pending = applyPriceVersionSnapshot(createPendingCardOrder({
    orderId,
    userId,
    productType: "CARD_PLASTIC",
    quantity: 1,
  }), priceVersion)
  await api("/ua_card_orders", { method: "POST", prefer: "return=minimal", body: pendingCardInsert(pending) })
} else {
  const priceVersion = mapVersion(await ensurePriceVersion("AUREUS_FRACTION"))
  const phases = await api("/ua_aureus_phases?active=eq.true&select=phase,aureus_share_price")
  const inventoryRows = await api("/ua_underlying_inventory?id=eq.AUREUS_100K&select=remaining_underlying,sold_underlying")
  if (!phases[0] || !inventoryRows[0]) throw new Error("Ubuntu phase or inventory missing")
  pending = applyPriceVersionSnapshot(createPendingFractionOrder({
    orderId,
    userId,
    quantity: 1,
    aureusSharePrice: String(phases[0].aureus_share_price),
    aureusPhase: Number(phases[0].phase),
    remainingUnderlying: String(inventoryRows[0].remaining_underlying),
  }), priceVersion)
  await api("/ua_fraction_transactions", { method: "POST", prefer: "return=minimal", body: pendingFractionInsert(pending) })
  const reserved = reserveUnderlyingInventory({
    remainingUnderlying: String(inventoryRows[0].remaining_underlying),
    reservedUnderlying: "0",
    underlyingShareEquivalent: pending.underlyingShareEquivalent,
  })
  await api("/ua_aureus_liability_ledger", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      entry_type: "FRACTION_RESERVE",
      amount: reserved.underlyingShareEquivalent,
      source_transaction_id: orderId,
      note: "Ubuntu fraction reserve; not remitted",
    },
  })
  const reservedUpdate = await api(
    "/ua_underlying_inventory?id=eq.AUREUS_100K&remaining_underlying=eq." + inventoryRows[0].remaining_underlying,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { remaining_underlying: reserved.remainingUnderlying, updated_at: new Date().toISOString() },
    }
  )
  if (!reservedUpdate || !reservedUpdate.length) throw new Error("Purchase exceeds remaining underlying share inventory")
}

const event = recordPaymentEvent({
  orderId,
  kind,
  paymentId,
  amount: pending.total,
  provider: "UA_STAGING",
  currency: "USD",
  order: { id: orderId, kind, total: pending.total },
})
await api("/ua_payment_events", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    payment_id: event.paymentId,
    order_id: event.orderId,
    kind: event.kind,
    amount: event.amount,
    provider: event.provider,
    status: "RECORDED",
  },
})

assertRecordedPaymentForConfirm({
  event: { paymentId, orderId, kind, amount: pending.total, status: "RECORDED" },
  order: { id: orderId, total: pending.total },
  paymentId,
  kind,
})

let confirmed
if (kind === "CARD") {
  const stored = await api("/ua_card_orders?id=eq." + orderId + "&select=*")
  confirmed = confirmCommercePayment({
    order: orderFromCardRow(stored[0]),
    paymentId,
    members: [],
    uplineUserIds: [userId],
  })
  await api("/ua_card_orders?id=eq." + orderId, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      order_status: "PAID",
      payment_id: paymentId,
      fulfilment_status: confirmed.fulfilmentStatus || "PROCESSING",
      fulfilment_at: new Date().toISOString(),
    },
  })
} else {
  const stored = await api("/ua_fraction_transactions?id=eq." + orderId + "&select=*")
  const inventoryNow = await api("/ua_underlying_inventory?id=eq.AUREUS_100K&select=remaining_underlying,sold_underlying")
  const reserve = await api("/ua_aureus_liability_ledger?source_transaction_id=eq." + orderId + "&entry_type=eq.FRACTION_RESERVE&select=amount")
  let remainingForRebuild = String(inventoryNow[0].remaining_underlying)
  if (reserve[0]?.amount != null) {
    remainingForRebuild = formatMoney2(addMoney(parseMoney(remainingForRebuild), parseMoney(String(reserve[0].amount))))
  }
  const rebuilt = orderFromFractionRow(stored[0], remainingForRebuild)
  rebuilt.soldUnderlying = String(inventoryNow[0].sold_underlying)
  confirmed = confirmCommercePayment({
    order: rebuilt,
    paymentId,
    members: [],
    uplineUserIds: [userId],
  })
  const next = convertReserveToSale({
    remainingUnderlying: String(inventoryNow[0].remaining_underlying),
    reservedUnderlying: String(reserve[0].amount),
    soldUnderlying: String(inventoryNow[0].sold_underlying),
    underlyingShareEquivalent: confirmed.ownership.underlyingShareEquivalent,
  })
  await api("/ua_aureus_liability_ledger", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      entry_type: "FRACTION_SALE",
      amount: next.underlyingShareEquivalent,
      source_transaction_id: orderId,
      note: "Ubuntu fraction confirm inventory consume",
    },
  })
  const soldUpdate = await api(
    "/ua_underlying_inventory?id=eq.AUREUS_100K&sold_underlying=eq." + inventoryNow[0].sold_underlying,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: { sold_underlying: next.soldUnderlying, updated_at: new Date().toISOString() },
    }
  )
  if (!soldUpdate || !soldUpdate.length) throw new Error("Underlying sold balance changed during confirm")
  await api("/ua_fraction_transactions?id=eq." + orderId, {
    method: "PATCH",
    prefer: "return=minimal",
    body: { transaction_status: "PAID", payment_id: paymentId },
  })
  await api("/ua_fraction_ownership", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      user_id: Number(userId),
      source_transaction_id: orderId,
      quantity: confirmed.quantity,
      aureus_phase: confirmed.aureusPhase,
      aureus_share_price: confirmed.aureusSharePrice,
      underlying_share_equivalent: confirmed.underlyingShareEquivalent,
    },
  })
}

await api("/ua_qv_transactions", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    user_id: userId,
    source_transaction_id: orderId,
    qv: confirmed.volume.qv,
  },
})

const flags = await api("/ua_system_settings?select=key,value")
const flagMap = Object.fromEntries((flags || []).map((row) => [row.key, row.value]))
if (flagMap.nft_marketplace_enabled !== "false") throw new Error("nft_marketplace_enabled must stay false")
if (flagMap.marketplace_enabled !== "false") throw new Error("marketplace_enabled must stay false")

const paid = kind === "CARD"
  ? await api("/ua_card_orders?id=eq." + orderId + "&select=id,order_status,payment_id,fulfilment_status,total")
  : await api("/ua_fraction_transactions?id=eq." + orderId + "&select=id,transaction_status,payment_id,total_amount,underlying_share_equivalent")
const status = kind === "CARD" ? paid[0].order_status : paid[0].transaction_status
const report = {
  ok: true,
  kind,
  checkoutEnabled: false,
  nftMarketplaceEnabled: false,
  withDataFromProduction: false,
  dummyUserId: userId,
  orderId,
  paymentId,
  total: pending.total,
  orderStatus: status,
  underlyingShareEquivalent: kind === "FRACTION" ? paid[0].underlying_share_equivalent : undefined,
  fulfilmentStatus: kind === "CARD" ? paid[0].fulfilment_status : undefined,
  gapUnclaimed: confirmed.gapCover.unclaimedGap,
  flagsUnchanged: {
    cards_enabled: flagMap.cards_enabled,
    fractions_enabled: flagMap.fractions_enabled,
    marketplace_enabled: flagMap.marketplace_enabled,
    nft_marketplace_enabled: flagMap.nft_marketplace_enabled,
  },
}
if (report.orderStatus !== "PAID") throw new Error("order did not confirm to PAID")
console.log(JSON.stringify(report, null, 2))