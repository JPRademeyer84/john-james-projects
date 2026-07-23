# VERIFICATION CHECKLIST
**Before Going Live - Critical Safety Checks**

---

## PRE-EXECUTION VERIFICATION

### ✅ CONFIRMED SAFE - NO LIVE CHANGES MADE
- [x] Aureus.africa repository: UNTOUCHED
- [x] Vercel deployment: UNTOUCHED  
- [x] Supabase database: UNTOUCHED
- [x] All work in `/workspace` only
- [x] No mutations to production systems

---

## DATABASE MIGRATION SAFETY CHECKS

### Before Running SQL Scripts

**Step 1: Backup Production Database**
```bash
# Create full Supabase backup before any migrations
# In Supabase Dashboard → Settings → Database → Create Backup
```

**Step 2: Test on Staging First**
- [ ] Create staging Supabase project
- [ ] Run `001_create_projects_system.sql` on staging
- [ ] Run `002_enroll_existing_users.sql` on staging
- [ ] Verify all users enrolled correctly
- [ ] Test queries work as expected
- [ ] Check no existing data was corrupted

**Step 3: Review Migration Files**
- [ ] Read `migrations/001_create_projects_system.sql` line by line
- [ ] Read `migrations/002_enroll_existing_users.sql` line by line
- [ ] Confirm NO DROP statements
- [ ] Confirm NO DELETE statements  
- [ ] Confirm only CREATE, ALTER (ADD COLUMN), INSERT, UPDATE
- [ ] Verify all foreign key constraints are valid

**Step 4: Verify Rollback Plan**
```sql
-- If something goes wrong, can rollback with:
-- DROP TABLE user_projects;
-- DROP TABLE projects;
-- ALTER TABLE investments DROP COLUMN project_id;
-- ALTER TABLE commissions DROP COLUMN project_id;
-- ALTER TABLE withdrawals DROP COLUMN project_id;
```

---

## EMOJI REMOVAL SAFETY CHECKS

### Before Running removal script

**Step 1: Create Git Branch**
```bash
cd /path/to/aureus_africa
git checkout -b remove-emojis
git status # Ensure clean working tree
```

**Step 2: Run Dry Run**
```bash
python3 /workspace/analysis/remove-emojis.py
# Review output - files to be modified
```

**Step 3: Execute Removal**
```bash
# Script will create .backup files
# After running, test the app thoroughly
```

**Step 4: Test Aureus.africa**
- [ ] Run `npm run dev` locally
- [ ] Check console for errors
- [ ] Test login/logout
- [ ] Test investment flow
- [ ] Test affiliate dashboard
- [ ] Test admin panel

**Step 5: Commit & Deploy**
```bash
git add .
git commit -m "Remove emoji from source code for professional presentation"
git push origin remove-emojis
# Create PR, review, merge
```

---

## JOHN JAMES FRONTEND DEPLOYMENT

### Before Deploying to Vercel

**Step 1: Environment Variables**
Create `.env.local` in `/workspace`:
```bash
VITE_SUPABASE_URL=https://fgubaqoftdeefcakejwu.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_PROJECT_ID=2  # John James project ID
```

**Step 2: Test Locally**
```bash
cd /workspace
npm run dev
# Open http://localhost:5173
```

**Test Checklist:**
- [ ] Landing page loads correctly
- [ ] Login page renders
- [ ] Register page renders
- [ ] Dashboard page renders (mock data OK)
- [ ] No console errors
- [ ] All links work
- [ ] Responsive design works on mobile

**Step 3: Build Test**
```bash
npm run build
# Check for build errors
# Verify dist/ folder created
```

**Step 4: Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure:
# - Set environment variables in Vercel dashboard
# - Point custom domain (johnjames.com)
# - Enable auto-deployments from GitHub
```

---

## API ENDPOINT VERIFICATION

### After Database Migrations

**Test Each Endpoint:**

**1. Authentication**
```bash
# Test login
curl -X POST https://aureus.africa/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Should return: { "token": "...", "user": {...} }
```

**2. User Projects Enrollment**
```sql
-- Verify user enrolled in both projects
SELECT u.username, p.name as project_name, up.status
FROM user_projects up
JOIN users u ON up.user_id = u.id
JOIN projects p ON up.project_id = p.id
WHERE u.email = 'test@example.com';

-- Should show 2 rows: Aureus + John James
```

**3. Investment with Project Context**
```bash
# Test creating John James investment
curl -X POST https://aureus.africa/api/invest/purchase \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"shares":10,"amount":100,"project_id":2}'

# Verify project_id = 2 in database
```

---

## PRODUCTION GO-LIVE CHECKLIST

### Final Checks Before Launch

**Database:**
- [ ] All migrations executed successfully
- [ ] All users enrolled in both projects
- [ ] Existing investments have project_id = 1 (Aureus)
- [ ] No data loss confirmed
- [ ] RLS policies active

**Frontend:**
- [ ] John James site deployed to Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] No console errors on production

**Backend:**
- [ ] All API endpoints tested
- [ ] Project context working correctly
- [ ] Commission calculations correct
- [ ] Email notifications configured
- [ ] Admin panel can see both projects

**Security:**
- [ ] JWT authentication working
- [ ] RLS policies enforcing project isolation
- [ ] No sensitive data exposed in client
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

**Monitoring:**
- [ ] Error logging configured (Sentry)
- [ ] Analytics tracking enabled
- [ ] Database performance monitoring
- [ ] API response time monitoring

---

## ROLLBACK PROCEDURES

### If Something Goes Wrong

**Database Rollback:**
```sql
-- Drop new tables (preserves all original data)
DROP TABLE user_projects CASCADE;
DROP TABLE projects CASCADE;

-- Remove added columns (preserves original data)
ALTER TABLE investments DROP COLUMN project_id;
ALTER TABLE commissions DROP COLUMN project_id;
ALTER TABLE withdrawals DROP COLUMN project_id;
```

**Frontend Rollback:**
```bash
# Pause Vercel deployment
vercel --prod rollback

# Or point domain back to old site
```

**Emoji Rollback:**
```bash
# Restore from .backup files
find . -name "*.backup" -exec sh -c 'cp "$1" "${1%.backup}"' _ {} \;
```

---

## SIGN-OFF APPROVAL

**I confirm:**
- [ ] All safety checks completed
- [ ] Backups created
- [ ] Testing completed
- [ ] Ready for production

**Approved by:** ___________________  
**Date:** ___________________
