-- ============================================================
-- MIGRATION 001: Multi-Project Platform Architecture
-- ============================================================
-- PURPOSE: Add project isolation without breaking existing Aureus.africa
-- STATUS: REVIEW ONLY - DO NOT EXECUTE ON LIVE DATABASE YET
-- RISK LEVEL: LOW (additive only, no deletions or modifications)
-- ============================================================

-- ============================================================
-- STEP 1: Create Projects Table
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  active BOOLEAN DEFAULT true,
  
  -- Financial configuration
  share_price DECIMAL(20, 2),
  total_shares BIGINT,
  available_shares BIGINT,
  
  -- Time constraints
  offering_start TIMESTAMPTZ,
  offering_end TIMESTAMPTZ,
  lock_period_months INTEGER DEFAULT 12,
  
  -- Commission structure (JSON)
  commission_structure JSONB DEFAULT '{}'::jsonb,
  
  -- Project-specific settings
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(active);

-- ============================================================
-- STEP 2: Create User-Project Enrollment Table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_projects (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Enrollment status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  
  -- Timestamps
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  
  -- Permissions (JSON)
  permissions JSONB DEFAULT '{"can_invest": true, "can_refer": true, "can_withdraw": true}'::jsonb,
  
  -- Metadata
  enrollment_source TEXT, -- 'auto', 'manual', 'invited'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user can't be enrolled twice in same project
  UNIQUE(user_id, project_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_project_id ON user_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON user_projects(status);
CREATE INDEX IF NOT EXISTS idx_user_projects_composite ON user_projects(user_id, project_id, status);

-- ============================================================
-- STEP 3: Extend Existing Tables (Additive Only)
-- ============================================================

-- Add project_id to investments (nullable for backward compatibility)
ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS project_id BIGINT REFERENCES projects(id);

CREATE INDEX IF NOT EXISTS idx_investments_project_id ON investments(project_id);

-- Add project_id to commissions (nullable for backward compatibility)
ALTER TABLE commissions 
ADD COLUMN IF NOT EXISTS project_id BIGINT REFERENCES projects(id);

CREATE INDEX IF NOT EXISTS idx_commissions_project_id ON commissions(project_id);

-- Add project_id to withdrawals (optional)
ALTER TABLE withdrawals 
ADD COLUMN IF NOT EXISTS project_id BIGINT REFERENCES projects(id);

CREATE INDEX IF NOT EXISTS idx_withdrawals_project_id ON withdrawals(project_id);

-- ============================================================
-- STEP 4: Seed Initial Data
-- ============================================================

-- Insert Aureus Alliance Holdings project
INSERT INTO projects (id, name, slug, domain, active, share_price, total_shares, commission_structure, config, description)
VALUES (
  1,
  'Aureus Alliance Holdings',
  'aureus-mine',
  'aureus.africa',
  true,
  50.00,
  1400000,
  '{"direct_percent": 10, "indirect_percent": 5, "top_monthly_percent": 15, "daily_pool_percent": 5}'::jsonb,
  '{"type": "gold_mining", "location": "Kadoma, Zimbabwe", "established": "2025"}'::jsonb,
  'Primary gold mining operations in Kadoma, Zimbabwe'
)
ON CONFLICT (id) DO NOTHING;

-- Insert John James Projects fractional offering
INSERT INTO projects (id, name, slug, domain, active, share_price, total_shares, available_shares, offering_start, offering_end, lock_period_months, commission_structure, config, description)
VALUES (
  2,
  'John James Projects - Fractional Offering',
  'john-james-fractional',
  'johnjames.com',
  true,
  10.00,
  500000,
  500000,
  '2026-07-19 00:00:00+00',
  '2026-08-18 23:59:59+00',
  12,
  '{"direct_usdt_percent": 10, "direct_shares_percent": 5, "top_monthly_percent": 15, "daily_pool_percent": 5}'::jsonb,
  '{"type": "fractional_shares", "parent_company": "John James Property Development", "cost_price_per_share": 50, "selling_price_per_share": 10, "window_days": 30}'::jsonb,
  '30-day fractional share offering - 500,000 shares at $10 each'
)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to continue from 3
SELECT setval('projects_id_seq', 2, true);

-- ============================================================
-- STEP 5: Enroll Existing Users into Both Projects
-- ============================================================
-- This is SAFE - it only adds new records, doesn't modify existing data
