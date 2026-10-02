-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu). NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Admin financial alerts. Do not open checkout. Do not write Aureus.

CREATE TABLE IF NOT EXISTS public.ua_admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  priority text NOT NULL,
  source text NOT NULL,
  reference text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ua_admin_alerts_priority ON public.ua_admin_alerts (priority);
CREATE INDEX IF NOT EXISTS ua_admin_alerts_type ON public.ua_admin_alerts (alert_type);

ALTER TABLE public.ua_admin_alerts ENABLE ROW LEVEL SECURITY;