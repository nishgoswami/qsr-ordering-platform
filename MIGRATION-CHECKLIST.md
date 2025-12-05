# 📋 DAL Migration Checklist

This checklist tracks the migration of direct database queries to the Data Access Layer (DAL) using the Repository pattern.

## ✅ Completed

### DAL Infrastructure
- [x] **BaseRepository.ts** (314 lines)
  - Generic CRUD operations
  - Error handling
  - Query filtering and pagination
  - Count and exists methods
  
- [x] **OrderRepository.ts** (322 lines)
  - Order-specific queries
  - findWithItems() - orders with menu items
  - findByStatus(), findByDateRange()
  - getStats() - revenue and metrics
  - updateStatus(), countActive()
  
- [x] **MenuItemRepository.ts** (173 lines)
  - Menu item queries
  - findActive(), findByCategory()
  - search() - by name/description
  - toggleAvailability(), updatePrice()
  
- [x] **RestaurantRepository.ts** (46 lines)
  - Restaurant queries
  - findBySlug(), findActive()
  
- [x] **LocationRepository.ts** (95 lines)
  - Location queries
  - findByRestaurant(), findActiveByRestaurant()
  - softDelete(), toggleActive()
  
- [x] **OrderItemRepository.ts** (63 lines)
  - Order items CRUD
  - createForOrder(), findByOrderId()
  
- [x] **CategoryRepository.ts** (89 lines)
  - Category management
  - findByRestaurant(), reorder()
  
- [x] **AuditLogRepository.ts** (105 lines)
  - Audit trail logging
  - findByResource(), findByUser()
  
- [x] **StaffRepository.ts** (91 lines)
  - Staff/user management
  - findByEmail(), findByRestaurant()
  
- [x] **dal/index.ts** (38 lines)
  - Centralized exports
  - Repository instance exports

### Services Layer
- [x] **OrderService.ts** - Fully refactored to use DAL
  - ✅ All 8 methods use repositories
  - ✅ Zero direct Supabase queries
  
- [x] **DashboardService.ts** (48 lines)
  - ✅ `getStats()` - Dashboard metrics
  
- [x] **MenuService.ts** (104 lines)
  - ✅ Category and menu item management
  - ✅ All CRUD operations via repositories
  
- [x] **RestaurantService.ts** (92 lines)
  - ✅ Settings management
  - ✅ Location CRUD with audit logs

### Core Library Files (Phase 2 ✅)
- [x] **auth.ts** - MIGRATED
  - ✅ `signUp()` - uses restaurantRepository, staffRepository, locationRepository
  - ✅ `hasCompletedOnboarding()` - uses menuItemRepository
  - ✅ Zero direct queries (uses repositories)
  
- [x] **database.ts** - REFACTORED
  - ✅ All functions delegate to services
  - ✅ `getDashboardStats()` → DashboardService
  - ✅ `getCategories()` → MenuService
  - ✅ `getMenuItems()` → MenuService
  - ✅ `getOrders()` → OrderService
  - ✅ All menu CRUD → MenuService
  - ✅ `updateOrderStatus()` → OrderService
  
- [x] **settings-db.ts** - REFACTORED
  - ✅ `loadRestaurantSettings()` → RestaurantService
  - ✅ `saveRestaurantSettings()` → RestaurantService
  - ✅ `deleteLocation()` → RestaurantService
  - ✅ Uses staffRepository for user lookup
  
- [x] **supabase.ts** - CLEANED
  - ✅ Only client initialization (25 lines)
  - ✅ All helper functions removed (moved to services)
  - ✅ Original backed up as supabase-client.ts

## 🔄 In Progress

### Phase 3 Tasks

- [ ] **Write Tests**
  - [ ] Repository unit tests
  - [ ] Service unit tests  
  - [ ] Integration tests for API routes

- [ ] **Additional Services** (Optional)
  - [ ] AuthService - Wrap auth operations
  - [ ] AnalyticsService - Reports and metrics

### API Routes (Medium Priority)

#### apps/admin-web/app/api/
- [x] **orders/route.ts** - Already uses OrderService ✅
- [x] **orders/[id]/route.ts** - Already uses OrderService ✅
- [x] **orders/stats/route.ts** - Already uses OrderService ✅

- [ ] **Menu API routes** (if they exist)
  - Create MenuService to use MenuItemRepository
  - Update API routes to use MenuService
  
- [ ] **Restaurant API routes**
  - Create RestaurantService
  - Update to use RestaurantRepository

### Frontend Components (Low Priority)
- [ ] **Dashboard components** - Check for direct Supabase calls
- [ ] **Order management UI** - Should use API routes (already done)
- [ ] **Menu management UI** - Check for direct queries
- [ ] **Settings pages** - Check for direct queries

### Other Apps (Medium Priority)

#### apps/customer-web/
- [ ] **lib/** - Search for direct Supabase queries
- [ ] **components/** - Check for database calls
- [ ] **app/** - Check pages for queries

#### apps/kitchen-tablet/
- [ ] **lib/** - Search for direct Supabase queries
- [ ] **Order display logic** - Should use API
  
#### apps/restaurant-website/
- [ ] **lib/** - Search for direct Supabase queries
- [ ] **Menu display** - Check for direct queries

## 📊 Migration Progress

### By Priority
- **High Priority**: 4/9 (44%)
  - ✅ OrderService refactored
  - ✅ DAL infrastructure created
  - ⏳ Missing repositories (OrderItem, Category, AuditLog, Staff)
  - ⏳ database.ts migration
  - ⏳ auth.ts migration
  - ⏳ settings-db.ts migration
  - ⏳ supabase.ts migration

- **Medium Priority**: 0/4 (0%)
  - ⏳ Menu API routes
  - ⏳ Restaurant API routes
  - ⏳ Other apps migration

- **Low Priority**: 0/4 (0%)
  - ⏳ Frontend components

### By File Count
- **Completed**: 6 files (DAL + OrderService)
- **In Progress**: 0 files
- **Pending**: ~20+ files

### Query Count Reduction
- **Before**: 19+ direct Supabase queries in admin-web/lib/
- **After OrderService**: ~12 direct queries remaining
- **Target**: 0 direct queries (all through DAL)

## 🎯 Next Steps (Recommended Order)

### Phase 1: Complete Missing Repositories ✅ DONE
- ✅ Created OrderItemRepository.ts
- ✅ Created AuditLogRepository.ts
- ✅ Created CategoryRepository.ts
- ✅ Created StaffRepository.ts
- ✅ Created LocationRepository.ts

### Phase 2: Migrate Core Library Files ✅ DONE
- ✅ Migrated database.ts (now uses services)
- ✅ Migrated auth.ts (now uses repositories)
- ✅ Migrated settings-db.ts (now uses RestaurantService)
- ✅ Cleaned supabase.ts (client only)

### Phase 3: Testing & Additional Services (Current)
   - Authentication business logic
   - Use StaffRepository
   - JWT/session management

### Phase 4: Update API Routes (1-2 hours)
1. **Create menu API routes**
   - GET/POST/PATCH/DELETE for menu items
   - Use MenuService
   
2. **Create restaurant API routes**
   - Settings CRUD
   - Use RestaurantService

### Phase 5: Migrate Other Apps (3-4 hours)
1. **Search for direct queries**: `grep -r "from('orders')" apps/*/`
2. **Update to use API routes** instead of direct Supabase
3. **Test each app** thoroughly

### Phase 6: Frontend Cleanup (2-3 hours)
1. **Search components** for Supabase imports
2. **Replace with API calls** or service hooks
3. **Remove Supabase client** from frontend where possible

## ✅ Verification Steps

After migration, verify:

### Code Quality
- [ ] **No direct Supabase queries** outside repositories
  ```bash
  # This should return 0 results (except in dal/ folder)
  grep -r "supabase.from(" apps/admin-web/lib/ --exclude-dir=dal
  grep -r "supabase.from(" apps/admin-web/app/
  ```

- [ ] **All services use repositories**
  ```bash
  # Check imports in services
  grep -r "import.*Repository" apps/admin-web/lib/services/
  ```

- [ ] **TypeScript compiles without errors**
  ```bash
  cd apps/admin-web && npm run type-check
  ```

### Functionality
- [ ] **All API routes work** - Test with Postman/curl
- [ ] **Order creation** works end-to-end
- [ ] **Status updates** work correctly
- [ ] **Statistics** display properly
- [ ] **Menu management** CRUD operations
- [ ] **Authentication** still works

### Testing
- [ ] **Write repository unit tests**
  ```typescript
  describe('OrderRepository', () => {
    it('finds orders by restaurant', async () => { ... });
    it('calculates stats correctly', async () => { ... });
  });
  ```

- [ ] **Write service unit tests** (with mocked repositories)
  ```typescript
  describe('OrderService', () => {
    it('validates menu items', async () => { ... });
    it('calculates totals correctly', () => { ... });
  });
  ```

- [ ] **Integration tests** for API routes

### Performance
- [ ] **Query performance** - Check slow queries
- [ ] **N+1 query prevention** - Use joins/batching
- [ ] **Caching strategy** - Add where beneficial

## 📝 Notes

### Architecture Principles
1. **Services contain business logic** - validation, calculations, workflows
2. **Repositories contain data access** - queries, mutations, raw SQL
3. **API routes are thin** - auth, validation, call services
4. **No direct DB access outside DAL** - always use repositories

### Migration Pattern
```typescript
// ❌ Before: Direct query in service/component
const { data } = await supabase.from('orders').select('*');

// ✅ After: Use repository
const orders = await orderRepository.findAll();

// ✅ Better: Use service (if business logic needed)
const orders = await OrderService.getOrders(filters);
```

### Common Issues
1. **Type conflicts**: Import types from DAL, not redefine
2. **Supabase still imported**: Remove unused imports
3. **Business logic in repositories**: Move to services
4. **Direct queries "just this once"**: No! Use DAL

### Benefits Achieved
- ✅ **Testable**: Mock repositories in service tests
- ✅ **Maintainable**: Change queries in one place
- ✅ **Portable**: Swap database (Supabase → PostgreSQL → MongoDB)
- ✅ **Type-safe**: Full TypeScript coverage
- ✅ **Auditable**: All queries logged/trackable
- ✅ **Scalable**: Add caching, connection pooling easily

## 🚀 Quick Start Commands

```bash
# Check remaining direct queries
cd "ISO Apps"
grep -r "supabase.from(" apps/admin-web/lib/ --exclude-dir=dal | wc -l

# Find specific table queries
grep -r "from('orders')" apps/admin-web/lib/ --exclude-dir=dal
grep -r "from('menu_items')" apps/admin-web/lib/ --exclude-dir=dal

# Type check
cd apps/admin-web && npm run type-check

# Run tests (once written)
npm test

# Start dev server
npm run dev
```

---

**Last Updated**: December 1, 2025  
**Status**: Phase 1 - DAL Infrastructure Complete, OrderService Migrated  
**Next**: Create missing repositories (OrderItem, AuditLog, Category, Staff)
