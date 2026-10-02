-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu). NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Marketplace companies only. Checkout stays closed. Do not confirm payment. Do not execute from the agent.

CREATE TABLE public.ua_marketplace_companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  settlement_wallet text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ua_marketplace_companies ENABLE ROW LEVEL SECURITY;
