# DEPLOYMENT GUIDE - JOHN JAMES PROJECTS
**Complete Step-by-Step Deployment Instructions**

---

## PRE-DEPLOYMENT CHECKLIST

### Required Access
- [ ] Supabase admin access (fgubaqoftdeefcakejwu.supabase.co)
- [ ] Vercel account access
- [ ] GitHub repository access (JPRademeyer84/ubuntu-afrique-analyzer)

### Required Preparation
- [ ] Database backup created
- [ ] Migration scripts reviewed
- [ ] All code tested locally

---

## PHASE 1: DATABASE SETUP

### Step 1: Create Staging Environment (RECOMMENDED)

**Option A: Use Supabase Branching (if available)**
```bash
# Create a database branch for testing
# In Supabase Dashboard → Database → Branches → Create Branch
# Name: "john-james-staging"
```

**Option B: Create Separate Supabase Project**
```bash
# Go to: https://supabase.com/dashboard
# Click: New Project
# Name: "Aureus Africa - Staging"
# Copy existing database schema
```

### Step 2: Run Pre-Migration Verification

```bash
# In Supabase SQL Editor (staging first):
# Execute: migrations/000_pre_migration_backup.sql

# Review output - ensure all checks show "OK"
# Save the record counts for verification later
```

### Step 3: Execute Migrations (STAGING FIRST)

```bash
# In Supabase SQL Editor:

# Migration 1: Create multi-project tables
# Copy/paste: migrations/001_create_projects_system.sql
# Click: Run
# Verify: No errors

# Migration 2: Enroll users
# Copy/paste: migrations/002_enroll_existing_users.sql
# Click: Run
# Verify: No errors
```

### Step 4: Verify Migration Success

```sql
-- Run these verification queries:

-- Check projects created
SELECT * FROM projects;
-- Should show: Aureus (id=1) and John James (id=2)

-- Check all users enrolled
SELECT 
  p.name, 
  COUNT(up.user_id) as enrolled_users
FROM projects p
LEFT JOIN user_projects up ON p.id = up.project_id
GROUP BY p.id, p.name;
-- Should show: All users enrolled in both projects

-- Check existing data preserved
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM investments;
SELECT COUNT(*) FROM commissions;
-- Numbers should match pre-migration counts

-- Check backfill worked
SELECT 
  project_id, 
  COUNT(*) as count 
FROM investments 
GROUP BY project_id;
-- Should show: All investments have project_id = 1 (Aureus)
```

### Step 5: Test on Staging

```bash
# Update .env.local with STAGING Supabase credentials
# Run: npm run dev
# Test: Login with existing Aureus user
# Test: Register new user
# Test: View dashboard
# Verify: No errors in console
```

### Step 6: Execute on Production (AFTER STAGING SUCCESS)

**BACKUP FIRST:**
```bash
# In Supabase Dashboard → Settings → Database
# Click: Create Backup
# Wait for completion
# Verify backup exists
```

**Run Migrations:**
```bash
# Repeat Step 3 on PRODUCTION Supabase
# Repeat Step 4 verification queries
```

---

## PHASE 2: FRONTEND DEPLOYMENT

### Step 1: Configure Environment Variables

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://fgubaqoftdeefcakejwu.supabase.co
VITE_SUPABASE_ANON_KEY=<get_from_supabase_settings>
VITE_PROJECT_ID=2
```

### Step 2: Local Testing

```bash
# Install dependencies (already done)
npm install

# Start dev server
npm run dev

# Open browser: http://localhost:5173

# Test all pages:
# - Landing page (/)
# - Login (/auth/login)
# - Register (/auth/register)
# - Dashboard (/dashboard)
# - Invest (/dashboard/invest)
# - Affiliate (/affiliate)
```

### Step 3: Production Build

```bash
# Create production build
npm run build

# Test production build locally
npm run preview

# Verify no build errors
# Verify all pages work in preview mode
```

### Step 4: Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Set project name: john-james-projects
# - Select framework: Vite
```

**Option B: Vercel Dashboard**
```bash
# 1. Push code to GitHub
git add .
git commit -m "John James Projects - Complete frontend"
git push origin main

# 2. Go to: https://vercel.com/dashboard
# 3. Click: Import Project
# 4. Select: JPRademeyer84/ubuntu-afrique-analyzer
# 5. Configure:
#    - Framework: Vite
#    - Build Command: npm run build
#    - Output Directory: dist
# 6. Add Environment Variables:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY
#    - VITE_PROJECT_ID
# 7. Click: Deploy
```

### Step 5: Configure Custom Domain (Optional)

```bash
# In Vercel Dashboard:
# Project Settings → Domains
# Add domain: johnjames.com (or your custom domain)
# Follow DNS configuration instructions
# Wait for SSL certificate provisioning
```

---

## PHASE 3: EMOJI REMOVAL (AUREUS.AFRICA)

### Step 1: Clone Aureus.africa Locally

```bash
# Clone if you haven't already
git clone https://github.com/JPRademeyer84/aureus_africa.git
cd aureus_africa

# Create new branch
git checkout -b remove-emojis-professional
```

### Step 2: Run Emoji Removal Script

```bash
# Copy script from workspace
cp /workspace/analysis/remove-emojis.py ./

# Run script
python3 remove-emojis.py

# Enter path when prompted: .
# Review dry-run results
# Confirm to proceed
```

### Step 3: Test Aureus.africa

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test critical functionality:
# - Login/logout
# - Investment flow
# - Commission calculations
# - Admin panel
# - Dashboard
```

### Step 4: Commit and Deploy

```bash
# If tests pass:
git add .
git commit -m "Remove emojis for professional presentation"
git push origin remove-emojis-professional

# Create Pull Request on GitHub
# Review changes
# Merge to main

# Vercel will auto-deploy
# Monitor deployment in Vercel dashboard
```

---

## PHASE 4: FINAL VERIFICATION

### Production Checklist

**Database:**
- [ ] All migrations executed successfully
- [ ] All users enrolled in both projects
- [ ] No data loss (verify counts match)
- [ ] Sample queries return expected results

**John James Frontend:**
- [ ] Site accessible at production URL
- [ ] Login works with Aureus credentials
- [ ] New user registration works
- [ ] Dashboard displays correctly
- [ ] Investment flow works
- [ ] Affiliate dashboard loads
- [ ] No console errors

**Aureus.africa:**
- [ ] Still fully functional
- [ ] No emojis in UI
- [ ] No console errors
- [ ] All features working

**Integration:**
- [ ] SSO works (Aureus user → John James)
- [ ] Referral codes work cross-platform
- [ ] Commission tracking correct
- [ ] Data isolation verified

---

## ROLLBACK PROCEDURES

### If Database Migration Fails

```sql
-- Run: migrations/999_rollback_if_needed.sql
-- Verify all "SUCCESS" messages
-- Re-test Aureus.africa
```

### If Frontend Deployment Fails

```bash
# In Vercel Dashboard:
# Deployments → Click on working deployment
# Click: Promote to Production
```

### If Emoji Removal Causes Issues

```bash
# Restore from .backup files
find . -name "*.backup" -exec sh -c 'cp "$1" "${1%.backup}"' _ {} \;

# Or revert Git commit
git revert HEAD
git push origin main
```

---

## MONITORING & SUPPORT

### After Deployment

**Monitor for 24 hours:**
- Vercel deployment logs
- Supabase database metrics
- User registrations
- Investment submissions
- Commission calculations

**Check daily for first week:**
- Error logs
- User feedback
- Database performance
- API response times

---

## COMPLETE

All phases complete. John James Projects is now live and integrated with Aureus.africa backend.
