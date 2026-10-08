/** Matrix 149 financial failure logging. High-priority alerts stay on Ubuntu. */
export const FINANCIAL_ALERT_TYPES = Object.freeze([
  "PAYMENT",
  "COMMISSION",
  "RANK",
  "INVENTORY",
  "NFT_TRANSFER",
])

export const ALERT_TYPES = Object.freeze([...FINANCIAL_ALERT_TYPES, "API", "UNHANDLED"])

function required(value, field) {
  const text = String(value || "").trim()
  if (!text) throw new Error(field + " is required")
  return text
}

function redact(message) {
  return String(message || "")
    .replace(/x-ua-commerce-confirm[^\s]*/gi, "x-ua-commerce-confirm=[redacted]")
    .replace(/confirmSecret[^\s]*/gi, "confirmSecret=[redacted]")
}

export function classifyFinancialAlert(type) {
  const code = String(type || "").toUpperCase()
  if (!ALERT_TYPES.includes(code)) throw new Error("Unsupported alert type")
  const financial = FINANCIAL_ALERT_TYPES.includes(code)
  return {
    type: code,
    priority: financial || code === "UNHANDLED" ? "HIGH" : "NORMAL",
    notifyAdministrators: financial || code === "UNHANDLED",
  }
}

export function buildAdminAlert(input) {
  const classified = classifyFinancialAlert(input?.type)
  const message = redact(required(input?.message, "message"))
  if (message.includes("fgubaqoftdeefcakejwu")) {
    throw new Error("Alert must not target Aureus production")
  }
  return {
    type: classified.type,
    priority: classified.priority,
    notifyAdministrators: classified.notifyAdministrators,
    source: required(input?.source, "source"),
    reference: input?.reference == null || String(input.reference).trim() === "" ? null : String(input.reference).trim(),
    message,
    checkoutEnabled: false,
  }
}