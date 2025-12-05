-- ============================================================================
-- SUBSCRIPTION & BILLING MANAGEMENT
-- Platform subscription tiers, usage tracking, and billing
-- ============================================================================

-- ============================================================================
-- 1. SUBSCRIPTION_TIERS TABLE
-- ============================================================================
CREATE TYPE tier_name AS ENUM (
  'free',
  'professional',
  'business',
  'enterprise'
);

CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tier info
  name tier_name UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Pricing
  monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  annual_price DECIMAL(10, 2), -- Discounted annual price
  
  -- Platform fees (percentage on orders)
  platform_fee_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Limits
  max_locations INTEGER,
  max_orders_per_month INTEGER,
  overage_fee_per_order DECIMAL(10, 2), -- Fee for orders over limit
  max_menu_items INTEGER,
  max_storage_gb INTEGER,
  max_email_sends INTEGER,
  max_sms_sends INTEGER,
  
  -- Features (JSONB)
  features JSONB DEFAULT '{}',
  /* Example:
    {
      "kitchen_display": true,
      "printer_integration": 1,
      "delivery_zones": 5,
      "custom_domain": false,
      "white_label": false,
      "api_access": false,
      "dedicated_support": false,
      "third_party_integrations": ["stripe", "square"]
    }
  */
  
  -- Visibility
  is_public BOOLEAN DEFAULT true, -- Show on pricing page
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO subscription_tiers (name, display_name, description, monthly_price, annual_price, platform_fee_percentage, max_locations, max_orders_per_month, overage_fee_per_order, max_menu_items, max_storage_gb, max_email_sends, max_sms_sends, features) VALUES
('free', 'Starter', 'Perfect for single-location restaurants starting online ordering', 0, 0, 3.00, 1, 100, 0.15, 100, 1, 100, 0, 
  '{"kitchen_display": false, "printer_integration": 0, "delivery_zones": 1, "custom_domain": false, "white_label": false, "api_access": false, "dedicated_support": false, "third_party_integrations": []}'::jsonb),
('professional', 'Professional', 'For busy single locations or small chains', 49, 490, 2.50, 3, 500, 0.10, 500, 5, 500, 100,
  '{"kitchen_display": true, "printer_integration": 1, "delivery_zones": 5, "custom_domain": false, "white_label": false, "api_access": false, "dedicated_support": false, "third_party_integrations": ["stripe", "square"]}'::jsonb),
('business', 'Business', 'Growing chains and multi-location operations', 149, 1490, 2.00, 10, 2000, 0.08, 2000, 20, 2000, 500,
  '{"kitchen_display": true, "printer_integration": 999, "delivery_zones": 999, "custom_domain": true, "white_label": true, "api_access": false, "dedicated_support": true, "third_party_integrations": ["stripe", "square", "uber_eats", "skip_the_dishes", "doordash", "grubhub"]}'::jsonb),
('enterprise', 'Enterprise', 'Franchise brands and large chains', 999, 9990, 1.50, 999, 999999, 0.05, 999999, 1000, 999999, 999999,
  '{"kitchen_display": true, "printer_integration": 999, "delivery_zones": 999, "custom_domain": true, "white_label": true, "api_access": true, "dedicated_support": true, "third_party_integrations": ["all"]}'::jsonb);

-- ============================================================================
-- 2. ORGANIZATION_SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TYPE subscription_status_enum AS ENUM (
  'trial',          -- Free trial period
  'active',         -- Active subscription
  'past_due',       -- Payment failed
  'cancelled',      -- Cancelled by customer
  'expired'         -- Subscription ended
);

CREATE TYPE billing_cycle AS ENUM (
  'monthly',
  'annual'
);

CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Current tier
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  tier_name tier_name NOT NULL,
  
  -- Billing
  billing_cycle billing_cycle DEFAULT 'monthly',
  next_billing_date DATE,
  
  -- Payment
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  payment_method_id VARCHAR(255),
  
  -- Status
  status subscription_status_enum DEFAULT 'trial',
  
  -- Trial
  trial_ends_at TIMESTAMPTZ,
  trial_extended BOOLEAN DEFAULT false,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  -- Usage-based billing
  use_platform_fee BOOLEAN DEFAULT true, -- If false, only charge subscription
  
  -- Promotions
  discount_code VARCHAR(50),
  discount_percentage DECIMAL(5, 2),
  discount_ends_at TIMESTAMPTZ,
  
  -- Grandfathered pricing (for early customers)
  is_grandfathered BOOLEAN DEFAULT false,
  grandfathered_price DECIMAL(10, 2),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_subscriptions_org ON organization_subscriptions(organization_id);
CREATE INDEX idx_org_subscriptions_tier ON organization_subscriptions(tier_id);
CREATE INDEX idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX idx_org_subscriptions_billing ON organization_subscriptions(next_billing_date) 
  WHERE status = 'active';

ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their subscription"
  ON organization_subscriptions FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Admins can update subscription"
  ON organization_subscriptions FOR UPDATE
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner')
  );

-- ============================================================================
-- 3. USAGE_TRACKING TABLE
-- ============================================================================
CREATE TYPE usage_metric AS ENUM (
  'orders',
  'storage_gb',
  'email_sends',
  'sms_sends',
  'api_calls'
);

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Period
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  
  -- Usage metrics
  orders_count INTEGER DEFAULT 0,
  storage_used_gb DECIMAL(10, 3) DEFAULT 0,
  email_sends_count INTEGER DEFAULT 0,
  sms_sends_count INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  
  -- Overage tracking
  orders_overage INTEGER DEFAULT 0,
  storage_overage_gb DECIMAL(10, 3) DEFAULT 0,
  email_overage INTEGER DEFAULT 0,
  sms_overage INTEGER DEFAULT 0,
  
  -- Costs
  base_subscription_fee DECIMAL(10, 2) DEFAULT 0,
  platform_fees DECIMAL(10, 2) DEFAULT 0,
  overage_fees DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Billing
  is_billed BOOLEAN DEFAULT false,
  billed_at TIMESTAMPTZ,
  invoice_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, billing_period_start)
);

CREATE INDEX idx_usage_tracking_org ON usage_tracking(organization_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(billing_period_start, billing_period_end);
CREATE INDEX idx_usage_tracking_unbilled ON usage_tracking(is_billed) WHERE is_billed = false;

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their usage"
  ON usage_tracking FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- 4. INVOICES TABLE
-- ============================================================================
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible'
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Invoice details
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_due DECIMAL(10, 2) NOT NULL,
  
  -- Line items (JSONB)
  line_items JSONB NOT NULL,
  /* Example:
    [
      {
        "description": "Professional Plan - January 2025",
        "quantity": 1,
        "unit_price": 49.00,
        "amount": 49.00
      },
      {
        "description": "Overage: 50 orders",
        "quantity": 50,
        "unit_price": 0.10,
        "amount": 5.00
      }
    ]
  */
  
  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  
  -- Status
  status invoice_status DEFAULT 'open',
  
  -- Payment
  stripe_invoice_id VARCHAR(255),
  payment_intent_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status = 'open';

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their invoices"
  ON invoices FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if organization can perform action based on limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  org_id UUID,
  metric_name usage_metric,
  increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  sub RECORD;
  tier RECORD;
  current_usage INTEGER;
  current_period_start DATE;
BEGIN
  -- Get subscription and tier
  SELECT * INTO sub FROM organization_subscriptions WHERE organization_id = org_id;
  SELECT * INTO tier FROM subscription_tiers WHERE id = sub.tier_id;
  
  -- Get current billing period
  current_period_start := DATE_TRUNC('month', CURRENT_DATE);
  
  -- Get current usage for this period
  SELECT 
    CASE metric_name
      WHEN 'orders' THEN orders_count
      WHEN 'email_sends' THEN email_sends_count
      WHEN 'sms_sends' THEN sms_sends_count
      WHEN 'api_calls' THEN api_calls_count
      ELSE 0
    END INTO current_usage
  FROM usage_tracking
  WHERE organization_id = org_id
    AND billing_period_start = current_period_start;
  
  current_usage := COALESCE(current_usage, 0);
  
  -- Check limits
  CASE metric_name
    WHEN 'orders' THEN
      RETURN current_usage + increment <= tier.max_orders_per_month OR tier.max_orders_per_month IS NULL;
    WHEN 'email_sends' THEN
      RETURN current_usage + increment <= tier.max_email_sends OR tier.max_email_sends IS NULL;
    WHEN 'sms_sends' THEN
      RETURN current_usage + increment <= tier.max_sms_sends OR tier.max_sms_sends IS NULL;
    ELSE
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Track usage increment
CREATE OR REPLACE FUNCTION increment_usage(
  org_id UUID,
  metric_name usage_metric,
  amount INTEGER DEFAULT 1
)
RETURNS void AS $$
DECLARE
  current_period_start DATE;
  current_period_end DATE;
BEGIN
  current_period_start := DATE_TRUNC('month', CURRENT_DATE);
  current_period_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
  
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (
    organization_id,
    billing_period_start,
    billing_period_end,
    orders_count,
    email_sends_count,
    sms_sends_count,
    api_calls_count
  ) VALUES (
    org_id,
    current_period_start,
    current_period_end,
    CASE WHEN metric_name = 'orders' THEN amount ELSE 0 END,
    CASE WHEN metric_name = 'email_sends' THEN amount ELSE 0 END,
    CASE WHEN metric_name = 'sms_sends' THEN amount ELSE 0 END,
    CASE WHEN metric_name = 'api_calls' THEN amount ELSE 0 END
  )
  ON CONFLICT (organization_id, billing_period_start)
  DO UPDATE SET
    orders_count = CASE WHEN metric_name = 'orders' THEN usage_tracking.orders_count + amount ELSE usage_tracking.orders_count END,
    email_sends_count = CASE WHEN metric_name = 'email_sends' THEN usage_tracking.email_sends_count + amount ELSE usage_tracking.email_sends_count END,
    sms_sends_count = CASE WHEN metric_name = 'sms_sends' THEN usage_tracking.sms_sends_count + amount ELSE usage_tracking.sms_sends_count END,
    api_calls_count = CASE WHEN metric_name = 'api_calls' THEN usage_tracking.api_calls_count + amount ELSE usage_tracking.api_calls_count END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Calculate monthly bill
CREATE OR REPLACE FUNCTION calculate_monthly_bill(org_id UUID, period_start DATE)
RETURNS DECIMAL AS $$
DECLARE
  sub RECORD;
  tier RECORD;
  usage RECORD;
  total DECIMAL := 0;
  orders_overage INTEGER;
BEGIN
  -- Get subscription and tier
  SELECT * INTO sub FROM organization_subscriptions WHERE organization_id = org_id;
  SELECT * INTO tier FROM subscription_tiers WHERE id = sub.tier_id;
  
  -- Get usage for period
  SELECT * INTO usage FROM usage_tracking 
  WHERE organization_id = org_id AND billing_period_start = period_start;
  
  -- Base subscription fee
  total := tier.monthly_price;
  
  -- Apply discount if applicable
  IF sub.discount_percentage > 0 AND (sub.discount_ends_at IS NULL OR sub.discount_ends_at > NOW()) THEN
    total := total * (1 - sub.discount_percentage / 100);
  END IF;
  
  -- Calculate overage fees
  IF usage.orders_count > tier.max_orders_per_month THEN
    orders_overage := usage.orders_count - tier.max_orders_per_month;
    total := total + (orders_overage * tier.overage_fee_per_order);
  END IF;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Get subscription details with limits
CREATE OR REPLACE FUNCTION get_subscription_details(org_id UUID)
RETURNS TABLE(
  tier_name VARCHAR,
  status subscription_status_enum,
  orders_used INTEGER,
  orders_limit INTEGER,
  locations_used BIGINT,
  locations_limit INTEGER,
  next_billing_date DATE,
  monthly_price DECIMAL
) AS $$
DECLARE
  current_period_start DATE;
BEGIN
  current_period_start := DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN QUERY
  SELECT 
    st.display_name,
    os.status,
    COALESCE(ut.orders_count, 0),
    st.max_orders_per_month,
    (SELECT COUNT(*) FROM organizations WHERE id = org_id OR id IN (
      SELECT DISTINCT location_id FROM integrations WHERE organization_id = org_id
    )),
    st.max_locations,
    os.next_billing_date,
    st.monthly_price
  FROM organization_subscriptions os
  JOIN subscription_tiers st ON st.id = os.tier_id
  LEFT JOIN usage_tracking ut ON ut.organization_id = os.organization_id 
    AND ut.billing_period_start = current_period_start
  WHERE os.organization_id = org_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create free subscription for new organizations
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_tier_id UUID;
BEGIN
  -- Get free tier ID
  SELECT id INTO free_tier_id FROM subscription_tiers WHERE name = 'free';
  
  -- Create subscription
  INSERT INTO organization_subscriptions (
    organization_id,
    tier_id,
    tier_name,
    status,
    trial_ends_at,
    next_billing_date
  ) VALUES (
    NEW.id,
    free_tier_id,
    'free',
    'active',
    CURRENT_DATE + INTERVAL '30 days', -- 30-day trial for all tiers
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_subscription_creator
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Track order creation in usage
CREATE OR REPLACE FUNCTION track_order_usage()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_usage(NEW.organization_id, 'orders', 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_usage_tracker
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_usage();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE subscription_tiers IS 'Platform subscription tier definitions (Free, Professional, Business, Enterprise)';
COMMENT ON TABLE organization_subscriptions IS 'Organization subscription status and billing info';
COMMENT ON TABLE usage_tracking IS 'Monthly usage tracking for billing and limit enforcement';
COMMENT ON TABLE invoices IS 'Generated invoices for subscription and usage charges';

COMMENT ON FUNCTION check_subscription_limit IS 'Returns true if organization can perform action within tier limits';
COMMENT ON FUNCTION increment_usage IS 'Increment usage counter for billing metric';
COMMENT ON FUNCTION calculate_monthly_bill IS 'Calculate total bill including base fee and overages';
