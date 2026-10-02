-- Ubuntu Afrique card refund reversal records.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).
-- NEVER run on Aureus fgubaqoftdeefcakejwu.

CREATE TABLE IF NOT EXISTS public.ua_transaction_reversals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_transaction_id text NOT NULL,
  reversal_type text NOT NULL,
  amount numeric(20,8) NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ua_reversal_source_type
  ON public.ua_transaction_reversals (source_transaction_id, reversal_type);

ALTER TABLE public.ua_transaction_reversals ENABLE ROW LEVEL SECURITY;