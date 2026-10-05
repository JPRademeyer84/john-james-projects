-- Ubuntu Afrique KYC + admin roles. Apply ONLY to rbyipalrasawbjpsppgu.
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).
-- NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Sister KYC book only. Do not write Aureus KYC. Do not open checkout.

CREATE TABLE IF NOT EXISTS public.ua_kyc_profiles (
  user_id bigint PRIMARY KEY REFERENCES public.ua_users(id),
  status text NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED')),
  full_name text NOT NULL,
  country text NOT NULL,
  reason text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_user_id bigint REFERENCES public.ua_users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ua_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint NOT NULL REFERENCES public.ua_users(id),
  role text NOT NULL CHECK (role IN ('FINANCE', 'KYC', 'MARKETPLACE', 'CARD', 'SHARE', 'SUPPORT')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by_user_id bigint REFERENCES public.ua_users(id),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.ua_admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id bigint REFERENCES public.ua_users(id),
  actor_via text NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ua_admin_roles_user_id ON public.ua_admin_roles (user_id);
CREATE INDEX IF NOT EXISTS ua_admin_audit_log_target ON public.ua_admin_audit_log (target_type, target_id);
CREATE INDEX IF NOT EXISTS ua_kyc_profiles_status ON public.ua_kyc_profiles (status);

ALTER TABLE public.ua_kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ua_admin_audit_log ENABLE ROW LEVEL SECURITY;
