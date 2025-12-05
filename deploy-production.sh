#!/bin/bash

# Production Deployment Script
# This script does a clean deployment with no demo data and creates an admin user

set -e # Exit on any error

echo "🚀 Starting Production Deployment..."
echo "=================================="

# Configuration
ENVIRONMENT=${1:-production} # production or preview
PROJECT_ROOT="/Users/nishgoswami/Documents/Python Projects/ISO Apps"
APP_PATH="$PROJECT_ROOT/apps/admin-web"

echo "📋 Environment: $ENVIRONMENT"
echo ""

# Step 1: Clean Supabase Database
echo "🧹 Step 1: Cleaning Supabase Database..."
echo "Please run this SQL in Supabase manually (or press Enter if already done):"
echo ""
echo "-- Clean ALL existing data"
echo "TRUNCATE TABLE locations, staff, restaurants CASCADE;"
echo "DELETE FROM auth.users;"
echo ""
read -p "Press Enter after running the SQL in Supabase..."

# Step 2: Reset RLS Policies
echo ""
echo "🔒 Step 2: Setting up RLS Policies..."
echo "Please run this SQL in Supabase manually:"
echo ""
cat << 'EOF'
-- Disable RLS for signup tables
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- Ensure foreign key is deferrable
ALTER TABLE staff 
DROP CONSTRAINT IF EXISTS staff_user_id_fkey;

ALTER TABLE staff 
ADD CONSTRAINT staff_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
DEFERRABLE INITIALLY DEFERRED;
EOF
echo ""
read -p "Press Enter after running the SQL in Supabase..."

# Step 3: Build and Deploy
echo ""
echo "🔨 Step 3: Building application..."
cd "$APP_PATH"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

echo ""
echo "📦 Step 4: Deploying to Vercel..."
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod --yes
else
    vercel --yes
fi

DEPLOYMENT_URL=$(vercel ls --scope nishgoswamis-projects | grep admin | head -1 | awk '{print $2}')
echo ""
echo "✅ Deployed to: https://$DEPLOYMENT_URL"

# Step 4: Create Admin User
echo ""
echo "👤 Step 5: Creating Admin User..."
echo ""
read -p "Enter admin email: " ADMIN_EMAIL
read -s -p "Enter admin password (min 8 chars): " ADMIN_PASSWORD
echo ""
read -p "Enter restaurant name: " RESTAURANT_NAME
read -p "Enter owner first name: " OWNER_FIRST
read -p "Enter owner last name: " OWNER_LAST
read -p "Enter phone: " PHONE

echo ""
echo "Creating admin user via signup page..."
echo "Please visit: https://$DEPLOYMENT_URL/signup"
echo ""
echo "Fill in the form with:"
echo "  Email: $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASSWORD"
echo "  Restaurant: $RESTAURANT_NAME"
echo "  Name: $OWNER_FIRST $OWNER_LAST"
echo "  Phone: $PHONE"
echo ""
read -p "Press Enter after signing up..."

# Step 5: Auto-approve the admin user
echo ""
echo "✅ Step 6: Auto-approving admin user..."
echo "Please run this SQL in Supabase (replace with your email):"
echo ""
cat << EOF
UPDATE restaurants 
SET approval_status = 'approved',
    is_active = true,
    subscription_status = 'active',
    approved_at = NOW()
WHERE email = '$ADMIN_EMAIL';
EOF
echo ""
read -p "Press Enter after running the SQL..."

# Step 6: Test Login
echo ""
echo "🧪 Step 7: Testing login..."
echo "Please visit: https://$DEPLOYMENT_URL/login"
echo "Login with:"
echo "  Email: $ADMIN_EMAIL"
echo "  Password: [your password]"
echo ""
read -p "Press Enter after successful login..."

# Summary
echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "📝 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  URL: https://$DEPLOYMENT_URL"
echo "  Admin Email: $ADMIN_EMAIL"
echo "  Database: Clean (no demo data)"
echo ""
echo "🎉 Your production environment is ready!"
