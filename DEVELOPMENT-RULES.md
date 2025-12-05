# 🏗️ Development Framework & Rules

**Last Updated**: December 5, 2025  
**Status**: ✅ Phase 2 Complete - Rules Established

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Development Rules](#development-rules)
3. [Code Organization](#code-organization)
4. [Git Workflow](#git-workflow)
5. [Pre-Commit Checks](#pre-commit-checks)
6. [Testing Requirements](#testing-requirements)
7. [Security Standards](#security-standards)

---

## 🏛️ Architecture Overview

### Established Architecture (DO NOT CHANGE)

```
┌─────────────────────────────────────────────┐
│          API Routes / Components            │
│  - Authentication & authorization           │
│  - Input validation                         │
│  - Error handling                           │
│  - Thin layer (NO business logic)           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Services Layer                   │
│  - OrderService, MenuService, etc.          │
│  - Business logic & validation              │
│  - Transaction management                   │
│  - NO direct database calls                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Data Access Layer (DAL)              │
│  - Repositories (OrderRepository, etc.)     │
│  - CRUD operations                          │
│  - Query building                           │
│  - ONLY place for database calls            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Database (Supabase)                 │
│  - PostgreSQL                               │
│  - RLS policies                             │
│  - Triggers & functions                     │
└─────────────────────────────────────────────┘
```

### Directory Structure (MUST FOLLOW)

```
apps/admin-web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (thin layer)
│   ├── (dashboard)/       # Protected routes
│   └── (auth)/           # Auth routes
├── lib/
│   ├── dal/              # Data Access Layer ✅
│   │   ├── BaseRepository.ts
│   │   ├── OrderRepository.ts
│   │   ├── MenuItemRepository.ts
│   │   ├── CategoryRepository.ts
│   │   ├── RestaurantRepository.ts
│   │   ├── LocationRepository.ts
│   │   ├── OrderItemRepository.ts
│   │   ├── AuditLogRepository.ts
│   │   ├── StaffRepository.ts
│   │   └── index.ts
│   ├── services/         # Business Logic ✅
│   │   ├── OrderService.ts
│   │   ├── MenuService.ts
│   │   ├── DashboardService.ts
│   │   ├── RestaurantService.ts
│   │   └── (future services)
│   ├── supabase.ts       # Client only (25 lines)
│   ├── auth.ts           # Auth helpers (uses DAL)
│   ├── database.ts       # Legacy wrapper (uses Services)
│   └── settings-db.ts    # Settings wrapper (uses Services)
└── components/           # React components
```

---

## ✅ Development Rules (ENFORCED)

### Rule 1: NO Direct Database Queries Outside DAL

**❌ NEVER DO THIS:**
```typescript
// In a service, component, or API route
const { data } = await supabase.from('orders').select('*');
```

**✅ ALWAYS DO THIS:**
```typescript
// In a service
import { orderRepository } from '../dal';
const orders = await orderRepository.findByRestaurant(restaurantId);
```

**Enforcement**: Pre-commit hook checks for `supabase.from(` outside `dal/` folder.

---

### Rule 2: Business Logic ONLY in Services

**❌ NEVER DO THIS:**
```typescript
// In an API route
export async function POST(req: Request) {
  const order = await orderRepository.create(data);
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  // ... business logic ...
}
```

**✅ ALWAYS DO THIS:**
```typescript
// In OrderService.ts
export class OrderService {
  static async createOrder(data: CreateOrderInput) {
    // Validation
    // Calculations
    // Business rules
    return orderRepository.create(transformedData);
  }
}

// In API route
export async function POST(req: Request) {
  const order = await OrderService.createOrder(data);
  return Response.json(order);
}
```

---

### Rule 3: Repository Methods Return Domain Objects

**❌ NEVER DO THIS:**
```typescript
// In a repository
async findById(id: string) {
  const { data } = await supabase.from(this.tableName).select('*');
  return data; // Returns Supabase result
}
```

**✅ ALWAYS DO THIS:**
```typescript
// In a repository
async findById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from(this.tableName)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw this.handleError(error, 'findById');
  }

  return data as Order; // Typed domain object
}
```

---

### Rule 4: Use TypeScript Types from DAL

**❌ NEVER DO THIS:**
```typescript
// Redefining types
interface Order {
  id: string;
  total: number;
  // ...
}
```

**✅ ALWAYS DO THIS:**
```typescript
// Import from DAL
import type { Order, OrderStatus } from '@/lib/dal/OrderRepository';

// Or re-export from services
export type { Order } from '@/lib/dal/OrderRepository';
```

---

### Rule 5: Error Handling is Standardized

**✅ ALWAYS USE:**
```typescript
// In repositories (handled by BaseRepository)
protected handleError(error: PostgrestError, operation: string): Error {
  // Maps PostgreSQL errors to user-friendly messages
  // Logs errors with context
  // Returns standardized Error objects
}

// In services
try {
  const result = await repository.method();
  return { success: true, data: result };
} catch (error: any) {
  console.error('Service error:', error);
  return { success: false, error: error.message };
}

// In API routes
try {
  const result = await Service.method();
  return Response.json(result);
} catch (error: any) {
  return Response.json(
    { error: error.message },
    { status: 500 }
  );
}
```

---

### Rule 6: Audit Trail for All Mutations

**✅ ALWAYS LOG:**
```typescript
// In services (for all create/update/delete)
import { auditLogRepository } from '@/lib/dal';

await auditLogRepository.log({
  action: 'order_created',
  userId: currentUser.id,
  resourceType: 'order',
  resourceId: order.id,
  details: { itemCount: items.length, total: order.total_amount }
});
```

**Audit Actions**:
- `order_created`, `order_updated`, `order_cancelled`
- `menu_item_created`, `menu_item_updated`, `menu_item_deleted`
- `settings_updated`, `location_created`, `location_deleted`
- `staff_created`, `staff_updated`, `staff_deactivated`

---

### Rule 7: Naming Conventions (STRICT)

**Repositories**:
- Class: `OrderRepository`, `MenuItemRepository`
- File: `OrderRepository.ts`
- Instance: `orderRepository` (camelCase)
- Methods: `findById`, `findByRestaurant`, `create`, `update`, `delete`

**Services**:
- Class: `OrderService`, `MenuService`
- File: `OrderService.ts`
- Methods: `getOrders`, `createOrder`, `updateOrderStatus`
- Static methods only (no instances)

**Types/Interfaces**:
- Domain types: `Order`, `MenuItem`, `Restaurant`
- Input types: `CreateOrderInput`, `UpdateMenuItemInput`
- Filter types: `OrderFilters`, `MenuItemFilters`

---

### Rule 8: Import Order (Enforced by ESLint)

```typescript
// 1. External libraries
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 2. Internal dal/services
import { orderRepository, menuItemRepository } from '@/lib/dal';
import { OrderService } from '@/lib/services/OrderService';

// 3. Types
import type { Order, OrderStatus } from '@/lib/dal/OrderRepository';

// 4. Utilities
import { formatCurrency, formatDate } from '@/lib/utils';

// 5. Components
import { Button } from '@/components/ui/Button';
```

---

## 🔧 Code Organization

### Adding a New Feature

**Example: Add Customer Management**

#### Step 1: Create Repository
```typescript
// lib/dal/CustomerRepository.ts
export interface Customer {
  id: string;
  email: string;
  name: string;
  // ...
}

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super('customers');
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.findOne({ email });
  }
}

export const customerRepository = new CustomerRepository();
```

#### Step 2: Export from DAL
```typescript
// lib/dal/index.ts
export * from './CustomerRepository';
export { customerRepository } from './CustomerRepository';
```

#### Step 3: Create Service
```typescript
// lib/services/CustomerService.ts
import { customerRepository } from '@/lib/dal';

export class CustomerService {
  static async getCustomer(id: string) {
    return customerRepository.findById(id);
  }

  static async createCustomer(data: CreateCustomerInput) {
    // Validation
    // Business logic
    return customerRepository.create(data);
  }
}
```

#### Step 4: Create API Route
```typescript
// app/api/customers/route.ts
import { CustomerService } from '@/lib/services/CustomerService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return Response.json({ error: 'ID required' }, { status: 400 });
  }

  const customer = await CustomerService.getCustomer(id);
  return Response.json(customer);
}
```

---

## 🔀 Git Workflow

### Branch Naming
```
feature/add-customer-management
bugfix/fix-order-calculation
hotfix/security-patch
refactor/optimize-queries
docs/update-api-documentation
```

### Commit Messages (Conventional Commits)
```
feat: add customer management feature
fix: correct order total calculation
refactor: migrate auth.ts to use DAL
docs: update development rules
chore: update dependencies
test: add OrderService unit tests
```

### PR Requirements
1. ✅ All pre-commit checks pass
2. ✅ Tests written and passing
3. ✅ No TypeScript errors
4. ✅ Documentation updated
5. ✅ Code reviewed by 1+ person
6. ✅ No direct database queries outside DAL

---

## ✅ Pre-Commit Checks

### Automated Checks (Run on `git commit`)

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running pre-commit checks..."

# 1. Check for direct Supabase queries outside DAL
if git diff --cached --name-only | grep -E "\.ts$|\.tsx$" | grep -v "dal/" | xargs grep -l "supabase.from(" 2>/dev/null; then
  echo "❌ ERROR: Direct database queries found outside dal/ folder"
  echo "   Use repositories instead!"
  exit 1
fi

# 2. TypeScript compilation
npm run type-check --workspace=apps/admin-web
if [ $? -ne 0 ]; then
  echo "❌ ERROR: TypeScript compilation failed"
  exit 1
fi

# 3. ESLint
npm run lint --workspace=apps/admin-web
if [ $? -ne 0 ]; then
  echo "❌ ERROR: ESLint failed"
  exit 1
fi

# 4. Tests (if any)
npm run test --workspace=apps/admin-web --if-present
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Tests failed"
  exit 1
fi

# 5. Check for console.logs (warning only)
if git diff --cached --name-only | grep -E "\.ts$|\.tsx$" | xargs grep -n "console.log" 2>/dev/null; then
  echo "⚠️  WARNING: console.log statements found"
  echo "   Consider removing before production"
fi

echo "✅ All pre-commit checks passed!"
```

### Manual Checks (Run before PR)

```bash
# Full security audit
./scripts/pre-deployment-audit.sh admin-web development

# Dependency audit
npm audit --workspace=apps/admin-web

# Bundle size check
npm run build --workspace=apps/admin-web
```

---

## 🧪 Testing Requirements

### Unit Tests (Required for Services)

```typescript
// __tests__/services/OrderService.test.ts
import { OrderService } from '@/lib/services/OrderService';
import { orderRepository } from '@/lib/dal';

jest.mock('@/lib/dal');

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create order with valid data', async () => {
    const mockOrder = { id: '123', total_amount: 100 };
    (orderRepository.create as jest.Mock).mockResolvedValue(mockOrder);

    const result = await OrderService.createOrder({
      restaurantId: 'rest-1',
      items: [{ menuItemId: 'item-1', quantity: 2 }],
      // ...
    });

    expect(orderRepository.create).toHaveBeenCalled();
    expect(result).toEqual(mockOrder);
  });
});
```

### Integration Tests (Required for API Routes)

```typescript
// __tests__/api/orders.test.ts
import { POST } from '@/app/api/orders/route';

describe('POST /api/orders', () => {
  it('should create order', async () => {
    const req = new Request('http://localhost/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId: 'rest-1',
        items: [/* ... */]
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
  });
});
```

### Coverage Requirements
- **Services**: 80% minimum
- **Repositories**: 70% minimum (BaseRepository covers most)
- **API Routes**: 60% minimum

---

## 🔒 Security Standards

### Environment Variables (NEVER COMMIT)

```bash
# .env.local (gitignored)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # NEVER expose to client!
```

### Authentication Checks (ALL API Routes)

```typescript
// In every protected API route
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { user } = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of logic
}
```

### Input Validation (ALWAYS)

```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().positive(),
  })).min(1),
});

// In API route or service
const validated = CreateOrderSchema.parse(data);
```

### SQL Injection Prevention (AUTOMATIC)

✅ **Using repositories = automatic parameterization**
```typescript
// This is safe (parameterized by Supabase SDK)
await orderRepository.findAll({ restaurant_id: restaurantId });
```

❌ **Raw SQL (avoid unless necessary)**
```typescript
// If you MUST use raw SQL, use parameterization
await supabase.rpc('my_function', { param1: value });
```

---

## 📊 Monitoring & Logging

### Required Logging

**Info Level**:
```typescript
console.log('Order created:', { orderId, restaurantId, total });
```

**Error Level**:
```typescript
console.error('Order creation failed:', {
  error: error.message,
  context: { restaurantId, itemCount },
});
```

**Audit Level** (via AuditLogRepository):
```typescript
await auditLogRepository.log({
  action: 'order_created',
  userId: user.id,
  resourceType: 'order',
  resourceId: order.id,
  details: { /* relevant data */ }
});
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Pre-deployment audit passes
- [ ] No console.logs in production code
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

---

## 📞 Questions or Issues?

**Architecture Questions**: Review this document + `PHASE-2-COMPLETE.md`  
**Migration Help**: See `MIGRATION-CHECKLIST.md`  
**Security**: Run `./scripts/pre-deployment-audit.sh`

---

## 🎯 Summary

**The Golden Rules**:
1. ✅ NO direct database queries outside `dal/`
2. ✅ Business logic ONLY in services
3. ✅ API routes are thin (auth + call service)
4. ✅ Use TypeScript types from DAL
5. ✅ Audit all mutations
6. ✅ Test everything
7. ✅ Follow naming conventions
8. ✅ Run pre-commit checks

**This architecture is production-ready and MUST NOT be changed without team discussion.**

---

**Last Updated**: December 5, 2025  
**Version**: 1.0  
**Status**: ✅ Enforced
