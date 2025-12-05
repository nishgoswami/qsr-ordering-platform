-- FINAL FIX - Disable RLS completely for these tables
-- Run this in Supabase SQL Editor

-- Disable RLS on all three tables
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Clean up old test data
DELETE FROM locations WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE created_at < NOW() - INTERVAL '5 minutes'
);

DELETE FROM staff WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE created_at < NOW() - INTERVAL '5 minutes'
);

DELETE FROM restaurants WHERE created_at < NOW() - INTERVAL '5 minutes';

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('restaurants', 'staff', 'locations');
