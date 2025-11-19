# Supabase Setup Guide

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Sign in with your GitHub account (nishgoswami)

2. **Create New Project:**
   - Click "New Project"
   - **Organization:** Select or create one (e.g., "QSR Platform")
   - **Name:** `qsr-ordering-platform-dev`
   - **Database Password:** Generate a strong password (SAVE THIS!)
   - **Region:** Choose closest to you (Canada Central or US East)
   - **Pricing Plan:** Free tier (2 projects included)
   - Click "Create new project"
   - Wait 2-3 minutes for project to initialize

3. **Get API Credentials:**
   - Once project is ready, go to **Settings** → **API**
   - Copy these values:
     - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
     - **Project API keys:**
       - `anon` `public` key (safe to use in frontend)
       - `service_role` `secret` key (keep private, server-side only)
   - Also note your **Project Reference ID** (16-20 character string)

## Step 2: Link Local Project to Supabase Cloud

```bash
# Navigate to project directory
cd "/Users/nishgoswami/Documents/Python Projects/ISO Apps"

# Link to your Supabase project (replace with your project ref ID)
supabase link --project-ref YOUR_PROJECT_REF_ID

# Enter database password when prompted
```

## Step 3: Push Database Schema

```bash
# Apply all migrations to your Supabase database
supabase db push

# This will create all 10 core tables with RLS policies
```

## Step 4: Generate TypeScript Types

```bash
# Generate TypeScript types from your database schema
supabase gen types typescript --linked > packages/types/supabase.ts
```

## Step 5: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.local.example apps/customer-web/.env.local
   cp .env.local.example apps/kitchen-tablet/.env.local
   cp .env.local.example apps/admin-web/.env.local
   ```

2. **Update each `.env.local` file with your Supabase credentials:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 6: Create Supabase Client

The Supabase client files are already created in each app:
- `apps/customer-web/lib/supabase.ts`
- `apps/kitchen-tablet/lib/supabase.ts`
- `apps/admin-web/lib/supabase.ts`

These clients automatically read from your `.env.local` files.

## Step 7: Test Database Connection

You can test the connection in any app:

```typescript
// Example: Test in customer-web app
import { supabase } from '@/lib/supabase';

async function testConnection() {
  const { data, error } = await supabase
    .from('organizations')
    .select('count')
    .single();
  
  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('Database connected successfully!');
  }
}
```

## Step 8: Enable Realtime (Optional)

For real-time order updates in kitchen app:

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `orders`
   - `order_items`
   - `messages` (for chat)

## Database Schema Summary

✅ **10 Core Tables Created:**
1. `organizations` - Restaurant/business tenants
2. `users` - User authentication and roles
3. `categories` - Menu categories
4. `menu_items` - Individual menu items
5. `item_modifiers` - Customization options
6. `orders` - Order headers
7. `order_items` - Order line items
8. `printers` - Thermal printer config
9. `delivery_zones` - Geofencing
10. `conversations` & `messages` - In-app chat

✅ **Security Features:**
- Row Level Security (RLS) enabled on all tables
- Multi-tenant isolation by organization_id
- Role-based policies (admin, staff, customer)

✅ **Advanced Features:**
- PostGIS extension for delivery geofencing
- Full-text search on menu items
- JSONB columns for flexible data
- Helper functions for address validation

## Next Steps

After Supabase is setup:
1. ✅ Create first organization (test restaurant)
2. ✅ Create admin user
3. ✅ Add sample menu items
4. ✅ Test order flow
5. ✅ Setup authentication (email/password or social)

## Troubleshooting

**Problem:** "Cannot find project ref"
- **Solution:** Make sure you've created a project in Supabase dashboard first

**Problem:** "Database password incorrect"
- **Solution:** Use the password you set when creating the project (not your Supabase account password)

**Problem:** "Migration failed"
- **Solution:** Check migration file syntax or apply migrations one at a time

**Problem:** "RLS policies blocking queries"
- **Solution:** Make sure you're authenticated or temporarily disable RLS for testing

## Useful Commands

```bash
# Check link status
supabase status

# View database schema
supabase db diff

# Reset database (DESTRUCTIVE!)
supabase db reset

# Generate new migration
supabase migration new migration_name

# Pull schema changes from remote
supabase db pull

# View logs
supabase functions logs function_name
```

## Cost Estimates

**Free Tier Includes:**
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests
- Social OAuth providers

**Paid Plans Start at $25/month** when you need:
- More database space
- Daily backups
- Custom domains
- Priority support

For testing, the FREE tier is more than enough! 🎉

---

**Last Updated:** November 18, 2025  
**Version:** 1.0.0
