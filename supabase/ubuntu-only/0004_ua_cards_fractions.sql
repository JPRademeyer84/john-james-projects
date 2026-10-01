-- Ubuntu Afrique Cards + Fractions schema.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).

CREATE TABLE IF NOT EXISTS public.ua_products (
  id text PRIMARY KEY,
  company_id text,
  product_type text NOT NULL,
  product_name text NOT NULL,
  sku text,
  short_description text,
  full_description text,
  retail_price numeric(20,8) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  cost numeric(20,8) NOT NULL DEFAULT 0,
  company_payout numeric(20,8) NOT NULL DEFAULT 0,
  commissionable_value numeric(20,8) NOT NULL,
  qv numeric(20,8) NOT NULL,
  gap_enabled boolean NOT NULL DEFAULT true,
  gap_schedule text NOT NULL DEFAULT 'STANDARD_25',
  blp_enabled boolean NOT NULL DEFAULT true,
  blp_percentage numeric(20,8) NOT NULL DEFAULT 5,
  inventory_method text,
  inventory numeric(20,8),
  shipping_required boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_product_price_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.ua_products(id),
  retail_price numeric(20,8) NOT NULL,
  product_cost numeric(20,8) NOT NULL,
  company_payout numeric(20,8) NOT NULL DEFAULT 0,
  commissionable_value numeric(20,8) NOT NULL,
  qv numeric(20,8) NOT NULL,
  gap_schedule text NOT NULL DEFAULT 'STANDARD_25',
  blp_rate numeric(20,8) NOT NULL DEFAULT 5,
  effective_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  administrator text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_card_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES public.ua_users(id),
  product_id text NOT NULL,
  price_version_id uuid,
  quantity integer NOT NULL,
  unit_price numeric(20,8) NOT NULL,
  total numeric(20,8) NOT NULL,
  delivery_details jsonb,
  payment_id text,
  sponsor_id text,
  commission_transaction_ref text,
  qv numeric(20,8) NOT NULL,
  order_status text NOT NULL DEFAULT 'PENDING_PAYMENT',
  tracking_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  fulfilment_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.ua_aureus_phases (
  phase integer PRIMARY KEY,
  aureus_share_price numeric(20,8) NOT NULL,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_underlying_inventory (
  id text PRIMARY KEY DEFAULT 'AUREUS_100K',
  original_underlying numeric(20,8) NOT NULL DEFAULT 100000,
  sold_underlying numeric(20,8) NOT NULL DEFAULT 0,
  remaining_underlying numeric(20,8) NOT NULL DEFAULT 100000,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_fraction_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id bigint REFERENCES public.ua_users(id),
  quantity integer NOT NULL,
  fraction_price numeric(20,8) NOT NULL DEFAULT 10,
  total_amount numeric(20,8) NOT NULL,
  aureus_phase integer NOT NULL,
  aureus_share_price numeric(20,8) NOT NULL,
  underlying_share_equivalent numeric(20,8) NOT NULL,
  allocation_component numeric(20,8) NOT NULL,
  price_version text,
  sponsor_id text,
  payment_id text,
  commission_id text,
  qv numeric(20,8) NOT NULL,
  transaction_status text NOT NULL DEFAULT 'PENDING_PAYMENT',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_fraction_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint NOT NULL REFERENCES public.ua_users(id),
  source_transaction_id uuid NOT NULL,
  quantity integer NOT NULL,
  aureus_phase integer NOT NULL,
  aureus_share_price numeric(20,8) NOT NULL,
  underlying_share_equivalent numeric(20,8) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_aureus_liability_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type text NOT NULL,
  amount numeric(20,8) NOT NULL,
  source_transaction_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.ua_products (
  id, product_type, product_name, sku, retail_price, cost, commissionable_value, qv, shipping_required
) VALUES
  ('CARD_PLASTIC', 'CARD_PLASTIC', 'Aureus Plastic Card', 'UA-CARD-PLASTIC', 100, 55, 100, 100, true),
  ('CARD_METAL', 'CARD_METAL', 'Aureus Metal Card', 'UA-CARD-METAL', 150, 75, 150, 150, true),
  ('AUREUS_FRACTION', 'AUREUS_FRACTION', 'Aureus Fraction', 'UA-FRACTION-10', 10, 0, 10, 10, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ua_aureus_phases (phase, aureus_share_price, active) VALUES
  (10, 100, true)
ON CONFLICT (phase) DO NOTHING;

INSERT INTO public.ua_underlying_inventory (id) VALUES ('AUREUS_100K')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ua_aureus_liability_ledger (entry_type, amount, note)
SELECT 'ORIGINAL_LIABILITY', 10000000, '100000 underlying shares x $100 Phase 10 basis'
WHERE NOT EXISTS (
  SELECT 1 FROM public.ua_aureus_liability_ledger WHERE entry_type = 'ORIGINAL_LIABILITY'
);

UPDATE public.ua_system_settings SET value = 'true', updated_at = now() WHERE key IN ('cards_enabled', 'fractions_enabled');

ALTER TABLE public.ua_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_product_price_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_card_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_aureus_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_underlying_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_fraction_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_fraction_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_aureus_liability_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ua_products_select ON public.ua_products;
CREATE POLICY ua_products_select ON public.ua_products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS ua_phases_select ON public.ua_aureus_phases;
CREATE POLICY ua_phases_select ON public.ua_aureus_phases FOR SELECT TO authenticated USING (true);