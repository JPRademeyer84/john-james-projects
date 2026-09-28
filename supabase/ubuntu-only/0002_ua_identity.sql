-- Ubuntu Afrique identity columns. Apply ONLY to ubuntu-afrique (rbyipalrasawbjpsppgu).
-- NEVER run on Aureus production.

ALTER TABLE public.ua_users ADD COLUMN IF NOT EXISTS identity_source text NOT NULL DEFAULT 'ubuntu';
ALTER TABLE public.ua_users ADD COLUMN IF NOT EXISTS pending_aureus_provision boolean NOT NULL DEFAULT false;
ALTER TABLE public.ua_users ADD COLUMN IF NOT EXISTS aureus_auth_user_id uuid;

DROP POLICY IF EXISTS ua_users_select_own ON public.ua_users;
CREATE POLICY ua_users_select_own ON public.ua_users
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS ua_users_insert_own ON public.ua_users;
CREATE POLICY ua_users_insert_own ON public.ua_users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS ua_investments_select_own ON public.ua_investments;
CREATE POLICY ua_investments_select_own ON public.ua_investments
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.ua_users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS ua_commissions_select_own ON public.ua_commissions;
CREATE POLICY ua_commissions_select_own ON public.ua_commissions
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.ua_users WHERE auth_user_id = auth.uid()));
