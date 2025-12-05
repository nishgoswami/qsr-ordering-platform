-- Complete cleanup and finalization
-- Run this in Supabase SQL Editor

-- STEP 1: Clean up any test/incomplete signups
DELETE FROM locations WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE approval_status = 'pending' AND created_at < NOW() - INTERVAL '1 hour'
);

DELETE FROM staff WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE approval_status = 'pending' AND created_at < NOW() - INTERVAL '1 hour'
);

DELETE FROM restaurants WHERE approval_status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';

-- STEP 2: Re-enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- STEP 3: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('restaurants', 'staff', 'locations');

-- STEP 4: Verify foreign key constraint is still deferrable
SELECT 
    con.conname as constraint_name,
    CASE con.condeferrable 
        WHEN true THEN 'DEFERRABLE ✓' 
        ELSE 'NOT DEFERRABLE' 
    END as status
FROM pg_constraint con
WHERE con.conname = 'staff_user_id_fkey';
