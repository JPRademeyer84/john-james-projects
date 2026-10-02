-- Ubuntu Afrique corporate rank promotions. Qualification does not open checkout.
-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu). NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Do not execute from the agent. Do not confirm payment. Do not run Gap Cover.

CREATE TABLE IF NOT EXISTS public.ua_rank_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  from_rank text NOT NULL,
  to_rank text NOT NULL,
  reason text NOT NULL DEFAULT 'QUALIFIED',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ua_rank_promotions ENABLE ROW LEVEL SECURITY;
