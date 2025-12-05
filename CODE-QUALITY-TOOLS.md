# 🔍 Code Quality & Dead Code Management

**Last Updated**: December 5, 2025  
**Status**: ✅ Recommended Tools & Setup

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Recommended Tools](#recommended-tools)
3. [Installation & Setup](#installation--setup)
4. [Usage Guide](#usage-guide)
5. [Automation](#automation)
6. [Best Practices](#best-practices)

---

## 🎯 Overview

### What We're Detecting

| Issue Type | Description | Impact |
|------------|-------------|--------|
| **Dead Code** | Unused functions, variables, imports | Increases bundle size, confusion |
| **Duplicate Code** | Copy-pasted logic | Maintenance burden, bugs |
| **Unused Dependencies** | npm packages not imported | Slower installs, security risk |
| **Unused Exports** | Public APIs never consumed | False assumptions, bloat |
| **Type-only Imports** | Runtime imports for types | Bundle bloat |
| **Unreachable Code** | Code after returns/throws | Logic errors |

---

## 🛠️ Recommended Tools

### 1. **ts-prune** ⭐ (Most Effective for TypeScript)

**What it does**: Finds unused exports in TypeScript projects

**Why use it**:
- ✅ Specifically designed for TypeScript/JavaScript
- ✅ Finds unused exports across your entire codebase
- ✅ Fast and accurate
- ✅ Zero config needed

**Use case**: Finding dead exports in your DAL, services, components

**Example output**:
```bash
apps/admin-web/lib/services/OrderService.ts:45 - calculateDiscount (used in 0 files)
apps/admin-web/lib/dal/OrderRepository.ts:120 - findByCustomer (used in 0 files)
```

---

### 2. **knip** ⭐⭐ (Most Comprehensive)

**What it does**: Finds unused files, dependencies, exports, and types

**Why use it**:
- ✅ Finds unused files, exports, dependencies, types
- ✅ Works with monorepos (Turbo, npm workspaces)
- ✅ Supports Next.js, React, TypeScript
- ✅ Configurable and extensible
- ✅ Actively maintained

**Use case**: Complete codebase audit (weekly/monthly)

**Example output**:
```bash
Unused files (2):
  apps/admin-web/lib/old-helpers.ts
  apps/admin-web/components/LegacyModal.tsx

Unused dependencies (3):
  lodash
  moment
  axios

Unused exports (5):
  apps/admin-web/lib/utils.ts: formatPhoneNumber
  apps/admin-web/lib/constants.ts: OLD_API_URL
```

---

### 3. **depcheck** (Dependency Analysis)

**What it does**: Finds unused dependencies in package.json

**Why use it**:
- ✅ Fast and focused on dependencies
- ✅ Detects missing dependencies too
- ✅ Works per-workspace in monorepos

**Use case**: Cleaning up package.json before releases

---

### 4. **ESLint with Unused Rules** (Real-time)

**What it does**: Catches unused variables, imports in your editor

**Why use it**:
- ✅ Real-time feedback while coding
- ✅ Already configured in your project
- ✅ Auto-fix available
- ✅ Integrates with pre-commit hooks

**Use case**: Preventing dead code from being committed

---

### 5. **SonarQube / SonarCloud** (Enterprise)

**What it does**: Complete code quality platform (duplication, complexity, coverage)

**Why use it**:
- ✅ Detects code duplication (copy-paste)
- ✅ Measures code complexity
- ✅ Security vulnerability scanning
- ✅ Technical debt tracking
- ✅ Free for open source

**Use case**: Continuous monitoring + duplication detection

---

### 6. **jscpd** (Duplicate Code Detection)

**What it does**: Finds copy-pasted code blocks

**Why use it**:
- ✅ Language-agnostic (works with TS, JS, CSS, etc.)
- ✅ Configurable threshold (min lines to consider duplicate)
- ✅ HTML reports with side-by-side comparison
- ✅ Can fail CI if duplication exceeds threshold

**Use case**: Finding refactoring opportunities

---

## 📦 Installation & Setup

### Quick Setup (Recommended)

```bash
# Install all recommended tools
npm install -D ts-prune knip depcheck jscpd

# Add to root package.json scripts
npm pkg set scripts.dead-code="ts-prune"
npm pkg set scripts.audit:code="knip"
npm pkg set scripts.audit:deps="depcheck"
npm pkg set scripts.audit:dupes="jscpd apps/ --min-lines 10 --min-tokens 50"
npm pkg set scripts.audit:all="npm run dead-code && npm run audit:code && npm run audit:deps && npm run audit:dupes"
```

### Individual Tool Setup

#### 1. ts-prune Setup

```bash
# Install
npm install -D ts-prune

# Run (from root)
npx ts-prune

# Run for specific app
npx ts-prune --project apps/admin-web/tsconfig.json

# Ignore specific paths
npx ts-prune --ignore "index.ts|types.ts"
```

**Add to package.json**:
```json
{
  "scripts": {
    "dead-code": "ts-prune --project apps/admin-web/tsconfig.json",
    "dead-code:all": "ts-prune"
  }
}
```

---

#### 2. knip Setup ⭐ (Recommended)

```bash
# Install
npm install -D knip

# Initialize config
npx knip --init

# Run audit
npx knip

# Run with auto-fix (removes unused files)
npx knip --fix
```

**Create `.knip.json`**:
```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "workspaces": {
    "apps/admin-web": {
      "entry": [
        "app/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}"
      ],
      "project": ["**/*.{ts,tsx}"],
      "ignore": [
        "**/*.test.{ts,tsx}",
        "**/*.backup.{ts,tsx}",
        "**/node_modules/**"
      ]
    },
    "apps/customer-web": {
      "entry": ["app/**/*.{ts,tsx}"],
      "project": ["**/*.{ts,tsx}"]
    },
    "apps/kitchen-tablet": {
      "entry": ["app/**/*.{ts,tsx}"],
      "project": ["**/*.{ts,tsx}"]
    },
    "apps/restaurant-website": {
      "entry": ["app/**/*.{ts,tsx}"],
      "project": ["**/*.{ts,tsx}"]
    }
  },
  "ignore": [
    "**/*.backup.*",
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/build/**"
  ],
  "ignoreDependencies": [
    "turbo",
    "concurrently",
    "husky",
    "lint-staged"
  ]
}
```

**Add to package.json**:
```json
{
  "scripts": {
    "audit:code": "knip",
    "audit:code:fix": "knip --fix",
    "audit:code:admin": "knip --workspace apps/admin-web"
  }
}
```

---

#### 3. depcheck Setup

```bash
# Install
npm install -D depcheck

# Run for all workspaces
npx depcheck

# Run for specific app
npx depcheck apps/admin-web

# With custom config
npx depcheck --ignore-dirs=.next,dist,build
```

**Add to package.json**:
```json
{
  "scripts": {
    "audit:deps": "depcheck",
    "audit:deps:admin": "depcheck apps/admin-web"
  }
}
```

---

#### 4. jscpd Setup (Duplicate Detection)

```bash
# Install
npm install -D jscpd

# Run
npx jscpd apps/ --min-lines 10 --min-tokens 50

# Generate HTML report
npx jscpd apps/ --output ./reports/duplicates --format html

# Fail if duplication > 5%
npx jscpd apps/ --threshold 5
```

**Create `.jscpd.json`**:
```json
{
  "threshold": 5,
  "reporters": ["html", "console"],
  "ignore": [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/*.test.ts",
    "**/*.backup.*"
  ],
  "format": ["typescript", "javascript", "tsx", "jsx"],
  "minLines": 10,
  "minTokens": 50,
  "output": "./reports/duplicates"
}
```

**Add to package.json**:
```json
{
  "scripts": {
    "audit:dupes": "jscpd apps/",
    "audit:dupes:report": "jscpd apps/ --format html"
  }
}
```

---

#### 5. Enhanced ESLint Config

**Update `.eslintrc.json`**:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-unused-imports": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unreachable": "error",
    "no-duplicate-imports": "error"
  }
}
```

**Install plugin**:
```bash
npm install -D @typescript-eslint/eslint-plugin
```

---

## 📖 Usage Guide

### Daily Workflow (Automated)

Your existing ESLint + pre-commit hook already catches:
- ✅ Unused variables
- ✅ Unused imports
- ✅ Unreachable code

**No action needed** - runs automatically on commit!

---

### Weekly Audit (Recommended)

```bash
# Run all audits
npm run audit:all

# Or individually:
npm run dead-code        # Find unused exports
npm run audit:deps       # Find unused dependencies
npm run audit:dupes      # Find duplicate code
```

**Review output and clean up unused code.**

---

### Monthly Deep Audit

```bash
# Full codebase audit with knip
npm run audit:code

# Review report:
# - Unused files
# - Unused exports
# - Unused dependencies
# - Unused types

# Auto-fix safe removals
npm run audit:code:fix

# Generate duplication report
npm run audit:dupes:report
# → Open reports/duplicates/html/index.html
```

---

### Before Release

```bash
# Complete audit
npm run audit:all

# Clean unused dependencies
npm run audit:deps
# → Remove unused packages from package.json

# Check bundle size
npm run build --workspace=apps/admin-web
# → Review .next/analyze output

# Run security audit
./scripts/pre-deployment-audit.sh admin-web production
```

---

## 🤖 Automation

### 1. Add to Pre-Commit Hook

**Update `.git/hooks/pre-commit`**:

```bash
# Add after TypeScript check
echo "🔍 Checking for unused exports..."
UNUSED_EXPORTS=$(npx ts-prune --project apps/admin-web/tsconfig.json 2>/dev/null | grep -v "used in module" | head -5)
if [ ! -z "$UNUSED_EXPORTS" ]; then
  echo -e "${YELLOW}⚠️  WARNING: Unused exports found:${NC}"
  echo "$UNUSED_EXPORTS" | sed 's/^/   /'
  echo ""
fi
```

---

### 2. GitHub Actions Workflow

**Create `.github/workflows/code-quality.yml`**:

```yaml
name: Code Quality Audit

on:
  pull_request:
    branches: [main, develop]
  schedule:
    # Run weekly on Sundays at 2 AM
    - cron: '0 2 * * 0'
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run knip (unused code)
        run: npm run audit:code
        continue-on-error: true
      
      - name: Run depcheck (unused deps)
        run: npm run audit:deps
        continue-on-error: true
      
      - name: Run jscpd (duplicates)
        run: |
          npm run audit:dupes
          if [ $? -gt 5 ]; then
            echo "::error::Code duplication exceeds 5% threshold"
            exit 1
          fi
      
      - name: Upload duplication report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: duplication-report
          path: reports/duplicates/
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## 🔍 Code Quality Report\n\nAudit completed. Check workflow artifacts for detailed reports.'
            })
```

---

### 3. VSCode Integration

**Create `.vscode/settings.json`**:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true,
    "source.removeUnusedImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/*.backup.*": true,
    "**/.next": true,
    "**/node_modules": true
  }
}
```

**Install VSCode extensions**:
- ESLint (`dbaeumer.vscode-eslint`)
- TypeScript Import Sorter (`mike-co.import-sorter`)
- Unused Code Highlighter (`formulahendry.auto-close-tag`)

---

## 📊 Best Practices

### 1. Regular Audit Schedule

| Frequency | What to Run | Purpose |
|-----------|-------------|---------|
| **Daily** | ESLint (automatic) | Catch issues while coding |
| **Pre-commit** | ESLint + Type check | Prevent bad commits |
| **Weekly** | `npm run audit:all` | Find accumulated dead code |
| **Monthly** | Full knip audit | Deep clean + duplication report |
| **Pre-release** | All audits + bundle analysis | Ensure clean release |

---

### 2. Safe Removal Process

**Before removing "unused" code**:

1. **Verify it's truly unused**:
   ```bash
   # Search for usage across codebase
   grep -r "functionName" apps/
   ```

2. **Check for dynamic imports**:
   ```typescript
   // These won't be detected by static analysis
   const module = await import(`./modules/${name}`);
   ```

3. **Check for external consumers**:
   - API endpoints called by mobile apps
   - Exports used by other repositories
   - Public NPM packages

4. **Deprecate first, remove later**:
   ```typescript
   /**
    * @deprecated Use newFunction instead. Will be removed in v2.0
    */
   export function oldFunction() { ... }
   ```

---

### 3. Code Duplication Thresholds

**Acceptable duplication levels**:
- ✅ **< 3%**: Excellent
- ⚠️ **3-5%**: Good (some duplication is normal)
- ⚠️ **5-10%**: Needs attention
- ❌ **> 10%**: Refactor immediately

**When to refactor duplicates**:
- Block duplicated > 20 lines
- Same logic in 3+ places
- Complex algorithms copy-pasted
- Business rules repeated

**When duplication is OK**:
- Test fixtures/mocks
- Configuration objects
- Type definitions
- Simple utility wrappers (2-3 lines)

---

### 4. Dependency Management

**Keep dependencies clean**:

```bash
# Before adding a dependency, check:
npm run audit:deps

# Remove unused dependency:
npm uninstall <package> --workspace=apps/admin-web

# Update outdated packages:
npm outdated
npm update

# Security audit:
npm audit
npm audit fix
```

**Avoid dependency bloat**:
- ✅ Use built-in Node/browser APIs when possible
- ✅ Prefer smaller, focused libraries
- ✅ Use tree-shakeable ESM packages
- ❌ Don't install entire libraries for one function (lodash, moment)

---

### 5. Monitoring Bundle Size

**Track bundle size over time**:

```bash
# Build and analyze
npm run build --workspace=apps/admin-web

# Check bundle size
du -sh apps/admin-web/.next/static

# Use Next.js bundle analyzer
npm install -D @next/bundle-analyzer
```

**Add to `next.config.js`**:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... your config
});
```

**Analyze**:
```bash
ANALYZE=true npm run build --workspace=apps/admin-web
```

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Core Tools

```bash
npm install -D knip depcheck jscpd
```

### Step 2: Add Scripts to package.json

```bash
npm pkg set scripts.audit:code="knip"
npm pkg set scripts.audit:deps="depcheck"
npm pkg set scripts.audit:dupes="jscpd apps/ --min-lines 10"
npm pkg set scripts.audit:all="npm run audit:code && npm run audit:deps && npm run audit:dupes"
```

### Step 3: Run First Audit

```bash
npm run audit:all
```

### Step 4: Review & Clean

- Remove unused exports
- Delete unused files
- Uninstall unused dependencies
- Refactor duplicate code

### Step 5: Add to CI/CD (Optional)

Create `.github/workflows/code-quality.yml` (see above)

---

## 📈 Expected Results

### After Initial Cleanup

**Typical findings in a mature codebase**:
- 10-20 unused exports
- 5-10 unused dependencies
- 2-5 unused files
- 3-8% code duplication

**Benefits after cleanup**:
- ✅ 5-15% smaller bundle size
- ✅ Faster build times
- ✅ Fewer security vulnerabilities
- ✅ Easier maintenance
- ✅ Clearer codebase

---

## 🔗 Tool Comparison

| Tool | Finds Dead Code | Finds Duplicates | Finds Unused Deps | Monorepo Support | Active |
|------|----------------|------------------|-------------------|------------------|--------|
| **knip** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **ts-prune** | ✅ | ❌ | ❌ | ⚠️ | ✅ |
| **depcheck** | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| **jscpd** | ❌ | ✅ | ❌ | ✅ | ✅ |
| **ESLint** | ⚠️ (imports only) | ❌ | ❌ | ✅ | ✅ |
| **SonarQube** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Recommendation**: Use **knip + jscpd** combination for best coverage.

---

## 📞 Summary

**Install these 3 tools**:
```bash
npm install -D knip depcheck jscpd
```

**Run weekly**:
```bash
npm run audit:all
```

**Integrate with CI**:
- Add to GitHub Actions (weekly schedule)
- Add basic checks to pre-commit hook
- Monitor bundle size on every PR

**Expected time investment**:
- Initial setup: 15 minutes
- First audit & cleanup: 2-4 hours
- Weekly maintenance: 15-30 minutes

**ROI**:
- Cleaner codebase
- Faster builds
- Smaller bundles
- Fewer bugs
- Easier onboarding

---

**Ready to start?** Run: `npm install -D knip depcheck jscpd && npm run audit:all`

**Last Updated**: December 5, 2025  
**Status**: ✅ Ready to Use
