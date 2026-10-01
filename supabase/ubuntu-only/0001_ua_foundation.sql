-- Ubuntu Afrique schema. Apply ONLY to the Ubuntu Afrique Supabase project.
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).

CREATE TABLE IF NOT EXISTS public.ua_users (
  id bigserial PRIMARY KEY,
  auth_user_id uuid NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  sponsor_code text,
  aureus_user_id integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint NOT NULL REFERENCES public.ua_users(id),
  amount numeric(20,8) NOT NULL DEFAULT 0,
  shares numeric(20,8) NOT NULL DEFAULT 0,
  payment_method text,
  payment_proof text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint NOT NULL REFERENCES public.ua_users(id),
  amount numeric(20,8) NOT NULL DEFAULT 0,
  shares_bonus numeric(20,8) NOT NULL DEFAULT 0,
  type text,
  status text NOT NULL DEFAULT 'pending',
  comp_plan_version text NOT NULL DEFAULT 'GAP_COVER_V1',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ua_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_commissions ENABLE ROW LEVEL SECURITY;
