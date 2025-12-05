# 🚀 Deployment Instructions

## Status: Partial Success ✅

### Deployed Successfully:
1. ✅ **Project Tracker**: https://project-tracker-h6mtxbg98-nishgoswamis-projects.vercel.app

### Pending Deployment (Need Environment Variables):
1. ❌ **Admin Dashboard** (`admin-web`) - Blocked by missing Supabase env vars
2. ❌ **Customer Website** (`customer-web`) - Pending
3. ❌ **Kitchen Display** (`kitchen-tablet`) - Pending

---

## 🔑 Required: Set Up Supabase First

Before deploying the main apps, you need a Supabase project. Here's how:

### Option 1: Use Existing Supabase Project (If you have one)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings > API**
4. Copy these values:
   - **Project URL** (starts with `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`, keep this SECRET!)

### Option 2: Create New Supabase Project (Recommended for testing)
1. Go to https://supabase.com/dashboard
2. Click **+ New Project**
3. Fill in:
   - **Name**: Your Restaurant Name (e.g., "Nish Family Restaurant")
   - **Database Password**: Create a strong password and **SAVE IT**
   - **Region**: Choose closest to you (e.g., "US East")
   - **Pricing Plan**: Select **FREE** (perfect for testing)
4. Wait 2-3 minutes for project to initialize
5. Once ready, go to **Settings > API** and copy the keys (see Option 1 above)

---

## 📝 Configure Environment Variables in Vercel

Once you have your Supabase keys, add them to each Vercel project:

### For Admin Dashboard:
1. Go to: https://vercel.com/nishgoswamis-projects/admin-web/settings/environment-variables
2. Add these variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Your Supabase anon public key |

3. **IMPORTANT**: Select **Production, Preview, Development** for both variables
4. Click **Save**

### For Customer Website:
1. Go to: https://vercel.com/nishgoswamis-projects/customer-web/settings/environment-variables (when project is created)
2. Add the SAME two variables as above

### For Kitchen Tablet:
1. Go to: https://vercel.com/nishgoswamis-projects/kitchen-tablet/settings/environment-variables (when project is created)
2. Add the SAME two variables as above

---

## 🎯 Quick Deployment After Environment Setup

Once environment variables are set in Vercel, run these commands:

```bash
# Deploy Admin Dashboard
cd "/Users/nishgoswami/Documents/Python Projects/ISO Apps/apps/admin-web"
vercel --prod --yes

# Deploy Customer Website
cd "../customer-web"
vercel --prod --yes

# Deploy Kitchen Display
cd "../kitchen-tablet"
vercel --prod --yes
```

Each deployment takes about 1-2 minutes.

---

## ✅ Verification Checklist

After all deployments succeed, you'll have:

- [ ] **Project Tracker** (Already live!) - For your reference
- [ ] **Admin Dashboard** - Where you manage menu, orders, staff
- [ ] **Customer Website** - Where customers browse menu and order
- [ ] **Kitchen Display** - Real-time order display for kitchen staff

---

## 🎉 First Steps After Deployment

1. **Open Admin Dashboard** URL (you'll get this after deployment)
2. **Create your first restaurant account**
3. **Add menu items** (you can import from GloriaFood menu)
4. **Generate QR code** for your restaurant
5. **Test first order** using Customer Website URL
6. **View order** on Kitchen Display

---

## 🆘 If You Get Stuck

**Error: "supabaseUrl is required"**
→ You need to add the environment variables in Vercel (see section above)

**Error: Build failed**
→ Make sure you're using the correct Supabase URL format: `https://xxxxx.supabase.co`

**Can't find environment variables page**
→ Go to your project → Click "Settings" tab → Click "Environment Variables" from sidebar

---

## 📞 Need Help?

Let me know if you:
- Need help creating the Supabase project
- Can't find the API keys
- Get any errors during deployment
- Need to import your GloriaFood menu

I'm here to help! 🚀
