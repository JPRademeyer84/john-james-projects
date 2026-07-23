-- ============================================================
-- PRE-MIGRATION VERIFICATION & BACKUP QUERIES
-- ============================================================
-- Run these BEFORE executing migrations to verify safety
-- ============================================================

-- ============================================================
-- STEP 1: Count all existing records (for verification later)
-- ============================================================

-- Total users
SELECT 'Total Users' as metric, COUNT(*) as count FROM users;

-- Total investments
SELECT 'Total Investments' as metric, COUNT(*) as count, SUM(amount) as total_amount FROM investments;

-- Total commissions
SELECT 'Total Commissions' as metric, COUNT(*) as count, SUM(amount) as total_amount FROM commissions;

-- Total withdrawals
SELECT 'Total Withdrawals' as metric, COUNT(*) as count FROM withdrawals;

-- ============================================================
-- STEP 2: Check if migration tables already exist
-- ============================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') 
    THEN 'WARNING: projects table already exists'
    ELSE 'OK: projects table does not exist yet'
  END as projects_check;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_projects') 
    THEN 'WARNING: user_projects table already exists'
    ELSE 'OK: user_projects table does not exist yet'
  END as user_projects_check;

-- ============================================================
-- STEP 3: Check if columns already exist
-- ============================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'investments' AND column_name = 'project_id'
    ) 
    THEN 'WARNING: investments.project_id column already exists'
    ELSE 'OK: investments.project_id column does not exist yet'
  END as investments_project_id_check;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'commissions' AND column_name = 'project_id'
    ) 
    THEN 'WARNING: commissions.project_id column already exists'
    ELSE 'OK: commissions.project_id column does not exist yet'
  END as commissions_project_id_check;

-- ============================================================
-- STEP 4: Sample data verification
-- ============================================================

-- Show sample of users (first 5)
SELECT id, username, email, sponsor_id, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- Show sample of investments (first 5)
SELECT id, user_id, amount, shares, status, created_at 
FROM investments 
ORDER BY created_at DESC 
LIMIT 5;

-- Show sample of commissions (first 5)
SELECT id, user_id, amount, type, status, created_at 
FROM commissions 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================================
-- STEP 5: Export schema for rollback (informational)
-- ============================================================

-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- List all columns in investments table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investments' 
ORDER BY ordinal_position;

-- List all columns in commissions table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'commissions' 
ORDER BY ordinal_position;

-- ============================================================
-- STEP 6: Check for referential integrity
-- ============================================================

-- Verify all investments have valid users
SELECT 
  CASE 
    WHEN COUNT(*) = 0 
    THEN 'OK: All investments have valid users'
    ELSE CONCAT('ERROR: ', COUNT(*), ' investments have invalid user_id')
  END as integrity_check
FROM investments i
LEFT JOIN users u ON i.user_id = u.id
WHERE u.id IS NULL;

-- Verify all commissions have valid users
SELECT 
  CASE 
    WHEN COUNT(*) = 0 
    THEN 'OK: All commissions have valid users'
    ELSE CONCAT('ERROR: ', COUNT(*), ' commissions have invalid user_id')
  END as integrity_check
FROM commissions c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- ============================================================
-- EXPECTED OUTPUT:
-- If all checks show "OK", safe to proceed with migrations
-- If any "WARNING" appears, review before proceeding
-- If any "ERROR" appears, fix data integrity first
-- ============================================================
