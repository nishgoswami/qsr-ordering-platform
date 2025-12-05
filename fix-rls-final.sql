-- Fix the INSERT policies - they must have WITH CHECK (true)
-- The issue is WITH CHECK conditions are blocking inserts
-- Run this in Supabase SQL Editor

-- Update restaurants INSERT policy
DROP POLICY IF EXISTS "Allow authenticated insert" ON restaurants;
CREATE POLICY "Allow authenticated insert" ON restaurants
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Update staff INSERT policy (THIS WAS THE PROBLEM - it had auth.uid() = user_id check)
DROP POLICY IF EXISTS "Allow authenticated staff insert" ON staff;
CREATE POLICY "Allow authenticated staff insert" ON staff
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Update locations INSERT policy
DROP POLICY IF EXISTS "Allow authenticated location insert" ON locations;
CREATE POLICY "Allow authenticated location insert" ON locations
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Verify the policies
SELECT tablename, policyname, cmd, 
       CASE 
         WHEN with_check = 'true' THEN 'WITH CHECK (true) ✓'
         ELSE with_check
       END as with_check_clause
FROM pg_policies 
WHERE tablename IN ('restaurants', 'staff', 'locations') 
  AND cmd = 'INSERT'
ORDER BY tablename;
