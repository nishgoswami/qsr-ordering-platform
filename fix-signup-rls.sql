-- Fix RLS policies to allow signup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vabynepynqlioszjqufs/editor

-- First, drop the existing policies
DROP POLICY IF EXISTS "Allow signup - authenticated users can create restaurant" ON restaurants;
DROP POLICY IF EXISTS "Allow signup - authenticated users can create staff" ON staff;
DROP POLICY IF EXISTS "Allow signup - authenticated users can create location" ON locations;
DROP POLICY IF EXISTS "Staff can manage own restaurant" ON restaurants;

-- Allow ANY authenticated user to create a restaurant during signup
CREATE POLICY "Allow authenticated insert" ON restaurants
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to create their staff record during signup
CREATE POLICY "Allow authenticated staff insert" ON staff
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to create locations for restaurants they own
CREATE POLICY "Allow authenticated location insert" ON locations
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Staff can manage their own restaurant (SELECT, UPDATE, DELETE)
CREATE POLICY "Staff can manage own restaurant" ON restaurants
  FOR ALL 
  TO authenticated
  USING (
    id IN (
      SELECT restaurant_id FROM staff WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT restaurant_id FROM staff WHERE user_id = auth.uid()
    )
  );

-- Staff can manage their own staff records
CREATE POLICY "Staff can manage own records" ON staff
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM staff WHERE user_id = auth.uid()
    )
  );

-- Staff can manage their restaurant's locations
CREATE POLICY "Staff can manage own locations" ON locations
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM staff WHERE user_id = auth.uid()
    )
  );
