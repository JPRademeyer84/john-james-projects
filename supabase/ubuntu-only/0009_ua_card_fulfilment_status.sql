-- Ubuntu Afrique card fulfilment status after PAID.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).
-- NEVER run on Aureus fgubaqoftdeefcakejwu.

ALTER TABLE public.ua_card_orders
  ADD COLUMN IF NOT EXISTS fulfilment_status text;