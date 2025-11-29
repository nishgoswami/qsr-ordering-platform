#!/bin/bash

# Database deployment script using psql directly
# This bypasses the Supabase CLI pooler connection issues

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"

PROJECT_REF="kungwkbivwvkygggykem"
DB_HOST="aws-1-ca-central-1.connect.psdb.cloud"
DB_USER="postgres.${PROJECT_REF}"
DB_NAME="postgres"
DB_PORT="5432"

echo "🚀 Deploying database schema via direct psql connection..."
echo ""
echo "📍 Project: ${PROJECT_REF}"
echo "🔗 Host: ${DB_HOST}"
echo ""

# Prompt for password
echo "⚠️  You'll need your database password from:"
echo "   https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
echo ""
read -s -p "Enter database password: " DB_PASSWORD
echo ""
echo ""

# Test connection first
echo "🔍 Testing connection..."
PGPASSWORD="${DB_PASSWORD}" psql \
  "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require" \
  -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Connection successful!"
    echo ""
    
    # Deploy core tables migration
    echo "📤 Deploying core tables schema..."
    PGPASSWORD="${DB_PASSWORD}" psql \
      "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require" \
      -f "supabase/migrations/20251119045603_create_core_tables.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Core tables created!"
        echo ""
        
        # Deploy seed data
        echo "📤 Deploying seed data..."
        PGPASSWORD="${DB_PASSWORD}" psql \
          "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require" \
          -f "supabase/migrations/20251119050025_seed_initial_data.sql"
        
        if [ $? -eq 0 ]; then
            echo "✅ Seed data loaded!"
            echo ""
            echo "🎉 Database deployment complete!"
            echo ""
            echo "✅ Created:"
            echo "   - 10 core tables with RLS policies"
            echo "   - Demo restaurant with 25+ menu items"
            echo "   - Sample modifiers and delivery zones"
            echo ""
        else
            echo "❌ Failed to load seed data"
            exit 1
        fi
    else
        echo "❌ Failed to create core tables"
        exit 1
    fi
else
    echo "❌ Connection failed. Please check:"
    echo "   1. Database password is correct"
    echo "   2. Project is not paused (visit dashboard to wake it up)"
    echo "   3. Your IP is not blocked"
    exit 1
fi
