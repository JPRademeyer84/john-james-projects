import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { test } from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"

const projectRoot = fileURLToPath(new URL("..", import.meta.url))
const enginePath = `${projectRoot}/src/lib/backupRestore.mjs`
const runnerPath = `${projectRoot}/deploy/ubuntu-backup-restore.mjs`

test("150 backup restore and rollback refuse Aureus and keep checkout closed", {
  skip: !existsSync(enginePath),
}, async () => {
  const { planUbuntuBackup, planUbuntuRestore, planUbuntuRollback } = await import(pathToFileURL(enginePath).href)
  const ubuntu = "https://rbyipalrasawbjpsppgu.supabase.co"
  const backup = planUbuntuBackup(ubuntu)
  assert.deepEqual(backup.steps, [
    "Full Ubuntu database backup",
    "Ubuntu file/media backup",
    "Ubuntu configuration backup",
  ])
  assert.equal(backup.checkoutEnabled, false)
  assert.equal(backup.nftMarketplaceEnabled, false)
  assert.equal(backup.withDataFromProduction, false)
  const restore = planUbuntuRestore(ubuntu)
  assert.match(restore.steps.join(" "), /ubuntu-db.dump/)
  assert.equal(restore.withDataFromProduction, false)
  const rollback = planUbuntuRollback(ubuntu, "0019_ua_admin_alerts.sql")
  assert.match(rollback.steps.join(" "), /Do not reverse-migrate/)
  assert.throws(
    () => planUbuntuBackup("https://fgubaqoftdeefcakejwu.supabase.co"),
    /will not connect to Aureus production/
  )
  assert.throws(
    () => planUbuntuRestore("https://fgubaqoftdeefcakejwu.supabase.co"),
    /Aureus production/
  )
})

test("150 backup runner is Ubuntu-only", {
  skip: !existsSync(runnerPath),
}, () => {
  const source = readFileSync(runnerPath, "utf8")
  assert.match(source, /planUbuntuBackup/)
  assert.match(source, /Refuses Aureus production/)
  assert.doesNotMatch(source, /--with-data/)
  assert.doesNotMatch(source, /vercel --prod/)
})