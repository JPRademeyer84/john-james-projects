-- Ubuntu Afrique Gap Cover / rank / ledger core.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).

CREATE TABLE IF NOT EXISTS public.ua_ranks (
  code text PRIMARY KEY,
  title text NOT NULL,
  position integer NOT NULL UNIQUE,
  max_entitlement numeric(20,8) NOT NULL
);

INSERT INTO public.ua_ranks (code, title, position, max_entitlement) VALUES
  ('SSA', 'Shares Sales Associate', 1, 10),
  ('ASM', 'Associate Sales Manager', 2, 16),
  ('BSM', 'Business Sales Manager', 3, 20),
  ('SSM', 'Senior Sales Manager', 4, 23),
  ('VP', 'Vice President', 5, 25)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ua_user_ranks (
  user_id bigint PRIMARY KEY REFERENCES public.ua_users(id),
  rank_code text NOT NULL REFERENCES public.ua_ranks(code),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_rank_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint NOT NULL REFERENCES public.ua_users(id),
  rank_code text NOT NULL REFERENCES public.ua_ranks(code),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_sponsor_tree (
  user_id bigint PRIMARY KEY REFERENCES public.ua_users(id),
  sponsor_id bigint REFERENCES public.ua_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id <> sponsor_id)
);

CREATE TABLE IF NOT EXISTS public.ua_commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_transaction_id text NOT NULL,
  product_id text,
  seller_id text,
  recipient_user_id text NOT NULL,
  recipient_rank text NOT NULL,
  commission_type text NOT NULL,
  commissionable_value numeric(20,8) NOT NULL,
  previous_entitlement numeric(20,8) NOT NULL,
  new_entitlement numeric(20,8) NOT NULL,
  gap_percentage numeric(20,8) NOT NULL,
  amount numeric(20,8) NOT NULL,
  status text NOT NULL DEFAULT 'posted',
  comp_plan_version text NOT NULL DEFAULT 'GAP_COVER_V1',
  reversal_reference uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ua_commission_idemp
  ON public.ua_commission_transactions (source_transaction_id, recipient_user_id, commission_type);

CREATE TABLE IF NOT EXISTS public.ua_wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  entry_type text NOT NULL,
  amount numeric(20,8) NOT NULL,
  source_transaction_id text NOT NULL,
  status text NOT NULL DEFAULT 'posted',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_qv_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  source_transaction_id text NOT NULL,
  qv numeric(20,8) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_team_volume (
  user_id text PRIMARY KEY,
  personal_qv numeric(20,8) NOT NULL DEFAULT 0,
  team_qv numeric(20,8) NOT NULL DEFAULT 0,
  monthly_team_qv numeric(20,8) NOT NULL DEFAULT 0,
  lifetime_team_qv numeric(20,8) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_idempotency_keys (
  key text PRIMARY KEY,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.ua_system_settings (key, value) VALUES
  ('gap_cover_enabled', 'true'),
  ('cards_enabled', 'false'),
  ('fractions_enabled', 'false'),
  ('marketplace_enabled', 'false'),
  ('nft_assets_enabled', 'false'),
  ('nft_listing_enabled', 'false'),
  ('nft_marketplace_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.ua_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_user_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_sponsor_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_qv_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_team_volume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ua_ranks_select_all ON public.ua_ranks;
CREATE POLICY ua_ranks_select_all ON public.ua_ranks
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS ua_user_ranks_select_own ON public.ua_user_ranks;
CREATE POLICY ua_user_ranks_select_own ON public.ua_user_ranks
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.ua_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS ua_rank_history_select_own ON public.ua_rank_history;
CREATE POLICY ua_rank_history_select_own ON public.ua_rank_history
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.ua_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS ua_sponsor_tree_select_own ON public.ua_sponsor_tree;
CREATE POLICY ua_sponsor_tree_select_own ON public.ua_sponsor_tree
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.ua_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS ua_settings_select_flags ON public.ua_system_settings;
CREATE POLICY ua_settings_select_flags ON public.ua_system_settings
  FOR SELECT TO authenticated
  USING (true);
