# 🔒 APPROVAL WORKFLOW SETUP GUIDE

## ✅ What I Built

A complete approval system where:
1. ✅ Users sign up but can't use the platform yet
2. ✅ They see a "Pending Approval" screen
3. ✅ YOU review and approve/reject each signup
4. ✅ Once approved, they get full access
5. ✅ Rejected users see the reason why

---

## 📋 SETUP STEPS (5 minutes)

### Step 1: Update Your Database Schema

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/vabynepynqlioszjqufs/editor

2. Run this SQL to ADD approval fields to existing restaurants table:

```sql
-- Add approval workflow columns to restaurants table
ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update subscription_status default for new restaurants
ALTER TABLE restaurants 
  ALTER COLUMN subscription_status SET DEFAULT 'pending_approval';

-- Update is_active default to false (requires approval)
ALTER TABLE restaurants 
  ALTER COLUMN is_active SET DEFAULT false;

-- Set existing restaurants to approved (grandfathered in)
UPDATE restaurants
SET 
  approval_status = 'approved',
  is_active = true,
  subscription_status = 'active',
  approved_at = NOW()
WHERE approval_status IS NULL OR approval_status = '';
```

3. Click **Run** ✅

---

### Step 2: Create YOUR Admin Account

Since you'll be approving signups, you need a special admin account:

1. Go to Supabase Authentication: https://supabase.com/dashboard/project/vabynepynqlioszjqufs/auth/users

2. Click "Add user" → "Create new user"
   - Email: **your-admin-email@example.com** (your personal email)
   - Password: **(create strong password)**
   - Auto Confirm User: ✅ **Check this**

3. Click "Create user"

4. Copy the **User ID** (UUID)

5. Go back to SQL Editor and run:

```sql
-- Create a special "admin restaurant" for yourself
INSERT INTO restaurants (
  name, 
  slug, 
  email, 
  is_active, 
  approval_status, 
  subscription_status,
  approved_at
)
VALUES (
  'Platform Admin',
  'platform-admin',
  'your-admin-email@example.com',  -- Your email here
  true,
  'approved',
  'active',
  NOW()
) RETURNING id;

-- Link your user to admin restaurant (replace UUIDs)
INSERT INTO staff (
  restaurant_id,
  user_id,
  first_name,
  last_name,
  email,
  role,
  is_active
)
VALUES (
  'RESTAURANT_ID_FROM_ABOVE',  -- Copy from the result above
  'YOUR_USER_ID_FROM_AUTH',    -- Your user ID from step 2.4
  'Admin',
  'User',
  'your-admin-email@example.com',
  'super_admin',
  true
);
```

---

### Step 3: Deploy Updated App

Run these commands to deploy the new signup/login pages:

```bash
cd "/Users/nishgoswami/Documents/Python Projects/ISO Apps/apps/admin-web"
vercel --prod --yes
```

---

## 🎯 HOW IT WORKS

### For New Users (Restaurant Owners):

1. **Visit:** https://admin-8kc6ey1c4-nishgoswamis-projects.vercel.app/signup
2. **Fill form** (restaurant name, owner info, email, password)
3. **Click "Create Free Account"**
4. **See "Pending Approval" screen** → Can't access dashboard yet
5. **Wait** for you to approve them

### For YOU (Platform Admin):

1. **Visit:** https://admin-8kc6ey1c4-nishgoswamis-projects.vercel.app/login
2. **Log in** with your admin email/password
3. **Go to:** https://admin-8kc6ey1c4-nishgoswamis-projects.vercel.app/admin/approvals
4. **See all pending signups** in a nice dashboard
5. **Click "Approve"** → User gets instant access
6. **OR click "Reject"** → Enter reason, user sees why

### After Approval:

1. User refreshes their "Pending" page
2. Automatically redirected to dashboard
3. Can now use the full platform
4. Menu, orders, everything unlocked

---

## 📱 NEW PAGES CREATED

| Page | URL | Purpose |
|------|-----|---------|
| **Signup** | `/signup` | New users register here |
| **Login** | `/login` | Existing users log in |
| **Pending Approval** | `/pending-approval` | Users wait here for approval |
| **Admin Approvals** | `/admin/approvals` | YOU approve/reject here |

---

## 🔐 SECURITY FEATURES

✅ **No automatic access** - All signups require YOUR approval
✅ **Email verification** - Supabase handles this
✅ **Password strength** - Minimum 6 characters (customizable)
✅ **Unique slugs** - No duplicate restaurant names
✅ **Audit trail** - Track who approved what and when
✅ **Rejection reasons** - Users know why they were rejected

---

## 💡 APPROVAL BEST PRACTICES

### ✅ Approve if:
- Real restaurant name (not "Test123")
- Valid business email (not "throwaway@gmail.com")
- Complete address info
- Phone number provided
- Looks legitimate

### ❌ Reject if:
- Obviously fake info
- Spam/bot signup
- Competitor testing your platform
- Suspicious details

### Example Rejection Reasons:
- "Please use your business email address, not a personal one"
- "We need a complete restaurant address to approve your account"
- "This appears to be a test account. Please contact support if this is a real business"

---

## 🎉 NEXT STEPS

1. ✅ Run the SQL updates (Step 1)
2. ✅ Create your admin account (Step 2)
3. ✅ Deploy the app (Step 3)
4. ✅ Test the signup flow yourself
5. ✅ Share signup link with your first real customer!

---

## 🆘 TROUBLESHOOTING

**"I can't log in to admin approvals page"**
→ Make sure you created your admin account in Step 2

**"New signups don't show up"**
→ Check Supabase > Table Editor > restaurants table for approval_status = 'pending'

**"User still sees pending after I approved"**
→ Tell them to click "Check Approval Status" button or refresh page

**"Want to change approval workflow"**
→ Edit `apps/admin-web/app/admin/approvals/page.tsx`

---

## 📊 WHERE TO FIND DATA

### See all pending approvals:
https://supabase.com/dashboard/project/vabynepynqlioszjqufs/editor

```sql
SELECT 
  r.name,
  r.email,
  r.approval_status,
  r.created_at,
  s.first_name || ' ' || s.last_name as owner_name
FROM restaurants r
LEFT JOIN staff s ON s.restaurant_id = r.id
WHERE r.approval_status = 'pending'
ORDER BY r.created_at DESC;
```

---

**Status:** ✅ Complete - Ready to deploy and use!

