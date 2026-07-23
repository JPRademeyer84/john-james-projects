# API INTEGRATION GUIDE
**John James Projects ↔ Aureus.africa Backend**

---

## AUTHENTICATION FLOW (SSO)

### Endpoint: `/api/auth/login`
**Method:** POST  
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Backend Logic:**
```javascript
// 1. Authenticate with Supabase
const { data: session, error } = await supabase.auth.signInWithPassword({
  email, password
});

// 2. Check user_projects enrollment (project_id = 2 for John James)
const { data: enrollment } = await supabase
  .from('user_projects')
  .select('*')
  .eq('user_id', session.user.id)
  .eq('project_id', 2)
  .maybeSingle();

// 3. Auto-enroll if not already enrolled
if (!enrollment) {
  await supabase.from('user_projects').insert({
    user_id: session.user.id,
    project_id: 2,
    status: 'active',
    enrollment_source: 'auto'
  });
}

// 4. Return session token + user data
return { token: session.access_token, user: session.user };
```

---

### Endpoint: `/api/auth/register`
**Method:** POST  
**Body:**
```json
{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123",
  "sponsor_code": "AUR1234" // Optional
}
```

**Backend Logic:**
```javascript
// 1. Create Supabase auth user
const { data: authUser } = await supabase.auth.signUp({
  email, password
});

// 2. Find sponsor (if provided)
const sponsor = sponsor_code ? await supabase
  .from('users')
  .select('id')
  .eq('referral_code', sponsor_code)
  .single() : null;

// 3. Create user record
const newUser = await supabase.from('users').insert({
  id: authUser.user.id,
  email, username,
  sponsor_id: sponsor?.data?.id,
  referral_code: generateUniqueCode() // e.g., "JJ" + random
});

// 4. Auto-enroll in BOTH projects
await supabase.from('user_projects').insert([
  { user_id: authUser.user.id, project_id: 1, status: 'active' }, // Aureus
  { user_id: authUser.user.id, project_id: 2, status: 'active' }  // John James
]);

return { token: authUser.session.access_token, user: newUser };
```

---

## DASHBOARD DATA

### Endpoint: `/api/dashboard`
**Method:** GET  
**Headers:** `Authorization: Bearer <token>`

**Backend Logic:**
```javascript
const userId = getUserIdFromToken(token);
const PROJECT_ID = 2; // John James

// Portfolio data
const { data: portfolio } = await supabase
  .from('investments')
  .select('amount, shares, status')
  .eq('user_id', userId)
  .eq('project_id', PROJECT_ID)
  .eq('status', 'approved');

const totalShares = portfolio.reduce((sum, inv) => sum + inv.shares, 0);
const totalInvested = portfolio.reduce((sum, inv) => sum + inv.amount, 0);

// Commissions data
const { data: commissions } = await supabase
  .from('commissions')
  .select('amount, status')
  .eq('user_id', userId)
  .eq('project_id', PROJECT_ID);

const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
const pending = commissions
  .filter(c => c.status === 'pending')
  .reduce((sum, c) => sum + c.amount, 0);

// Referral data
const { data: directReferrals } = await supabase
  .from('users')
  .select('id')
  .eq('sponsor_id', userId);

return {
  portfolio: { total_shares: totalShares, total_invested: totalInvested },
  commissions: { total_earned: totalEarned, pending },
  referrals: { direct: directReferrals.length }
};
```

---

## SHARE PURCHASE

### Endpoint: `/api/invest/purchase`
**Method:** POST  
**Body:**
```json
{
  "shares": 100,
  "amount": 1000,
  "payment_method": "usdt",
  "payment_proof_url": "https://..."
}
```

**Backend Logic:**
```javascript
const userId = getUserIdFromToken(token);
const PROJECT_ID = 2; // John James
const SHARE_PRICE = 10; // $10 per share

// Validate amount
if (amount !== shares * SHARE_PRICE) {
  throw new Error('Invalid amount');
}

// Create investment record
const { data: investment } = await supabase
  .from('investments')
  .insert({
    user_id: userId,
    project_id: PROJECT_ID,
    shares, amount,
    payment_method,
    payment_proof: payment_proof_url,
    status: 'pending' // Admin approval required
  })
  .select()
  .single();

// Calculate commissions for sponsor (if exists)
const { data: user } = await supabase
  .from('users')
  .select('sponsor_id')
  .eq('id', userId)
  .single();

if (user.sponsor_id) {
  // 10% USDT + 5% shares commission
  await supabase.from('commissions').insert({
    user_id: user.sponsor_id,
    project_id: PROJECT_ID,
    amount: amount * 0.10, // 10% USDT
    shares_bonus: shares * 0.05, // 5% shares
    source_investment_id: investment.id,
    level: 1,
    type: 'direct_referral',
    status: 'pending'
  });
}

return { investment_id: investment.id, status: 'pending' };
```

---

## AFFILIATE DASHBOARD

### Endpoint: `/api/affiliate/dashboard`
**Method:** GET  
**Headers:** `Authorization: Bearer <token>`

**Backend Logic:**
```javascript
const userId = getUserIdFromToken(token);
const PROJECT_ID = 2;

// Get user's referral code
const { data: user } = await supabase
  .from('users')
  .select('referral_code')
  .eq('id', userId)
  .single();

// Get direct referrals
const { data: directReferrals } = await supabase
  .from('users')
  .select('id, username, created_at')
  .eq('sponsor_id', userId);

// Get commissions earned from John James project
const { data: commissions } = await supabase
  .from('commissions')
  .select('amount, shares_bonus, type, status, created_at')
  .eq('user_id', userId)
  .eq('project_id', PROJECT_ID)
  .order('created_at', { ascending: false });

return {
  referral_code: user.referral_code,
  direct_referrals: directReferrals,
  commissions: commissions
};
```

---

## PROJECT CONTEXT MIDDLEWARE

**All API calls must include project context:**

```javascript
// Middleware example
function validateProjectContext(req, res, next) {
  const projectId = req.headers['x-project-id'] || 2; // Default to John James
  
  if (![1, 2].includes(Number(projectId))) {
    return res.status(400).json({ error: 'Invalid project' });
  }
  
  req.projectId = Number(projectId);
  next();
}
```

---

## SECURITY NOTES

1. **Always filter by project_id** in all queries
2. **Validate user enrollment** before allowing actions
3. **Use RLS policies** on Supabase tables
4. **Never trust client-side project_id** - verify server-side
5. **Audit trail** - log all investment/commission operations
