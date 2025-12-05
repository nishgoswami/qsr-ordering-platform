# Third-Party Integrations Guide

## 📖 Overview

The QSR Ordering Platform supports 13 third-party integrations across payment processing, delivery platforms, email services, and messaging. All integrations use **OAuth 2.0** for secure authentication where available.

---

## 🔐 OAuth Integration Framework

### How OAuth Works

```
1. User clicks "Connect to [Platform]" in Admin Dashboard
   ↓
2. System opens OAuth authorization popup
   - Redirects to provider's login page
   - User authorizes access
   ↓
3. Provider redirects back with authorization code
   - Hits our callback endpoint: /api/integrations/[provider]/callback
   ↓
4. Backend exchanges code for access token
   - Stores token securely in integrations table
   ↓
5. Integration marked as "Connected" in UI
   - User can now use integration features
```

### Database Schema

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  provider VARCHAR(50), -- 'stripe', 'uber_eats', etc.
  type VARCHAR(50), -- 'payment', 'delivery', 'email', 'messaging'
  
  -- OAuth tokens
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Provider-specific data
  external_account_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  
  status VARCHAR(20) DEFAULT 'disconnected', -- 'connected', 'error'
  is_active BOOLEAN DEFAULT true,
  
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💳 Payment Integrations

### 1. Stripe

**Purpose:** Credit card payments, subscription billing

**OAuth Flow:**
- **Authorization URL:** `https://connect.stripe.com/oauth/authorize`
- **Scope:** `read_write`
- **Response Type:** `code`

**Features:**
- Accept credit/debit cards
- Subscription billing (auto-charge monthly)
- Refunds & disputes
- Automatic tax calculation
- PCI DSS Level 1 compliance

**Setup:**
1. Go to Admin → Settings → Integrations
2. Click "Connect" on Stripe card
3. Login to Stripe account
4. Authorize access
5. Start accepting payments

**Testing:**
- Test mode uses separate API keys
- Test cards: `4242 4242 4242 4242` (Visa), `5555 5555 5555 4444` (Mastercard)

**Webhooks:**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.failed` - Payment failed
- `customer.subscription.updated` - Subscription changed
- `invoice.paid` - Invoice paid

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### 2. Square

**Purpose:** Credit card payments, POS integration

**OAuth Flow:**
- **Authorization URL:** `https://connect.squareup.com/oauth2/authorize`
- **Scope:** `PAYMENTS_READ PAYMENTS_WRITE ORDERS_READ ORDERS_WRITE`
- **Response Type:** `code`

**Features:**
- Accept payments (in-person + online)
- Sync with Square POS
- Inventory sync
- Customer directory sync

**Setup:**
1. Admin → Settings → Integrations → Square
2. Click "Connect"
3. Login to Square
4. Grant permissions
5. Sync menu items (optional)

**Webhooks:**
- `payment.created` - New payment
- `order.created` - New order
- `inventory.count.updated` - Stock changed

**Environment Variables:**
```bash
SQUARE_APPLICATION_ID=sq0idp-...
SQUARE_APPLICATION_SECRET=sq0csp-...
```

---

### 3. PayPal

**Purpose:** PayPal & Venmo payments

**Integration Type:** API Key (not OAuth)

**Features:**
- Accept PayPal payments
- Accept Venmo payments
- Buyer protection
- International payments

**Setup:**
1. Get API credentials from PayPal Developer Dashboard
2. Admin → Settings → Integrations → PayPal
3. Enter Client ID and Secret
4. Test with sandbox account
5. Switch to live credentials when ready

**Environment Variables:**
```bash
PAYPAL_CLIENT_ID=AY...
PAYPAL_CLIENT_SECRET=EC...
PAYPAL_MODE=sandbox # or 'live'
```

---

## 🚚 Delivery Platform Integrations

### 1. Uber Eats

**Purpose:** Receive Uber Eats orders in unified dashboard

**OAuth Flow:**
- **Authorization URL:** `https://login.uber.com/oauth/v2/authorize`
- **Scope:** `eats.orders eats.store`
- **Response Type:** `code`

**Features:**
- Auto-import Uber Eats orders
- Update order status (accepted, preparing, ready)
- Sync menu items
- Real-time order notifications

**Setup:**
1. Apply for Uber Eats API access (developer.uber.com)
2. Admin → Integrations → Uber Eats
3. Connect account
4. Map menu items (one-time)
5. Orders appear in unified dashboard

**Webhooks:**
- `orders.notification` - New order received
- `orders.cancel` - Order cancelled

**Environment Variables:**
```bash
UBER_EATS_CLIENT_ID=...
UBER_EATS_CLIENT_SECRET=...
```

---

### 2. Skip The Dishes

**Purpose:** Receive Skip orders in unified dashboard

**OAuth Flow:**
- **Authorization URL:** `https://api.skipthedishes.com/oauth2/authorize`
- **Scope:** `orders:read orders:write`
- **Response Type:** `code`

**Features:**
- Auto-import Skip orders
- Update order status
- Menu sync
- Delivery tracking

**Setup:**
1. Contact Skip The Dishes API team
2. Get approved for API access
3. Admin → Integrations → Skip The Dishes
4. Connect account
5. Map menu items

**Webhooks:**
- `order.created` - New order
- `order.updated` - Status change
- `order.cancelled` - Order cancelled

**Environment Variables:**
```bash
SKIP_CLIENT_ID=...
SKIP_CLIENT_SECRET=...
```

---

### 3. DoorDash

**Purpose:** Receive DoorDash orders in unified dashboard

**OAuth Flow:**
- **Authorization URL:** `https://identity.doordash.com/connect/authorize`
- **Scope:** `orders:read orders:write`
- **Response Type:** `code`

**Features:**
- Auto-import DoorDash orders
- Real-time order updates
- Menu sync
- Dasher tracking

**Setup:**
1. Apply for DoorDash Drive API
2. Get approved (requires existing DoorDash partnership)
3. Admin → Integrations → DoorDash
4. Connect account
5. Enable auto-import

**Webhooks:**
- `order.created`
- `order.confirmed`
- `order.cancelled`
- `delivery.status_updated`

**Environment Variables:**
```bash
DOORDASH_CLIENT_ID=...
DOORDASH_CLIENT_SECRET=...
```

---

### 4. Grubhub

**Purpose:** Receive Grubhub orders in unified dashboard

**OAuth Flow:**
- **Authorization URL:** `https://api.grubhub.com/oauth/authorize`
- **Scope:** `orders menu`
- **Response Type:** `code`

**Features:**
- Auto-import Grubhub orders
- Order status sync
- Menu management
- Promotional tools

**Setup:**
1. Contact Grubhub API team
2. Get credentials
3. Admin → Integrations → Grubhub
4. Connect account
5. Configure settings

**Webhooks:**
- `order.placed`
- `order.cancelled`
- `order.delivered`

**Environment Variables:**
```bash
GRUBHUB_CLIENT_ID=...
GRUBHUB_CLIENT_SECRET=...
```

---

## 📧 Email Integrations

### 1. Microsoft O365

**Purpose:** Send transactional emails and marketing campaigns

**OAuth Flow:**
- **Authorization URL:** `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- **Scope:** `Mail.Send Mail.Read User.Read`
- **Response Type:** `code`

**Features:**
- Send order confirmations
- Send marketing emails
- Customer support email
- Email templates

**Setup:**
1. Admin → Integrations → Microsoft O365
2. Login with Microsoft account
3. Grant mail permissions
4. Configure sender email
5. Create email templates

**Environment Variables:**
```bash
O365_CLIENT_ID=...
O365_CLIENT_SECRET=...
O365_TENANT_ID=...
```

---

### 2. Google Workspace

**Purpose:** Send emails via Gmail/Google Workspace

**OAuth Flow:**
- **Authorization URL:** `https://accounts.google.com/o/oauth2/v2/auth`
- **Scope:** `https://www.googleapis.com/auth/gmail.send`
- **Response Type:** `code`

**Features:**
- Send via Gmail API
- Email templates
- Attachment support
- Read receipts

**Setup:**
1. Enable Gmail API in Google Cloud Console
2. Admin → Integrations → Google Workspace
3. Login with Google
4. Authorize Gmail access
5. Set sender email

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

### 3. SendGrid

**Purpose:** High-volume email delivery

**Integration Type:** API Key

**Features:**
- Transactional emails
- Marketing campaigns
- Email analytics
- A/B testing

**Setup:**
1. Create SendGrid account
2. Generate API key
3. Admin → Integrations → SendGrid
4. Enter API key
5. Verify sender identity

**Environment Variables:**
```bash
SENDGRID_API_KEY=SG....
```

---

## 💬 Messaging Integrations

### 1. WhatsApp Business

**Purpose:** Send order updates via WhatsApp

**OAuth Flow:**
- **Authorization URL:** `https://www.facebook.com/v18.0/dialog/oauth`
- **Scope:** `whatsapp_business_management whatsapp_business_messaging`
- **Response Type:** `code`

**Features:**
- Order confirmation messages
- Delivery status updates
- Customer support chat
- Multimedia messages (images, PDFs)

**Setup:**
1. Create Meta Business account
2. Apply for WhatsApp Business API access
3. Admin → Integrations → WhatsApp Business
4. Connect Facebook account
5. Select WhatsApp Business phone number

**Message Templates (Pre-approved):**
- Order confirmation
- Order ready for pickup
- Out for delivery
- Delivered

**Environment Variables:**
```bash
WHATSAPP_BUSINESS_ID=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

---

### 2. Twilio SMS

**Purpose:** Send SMS notifications

**Integration Type:** API Key

**Features:**
- Order status SMS
- Marketing SMS
- Two-factor authentication
- Delivery tracking links

**Setup:**
1. Create Twilio account
2. Buy phone number
3. Get Account SID and Auth Token
4. Admin → Integrations → Twilio SMS
5. Enter credentials

**Environment Variables:**
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

---

### 3. Twilio WhatsApp

**Purpose:** Send WhatsApp messages via Twilio

**OAuth Flow:**
- **Authorization URL:** `https://www.twilio.com/console/sms/whatsapp/sandbox`
- **Response Type:** `code`

**Features:**
- WhatsApp messaging without Meta approval
- Quick setup (sandbox mode)
- Multimedia messages
- Two-way messaging

**Setup:**
1. Admin → Integrations → Twilio WhatsApp
2. Connect Twilio account
3. Enable WhatsApp sandbox
4. Test with your phone
5. Apply for production access (optional)

**Environment Variables:**
```bash
TWILIO_WHATSAPP_PHONE_NUMBER=+14155238886
```

---

## 🔧 Integration Management

### Admin UI (`/admin/settings/integrations`)

**Features:**
- View all 13 integrations
- Connect/disconnect with one click
- See connection status (connected, error, disconnected)
- View last sync time
- Revoke access
- Test integration (send test message/payment)

**UI Components:**
```tsx
<IntegrationCard
  name="Stripe"
  description="Accept credit card payments"
  icon={<CreditCard />}
  status="connected"
  connectedAt="2025-11-25T10:30:00Z"
  onConnect={() => handleOAuthConnect('stripe')}
  onDisconnect={() => handleDisconnect('stripe')}
/>
```

### API Endpoints

**OAuth Flow:**
- `GET /api/integrations/[provider]/authorize` - Initiate OAuth
- `GET /api/integrations/[provider]/callback` - Handle OAuth callback
- `POST /api/integrations/[provider]/refresh` - Refresh access token

**Management:**
- `GET /api/integrations` - List all integrations
- `POST /api/integrations/[provider]/test` - Test integration
- `DELETE /api/integrations/[provider]` - Disconnect

---

## 🔒 Security Best Practices

### Token Storage
- Access tokens stored encrypted in database
- Refresh tokens used to regenerate expired tokens
- Tokens never exposed to frontend
- Server-side API calls only

### Webhook Verification
- All webhooks verify signature
- Example (Stripe):
```typescript
const signature = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Scopes
- Request minimum necessary scopes
- Example: `orders:read` instead of `all:access`

### Error Handling
- Token expired → Auto-refresh using refresh token
- Refresh failed → Mark integration as "error", prompt user to reconnect
- API rate limits → Implement exponential backoff

---

## 📊 Integration Usage by Tier

| Integration | FREE | Professional | Business | Enterprise |
|------------|------|--------------|----------|------------|
| Stripe | ✅ | ✅ | ✅ | ✅ |
| Square | ✅ | ✅ | ✅ | ✅ |
| PayPal | ❌ | ✅ | ✅ | ✅ |
| Uber Eats | ❌ | ❌ | ✅ | ✅ |
| Skip The Dishes | ❌ | ❌ | ✅ | ✅ |
| DoorDash | ❌ | ❌ | ✅ | ✅ |
| Grubhub | ❌ | ❌ | ✅ | ✅ |
| O365 Email | ❌ | ✅ | ✅ | ✅ |
| Google Workspace | ❌ | ✅ | ✅ | ✅ |
| SendGrid | ❌ | ✅ | ✅ | ✅ |
| WhatsApp Business | ❌ | ❌ | ✅ | ✅ |
| Twilio SMS | ❌ | ✅ | ✅ | ✅ |
| Twilio WhatsApp | ❌ | ✅ | ✅ | ✅ |

---

## 🧪 Testing Integrations

### Development Environment
- All integrations use sandbox/test mode
- Test credentials in `.env.local`
- Webhooks use ngrok tunnel: `https://abc123.ngrok.io`

### Test Checklist
- [ ] OAuth flow completes successfully
- [ ] Tokens stored in database
- [ ] Integration shows as "Connected" in UI
- [ ] Can disconnect and reconnect
- [ ] Webhooks received and processed
- [ ] Error states handled gracefully
- [ ] Token refresh works automatically

---

## 🆘 Troubleshooting

### OAuth Popup Blocked
**Problem:** Browser blocks OAuth popup  
**Solution:** Allow popups for your domain, or use redirect flow

### Token Expired
**Problem:** Integration shows error status  
**Solution:** System auto-refreshes tokens. If refresh fails, user must reconnect.

### Webhook Not Received
**Problem:** Webhook events not triggering  
**Solution:** 
1. Check webhook URL is publicly accessible
2. Verify signature verification logic
3. Check provider's webhook dashboard for delivery attempts
4. Test with provider's webhook testing tool

### Integration Disconnect
**Problem:** User revoked access in provider dashboard  
**Solution:** System detects on next API call, prompts user to reconnect

---

## 📚 Additional Resources

- [Stripe OAuth Docs](https://stripe.com/docs/connect/oauth-reference)
- [Square OAuth Docs](https://developer.squareup.com/docs/oauth-api/overview)
- [Uber Eats API](https://developer.uber.com/docs/eats/introduction)
- [DoorDash Drive API](https://developer.doordash.com/en-US/docs/drive/overview/)
- [Meta WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Twilio Docs](https://www.twilio.com/docs)

---

**Last Updated:** November 30, 2025
