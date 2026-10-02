import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { test } from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"

const projectRoot = fileURLToPath(new URL("..", import.meta.url))
const enginePath = `${projectRoot}/src/lib/financialAlert.mjs`
const alertsRoute = `${projectRoot}/src/routes/api/admin/alerts.ts`

test("149 payment commission rank inventory and nft failures are high-priority admin alerts", {
  skip: !existsSync(enginePath),
}, async () => {
  const { buildAdminAlert, classifyFinancialAlert } = await import(pathToFileURL(enginePath).href)
  for (const type of ["PAYMENT", "COMMISSION", "RANK", "INVENTORY", "NFT_TRANSFER"]) {
    const classified = classifyFinancialAlert(type)
    assert.equal(classified.priority, "HIGH")
    assert.equal(classified.notifyAdministrators, true)
  }
  const alert = buildAdminAlert({
    type: "PAYMENT",
    source: "/api/admin/commerce/confirm-payment",
    reference: "PAY-149",
    message: "Recorded payment event is required",
  })
  assert.equal(alert.priority, "HIGH")
  assert.equal(alert.checkoutEnabled, false)
  assert.equal(classifyFinancialAlert("API").priority, "NORMAL")
  assert.equal(classifyFinancialAlert("UNHANDLED").priority, "HIGH")
  const redacted = buildAdminAlert({
    type: "API",
    source: "/api/admin/alerts",
    message: "confirmSecret=super-secret failed",
  })
  assert.match(redacted.message, /\[redacted\]/)
  assert.throws(
    () => buildAdminAlert({ type: "PAYMENT", source: "x", message: "write fgubaqoftdeefcakejwu" }),
    /Aureus production/
  )
})

test("149 admin alerts route stays secret and checkout closed", {
  skip: !existsSync(alertsRoute),
}, () => {
  const source = readFileSync(alertsRoute, "utf8")
  assert.match(source, /UA_COMMERCE_CONFIRM_SECRET/)
  assert.match(source, /checkoutEnabled: false/)
  assert.doesNotMatch(source, /fgubaqoftdeefcakejwu/)
})