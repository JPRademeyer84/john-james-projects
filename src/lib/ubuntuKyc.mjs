/** Ubuntu Afrique KYC and admin roles. Sister book only. Does not write Aureus KYC. */
export const KYC_STATUSES = Object.freeze(["PENDING", "COMPLETED", "REJECTED"])
export const ADMIN_ROLES = Object.freeze(["FINANCE", "KYC", "MARKETPLACE", "CARD", "SHARE", "SUPPORT"])
export const AUREUS_KYC_REFUSED = "Aureus KYC fields are rejected. Ubuntu KYC stays on Ubuntu tables."

function requiredText(value, field) {
  const text = String(value == null ? "" : value).trim()
  if (!text) throw new Error(field + " is required")
  return text
}

function requiredUserId(value) {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("userId must be an existing Ubuntu ua_users.id")
  }
  return String(id)
}

export function assertNoAureusKycInput(input) {
  if (!input || typeof input !== "object") return true
  for (const key of ["aureusKycId", "aureusKyc", "kyc_status", "kycStatusAureus", "documentsAureus"]) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      throw new Error(AUREUS_KYC_REFUSED)
    }
  }
  return true
}

export function submitKycProfile(input) {
  assertNoAureusKycInput(input)
  if (input?.status && String(input.status).toUpperCase() !== "PENDING") {
    throw new Error("Member KYC submit can only create PENDING. Review is an admin action.")
  }
  const userId = requiredUserId(input?.userId)
  return {
    userId,
    status: "PENDING",
    fullName: requiredText(input?.fullName, "fullName"),
    country: requiredText(input?.country, "country").toUpperCase(),
    reason: null,
    checkoutEnabled: false,
  }
}

export function reviewKycProfile(input) {
  assertNoAureusKycInput(input)
  const current = String(input?.currentStatus || "").toUpperCase()
  if (current !== "PENDING") {
    throw new Error("Only PENDING Ubuntu KYC can be reviewed")
  }
  const decision = String(input?.decision || "").toUpperCase()
  if (decision !== "COMPLETED" && decision !== "REJECTED") {
    throw new Error("KYC decision must be COMPLETED or REJECTED")
  }
  const reason = input?.reason == null ? "" : String(input.reason).trim()
  if (decision === "REJECTED" && !reason) {
    throw new Error("Rejected KYC requires a reason")
  }
  return {
    userId: requiredUserId(input?.userId),
    status: decision,
    reason: reason || null,
    reviewerUserId: input?.reviewerUserId == null || String(input.reviewerUserId).trim() === ""
      ? null
      : requiredUserId(input.reviewerUserId),
    checkoutEnabled: false,
  }
}

export function assignAdminRole(input) {
  const role = String(input?.role || "").toUpperCase()
  if (!ADMIN_ROLES.includes(role)) {
    throw new Error("Unsupported Ubuntu admin role")
  }
  return {
    userId: requiredUserId(input?.userId),
    role,
    grantedByUserId: input?.grantedByUserId == null || String(input.grantedByUserId).trim() === ""
      ? null
      : requiredUserId(input.grantedByUserId),
    checkoutEnabled: false,
  }
}

export function assertAdminRole(roles, requiredRole) {
  const need = String(requiredRole || "").toUpperCase()
  if (!ADMIN_ROLES.includes(need)) {
    throw new Error("Unsupported Ubuntu admin role")
  }
  const have = (Array.isArray(roles) ? roles : []).map((row) => String(row).toUpperCase())
  if (!have.includes(need)) {
    throw new Error("Ubuntu admin role required: " + need)
  }
  return true
}

export function authorizeUbuntuAdmin(input) {
  if (input?.secretOk === true) {
    return { ok: true, via: "secret", checkoutEnabled: false }
  }
  assertAdminRole(input?.roles, input?.requiredRole)
  return { ok: true, via: "role", checkoutEnabled: false }
}

export function buildAdminAudit(input) {
  const action = requiredText(input?.action, "action")
  const targetType = requiredText(input?.targetType, "targetType")
  return {
    actorUserId: input?.actorUserId == null || String(input.actorUserId).trim() === ""
      ? null
      : requiredUserId(input.actorUserId),
    actorVia: String(input?.actorVia || "role"),
    action,
    targetType,
    targetId: input?.targetId == null ? null : String(input.targetId),
    detail: input?.detail == null ? null : String(input.detail),
    checkoutEnabled: false,
  }
}
