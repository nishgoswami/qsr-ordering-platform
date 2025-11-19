#!/bin/bash

# Supabase Quick Start Script
# Run this after creating your Supabase project

set -e

echo "🚀 Supabase Quick Start"
echo "======================"
echo ""

# Check if project is linked
if ! supabase status &>/dev/null; then
    echo "❌ Supabase project not linked!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Create a project at https://supabase.com/dashboard"
    echo "2. Copy your project reference ID (Settings → General)"
    echo "3. Run: supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    exit 1
fi

echo "✅ Supabase project linked"
echo ""

# Push migrations
echo "📤 Pushing database migrations..."
supabase db push

echo ""
echo "✅ Database schema created successfully!"
echo ""

# Generate TypeScript types
echo "📝 Generating TypeScript types..."
mkdir -p packages/types
supabase gen types typescript --linked > packages/types/supabase.ts

echo ""
echo "✅ TypeScript types generated!"
echo ""

# Instructions for environment variables
echo "⚙️  Next Steps:"
echo "=============="
echo ""
echo "1. Copy environment variables to each app:"
echo "   cp .env.local.example apps/customer-web/.env.local"
echo "   cp .env.local.example apps/kitchen-tablet/.env.local"
echo "   cp .env.local.example apps/admin-web/.env.local"
echo ""
echo "2. Update .env.local files with your Supabase credentials:"
echo "   - Get from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "3. Restart your development servers:"
echo "   npm run dev:all"
echo ""
echo "4. Create a test admin user in Supabase Dashboard:"
echo "   - Go to Authentication → Users"
echo "   - Click 'Add user'"
echo "   - Email: admin@demo.com"
echo "   - Password: (your choice)"
echo "   - Then add a row in 'users' table with role='admin'"
echo ""
echo "✅ Setup complete! Happy coding! 🎉"
