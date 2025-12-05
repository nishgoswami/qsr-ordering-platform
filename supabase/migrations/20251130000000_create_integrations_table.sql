-- ============================================================================
-- INTEGRATIONS TABLE
-- Third-party service integrations (delivery platforms, email, messaging, payments)
-- ============================================================================

-- Create integration category enum
CREATE TYPE integration_category AS ENUM (
  'delivery',      -- Uber Eats, Skip The Dishes, DoorDash, Grubhub
  'email',         -- O365, Google Workspace, SendGrid
  'messaging',     -- WhatsApp, Twilio SMS, 3CX
  'payment'        -- Stripe, Square, PayPal
);

-- Create integration status enum
CREATE TYPE integration_status AS ENUM (
  'active',        -- Integration is enabled and working
  'inactive',      -- Integration is disabled
  'error',         -- Integration has configuration errors
  'testing'        -- Integration is being tested
);

-- Create integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Integration info
  name VARCHAR(100) NOT NULL, -- e.g., 'Uber Eats', 'Skip The Dishes', 'O365'
  slug VARCHAR(50) NOT NULL, -- e.g., 'uber-eats', 'skip-the-dishes', 'o365'
  category integration_category NOT NULL,
  
  -- Configuration
  is_enabled BOOLEAN DEFAULT false,
  status integration_status DEFAULT 'inactive',
  
  -- Scope: global (organization-wide) or site-specific (per location)
  is_global BOOLEAN DEFAULT true,
  location_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for global
  
  -- Credentials (encrypted in production)
  credentials JSONB DEFAULT '{}',
  /* Example structures:
    Delivery Platforms: {
      "api_key": "xxx",
      "restaurant_id": "xxx",
      "webhook_url": "https://..."
    }
    Email: {
      "smtp_host": "smtp.office365.com",
      "smtp_port": 587,
      "username": "xxx",
      "password": "xxx"
    }
    Messaging: {
      "account_sid": "xxx",
      "auth_token": "xxx",
      "from_number": "+1234567890"
    }
    Payment: {
      "publishable_key": "pk_xxx",
      "secret_key": "sk_xxx",
      "webhook_secret": "whsec_xxx"
    }
  */
  
  -- Settings specific to integration type
  settings JSONB DEFAULT '{}',
  /* Example:
    Delivery: {
      "auto_accept": true,
      "print_on_receive": true,
      "notification_email": "kitchen@restaurant.com"
    }
    Email: {
      "from_name": "Demo Restaurant",
      "reply_to": "support@restaurant.com"
    }
    Messaging: {
      "enable_notifications": true,
      "enable_confirmations": true
    }
  */
  
  -- Connection status
  last_tested_at TIMESTAMPTZ,
  last_error TEXT,
  last_success_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  UNIQUE(organization_id, slug, location_id)
);

-- Indexes
CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_category ON integrations(category);
CREATE INDEX idx_integrations_enabled ON integrations(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_integrations_location ON integrations(location_id) WHERE location_id IS NOT NULL;

-- RLS Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Admins can view integrations for their organization
CREATE POLICY "Admins can view integrations"
  ON integrations FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner')
  );

-- Admins can manage integrations
CREATE POLICY "Admins can manage integrations"
  ON integrations FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner')
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_updated_at();

-- ============================================================================
-- SEED DEFAULT INTEGRATIONS
-- Create inactive integrations for all organizations to toggle on
-- ============================================================================

-- Function to seed integrations for an organization
CREATE OR REPLACE FUNCTION seed_default_integrations(org_id UUID)
RETURNS void AS $$
BEGIN
  -- Delivery Platforms
  INSERT INTO integrations (organization_id, name, slug, category, is_enabled, status)
  VALUES
    (org_id, 'Uber Eats', 'uber-eats', 'delivery', false, 'inactive'),
    (org_id, 'Skip The Dishes', 'skip-the-dishes', 'delivery', false, 'inactive'),
    (org_id, 'DoorDash', 'doordash', 'delivery', false, 'inactive'),
    (org_id, 'Grubhub', 'grubhub', 'delivery', false, 'inactive')
  ON CONFLICT (organization_id, slug, location_id) DO NOTHING;
  
  -- Email Services
  INSERT INTO integrations (organization_id, name, slug, category, is_enabled, status)
  VALUES
    (org_id, 'Microsoft O365', 'o365', 'email', false, 'inactive'),
    (org_id, 'Google Workspace', 'google-workspace', 'email', false, 'inactive'),
    (org_id, 'SendGrid', 'sendgrid', 'email', false, 'inactive')
  ON CONFLICT (organization_id, slug, location_id) DO NOTHING;
  
  -- Messaging Services
  INSERT INTO integrations (organization_id, name, slug, category, is_enabled, status)
  VALUES
    (org_id, 'WhatsApp Business', 'whatsapp', 'messaging', false, 'inactive'),
    (org_id, 'Twilio SMS', 'twilio-sms', 'messaging', false, 'inactive'),
    (org_id, '3CX', '3cx', 'messaging', false, 'inactive')
  ON CONFLICT (organization_id, slug, location_id) DO NOTHING;
  
  -- Payment Processors
  INSERT INTO integrations (organization_id, name, slug, category, is_enabled, status)
  VALUES
    (org_id, 'Stripe', 'stripe', 'payment', false, 'inactive'),
    (org_id, 'Square', 'square', 'payment', false, 'inactive'),
    (org_id, 'PayPal', 'paypal', 'payment', false, 'inactive')
  ON CONFLICT (organization_id, slug, location_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Seed integrations for existing organizations
DO $$
DECLARE
  org RECORD;
BEGIN
  FOR org IN SELECT id FROM organizations
  LOOP
    PERFORM seed_default_integrations(org.id);
  END LOOP;
END $$;

-- Create trigger to auto-seed integrations for new organizations
CREATE OR REPLACE FUNCTION auto_seed_integrations()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM seed_default_integrations(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_seed_integrations
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION auto_seed_integrations();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE integrations IS 'Third-party service integrations for delivery, email, messaging, and payments';
COMMENT ON COLUMN integrations.is_global IS 'If true, applies to entire organization; if false, specific to location_id';
COMMENT ON COLUMN integrations.credentials IS 'Encrypted credentials (API keys, tokens, passwords)';
COMMENT ON COLUMN integrations.settings IS 'Integration-specific settings and preferences';
