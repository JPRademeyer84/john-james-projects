import type { SupabaseClient } from "@supabase/supabase-js"
import { archiveMarketplaceMedia, registerMarketplaceMedia } from "./marketplaceMedia.mjs"

export async function persistMarketplaceMedia(
  ubuntu: SupabaseClient,
  input: {
    id?: unknown
    companyId?: unknown
    productId?: unknown
    kind?: unknown
    contentType?: unknown
    byteSize?: unknown
    publicUrl?: unknown
  }
) {
  const created = registerMarketplaceMedia(input)
  const { error } = await ubuntu.from("ua_marketplace_media").upsert({
    id: created.id,
    company_id: created.companyId,
    product_id: created.productId,
    kind: created.kind,
    content_type: created.contentType,
    byte_size: created.byteSize,
    public_url: created.publicUrl,
    status: created.status,
  })
  if (error) throw new Error(error.message)
  return created
}

export async function loadMarketplaceMedia(ubuntu: SupabaseClient, companyId?: string) {
  let query = ubuntu
    .from("ua_marketplace_media")
    .select("id, company_id, product_id, kind, content_type, byte_size, public_url, status")
    .order("created_at", { ascending: true })
  if (companyId) query = query.eq("company_id", companyId)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    companyId: String(row.company_id),
    productId: row.product_id == null ? null : String(row.product_id),
    kind: String(row.kind),
    contentType: String(row.content_type),
    byteSize: Number(row.byte_size),
    publicUrl: String(row.public_url),
    status: String(row.status),
    checkoutEnabled: false,
  }))
}

export async function persistMarketplaceMediaArchive(ubuntu: SupabaseClient, mediaId: string) {
  const { data, error } = await ubuntu
    .from("ua_marketplace_media")
    .select("id, company_id, product_id, kind, content_type, byte_size, public_url, status")
    .eq("id", mediaId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("Marketplace media not found")
  const archived = archiveMarketplaceMedia({
    id: String(data.id),
    companyId: String(data.company_id),
    productId: data.product_id == null ? null : String(data.product_id),
    kind: String(data.kind),
    contentType: String(data.content_type),
    byteSize: Number(data.byte_size),
    publicUrl: String(data.public_url),
    status: String(data.status),
  })
  const { error: updateError } = await ubuntu
    .from("ua_marketplace_media")
    .update({ status: "ARCHIVED" })
    .eq("id", mediaId)
  if (updateError) throw new Error(updateError.message)
  return archived
}