-- Ubuntu Afrique BLP contribution + QV idempotency.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).

CREATE TABLE IF NOT EXISTS public.ua_blp_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id text NOT NULL REFERENCES public.ua_blp_periods(id),
  source_transaction_id text NOT NULL,
  commissionable_value numeric(20,8) NOT NULL,
  blp_amount numeric(20,8) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ua_blp_contrib_source
  ON public.ua_blp_contributions (source_transaction_id);

CREATE UNIQUE INDEX IF NOT EXISTS ua_qv_txn_source
  ON public.ua_qv_transactions (source_transaction_id);

ALTER TABLE public.ua_blp_contributions ENABLE ROW LEVEL SECURITY;