-- ============================================================================
-- RECIPES & INVENTORY MANAGEMENT
-- Recipe tracking, ingredient management, and inventory control
-- ============================================================================

-- ============================================================================
-- 1. INVENTORY_ITEMS TABLE
-- ============================================================================
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Item info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  
  -- Classification
  category VARCHAR(100), -- e.g., 'Produce', 'Dairy', 'Meat', 'Dry Goods', 'Spices'
  
  -- Unit of measure
  unit_of_measure VARCHAR(50) NOT NULL, -- e.g., 'kg', 'lb', 'oz', 'liters', 'units', 'dozen'
  
  -- Inventory tracking
  current_stock DECIMAL(10, 3) DEFAULT 0,
  minimum_stock DECIMAL(10, 3) DEFAULT 0,
  reorder_quantity DECIMAL(10, 3),
  
  -- Pricing
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  last_cost DECIMAL(10, 2),
  average_cost DECIMAL(10, 2),
  
  -- Supplier info
  preferred_supplier_id UUID,
  
  -- Location tracking
  storage_location VARCHAR(100),
  
  -- Perishability
  is_perishable BOOLEAN DEFAULT false,
  shelf_life_days INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_counted_at TIMESTAMPTZ,
  last_ordered_at TIMESTAMPTZ
);

CREATE INDEX idx_inventory_items_org ON inventory_items(organization_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_low_stock ON inventory_items(organization_id) 
  WHERE current_stock <= minimum_stock;

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view inventory"
  ON inventory_items FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Admins can manage inventory"
  ON inventory_items FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner')
  );

-- ============================================================================
-- 2. SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Supplier info
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'CA',
  
  -- Business details
  payment_terms VARCHAR(100), -- e.g., 'Net 30', 'COD', 'Net 60'
  tax_id VARCHAR(50),
  
  -- Rating & notes
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_org ON suppliers(organization_id);
CREATE INDEX idx_suppliers_active ON suppliers(organization_id, is_active) WHERE is_active = true;

-- Add foreign key for preferred supplier
ALTER TABLE inventory_items 
  ADD CONSTRAINT fk_inventory_preferred_supplier 
  FOREIGN KEY (preferred_supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view suppliers"
  ON suppliers FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Admins can manage suppliers"
  ON suppliers FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner')
  );

-- ============================================================================
-- 3. INVENTORY_TRANSACTIONS TABLE
-- ============================================================================
CREATE TYPE transaction_type AS ENUM (
  'purchase',      -- Incoming stock
  'usage',         -- Used in recipe/production
  'waste',         -- Spoilage or damage
  'adjustment',    -- Manual correction
  'transfer',      -- Between locations
  'return'         -- Return to supplier
);

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type transaction_type NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  unit_cost DECIMAL(10, 2),
  
  -- Reference
  reference_id UUID, -- Order ID, Recipe ID, or Transfer ID
  reference_type VARCHAR(50), -- 'order', 'recipe', 'transfer', etc.
  
  -- Notes
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(inventory_item_id, created_at DESC);
CREATE INDEX idx_inventory_transactions_org ON inventory_transactions(organization_id, created_at DESC);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view transactions"
  ON inventory_transactions FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Staff can create transactions"
  ON inventory_transactions FOR INSERT
  WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    performed_by = auth.uid()
  );

-- Trigger to update inventory stock on transaction
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current stock based on transaction type
  IF NEW.transaction_type = 'purchase' THEN
    UPDATE inventory_items 
    SET current_stock = current_stock + NEW.quantity,
        last_ordered_at = NOW(),
        last_cost = NEW.unit_cost,
        average_cost = (average_cost + NEW.unit_cost) / 2
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.transaction_type IN ('usage', 'waste') THEN
    UPDATE inventory_items 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE inventory_items 
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_stock_update
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock();

-- ============================================================================
-- 4. RECIPES TABLE
-- ============================================================================
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Recipe info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Yield
  yield_quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  yield_unit VARCHAR(50), -- e.g., 'servings', 'portions', 'kg'
  
  -- Instructions
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  
  -- Costing
  total_cost DECIMAL(10, 2) DEFAULT 0,
  cost_per_serving DECIMAL(10, 2) DEFAULT 0,
  
  -- Menu linking
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  
  -- Brand/Franchise control
  is_brand_recipe BOOLEAN DEFAULT false, -- Brand owner recipes cannot be edited by franchisees
  created_by_organization_id UUID REFERENCES organizations(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_recipes_org ON recipes(organization_id);
CREATE INDEX idx_recipes_menu_item ON recipes(menu_item_id);
CREATE INDEX idx_recipes_brand ON recipes(is_brand_recipe) WHERE is_brand_recipe = true;

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view recipes"
  ON recipes FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid OR
    created_by_organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Staff can manage non-brand recipes"
  ON recipes FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    is_brand_recipe = false
  );

CREATE POLICY "Brand owners can manage brand recipes"
  ON recipes FOR ALL
  USING (
    created_by_organization_id = (auth.jwt() ->> 'organization_id')::uuid AND
    (auth.jwt() ->> 'role') IN ('admin', 'owner')
  );

-- ============================================================================
-- 5. RECIPE_INGREDIENTS TABLE
-- ============================================================================
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  
  -- Quantity
  quantity DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(50), -- Should match inventory_item unit_of_measure
  
  -- Costing (snapshot at recipe creation)
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  
  -- Optional notes
  preparation_notes TEXT,
  
  -- Order in recipe
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_inventory ON recipe_ingredients(inventory_item_id);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipe ingredients"
  ON recipe_ingredients FOR SELECT
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );

CREATE POLICY "Users can manage recipe ingredients"
  ON recipe_ingredients FOR ALL
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND is_brand_recipe = false
    )
  );

-- Trigger to update recipe cost when ingredients change
CREATE OR REPLACE FUNCTION update_recipe_cost()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET 
    total_cost = (
      SELECT COALESCE(SUM(total_cost), 0)
      FROM recipe_ingredients
      WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ),
    cost_per_serving = total_cost / NULLIF(yield_quantity, 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_cost_update
  AFTER INSERT OR UPDATE OR DELETE ON recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_cost();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get low stock items
CREATE OR REPLACE FUNCTION get_low_stock_items(org_id UUID)
RETURNS TABLE(
  item_id UUID,
  item_name VARCHAR,
  current_stock DECIMAL,
  minimum_stock DECIMAL,
  reorder_quantity DECIMAL,
  unit_of_measure VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    name,
    inventory_items.current_stock,
    inventory_items.minimum_stock,
    inventory_items.reorder_quantity,
    inventory_items.unit_of_measure
  FROM inventory_items
  WHERE 
    organization_id = org_id
    AND is_active = true
    AND inventory_items.current_stock <= inventory_items.minimum_stock
  ORDER BY (inventory_items.current_stock / NULLIF(inventory_items.minimum_stock, 0));
END;
$$ LANGUAGE plpgsql;

-- Calculate recipe profitability
CREATE OR REPLACE FUNCTION calculate_recipe_margin(recipe_id_param UUID, selling_price DECIMAL)
RETURNS TABLE(
  total_cost DECIMAL,
  profit DECIMAL,
  margin_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.total_cost,
    (selling_price - r.total_cost) as profit,
    (((selling_price - r.total_cost) / NULLIF(selling_price, 0)) * 100) as margin_percentage
  FROM recipes r
  WHERE r.id = recipe_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE inventory_items IS 'Raw ingredients and supplies inventory tracking';
COMMENT ON TABLE suppliers IS 'Vendor and supplier contact information';
COMMENT ON TABLE inventory_transactions IS 'Inventory movement history (purchases, usage, waste, adjustments)';
COMMENT ON TABLE recipes IS 'Recipes with ingredient lists and costing';
COMMENT ON TABLE recipe_ingredients IS 'Ingredients required for each recipe with quantities';

COMMENT ON COLUMN recipes.is_brand_recipe IS 'Brand owner recipes - franchisees can view but not edit';
COMMENT ON COLUMN inventory_items.average_cost IS 'Rolling average cost for COGS calculation';
