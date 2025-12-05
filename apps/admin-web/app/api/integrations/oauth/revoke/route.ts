import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Revoke OAuth access
 * POST /api/integrations/oauth/revoke
 */
export async function POST(request: NextRequest) {
  try {
    const { integration_id } = await request.json();

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

    // Revoke tokens with provider
    const revokeResult = await revokeTokens(integration.slug, integration.credentials);

    // Update integration to remove credentials
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        credentials: {},
        connected_account: null,
        status: 'inactive',
        is_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', integration_id);

    if (updateError) {
      console.error('Failed to update integration:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to revoke access' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully disconnected'
    });

  } catch (error) {
    console.error('OAuth revoke error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Revoke OAuth tokens with provider
 */
async function revokeTokens(slug: string, credentials: any) {
  const revokeEndpoints: Record<string, string> = {
    'uber-eats': 'https://login.uber.com/oauth/v2/revoke',
    'stripe': 'https://connect.stripe.com/oauth/deauthorize',
    'square': 'https://connect.squareup.com/oauth2/revoke',
    'google-workspace': 'https://oauth2.googleapis.com/revoke',
    'o365': 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
  };

  const endpoint = revokeEndpoints[slug];
  if (!endpoint || !credentials.access_token) {
    return { success: true }; // No revoke endpoint or no token to revoke
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: credentials.access_token,
        client_id: process.env[`NEXT_PUBLIC_${slug.toUpperCase().replace(/-/g, '_')}_CLIENT_ID`] || '',
        client_secret: process.env[`${slug.toUpperCase().replace(/-/g, '_')}_CLIENT_SECRET`] || ''
      })
    });

    return { success: true };
  } catch (error) {
    console.error('Token revoke error:', error);
    // Don't fail the revoke if the provider endpoint fails
    return { success: true };
  }
}
