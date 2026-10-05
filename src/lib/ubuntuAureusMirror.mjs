/**
 * Aureus login -> Ubuntu member + AA read-mirror helpers.
 * Writes Ubuntu only. Does not write Aureus Africa.
 */

export function requireAureusUserId(value) {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("aureusUserId must be an existing Aureus users.id")
  }
  return id
}

export function normalizeAureusEmail(value) {
  const email = String(value || "").trim().toLowerCase()
  if (!email || !email.includes("@")) {
    throw new Error("Aureus email is required")
  }
  return email
}

function slugUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
}

export function chooseUbuntuUsername(input) {
  const aureusUserId = requireAureusUserId(input?.aureusUserId)
  const taken = new Set((input?.takenUsernames || []).map((row) => String(row || "").toLowerCase()))
  const preferred = slugUsername(input?.username)
  const fromEmail = slugUsername(String(input?.email || "").split("@")[0])
  const fallback = "aa_" + aureusUserId
  for (const candidate of [preferred, fromEmail, fallback, fallback + "_ua"]) {
    if (candidate && !taken.has(candidate)) return candidate
  }
  throw new Error("Ubuntu username is already taken")
}

export function buildUbuntuMemberProvision(input) {
  return {
    aureus_user_id: requireAureusUserId(input?.aureusUserId),
    email: normalizeAureusEmail(input?.email),
    username: chooseUbuntuUsername(input),
    aureus_auth_user_id: input?.authUserId ? String(input.authUserId) : null,
    identity_source: "aureus",
    pending_aureus_provision: false,
    is_active: input?.isActive !== false,
  }
}

export function money8(value) {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return "0.00000000"
  return amount.toFixed(8)
}

export function buildAureusReadMirrorRow(input) {
  const aureusUserId = requireAureusUserId(input?.aureusUserId)
  const ubuntuUserId = Number(input?.ubuntuUserId)
  if (!Number.isInteger(ubuntuUserId) || ubuntuUserId <= 0) {
    throw new Error("ubuntuUserId must be an existing Ubuntu ua_users.id")
  }
  return {
    aureus_user_id: aureusUserId,
    ubuntu_user_id: ubuntuUserId,
    email: normalizeAureusEmail(input?.email),
    username: String(input?.username || ""),
    full_name: input?.fullName == null ? null : String(input.fullName),
    phone: input?.phone == null ? null : String(input.phone),
    country_of_residence: input?.country == null ? null : String(input.country),
    is_admin: input?.isAdmin === true,
    is_active: input?.isActive !== false,
    role: input?.role == null ? null : String(input.role),
    aureus_auth_user_id: input?.authUserId ? String(input.authUserId) : null,
    net_shares: money8(input?.netShares),
    invested: money8(input?.invested),
    commissions: money8(input?.commissions),
    pending_commissions: money8(input?.pendingCommissions),
    source: "aureus_read",
  }
}

export function summarizeAureusLedger(input) {
  const purchaseRows = Array.isArray(input?.purchases) ? input.purchases : []
  const commissionRows = Array.isArray(input?.commissions) ? input.commissions : []
  const amountOf = typeof input?.commissionAmount === "function"
    ? input.commissionAmount
    : (row) => Number(row?.amount || row?.commission_amount || row?.commission || row?.total_amount || 0)
  const invested = purchaseRows.reduce((sum, row) => sum + Number(row?.total_amount || 0), 0)
  const commissions = commissionRows.reduce((sum, row) => sum + amountOf(row), 0)
  const pendingCommissions = commissionRows
    .filter((row) => String(row?.status || "").toLowerCase() === "pending")
    .reduce((sum, row) => sum + amountOf(row), 0)
  return {
    netShares: Number(input?.netShares || 0),
    invested,
    commissions,
    pendingCommissions,
  }
}

export function mirrorToUaMe(row) {
  if (!row) return null
  return {
    profile: {
      id: Number(row.aureus_user_id),
      email: String(row.email || ""),
      username: String(row.username || ""),
      full_name: row.full_name || "",
      phone: row.phone || "",
      country_of_residence: row.country_of_residence || "",
      is_admin: row.is_admin === true,
      is_active: row.is_active !== false,
      role: row.role || null,
      auth_user_id: row.aureus_auth_user_id || null,
    },
    ledger: {
      shares: Number(row.net_shares || 0),
      invested: Number(row.invested || 0),
      commissions: Number(row.commissions || 0),
      pending: Number(row.pending_commissions || 0),
    },
    mirrored: true,
  }
}
