/** Dummy public FRACTION checkout UAT on Ubuntu only. Pending only. Does not confirm or open other modules. */
import { randomUUID } from "node:crypto"
import {
  applyPriceVersionSnapshot,
  createPendingFractionOrder,
  pendingFractionInsert,
} from "../src/lib/commerceOrders.mjs"
import {
  NAMED_OPEN_SENTENCE,
  rejectPublicFractionClientOverrides,
  publicFractionOrderResponse,
} from "../src/lib/ubuntuPublicFractionCheckout.mjs"
import { formatMoney2, parseMoney } from "../src/lib/money.mjs"
import { AUREUS_PROD_REF, assertUbuntuFinancialUatTarget } from "../src/lib/ubuntuFinancialUat.mjs"

const url = String(process.env.VITE_UBUNTU_SUPABASE_URL || process.env.UBUNTU_SUPABASE_URL || "")
const key = String(process.env.UBUNTU_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || "")

assertUbuntuFinancialUatTarget(url)
if (!key) throw new Error("Ubuntu service key is required")
if (url.includes(AUREUS_PROD_REF) || key.includes(AUREUS_PROD_REF)) {
  throw new Error("Refused. Public FRACTION UAT will not connect to Aureus production.")
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
    throw new Error((msg || res.statusText) + " " + path)
  }
  return data
}

function flagMap(rows) {
  return Object.fromEntries((rows || []).map((row) => [String(row.key), String(row.value)]))
}

const flags = flagMap(await api("/ua_system_settings?select=key,value"))
for (const keyName of ["marketplace_enabled", "nft_assets_enabled", "nft_listing_enabled", "nft_marketplace_enabled"]) {
  if (String(flags[keyName] || "").toLowerCase() === "true") {
    throw new Error("Refused. " + keyName + " must stay false for FRACTION-only UAT")
  }
}

rejectPublicFractionClientOverrides({ quantity: 1 })

const stamp = Date.now()
const inserted = await api("/ua_users", {
  method: "POST",
  prefer: "return=representation",
  body: {
    auth_user_id: randomUUID(),
    email: "uat.public.fraction." + stamp + "@ubuntu-afrique.test",
    username: "ua_public_fraction_" + stamp,
    is_active: true,
  },
})
const userId = String(inserted[0].id)
const inventory = (await api("/ua_underlying_inventory?id=eq.AUREUS_100K&select=remaining_underlying"))[0]
const phase = (await api("/ua_aureus_phases?active=eq.true&select=phase,aureus_share_price"))[0]
const versions = await api("/ua_product_price_versions?product_id=eq.AUREUS_FRACTION&end_date=is.null&select=id,product_id,retail_price,product_cost,commissionable_value,qv,gap_schedule,blp_rate&order=effective_date.desc&limit=1")
if (!versions[0]) throw new Error("AUREUS_FRACTION price version missing")
const priceVersion = {
  id: String(versions[0].id),
  productId: String(versions[0].product_id),
  retailPrice: String(versions[0].retail_price),
  productCost: String(versions[0].product_cost),
  commissionableValue: String(versions[0].commissionable_value),
  qv: String(versions[0].qv),
  gapSchedule: String(versions[0].gap_schedule || "STANDARD_25"),
  blpRate: String(versions[0].blp_rate),
}

const order = applyPriceVersionSnapshot(createPendingFractionOrder({
  orderId: randomUUID(),
  userId,
  quantity: 1,
  aureusSharePrice: String(phase.aureus_share_price),
  aureusPhase: Number(phase.phase),
  remainingUnderlying: String(inventory.remaining_underlying),
  priceVersion: priceVersion.id,
}), priceVersion)
if (order.status !== "PENDING_PAYMENT") throw new Error("Public FRACTION UAT must stay pending")
await api("/ua_fraction_transactions", { method: "POST", prefer: "return=minimal", body: pendingFractionInsert(order) })
await api("/ua_aureus_liability_ledger", {
  method: "POST",
  prefer: "return=minimal",
  body: {
    entry_type: "FRACTION_RESERVE",
    amount: order.underlyingShareEquivalent,
    source_transaction_id: order.id,
    note: "Ubuntu public FRACTION UAT reserve; not remitted",
  },
})
const stored = await api("/ua_fraction_transactions?id=eq." + order.id + "&select=id,buyer_id,total_amount,transaction_status,payment_id,price_version")
const row = stored[0]
if (!row || row.transaction_status !== "PENDING_PAYMENT") throw new Error("Public FRACTION UAT did not persist pending")
if (row.payment_id) throw new Error("Public FRACTION UAT must not record payment")
if (formatMoney2(parseMoney(row.total_amount)) !== formatMoney2(parseMoney(order.total))) {
  throw new Error("Public FRACTION UAT total must match Ubuntu price version")
}

const flagsAfter = flagMap(await api("/ua_system_settings?select=key,value"))
for (const keyName of ["marketplace_enabled", "nft_assets_enabled", "nft_listing_enabled", "nft_marketplace_enabled"]) {
  if (String(flagsAfter[keyName] || "") !== String(flags[keyName] || "")) {
    throw new Error("Refused. FRACTION UAT must not change " + keyName)
  }
}

const body = publicFractionOrderResponse({ order, persisted: true, idempotent: false })
console.log(JSON.stringify({
  ok: true,
  namedOpen: NAMED_OPEN_SENTENCE,
  userId,
  order: body.order,
  priceVersionId: priceVersion.id,
  flags: {
    cards_enabled: flagsAfter.cards_enabled || "",
    fractions_enabled: flagsAfter.fractions_enabled || "",
    marketplace_enabled: flagsAfter.marketplace_enabled || "",
    nft_marketplace_enabled: flagsAfter.nft_marketplace_enabled || "",
  },
  confirmed: false,
  fractionCheckoutEnabled: true,
  checkoutEnabled: true,
  cardCheckoutEnabled: true,
}, null, 2))
