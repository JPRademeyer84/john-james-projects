-- ============================================================
-- ROLLBACK SCRIPT - USE ONLY IF SOMETHING GOES WRONG
-- ============================================================
-- This script reverses ALL changes made by migrations 001 and 002
-- Run this ONLY if you need to undo the multi-project setup
-- ============================================================

-- ============================================================
-- STEP 1: Remove trigger first (prevents auto-enrollment)
-- ============================================================
DROP TRIGGER IF EXISTS trigger_auto_enroll_new_user ON users;
DROP FUNCTION IF EXISTS auto_enroll_new_user();

-- ============================================================
-- STEP 2: Remove foreign key columns from existing tables
-- ============================================================

-- Remove project_id from investments
ALTER TABLE investments DROP COLUMN IF EXISTS project_id;

-- Remove project_id from commissions
ALTER TABLE commissions DROP COLUMN IF EXISTS project_id;

-- Remove project_id from withdrawals
ALTER TABLE withdrawals DROP COLUMN IF EXISTS project_id;

-- ============================================================
-- STEP 3: Drop new tables (CASCADE removes foreign keys)
-- ============================================================

-- Drop user_projects table
DROP TABLE IF EXISTS user_projects CASCADE;

-- Drop projects table
DROP TABLE IF EXISTS projects CASCADE;

-- ============================================================
-- STEP 4: Verify rollback successful
-- ============================================================

-- Check projects table is gone
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') 
    THEN 'SUCCESS: projects table removed'
    ELSE 'ERROR: projects table still exists'
  END as projects_rollback_check;

-- Check user_projects table is gone
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_projects') 
    THEN 'SUCCESS: user_projects table removed'
    ELSE 'ERROR: user_projects table still exists'
  END as user_projects_rollback_check;

-- Check project_id column removed from investments
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'investments' AND column_name = 'project_id'
    ) 
    THEN 'SUCCESS: investments.project_id column removed'
    ELSE 'ERROR: investments.project_id column still exists'
  END as investments_rollback_check;

-- Check project_id column removed from commissions
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'commissions' AND column_name = 'project_id'
    ) 
    THEN 'SUCCESS: commissions.project_id column removed'
    ELSE 'ERROR: commissions.project_id column still exists'
  END as commissions_rollback_check;

-- ============================================================
-- STEP 5: Verify data integrity after rollback
-- ============================================================

-- Count users (should match pre-migration count)
SELECT 'Total Users After Rollback' as metric, COUNT(*) as count FROM users;

-- Count investments (should match pre-migration count)
SELECT 'Total Investments After Rollback' as metric, COUNT(*) as count FROM investments;

-- Count commissions (should match pre-migration count)
SELECT 'Total Commissions After Rollback' as metric, COUNT(*) as count FROM commissions;

-- ============================================================
-- EXPECTED RESULT:
-- All "SUCCESS" messages = Rollback complete, database back to original state
-- Any "ERROR" messages = Manual intervention needed
-- ============================================================

-- ============================================================
-- NOTES:
-- 1. All original data (users, investments, commissions) is preserved
-- 2. Only the new tables and columns are removed
-- 3. This rollback is SAFE and does not delete any user data
-- 4. You can re-run migrations 001 and 002 after rollback if needed
-- ============================================================
