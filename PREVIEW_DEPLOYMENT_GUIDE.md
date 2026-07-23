# 🚀 PREVIEW DEPLOYMENT GUIDE - JOHN JAMES PROJECTS

**Status:** DATABASE ✅ LIVE | CODE ✅ READY | DEPLOYMENT ⏳ MANUAL STEPS BELOW

---

## ✅ WHAT'S ALREADY DONE

### 1. Database Migration - COMPLETE ✅
- Projects table created with 2 entries
- 9,649 users enrolled in both projects
- 89,188 purchases and 67,646 commissions backfilled
- Auto-enrollment trigger active

### 2. Code Repository - COMPLETE ✅
- All frontend pages created and tested
- Supabase integration configured
- Production build successful
- Code committed to GitHub: `JPRademeyer84/ubuntu-afrique-analyzer`
- Latest commit: `940bfa0`

### 3. Vercel Configuration - COMPLETE ✅
- `vercel.json` created with correct settings
- Environment variables documented
- Build commands configured

---

## 📋 MANUAL PREVIEW DEPLOYMENT STEPS

Since Vercel CLI requires interactive authentication, here's how to deploy to preview manually:

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click: **"Add New"** → **"Project"**

### Step 2: Import Repository
1. Click: **"Import Git Repository"**
2. If you don't see `ubuntu-afrique-analyzer`:
   - Click: **"Adjust GitHub App Permissions"**
   - Grant access to `ubuntu-afrique-analyzer` repository
   - Return to Vercel
3. Click **"Import"** next to `JPRademeyer84/ubuntu-afrique-analyzer`

### Step 3: Configure Project
**Project Settings:**
```
Project Name: john-james-projects
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: .output/public
Install Command: npm install
```

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add these 3 variables:

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://fgubaqoftdeefcakejwu.supabase.co
Environment: Production, Preview, Development (all selected)
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndWJhcW9mdGRlZWZjYWtland1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDkyMTAsImV4cCI6MjA2Njg4NTIxMH0.ZdCtKWveoWqxufQ59OXGf2EXoCBjUhWe8spDvYASySI
Environment: Production, Preview, Development (all selected)
```

**Variable 3:**
```
Name: VITE_PROJECT_ID
Value: 2
Environment: Production, Preview, Development (all selected)
```

### Step 5: Deploy to Preview
**IMPORTANT:** Do NOT click "Deploy" yet!

1. Click **"Deploy"** button
2. Vercel will start building
3. Wait 2-3 minutes for build to complete
4. You'll get a preview URL like: `john-james-projects-abc123.vercel.app`

---

## 🧪 VERIFICATION CHECKLIST

### After Preview Deploys - Test These:

#### Test 1: John James Site Works ✅
1. Visit preview URL
2. Check landing page loads
3. Navigate to `/auth/login`
4. Navigate to `/auth/register`
5. Check dashboard (will need login)

#### Test 2: Aureus.africa UNCHANGED ✅
1. Visit: https://aureus.africa
2. Verify it loads normally
3. Verify login works
4. Check dashboard
5. **CONFIRM:** Nothing changed

#### Test 3: SSO Login ✅
1. Log into Aureus.africa with existing account
2. Open John James preview URL
3. Try logging in with same credentials
4. **SHOULD:** Successfully log in (SSO works)

#### Test 4: New Registration ✅
1. Go to John James `/auth/register`
2. Create new test account
3. Check it gets enrolled in both projects

#### Test 5: Database Isolation ✅
Run these queries in Supabase SQL Editor:

```sql
-- Check user enrollments
SELECT project_id, COUNT(*) 
FROM user_projects 
GROUP BY project_id;

-- Should show:
-- project_id | count
-- 1          | 9649 (or more if new users registered)
-- 2          | 9649 (or more)

-- Check data isolation
SELECT COUNT(*) FROM aureus_share_purchases WHERE project_id = 1;
SELECT COUNT(*) FROM aureus_share_purchases WHERE project_id = 2;

-- First should show 89188 (existing data)
-- Second should show 0 (no John James purchases yet)
```

---

## ✅ EXPECTED RESULTS

### What Should Happen:
1. ✅ Preview URL created (john-james-projects-xxx.vercel.app)
2. ✅ John James site loads successfully
3. ✅ Aureus.africa completely unchanged
4. ✅ SSO login works between sites
5. ✅ Database shows proper isolation
6. ✅ No errors in browser console

### What Should NOT Happen:
1. ❌ Aureus.africa affected in any way
2. ❌ Any downtime or errors
3. ❌ Data mixing between projects
4. ❌ Build failures

---

## 🚨 IF SOMETHING GOES WRONG

### Build Fails
**Check:**
- Output directory is `.output/public` (not `dist`)
- Build command is `npm run build`
- Node version is 20.x or higher

**Fix:**
- Update project settings in Vercel dashboard
- Redeploy

### Environment Variables Missing
**Symptom:** "Cannot connect to Supabase" error

**Fix:**
- Go to Project Settings → Environment Variables
- Add the 3 variables listed above
- Redeploy

### Aureus.africa Affected
**This should NOT happen**, but if it does:

**Immediate Action:**
1. Check Vercel projects list
2. Verify "aureus-africa-main" is still separate
3. Verify it's linked to `aureus_africa` repo (not ubuntu-afrique-analyzer)
4. Contact me immediately

**Rollback Database (if needed):**
```sql
-- Run migrations/999_rollback_if_needed.sql
-- This will remove the projects tables
-- Aureus.africa will continue working
```

---

## 📊 POST-DEPLOYMENT REPORT TEMPLATE

After you deploy, please check these and report back:

```
✅ Preview URL: _________________
✅ Build Status: SUCCESS / FAILED
✅ Landing Page: WORKING / ERROR
✅ Login Page: WORKING / ERROR
✅ Register Page: WORKING / ERROR
✅ Aureus.africa: UNCHANGED / AFFECTED
✅ Database Queries: CORRECT / ISSUES
```

---

## 🎯 NEXT STEPS AFTER PREVIEW SUCCESS

1. ✅ Verify all tests pass
2. ✅ Report results
3. ⏳ Promote to production (awaiting your approval)
4. ⏳ Optional: Add custom domain
5. ⏳ Optional: Remove emojis from Aureus.africa

---

## 🚀 READY TO START?

Everything is prepared and ready. Follow the steps above to:
1. Deploy to preview
2. Test thoroughly
3. Verify Aureus.africa unchanged
4. Report results

I'll be monitoring and can help troubleshoot any issues!

**Start here:** https://vercel.com/dashboard
