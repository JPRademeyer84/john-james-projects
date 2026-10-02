import assert from "node:assert/strict"
import { test } from "node:test"
import { quoteCard } from "../src/lib/cardEconomics.mjs"
import {
  consumeUnderlyingInventory,
  convertReserveToSale,
  phaseAvailability,
  quoteFractions,
  reserveUnderlyingInventory,
  restoreReservedInventory,
  restoreSoldInventory,
} from "../src/lib/fractionEngine.mjs"
import { classifyLiabilityEntry, summarizeLiability } from "../src/lib/liabilityEngine.mjs"

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

test("live remaining 0.00 is sold through before confirm", () => {
  const empty = phaseAvailability("0", "200.00")
  assert.equal(empty.remainingUnderlying, "0.00")
  assert.equal(empty.maxSaleValue, "0.00")
  assert.throws(
    () => quoteFractions({ quantity: 1, aureusSharePrice: "200.00", remainingUnderlying: "0" }),
    /exceeds remaining underlying/
  )
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

test("fraction confirm consumes 0.05 remaining and refuses when sold through", () => {
  const ok = consumeUnderlyingInventory({
    remainingUnderlying: "100000.00",
    soldUnderlying: "0",
    underlyingShareEquivalent: "0.05",
  })
  assert.equal(ok.remainingUnderlying, "99999.95")
  assert.equal(ok.soldUnderlying, "0.05")
  const last = consumeUnderlyingInventory({
    remainingUnderlying: "0.05",
    soldUnderlying: "99999.95",
    underlyingShareEquivalent: "0.05",
  })
  assert.equal(last.remainingUnderlying, "0.00")
  assert.throws(
    () =>
      consumeUnderlyingInventory({
        remainingUnderlying: "0.04",
        soldUnderlying: "99999.96",
        underlyingShareEquivalent: "0.05",
      }),
    /exceeds remaining underlying/
  )
})

test("fraction reserve holds underlying without counting it sold", () => {
  const reserved = reserveUnderlyingInventory({
    remainingUnderlying: "100000.00",
    underlyingShareEquivalent: "0.05",
  })
  assert.equal(reserved.remainingUnderlying, "99999.95")
  assert.equal(reserved.reservedUnderlying, "0.05")
  assert.equal(reserved.underlyingShareEquivalent, "0.05")
  const stacked = reserveUnderlyingInventory({
    remainingUnderlying: reserved.remainingUnderlying,
    reservedUnderlying: reserved.reservedUnderlying,
    underlyingShareEquivalent: "0.10",
  })
  assert.equal(stacked.remainingUnderlying, "99999.85")
  assert.equal(stacked.reservedUnderlying, "0.15")
  assert.throws(
    () =>
      reserveUnderlyingInventory({
        remainingUnderlying: "0.04",
        reservedUnderlying: "0",
        underlyingShareEquivalent: "0.05",
      }),
    /exceeds remaining underlying/
  )
})

test("confirm converts a reserve into a sale without decrementing remaining again", () => {
  const reserved = reserveUnderlyingInventory({
    remainingUnderlying: "100000.00",
    reservedUnderlying: "0",
    underlyingShareEquivalent: "0.05",
  })
  const sold = convertReserveToSale({
    remainingUnderlying: reserved.remainingUnderlying,
    reservedUnderlying: reserved.reservedUnderlying,
    soldUnderlying: "0",
    underlyingShareEquivalent: "0.05",
  })
  assert.equal(sold.remainingUnderlying, "99999.95")
  assert.equal(sold.reservedUnderlying, "0.00")
  assert.equal(sold.soldUnderlying, "0.05")
  const direct = consumeUnderlyingInventory({
    remainingUnderlying: "100000.00",
    soldUnderlying: "0",
    underlyingShareEquivalent: "0.05",
  })
  assert.equal(sold.remainingUnderlying, direct.remainingUnderlying)
  assert.equal(sold.soldUnderlying, direct.soldUnderlying)
  assert.throws(
    () =>
      convertReserveToSale({
        remainingUnderlying: sold.remainingUnderlying,
        reservedUnderlying: sold.reservedUnderlying,
        soldUnderlying: sold.soldUnderlying,
        underlyingShareEquivalent: "0.05",
      }),
    /exceeds reserved underlying/
  )
})

test("fraction refund restore puts reserved and sold underlying back", () => {
  const released = restoreReservedInventory({
    remainingUnderlying: "99999.90",
    reservedUnderlying: "0.10",
    underlyingShareEquivalent: "0.10",
  })
  assert.equal(released.remainingUnderlying, "100000.00")
  assert.equal(released.reservedUnderlying, "0.00")
  const unsold = restoreSoldInventory({
    remainingUnderlying: "99999.90",
    soldUnderlying: "0.10",
    underlyingShareEquivalent: "0.10",
  })
  assert.equal(unsold.remainingUnderlying, "100000.00")
  assert.equal(unsold.soldUnderlying, "0.00")
})

test("reserved and allocated liability are not remitted; outstanding stays original until remitted", () => {
  assert.equal(classifyLiabilityEntry("FRACTION_RESERVE"), "reserved")
  assert.equal(classifyLiabilityEntry("FRACTION_SALE"), "allocated")
  assert.equal(classifyLiabilityEntry("FRACTION_REMITTED"), "remitted")
  const summary = summarizeLiability([
    { entryType: "ORIGINAL_LIABILITY", amount: "10000000.00" },
    { entryType: "FRACTION_RESERVE", amount: "5.00" },
    { entryType: "FRACTION_SALE", amount: "5.00" },
    { entryType: "FRACTION_REMITTED", amount: "0.00" },
  ])
  assert.equal(summary.reservedNet, "5.00")
  assert.equal(summary.allocatedNet, "5.00")
  assert.equal(summary.remitted, "0.00")
  assert.equal(summary.outstanding, "10000000.00")
})