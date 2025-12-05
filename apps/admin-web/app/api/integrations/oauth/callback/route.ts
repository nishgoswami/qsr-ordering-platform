import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * OAuth callback handler
 * POST /api/integrations/oauth/callback
 */
export async function POST(request: NextRequest) {
  try {
    const { integration_id, code, state } = await request.json();

    // Get integration details
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json(
        { success: false, message: 'Integration not found' },
        { status: 404 }
      );
    }

    // Exchange code for tokens based on provider
    const tokenData = await exchangeCodeForTokens(integration.slug, code, integration.oauth_config);

    if (!tokenData.success) {
      return NextResponse.json(
        { success: false, message: tokenData.error || 'Token exchange failed' },
        { status: 400 }
      );
    }

    // Get account information from provider
    const accountInfo = await getAccountInfo(integration.slug, tokenData.access_token);

    // Update integration with tokens and account info
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        credentials: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at
        },
        connected_account: {
          account_id: accountInfo.id,
          account_name: accountInfo.name,
          connected_at: new Date().toISOString()
        },
        status: 'active',
        is_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', integration_id);

    if (updateError) {
      console.error('Failed to update integration:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to save credentials' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected!',
      account: {
        account_id: accountInfo.id,
        account_name: accountInfo.name,
        connected_at: new Date()
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(slug: string, code: string, oauth_config: any) {
  const tokenEndpoints: Record<string, string> = {
    'uber-eats': 'https://login.uber.com/oauth/v2/token',
    'skip-the-dishes': 'https://api.skipthedishes.com/oauth/token',
    'doordash': 'https://identity.doordash.com/connect/token',
    'grubhub': 'https://api.grubhub.com/oauth/token',
    'stripe': 'https://connect.stripe.com/oauth/token',
    'square': 'https://connect.squareup.com/oauth2/token',
    'paypal': 'https://api.paypal.com/v1/oauth2/token',
    'google-workspace': 'https://oauth2.googleapis.com/token',
    'o365': 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    'twilio-sms': 'https://api.twilio.com/oauth/token'
  };

  const endpoint = tokenEndpoints[slug];
  if (!endpoint) {
    return { success: false, error: 'Unsupported provider' };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: oauth_config.client_id,
        client_secret: process.env[`${slug.toUpperCase().replace(/-/g, '_')}_CLIENT_SECRET`] || '',
        redirect_uri: oauth_config.redirect_uri
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Token exchange failed:', data);
      return { success: false, error: data.error_description || 'Token exchange failed' };
    }

    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in ? Date.now() + (data.expires_in * 1000) : null
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    return { success: false, error: 'Network error during token exchange' };
  }
}

/**
 * Get account information from provider using access token
 */
async function getAccountInfo(slug: string, accessToken: string) {
  const accountEndpoints: Record<string, string> = {
    'uber-eats': 'https://api.uber.com/v1/me',
    'skip-the-dishes': 'https://api.skipthedishes.com/v1/restaurant/profile',
    'doordash': 'https://openapi.doordash.com/drive/v2/business',
    'grubhub': 'https://api.grubhub.com/v1/restaurant/info',
    'stripe': 'https://api.stripe.com/v1/account',
    'square': 'https://connect.squareup.com/v2/merchants/me',
    'paypal': 'https://api.paypal.com/v1/identity/oauth2/userinfo',
    'google-workspace': 'https://www.googleapis.com/oauth2/v1/userinfo',
    'o365': 'https://graph.microsoft.com/v1.0/me',
    'twilio-sms': 'https://api.twilio.com/2010-04-01/Accounts.json'
  };

  const endpoint = accountEndpoints[slug];
  if (!endpoint) {
    return { id: 'unknown', name: 'Connected Account' };
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    // Extract account info based on provider response structure
    let accountInfo = { id: 'unknown', name: 'Connected Account' };

    switch (slug) {
      case 'uber-eats':
        accountInfo = { id: data.uuid, name: data.email || data.first_name };
        break;
      case 'stripe':
        accountInfo = { id: data.id, name: data.business_profile?.name || data.email };
        break;
      case 'square':
        accountInfo = { id: data.merchant?.id, name: data.merchant?.business_name };
        break;
      case 'google-workspace':
      case 'paypal':
        accountInfo = { id: data.id || data.sub, name: data.email || data.name };
        break;
      case 'o365':
        accountInfo = { id: data.id, name: data.displayName || data.mail };
        break;
      default:
        accountInfo = { 
          id: data.id || data.account_id || 'connected', 
          name: data.name || data.email || data.business_name || 'Connected Account' 
        };
    }

    return accountInfo;
  } catch (error) {
    console.error('Failed to fetch account info:', error);
    return { id: 'connected', name: 'Connected Account' };
  }
}

/**
 * Handle OAuth callback redirect (GET)
 * This handles the redirect from the OAuth provider
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings/integrations?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=missing_parameters', request.url)
    );
  }

  // Decode state to get integration_id
  try {
    const stateData = JSON.parse(atob(state));
    const integrationId = stateData.integration_id;

    // Post message to opener window to handle the callback
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Callback</title>
        </head>
        <body>
          <h2>Connecting your account...</h2>
          <p>Please wait while we complete the connection.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth_callback',
                integration_id: '${integrationId}',
                code: '${code}',
                state: '${state}'
              }, window.location.origin);
              window.close();
            } else {
              window.location.href = '/settings/integrations?success=connected';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=invalid_state', request.url)
    );
  }
}
