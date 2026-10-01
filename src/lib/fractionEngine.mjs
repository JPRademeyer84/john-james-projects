import { MONEY_FACTOR, formatMoney2, parseMoney, percentOf } from "./money.mjs"

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

export function phaseAvailability(remainingUnderlying, aureusSharePrice) {
  return {
    remainingUnderlying: formatMoney2(parseMoney(remainingUnderlying)),
    aureusSharePrice: formatMoney2(parseMoney(aureusSharePrice)),
    availableFractions: availableFractionCount(remainingUnderlying, aureusSharePrice).toString(),
    maxSaleValue: formatMoney2(maxSaleValue(remainingUnderlying, aureusSharePrice)),
  }
}