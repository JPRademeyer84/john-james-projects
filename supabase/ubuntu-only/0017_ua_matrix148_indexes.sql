-- Apply ONLY to Ubuntu Afrique (rbyipalrasawbjpsppgu). NEVER run this on Aureus production (fgubaqoftdeefcakejwu). NEVER run on Aureus fgubaqoftdeefcakejwu.
-- Matrix 148 indexes only. No checkout. No feature-flag changes. Do not write financial rows.

CREATE INDEX IF NOT EXISTS ua_sponsor_tree_sponsor_id ON public.ua_sponsor_tree (sponsor_id);
CREATE INDEX IF NOT EXISTS ua_rank_history_user_id ON public.ua_rank_history (user_id);
CREATE INDEX IF NOT EXISTS ua_commission_seller_id ON public.ua_commission_transactions (seller_id);
CREATE INDEX IF NOT EXISTS ua_commission_recipient_user_id ON public.ua_commission_transactions (recipient_user_id);
CREATE INDEX IF NOT EXISTS ua_commission_product_id ON public.ua_commission_transactions (product_id);
CREATE INDEX IF NOT EXISTS ua_wallet_ledger_user_id ON public.ua_wallet_ledger (user_id);
CREATE INDEX IF NOT EXISTS ua_wallet_ledger_source ON public.ua_wallet_ledger (source_transaction_id);
CREATE INDEX IF NOT EXISTS ua_qv_transactions_user_id ON public.ua_qv_transactions (user_id);
CREATE INDEX IF NOT EXISTS ua_card_orders_user_id ON public.ua_card_orders (user_id);
CREATE INDEX IF NOT EXISTS ua_card_orders_product_id ON public.ua_card_orders (product_id);
CREATE INDEX IF NOT EXISTS ua_card_orders_payment_id ON public.ua_card_orders (payment_id);
CREATE INDEX IF NOT EXISTS ua_fraction_transactions_buyer_id ON public.ua_fraction_transactions (buyer_id);
CREATE INDEX IF NOT EXISTS ua_fraction_transactions_payment_id ON public.ua_fraction_transactions (payment_id);
CREATE INDEX IF NOT EXISTS ua_fraction_transactions_phase ON public.ua_fraction_transactions (aureus_phase);
CREATE INDEX IF NOT EXISTS ua_fraction_ownership_user_id ON public.ua_fraction_ownership (user_id);
CREATE INDEX IF NOT EXISTS ua_payment_events_order_id ON public.ua_payment_events (order_id);
CREATE INDEX IF NOT EXISTS ua_marketplace_orders_product_id ON public.ua_marketplace_orders (product_id);
CREATE INDEX IF NOT EXISTS ua_marketplace_orders_user_id ON public.ua_marketplace_orders (user_id);
CREATE INDEX IF NOT EXISTS ua_company_settlements_order_id ON public.ua_company_settlements (order_id);
CREATE INDEX IF NOT EXISTS ua_nft_assets_current_owner ON public.ua_nft_assets (current_owner_id);
CREATE INDEX IF NOT EXISTS ua_nft_listings_nft_id ON public.ua_nft_listings (nft_id);
CREATE INDEX IF NOT EXISTS ua_nft_listings_status ON public.ua_nft_listings (status);
CREATE INDEX IF NOT EXISTS ua_nft_sales_nft_id ON public.ua_nft_sales (nft_id);
CREATE INDEX IF NOT EXISTS ua_nft_ownership_history_nft_id ON public.ua_nft_ownership_history (nft_id);
CREATE INDEX IF NOT EXISTS ua_nft_distribution_ledger_sale_id ON public.ua_nft_distribution_ledger (sale_id);