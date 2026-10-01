-- Ubuntu Afrique BLP monthly pool.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).

CREATE TABLE IF NOT EXISTS public.ua_blp_periods (
  id text PRIMARY KEY,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  commissionable_sales numeric(20,8) NOT NULL DEFAULT 0,
  blp_total numeric(20,8) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_blp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id text NOT NULL REFERENCES public.ua_blp_periods(id),
  user_id text NOT NULL,
  rank_code text NOT NULL,
  qualified_monthly_volume numeric(20,8) NOT NULL,
  weight integer NOT NULL,
  points numeric(20,8) NOT NULL,
  amount numeric(20,8) NOT NULL,
  status text NOT NULL DEFAULT 'posted',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ua_blp_txn_period_user ON public.ua_blp_transactions (period_id, user_id);

ALTER TABLE public.ua_blp_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_blp_transactions ENABLE ROW LEVEL SECURITY;