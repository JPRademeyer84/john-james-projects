-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu). NEVER run on Aureus fgubaqoftdeefcakejwu.
-- NFT staging records + recon. Flags stay off. Do not open checkout. Do not enable production trading.

CREATE TABLE IF NOT EXISTS public.ua_nft_assets (
  id text PRIMARY KEY,
  current_owner_id text NOT NULL,
  original_seller_id text,
  resale_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'OWNED',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_nft_listings (
  id text PRIMARY KEY,
  nft_id text NOT NULL REFERENCES public.ua_nft_assets(id),
  seller_id text NOT NULL,
  sponsor_id text,
  price numeric(20,8) NOT NULL,
  status text NOT NULL DEFAULT 'LISTED',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_nft_sales (
  id text PRIMARY KEY,
  nft_id text NOT NULL,
  listing_id text NOT NULL,
  payment_id text NOT NULL UNIQUE,
  seller_id text NOT NULL,
  buyer_id text NOT NULL,
  original_seller_id text,
  sponsor_id text,
  special_kind text,
  price numeric(20,8) NOT NULL,
  resale_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'STAGED',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_nft_ownership_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id text NOT NULL,
  from_owner_id text NOT NULL,
  to_owner_id text NOT NULL,
  sale_id text NOT NULL,
  original_seller_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_nft_distribution_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id text NOT NULL,
  bucket text NOT NULL,
  recipient_id text NOT NULL,
  amount numeric(20,8) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_nft_marketplace_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO public.ua_nft_marketplace_config (key, value) VALUES
  ('nft_marketplace_enabled', 'false'),
  ('aureus_share_sold_gate', '1400000')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ua_system_settings (key, value) VALUES
  ('nft_assets_enabled', 'false'),
  ('nft_listing_enabled', 'false'),
  ('nft_marketplace_enabled', 'false')
ON CONFLICT (key) DO UPDATE SET value = 'false';

ALTER TABLE public.ua_nft_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_nft_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_nft_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_nft_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_nft_distribution_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_nft_marketplace_config ENABLE ROW LEVEL SECURITY;
