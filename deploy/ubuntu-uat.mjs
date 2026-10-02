#!/usr/bin/env node
/** Ubuntu Afrique UAT gate 1. Refuses Aureus production. Does not open checkout. */
import { planUbuntuUat } from "../src/lib/ubuntuUat.mjs"

const url = process.env.VITE_UBUNTU_SUPABASE_URL || process.env.UBUNTU_SUPABASE_URL || ""

try {
  const plan = planUbuntuUat(url)
  console.log(JSON.stringify(plan, null, 2))
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}