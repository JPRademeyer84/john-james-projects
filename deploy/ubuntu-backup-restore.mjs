#!/usr/bin/env node
/** Ubuntu Afrique backup/restore planner. Refuses Aureus production. Does not open checkout. */
import { planUbuntuBackup, planUbuntuRestore, planUbuntuRollback } from "../src/lib/backupRestore.mjs"

const url = process.env.VITE_UBUNTU_SUPABASE_URL || process.env.UBUNTU_SUPABASE_URL || ""
const mode = String(process.argv[2] || "backup").toLowerCase()

try {
  const plan =
    mode === "restore"
      ? planUbuntuRestore(url)
      : mode === "rollback"
        ? planUbuntuRollback(url, process.argv[3])
        : planUbuntuBackup(url)
  console.log(JSON.stringify(plan, null, 2))
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}