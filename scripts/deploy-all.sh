#!/bin/bash

# Deploy all apps to production
# Usage: ./scripts/deploy-all.sh

set -e

echo "🚀 Deploying all applications..."
echo ""

APPS=("admin-web" "restaurant-website" "customer-web" "kitchen-tablet")

for APP in "${APPS[@]}"; do
  echo "=========================================="
  echo "Deploying: $APP"
  echo "=========================================="
  ./scripts/deploy.sh "$APP" production
  echo ""
done

echo ""
echo "✅ All deployments complete!"
echo ""
echo "📍 Your URLs:"
echo "   Admin Portal:      https://admin-web.vercel.app"
echo "   Restaurant Site:   https://restaurant-website.vercel.app"
echo "   Customer App:      https://customer-web.vercel.app"
echo "   Kitchen Tablet:    https://kitchen-tablet.vercel.app"
