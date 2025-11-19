-- ============================================================================
-- SEED INITIAL TEST DATA
-- ============================================================================

-- Insert Test Organization (Restaurant)
INSERT INTO organizations (
  id,
  name,
  slug,
  email,
  phone,
  address_line1,
  city,
  state,
  postal_code,
  country,
  latitude,
  longitude,
  order_model,
  prep_time_minutes,
  advance_order_days,
  business_hours,
  delivery_enabled,
  pickup_enabled,
  delivery_fee,
  minimum_order,
  is_active,
  onboarding_completed
) VALUES (
  'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c',
  'Demo Restaurant',
  'demo-restaurant',
  'demo@restaurant.com',
  '555-0123',
  '123 Main Street',
  'Toronto',
  'ON',
  'M5H 2N2',
  'CA',
  43.6532,
  -79.3832,
  'hybrid',
  15,
  7,
  '{"monday": [{"open": "11:00", "close": "22:00"}], "tuesday": [{"open": "11:00", "close": "22:00"}], "wednesday": [{"open": "11:00", "close": "22:00"}], "thursday": [{"open": "11:00", "close": "22:00"}], "friday": [{"open": "11:00", "close": "23:00"}], "saturday": [{"open": "11:00", "close": "23:00"}], "sunday": [{"open": "11:00", "close": "21:00"}]}'::jsonb,
  true,
  true,
  4.99,
  15.00,
  true,
  true
);

-- Insert Categories
INSERT INTO categories (id, organization_id, name, description, order_index, is_active) VALUES
('c1111111-1111-1111-1111-111111111111', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'Burgers', 'Classic burgers made fresh', 1, true),
('c2222222-2222-2222-2222-222222222222', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'Pizza', 'Hand-tossed pizzas', 2, true),
('c3333333-3333-3333-3333-333333333333', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'Sides', 'Delicious sides', 3, true),
('c4444444-4444-4444-4444-444444444444', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'Drinks', 'Refreshing beverages', 4, true),
('c5555555-5555-5555-5555-555555555555', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'Desserts', 'Sweet treats', 5, true);

-- Insert Menu Items - Burgers
INSERT INTO menu_items (
  id, organization_id, category_id, name, description, price, 
  prep_time_minutes, printer_station, is_active, order_index, search_tags
) VALUES
('m1111111-1111-1111-1111-111111111111', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c1111111-1111-1111-1111-111111111111', 
 'Classic Cheeseburger', 'Beef patty, cheese, lettuce, tomato, onion, pickles', 9.99, 10, 'grill', true, 1, 
 ARRAY['burger', 'beef', 'cheese']),

('m1111111-1111-1111-1111-111111111112', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c1111111-1111-1111-1111-111111111111', 
 'Bacon Deluxe Burger', 'Double beef, bacon, cheddar, BBQ sauce', 13.99, 12, 'grill', true, 2, 
 ARRAY['burger', 'beef', 'bacon', 'bbq']),

('m1111111-1111-1111-1111-111111111113', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c1111111-1111-1111-1111-111111111111', 
 'Veggie Burger', 'Plant-based patty, lettuce, tomato, special sauce', 10.99, 10, 'grill', true, 3, 
 ARRAY['burger', 'vegetarian', 'plant-based']);

-- Insert Menu Items - Pizza
INSERT INTO menu_items (
  id, organization_id, category_id, name, description, price, 
  prep_time_minutes, printer_station, is_active, order_index, search_tags
) VALUES
('m2222222-2222-2222-2222-222222222221', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c2222222-2222-2222-2222-222222222222', 
 'Margherita Pizza', 'Tomato sauce, mozzarella, fresh basil', 12.99, 15, 'pizza_oven', true, 1, 
 ARRAY['pizza', 'vegetarian', 'italian']),

('m2222222-2222-2222-2222-222222222222', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c2222222-2222-2222-2222-222222222222', 
 'Pepperoni Pizza', 'Tomato sauce, mozzarella, pepperoni', 14.99, 15, 'pizza_oven', true, 2, 
 ARRAY['pizza', 'pepperoni', 'italian']),

('m2222222-2222-2222-2222-222222222223', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c2222222-2222-2222-2222-222222222222', 
 'Supreme Pizza', 'Pepperoni, sausage, peppers, onions, mushrooms', 16.99, 18, 'pizza_oven', true, 3, 
 ARRAY['pizza', 'meat', 'vegetables', 'italian']);

-- Insert Menu Items - Sides
INSERT INTO menu_items (
  id, organization_id, category_id, name, description, price, 
  prep_time_minutes, printer_station, is_active, order_index, search_tags
) VALUES
('m3333333-3333-3333-3333-333333333331', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c3333333-3333-3333-3333-333333333333', 
 'French Fries', 'Crispy golden fries', 3.99, 5, 'fryer', true, 1, 
 ARRAY['fries', 'side', 'crispy']),

('m3333333-3333-3333-3333-333333333332', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c3333333-3333-3333-3333-333333333333', 
 'Onion Rings', 'Beer-battered onion rings', 4.99, 6, 'fryer', true, 2, 
 ARRAY['onion rings', 'side', 'crispy']),

('m3333333-3333-3333-3333-333333333333', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c3333333-3333-3333-3333-333333333333', 
 'Caesar Salad', 'Romaine, parmesan, croutons, Caesar dressing', 6.99, 5, 'cold_station', true, 3, 
 ARRAY['salad', 'vegetarian', 'healthy']);

-- Insert Menu Items - Drinks
INSERT INTO menu_items (
  id, organization_id, category_id, name, description, price, 
  prep_time_minutes, printer_station, is_active, order_index, search_tags
) VALUES
('m4444444-4444-4444-4444-444444444441', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c4444444-4444-4444-4444-444444444444', 
 'Fountain Drink', 'Coke, Pepsi, Sprite, etc.', 2.49, 1, 'cold_station', true, 1, 
 ARRAY['drink', 'soda', 'beverage']),

('m4444444-4444-4444-4444-444444444442', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c4444444-4444-4444-4444-444444444444', 
 'Milkshake', 'Vanilla, chocolate, or strawberry', 4.99, 3, 'cold_station', true, 2, 
 ARRAY['milkshake', 'dessert', 'ice cream']),

('m4444444-4444-4444-4444-444444444443', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c4444444-4444-4444-4444-444444444444', 
 'Bottled Water', 'Spring water 500ml', 1.99, 1, 'cold_station', true, 3, 
 ARRAY['water', 'healthy', 'beverage']);

-- Insert Menu Items - Desserts
INSERT INTO menu_items (
  id, organization_id, category_id, name, description, price, 
  prep_time_minutes, printer_station, is_active, order_index, search_tags
) VALUES
('m5555555-5555-5555-5555-555555555551', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c5555555-5555-5555-5555-555555555555', 
 'Chocolate Brownie', 'Warm brownie with vanilla ice cream', 5.99, 5, 'dessert_station', true, 1, 
 ARRAY['dessert', 'chocolate', 'ice cream']),

('m5555555-5555-5555-5555-555555555552', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c5555555-5555-5555-5555-555555555555', 
 'Apple Pie', 'Classic apple pie slice', 4.99, 3, 'dessert_station', true, 2, 
 ARRAY['dessert', 'pie', 'apple']),

('m5555555-5555-5555-5555-555555555553', 'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c', 'c5555555-5555-5555-5555-555555555555', 
 'Ice Cream Sundae', 'Three scoops with toppings', 6.99, 4, 'dessert_station', true, 3, 
 ARRAY['dessert', 'ice cream', 'sundae']);

-- Insert Modifiers for Burgers
INSERT INTO item_modifiers (menu_item_id, name, type, options, is_required, min_selections, max_selections, order_index) VALUES
-- Classic Cheeseburger - Size
('m1111111-1111-1111-1111-111111111111', 'Size', 'size', 
 '[{"name": "Regular", "price": 0, "default": true}, {"name": "Large", "price": 2.00}]'::jsonb, 
 true, 1, 1, 1),

-- Classic Cheeseburger - Extras
('m1111111-1111-1111-1111-111111111111', 'Add Extras', 'addon', 
 '[{"name": "Extra Cheese", "price": 1.50}, {"name": "Bacon", "price": 2.00}, {"name": "Avocado", "price": 2.50}, {"name": "Fried Egg", "price": 1.50}]'::jsonb, 
 false, 0, null, 2),

-- Classic Cheeseburger - Remove Items
('m1111111-1111-1111-1111-111111111111', 'Remove Items', 'removal', 
 '[{"name": "No Pickles", "price": 0}, {"name": "No Onions", "price": 0}, {"name": "No Tomato", "price": 0}]'::jsonb, 
 false, 0, null, 3);

-- Insert Modifiers for Pizza
INSERT INTO item_modifiers (menu_item_id, name, type, options, is_required, min_selections, max_selections, order_index) VALUES
-- Margherita Pizza - Size
('m2222222-2222-2222-2222-222222222221', 'Size', 'size', 
 '[{"name": "Small (10\")", "price": 0}, {"name": "Medium (12\")", "price": 3.00, "default": true}, {"name": "Large (14\")", "price": 6.00}, {"name": "X-Large (16\")", "price": 9.00}]'::jsonb, 
 true, 1, 1, 1),

-- Margherita Pizza - Extra Toppings
('m2222222-2222-2222-2222-222222222221', 'Extra Toppings', 'addon', 
 '[{"name": "Extra Cheese", "price": 2.00}, {"name": "Mushrooms", "price": 1.50}, {"name": "Peppers", "price": 1.50}, {"name": "Olives", "price": 1.50}]'::jsonb, 
 false, 0, null, 2);

-- Insert Modifiers for Drinks
INSERT INTO item_modifiers (menu_item_id, name, type, options, is_required, min_selections, max_selections, order_index) VALUES
-- Fountain Drink - Size
('m4444444-4444-4444-4444-444444444441', 'Size', 'size', 
 '[{"name": "Small", "price": 0}, {"name": "Medium", "price": 0.50, "default": true}, {"name": "Large", "price": 1.00}]'::jsonb, 
 true, 1, 1, 1),

-- Fountain Drink - Choice
('m4444444-4444-4444-4444-444444444441', 'Drink Type', 'choice', 
 '[{"name": "Coke", "price": 0, "default": true}, {"name": "Diet Coke", "price": 0}, {"name": "Sprite", "price": 0}, {"name": "Fanta Orange", "price": 0}, {"name": "Root Beer", "price": 0}]'::jsonb, 
 true, 1, 1, 2),

-- Milkshake - Flavor
('m4444444-4444-4444-4444-444444444442', 'Flavor', 'choice', 
 '[{"name": "Vanilla", "price": 0, "default": true}, {"name": "Chocolate", "price": 0}, {"name": "Strawberry", "price": 0}]'::jsonb, 
 true, 1, 1, 1);

-- Insert Sample Delivery Zone (5km radius around restaurant)
INSERT INTO delivery_zones (
  organization_id,
  name,
  zone_type,
  center_point,
  radius_km,
  delivery_fee,
  minimum_order,
  estimated_delivery_minutes,
  is_active
) VALUES (
  'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c',
  'Downtown Toronto',
  'radius',
  ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)::geography,
  5.0,
  4.99,
  15.00,
  30,
  true
);

-- Insert Sample Printer
INSERT INTO printers (
  organization_id,
  name,
  printer_type,
  purpose,
  ip_address,
  port,
  assigned_stations,
  print_all_items,
  is_active
) VALUES (
  'b47e3a6c-5f9d-4c8e-9b1a-2d3e4f5a6b7c',
  'Kitchen Printer 1',
  'network',
  'kitchen',
  '192.168.1.100',
  9100,
  ARRAY['grill', 'fryer', 'pizza_oven', 'cold_station', 'dessert_station'],
  true,
  true
);

-- Note: User accounts need to be created through Supabase Auth
-- You can use the admin dashboard or Supabase Auth API to create test users
-- Example users to create:
--   1. Admin: admin@demo.com (role: admin)
--   2. Staff: staff@demo.com (role: staff)
--   3. Customer: customer@demo.com (role: customer)
