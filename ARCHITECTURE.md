# System Architecture

## 🏗️ Overview

The QSR Ordering Platform uses a **monorepo architecture** with multiple Next.js applications sharing a centralized API layer and database. This hybrid approach balances simplicity with scalability.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Applications                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Admin   │  │ Customer │  │ Kitchen  │  │ Restaurant   │   │
│  │   Web    │  │   Web    │  │  Tablet  │  │   Website    │   │
│  │(Next.js) │  │(Next.js) │  │(Next.js) │  │  (Next.js)   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         ↓             ↓             ↓              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Centralized)                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Next.js API Routes (Server-Side)                      │    │
│  │  • /api/orders      - Order management                 │    │
│  │  • /api/menu        - Menu item operations             │    │
│  │  • /api/auth        - Authentication & authorization    │    │
│  │  • /api/restaurants - Restaurant management            │    │
│  │  • /api/staff       - Staff & user management          │    │
│  │  • /api/analytics   - Reports & analytics              │    │
│  │  • /api/settings    - Configuration management         │    │
│  │  • /api/integrations- Third-party integrations         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Services & Domain Logic                               │    │
│  │  • OrderService     - Order processing & validation    │    │
│  │  • MenuService      - Menu management & pricing        │    │
│  │  • AuthService      - Authentication & sessions        │    │
│  │  • PaymentService   - Payment processing (Stripe)      │    │
│  │  • NotificationService - Email/SMS notifications       │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Database Queries & ORM                                │    │
│  │  • Supabase Client                                     │    │
│  │  • Type-safe queries with TypeScript                   │    │
│  │  • Row-Level Security (RLS) policies                   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Database (Supabase/PostgreSQL)                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Tables:                                               │    │
│  │  • restaurants      - Restaurant information           │    │
│  │  • locations        - Physical locations               │    │
│  │  • menu_items       - Menu catalog                     │    │
│  │  • categories       - Menu categories                  │    │
│  │  • orders           - Customer orders                  │    │
│  │  • order_items      - Order line items                 │    │
│  │  • staff            - Staff & admins                   │    │
│  │  • customers        - Customer accounts                │    │
│  │  • settings         - Configuration                    │    │
│  │  • integrations     - Third-party configs              │    │
│  │  • audit_logs       - Activity tracking                │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Architecture Principles

### 1. **Separation of Concerns**
- **Presentation Layer**: UI components and client-side logic
- **API Layer**: Request handling, validation, and routing
- **Business Logic**: Domain-specific operations and rules
- **Data Access**: Database queries and transactions

### 2. **Single Source of Truth**
- Centralized database (Supabase)
- Shared types and interfaces
- Consistent data models across apps

### 3. **Security by Design**
- Authentication at API layer
- Authorization checks before operations
- Input validation on all endpoints
- Audit logging for sensitive operations

### 4. **Scalability**
- Stateless API design
- Horizontal scaling of frontend apps
- Database connection pooling
- Caching strategies for frequent queries

## 📱 Application Structure

### Admin Web (Restaurant Management)
```
apps/admin-web/
├── app/
│   ├── api/              # API routes (NEW)
│   │   ├── orders/
│   │   ├── menu/
│   │   ├── staff/
│   │   ├── settings/
│   │   └── analytics/
│   ├── dashboard/        # Dashboard pages
│   ├── menu/            # Menu management
│   ├── orders/          # Order management
│   └── settings/        # Settings pages
├── components/          # Reusable UI components
├── lib/                # Shared utilities
│   ├── services/       # Business logic (NEW)
│   ├── database.ts     # Data access layer
│   ├── auth.ts         # Authentication
│   └── supabase.ts     # DB client
└── types/              # TypeScript types
```

### Customer Web (Online Ordering)
```
apps/customer-web/
├── app/
│   ├── api/              # API routes (NEW)
│   │   ├── orders/
│   │   ├── menu/
│   │   └── auth/
│   ├── menu/            # Menu browsing
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Order checkout
│   └── orders/          # Order tracking
├── components/
├── lib/
│   ├── services/       # Business logic (NEW)
│   └── database.ts
└── types/
```

### Kitchen Tablet (Order Fulfillment)
```
apps/kitchen-tablet/
├── app/
│   ├── api/              # API routes (NEW)
│   │   └── orders/
│   └── page.tsx         # Kitchen display
├── components/
├── lib/
│   ├── services/       # Business logic (NEW)
│   └── database.ts
└── types/
```

### Restaurant Website (Public Marketing)
```
apps/restaurant-website/
├── app/
│   ├── api/              # API routes (NEW)
│   │   ├── menu/
│   │   └── settings/
│   ├── page.tsx         # Homepage
│   ├── menu/            # Menu display
│   └── about/           # About page
├── components/
└── lib/
    ├── services/       # Business logic (NEW)
    └── database.ts
```

## 🔄 API Layer Design

### Why Add an API Layer?

**Current Problem:**
- Frontend directly calls database
- Business logic scattered across components
- Difficult to enforce security consistently
- Hard to test and mock

**Solution with API Layer:**
- Centralized business logic
- Single point for authentication/authorization
- Easy to add rate limiting, logging, monitoring
- Can reuse same API for mobile apps later

### API Structure

#### Example: Order API

```typescript
// apps/admin-web/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';
import { requireAuth, hasPermission } from '@/lib/auth';
import { orderSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await requireAuth(request);
    
    // 2. Authorization
    if (!hasPermission(user, 'view_orders')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // 4. Business logic (via service)
    const orders = await OrderService.getOrders({
      restaurantId: user.restaurantId,
      status,
      limit,
    });
    
    // 5. Return response
    return NextResponse.json(orders);
    
  } catch (error) {
    // 6. Error handling
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await requireAuth(request);
    
    // Parse & validate body
    const body = await request.json();
    const validated = orderSchema.parse(body);
    
    // Authorization
    if (!hasPermission(user, 'create_order')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Business logic
    const order = await OrderService.createOrder(validated, user.id);
    
    // Audit log
    await AuditService.log({
      action: 'order_created',
      userId: user.id,
      resourceId: order.id,
    });
    
    return NextResponse.json(order, { status: 201 });
    
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Service Layer

```typescript
// lib/services/OrderService.ts

import { supabase } from '@/lib/supabase';
import { Order, CreateOrderInput } from '@/types';

export class OrderService {
  /**
   * Get orders with filters
   */
  static async getOrders(params: {
    restaurantId: string;
    status?: string;
    limit?: number;
  }): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select('*, order_items(*), customers(*)')
      .eq('restaurant_id', params.restaurantId)
      .order('created_at', { ascending: false });
    
    if (params.status) {
      query = query.eq('status', params.status);
    }
    
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    
    return data as Order[];
  }
  
  /**
   * Create new order
   */
  static async createOrder(
    input: CreateOrderInput,
    userId: string
  ): Promise<Order> {
    // Validate menu items exist and calculate total
    const menuItems = await this.validateMenuItems(input.items);
    const total = this.calculateTotal(input.items, menuItems);
    
    // Create order with transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: input.restaurantId,
        customer_id: userId,
        total_amount: total,
        status: 'pending',
        delivery_address: input.deliveryAddress,
        phone: input.phone,
      })
      .select()
      .single();
    
    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);
    
    // Create order items
    const orderItems = input.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price: menuItems.find(m => m.id === item.menuItemId)!.price,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      // Rollback order if items fail
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }
    
    // Send notifications
    await NotificationService.sendOrderConfirmation(order);
    
    return order as Order;
  }
  
  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string
  ): Promise<Order> {
    // Validate status transition
    const currentOrder = await this.getOrderById(orderId);
    if (!this.isValidStatusTransition(currentOrder.status, status)) {
      throw new Error('Invalid status transition');
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update order: ${error.message}`);
    
    // Send status update notification
    await NotificationService.sendStatusUpdate(data as Order);
    
    return data as Order;
  }
  
  /**
   * Helper: Validate menu items exist
   */
  private static async validateMenuItems(items: Array<{ menuItemId: string }>) {
    const ids = items.map(i => i.menuItemId);
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .in('id', ids)
      .eq('is_active', true);
    
    if (error) throw new Error('Failed to validate menu items');
    if (data.length !== ids.length) throw new Error('Some menu items not found');
    
    return data;
  }
  
  /**
   * Helper: Calculate order total
   */
  private static calculateTotal(
    items: Array<{ menuItemId: string; quantity: number }>,
    menuItems: Array<{ id: string; price: number }>
  ): number {
    return items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return sum + (menuItem!.price * item.quantity);
    }, 0);
  }
  
  /**
   * Helper: Validate status transition
   */
  private static isValidStatusTransition(
    current: OrderStatus,
    next: OrderStatus
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['out_for_delivery', 'completed'],
      out_for_delivery: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    
    return validTransitions[current]?.includes(next) || false;
  }
}
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Supabase Auth (JWT token)
   ↓
3. Store session in secure cookie
   ↓
4. API requests include token
   ↓
5. Middleware validates token
   ↓
6. Check user permissions (RBAC)
   ↓
7. Allow/Deny request
```

### Authorization (RBAC)

```typescript
// Role hierarchy
export enum UserRole {
  SUPER_ADMIN = 'super_admin',    // Full system access
  RESTAURANT_ADMIN = 'admin',     // Restaurant management
  MANAGER = 'manager',            // Limited admin
  STAFF = 'staff',                // Order & kitchen
  CUSTOMER = 'customer',          // Order placement only
}

// Permission matrix
const PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.RESTAURANT_ADMIN]: [
    'manage_menu',
    'manage_staff',
    'view_orders',
    'manage_orders',
    'view_analytics',
    'manage_settings',
  ],
  [UserRole.MANAGER]: [
    'view_orders',
    'manage_orders',
    'view_analytics',
  ],
  [UserRole.STAFF]: [
    'view_orders',
    'update_order_status',
  ],
  [UserRole.CUSTOMER]: [
    'place_order',
    'view_own_orders',
  ],
};
```

### Row-Level Security (RLS)

```sql
-- Ensure users can only access their own restaurant's data
CREATE POLICY "Users can only view their restaurant's orders"
ON orders
FOR SELECT
USING (
  restaurant_id IN (
    SELECT restaurant_id 
    FROM staff 
    WHERE user_id = auth.uid()
  )
);

-- Customers can only view their own orders
CREATE POLICY "Customers can view their own orders"
ON orders
FOR SELECT
USING (customer_id = auth.uid());
```

## 📊 Data Flow Examples

### Example 1: Customer Places Order

```
┌─────────┐
│Customer │
│   App   │
└────┬────┘
     │ 1. Add items to cart
     │ 2. Click "Place Order"
     ↓
┌─────────────────┐
│ Frontend (Cart) │
└────┬────────────┘
     │ 3. POST /api/orders
     ↓
┌─────────────────┐
│   API Route     │ 4. Validate auth token
│ (Order API)     │ 5. Validate input
└────┬────────────┘
     │ 6. Call OrderService
     ↓
┌─────────────────┐
│  OrderService   │ 7. Validate menu items
│                 │ 8. Calculate total
│                 │ 9. Create order
└────┬────────────┘
     │ 10. Insert to DB
     ↓
┌─────────────────┐
│    Database     │ 11. Save order + items
│   (Supabase)    │
└────┬────────────┘
     │ 12. Trigger realtime
     ↓
┌─────────────────┐
│ Kitchen Tablet  │ 13. Receives new order
│                 │ 14. Shows notification
└─────────────────┘
     │
     ↓
┌─────────────────┐
│  Admin Panel    │ 15. Shows in order list
└─────────────────┘
```

### Example 2: Menu Update Propagation

```
┌─────────┐
│  Admin  │ 1. Update menu item
│   Web   │
└────┬────┘
     │ 2. PUT /api/menu/:id
     ↓
┌─────────────────┐
│   MenuService   │ 3. Validate changes
│                 │ 4. Update database
└────┬────────────┘
     │ 5. Cache invalidation
     ↓
┌─────────────────────────────────────┐
│         All Frontend Apps           │
│ Restaurant Website | Customer App   │ 6. Fetch updated menu
│                                     │ 7. Re-render UI
└─────────────────────────────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  admin-web   │  │ customer-web │  │kitchen-tablet│ │
│  │  .vercel.app │  │  .vercel.app │  │  .vercel.app │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  restaurant-website.vercel.app                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Supabase Cloud                          │
│  • PostgreSQL Database                                   │
│  • Authentication Service                                │
│  • Realtime Subscriptions                                │
│  • Storage (future)                                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Third-Party Integrations                    │
│  • Stripe (Payments)                                     │
│  • SendGrid (Email)                                      │
│  • Twilio (SMS)                                          │
│  • Google Maps (Delivery)                                │
└─────────────────────────────────────────────────────────┘
```

## 📈 Scalability Strategy

### Horizontal Scaling
- Each Next.js app is stateless
- Can deploy multiple instances
- Vercel handles load balancing
- No session affinity required

### Database Scaling
- Connection pooling via Supabase
- Read replicas for analytics
- Caching layer (Redis) for frequent queries
- Database indexes on hot queries

### Caching Strategy
```typescript
// Example: Cache menu items (rarely change)
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export class MenuService {
  static async getMenuItems(restaurantId: string) {
    // Try cache first
    const cached = await redis.get(`menu:${restaurantId}`);
    if (cached) return cached;
    
    // Fetch from database
    const items = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    // Cache for 5 minutes
    await redis.setex(`menu:${restaurantId}`, 300, items);
    
    return items;
  }
}
```

## 🔄 Migration Plan (Current → API Layer)

### Phase 1: Add API Routes (Week 1-2)
1. Create API routes for orders
2. Create API routes for menu
3. Create API routes for auth
4. Keep existing direct DB access working

### Phase 2: Create Service Layer (Week 3-4)
1. Extract business logic to services
2. Move validation to services
3. Add comprehensive error handling
4. Write unit tests for services

### Phase 3: Migrate Frontend Apps (Week 5-6)
1. Update Admin Web to use APIs
2. Update Customer Web to use APIs
3. Update Kitchen Tablet to use APIs
4. Keep Restaurant Website as-is (mostly static)

### Phase 4: Remove Direct DB Access (Week 7-8)
1. Remove database.ts from frontends
2. All data through API layer only
3. Update security policies
4. Performance testing

### Phase 5: Optimization (Week 9-10)
1. Add caching layer
2. Implement rate limiting
3. Add monitoring and logging
4. Load testing

## 📚 Related Documentation

- [DEVELOPMENT-STANDARDS.md](./DEVELOPMENT-STANDARDS.md) - Coding standards
- [SECURITY.md](./SECURITY.md) - Security policies
- [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) - Implementation guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures

---

**Version**: 1.0  
**Last Updated**: December 1, 2025  
**Review Schedule**: Quarterly  
**Next Review**: March 1, 2026
