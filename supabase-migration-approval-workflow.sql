-- Migration: Add Approval Workflow to Existing Restaurants Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vabynepynqlioszjqufs/editor
-- Date: November 30, 2025

-- Step 1: Add approval workflow columns (if they don't exist)
ALTER TABLE restaurants 
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Step 2: Update defaults for new restaurants
ALTER TABLE restaurants 
  ALTER COLUMN subscription_status SET DEFAULT 'pending_approval',
  ALTER COLUMN is_active SET DEFAULT false;

-- Step 3: Grandfather in existing restaurants (set them as approved)
UPDATE restaurants
SET 
  approval_status = 'approved',
  is_active = true,
  subscription_status = CASE 
    WHEN subscription_status = 'pending_approval' THEN 'active'
    ELSE subscription_status
  END,
  approved_at = NOW()
WHERE approval_status IS NULL 
   OR approval_status = ''
   OR approval_status = 'pending';

-- Step 4: Add index for faster queries on approval dashboard
CREATE INDEX IF NOT EXISTS idx_restaurants_approval_status 
  ON restaurants(approval_status) 
  WHERE approval_status IN ('pending', 'rejected');

-- Verification: Check results
SELECT 
  approval_status, 
  COUNT(*) as count 
FROM restaurants 
GROUP BY approval_status;
