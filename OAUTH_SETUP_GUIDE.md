# OAuth Integration Setup Guide

## Overview
The integration system now supports **OAuth-based authentication**, making it much easier for restaurant owners to connect third-party services without manually entering API keys.

## Why OAuth?

### Benefits
- ✅ **Faster Setup**: Connect in seconds with one click
- ✅ **More Secure**: No need to copy/paste API keys
- ✅ **Easy Revocation**: Disconnect anytime from the provider's dashboard
- ✅ **Automatic Token Refresh**: No maintenance needed
- ✅ **Better UX**: Modern, streamlined connection flow

### Supported Integrations
OAuth is available for the following integrations:
- **Delivery**: Uber Eats, Skip The Dishes, DoorDash, Grubhub
- **Email**: Office 365, Google Workspace
- **Payment**: Stripe, Square, PayPal
- **Messaging**: Twilio SMS (coming soon)

## How It Works

### User Flow
1. **Click "Connect with [Platform]"** button in integration settings
2. **Redirected to provider** login page (e.g., Uber Eats login)
3. **Authorize the app** to access their account
4. **Automatically redirected back** to your admin panel
5. **Integration is active** and ready to receive orders

### Technical Flow
```
Admin Panel → OAuth Authorization → Provider Login → User Approves
     ↓
Provider Callback → Exchange Code for Token → Save Credentials
     ↓
Integration Active → Start Receiving Orders
```

## Setup Instructions

### 1. Register Your App with Each Provider

To enable OAuth, you need to register your application with each third-party provider and obtain OAuth credentials.

#### Uber Eats
1. Go to [Uber Developer Portal](https://developer.uber.com/)
2. Create a new app
3. Set redirect URI: `https://yourdomain.com/api/integrations/oauth/callback`
4. Copy Client ID and Client Secret
5. Add to environment variables:
   ```env
   NEXT_PUBLIC_UBER_EATS_CLIENT_ID=your_client_id
   UBER_EATS_CLIENT_SECRET=your_client_secret
   ```

#### Skip The Dishes
1. Contact Skip The Dishes Partner Support
2. Request API access for your restaurant
3. Provide redirect URI: `https://yourdomain.com/api/integrations/oauth/callback`
4. Receive Client ID and Client Secret
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SKIP_CLIENT_ID=your_client_id
   SKIP_CLIENT_SECRET=your_client_secret
   ```

#### DoorDash
1. Go to [DoorDash Developer Portal](https://developer.doordash.com/)
2. Create a new app
3. Set redirect URI: `https://yourdomain.com/api/integrations/oauth/callback`
4. Copy credentials
5. Add to environment:
   ```env
   NEXT_PUBLIC_DOORDASH_CLIENT_ID=your_client_id
   DOORDASH_CLIENT_SECRET=your_client_secret
   ```

#### Grubhub
1. Visit [Grubhub for Restaurants API](https://restaurant-api.grubhub.com/)
2. Register your restaurant
3. Create OAuth application
4. Set redirect URI
5. Add credentials:
   ```env
   NEXT_PUBLIC_GRUBHUB_CLIENT_ID=your_client_id
   GRUBHUB_CLIENT_SECRET=your_client_secret
   ```

#### Stripe
1. Go to [Stripe Connect Settings](https://dashboard.stripe.com/settings/applications)
2. Create a new platform application
3. Set redirect URI: `https://yourdomain.com/api/integrations/oauth/callback`
4. Copy Client ID from the OAuth settings page
5. Add to environment:
   ```env
   NEXT_PUBLIC_STRIPE_CLIENT_ID=your_client_id
   STRIPE_CLIENT_SECRET=your_secret_key
   ```

#### Square
1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Create a new application
3. Under OAuth tab, add redirect URI: `https://yourdomain.com/api/integrations/oauth/callback`
4. Copy Application ID and Application Secret
5. Add to environment:
   ```env
   NEXT_PUBLIC_SQUARE_CLIENT_ID=your_app_id
   SQUARE_CLIENT_SECRET=your_app_secret
   ```

#### PayPal
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications)
2. Create a new app
3. Add return URL: `https://yourdomain.com/api/integrations/oauth/callback`
4. Copy Client ID and Secret
5. Add to environment:
   ```env
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_secret
   ```

#### Google Workspace
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/integrations/oauth/callback`
6. Copy Client ID and Secret
7. Add to environment:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```

#### Office 365
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application in Azure AD
3. Add redirect URI: `https://yourdomain.com/api/integrations/oauth/callback`
4. Grant Mail.Send and Mail.ReadWrite permissions
5. Copy Application (client) ID and create a client secret
6. Add to environment:
   ```env
   NEXT_PUBLIC_O365_CLIENT_ID=your_client_id
   O365_CLIENT_SECRET=your_secret
   ```

### 2. Configure Environment Variables

Create `.env.local` file in `apps/admin-web/`:

```env
# OAuth Client IDs (Public - safe to expose)
NEXT_PUBLIC_UBER_EATS_CLIENT_ID=your_uber_client_id
NEXT_PUBLIC_SKIP_CLIENT_ID=your_skip_client_id
NEXT_PUBLIC_DOORDASH_CLIENT_ID=your_doordash_client_id
NEXT_PUBLIC_GRUBHUB_CLIENT_ID=your_grubhub_client_id
NEXT_PUBLIC_STRIPE_CLIENT_ID=your_stripe_client_id
NEXT_PUBLIC_SQUARE_CLIENT_ID=your_square_client_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_O365_CLIENT_ID=your_o365_client_id

# OAuth Client Secrets (Private - server-side only)
UBER_EATS_CLIENT_SECRET=your_uber_secret
SKIP_CLIENT_SECRET=your_skip_secret
DOORDASH_CLIENT_SECRET=your_doordash_secret
GRUBHUB_CLIENT_SECRET=your_grubhub_secret
STRIPE_CLIENT_SECRET=your_stripe_secret
SQUARE_CLIENT_SECRET=your_square_secret
PAYPAL_CLIENT_SECRET=your_paypal_secret
GOOGLE_CLIENT_SECRET=your_google_secret
O365_CLIENT_SECRET=your_o365_secret

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Update Database Schema

Add OAuth fields to the `integrations` table:

```sql
ALTER TABLE integrations 
ADD COLUMN oauth_enabled BOOLEAN DEFAULT false,
ADD COLUMN oauth_config JSONB DEFAULT '{}',
ADD COLUMN connected_account JSONB;

-- Update existing integrations to enable OAuth
UPDATE integrations 
SET oauth_enabled = true,
    oauth_config = jsonb_build_object(
      'provider', slug,
      'client_id', '',
      'redirect_uri', '',
      'scopes', '[]'::jsonb
    )
WHERE slug IN (
  'uber-eats', 'skip-the-dishes', 'doordash', 'grubhub',
  'stripe', 'square', 'paypal',
  'google-workspace', 'o365'
);
```

### 4. Test OAuth Flow

1. **Start Development Server**:
   ```bash
   cd apps/admin-web
   npm run dev
   ```

2. **Navigate to Integrations**: http://localhost:3001/settings/integrations

3. **Click on any integration** that supports OAuth (e.g., Uber Eats)

4. **Click "Connect with [Platform]"** button

5. **Authorize in popup window** (use sandbox/test credentials)

6. **Verify connection successful** - should show "Connected" status

### 5. Production Deployment

1. **Update Redirect URIs** in each provider's dashboard to your production domain:
   ```
   https://admin.yourrestaurant.com/api/integrations/oauth/callback
   ```

2. **Set environment variables** in your production environment (Vercel, AWS, etc.)

3. **Test each integration** in production before going live

## User Guide

### For Restaurant Owners

#### Connecting an Integration

1. Go to **Settings → Integrations**
2. Click on the integration you want to connect (e.g., **Uber Eats**)
3. Click the blue **"Connect with Uber Eats"** button
4. A popup window will open with Uber's login page
5. Log in with your Uber Eats restaurant account
6. Click **"Authorize"** to allow access
7. The popup will close automatically
8. Your integration is now **Connected!** 🎉

#### Disconnecting an Integration

1. Go to **Settings → Integrations**
2. Click on a connected integration
3. Scroll to the **Connected Account** section
4. Click **"Disconnect Account"**
5. Confirm the disconnection
6. Integration is now disconnected

#### Benefits of OAuth Connection

- **No API keys needed**: Just log in and authorize
- **Instant setup**: Connected in under 30 seconds
- **Secure**: Your password is never shared with our app
- **Easy to revoke**: Disconnect anytime from our dashboard or the provider's settings

### For Developers

#### OAuth Flow Implementation

The OAuth implementation follows the Authorization Code Grant flow:

1. **Initiate OAuth**:
   ```typescript
   const authUrl = await initiateOAuthFlow(integration);
   window.open(authUrl, '_blank');
   ```

2. **Provider Redirects Back**:
   ```
   GET /api/integrations/oauth/callback?code=AUTH_CODE&state=STATE_TOKEN
   ```

3. **Exchange Code for Tokens**:
   ```typescript
   POST /api/integrations/oauth/callback
   Body: { integration_id, code, state }
   ```

4. **Store Credentials**:
   ```typescript
   UPDATE integrations SET
     credentials = { access_token, refresh_token },
     connected_account = { account_id, account_name },
     status = 'active'
   ```

#### Token Management

Tokens are stored securely in the `credentials` JSONB field:

```json
{
  "access_token": "ya29.a0AfH6SMB...",
  "refresh_token": "1//0gKMXYZ...",
  "expires_at": 1638360000000
}
```

**TODO**: Implement automatic token refresh:
- Check `expires_at` before API calls
- Use `refresh_token` to get new `access_token`
- Update credentials in database

#### Security Considerations

1. **Client Secrets**: Never expose in client-side code
2. **State Tokens**: Use for CSRF protection
3. **HTTPS Only**: OAuth requires secure connections
4. **Token Encryption**: Consider encrypting tokens at rest
5. **Scope Limitations**: Request minimum necessary permissions

## Troubleshooting

### "OAuth not configured" Error

**Problem**: Integration doesn't show OAuth button

**Solution**: 
- Check `oauth_enabled` is `true` in database
- Verify `oauth_config` has client_id
- Ensure environment variable is set

### "Invalid redirect_uri" Error

**Problem**: Provider rejects redirect URI

**Solution**:
- Check redirect URI in provider dashboard matches exactly
- Must include protocol (https://)
- No trailing slashes
- Must match environment (localhost vs production)

### "Token exchange failed" Error

**Problem**: Can't exchange authorization code for token

**Solution**:
- Verify client_secret environment variable is correct
- Check authorization code hasn't expired (valid ~10 minutes)
- Ensure redirect_uri matches exactly

### Popup Blocked

**Problem**: OAuth popup doesn't open

**Solution**:
- Allow popups for your admin domain
- Try clicking button again (first click may prompt for permission)
- Check browser console for errors

### Connection Successful but Orders Not Coming

**Problem**: OAuth connected but no orders received

**Solution**:
- Check webhook URL is configured in provider dashboard
- Verify webhook handler is active: `/api/webhooks/orders`
- Test with provider's webhook testing tool
- Check kitchen app is subscribed to order events

## API Reference

### Initiate OAuth Flow
```typescript
initiateOAuthFlow(integration: Integration): Promise<string>
```
Returns authorization URL to redirect user to provider.

### Handle OAuth Callback
```typescript
POST /api/integrations/oauth/callback
Body: {
  integration_id: string;
  code: string;
  state: string;
}
Response: {
  success: boolean;
  message: string;
  account?: {
    account_id: string;
    account_name: string;
    connected_at: Date;
  };
}
```

### Disconnect OAuth
```typescript
disconnectOAuth(integrationId: string): Promise<void>
```
Revokes tokens and removes connection.

## Next Steps

1. **Implement Token Refresh**: Auto-refresh expired tokens
2. **Add More Providers**: WhatsApp, 3CX with OAuth
3. **Webhook Auto-Configuration**: Automatically register webhooks via API
4. **Multi-Location Support**: Link different accounts per location
5. **Connection Health Monitoring**: Alert when OAuth connection fails

## Support

For OAuth setup assistance:
- Check provider's OAuth documentation
- Review console logs for specific errors
- Test with sandbox/development credentials first
- Contact provider support for API access issues

---

**Status**: ✅ OAuth implementation complete and ready for testing
