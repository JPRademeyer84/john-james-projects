import assert from "node:assert/strict"
import { test } from "node:test"
import { quoteCard } from "../src/lib/cardEconomics.mjs"
import { phaseAvailability, quoteFractions } from "../src/lib/fractionEngine.mjs"

test("133 plastic card $100: cost 55, gap 25, BLP 5, gross 15", () => {
  const quote = quoteCard("CARD_PLASTIC", 1)
  assert.equal(quote.unit.retailPrice, "100.00")
  assert.equal(quote.unit.cost, "55.00")
  assert.equal(quote.unit.gap, "25.00")
  assert.equal(quote.unit.blp, "5.00")
  assert.equal(quote.unit.ubuntuAfriqueGross, "15.00")
})

test("134 metal card $150: cost 75, gap 37.50, BLP 7.50, gross 30", () => {
  const quote = quoteCard("CARD_METAL", 1)
  assert.equal(quote.unit.retailPrice, "150.00")
  assert.equal(quote.unit.cost, "75.00")
  assert.equal(quote.unit.gap, "37.50")
  assert.equal(quote.unit.blp, "7.50")
  assert.equal(quote.unit.ubuntuAfriqueGross, "30.00")
})

test("135 fraction at $200: 0.05 share, allocation 5, gap 2.50, BLP 0.50, balance 2", () => {
  const quote = quoteFractions({ quantity: 1, aureusSharePrice: "200.00", aureusPhase: 11 })
  assert.equal(quote.fractionUnitPrice, "10.00")
  assert.equal(quote.underlyingShareEquivalent, "0.05")
  assert.equal(quote.allocationComponent, "5.00")
  assert.equal(quote.gap, "2.50")
  assert.equal(quote.blp, "0.50")
  assert.equal(quote.ubuntuAfriqueGross, "2.00")
})

test("136 phase change: 80000 remaining is 1600000 fractions at $200 and 2400000 at $300", () => {
  const at200 = phaseAvailability("80000", "200.00")
  const at300 = phaseAvailability("80000", "300.00")
  assert.equal(at200.availableFractions, "1600000")
  assert.equal(at300.availableFractions, "2400000")
  const locked = quoteFractions({ quantity: 1, aureusSharePrice: "200.00", remainingUnderlying: "80000" })
  assert.equal(locked.underlyingShareEquivalent, "0.05")
})

test("137 inventory limit: 0.25 remaining at $200 rejects more than $50", () => {
  const available = phaseAvailability("0.25", "200.00")
  assert.equal(available.maxSaleValue, "50.00")
  const ok = quoteFractions({ quantity: 5, aureusSharePrice: "200.00", remainingUnderlying: "0.25" })
  assert.equal(ok.total, "50.00")
  assert.throws(
    () => quoteFractions({ quantity: 6, aureusSharePrice: "200.00", remainingUnderlying: "0.25" }),
    /exceeds remaining underlying/
  )
})