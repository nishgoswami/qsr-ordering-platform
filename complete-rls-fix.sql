-- COMPLETE RLS FIX - Run this entire script
-- This will reset all RLS policies for signup to work

-- ============================================
-- STEP 1: Remove ALL existing policies
-- ============================================

-- Drop all policies on restaurants
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'restaurants') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON restaurants', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on staff
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'staff') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON staff', r.policyname);
    END LOOP;
END $$;

-- Drop all policies on locations
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'locations') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON locations', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Create new policies for signup
-- ============================================

-- RESTAURANTS: Allow authenticated users to insert during signup
CREATE POLICY "restaurants_insert_authenticated" ON restaurants
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- RESTAURANTS: Allow public to view active restaurants
CREATE POLICY "restaurants_select_public" ON restaurants
  FOR SELECT
  USING (is_active = true);

-- RESTAURANTS: Allow staff to manage their own restaurant
CREATE POLICY "restaurants_all_staff" ON restaurants
  FOR ALL 
  TO authenticated
  USING (
    id IN (SELECT restaurant_id FROM staff WHERE user_id = auth.uid())
  );

-- STAFF: Allow authenticated users to insert during signup
CREATE POLICY "staff_insert_authenticated" ON staff
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- STAFF: Allow staff to view/manage records in their restaurant
CREATE POLICY "staff_all_own_restaurant" ON staff
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE user_id = auth.uid())
  );

-- LOCATIONS: Allow authenticated users to insert during signup
CREATE POLICY "locations_insert_authenticated" ON locations
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- LOCATIONS: Allow staff to manage their restaurant's locations
CREATE POLICY "locations_all_staff" ON locations
  FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (SELECT restaurant_id FROM staff WHERE user_id = auth.uid())
  );

-- ============================================
-- STEP 3: Verify policies were created
-- ============================================

SELECT 
  tablename,
  policyname,
  cmd as command,
  roles
FROM pg_policies 
WHERE tablename IN ('restaurants', 'staff', 'locations')
ORDER BY tablename, policyname;
