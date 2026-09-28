import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const supabase = readFileSync(new URL("../src/lib/supabase.ts", import.meta.url), "utf8")
assert.match(supabase, /ubuntu\.from\('ua_users'\)\.insert/, "signup writes Ubuntu ua_users only")
assert.doesNotMatch(supabase, /user_projects/, "no Aureus user_projects writes")
assert.match(supabase, /readAureusShareholderByEmail/, "Aureus shareholder read helper exists")

const readonly = readFileSync(new URL("../src/lib/aureusReadOnly.ts", import.meta.url), "utf8")
assert.match(readonly, /Aureus live database is read-only/, "read-only guard message present")
assert.match(readonly, /insert/, "write methods blocked")

const ubuntu = readFileSync(new URL("../src/lib/ubuntuDb.ts", import.meta.url), "utf8")
assert.match(ubuntu, /fgubaqoftdeefcakejwu/, "Ubuntu client refuses Aureus project ref")
assert.match(ubuntu, /assertUbuntuWriteTarget/, "write target assertion exported")

const env = readFileSync(new URL("../.env.example", import.meta.url), "utf8")
assert.match(env, /VITE_UBUNTU_SUPABASE_URL/, "Ubuntu write env documented")
assert.match(env, /VITE_AUREUS_SUPABASE_URL/, "Aureus read env documented")
assert.doesNotMatch(env, /VITE_SUPABASE_URL=https:\/\/fgubaqoftdeefcakejwu/, "old single Aureus write URL removed")

const runner = readFileSync(new URL("../deploy/run-migrations.js", import.meta.url), "utf8")
assert.match(runner, /will not connect to Aureus production/, "migration runner refuses Aureus")
assert.match(runner, /ubuntu-only/, "runner applies Ubuntu-only SQL")
assert.doesNotMatch(runner, /001_create_projects_system/, "old Aureus project-table migrations are not run")

const dashboard = readFileSync(new URL("../src/routes/dashboard/index.tsx", import.meta.url), "utf8")
assert.match(dashboard, /ua_users/, "dashboard reads Ubuntu users")
assert.doesNotMatch(dashboard, /project_id/, "dashboard does not query Aureus project_id")

const affiliate = readFileSync(new URL("../src/routes/affiliate/index.tsx", import.meta.url), "utf8")
assert.match(affiliate, /ua_users/, "affiliate reads Ubuntu users")
assert.doesNotMatch(affiliate, /project_id/, "affiliate does not query Aureus project_id")

console.log("ubuntu-afrique-db-isolation.test.mjs: OK")
