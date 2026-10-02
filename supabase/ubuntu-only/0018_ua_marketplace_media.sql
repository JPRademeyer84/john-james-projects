-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu). NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Marketplace media metadata. Archive only. Do not open checkout. Do not write Aureus.

CREATE TABLE IF NOT EXISTS public.ua_marketplace_media (
  id text PRIMARY KEY,
  company_id text NOT NULL,
  product_id text,
  kind text NOT NULL,
  content_type text NOT NULL,
  byte_size integer NOT NULL,
  public_url text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ua_marketplace_media_company_id ON public.ua_marketplace_media (company_id);
CREATE INDEX IF NOT EXISTS ua_marketplace_media_product_id ON public.ua_marketplace_media (product_id);

ALTER TABLE public.ua_marketplace_media ENABLE ROW LEVEL SECURITY;