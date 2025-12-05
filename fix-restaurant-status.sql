-- Fix restaurant status to make it visible on the website
-- Run this in Supabase SQL Editor

-- Check current restaurant status
SELECT id, name, approval_status, is_active 
FROM restaurants 
WHERE email = 'kitchenbyria@gmail.com';

-- Update restaurant to be active
UPDATE restaurants 
SET is_active = true
WHERE email = 'kitchenbyria@gmail.com';

-- Verify the update
SELECT id, name, approval_status, is_active 
FROM restaurants 
WHERE email = 'kitchenbyria@gmail.com';
