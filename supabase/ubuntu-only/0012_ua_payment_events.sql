-- Ubuntu Afrique payment events. RECORDED does not mean PAID.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).
-- NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Do not execute from the agent. Do not confirm payment. Do not run Gap Cover.

CREATE TABLE IF NOT EXISTS public.ua_payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text NOT NULL UNIQUE,
  order_id text NOT NULL,
  kind text NOT NULL,
  amount numeric(20,8) NOT NULL,
  provider text NOT NULL DEFAULT 'UA_STAGING',
  status text NOT NULL DEFAULT 'RECORDED',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ua_payment_events ENABLE ROW LEVEL SECURITY;
