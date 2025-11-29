-- =============================================================================
-- MANUAL DEPLOYMENT SCRIPT FOR SUPABASE DASHBOARD
-- =============================================================================
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/kungwkbivwvkygggykem/sql/new
-- 2. Copy this ENTIRE file
-- 3. Paste it into the SQL Editor
-- 4. Click "Run" button
-- 5. Wait for completion (should take ~10 seconds)
-- =============================================================================

-- Enable PostGIS first
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE modifier_type AS ENUM ('size', 'addon', 'removal', 'choice');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_type AS ENUM ('pickup', 'delivery');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE fulfillment_type AS ENUM ('asap', 'scheduled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_method AS ENUM ('restaurant', 'customer_arranged');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'preparing', 'ready', 
    'out_for_delivery', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE printer_type AS ENUM ('network', 'usb', 'bluetooth');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE printer_purpose AS ENUM ('kitchen', 'customer', 'both');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE zone_type AS ENUM ('radius', 'polygon');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Rest of the schema will be added in next message...
-- This is just Part 1 to test the connection
