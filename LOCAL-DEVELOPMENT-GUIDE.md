# 🚀 Local Development Guide

**Last Updated**: December 5, 2025  
**Status**: ✅ Complete Setup

---

## 📋 Table of Contents
1. [Available Local Servers](#available-local-servers)
2. [Starting Development](#starting-development)
3. [Available NPM Scripts](#available-npm-scripts)
4. [Pre-Commit Hooks](#pre-commit-hooks)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ Available Local Servers

### Applications (4 Next.js Apps)

| App | Port | Command | Purpose |
|-----|------|---------|---------|
| **Restaurant Website** | 3000 | `npm run dev:website` | Public-facing restaurant site |
| **Customer Web** | 3001 | `npm run dev:customer` | Customer ordering interface |
| **Kitchen Tablet** | 3003 | `npm run dev:kitchen` | Kitchen display system |
| **Admin Web** | 3002 | `npm run dev:admin` | Restaurant admin dashboard |

### Tools

| Tool | Port | Command | Purpose |
|------|------|---------|---------|
| **Project Tracker** | 3004 | `npm run dev:tracker` | Development progress tracking |

### Database

| Service | Port | Command | Purpose |
|---------|------|---------|---------|
| **Supabase Local** | 54321 | `npm run supabase:start` | Local PostgreSQL + Auth + Storage |
| **Supabase Studio** | 54323 | (auto-starts with supabase) | Database GUI |

---

## 🚀 Starting Development

### Quick Start (Recommended)

```bash
# Start all apps simultaneously
npm run dev:all

# This runs:
# - Restaurant Website (localhost:3000)
# - Customer Web (localhost:3001)  
# - Admin Web (localhost:3002)
# - Kitchen Tablet (localhost:3003)
# - Project Tracker (localhost:3004)
```

### Individual App Development

```bash
# Work on admin dashboard only
npm run dev:admin
# → http://localhost:3002

# Work on customer ordering
npm run dev:customer
# → http://localhost:3001

# Work on restaurant website
npm run dev:website
# → http://localhost:3000

# Work on kitchen display
npm run dev:kitchen
# → http://localhost:3003
```

### Database Development

```bash
# Start local Supabase (required for all apps)
npm run supabase:start
# → API: http://localhost:54321
# → Studio: http://localhost:54323

# Stop Supabase
npm run supabase:stop

# Reset database (CAUTION: deletes all data)
npm run supabase:reset

# Generate TypeScript types from database
npm run supabase:types
```

---

## 📜 Available NPM Scripts

### Root-Level Commands

```bash
# Development
npm run dev                  # Start all apps with Turbo (parallel)
npm run dev:all             # Start all apps with concurrently
npm run dev:admin           # Admin dashboard only
npm run dev:customer        # Customer web only
npm run dev:kitchen         # Kitchen tablet only
npm run dev:website         # Restaurant website only
npm run dev:tracker         # Project tracker only

# Building
npm run build               # Build all apps (production)

# Code Quality
npm run lint                # Lint all workspaces
npm run type-check          # TypeScript check all workspaces
npm run test                # Run all tests
npm run format              # Format code with Prettier

# Maintenance
npm run clean               # Clean build artifacts + node_modules
npm run install:all         # Install dependencies in all workspaces

# Database
npm run supabase:start      # Start local Supabase
npm run supabase:stop       # Stop local Supabase
npm run supabase:reset      # Reset local database
npm run supabase:types      # Generate TypeScript types
```

### Admin-Web Specific Commands

```bash
cd apps/admin-web

# Development
npm run dev                 # Start dev server (port 3002)
npm run build               # Production build
npm run start               # Start production server

# Code Quality
npm run lint                # ESLint check
npm run type-check          # TypeScript compilation check
```

---

## ✅ Pre-Commit Hooks

### Automated Checks (ACTIVE ✅)

When you run `git commit`, the following checks run automatically:

#### 1. 🔍 Direct Database Query Detection
**Rule**: NO `supabase.from()` calls outside `dal/` folder

```bash
# ❌ This will fail pre-commit:
// In app/api/orders/route.ts
const { data } = await supabase.from('orders').select('*');

# ✅ This will pass:
// In app/api/orders/route.ts
const orders = await orderRepository.findAll();
```

**Why**: Enforces Data Access Layer architecture

---

#### 2. 🔧 TypeScript Compilation
**Rule**: Zero TypeScript errors allowed

```bash
# Runs: tsc --noEmit
```

**Common Issues**:
- Missing type imports
- Undefined properties
- Type mismatches

**Fix**: Run `npm run type-check --workspace=apps/admin-web` to see errors

---

#### 3. ⚠️ Console.log Detection (Warning Only)
**Rule**: Warns about `console.log` statements

```bash
# ⚠️ Warning (doesn't block commit):
console.log('Debug info:', data);

# ✅ Better alternatives:
// Development: Use proper debugging
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}

// Production: Use logging service
logger.info('Order created', { orderId, total });
```

---

#### 4. 🔒 Secrets Detection
**Rule**: NO API keys, passwords, or tokens in code

```bash
# ❌ This will fail:
const API_KEY = "sk_live_abc123xyz";
const PASSWORD = "admin123";

# ✅ Use environment variables:
const API_KEY = process.env.STRIPE_API_KEY;
```

---

#### 5. 📦 Large File Detection (Warning)
**Rule**: Warns about files > 1MB

---

### Pre-Commit Hook Location

```bash
# Hook file
.git/hooks/pre-commit

# Test manually
bash .git/hooks/pre-commit

# Bypass (NOT RECOMMENDED)
git commit --no-verify -m "Emergency hotfix"
```

---

### Pre-Commit Hook Output Example

```bash
$ git commit -m "Add new feature"

🔍 Running pre-commit checks...

📋 Checking for direct database queries...
✅ No direct database queries found

🔧 Checking TypeScript compilation...
✅ TypeScript compilation passed

🔍 Checking for console.log statements...
⚠️  WARNING: console.log statements found:
   lib/services/OrderService.ts:45: console.log('Order created:', order);
   Consider removing these before production

📝 Checking for TODO/FIXME comments...
⚠️  TODO/FIXME comments found:
   lib/services/OrderService.ts:120: // TODO: Add validation

🔒 Checking for exposed secrets...
✅ No exposed secrets detected

📦 Checking file sizes...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All pre-commit checks passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Development Workflow

### Step-by-Step Workflow

#### 1. **Start Development Environment**

```bash
# Terminal 1: Start Supabase
npm run supabase:start

# Terminal 2: Start your app
npm run dev:admin
```

#### 2. **Create a New Feature**

```bash
# Create feature branch
git checkout -b feature/add-customer-loyalty

# Make changes following DEVELOPMENT-RULES.md
# - Add repository in lib/dal/
# - Add service in lib/services/
# - Add API route in app/api/
# - Update types
```

#### 3. **Test Your Changes**

```bash
# Type check
npm run type-check --workspace=apps/admin-web

# Lint
npm run lint --workspace=apps/admin-web

# Manual testing in browser
# → http://localhost:3002
```

#### 4. **Commit Changes**

```bash
# Stage files
git add .

# Commit (pre-commit hook runs automatically)
git commit -m "feat: add customer loyalty program"

# If pre-commit fails, fix issues and try again
# DO NOT use --no-verify unless emergency
```

#### 5. **Push and Create PR**

```bash
# Push to remote
git push origin feature/add-customer-loyalty

# Create PR on GitHub
# - Pre-deployment audit runs in GitHub Actions
# - Code review required
# - All checks must pass
```

---

## 🐛 Troubleshooting

### Issue: "Port already in use"

```bash
# Find process using port
lsof -i :3002

# Kill process
kill -9 <PID>

# Or use different port
cd apps/admin-web
npm run dev -- -p 3005
```

---

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
npm install

# Or clean and reinstall
npm run clean
npm install
npm run install:all
```

---

### Issue: "Supabase connection failed"

```bash
# Check if Supabase is running
npm run supabase:start

# Check environment variables
cat apps/admin-web/.env.local

# Should contain:
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

---

### Issue: "TypeScript errors in pre-commit"

```bash
# Run type check manually to see all errors
npm run type-check --workspace=apps/admin-web

# Common fixes:
# 1. Missing imports: Add import statements
# 2. Type errors: Check DEVELOPMENT-RULES.md for correct types
# 3. Missing dependencies: npm install <package>
```

---

### Issue: "Pre-commit hook not running"

```bash
# Check if hook exists
ls -la .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit

# Test manually
bash .git/hooks/pre-commit
```

---

### Issue: "Direct database query blocked"

```bash
# ❌ Error: Direct database queries found outside dal/ folder
# Files with violations:
#    → apps/admin-web/lib/services/OrderService.ts

# Fix: Use repository instead
# Before:
const { data } = await supabase.from('orders').select('*');

# After:
import { orderRepository } from '@/lib/dal';
const orders = await orderRepository.findAll();
```

---

## 📚 Quick Reference

### Essential Files

| File | Purpose |
|------|---------|
| `DEVELOPMENT-RULES.md` | Architecture rules & patterns |
| `ARCHITECTURE.md` | System architecture documentation |
| `PHASE-2-COMPLETE.md` | Current implementation status |
| `SECURITY.md` | Security policies |
| `LOCAL-DEVELOPMENT-GUIDE.md` | This file |

### Important Directories

| Directory | Purpose |
|-----------|---------|
| `apps/admin-web/lib/dal/` | Data Access Layer (repositories) |
| `apps/admin-web/lib/services/` | Business logic layer |
| `apps/admin-web/app/api/` | API routes |
| `scripts/` | Deployment & audit scripts |
| `.git/hooks/` | Git hooks (pre-commit) |

### Port Reference

| Port | Service |
|------|---------|
| 3000 | Restaurant Website |
| 3001 | Customer Web |
| 3002 | Admin Web |
| 3003 | Kitchen Tablet |
| 3004 | Project Tracker |
| 54321 | Supabase API |
| 54323 | Supabase Studio |

---

## 🎯 Daily Development Checklist

**Morning Setup**:
- [ ] Pull latest changes: `git pull origin main`
- [ ] Start Supabase: `npm run supabase:start`
- [ ] Start your app: `npm run dev:admin`
- [ ] Check for TypeScript errors: `npm run type-check`

**Before Committing**:
- [ ] Code follows DEVELOPMENT-RULES.md
- [ ] No direct database queries outside DAL
- [ ] TypeScript compiles without errors
- [ ] No console.logs in production code
- [ ] Tests pass (if applicable)
- [ ] Pre-commit hook passes

**Before PR**:
- [ ] All commits have descriptive messages
- [ ] Branch is up to date with main
- [ ] Documentation updated (if needed)
- [ ] Ready for code review

---

## 🆘 Getting Help

**Architecture Questions**: See `DEVELOPMENT-RULES.md`  
**Migration Help**: See `MIGRATION-CHECKLIST.md`  
**Security**: Run `./scripts/pre-deployment-audit.sh`  
**Type Errors**: Check `PHASE-2-COMPLETE.md` for correct patterns

---

**Remember**: Pre-commit hooks are here to help! They catch issues early before they reach production.

**Last Updated**: December 5, 2025  
**Status**: ✅ Complete
