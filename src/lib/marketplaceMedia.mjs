/** Marketplace media register/archive. Ubuntu only. Checkout stays closed. */
export const MEDIA_KINDS = Object.freeze(["LOGO", "BANNER", "GALLERY", "PRODUCT"])
export const ALLOWED_MEDIA_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"])
export const MAX_MEDIA_BYTES = Object.freeze({
  LOGO: 1048576,
  BANNER: 2097152,
  GALLERY: 2097152,
  PRODUCT: 2097152,
})

export function quoteMediaOptimisation(kind) {
  const code = String(kind || "").toUpperCase()
  if (!MEDIA_KINDS.includes(code)) throw new Error("Unsupported marketplace media kind")
  if (code === "LOGO") return { kind: code, maxWidth: 512, quality: 80, format: "webp" }
  if (code === "BANNER") return { kind: code, maxWidth: 1600, quality: 80, format: "webp" }
  return { kind: code, maxWidth: 1200, quality: 80, format: "webp" }
}

function required(value, field) {
  const text = String(value || "").trim()
  if (!text) throw new Error(field + " is required")
  return text
}

export function registerMarketplaceMedia(input) {
  const id = required(input?.id, "id")
  const companyId = required(input?.companyId, "companyId")
  const kind = String(input?.kind || "").toUpperCase()
  if (!MEDIA_KINDS.includes(kind)) throw new Error("Unsupported marketplace media kind")
  const contentType = String(input?.contentType || "").toLowerCase()
  if (!ALLOWED_MEDIA_TYPES.includes(contentType)) throw new Error("Unsupported marketplace media type")
  const byteSize = Number(input?.byteSize)
  if (!Number.isInteger(byteSize) || byteSize <= 0) throw new Error("byteSize must be a positive integer")
  if (byteSize > MAX_MEDIA_BYTES[kind]) throw new Error("Marketplace media exceeds size limit")
  const publicUrl = required(input?.publicUrl, "publicUrl")
  if (!publicUrl.startsWith("https://")) throw new Error("Marketplace media URL must be https")
  if (publicUrl.includes("fgubaqoftdeefcakejwu")) {
    throw new Error("Marketplace media cannot target Aureus production")
  }
  const productId = input?.productId == null || String(input.productId).trim() === "" ? null : String(input.productId).trim()
  if (kind === "PRODUCT" && !productId) throw new Error("productId is required")
  return {
    id,
    companyId,
    productId,
    kind,
    contentType,
    byteSize,
    publicUrl,
    optimisation: quoteMediaOptimisation(kind),
    status: "ACTIVE",
    checkoutEnabled: false,
  }
}

export function archiveMarketplaceMedia(media) {
  if (!media || !media.id) throw new Error("media is required")
  return {
    ...media,
    status: "ARCHIVED",
    checkoutEnabled: false,
  }
}