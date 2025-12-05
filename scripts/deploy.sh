#!/bin/bash

# Deployment script for consistent URLs
# Usage: ./scripts/deploy.sh [app-name] [environment]
# Example: ./scripts/deploy.sh admin-web production

set -e

APP_NAME=$1
ENVIRONMENT=${2:-production}

if [ -z "$APP_NAME" ]; then
  echo "❌ Error: App name required"
  echo "Usage: ./scripts/deploy.sh [app-name] [environment]"
  echo ""
  echo "Available apps:"
  echo "  - admin-web"
  echo "  - restaurant-website"
  echo "  - customer-web"
  echo "  - kitchen-tablet"
  exit 1
fi

APP_DIR="apps/$APP_NAME"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: App directory not found: $APP_DIR"
  exit 1
fi

echo "🚀 Deploying $APP_NAME to $ENVIRONMENT..."
echo ""

cd "$APP_DIR"

# Build the app first
echo "📦 Building $APP_NAME..."
npm run build

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🌍 Deploying to PRODUCTION..."
  vercel --prod --yes
elif [ "$ENVIRONMENT" = "preview" ]; then
  echo "👀 Deploying to PREVIEW..."
  vercel --yes
else
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Use: production or preview"
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your app URLs:"
echo "   Main: https://$APP_NAME.vercel.app"
echo "   Project: https://$APP_NAME-nishgoswamis-projects.vercel.app"
