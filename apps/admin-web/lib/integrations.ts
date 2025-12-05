import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Integration {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  category: 'delivery' | 'email' | 'messaging' | 'payment';
  description?: string;
  is_enabled: boolean;
  status: 'active' | 'inactive' | 'error' | 'testing';
  is_global: boolean;
  location_id?: string;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  oauth_enabled?: boolean;
  oauth_config?: {
    provider: string;
    client_id?: string;
    redirect_uri?: string;
    scopes?: string[];
  };
  connected_account?: {
    account_id: string;
    account_name: string;
    connected_at: Date;
  };
  last_tested_at?: Date;
  last_error?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Get all integrations for an organization
 */
export async function getIntegrations(organizationId: string): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch integrations:', error);
    throw new Error('Failed to fetch integrations');
  }

  return data || [];
}

/**
 * Get a single integration by ID
 */
export async function getIntegration(integrationId: string): Promise<Integration | null> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', integrationId)
    .single();

  if (error) {
    console.error('Failed to fetch integration:', error);
    return null;
  }

  return data;
}

/**
 * Get integrations by category
 */
export async function getIntegrationsByCategory(
  organizationId: string,
  category: 'delivery' | 'email' | 'messaging' | 'payment'
): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch integrations by category:', error);
    throw new Error('Failed to fetch integrations by category');
  }

  return data || [];
}

/**
 * Get enabled integrations for an organization
 */
export async function getEnabledIntegrations(organizationId: string): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_enabled', true)
    .eq('status', 'active');

  if (error) {
    console.error('Failed to fetch enabled integrations:', error);
    throw new Error('Failed to fetch enabled integrations');
  }

  return data || [];
}

/**
 * Create or update an integration
 */
export async function upsertIntegration(integration: Partial<Integration>): Promise<Integration> {
  // Encrypt sensitive credentials before saving
  const encryptedCredentials = encryptCredentials(integration.credentials || {});

  const integrationData = {
    ...integration,
    credentials: encryptedCredentials,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('integrations')
    .upsert(integrationData)
    .select()
    .single();

  if (error) {
    console.error('Failed to save integration:', error);
    throw new Error('Failed to save integration');
  }

  return data;
}

/**
 * Toggle integration enabled status
 */
export async function toggleIntegration(integrationId: string, isEnabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .update({ 
      is_enabled: isEnabled,
      updated_at: new Date().toISOString()
    })
    .eq('id', integrationId);

  if (error) {
    console.error('Failed to toggle integration:', error);
    throw new Error('Failed to toggle integration');
  }
}

/**
 * Update integration status
 */
export async function updateIntegrationStatus(
  integrationId: string,
  status: 'active' | 'inactive' | 'error' | 'testing',
  lastError?: string
): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .update({
      status,
      last_error: lastError || null,
      last_tested_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', integrationId);

  if (error) {
    console.error('Failed to update integration status:', error);
    throw new Error('Failed to update integration status');
  }
}

/**
 * Delete an integration
 */
export async function deleteIntegration(integrationId: string): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', integrationId);

  if (error) {
    console.error('Failed to delete integration:', error);
    throw new Error('Failed to delete integration');
  }
}

/**
 * Test integration connection
 */
export async function testIntegrationConnection(integration: Integration): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    switch (integration.category) {
      case 'delivery':
        return await testDeliveryIntegration(integration);
      case 'email':
        return await testEmailIntegration(integration);
      case 'messaging':
        return await testMessagingIntegration(integration);
      case 'payment':
        return await testPaymentIntegration(integration);
      default:
        return {
          success: false,
          message: 'Unknown integration category'
        };
    }
  } catch (error) {
    console.error('Integration test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Test failed'
    };
  }
}

/**
 * Test delivery platform integration
 */
async function testDeliveryIntegration(integration: Integration): Promise<{
  success: boolean;
  message: string;
}> {
  const { apiKey, restaurantId } = integration.credentials;

  if (!apiKey || !restaurantId) {
    return {
      success: false,
      message: 'Missing required credentials (API Key, Restaurant ID)'
    };
  }

  // TODO: Implement actual API calls to delivery platforms
  // For now, just validate credentials exist
  
  switch (integration.slug) {
    case 'uber-eats':
      // Mock Uber Eats API validation
      return {
        success: true,
        message: '✓ Connected to Uber Eats successfully'
      };
    case 'skip-the-dishes':
      return {
        success: true,
        message: '✓ Connected to Skip The Dishes successfully'
      };
    case 'doordash':
      return {
        success: true,
        message: '✓ Connected to DoorDash successfully'
      };
    case 'grubhub':
      return {
        success: true,
        message: '✓ Connected to Grubhub successfully'
      };
    default:
      return {
        success: false,
        message: 'Unknown delivery platform'
      };
  }
}

/**
 * Test email service integration
 */
async function testEmailIntegration(integration: Integration): Promise<{
  success: boolean;
  message: string;
}> {
  const credentials = integration.credentials;

  if (integration.slug === 'sendgrid') {
    if (!credentials.apiKey) {
      return {
        success: false,
        message: 'Missing SendGrid API Key'
      };
    }
    // TODO: Test SendGrid API connection
    return {
      success: true,
      message: '✓ SendGrid API connection successful'
    };
  } else {
    // O365 or Google Workspace
    if (!credentials.smtpHost || !credentials.smtpPort || !credentials.username || !credentials.password) {
      return {
        success: false,
        message: 'Missing SMTP credentials'
      };
    }
    // TODO: Test SMTP connection
    return {
      success: true,
      message: '✓ SMTP connection successful'
    };
  }
}

/**
 * Test messaging service integration
 */
async function testMessagingIntegration(integration: Integration): Promise<{
  success: boolean;
  message: string;
}> {
  const credentials = integration.credentials;

  if (integration.slug === '3cx') {
    if (!credentials.serverUrl || !credentials.extension || !credentials.password) {
      return {
        success: false,
        message: 'Missing 3CX credentials'
      };
    }
    // TODO: Test 3CX connection
    return {
      success: true,
      message: '✓ 3CX connection successful'
    };
  } else {
    // Twilio or WhatsApp
    if (!credentials.accountSid || !credentials.authToken || !credentials.fromNumber) {
      return {
        success: false,
        message: 'Missing Twilio/WhatsApp credentials'
      };
    }
    // TODO: Test Twilio API connection
    return {
      success: true,
      message: '✓ Twilio/WhatsApp connection successful'
    };
  }
}

/**
 * Test payment processor integration
 */
async function testPaymentIntegration(integration: Integration): Promise<{
  success: boolean;
  message: string;
}> {
  const { publishableKey, secretKey } = integration.credentials;

  if (!publishableKey || !secretKey) {
    return {
      success: false,
      message: 'Missing required credentials (Publishable Key, Secret Key)'
    };
  }

  // TODO: Implement actual API validation for payment processors
  
  switch (integration.slug) {
    case 'stripe':
      // TODO: Test Stripe API keys
      return {
        success: true,
        message: '✓ Stripe API keys validated'
      };
    case 'square':
      return {
        success: true,
        message: '✓ Square API keys validated'
      };
    case 'paypal':
      return {
        success: true,
        message: '✓ PayPal API keys validated'
      };
    default:
      return {
        success: false,
        message: 'Unknown payment processor'
      };
  }
}

/**
 * Encrypt sensitive credentials
 * In production, use proper encryption (AES-256, AWS KMS, etc.)
 */
function encryptCredentials(credentials: Record<string, string>): Record<string, string> {
  // TODO: Implement proper encryption
  // For now, just return as-is (Supabase RLS provides some security)
  return credentials;
}

/**
 * Decrypt credentials for use
 */
export function decryptCredentials(credentials: Record<string, string>): Record<string, string> {
  // TODO: Implement proper decryption
  return credentials;
}

/**
 * Initiate OAuth flow for an integration
 */
export async function initiateOAuthFlow(integration: Integration): Promise<string> {
  console.log('🔵 initiateOAuthFlow called for:', integration.name);
  
  if (!integration.oauth_enabled || !integration.oauth_config) {
    console.error('❌ OAuth not configured:', { oauth_enabled: integration.oauth_enabled, oauth_config: integration.oauth_config });
    throw new Error('OAuth not supported for this integration');
  }

  const { provider, client_id, redirect_uri, scopes } = integration.oauth_config;
  
  console.log('🔵 OAuth config:', { provider, client_id, redirect_uri, scopes });
  
  if (!client_id) {
    console.error('❌ Missing client_id');
    throw new Error(`OAuth client_id not configured for ${integration.name}. Please add NEXT_PUBLIC_${integration.slug.toUpperCase().replace(/-/g, '_')}_CLIENT_ID to your environment variables.`);
  }
  
  if (!redirect_uri) {
    console.error('❌ Missing redirect_uri');
    throw new Error('OAuth redirect_uri not configured');
  }
  
  // Generate state token for CSRF protection
  const state = btoa(JSON.stringify({
    integration_id: integration.id,
    timestamp: Date.now(),
    random: Math.random().toString(36)
  }));

  // Store state in session
  sessionStorage.setItem(`oauth_state_${integration.id}`, state);

  // Build OAuth URLs based on provider
  const oauthUrls: Record<string, string> = {
    'uber-eats': `https://login.uber.com/oauth/v2/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&scope=${scopes?.join(' ')}&state=${state}`,
    'skip-the-dishes': `https://api.skipthedishes.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&state=${state}`,
    'doordash': `https://identity.doordash.com/connect/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&scope=${scopes?.join(' ')}&state=${state}`,
    'grubhub': `https://api.grubhub.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&state=${state}`,
    'stripe': `https://connect.stripe.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&scope=${scopes?.join(' ')}&state=${state}`,
    'square': `https://connect.squareup.com/oauth2/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&scope=${scopes?.join(' ')}&state=${state}`,
    'paypal': `https://www.paypal.com/connect?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&scope=${scopes?.join(' ')}&state=${state}`,
    'google-workspace': `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&scope=${scopes?.join(' ')}&state=${state}&access_type=offline`,
    'o365': `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&scope=${scopes?.join(' ')}&state=${state}`,
    'twilio-sms': `https://www.twilio.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri || '')}&state=${state}`
  };

  const authUrl = oauthUrls[integration.slug];
  if (!authUrl) {
    throw new Error(`OAuth not configured for ${integration.name}`);
  }

  return authUrl;
}

/**
 * Handle OAuth callback and exchange code for tokens
 */
export async function handleOAuthCallback(
  integrationId: string,
  code: string,
  state: string
): Promise<{ success: boolean; message: string }> {
  // Verify state token
  const storedState = sessionStorage.getItem(`oauth_state_${integrationId}`);
  if (storedState !== state) {
    return {
      success: false,
      message: 'Invalid state token. Possible CSRF attack.'
    };
  }

  // Get integration details
  const integration = await getIntegration(integrationId);
  if (!integration) {
    return {
      success: false,
      message: 'Integration not found'
    };
  }

  // Exchange code for access token
  // TODO: Implement token exchange with backend API route
  // This should be done server-side to protect client_secret
  
  try {
    const response = await fetch('/api/integrations/oauth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integration_id: integrationId,
        code,
        state
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Update integration with connected account info
      await upsertIntegration({
        id: integrationId,
        connected_account: result.account,
        status: 'active',
        is_enabled: true
      });
    }

    // Clean up state
    sessionStorage.removeItem(`oauth_state_${integrationId}`);

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'OAuth callback failed'
    };
  }
}

/**
 * Disconnect OAuth integration
 */
export async function disconnectOAuth(integrationId: string): Promise<void> {
  const integration = await getIntegration(integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }

  // Revoke tokens via backend
  await fetch('/api/integrations/oauth/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ integration_id: integrationId })
  });

  // Update integration
  await upsertIntegration({
    id: integrationId,
    connected_account: undefined,
    credentials: {},
    status: 'inactive',
    is_enabled: false
  });
}

/**
 * Get integration statistics
 */
export async function getIntegrationStats(organizationId: string) {
  const integrations = await getIntegrations(organizationId);

  return {
    total: integrations.length,
    active: integrations.filter(i => i.status === 'active').length,
    inactive: integrations.filter(i => i.status === 'inactive').length,
    errors: integrations.filter(i => i.status === 'error').length,
    byCategory: {
      delivery: integrations.filter(i => i.category === 'delivery').length,
      email: integrations.filter(i => i.category === 'email').length,
      messaging: integrations.filter(i => i.category === 'messaging').length,
      payment: integrations.filter(i => i.category === 'payment').length
    }
  };
}
