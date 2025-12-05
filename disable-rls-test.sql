-- Temporarily disable RLS on these tables to test if that's the issue
-- Run this in Supabase SQL Editor

ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('restaurants', 'staff', 'locations');
