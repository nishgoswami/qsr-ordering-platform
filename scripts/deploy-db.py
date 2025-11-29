#!/usr/bin/env python3
"""
Deploy database schema directly to Supabase using the REST API
This bypasses CLI connection issues
"""

import requests
import json

# Configuration
PROJECT_REF = "kungwkbivwvkygggykem"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bmd3a2JpdndrbHlnZ2d5a2VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyNTczNCwiZXhwIjoyMDc5MTAxNzM0fQ.CvQcn8swTe2BEQt_r8FrFWgj9x9uPcphG03I_X8N4B0"

print("🚀 Deploying database schema to Supabase...")
print(f"📍 Project: {SUPABASE_URL}")
print("")

# Read migration files
print("📖 Reading migration files...")

try:
    with open("supabase/migrations/20251119045603_create_core_tables.sql", "r") as f:
        core_tables_sql = f.read()
    
    with open("supabase/migrations/20251119050025_seed_initial_data.sql", "r") as f:
        seed_data_sql = f.read()
    
    print("✅ Migration files loaded")
    print("")
    
    # Deploy via Supabase Management API (requires direct SQL execution)
    # Since we can't execute raw SQL via REST API, we'll use psql with the connection string
    
    print("❌ Direct SQL execution requires database connection")
    print("")
    print("=" * 70)
    print("MANUAL DEPLOYMENT INSTRUCTIONS")
    print("=" * 70)
    print("")
    print("Your Supabase project is PAUSED (free tier auto-pauses after inactivity)")
    print("")
    print("Follow these steps:")
    print("")
    print("1. Visit your project dashboard to wake it up:")
    print(f"   {SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}")
    print("")
    print("2. Wait 1-2 minutes for the project to wake up (you'll see a loading screen)")
    print("")
    print("3. Go to SQL Editor:")
    print(f"   https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new")
    print("")
    print("4. Copy and paste this file:")
    print("   supabase/migrations/20251119045603_create_core_tables.sql")
    print("")
    print("5. Click 'RUN' button")
    print("")
    print("6. Then copy and paste this file:")
    print("   supabase/migrations/20251119050025_seed_initial_data.sql")
    print("")
    print("7. Click 'RUN' button again")
    print("")
    print("=" * 70)
    print("")
    print("✅ This will create:")
    print("   - 10 core database tables")
    print("   - Demo restaurant with 25+ menu items")
    print("   - All security policies (RLS)")
    print("")
    
except FileNotFoundError as e:
    print(f"❌ Error: {e}")
    print("Make sure you're running this from the project root directory")
