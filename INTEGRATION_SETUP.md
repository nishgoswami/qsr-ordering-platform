# Integration System - Quick Setup Guide

## Overview
This guide will help you get the third-party integration system up and running.

## Prerequisites
- Supabase project set up
- Admin web app running on port 3001
- Database migrations applied

## Step 1: Apply Database Migration

Run the integration migration to create the `integrations` table:

```bash
# From project root
cd supabase
psql -h your-supabase-url -U postgres -d your-database -f migrations/20251130000000_create_integrations_table.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

## Step 2: Verify Tables Created

Check in Supabase dashboard:
1. Go to Table Editor
2. Verify `integrations` table exists
3. Check for these columns:
   - id (uuid)
   - organization_id (uuid)
   - name (varchar)
   - slug (varchar)
   - category (enum)
   - is_enabled (boolean)
   - status (enum)
   - credentials (jsonb)
   - settings (jsonb)

## Step 3: Test Auto-Seeding

Create a test organization to verify auto-seeding works:

```sql
-- In Supabase SQL Editor
INSERT INTO organizations (name, slug) 
VALUES ('Test Restaurant', 'test-restaurant')
RETURNING id;

-- Check if 13 integrations were created
SELECT COUNT(*) FROM integrations 
WHERE organization_id = 'your-org-id-from-above';
-- Should return 13
```

## Step 4: Start Development Server

```bash
cd apps/admin-web
npm run dev
```

Navigate to: http://localhost:3001/settings/integrations

## Step 5: Test Integration Configuration

1. **View Integrations**
   - Should see 13 integrations loaded
   - Categories: Delivery (4), Email (3), Messaging (3), Payment (3)

2. **Configure an Integration**
   - Click "Configure" on Uber Eats
   - Go to Credentials tab
   - Enter dummy values:
     - API Key: `test_api_key_123`
     - Restaurant ID: `rest_456`
     - Webhook URL: `http://localhost:3001/api/webhooks/orders`
   - Click "Test Connection"
   - Should see success message
   - Click "Save Changes"
   - Refresh page - data should persist

3. **Toggle Integration**
   - Toggle Uber Eats to "enabled"
   - Check Supabase `integrations` table
   - Verify `is_enabled = true` and `status = 'active'`

## Step 6: Test Webhook Endpoint

Send a test order from Uber Eats:

```bash
curl -X POST http://localhost:3001/api/webhooks/orders \
  -H "Content-Type: application/json" \
  -H "x-platform: uber-eats" \
  -d '{
    "id": "order_test_001",
    "display_id": "1001",
    "restaurant_id": "YOUR_ORG_ID_HERE",
    "eater": {
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+14155551234",
      "email": "john.doe@example.com"
    },
    "cart": {
      "items": [
        {
          "title": "Cheeseburger",
          "quantity": 2,
          "price": 1200,
          "selected_modifier_groups": []
        },
        {
          "title": "French Fries",
          "quantity": 1,
          "price": 500,
          "selected_modifier_groups": []
        }
      ],
      "dropoff_address": {
        "street_address": "123 Main Street",
        "unit": "Apt 4B",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94102"
      }
    },
    "payment": {
      "charges": {
        "subtotal": 2900,
        "tax": 232,
        "delivery_fee": 500,
        "total": 3632
      }
    },
    "special_instructions": "Ring doorbell twice"
  }'
```

Expected response:
```json
{
  "success": true,
  "orderId": "uuid-here",
  "message": "Order received successfully"
}
```

## Step 7: Verify Order in Database

Check Supabase `orders` table:
```sql
SELECT * FROM orders 
WHERE order_source = 'uber-eats' 
ORDER BY created_at DESC 
LIMIT 1;
```

Should see the test order with:
- customer_name: "John Doe"
- order_number: "1001"
- total: 36.32
- status: "pending"

## Common Issues

### Issue: Integrations not loading
**Solution:** 
- Check browser console for errors
- Verify `@/lib/integrations` import path
- Check Supabase connection URL in env vars

### Issue: RLS policy blocking access
**Solution:**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;

-- Check if data loads now
-- Then re-enable and fix policies:
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
```

### Issue: Webhook returns 400
**Solution:**
- Verify `x-platform` header is one of: `uber-eats`, `skip-the-dishes`, `doordash`, `grubhub`
- Check JSON payload structure matches expected format
- Look at server logs for specific error

### Issue: Test connection always fails
**Solution:**
- The test functions currently use mock validation
- To enable real tests, implement actual API calls in `lib/integrations.ts`
- See TODO comments in test functions

## Next Steps

1. **Add Real Organization ID**
   - Update `'mock-org-id'` in integrations page
   - Get from Supabase Auth session

2. **Configure Production URLs**
   - Update webhook URLs for production domain
   - Set up environment variables

3. **Enable Real API Testing**
   - Implement actual API validation in test functions
   - Get API credentials from integration providers

4. **Set Up Email Notifications**
   - Configure SendGrid or SMTP
   - Test order confirmation emails

5. **Connect Kitchen Tablet**
   - Set up Supabase Realtime subscriptions
   - Show new orders instantly in kitchen app

## Environment Variables

Create `.env.local` in `apps/admin-web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Add API keys for testing real connections
UBER_EATS_API_KEY=your_uber_eats_key
STRIPE_SECRET_KEY=your_stripe_secret
SENDGRID_API_KEY=your_sendgrid_key
```

## Testing Checklist

- [ ] Database migration applied
- [ ] Integrations table created
- [ ] Auto-seeding trigger works
- [ ] Integrations page loads
- [ ] Can configure integration
- [ ] Test connection works
- [ ] Save persists to database
- [ ] Toggle updates status
- [ ] Webhook endpoint receives orders
- [ ] Orders saved to database
- [ ] No console errors

## Support Resources

- Full documentation: `INTEGRATION_IMPLEMENTATION.md`
- Database schema: `supabase/migrations/20251130000000_create_integrations_table.sql`
- Integration functions: `apps/admin-web/lib/integrations.ts`
- Webhook handler: `apps/admin-web/app/api/webhooks/orders/route.ts`
- UI component: `apps/admin-web/app/settings/integrations/page.tsx`

## Quick Links

- **Admin Integrations**: http://localhost:3001/settings/integrations
- **Admin Settings**: http://localhost:3001/settings
- **Supabase Dashboard**: https://app.supabase.com
- **Webhook Endpoint**: http://localhost:3001/api/webhooks/orders

---

**Status:** ✅ All Phase 1-4 features complete and ready for testing
