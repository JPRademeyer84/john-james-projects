import { addMoney, formatMoney2, parseMoney, subtractMoney } from "./money.mjs"

/**
 * Ubuntu Afrique allocation liability.
 * ORIGINAL_LIABILITY = 100000 * $100 initial obligation.
 * FRACTION_RESERVE = reserved, not remitted, not sold.
 * FRACTION_SALE = allocated/economic liability, still not remitted to Aureus.
 * FRACTION_RESERVE_RELEASE = reserve undone.
 * FRACTION_SALE_REVERSAL = sale allocation undone.
 * FRACTION_REMITTED = funds actually remitted to Aureus.
 * Reserved and allocated never reduce remitted. Outstanding = original - remitted.
 */

export function classifyLiabilityEntry(entryType) {
  switch (String(entryType || "")) {
    case "ORIGINAL_LIABILITY":
      return "original"
    case "FRACTION_RESERVE":
      return "reserved"
    case "FRACTION_SALE":
      return "allocated"
    case "FRACTION_REMITTED":
      return "remitted"
    case "FRACTION_RESERVE_RELEASE":
      return "release"
    case "FRACTION_SALE_REVERSAL":
      return "reversal"
    default:
      return "unknown"
  }
}

export function summarizeLiability(entries) {
  if (!Array.isArray(entries)) {
    throw new Error("entries must be an array")
  }
  let original = 0n
  let reserved = 0n
  let allocated = 0n
  let remitted = 0n
  let released = 0n
  let reversed = 0n
  for (const row of entries) {
    const amount = parseMoney(row.amount || "0")
    const kind = classifyLiabilityEntry(row.entryType || row.entry_type)
    if (kind === "original") original = addMoney(original, amount)
    if (kind === "reserved") reserved = addMoney(reserved, amount)
    if (kind === "allocated") allocated = addMoney(allocated, amount)
    if (kind === "remitted") remitted = addMoney(remitted, amount)
    if (kind === "release") released = addMoney(released, amount)
    if (kind === "reversal") reversed = addMoney(reversed, amount)
  }
  return {
    original: formatMoney2(original),
    reserved: formatMoney2(reserved),
    allocated: formatMoney2(allocated),
    remitted: formatMoney2(remitted),
    reservedNet: formatMoney2(subtractMoney(reserved, released)),
    allocatedNet: formatMoney2(subtractMoney(allocated, reversed)),
    outstanding: formatMoney2(subtractMoney(original, remitted)),
  }
}