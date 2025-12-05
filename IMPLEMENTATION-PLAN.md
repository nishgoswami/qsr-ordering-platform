# Security & Compliance Implementation Plan

## 🎯 Overview

This document explains how to use the security standards (SOC 2, ISO 27001, PCI DSS, GDPR, OWASP) in day-to-day development and the automated audit system that enforces compliance before deployment.

## 📋 Table of Contents

1. [Daily Development Usage](#daily-development-usage)
2. [Automated Audit System](#automated-audit-system)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [CI/CD Integration](#cicd-integration)
5. [Security Review Process](#security-review-process)
6. [Incident Response](#incident-response)

---

## 🔧 Daily Development Usage

### When Writing New Features

#### 1. **Before Writing Code**
```bash
# Read relevant security standards for your feature
# If dealing with payments:
cat SECURITY.md | grep -A 20 "PAYMENT SECURITY"

# If dealing with user data:
cat SECURITY.md | grep -A 20 "DATA PROTECTION"

# If creating API endpoints:
cat DEVELOPMENT-STANDARDS.md | grep -A 30 "AUTHENTICATION"
```

#### 2. **While Writing Code**

**✅ DO THIS:**
```typescript
// ✅ Input validation
import { z } from 'zod';

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().min(1).max(99)
  })),
  total: z.number().positive()
});

export async function createOrder(data: unknown) {
  // Validate input
  const validated = orderSchema.parse(data);
  
  // Check authentication
  const user = await requireAuth();
  
  // Check authorization
  if (!hasPermission(user, 'create_order')) {
    throw new ForbiddenError('Not authorized');
  }
  
  // Audit log
  await createAuditLog({
    action: 'order_created',
    userId: user.id,
    metadata: { orderId: validated.id }
  });
  
  // Perform operation with try-catch
  try {
    const order = await db.orders.create(validated);
    return order;
  } catch (error) {
    await logError('order_creation_failed', { error, userId: user.id });
    throw error;
  }
}
```

**❌ DON'T DO THIS:**
```typescript
// ❌ No validation, no auth check, no error handling
export async function createOrder(data: any) {
  return await db.orders.create(data);
}
```

#### 3. **After Writing Code**

Run the local audit before committing:
```bash
# Audit specific app
./scripts/pre-deployment-audit.sh admin-web production

# Check for secrets
git diff | grep -E "(password|secret|api_key|token)" 

# Verify no console.logs with sensitive data
grep -rn "console.log.*password\|token\|email" apps/
```

### Security Patterns to Follow

#### Authentication Pattern
```typescript
// app/api/orders/route.ts
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  // 1. Authenticate user
  const user = await requireAuth(request);
  
  // 2. Parse and validate input
  const body = await request.json();
  const validated = orderSchema.parse(body);
  
  // 3. Authorize action
  if (!canCreateOrder(user, validated.restaurantId)) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // 4. Perform operation
  const order = await createOrder(validated, user.id);
  
  // 5. Return response (don't leak internal data)
  return Response.json({
    id: order.id,
    status: order.status,
    total: order.total
    // Don't include: internal IDs, user emails, etc.
  });
}
```

#### Database Query Pattern
```typescript
// ✅ Good: Parameterized query with authorization
export async function getOrder(orderId: string, userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)  // Ensure user owns order
    .single();
    
  if (error) throw new DatabaseError(error.message);
  return data;
}

// ❌ Bad: SQL injection vulnerable
export async function getOrder(orderId: string) {
  const query = `SELECT * FROM orders WHERE id = '${orderId}'`;
  return await db.query(query);
}
```

#### Data Sanitization Pattern
```typescript
// ✅ Sanitize data before returning to client
export function sanitizeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: maskEmail(user.email),  // j***@example.com
    role: user.role,
    // Don't include: passwordHash, tokens, internalId, etc.
  };
}

// ✅ Mask sensitive data in logs
export function logOrderCreated(order: Order) {
  logger.info('Order created', {
    orderId: order.id,
    total: order.total,
    itemCount: order.items.length,
    // Don't log: customer email, phone, address, payment info
  });
}
```

---

## 🤖 Automated Audit System

### What It Checks

The audit system (`pre-deployment-audit.sh`) performs **12 categories of checks**:

| # | Category | Standards | What It Checks |
|---|----------|-----------|----------------|
| 1 | Secrets & Credentials | SOC 2, ISO 27001 | No hardcoded passwords, API keys in code |
| 2 | SQL Injection | OWASP, PCI DSS | No string concatenation in queries |
| 3 | Payment Security | PCI DSS | No CVV storage, only tokens stored |
| 4 | Authentication | SOC 2, ISO 27001 | API routes have auth checks |
| 5 | Input Validation | OWASP | Schema validation present |
| 6 | Error Handling | SOC 2 | Try-catch blocks, error logging |
| 7 | Audit Logging | SOC 2, ISO 27001 | Audit logs for sensitive operations |
| 8 | Dependencies | OWASP | No vulnerable dependencies |
| 9 | Type Safety | Best Practice | Minimal 'any' type usage |
| 10 | Build | All | Application builds successfully |
| 11 | Environment Vars | SOC 2 | Proper env var usage |
| 12 | Security Headers | OWASP | Security headers configured |

### How to Use the Audit Script

#### Run Audit Locally
```bash
# Audit single app before committing
./scripts/pre-deployment-audit.sh admin-web production

# Example output:
# ✅ PASS: No hardcoded secrets found
# ✅ PASS: No API keys in source code
# ⚠️  WARN: Console.log with potentially sensitive data
# ❌ FAIL: CVV storage detected - PCI DSS VIOLATION
#
# AUDIT SUMMARY:
# ✅ Passed:   18
# ⚠️  Warnings: 3
# ❌ Failed:   1
# ━━━━━━━━━━━━━━━━━━━━━━━
# ❌ AUDIT FAILED
```

#### Deploy with Audit
```bash
# This runs audit first, then deploys only if passed
./scripts/deploy-with-audit.sh admin-web production

# Steps:
# 1. Runs security audit
# 2. Checks git status
# 3. Builds application
# 4. Deploys to Vercel
# 5. Shows post-deployment summary
```

#### Audit All Apps
```bash
# Run audit on all 4 apps
for app in admin-web restaurant-website customer-web kitchen-tablet; do
  echo "Auditing $app..."
  ./scripts/pre-deployment-audit.sh $app production
done
```

### Interpreting Audit Results

#### ✅ PASS (Green)
- Check passed completely
- No action needed
- Safe to deploy

#### ⚠️ WARN (Yellow)
- Potential issue detected
- Review recommended but not blocking
- If >5 warnings on production, prompts confirmation

#### ❌ FAIL (Red)
- Critical security violation
- **Blocks deployment**
- Must fix before deploying

### Fixing Common Failures

#### Failed: Hardcoded Secrets
```bash
# ❌ Found this:
const API_KEY = "sk_live_abc123def456";

# ✅ Fix:
const API_KEY = process.env.STRIPE_API_KEY;
```

#### Failed: SQL Injection Risk
```typescript
// ❌ Found this:
const query = `SELECT * FROM orders WHERE id = '${orderId}'`;

// ✅ Fix:
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId);
```

#### Failed: CVV Storage
```typescript
// ❌ Found this:
await db.insert({ cardNumber, cvv, expiry });

// ✅ Fix:
// Use tokenization, never store CVV
const token = await stripe.tokens.create({ card });
await db.insert({ paymentToken: token.id, last4: card.number.slice(-4) });
```

#### Failed: Missing Authentication
```typescript
// ❌ Found this:
export async function DELETE(request: Request) {
  const { orderId } = await request.json();
  await db.orders.delete(orderId);
}

// ✅ Fix:
export async function DELETE(request: Request) {
  const user = await requireAuth(request);
  const { orderId } = await request.json();
  
  // Check ownership
  const order = await db.orders.findById(orderId);
  if (order.userId !== user.id && !isAdmin(user)) {
    return new Response('Forbidden', { status: 403 });
  }
  
  await db.orders.delete(orderId);
}
```

---

## ✅ Pre-Deployment Checklist

Before **every** deployment, verify:

### Code Quality
- [ ] All TypeScript errors resolved (`npm run build` passes)
- [ ] No `console.log` with sensitive data
- [ ] No hardcoded secrets or API keys
- [ ] Proper error handling (try-catch blocks)

### Security
- [ ] Input validation on all user inputs
- [ ] Authentication required on protected routes
- [ ] Authorization checks before DB operations
- [ ] SQL queries use parameterization (no concatenation)
- [ ] Passwords hashed with bcrypt
- [ ] Payment data tokenized (no raw cards)

### Privacy & Compliance
- [ ] Audit logs for sensitive operations
- [ ] Personal data encrypted (in transit + at rest)
- [ ] User consent recorded for data collection
- [ ] Data retention policies followed

### Testing
- [ ] Manual testing of new features
- [ ] Critical user flows tested
- [ ] Error scenarios tested
- [ ] Mobile responsive check

### Documentation
- [ ] Code comments for complex logic
- [ ] API changes documented
- [ ] Database schema changes recorded
- [ ] Environment variables documented in `.env.example`

### Run Automated Checks
```bash
# Run the audit
./scripts/pre-deployment-audit.sh <app-name> production

# If passed, deploy with:
./scripts/deploy-with-audit.sh <app-name> production
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

A GitHub Actions workflow (`.github/workflows/security-audit.yml`) automatically:

1. **On Every Pull Request**:
   - Runs security audit on all apps
   - Checks for dependency vulnerabilities
   - Scans for secrets with TruffleHog
   - Performs CodeQL analysis
   - Blocks merge if critical failures

2. **On Push to Main**:
   - Runs full security audit
   - Updates security reports
   - Sends alerts if issues found

3. **Weekly Schedule** (Every Monday 9 AM):
   - Comprehensive security scan
   - Dependency vulnerability check
   - Compliance verification

### How It Works

```yaml
# Pull request must pass security audit
on:
  pull_request:
    branches: [main]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Run Security Audit
        run: ./scripts/pre-deployment-audit.sh admin-web production
      
      # If audit fails, PR cannot be merged
      continue-on-error: false
```

### Setting Up CI/CD

1. **Enable GitHub Actions**:
   - Workflow file already created at `.github/workflows/security-audit.yml`
   - Push to GitHub to activate

2. **Configure Branch Protection**:
   ```
   Settings → Branches → Branch protection rules
   
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   ✅ Security Audit - admin-web
   ✅ Security Audit - restaurant-website
   ✅ Security Audit - customer-web
   ✅ Security Audit - kitchen-tablet
   ```

3. **Set Up Secrets** (if using private tools):
   ```
   Settings → Secrets and variables → Actions
   
   Add:
   - SECURITY_SCAN_TOKEN (for secret scanning)
   - SLACK_WEBHOOK (for alerts)
   ```

### Viewing Audit Results

**In GitHub UI:**
1. Go to Pull Request
2. Click "Checks" tab
3. View "Security Audit" results
4. Download artifacts for detailed reports

**Via Command Line:**
```bash
# Download latest audit results
gh run download --name security-audit-admin-web

# View results
cat audit_result.json | jq '.vulnerabilities'
```

---

## 🔍 Security Review Process

### Code Review Checklist

When reviewing PRs, verify:

#### 1. Security Basics
- [ ] No secrets in code
- [ ] Input validation present
- [ ] Authentication checks present
- [ ] Error handling implemented

#### 2. Database Operations
- [ ] Parameterized queries (no SQL concatenation)
- [ ] Authorization checks before operations
- [ ] Proper error handling
- [ ] Audit logging for sensitive operations

#### 3. API Endpoints
- [ ] Authentication required
- [ ] Input validation
- [ ] Rate limiting considered
- [ ] Proper HTTP status codes
- [ ] No sensitive data in responses

#### 4. Frontend Code
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Environment variables use `NEXT_PUBLIC_` prefix
- [ ] No client-side secrets
- [ ] Proper error messages (don't leak info)

#### 5. Payment Processing
- [ ] Uses tokenization (Stripe, etc.)
- [ ] Never stores full card numbers
- [ ] Never stores CVV
- [ ] Encrypted transmission (HTTPS)

### Security Review Approval

**For Production Deployments:**
- Requires 1 security review approval
- Security reviewer uses this checklist
- All audit checks must pass
- No critical vulnerabilities

**Assign Security Reviewers:**
```bash
# In .github/CODEOWNERS
/apps/*/app/api/*  @security-team
/apps/*/lib/database.ts  @security-team
```

---

## 🚨 Incident Response

### If Audit Finds Critical Issue

1. **Stop Deployment**:
   ```bash
   # Audit will automatically block deployment
   ❌ AUDIT FAILED
   Cannot deploy to production with 1 critical failure
   ```

2. **Review Failure**:
   ```bash
   # Read the specific failure
   ❌ FAIL: CVV storage detected - PCI DSS VIOLATION
   → CVV must NEVER be stored
   ```

3. **Fix Issue**:
   ```bash
   # Make code changes
   vim apps/admin-web/app/api/payment/route.ts
   
   # Re-run audit
   ./scripts/pre-deployment-audit.sh admin-web production
   ```

4. **Verify Fix**:
   ```bash
   # Should now pass
   ✅ PASS: No CVV storage found
   ✅ AUDIT PASSED
   Ready for deployment to production
   ```

### If Security Incident Occurs

Follow the incident response procedure from `SECURITY.md`:

1. **Detect**: Alert or manual report
2. **Contain**: Block threat immediately
3. **Investigate**: Determine scope
4. **Eradicate**: Remove threat, patch vulnerability
5. **Recover**: Restore services
6. **Document**: Lessons learned, update procedures

**Contact:**
- Security Team: security@yourcompany.com
- Emergency: [Security contact number]

---

## 📊 Metrics & Monitoring

### Track These Metrics

```typescript
// Track security metrics
const SECURITY_METRICS = {
  // Audit metrics
  auditPassRate: '% of audits passed',
  criticalFailures: 'Count of critical failures',
  averageWarnings: 'Average warnings per audit',
  
  // Runtime metrics  
  failedLogins: 'Failed login attempts per hour',
  authorizationDenials: 'Authorization failures per day',
  apiErrors: '4xx/5xx error rate',
  
  // Compliance metrics
  auditLogCompleteness: '100% target',
  encryptionCoverage: '100% sensitive data',
  vulnerabilityPatchTime: '< 7 days for critical',
};
```

### Dashboard Setup

**Recommended Tools:**
- **Sentry**: Error tracking and performance
- **Datadog**: Infrastructure and application monitoring
- **GitHub Security**: Dependency alerts and secret scanning
- **Vercel Analytics**: Performance and usage metrics

---

## 🎓 Training & Best Practices

### New Developer Onboarding

Day 1:
- Read `SECURITY.md` (30 min)
- Read `DEVELOPMENT-STANDARDS.md` (30 min)
- Complete OWASP Top 10 training (1 hour)

Week 1:
- Shadow security review (2 hours)
- Practice running audit script
- Review example PRs with security feedback

Month 1:
- Conduct first security review
- Complete all training modules
- Understand incident response procedure

### Ongoing Training

- **Monthly**: Security updates and new threat briefings
- **Quarterly**: Review OWASP Top 10 updates
- **Annually**: Compliance training refresh (GDPR, PCI DSS)

### Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [PCI DSS Quick Reference](https://www.pcisecuritystandards.org/)
- [GDPR Developer Guide](https://gdpr.eu/developers/)

---

## 🔄 Continuous Improvement

### Weekly Reviews
- Review security logs
- Check failed audit trends
- Update patterns as needed

### Monthly Reviews
- Update security standards
- Review new OWASP guidance
- Conduct security drills

### Quarterly Reviews
- Full security audit
- Penetration testing
- Update documentation
- Team training

---

## 📞 Support

**Questions about security standards?**
- Email: security@yourcompany.com
- Slack: #security-help
- Documentation: `SECURITY.md`, `DEVELOPMENT-STANDARDS.md`

**Report security issues:**
- Email: security@yourcompany.com
- Emergency: [Security hotline]
- Bug Bounty: bugbounty@yourcompany.com

---

**Version**: 1.0  
**Last Updated**: December 1, 2025  
**Review Schedule**: Quarterly  
**Next Review**: March 1, 2026
