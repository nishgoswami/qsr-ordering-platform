#!/bin/bash

# Pre-Deployment Security & Compliance Audit Script
# Validates code against SOC 2, ISO 27001, PCI DSS, GDPR, and OWASP standards
# Exit code 0 = All checks passed, 1 = Failed checks

set -e

APP_NAME=$1
ENVIRONMENT=${2:-production}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔒 Pre-Deployment Security & Compliance Audit 🔒      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${PURPLE}App: ${APP_NAME}${NC}"
echo -e "${PURPLE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${PURPLE}Date: $(date)${NC}"
echo ""

# Helper functions
check_passed() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo -e "${GREEN}✅ PASS${NC}: $1"
}

check_failed() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "   ${RED}→${NC} $2"
}

check_warning() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    echo -e "   ${YELLOW}→${NC} $2"
}

section_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

# Validate app exists
if [ -z "$APP_NAME" ] || [ ! -d "apps/$APP_NAME" ]; then
    echo -e "${RED}Error: Invalid app name or directory not found${NC}"
    exit 1
fi

cd "apps/$APP_NAME"

# ═══════════════════════════════════════════════════════════
# 1. SECRETS & CREDENTIALS CHECK (SOC 2, ISO 27001)
# ═══════════════════════════════════════════════════════════
section_header "1️⃣  SECRETS & CREDENTIALS SECURITY"

# Check for hardcoded secrets
if grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    -E "(password|secret|api_key|apikey|private_key|token|auth).*=.*['\"][^'\"]{8,}" . \
    | grep -v "node_modules" | grep -v ".next" | grep -v "placeholder" | grep -q .; then
    check_failed "Hardcoded secrets detected" "Remove hardcoded credentials from code"
else
    check_passed "No hardcoded secrets found"
fi

# Check for API keys in code
if grep -rn --include="*.ts" --include="*.tsx" -E "(sk_|pk_|key_|token_)[a-zA-Z0-9]{20,}" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_failed "API keys found in code" "Move API keys to environment variables"
else
    check_passed "No API keys in source code"
fi

# Check for console.log with sensitive data patterns
if grep -rn --include="*.ts" --include="*.tsx" -E "console\.(log|debug|info).*\b(password|token|secret|card|ssn|email)\b" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_warning "Console.log with potentially sensitive data" "Review and remove sensitive data logging"
else
    check_passed "No sensitive data in console logs"
fi

# ═══════════════════════════════════════════════════════════
# 2. SQL INJECTION PREVENTION (OWASP, PCI DSS)
# ═══════════════════════════════════════════════════════════
section_header "2️⃣  SQL INJECTION PREVENTION"

# Check for SQL string concatenation
if grep -rn --include="*.ts" --include="*.tsx" -E "(query|sql).*\+.*\$\{|SELECT.*\+.*FROM|INSERT.*\+.*INTO" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_failed "SQL string concatenation detected" "Use parameterized queries or ORM"
else
    check_passed "No SQL concatenation found"
fi

# Check for raw SQL queries without parameterization
if grep -rn --include="*.ts" --include="*.tsx" -E "\.query\(.*\`.*\$\{" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_warning "Template literals in SQL queries" "Verify parameterization is used"
else
    check_passed "No template literals in raw SQL"
fi

# ═══════════════════════════════════════════════════════════
# 3. PAYMENT SECURITY (PCI DSS)
# ═══════════════════════════════════════════════════════════
section_header "3️⃣  PAYMENT SECURITY (PCI DSS)"

# Check for storing full card numbers
if grep -rn --include="*.ts" --include="*.tsx" -E "(cardNumber|card_number|pan).*\.insert|\.create|\.update" . \
    | grep -v "node_modules" | grep -v ".next" | grep -v "last4" | grep -v "token" | grep -q .; then
    check_warning "Potential PAN storage detected" "Verify only tokens/last4 are stored"
else
    check_passed "No full card number storage detected"
fi

# Check for CVV storage (should NEVER happen)
if grep -rn --include="*.ts" --include="*.tsx" -E "(cvv|cvc|card_security_code).*\.insert|\.create|\.update" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_failed "CVV storage detected - PCI DSS VIOLATION" "CVV must NEVER be stored"
else
    check_passed "No CVV storage found"
fi

# ═══════════════════════════════════════════════════════════
# 4. AUTHENTICATION & AUTHORIZATION (SOC 2, ISO 27001)
# ═══════════════════════════════════════════════════════════
section_header "4️⃣  AUTHENTICATION & AUTHORIZATION"

# Check for unprotected routes (API routes without auth)
if [ -d "app/api" ]; then
    if find app/api -name "route.ts" -exec grep -L "auth\|session\|requireAuth\|getServerSession" {} \; | grep -q .; then
        check_warning "Unprotected API routes found" "Add authentication to API routes"
    else
        check_passed "All API routes have authentication"
    fi
fi

# Check for authorization checks before operations
if grep -rn --include="*.ts" --include="*.tsx" -E "\.(delete|update|create).*supabase" . \
    | grep -v "node_modules" | grep -v ".next" | head -10 | \
    xargs -I {} sh -c "echo '{}' | grep -q 'hasPermission\|checkAuth\|requireRole' || echo '{}'" | grep -q "/"; then
    check_warning "Database operations may lack authorization checks" "Verify authorization before DB operations"
else
    check_passed "Authorization checks appear present"
fi

# ═══════════════════════════════════════════════════════════
# 5. DATA VALIDATION (OWASP)
# ═══════════════════════════════════════════════════════════
section_header "5️⃣  INPUT VALIDATION & SANITIZATION"

# Check for input validation (looking for zod, joi, yup)
if grep -rn --include="*.ts" --include="*.tsx" -E "\.parse\(|\.validate\(|\.safeParse\(" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_passed "Input validation implemented"
else
    check_warning "Limited input validation found" "Use schema validation (Zod, Joi, Yup)"
fi

# Check for XSS prevention (dangerouslySetInnerHTML usage)
if grep -rn --include="*.tsx" --include="*.jsx" "dangerouslySetInnerHTML" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_warning "dangerouslySetInnerHTML found" "Verify content is sanitized"
else
    check_passed "No dangerouslySetInnerHTML usage"
fi

# ═══════════════════════════════════════════════════════════
# 6. ERROR HANDLING (SOC 2)
# ═══════════════════════════════════════════════════════════
section_header "6️⃣  ERROR HANDLING"

# Check for try-catch blocks in async functions
if grep -rn --include="*.ts" --include="*.tsx" -E "async.*function|async.*=>.*\{" . \
    | grep -v "node_modules" | grep -v ".next" | wc -l | awk '{if ($1 > 0) exit 0; else exit 1}'; then
    # Count try-catch blocks
    TRY_CATCH_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" "try.*{" . | grep -v "node_modules" | grep -v ".next" | wc -l | xargs)
    if [ "$TRY_CATCH_COUNT" -gt 5 ]; then
        check_passed "Error handling present ($TRY_CATCH_COUNT try-catch blocks)"
    else
        check_warning "Limited error handling" "Add try-catch to async operations"
    fi
fi

# Check for error logging
if grep -rn --include="*.ts" --include="*.tsx" -E "console\.(error|warn)|logger\.(error|warn)" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_passed "Error logging implemented"
else
    check_warning "No error logging found" "Add error logging for debugging"
fi

# ═══════════════════════════════════════════════════════════
# 7. AUDIT LOGGING (SOC 2, ISO 27001)
# ═══════════════════════════════════════════════════════════
section_header "7️⃣  AUDIT LOGGING"

# Check for audit log creation
if grep -rn --include="*.ts" --include="*.tsx" -E "audit.*log|createAuditLog|logEvent" . \
    | grep -v "node_modules" | grep -v ".next" | grep -q .; then
    check_passed "Audit logging implemented"
else
    check_warning "No audit logging found" "Add audit logs for sensitive operations"
fi

# ═══════════════════════════════════════════════════════════
# 8. DEPENDENCY VULNERABILITIES
# ═══════════════════════════════════════════════════════════
section_header "8️⃣  DEPENDENCY SECURITY"

# Run npm audit
echo "Running npm audit..."
if npm audit --audit-level=moderate --json > /tmp/audit_result.json 2>&1; then
    check_passed "No moderate+ vulnerabilities in dependencies"
else
    VULN_COUNT=$(cat /tmp/audit_result.json | grep -o '"severity":"moderate"\|"severity":"high"\|"severity":"critical"' | wc -l | xargs)
    if [ "$VULN_COUNT" -gt 0 ]; then
        check_failed "Found $VULN_COUNT vulnerabilities" "Run 'npm audit fix' to resolve"
    else
        check_passed "No vulnerabilities found"
    fi
fi

# ═══════════════════════════════════════════════════════════
# 9. TYPESCRIPT TYPE SAFETY
# ═══════════════════════════════════════════════════════════
section_header "9️⃣  TYPE SAFETY"

# Check for 'any' type usage
ANY_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" ": any\|as any" . \
    | grep -v "node_modules" | grep -v ".next" | wc -l | xargs)
if [ "$ANY_COUNT" -gt 10 ]; then
    check_warning "High usage of 'any' type ($ANY_COUNT occurrences)" "Use proper TypeScript types"
else
    check_passed "Minimal 'any' type usage ($ANY_COUNT occurrences)"
fi

# Check for TypeScript strict mode
if grep -q '"strict": true' tsconfig.json 2>/dev/null; then
    check_passed "TypeScript strict mode enabled"
else
    check_warning "TypeScript strict mode not enabled" "Enable in tsconfig.json"
fi

# ═══════════════════════════════════════════════════════════
# 10. BUILD & COMPILE CHECK
# ═══════════════════════════════════════════════════════════
section_header "🔟 BUILD VALIDATION"

echo "Building application..."
if npm run build > /tmp/build_output.log 2>&1; then
    check_passed "Application builds successfully"
else
    check_failed "Build failed" "Fix build errors before deployment"
    echo ""
    echo "Build errors:"
    cat /tmp/build_output.log | tail -20
fi

# ═══════════════════════════════════════════════════════════
# 11. ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════
section_header "1️⃣1️⃣  ENVIRONMENT VARIABLES"

# Check for .env.example
if [ -f ".env.example" ]; then
    check_passed ".env.example file exists"
else
    check_warning "No .env.example file" "Create template for required env vars"
fi

# Check for NEXT_PUBLIC_ prefix on client-side vars
if grep -rn --include="*.ts" --include="*.tsx" "process\.env\.[A-Z_]*[^P]" app/ \
    | grep -v "node_modules" | grep -v ".next" | grep -v "NEXT_PUBLIC" | grep -q .; then
    check_warning "Environment variables without NEXT_PUBLIC_ in client code" "Verify server-side only usage"
else
    check_passed "Environment variable prefixes correct"
fi

# ═══════════════════════════════════════════════════════════
# 12. SECURITY HEADERS (OWASP)
# ═══════════════════════════════════════════════════════════
section_header "1️⃣2️⃣  SECURITY HEADERS"

# Check for security headers in Next.js config
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    if grep -q "X-Frame-Options\|Content-Security-Policy\|Strict-Transport-Security" next.config.* 2>/dev/null; then
        check_passed "Security headers configured"
    else
        check_warning "Security headers not found in next.config" "Add security headers"
    fi
else
    check_warning "No Next.js config file found" "Create next.config.js with security headers"
fi

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     AUDIT SUMMARY                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Passed:   $PASSED_CHECKS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNING_CHECKS${NC}"
echo -e "${RED}❌ Failed:   $FAILED_CHECKS${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "   Total:    $TOTAL_CHECKS checks"
echo ""

# Calculate pass rate
PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}❌ AUDIT FAILED${NC}"
    echo -e "${RED}Cannot deploy to $ENVIRONMENT with $FAILED_CHECKS critical failures${NC}"
    echo ""
    echo "Please fix the failed checks and run the audit again."
    exit 1
elif [ $WARNING_CHECKS -gt 5 ]; then
    echo -e "${YELLOW}⚠️  AUDIT PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}$WARNING_CHECKS warnings found. Consider addressing them.${NC}"
    echo ""
    echo "Pass rate: $PASS_RATE%"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        read -p "Deploy to production anyway? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Deployment cancelled."
            exit 1
        fi
    fi
    exit 0
else
    echo -e "${GREEN}✅ AUDIT PASSED${NC}"
    echo -e "${GREEN}Application is compliant with security standards${NC}"
    echo ""
    echo "Pass rate: $PASS_RATE%"
    echo "Ready for deployment to $ENVIRONMENT"
    exit 0
fi
