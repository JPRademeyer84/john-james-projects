-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu). NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Marketplace orders + company settlements. Shared Gap Cover STANDARD_25 only. Do not open checkout.
-- Do not execute from the agent. Do not confirm payment. Do not run Gap Cover.

CREATE TABLE IF NOT EXISTS public.ua_marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL,
  product_id text NOT NULL,
  user_id text,
  retail_price numeric(20,8) NOT NULL,
  company_payout numeric(20,8) NOT NULL,
  commissionable_value numeric(20,8) NOT NULL,
  qv numeric(20,8) NOT NULL,
  gap_schedule text NOT NULL DEFAULT 'STANDARD_25',
  status text NOT NULL DEFAULT 'PENDING_PAYMENT',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_company_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  company_id text NOT NULL,
  amount numeric(20,8) NOT NULL,
  status text NOT NULL DEFAULT 'RECORDED',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ua_marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_company_settlements ENABLE ROW LEVEL SECURITY;
