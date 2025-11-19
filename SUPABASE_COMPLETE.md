# Supabase Setup Complete! 🎉

## What We Just Did

✅ **Supabase CLI** - Installed and configured  
✅ **Project Initialized** - Created `supabase/` directory with config  
✅ **Database Schema** - 10 core tables ready to deploy  
✅ **Seed Data** - Demo restaurant with 25+ menu items  
✅ **Client Libraries** - Supabase helpers for all 3 apps  
✅ **Documentation** - Complete setup guide created  
✅ **Quick Start Script** - Automated deployment script  

## 📋 Next Steps (Manual Actions Required)

### 1. Create Supabase Cloud Project (2-3 minutes)

Since Docker isn't installed, we'll use **Supabase Cloud** (FREE tier):

1. **Visit:** https://supabase.com/dashboard
2. **Sign in** with your GitHub account (nishgoswami)
3. **Click "New Project"**
   - **Organization:** Create or select "QSR Platform"
   - **Name:** `qsr-ordering-platform-dev`
   - **Database Password:** Generate strong password (SAVE IT!)
   - **Region:** Canada Central or US East (closest to you)
   - **Plan:** Free (includes 2 projects)
4. **Wait 2-3 minutes** for project initialization

### 2. Link Your Local Project (30 seconds)

```bash
# Get your Project Reference ID from Supabase Dashboard
# Settings → General → Reference ID (looks like: abcdefghijklmnop)

supabase link --project-ref YOUR_PROJECT_REF_ID
# Enter the database password when prompted
```

### 3. Deploy Database Schema (1 minute)

```bash
# Run the quick-start script
./scripts/setup-supabase.sh

# Or manually:
supabase db push
supabase gen types typescript --linked > packages/types/supabase.ts
```

This will create:
- ✅ 10 core tables with RLS policies
- ✅ Demo restaurant with menu items
- ✅ TypeScript types for your database

### 4. Configure Environment Variables (2 minutes)

Get your API credentials from Supabase Dashboard:
- **Settings** → **API** → Copy these values:
  - Project URL: `https://your-ref.supabase.co`
  - `anon` `public` key
  - `service_role` `secret` key

```bash
# Copy env template to each app
cp .env.local.example apps/customer-web/.env.local
cp .env.local.example apps/kitchen-tablet/.env.local
cp .env.local.example apps/admin-web/.env.local

# Then edit each .env.local file and add:
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 5. Restart Development Servers

```bash
# Stop current servers (Ctrl+C if running)
# Then restart:
npm run dev:all
```

### 6. Create Test Admin User (1 minute)

In Supabase Dashboard:
1. **Authentication** → **Users** → **Add user**
   - Email: `admin@demo.com`
   - Password: (your choice)
   - Auto confirm: ✅ Yes
2. **Table Editor** → **users** table → **Insert row**
   - `id`: Copy from auth.users (same UUID)
   - `organization_id`: `b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c`
   - `email`: `admin@demo.com`
   - `full_name`: `Admin User`
   - `role`: `admin`
   - `can_manage_orders`: ✅ true
   - `can_manage_menu`: ✅ true
   - `can_view_reports`: ✅ true

## 🗄️ Database Schema Overview

### Core Tables (10 total):

1. **organizations** - Restaurant tenants
2. **users** - User auth & roles (admin, staff, customer)
3. **categories** - Menu categories (Burgers, Pizza, Drinks, etc.)
4. **menu_items** - Individual items with pricing
5. **item_modifiers** - Customization options (size, toppings, etc.)
6. **orders** - Order headers
7. **order_items** - Order line items
8. **printers** - Thermal printer configuration
9. **delivery_zones** - Geofencing with PostGIS
10. **conversations/messages** - In-app chat

### Seed Data Included:

- ✅ 1 Demo Restaurant
- ✅ 5 Categories (Burgers, Pizza, Sides, Drinks, Desserts)
- ✅ 15 Menu Items with descriptions & pricing
- ✅ 10+ Modifiers (sizes, extras, choices)
- ✅ 1 Delivery Zone (5km radius)
- ✅ 1 Network Printer

## 🔐 Security Features

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **Multi-tenant isolation** by organization_id  
✅ **Role-based policies** (admin, staff, customer)  
✅ **JWT authentication** built-in  

## 📚 Helpful Resources

- **Setup Guide:** `docs/setup/SUPABASE_SETUP.md`
- **Database Schema:** `docs/technical/database-schema.md`
- **Quick Start Script:** `scripts/setup-supabase.sh`
- **Supabase Clients:**
  - Customer: `apps/customer-web/lib/supabase.ts`
  - Kitchen: `apps/kitchen-tablet/lib/supabase.ts`
  - Admin: `apps/admin-web/lib/supabase.ts`

## 🧪 Testing the Connection

Once you've configured the environment variables, test the connection:

```typescript
// In any app's page.tsx
import { supabase } from '@/lib/supabase';

// Test query
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .limit(5);

console.log('Menu items:', data);
```

## 💰 Cost Estimate

**FREE Tier Includes:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

Perfect for testing! 🎉

## ⚡ Enable Realtime (Optional)

For real-time kitchen order updates:

1. **Database** → **Replication** → Enable for:
   - `orders` table
   - `order_items` table
   - `messages` table

## 🚀 What's Next?

Now that Supabase is setup, you can:

1. ✅ Build authentication UI (login/signup)
2. ✅ Create menu browsing page
3. ✅ Build order placement flow
4. ✅ Implement kitchen order display
5. ✅ Add real-time order updates
6. ✅ Create admin dashboard features

## 🆘 Troubleshooting

**"Cannot find project ref"**
→ Make sure you created project in Supabase dashboard first

**"Database password incorrect"**
→ Use the password from project creation (not your Supabase account password)

**"RLS policies blocking queries"**
→ Make sure you're authenticated or test with service_role key

**"Migrations failed"**
→ Check `supabase db diff` for conflicts

---

**Total Setup Time:** ~10 minutes  
**Difficulty:** Easy ⭐⭐☆☆☆  
**Status:** 🟢 Ready for Development

Happy coding! 🎉
