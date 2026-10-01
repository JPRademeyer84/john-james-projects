# Ubuntu Afrique

GitHub: https://github.com/JPRademeyer84/john-james-projects

Ubuntu Afrique is the upgrade of the existing Aureus software: Corporate Differential Gap Cover, Cards, Fractional Shares, Multi-Company Marketplace, and NFT Share Marketplace.

## Database rule (mandatory)

Aureus Africa production (`fgubaqoftdeefcakejwu`) is READ ONLY from this platform.

- Select existing Aureus users, KYC, shares, payments, and sponsor rows: allowed
- Insert / update / delete / upsert / mutating RPC on Aureus: blocked in code

All new Ubuntu Afrique data writes to a separate Ubuntu Afrique Supabase project.

Never apply `supabase/ubuntu-only/` or any Ubuntu schema to Aureus.

Never run `migrations/001_create_projects_system.sql` or `migrations/002_enroll_existing_users.sql` against Aureus. Those scripts mutate shared Aureus tables.

## Environment

Copy `.env.example`.

- `VITE_UBUNTU_SUPABASE_URL` / `VITE_UBUNTU_SUPABASE_ANON_KEY` -- Ubuntu write database
- `VITE_AUREUS_SUPABASE_URL` / `VITE_AUREUS_SUPABASE_ANON_KEY` -- Aureus read-only

Do not point Ubuntu env vars at Aureus production.

## Foundation status

- Dual clients: `aureusRead` (read-only) and `ubuntu` (writes)
- Signup writes `ua_users` on Ubuntu only
- Dashboard and affiliate read Ubuntu tables only
- Brand: Ubuntu Afrique
- No emojis in source UI

30-day module work (Gap Cover, Cards, Fractions, Marketplace, NFT) follows `docs/UBUNTU_AFRIQUE_FOUNDATION.md`.
