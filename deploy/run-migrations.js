#!/usr/bin/env node
/**
 * Database Migration Runner
 * Executes SQL migrations on Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please run: ./deploy/setup-credentials.sh first');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runQuery(sql, description) {
  console.log(`\n📝 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error(`❌ Failed: ${error.message}`);
      return false;
    }
    console.log(`✅ Success`);
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return false;
  }
}

async function runMigration(filename) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`RUNNING: ${filename}`);
  console.log('='.repeat(60));
  
  const filepath = path.join(__dirname, '..', 'migrations', filename);
  
  if (!fs.existsSync(filepath)) {
    console.error(`❌ File not found: ${filepath}`);
    return false;
  }
  
  const sql = fs.readFileSync(filepath, 'utf8');
  
  // Split by major sections (marked by ============)
  const sections = sql.split(/-- =+\n/);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;
    
    // Extract description from first line if it's a comment
    const lines = section.split('\n');
    const description = lines[0].startsWith('--') 
      ? lines[0].replace(/^--\s*/, '').trim()
      : `Section ${i + 1}`;
    
    // Get actual SQL (everything after comments)
    const sqlStatements = lines
      .filter(line => !line.trim().startsWith('--') && line.trim())
      .join('\n');
    
    if (sqlStatements.trim()) {
      const success = await runQuery(sqlStatements, description);
      if (!success) {
        console.error(`\n❌ Migration failed at: ${filename}`);
        return false;
      }
    }
  }
  
  console.log(`\n✅ ${filename} completed successfully`);
  return true;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('JOHN JAMES PROJECTS - DATABASE MIGRATION');
  console.log('='.repeat(60));
  console.log('\nConnecting to Supabase...');
  console.log(`URL: ${SUPABASE_URL}`);
  
  // Test connection
  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    process.exit(1);
  }
  console.log('✅ Connected to Supabase');
  
  // Confirm before proceeding
  console.log('\n⚠️  WARNING: This will modify your production database');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Run pre-migration backup
  console.log('\n' + '='.repeat(60));
  console.log('STEP 1: PRE-MIGRATION VERIFICATION');
  console.log('='.repeat(60));
  
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: investmentCount } = await supabase.from('investments').select('*', { count: 'exact', head: true });
  const { count: commissionCount } = await supabase.from('commissions').select('*', { count: 'exact', head: true });
  
  console.log('\nCurrent database state:');
  console.log(`  Users: ${userCount}`);
  console.log(`  Investments: ${investmentCount}`);
  console.log(`  Commissions: ${commissionCount}`);
  
  // Run migrations
  const migrations = [
    '001_create_projects_system.sql',
    '002_enroll_existing_users.sql'
  ];
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error('\n❌ Migration process stopped due to errors');
      console.error('To rollback, run: node deploy/rollback.js');
      process.exit(1);
    }
  }
  
  // Verify post-migration
  console.log('\n' + '='.repeat(60));
  console.log('POST-MIGRATION VERIFICATION');
  console.log('='.repeat(60));
  
  const { data: projects } = await supabase.from('projects').select('*');
  const { count: userProjectCount } = await supabase.from('user_projects').select('*', { count: 'exact', head: true });
  
  console.log('\n✅ MIGRATION COMPLETE');
  console.log(`\nProjects created: ${projects?.length || 0}`);
  projects?.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`));
  console.log(`\nUser enrollments: ${userProjectCount}`);
  console.log(`Expected: ${userCount * 2} (${userCount} users × 2 projects)`);
  
  if (userProjectCount === userCount * 2) {
    console.log('\n🎉 All users successfully enrolled in both projects!');
  } else {
    console.log('\n⚠️  Warning: Enrollment count mismatch - please verify');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('NEXT STEPS:');
  console.log('1. Test locally: npm run dev');
  console.log('2. Deploy to Vercel: vercel --prod');
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
