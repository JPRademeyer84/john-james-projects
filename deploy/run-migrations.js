#!/usr/bin/env node
/**
 * Ubuntu Afrique migration runner.
 * Applies SQL from supabase/ubuntu-only/ only.
 * Refuses Aureus production (fgubaqoftdeefcakejwu).
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const AUREUS_PROD_REF = "fgubaqoftdeefcakejwu";
const url = process.env.VITE_UBUNTU_SUPABASE_URL || process.env.UBUNTU_SUPABASE_URL || "";
const key = process.env.UBUNTU_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

if (!url || !key) {
  console.error("Missing Ubuntu Afrique database credentials. Set VITE_UBUNTU_SUPABASE_URL and UBUNTU_SUPABASE_SERVICE_KEY.");
  process.exit(1);
}

if (url.includes(AUREUS_PROD_REF)) {
  console.error("Refused. This runner will not connect to Aureus production.");
  process.exit(1);
}

const dir = path.join(__dirname, "..", "supabase", "ubuntu-only");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const supabase = createClient(url, key);

async function main() {
  console.log("Ubuntu Afrique migrations only. Target:", url);
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql });
    if (error) {
      console.error("Failed:", file, error.message);
      console.error("Apply the SQL in the Ubuntu Afrique Supabase SQL editor if exec_sql is not available.");
      process.exit(1);
    }
    console.log("Applied", file);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
