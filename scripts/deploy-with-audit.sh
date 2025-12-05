#!/bin/bash

# Deploy with Security Audit
# Runs pre-deployment audit before deploying to production

set -e

APP_NAME=$1
ENVIRONMENT=${2:-production}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🚀 Secure Deployment with Audit 🚀               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate inputs
if [ -z "$APP_NAME" ]; then
    echo -e "${RED}❌ Error: App name required${NC}"
    echo "Usage: ./scripts/deploy-with-audit.sh <app-name> [production|preview]"
    echo ""
    echo "Available apps:"
    echo "  - admin-web"
    echo "  - restaurant-website"
    echo "  - customer-web"
    echo "  - kitchen-tablet"
    exit 1
fi

if [ ! -d "apps/$APP_NAME" ]; then
    echo -e "${RED}❌ Error: App directory 'apps/$APP_NAME' not found${NC}"
    exit 1
fi

# Step 1: Run security audit
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Running Security & Compliance Audit${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! ./scripts/pre-deployment-audit.sh "$APP_NAME" "$ENVIRONMENT"; then
    echo ""
    echo -e "${RED}❌ Audit failed. Deployment cancelled.${NC}"
    echo -e "${RED}Please fix the issues above and try again.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Security audit passed!${NC}"
echo ""

# Step 2: Git status check
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Git Status Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}⚠️  Warning: Uncommitted changes detected${NC}"
    echo ""
    git status --short
    echo ""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        read -p "Deploy with uncommitted changes? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Deployment cancelled."
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✅ Working directory clean${NC}"
fi

# Step 3: Build application
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Building Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "apps/$APP_NAME"
echo "📦 Building $APP_NAME..."

if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 4: Deploy to Vercel
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Deploying to Vercel${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌍 Deploying to PRODUCTION..."
    vercel --prod --yes
else
    echo "🔍 Deploying to PREVIEW..."
    vercel --yes
fi

DEPLOY_EXIT_CODE=$?

# Step 5: Post-deployment verification
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 5: Post-Deployment Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "📍 Your app URLs:"
    echo "   Main: https://$APP_NAME.vercel.app"
    echo "   Project: https://$APP_NAME-nishgoswamis-projects.vercel.app"
    echo ""
    echo "🔍 Next steps:"
    echo "   1. Verify app loads correctly"
    echo "   2. Test critical functionality"
    echo "   3. Monitor error logs for issues"
    echo "   4. Check performance metrics"
    echo ""
    echo -e "${GREEN}Deployment complete! 🎉${NC}"
    exit 0
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check Vercel logs for details"
    exit 1
fi
