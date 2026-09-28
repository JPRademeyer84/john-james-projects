# Ubuntu Afrique -- Foundation

Repo: https://github.com/JPRademeyer84/john-james-projects

## Verdict (verified from source)

The previous John James app was NOT one-way.

- .env.example pointed at Aureus production: fgubaqoftdeefcakejwu
- src/lib/supabase.ts inserted into Aureus users on signup
- It inserted and updated Aureus user_projects on login

That mutates the live Aureus database. That is forbidden.

## Required data rule

Aureus Africa (fgubaqoftdeefcakejwu) is READ ONLY from this platform.

- Select existing users, KYC, shares, payments, sponsor rows: allowed
- Insert / update / delete / upsert / mutating RPC on Aureus: blocked in code

Ubuntu Afrique has its own Supabase project.

- All new Gap Cover, cards, fractions, marketplace, NFT, wallet ledger rows write HERE only
- Never apply Ubuntu migrations to Aureus

## 30-day build order

Days 1-5: retain Aureus login/KYC/tree as read mirrors; replace future compensation with Gap Cover V1 on Ubuntu tables
Days 6-12: Cards + Fractions in parallel against one CommissionService
Days 13-18: Marketplace using the same product + Gap APIs
Days 19-25: NFT records and marketplace (production trading remains disabled until 1,400,000 Aureus shares sold)
Days 26-30: integration, reconciliation, staging first -- never silent live Aureus writes

## This foundation commit

- Dual clients: aureusRead (read-only) and ubuntu (writes)
- Auth and new rows go to Ubuntu only
- Brand: Ubuntu Afrique
- No emojis
