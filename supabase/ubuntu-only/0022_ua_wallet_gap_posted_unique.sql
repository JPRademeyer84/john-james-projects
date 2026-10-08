-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu).
-- One posted GAP_COMMISSION wallet row per source + recipient. Voided rows stay for audit.

CREATE UNIQUE INDEX IF NOT EXISTS ua_wallet_gap_posted_unique
ON public.ua_wallet_ledger (source_transaction_id, user_id, entry_type)
WHERE status = 'posted' AND entry_type = 'GAP_COMMISSION';