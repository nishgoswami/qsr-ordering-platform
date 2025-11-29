#!/bin/bash

# Deploy database schema via Supabase Management API
# This bypasses the connection pooler issues

PROJECT_REF="kungwkbivwvkygggykem"
SUPABASE_URL="https://kungwkbivwvkygggykem.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bmd3a2JpdndrbHlnZ2d5a2VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyNTczNCwiZXhwIjoyMDc5MTAxNzM0fQ.CvQcn8swTe2BEQt_r8FrFWgj9x9uPcphG03I_X8N4B0"

echo "🚀 Deploying database schema to Supabase..."
echo ""

# Read the migration file
MIGRATION_SQL=$(cat "supabase/migrations/20251119045603_create_core_tables.sql")

# Execute via Supabase REST API
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}"

echo ""
echo "✅ Database deployment initiated!"
