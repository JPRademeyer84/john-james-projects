/** Fixed-point money. Scale matches DECIMAL(20,8). No IEEE float in final math. */

export const MONEY_SCALE = 8
export const MONEY_FACTOR = 100000000n

export function parseMoney(input) {
  const raw = String(input ?? "").trim()
  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    throw new Error(`Invalid money value: ${input}`)
  }
  const negative = raw.startsWith("-")
  const unsigned = negative ? raw.slice(1) : raw
  const [whole, frac = ""] = unsigned.split(".")
  if (frac.length > MONEY_SCALE) {
    throw new Error(`Money value exceeds ${MONEY_SCALE} decimal places: ${input}`)
  }
  const fracPadded = frac.padEnd(MONEY_SCALE, "0")
  const scaled = BigInt(whole) * MONEY_FACTOR + BigInt(fracPadded)
  return negative ? -scaled : scaled
}

export function formatMoney(scaled) {
  const negative = scaled < 0n
  const abs = negative ? -scaled : scaled
  const whole = abs / MONEY_FACTOR
  const frac = (abs % MONEY_FACTOR).toString().padStart(MONEY_SCALE, "0")
  return `${negative ? "-" : ""}${whole.toString()}.${frac}`
}

export function formatMoney2(scaled) {
  const full = formatMoney(scaled)
  const negative = full.startsWith("-")
  const unsigned = negative ? full.slice(1) : full
  const [whole, frac] = unsigned.split(".")
  return `${negative ? "-" : ""}${whole}.${frac.slice(0, 2)}`
}

/** percent is a percent number, e.g. "10" means 10%. */
export function percentOf(amountScaled, percent) {
  const percentScaled = parseMoney(percent)
  return (amountScaled * percentScaled) / (MONEY_FACTOR * 100n)
}

export function subtractMoney(left, right) {
  return left - right
}

export function addMoney(left, right) {
  return left + right
}

export function compareMoney(left, right) {
  if (left === right) return 0
  return left > right ? 1 : -1
}
