-- Permanently disable RLS on signup tables
-- These tables don't need RLS for our use case since we control access via authentication

ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since we're not using RLS
DROP POLICY IF EXISTS "Allow authenticated insert" ON restaurants;
DROP POLICY IF EXISTS "Public can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Staff can manage own restaurant" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated staff insert" ON staff;
DROP POLICY IF EXISTS "Staff can manage own records" ON staff;
DROP POLICY IF EXISTS "Allow authenticated location insert" ON locations;
DROP POLICY IF EXISTS "Staff can manage own locations" ON locations;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('restaurants', 'staff', 'locations');
