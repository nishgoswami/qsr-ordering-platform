-- ============================================================================
-- COMBO MEALS & UPSELLING
-- Bundle deals and smart product recommendations
-- ============================================================================

-- ============================================================================
-- 1. COMBO_MEALS TABLE
-- ============================================================================
CREATE TABLE combo_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Combo info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Pricing
  regular_price DECIMAL(10, 2) NOT NULL, -- Sum of individual item prices
  combo_price DECIMAL(10, 2) NOT NULL,   -- Discounted bundle price
  savings DECIMAL(10, 2) GENERATED ALWAYS AS (regular_price - combo_price) STORED,
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  available_for_pickup BOOLEAN DEFAULT true,
  available_for_delivery BOOLEAN DEFAULT true,
  
  -- Marketing
  is_popular BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timing
  available_start_time TIME,
  available_end_time TIME,
  available_days INTEGER[], -- 0=Sunday, 1=Monday, etc.
  
  -- Ordering
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_combo_meals_org ON combo_meals(organization_id);
CREATE INDEX idx_combo_meals_active ON combo_meals(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_combo_meals_popular ON combo_meals(is_popular) WHERE is_popular = true;

ALTER TABLE combo_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active combos"
  ON combo_meals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage combos"
  ON combo_meals FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- 2. COMBO_ITEMS TABLE
-- ============================================================================
CREATE TABLE combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_meal_id UUID NOT NULL REFERENCES combo_meals(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Configuration
  quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  
  -- Choice groups (e.g., "Choose your side", "Choose your drink")
  choice_group_name VARCHAR(100), -- NULL if required, otherwise group name
  max_selections INTEGER DEFAULT 1, -- For choice groups
  
  -- Ordering
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_combo_items_combo ON combo_items(combo_meal_id);
CREATE INDEX idx_combo_items_menu_item ON combo_items(menu_item_id);

ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view combo items"
  ON combo_items FOR SELECT
  USING (
    combo_meal_id IN (
      SELECT id FROM combo_meals WHERE is_active = true
    )
  );

CREATE POLICY "Staff can manage combo items"
  ON combo_items FOR ALL
  USING (
    combo_meal_id IN (
      SELECT id FROM combo_meals 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );

-- ============================================================================
-- 3. UPSELL_RULES TABLE
-- ============================================================================
CREATE TYPE upsell_trigger_type AS ENUM (
  'item_added',        -- When specific item added to cart
  'category_added',    -- When item from category added
  'cart_total',        -- When cart reaches certain value
  'checkout'           -- At checkout screen
);

CREATE TYPE upsell_display_type AS ENUM (
  'modal',            -- Pop-up modal
  'inline',           -- Inline in cart
  'banner',           -- Banner notification
  'sidebar'           -- Side panel
);

CREATE TABLE upsell_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Rule info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Trigger conditions
  trigger_type upsell_trigger_type NOT NULL,
  trigger_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  trigger_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  trigger_cart_minimum DECIMAL(10, 2),
  
  -- Display settings
  display_type upsell_display_type DEFAULT 'inline',
  headline VARCHAR(255), -- e.g., "Add a drink for just $2?"
  message TEXT,
  
  -- Suggested items (JSONB array of item IDs with optional discounts)
  suggested_items JSONB NOT NULL DEFAULT '[]',
  /* Example:
    [
      {
        "item_id": "uuid",
        "discount_type": "percentage", // or "fixed"
        "discount_value": 10,
        "priority": 1
      }
    ]
  */
  
  -- Rules
  max_suggestions INTEGER DEFAULT 3,
  show_once_per_session BOOLEAN DEFAULT false,
  
  -- Analytics
  times_shown INTEGER DEFAULT 0,
  times_accepted INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) GENERATED ALWAYS AS 
    (CASE WHEN times_shown > 0 THEN (times_accepted::DECIMAL / times_shown * 100) ELSE 0 END) STORED,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Scheduling
  start_date DATE,
  end_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upsell_rules_org ON upsell_rules(organization_id);
CREATE INDEX idx_upsell_rules_trigger_item ON upsell_rules(trigger_item_id) WHERE trigger_item_id IS NOT NULL;
CREATE INDEX idx_upsell_rules_active ON upsell_rules(is_active) WHERE is_active = true;

ALTER TABLE upsell_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active upsell rules"
  ON upsell_rules FOR SELECT
  USING (
    is_active = true AND
    (start_date IS NULL OR start_date <= CURRENT_DATE) AND
    (end_date IS NULL OR end_date >= CURRENT_DATE)
  );

CREATE POLICY "Staff can manage upsell rules"
  ON upsell_rules FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- 4. GOES_WITH_SUGGESTIONS TABLE
-- Simple item-to-item pairing suggestions
-- ============================================================================
CREATE TABLE goes_with_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Primary item
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Suggested pairing
  suggested_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Priority (higher = shown first)
  priority INTEGER DEFAULT 0,
  
  -- Analytics
  times_shown INTEGER DEFAULT 0,
  times_added INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate pairings
  UNIQUE(menu_item_id, suggested_item_id)
);

CREATE INDEX idx_goes_with_menu_item ON goes_with_suggestions(menu_item_id);
CREATE INDEX idx_goes_with_active ON goes_with_suggestions(menu_item_id, is_active) WHERE is_active = true;

ALTER TABLE goes_with_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active suggestions"
  ON goes_with_suggestions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage suggestions"
  ON goes_with_suggestions FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get applicable upsell rules for an item
CREATE OR REPLACE FUNCTION get_upsell_rules_for_item(
  org_id UUID,
  item_id UUID,
  cart_total DECIMAL DEFAULT 0
)
RETURNS TABLE(
  rule_id UUID,
  headline VARCHAR,
  message TEXT,
  suggested_items JSONB,
  display_type upsell_display_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.id,
    ur.headline,
    ur.message,
    ur.suggested_items,
    ur.display_type
  FROM upsell_rules ur
  WHERE 
    ur.organization_id = org_id
    AND ur.is_active = true
    AND (ur.start_date IS NULL OR ur.start_date <= CURRENT_DATE)
    AND (ur.end_date IS NULL OR ur.end_date >= CURRENT_DATE)
    AND (
      (ur.trigger_type = 'item_added' AND ur.trigger_item_id = item_id) OR
      (ur.trigger_type = 'category_added' AND ur.trigger_category_id IN (
        SELECT category_id FROM menu_items WHERE id = item_id
      )) OR
      (ur.trigger_type = 'cart_total' AND cart_total >= ur.trigger_cart_minimum) OR
      (ur.trigger_type = 'checkout')
    )
  ORDER BY 
    CASE ur.trigger_type
      WHEN 'item_added' THEN 1
      WHEN 'category_added' THEN 2
      WHEN 'cart_total' THEN 3
      WHEN 'checkout' THEN 4
    END;
END;
$$ LANGUAGE plpgsql;

-- Get "goes with" suggestions for an item
CREATE OR REPLACE FUNCTION get_goes_with_items(item_id_param UUID)
RETURNS TABLE(
  suggested_item_id UUID,
  item_name VARCHAR,
  item_price DECIMAL,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gws.suggested_item_id,
    mi.name,
    mi.price,
    gws.priority
  FROM goes_with_suggestions gws
  JOIN menu_items mi ON mi.id = gws.suggested_item_id
  WHERE 
    gws.menu_item_id = item_id_param
    AND gws.is_active = true
    AND mi.is_active = true
  ORDER BY gws.priority DESC, gws.times_added DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Track upsell conversion
CREATE OR REPLACE FUNCTION track_upsell_conversion(
  rule_id_param UUID,
  was_accepted BOOLEAN
)
RETURNS void AS $$
BEGIN
  UPDATE upsell_rules
  SET 
    times_shown = times_shown + 1,
    times_accepted = CASE WHEN was_accepted THEN times_accepted + 1 ELSE times_accepted END,
    updated_at = NOW()
  WHERE id = rule_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update combo regular price when items change
CREATE OR REPLACE FUNCTION update_combo_regular_price()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE combo_meals
  SET 
    regular_price = (
      SELECT COALESCE(SUM(mi.price * ci.quantity), 0)
      FROM combo_items ci
      JOIN menu_items mi ON mi.id = ci.menu_item_id
      WHERE ci.combo_meal_id = COALESCE(NEW.combo_meal_id, OLD.combo_meal_id)
      AND ci.is_required = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.combo_meal_id, OLD.combo_meal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER combo_price_update
  AFTER INSERT OR UPDATE OR DELETE ON combo_items
  FOR EACH ROW
  EXECUTE FUNCTION update_combo_regular_price();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE combo_meals IS 'Bundle meal deals with discounted pricing';
COMMENT ON TABLE combo_items IS 'Items included in combo meals with configuration';
COMMENT ON TABLE upsell_rules IS 'Smart upselling rules triggered by cart conditions';
COMMENT ON TABLE goes_with_suggestions IS 'Simple item pairing recommendations';

COMMENT ON COLUMN combo_items.choice_group_name IS 'NULL for required items, group name for optional choices like "Choose your side"';
COMMENT ON COLUMN upsell_rules.suggested_items IS 'JSONB array of items with optional discounts: [{"item_id": "uuid", "discount_type": "percentage", "discount_value": 10}]';
