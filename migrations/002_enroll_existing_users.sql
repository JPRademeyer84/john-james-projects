-- ============================================================
-- MIGRATION 002: Auto-Enroll Existing Users
-- ============================================================
-- PURPOSE: Give all existing Aureus users access to John James
-- STATUS: REVIEW ONLY - DO NOT EXECUTE ON LIVE DATABASE YET
-- RISK LEVEL: LOW (insert only, no updates or deletes)
-- ============================================================

-- ============================================================
-- STEP 1: Enroll ALL existing users into Aureus project (retroactive)
-- ============================================================
INSERT INTO user_projects (user_id, project_id, status, enrolled_at, enrollment_source)
SELECT 
  id as user_id,
  1 as project_id, -- Aureus Alliance Holdings
  'active' as status,
  created_at as enrolled_at, -- Use original user creation date
  'auto' as enrollment_source
FROM users
WHERE id NOT IN (
  SELECT user_id FROM user_projects WHERE project_id = 1
);

-- ============================================================
-- STEP 2: Enroll ALL existing users into John James project
-- ============================================================
INSERT INTO user_projects (user_id, project_id, status, enrolled_at, enrollment_source)
SELECT 
  id as user_id,
  2 as project_id, -- John James Fractional Offering
  'active' as status,
  NOW() as enrolled_at,
  'auto' as enrollment_source
FROM users
WHERE id NOT IN (
  SELECT user_id FROM user_projects WHERE project_id = 2
);

-- ============================================================
-- STEP 3: Backfill existing investments to Aureus project
-- ============================================================
-- This assigns all historical investments to the Aureus project
UPDATE investments 
SET project_id = 1 
WHERE project_id IS NULL;

-- ============================================================
-- STEP 4: Backfill existing commissions to Aureus project
-- ============================================================
-- This assigns all historical commissions to the Aureus project
UPDATE commissions 
SET project_id = 1 
WHERE project_id IS NULL;

-- ============================================================
-- STEP 5: Backfill existing withdrawals (optional)
-- ============================================================
-- This is optional - helps with reporting
UPDATE withdrawals 
SET project_id = 1 
WHERE project_id IS NULL;

-- ============================================================
-- STEP 6: Create trigger to auto-enroll new users
-- ============================================================
-- When a new user signs up, automatically enroll them in both projects

CREATE OR REPLACE FUNCTION auto_enroll_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Enroll in Aureus project
  INSERT INTO user_projects (user_id, project_id, status, enrollment_source)
  VALUES (NEW.id, 1, 'active', 'auto')
  ON CONFLICT (user_id, project_id) DO NOTHING;
  
  -- Enroll in John James project (only if active)
  INSERT INTO user_projects (user_id, project_id, status, enrollment_source)
  SELECT NEW.id, 2, 'active', 'auto'
  FROM projects
  WHERE id = 2 AND active = true
  ON CONFLICT (user_id, project_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_enroll_new_user ON users;
CREATE TRIGGER trigger_auto_enroll_new_user
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_new_user();

-- ============================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================

-- Check total users enrolled in each project
-- SELECT p.name, COUNT(up.user_id) as enrolled_users
-- FROM projects p
-- LEFT JOIN user_projects up ON p.id = up.project_id
-- GROUP BY p.id, p.name;

-- Check users with access to both projects
-- SELECT COUNT(*) as users_with_both_projects
-- FROM users u
-- WHERE EXISTS (SELECT 1 FROM user_projects WHERE user_id = u.id AND project_id = 1)
--   AND EXISTS (SELECT 1 FROM user_projects WHERE user_id = u.id AND project_id = 2);

-- Check investments by project
-- SELECT 
--   p.name,
--   COUNT(i.id) as total_investments,
--   SUM(i.amount) as total_amount,
--   SUM(i.shares) as total_shares
-- FROM projects p
-- LEFT JOIN investments i ON p.id = i.project_id
-- GROUP BY p.id, p.name;
