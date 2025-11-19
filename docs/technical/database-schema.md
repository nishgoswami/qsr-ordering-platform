# Database Schema

## 📊 Schema Overview

The database is designed for **multi-tenant SaaS** with strict organization isolation using PostgreSQL Row Level Security (RLS).

### Schema Statistics (MVP)
- **10 core tables** for initial launch
- **60+ planned tables** for full system
- **PostGIS extension** for geofencing
- **Full-text search** on menu items
- **JSONB columns** for flexible data

## 🗂️ Core Tables (MVP)

### 1. organizations
Restaurant/business tenant table.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly name
  
  -- Contact info
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Location
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'CA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Order model configuration
  order_model VARCHAR(20) NOT NULL DEFAULT 'hybrid', -- 'realtime', 'advanced', 'hybrid'
  
  -- Timing settings
  prep_time_minutes INTEGER DEFAULT 15,
  advance_order_days INTEGER DEFAULT 7,
  
  -- Operating hours (JSONB)
  business_hours JSONB DEFAULT '{}', -- {monday: [{open: "09:00", close: "21:00"}], ...}
  
  -- Delivery settings
  delivery_enabled BOOLEAN DEFAULT false,
  pickup_enabled BOOLEAN DEFAULT true,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  minimum_order DECIMAL(10, 2) DEFAULT 0,
  
  -- Payment
  stripe_account_id VARCHAR(255),
  stripe_connected BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (auth.jwt() ->> 'organization_id')::uuid = id);

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    (auth.jwt() ->> 'organization_id')::uuid = id AND
    (auth.jwt() ->> 'role') = 'admin'
  );
```

### 2. users
User authentication and role management.

```sql
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Profile
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  
  -- Role & permissions
  role user_role DEFAULT 'customer',
  
  -- Customer-specific
  default_address JSONB, -- {line1, line2, city, state, postal_code, lat, lng}
  
  -- Staff-specific
  can_manage_orders BOOLEAN DEFAULT false,
  can_manage_menu BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());
```

### 3. categories
Menu categories (Burgers, Pizza, Drinks, etc.)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Ordering
  order_index INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_org ON categories(organization_id);
CREATE INDEX idx_categories_active ON categories(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_categories_order ON categories(organization_id, order_index);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage categories"
  ON categories FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

### 4. menu_items
Individual menu items with pricing.

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2), -- Original price for discounts
  
  -- Kitchen info
  prep_time_minutes INTEGER DEFAULT 10,
  printer_station VARCHAR(50), -- 'grill', 'fryer', 'cold_station', etc.
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  available_for_pickup BOOLEAN DEFAULT true,
  available_for_delivery BOOLEAN DEFAULT true,
  
  -- Inventory (optional)
  track_inventory BOOLEAN DEFAULT false,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER,
  
  -- SEO & Search
  search_tags TEXT[], -- ['spicy', 'vegetarian', 'gluten-free']
  search_vector TSVECTOR, -- Full-text search
  
  -- Ordering
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_menu_items_org ON menu_items(organization_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_active ON menu_items(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_menu_items_search ON menu_items USING GIN(search_vector);

-- Full-text search trigger
CREATE TRIGGER menu_items_search_update
  BEFORE INSERT OR UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description);

-- RLS Policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active menu items"
  ON menu_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage menu items"
  ON menu_items FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

### 5. item_modifiers
Customization options (sizes, toppings, extras).

```sql
CREATE TYPE modifier_type AS ENUM ('size', 'addon', 'removal', 'choice');

CREATE TABLE item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Modifier info
  name VARCHAR(255) NOT NULL, -- "Size", "Extra Toppings", "Remove Items"
  type modifier_type NOT NULL,
  
  -- Options (JSONB array)
  options JSONB NOT NULL DEFAULT '[]',
  /* Example:
  [
    {name: "Small", price: 0, default: true},
    {name: "Medium", price: 2.00},
    {name: "Large", price: 4.00}
  ]
  */
  
  -- Rules
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER, -- NULL = unlimited
  
  -- Ordering
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_modifiers_item ON item_modifiers(menu_item_id);
CREATE INDEX idx_modifiers_order ON item_modifiers(menu_item_id, order_index);

-- RLS Policies
ALTER TABLE item_modifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modifiers"
  ON item_modifiers FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage modifiers"
  ON item_modifiers FOR ALL
  USING (
    menu_item_id IN (
      SELECT id FROM menu_items 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );
```

### 6. orders
Order header table.

```sql
CREATE TYPE order_type AS ENUM ('pickup', 'delivery');
CREATE TYPE fulfillment_type AS ENUM ('asap', 'scheduled');
CREATE TYPE delivery_method AS ENUM ('restaurant', 'customer_arranged');
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready', 
  'out_for_delivery', 'completed', 'cancelled'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Order identification
  order_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable: ORD-20251118-0001
  
  -- Order type
  order_type order_type NOT NULL,
  fulfillment_type fulfillment_type NOT NULL,
  delivery_method delivery_method, -- Only for delivery orders
  
  -- Timing
  scheduled_for TIMESTAMPTZ, -- NULL for ASAP orders
  estimated_ready_at TIMESTAMPTZ,
  actual_ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Customer info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  
  -- Delivery address (for delivery orders)
  delivery_address JSONB,
  /* {
    line1: string,
    line2: string,
    city: string,
    state: string,
    postal_code: string,
    latitude: number,
    longitude: number,
    delivery_instructions: string
  } */
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  tip DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_intent_id VARCHAR(255), -- Stripe Payment Intent ID
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  
  -- Status
  status order_status DEFAULT 'pending',
  
  -- Notes
  customer_notes TEXT,
  kitchen_notes TEXT,
  
  -- Printing
  kitchen_printed BOOLEAN DEFAULT false,
  customer_printed BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(organization_id, status);
CREATE INDEX idx_orders_scheduled ON orders(organization_id, scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_orders_created ON orders(organization_id, created_at DESC);

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Staff can view all organization orders"
  ON orders FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

### 7. order_items
Order line items (what was ordered).

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  
  -- Item details (snapshot at order time)
  item_name VARCHAR(255) NOT NULL,
  item_price DECIMAL(10, 2) NOT NULL,
  
  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Modifiers selected (JSONB)
  modifiers_selected JSONB DEFAULT '[]',
  /* [
    {modifier_name: "Size", option_name: "Large", price: 4.00},
    {modifier_name: "Extra", option_name: "Cheese", price: 1.50}
  ] */
  
  -- Special instructions
  special_instructions TEXT,
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL, -- Base price + modifier prices
  total_price DECIMAL(10, 2) NOT NULL, -- unit_price * quantity
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- RLS Policies (inherit from orders table)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items from their orders"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE customer_id = auth.uid() 
      OR organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );
```

### 8. printers
Thermal printer configuration.

```sql
CREATE TYPE printer_type AS ENUM ('network', 'usb', 'bluetooth');
CREATE TYPE printer_purpose AS ENUM ('kitchen', 'customer', 'both');

CREATE TABLE printers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Printer info
  name VARCHAR(100) NOT NULL,
  printer_type printer_type DEFAULT 'network',
  purpose printer_purpose DEFAULT 'kitchen',
  
  -- Connection settings
  ip_address INET, -- For network printers
  port INTEGER DEFAULT 9100,
  usb_path VARCHAR(255), -- For USB printers
  bluetooth_address VARCHAR(255), -- For Bluetooth printers
  
  -- Print settings (JSONB)
  print_settings JSONB DEFAULT '{}',
  /* {
    paper_width: 80, // mm
    font_size: 'medium',
    auto_cut: true,
    copies: 1
  } */
  
  -- Station assignment
  assigned_stations TEXT[], -- ['grill', 'fryer', 'cold_station']
  print_all_items BOOLEAN DEFAULT false, -- If true, prints all items regardless of station
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_test_at TIMESTAMPTZ,
  last_test_success BOOLEAN,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_printers_org ON printers(organization_id);
CREATE INDEX idx_printers_active ON printers(organization_id, is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage printers"
  ON printers FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

### 9. delivery_zones
Geofencing for delivery areas.

```sql
-- Requires PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE zone_type AS ENUM ('radius', 'polygon');

CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Zone info
  name VARCHAR(100) NOT NULL,
  
  -- Zone definition
  zone_type zone_type NOT NULL,
  
  -- For radius zones
  center_point GEOGRAPHY(POINT, 4326), -- Restaurant location
  radius_km DECIMAL(10, 2), -- Radius in kilometers
  
  -- For polygon zones
  boundary GEOGRAPHY(POLYGON, 4326), -- Custom boundary
  
  -- Pricing
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  minimum_order DECIMAL(10, 2) DEFAULT 0,
  
  -- Timing
  estimated_delivery_minutes INTEGER DEFAULT 30,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index
CREATE INDEX idx_delivery_zones_boundary ON delivery_zones USING GIST(boundary);
CREATE INDEX idx_delivery_zones_org ON delivery_zones(organization_id);

-- Helper function to check if address is in delivery zone
CREATE OR REPLACE FUNCTION is_in_delivery_area(
  org_id UUID,
  lat DECIMAL,
  lng DECIMAL
) RETURNS TABLE(
  zone_id UUID,
  zone_name VARCHAR,
  delivery_fee DECIMAL,
  minimum_order DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dz.id,
    dz.name,
    dz.delivery_fee,
    dz.minimum_order
  FROM delivery_zones dz
  WHERE 
    dz.organization_id = org_id
    AND dz.is_active = true
    AND (
      (dz.zone_type = 'radius' 
       AND ST_DWithin(dz.center_point::geography, ST_MakePoint(lng, lat)::geography, dz.radius_km * 1000))
      OR
      (dz.zone_type = 'polygon' 
       AND ST_Contains(dz.boundary, ST_MakePoint(lng, lat)::geography))
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active zones"
  ON delivery_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage zones"
  ON delivery_zones FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);
```

### 10. conversations & messages
In-app chat system.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Optional: link to specific order
  
  -- Status
  is_open BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Message content
  message_text TEXT NOT NULL,
  
  -- Message type
  is_from_customer BOOLEAN DEFAULT true,
  
  -- Read status
  read_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_org ON conversations(organization_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    customer_id = auth.uid() 
    OR organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE customer_id = auth.uid() 
      OR organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() 
    AND conversation_id IN (
      SELECT id FROM conversations 
      WHERE customer_id = auth.uid() 
      OR organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );
```

## 🔮 Future Tables (Planned)

### Inventory Management
- `inventory_items`
- `inventory_transactions`
- `stock_levels`
- `purchase_orders`
- `suppliers`

### Employee Management
- `employees`
- `employee_schedules`
- `time_clock`
- `employee_permissions`

### Table Management (Dine-in)
- `tables`
- `table_reservations`
- `floor_plans`

### Loyalty & Marketing
- `loyalty_programs`
- `customer_points`
- `promotions`
- `discount_codes`

### Analytics
- `daily_sales_summary`
- `hourly_sales`
- `popular_items_cache`

### Multi-location
- `locations`
- `location_inventory`
- `transfer_requests`

---

**Last Updated:** November 18, 2025  
**Version:** 0.1.0 (MVP Schema)  
**Total Tables:** 10 core + 60+ planned
