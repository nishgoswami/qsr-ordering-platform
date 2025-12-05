-- Fix the foreign key constraint issue
-- The problem is staff.user_id references auth.users but the user might not be visible yet
-- Run this in Supabase SQL Editor

-- Option 1: Make the foreign key constraint DEFERRABLE
-- This allows the constraint to be checked at the end of the transaction instead of immediately
ALTER TABLE staff 
DROP CONSTRAINT IF EXISTS staff_user_id_fkey;

ALTER TABLE staff 
ADD CONSTRAINT staff_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
DEFERRABLE INITIALLY DEFERRED;

-- Verify the constraint
SELECT 
    con.conname as constraint_name,
    con.contype as constraint_type,
    CASE con.condeferrable 
        WHEN true THEN 'DEFERRABLE' 
        ELSE 'NOT DEFERRABLE' 
    END as deferrable,
    CASE con.condeferred 
        WHEN true THEN 'INITIALLY DEFERRED' 
        ELSE 'INITIALLY IMMEDIATE' 
    END as deferred
FROM pg_constraint con
WHERE con.conname = 'staff_user_id_fkey';
