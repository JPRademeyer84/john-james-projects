-- Ubuntu Afrique current product price versions, snapshotted from ua_products.
-- Apply ONLY to the Ubuntu Afrique Supabase project (rbyipalrasawbjpsppgu).
-- NEVER run this on Aureus production (fgubaqoftdeefcakejwu).
-- NEVER run on Aureus fgubaqoftdeefcakejwu.

INSERT INTO public.ua_product_price_versions (
  product_id,
  retail_price,
  product_cost,
  company_payout,
  commissionable_value,
  qv,
  gap_schedule,
  blp_rate
)
SELECT
  p.id,
  p.retail_price,
  p.cost,
  COALESCE(p.company_payout, 0),
  p.commissionable_value,
  p.qv,
  COALESCE(p.gap_schedule, 'STANDARD_25'),
  COALESCE(p.blp_percentage, 5)
FROM public.ua_products p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.ua_product_price_versions v
  WHERE v.product_id = p.id
    AND v.end_date IS NULL
);
