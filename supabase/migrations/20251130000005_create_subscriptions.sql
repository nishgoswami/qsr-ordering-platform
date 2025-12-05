-- ============================================================================
-- SUBSCRIPTION TIFFIN SERVICE
-- Meal subscription plans and delivery tracking
-- ============================================================================

-- ============================================================================
-- 1. SUBSCRIPTION_PLANS TABLE
-- ============================================================================
CREATE TYPE plan_type AS ENUM (
  'daily',          -- Day-by-day subscription
  'weekly',         -- Weekly plan
  'monthly',        -- Monthly plan
  'custom'          -- Custom duration
);

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Plan details
  name VARCHAR(255) NOT NULL, -- e.g., "20 Days (Mon-Fri)", "30 Days All Days"
  description TEXT,
  
  -- Duration
  plan_type plan_type NOT NULL,
  duration_days INTEGER NOT NULL,
  
  -- Delivery schedule
  delivery_days INTEGER[] NOT NULL, -- [1,2,3,4,5] for Mon-Fri, 0=Sunday, 6=Saturday
  
  -- Pricing
  base_item_price DECIMAL(10, 2) NOT NULL, -- Regular menu item price
  plan_price DECIMAL(10, 2) NOT NULL,      -- Total subscription price
  price_per_delivery DECIMAL(10, 2) GENERATED ALWAYS AS 
    (plan_price / NULLIF(duration_days, 0)) STORED,
  savings DECIMAL(10, 2) GENERATED ALWAYS AS 
    (base_item_price * duration_days - plan_price) STORED,
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  min_advance_days INTEGER DEFAULT 1, -- Minimum days in advance to subscribe
  max_subscriptions_per_day INTEGER,  -- Limit daily capacity
  
  -- Auto-renewal
  allows_auto_renewal BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_org ON subscription_plans(organization_id);
CREATE INDEX idx_subscription_plans_menu_item ON subscription_plans(menu_item_id);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = true;

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage plans"
  ON subscription_plans FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- 2. CUSTOMER_SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TYPE subscription_status AS ENUM (
  'active',         -- Currently active
  'paused',         -- Temporarily paused
  'cancelled',      -- Cancelled by customer
  'completed',      -- Subscription period ended
  'expired'         -- Payment failed or expired
);

CREATE TABLE customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  
  -- Subscription period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Delivery details
  delivery_address JSONB NOT NULL,
  delivery_instructions TEXT,
  
  -- Preferred delivery time
  preferred_delivery_time TIME,
  
  -- Pricing
  total_price DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  
  -- Payment
  payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  
  -- Status
  status subscription_status DEFAULT 'active',
  
  -- Pause management
  paused_from DATE,
  paused_until DATE,
  pause_reason TEXT,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT false,
  next_renewal_date DATE,
  
  -- Analytics
  deliveries_completed INTEGER DEFAULT 0,
  deliveries_missed INTEGER DEFAULT 0,
  
  -- Customer preferences
  preferences JSONB DEFAULT '{}',
  /* Example:
    {
      "spice_level": "medium",
      "dietary_restrictions": ["vegetarian"],
      "allergies": ["peanuts"],
      "contact_number": "+1234567890"
    }
  */
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_subscriptions_org ON customer_subscriptions(organization_id);
CREATE INDEX idx_customer_subscriptions_customer ON customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subscriptions_plan ON customer_subscriptions(subscription_plan_id);
CREATE INDEX idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_customer_subscriptions_dates ON customer_subscriptions(start_date, end_date);
CREATE INDEX idx_customer_subscriptions_active ON customer_subscriptions(organization_id, status) 
  WHERE status = 'active';

ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their subscriptions"
  ON customer_subscriptions FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create subscriptions"
  ON customer_subscriptions FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can manage their subscriptions"
  ON customer_subscriptions FOR UPDATE
  USING (customer_id = auth.uid());

CREATE POLICY "Staff can view all subscriptions"
  ON customer_subscriptions FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Staff can update subscriptions"
  ON customer_subscriptions FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- 3. SUBSCRIPTION_DELIVERIES TABLE
-- ============================================================================
CREATE TYPE delivery_status AS ENUM (
  'scheduled',      -- Scheduled for delivery
  'preparing',      -- Being prepared
  'out_for_delivery', -- Out for delivery
  'delivered',      -- Successfully delivered
  'missed',         -- Customer not available
  'cancelled',      -- Cancelled for the day
  'skipped'         -- Skipped by customer
);

CREATE TABLE subscription_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_subscription_id UUID NOT NULL REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_date DATE NOT NULL,
  delivery_time TIME,
  
  -- Status
  status delivery_status DEFAULT 'scheduled',
  
  -- Actual delivery
  delivered_at TIMESTAMPTZ,
  delivered_by UUID REFERENCES users(id), -- Delivery person
  
  -- Customer feedback
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  delivery_feedback TEXT,
  
  -- Issues
  issue_reported BOOLEAN DEFAULT false,
  issue_description TEXT,
  issue_resolved BOOLEAN DEFAULT false,
  
  -- Photos (proof of delivery)
  delivery_photo_url TEXT,
  
  -- Skip management
  skipped_by_customer BOOLEAN DEFAULT false,
  skip_requested_at TIMESTAMPTZ,
  skip_reason TEXT,
  
  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_deliveries_subscription ON subscription_deliveries(customer_subscription_id);
CREATE INDEX idx_subscription_deliveries_org ON subscription_deliveries(organization_id);
CREATE INDEX idx_subscription_deliveries_date ON subscription_deliveries(delivery_date);
CREATE INDEX idx_subscription_deliveries_status ON subscription_deliveries(status);
CREATE INDEX idx_subscription_deliveries_today ON subscription_deliveries(delivery_date, status) 
  WHERE delivery_date = CURRENT_DATE;

ALTER TABLE subscription_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their deliveries"
  ON subscription_deliveries FOR SELECT
  USING (
    customer_subscription_id IN (
      SELECT id FROM customer_subscriptions WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their deliveries"
  ON subscription_deliveries FOR UPDATE
  USING (
    customer_subscription_id IN (
      SELECT id FROM customer_subscriptions WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all deliveries"
  ON subscription_deliveries FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Staff can manage deliveries"
  ON subscription_deliveries FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Auto-generate delivery schedule when subscription is created
CREATE OR REPLACE FUNCTION generate_delivery_schedule(subscription_id UUID)
RETURNS void AS $$
DECLARE
  sub RECORD;
  plan RECORD;
  current_date DATE;
  day_of_week INTEGER;
BEGIN
  -- Get subscription and plan details
  SELECT * INTO sub FROM customer_subscriptions WHERE id = subscription_id;
  SELECT * INTO plan FROM subscription_plans WHERE id = sub.subscription_plan_id;
  
  -- Generate deliveries for each day in the subscription period
  current_date := sub.start_date;
  
  WHILE current_date <= sub.end_date LOOP
    day_of_week := EXTRACT(DOW FROM current_date); -- 0=Sunday, 6=Saturday
    
    -- Check if this day is in the delivery schedule
    IF day_of_week = ANY(plan.delivery_days) THEN
      INSERT INTO subscription_deliveries (
        customer_subscription_id,
        organization_id,
        delivery_date,
        delivery_time,
        status
      ) VALUES (
        subscription_id,
        sub.organization_id,
        current_date,
        sub.preferred_delivery_time,
        'scheduled'
      );
    END IF;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Get today's deliveries for organization
CREATE OR REPLACE FUNCTION get_todays_deliveries(org_id UUID)
RETURNS TABLE(
  delivery_id UUID,
  customer_name VARCHAR,
  customer_phone VARCHAR,
  delivery_address JSONB,
  delivery_time TIME,
  status delivery_status,
  menu_item_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    u.full_name,
    u.phone,
    cs.delivery_address,
    sd.delivery_time,
    sd.status,
    mi.name
  FROM subscription_deliveries sd
  JOIN customer_subscriptions cs ON cs.id = sd.customer_subscription_id
  JOIN users u ON u.id = cs.customer_id
  JOIN subscription_plans sp ON sp.id = cs.subscription_plan_id
  JOIN menu_items mi ON mi.id = sp.menu_item_id
  WHERE 
    sd.organization_id = org_id
    AND sd.delivery_date = CURRENT_DATE
    AND sd.status NOT IN ('cancelled', 'skipped')
  ORDER BY sd.delivery_time NULLS LAST, u.full_name;
END;
$$ LANGUAGE plpgsql;

-- Get subscription statistics
CREATE OR REPLACE FUNCTION get_subscription_stats(org_id UUID)
RETURNS TABLE(
  total_active_subscriptions BIGINT,
  total_deliveries_today BIGINT,
  total_revenue_monthly DECIMAL,
  avg_subscription_duration DECIMAL,
  top_plan_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT cs.id) FILTER (WHERE cs.status = 'active'),
    COUNT(DISTINCT sd.id) FILTER (WHERE sd.delivery_date = CURRENT_DATE AND sd.status NOT IN ('cancelled', 'skipped')),
    SUM(cs.total_price) FILTER (WHERE cs.created_at >= CURRENT_DATE - INTERVAL '30 days'),
    AVG(cs.end_date - cs.start_date),
    (
      SELECT sp.name
      FROM customer_subscriptions cs2
      JOIN subscription_plans sp ON sp.id = cs2.subscription_plan_id
      WHERE cs2.organization_id = org_id
      GROUP BY sp.id, sp.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  FROM customer_subscriptions cs
  LEFT JOIN subscription_deliveries sd ON sd.customer_subscription_id = cs.id
  WHERE cs.organization_id = org_id;
END;
$$ LANGUAGE plpgsql;

-- Allow customer to skip a delivery
CREATE OR REPLACE FUNCTION skip_delivery(
  delivery_id UUID,
  skip_reason_param TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE subscription_deliveries
  SET 
    status = 'skipped',
    skipped_by_customer = true,
    skip_requested_at = NOW(),
    skip_reason = skip_reason_param,
    updated_at = NOW()
  WHERE id = delivery_id
    AND status = 'scheduled'
    AND delivery_date > CURRENT_DATE; -- Can only skip future deliveries
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-generate deliveries when subscription is created
CREATE OR REPLACE FUNCTION auto_generate_deliveries()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_delivery_schedule(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_delivery_generator
  AFTER INSERT ON customer_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_deliveries();

-- Update subscription stats when delivery status changes
CREATE OR REPLACE FUNCTION update_subscription_delivery_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE customer_subscriptions
    SET deliveries_completed = deliveries_completed + 1
    WHERE id = NEW.customer_subscription_id;
  ELSIF NEW.status = 'missed' AND OLD.status != 'missed' THEN
    UPDATE customer_subscriptions
    SET deliveries_missed = deliveries_missed + 1
    WHERE id = NEW.customer_subscription_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delivery_stats_updater
  AFTER UPDATE ON subscription_deliveries
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_subscription_delivery_stats();

-- Auto-complete subscription when end date is reached
CREATE OR REPLACE FUNCTION auto_complete_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE customer_subscriptions
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND end_date < CURRENT_DATE
    AND auto_renew = false;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily (configure in Supabase Edge Functions or cron job)

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE subscription_plans IS 'Tiffin subscription plans (daily meal delivery)';
COMMENT ON TABLE customer_subscriptions IS 'Active customer subscriptions with delivery preferences';
COMMENT ON TABLE subscription_deliveries IS 'Individual delivery instances for each subscription day';

COMMENT ON COLUMN subscription_plans.delivery_days IS 'Array of day numbers: 0=Sunday, 1=Monday, ... 6=Saturday';
COMMENT ON COLUMN customer_subscriptions.preferences IS 'Customer preferences for spice level, dietary restrictions, etc.';
COMMENT ON FUNCTION generate_delivery_schedule IS 'Auto-creates delivery records for entire subscription period';
