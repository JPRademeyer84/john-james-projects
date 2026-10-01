import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const supabase = readFileSync(new URL("../src/lib/supabase.ts", import.meta.url), "utf8")
assert.match(supabase, /ubuntu\.from\(["']ua_users["']\)\.insert/, "signup writes Ubuntu ua_users only")
assert.match(supabase, /pending_aureus_provision:\s*true/, "new Ubuntu users are queued for Aureus identity, not written live")
assert.match(supabase, /\/api\/ua-login/, "Aureus users sign in through official Aureus initiate-login, not Supabase Auth")
assert.doesNotMatch(supabase, /aureusRead\.auth\.signInWithPassword/, "client no longer uses Aureus Supabase Auth password grant")
assert.doesNotMatch(supabase, /user_projects/, "no Aureus user_projects writes")
assert.match(supabase, /readAureusShareholderByEmail/, "Aureus shareholder read helper exists")

const readonly = readFileSync(new URL("../src/lib/aureusReadOnly.ts", import.meta.url), "utf8")
assert.match(readonly, /Aureus live database is read-only/, "read-only guard message present")
assert.match(readonly, /insert/, "write methods blocked")
assert.match(readonly, /AUREUS_AUTH_BLOCKED/, "only explicit Aureus auth writes are blocked")
assert.match(readonly, /signUp/, "Aureus signup remains blocked")
assert.match(readonly, /value\.bind\(authTarget\)/, "Aureus sign-in internals stay callable")

const ubuntu = readFileSync(new URL("../src/lib/ubuntuDb.ts", import.meta.url), "utf8")
assert.match(ubuntu, /fgubaqoftdeefcakejwu/, "Ubuntu client refuses Aureus project ref")
assert.match(ubuntu, /assertUbuntuWriteTarget/, "write target assertion exported")

const env = readFileSync(new URL("../.env.example", import.meta.url), "utf8")
assert.match(env, /VITE_UBUNTU_SUPABASE_URL/, "Ubuntu write env documented")
assert.match(env, /VITE_AUREUS_SUPABASE_URL/, "Aureus read env documented")
assert.match(env, /UA_COMMERCE_CONFIRM_SECRET/, "confirm/BLP close secret is documented")
assert.doesNotMatch(env, /VITE_SUPABASE_URL=https:\/\/fgubaqoftdeefcakejwu/, "old single Aureus write URL removed")

const runner = readFileSync(new URL("../deploy/run-migrations.js", import.meta.url), "utf8")
assert.match(runner, /will not connect to Aureus production/, "migration runner refuses Aureus")
assert.match(runner, /ubuntu-only/, "runner applies Ubuntu-only SQL")
assert.doesNotMatch(runner, /001_create_projects_system/, "old Aureus project-table migrations are not run")

const dashboard = readFileSync(new URL("../src/routes/dashboard/index.tsx", import.meta.url), "utf8")
assert.match(dashboard, /current\.profile/, "dashboard uses server-loaded Aureus profile")
assert.doesNotMatch(dashboard, /loadAureusMemberByAuthId/, "dashboard does not query Aureus from the browser")
assert.doesNotMatch(dashboard, /project_id/, "dashboard does not query Aureus project_id")

const uaLogin = readFileSync(new URL("../src/routes/api/ua-login.ts", import.meta.url), "utf8")
assert.match(uaLogin, /initiate-login/, "Ubuntu login proxies official Aureus bcrypt login")
assert.doesNotMatch(uaLogin, /signInWithPassword/, "login proxy does not use Supabase Auth password grant")
assert.doesNotMatch(uaLogin, /createClient/, "login admin lookup uses Aureus REST headers, not supabase-js JWT Bearer")

const uaMe = readFileSync(new URL("../src/routes/api/ua-me.ts", import.meta.url), "utf8")
assert.match(uaMe, /aureusRestMaybeSingle/, "ua-me loads Aureus profile through REST apikey headers")
assert.doesNotMatch(uaMe, /createClient/, "ua-me does not use supabase-js against sb_secret keys")
assert.match(uaMe, /warning/, "ua-me keeps the session usable if Aureus profile fetch fails")

const aureusAdmin = readFileSync(new URL("../src/lib/aureusAdminRest.server.ts", import.meta.url), "utf8")
assert.match(aureusAdmin, /charCodeAt/, "server rejects masked non-ASCII Aureus secrets")
assert.match(aureusAdmin, /apikey/, "Aureus REST sends apikey header")

const affiliate = readFileSync(new URL("../src/routes/affiliate/index.tsx", import.meta.url), "utf8")
assert.match(affiliate, /ua_users/, "affiliate reads Ubuntu users")
assert.doesNotMatch(affiliate, /project_id/, "affiliate does not query Aureus project_id")
assert.match(affiliate, /SSA/, "affiliate shows corporate ranks")
assert.doesNotMatch(affiliate, /10% USDT/, "legacy 10% USDT copy removed")
assert.doesNotMatch(affiliate, /Daily Pool/, "legacy daily pool copy removed")

const schema = readFileSync(new URL("../supabase/ubuntu-only/0003_ua_gap_cover_core.sql", import.meta.url), "utf8")
assert.match(schema, /NEVER run this on Aureus production/, "0003 refuses Aureus")
assert.match(schema, /ua_commission_transactions/, "commission ledger exists")
assert.match(schema, /nft_marketplace_enabled/, "NFT flag exists and defaults off in settings seed")

const schema4 = readFileSync(new URL("../supabase/ubuntu-only/0004_ua_cards_fractions.sql", import.meta.url), "utf8")
assert.match(schema4, /NEVER run this on Aureus production/, "0004 refuses Aureus")
assert.match(schema4, /ua_card_orders/, "card orders table exists")
assert.match(schema4, /ua_fraction_transactions/, "fraction transactions table exists")

const invest = readFileSync(new URL("../src/routes/dashboard/invest.tsx", import.meta.url), "utf8")
assert.match(invest, /checkout is not open/, "commerce checkout is not open")
assert.doesNotMatch(invest, /\/api\/invest\/purchase/, "no fake invest purchase path")
assert.doesNotMatch(invest, /\/api\/admin\/commerce\/confirm-payment/, "public invest page cannot confirm payment")

const confirmPay = readFileSync(new URL("../src/routes/api/admin/commerce/confirm-payment.ts", import.meta.url), "utf8")
assert.match(confirmPay, /UA_COMMERCE_CONFIRM_SECRET/, "payment confirm is secret-gated")
assert.match(confirmPay, /Client-supplied rank chains are rejected/, "confirm API rejects client rank chains")
assert.match(confirmPay, /processGapCover|confirmCommercePayment/, "confirm uses the shared Gap Cover path")

const processApi = readFileSync(new URL("../src/routes/api/commissions/process.ts", import.meta.url), "utf8")
assert.match(processApi, /processGapCover/, "shared Gap Cover engine is the only processor")
assert.match(processApi, /getUbuntuServerClient/, "commission writes use the Ubuntu server client")

const schema5 = readFileSync(new URL("../supabase/ubuntu-only/0005_ua_blp.sql", import.meta.url), "utf8")
assert.match(schema5, /NEVER run this on Aureus production/, "0005 refuses Aureus")
assert.match(schema5, /ua_blp_periods/, "BLP period table exists")
assert.match(schema5, /ua_blp_transactions/, "BLP transaction table exists")

const blpClose = readFileSync(new URL("../src/routes/api/admin/blp/close-period.ts", import.meta.url), "utf8")
assert.match(blpClose, /UA_COMMERCE_CONFIRM_SECRET/, "BLP close is secret-gated")
assert.match(blpClose, /Client-supplied rank chains are rejected/, "BLP close rejects client rank chains")
assert.match(blpClose, /distributeBlpPeriod/, "BLP close uses the shared BLP engine")
assert.match(blpClose, /loadBlpMembers/, "BLP members load from Ubuntu ranks and monthly volume")

const persistBlp = readFileSync(new URL("../src/lib/persistBlp.server.ts", import.meta.url), "utf8")
assert.match(persistBlp, /entry_type: "BLP"/, "BLP posts to the Ubuntu wallet ledger")
assert.doesNotMatch(persistBlp, /fgubaqoftdeefcakejwu/, "BLP persist never targets Aureus")

const ubuntuServer = readFileSync(new URL("../src/lib/ubuntuServer.server.ts", import.meta.url), "utf8")
assert.match(ubuntuServer, /Aureus production/, "commission API refuses Aureus writes")
assert.match(ubuntuServer, /loadBlpMembers/, "BLP member loader exists")
assert.match(ubuntuServer, /monthly_team_qv/, "BLP qualification uses monthly team QV")

console.log("ubuntu-afrique-db-isolation.test.mjs: OK")
