-- Ubuntu Afrique AA read-mirror. Apply ONLY to rbyipalrasawbjpsppgu.
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).
-- NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Mirror stores Aureus-read facts on Ubuntu. It does not write Aureus.

CREATE UNIQUE INDEX IF NOT EXISTS ua_users_aureus_user_id
  ON public.ua_users (aureus_user_id)
  WHERE aureus_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.ua_aa_user_mirror (
  aureus_user_id integer PRIMARY KEY,
  ubuntu_user_id bigint NOT NULL REFERENCES public.ua_users(id),
  email text NOT NULL,
  username text,
  full_name text,
  phone text,
  country_of_residence text,
  is_admin boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  role text,
  aureus_auth_user_id uuid,
  net_shares numeric(20,8) NOT NULL DEFAULT 0,
  invested numeric(20,8) NOT NULL DEFAULT 0,
  commissions numeric(20,8) NOT NULL DEFAULT 0,
  pending_commissions numeric(20,8) NOT NULL DEFAULT 0,
  mirrored_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'aureus_read'
);

CREATE UNIQUE INDEX IF NOT EXISTS ua_aa_user_mirror_ubuntu_user_id
  ON public.ua_aa_user_mirror (ubuntu_user_id);

ALTER TABLE public.ua_aa_user_mirror ENABLE ROW LEVEL SECURITY;
