-- PRODUCTION DEPLOYMENT: Database Reset Script
-- Run this in Supabase SQL Editor BEFORE deploying
-- ⚠️ WARNING: This will DELETE ALL existing data!

-- ==================================================
-- STEP 1: Clean ALL existing data
-- ==================================================

-- Delete in reverse foreign key order
DELETE FROM order_status_history;
DELETE FROM orders;
DELETE FROM delivery_zones;
DELETE FROM inventory_items;
DELETE FROM printers;
DELETE FROM menu_items;
DELETE FROM categories;
DELETE FROM customers;
DELETE FROM locations;
DELETE FROM staff;
DELETE FROM restaurants;

-- Clean auth users (this will cascade delete staff records)
DELETE FROM auth.users;

-- ==================================================
-- STEP 2: Disable RLS (for clean signup process)
-- ==================================================

ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE printers DISABLE ROW LEVEL SECURITY;

-- ==================================================
-- STEP 3: Fix Foreign Key Constraints
-- ==================================================

-- Make staff.user_id foreign key deferrable
ALTER TABLE staff 
DROP CONSTRAINT IF EXISTS staff_user_id_fkey;

ALTER TABLE staff 
ADD CONSTRAINT staff_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
DEFERRABLE INITIALLY DEFERRED;

-- ==================================================
-- STEP 4: Verify Clean State
-- ==================================================

SELECT 
    'restaurants' as table_name, 
    COUNT(*) as row_count 
FROM restaurants
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'locations', COUNT(*) FROM locations
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;

-- All counts should be 0

-- ==================================================
-- STEP 5: Verify RLS is disabled
-- ==================================================

SELECT 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'restaurants', 'staff', 'locations', 'categories', 
    'menu_items', 'customers', 'orders'
)
ORDER BY tablename;

-- All should show: rls_enabled = false

-- ==================================================
-- Database is now ready for clean production deployment!
-- ==================================================
