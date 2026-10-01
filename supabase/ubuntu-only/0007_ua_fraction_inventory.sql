-- Ubuntu Afrique fraction inventory consume idempotency.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).

CREATE UNIQUE INDEX IF NOT EXISTS ua_liability_source_type
  ON public.ua_aureus_liability_ledger (source_transaction_id, entry_type)
  WHERE source_transaction_id IS NOT NULL;