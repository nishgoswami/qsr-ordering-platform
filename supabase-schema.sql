-- QSR Ordering Platform - Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vabynepynqlioszjqufs/editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- RESTAURANTS & LOCATIONS
-- ============================================

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/New_York',
  logo_url TEXT,
  
  -- Business settings
  is_active BOOLEAN DEFAULT false, -- Starts as FALSE until approved
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'professional', 'business', 'enterprise'
  subscription_status TEXT DEFAULT 'pending_approval', -- 'pending_approval', 'active', 'suspended', 'cancelled'
  
  -- Approval workflow
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Multi-location support
  is_franchise BOOLEAN DEFAULT false,
  parent_restaurant_id UUID REFERENCES restaurants(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Location details
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  
  -- Coordinates for delivery
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Operating hours (JSON format)
  business_hours JSONB,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, slug)
);

-- ============================================
-- MENU MANAGEMENT
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, slug)
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id), -- NULL = available at all locations
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  
  -- Images
  image_url TEXT,
  images JSONB, -- Array of image URLs
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Dietary info
  calories INTEGER,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  allergens TEXT[],
  
  -- Modifiers/options
  modifiers JSONB, -- Array of modifier groups
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, slug)
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Customer info
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  
  -- Saved addresses
  addresses JSONB, -- Array of addresses
  
  -- Loyalty
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, phone)
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  customer_id UUID REFERENCES customers(id),
  
  -- Order details
  order_number TEXT NOT NULL,
  
  -- Customer info (snapshot at time of order)
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  
  -- Order type
  order_type TEXT NOT NULL, -- 'dine_in', 'takeout', 'delivery', 'curbside'
  
  -- Delivery details
  delivery_address JSONB,
  delivery_instructions TEXT,
  
  -- Items (stored as JSON for historical record)
  items JSONB NOT NULL,
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tip DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'
  
  -- Payment
  payment_method TEXT, -- 'cash', 'card', 'online'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  payment_intent_id TEXT, -- Stripe payment intent
  
  -- Timestamps
  confirmed_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Estimated times
  estimated_ready_time TIMESTAMPTZ,
  estimated_delivery_time TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  kitchen_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, order_number)
);

-- Order status history for tracking
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by TEXT, -- User ID or 'system'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DELIVERY ZONES
-- ============================================

CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  
  name TEXT NOT NULL,
  
  -- Zone definition (GeoJSON polygon)
  zone_polygon JSONB NOT NULL,
  
  -- Pricing
  delivery_fee DECIMAL(10, 2) NOT NULL,
  minimum_order DECIMAL(10, 2) DEFAULT 0,
  
  -- Timing
  estimated_delivery_time INTEGER, -- in minutes
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STAFF & USERS
-- ============================================

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth
  
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Role & Permissions
  role TEXT NOT NULL, -- 'super_admin', 'franchise_owner', 'location_manager', 'staff'
  
  -- Location access
  location_ids UUID[], -- Array of accessible location IDs (empty = all locations)
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id, email)
);

-- ============================================
-- INVENTORY (Business Tier)
-- ============================================

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit TEXT, -- 'kg', 'lb', 'oz', 'piece', etc.
  
  current_quantity DECIMAL(10, 2) DEFAULT 0,
  minimum_quantity DECIMAL(10, 2) DEFAULT 0,
  
  unit_cost DECIMAL(10, 2),
  
  supplier_name TEXT,
  supplier_phone TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRINTERS (Network Printers)
-- ============================================

CREATE TABLE printers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  port INTEGER DEFAULT 9100,
  printer_type TEXT DEFAULT 'receipt', -- 'receipt', 'kitchen', 'label'
  
  -- What to print
  print_receipts BOOLEAN DEFAULT true,
  print_kitchen_tickets BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_location_id ON orders(location_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_location_id ON menu_items(location_id);

CREATE INDEX idx_customers_restaurant_id ON customers(restaurant_id);
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE INDEX idx_staff_restaurant_id ON staff(restaurant_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your auth strategy)
-- Allow public read access to restaurants and menu items
CREATE POLICY "Public can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active menu items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (is_active = true);

-- Staff can manage their own restaurant's data
CREATE POLICY "Staff can manage own restaurant" ON restaurants
  FOR ALL USING (
    id IN (
      SELECT restaurant_id FROM staff WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to add sample restaurant
/*
INSERT INTO restaurants (name, slug, email, phone, address, city, state, zip_code)
VALUES ('Demo Restaurant', 'demo-restaurant', 'demo@restaurant.com', '555-0100', '123 Main St', 'New York', 'NY', '10001');
*/
