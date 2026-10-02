import { MONEY_FACTOR, addMoney, compareMoney, formatMoney2, parseMoney, percentOf, subtractMoney } from "./money.mjs"

export const FRACTION_UNIT_PRICE = "10.00"
export const ALLOCATION_BASIS = "100.00"
export const INITIAL_UNDERLYING_SHARES = "100000.00"
export const DEFAULT_PHASE = { phase: 10, aureusSharePrice: "100.00" }

export function fractionsPerFullShare(aureusSharePrice) {
  const price = parseMoney(aureusSharePrice)
  const unit = parseMoney(FRACTION_UNIT_PRICE)
  if (price <= 0n) {
    throw new Error("Aureus share price must be greater than zero")
  }
  if (price % unit !== 0n) {
    throw new Error("Aureus share price must be a multiple of the $10 fraction unit")
  }
  return price / unit
}

export function availableFractionCount(remainingUnderlying, aureusSharePrice) {
  const remaining = parseMoney(remainingUnderlying)
  const perShare = fractionsPerFullShare(aureusSharePrice)
  return remaining * perShare / MONEY_FACTOR
}

export function maxSaleValue(remainingUnderlying, aureusSharePrice) {
  const remaining = parseMoney(remainingUnderlying)
  const price = parseMoney(aureusSharePrice)
  return (remaining * price) / MONEY_FACTOR
}

export function quoteFractions({
  quantity,
  aureusSharePrice,
  aureusPhase = DEFAULT_PHASE.phase,
  remainingUnderlying = INITIAL_UNDERLYING_SHARES,
}) {
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error("quantity must be a positive integer")
  }

  const unit = parseMoney(FRACTION_UNIT_PRICE)
  const total = unit * BigInt(qty)
  const phasePrice = parseMoney(aureusSharePrice)
  if (phasePrice <= 0n) {
    throw new Error("Aureus share price must be greater than zero")
  }

  const maxValue = maxSaleValue(remainingUnderlying, aureusSharePrice)
  if (total > maxValue) {
    throw new Error("Purchase exceeds remaining underlying share inventory")
  }

  const underlying = (total * MONEY_FACTOR) / phasePrice
  const allocation = (underlying * parseMoney(ALLOCATION_BASIS)) / MONEY_FACTOR
  const gap = percentOf(total, "25")
  const blp = percentOf(total, "5")
  const gross = total - allocation - gap - blp

  return {
    quantity: qty,
    fractionUnitPrice: FRACTION_UNIT_PRICE,
    total: formatMoney2(total),
    aureusPhase: Number(aureusPhase),
    aureusSharePrice: formatMoney2(phasePrice),
    underlyingShareEquivalent: formatMoney2(underlying),
    allocationComponent: formatMoney2(allocation),
    gap: formatMoney2(gap),
    blp: formatMoney2(blp),
    ubuntuAfriqueGross: formatMoney2(gross),
    qv: formatMoney2(total),
    remainingUnderlying: formatMoney2(parseMoney(remainingUnderlying)),
    availableFractions: availableFractionCount(remainingUnderlying, aureusSharePrice).toString(),
  }
}

export function consumeUnderlyingInventory({
  remainingUnderlying,
  soldUnderlying = "0",
  underlyingShareEquivalent,
}) {
  const remaining = parseMoney(remainingUnderlying)
  const sold = parseMoney(soldUnderlying)
  const used = parseMoney(underlyingShareEquivalent)
  if (used <= 0n) {
    throw new Error("underlyingShareEquivalent must be greater than zero")
  }
  if (used > remaining) {
    throw new Error("Purchase exceeds remaining underlying share inventory")
  }
  return {
    remainingUnderlying: formatMoney2(remaining - used),
    soldUnderlying: formatMoney2(sold + used),
    underlyingShareEquivalent: formatMoney2(used),
  }
}

function parsePositiveUnderlying(underlyingShareEquivalent) {
  const used = parseMoney(underlyingShareEquivalent)
  if (compareMoney(used, 0n) <= 0) {
    throw new Error("underlyingShareEquivalent must be greater than zero")
  }
  return used
}

export function reserveUnderlyingInventory({
  remainingUnderlying,
  reservedUnderlying = "0",
  underlyingShareEquivalent,
}) {
  const remaining = parseMoney(remainingUnderlying)
  const reserved = parseMoney(reservedUnderlying)
  const used = parsePositiveUnderlying(underlyingShareEquivalent)
  if (compareMoney(used, remaining) > 0) {
    throw new Error("Purchase exceeds remaining underlying share inventory")
  }
  return {
    remainingUnderlying: formatMoney2(subtractMoney(remaining, used)),
    reservedUnderlying: formatMoney2(addMoney(reserved, used)),
    underlyingShareEquivalent: formatMoney2(used),
  }
}

export function convertReserveToSale({
  remainingUnderlying,
  reservedUnderlying,
  soldUnderlying,
  underlyingShareEquivalent,
}) {
  const remaining = parseMoney(remainingUnderlying)
  const reserved = parseMoney(reservedUnderlying)
  const sold = parseMoney(soldUnderlying)
  const used = parsePositiveUnderlying(underlyingShareEquivalent)
  if (compareMoney(used, reserved) > 0) {
    throw new Error("Sale exceeds reserved underlying share inventory")
  }
  return {
    remainingUnderlying: formatMoney2(remaining),
    reservedUnderlying: formatMoney2(subtractMoney(reserved, used)),
    soldUnderlying: formatMoney2(addMoney(sold, used)),
    underlyingShareEquivalent: formatMoney2(used),
  }
}

export function restoreReservedInventory({
  remainingUnderlying,
  reservedUnderlying,
  underlyingShareEquivalent,
}) {
  const remaining = parseMoney(remainingUnderlying)
  const reserved = parseMoney(reservedUnderlying)
  const used = parsePositiveUnderlying(underlyingShareEquivalent)
  if (compareMoney(used, reserved) > 0) {
    throw new Error("Restore exceeds reserved underlying share inventory")
  }
  return {
    remainingUnderlying: formatMoney2(addMoney(remaining, used)),
    reservedUnderlying: formatMoney2(subtractMoney(reserved, used)),
    underlyingShareEquivalent: formatMoney2(used),
  }
}

export function restoreSoldInventory({
  remainingUnderlying,
  soldUnderlying,
  underlyingShareEquivalent,
}) {
  const remaining = parseMoney(remainingUnderlying)
  const sold = parseMoney(soldUnderlying)
  const used = parsePositiveUnderlying(underlyingShareEquivalent)
  if (compareMoney(used, sold) > 0) {
    throw new Error("Restore exceeds sold underlying share inventory")
  }
  return {
    remainingUnderlying: formatMoney2(addMoney(remaining, used)),
    soldUnderlying: formatMoney2(subtractMoney(sold, used)),
    underlyingShareEquivalent: formatMoney2(used),
  }
}

export function phaseAvailability(remainingUnderlying, aureusSharePrice) {
  return {
    remainingUnderlying: formatMoney2(parseMoney(remainingUnderlying)),
    aureusSharePrice: formatMoney2(parseMoney(aureusSharePrice)),
    availableFractions: availableFractionCount(remainingUnderlying, aureusSharePrice).toString(),
    maxSaleValue: formatMoney2(maxSaleValue(remainingUnderlying, aureusSharePrice)),
  }
}