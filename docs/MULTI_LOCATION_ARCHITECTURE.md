# Multi-Location Architecture Guide

## Overview
This system supports both corporate-owned multi-location and franchise models with flexible global/local controls.

## Feature Classification

### 🌐 GLOBAL ONLY (Corporate Level)
**Cannot be overridden by locations**

1. **Brand Identity**
   - Primary logo
   - Brand colors (primary, secondary, accent)
   - Font family
   - Corporate tagline

2. **Core Menu Structure**
   - Base menu items (name, description, base recipe)
   - Standard categories
   - Modifier group templates
   - Allergen information

3. **Corporate Policies**
   - Privacy policy
   - Terms of service
   - Refund policy
   - Corporate contact info

4. **System Configuration**
   - Payment gateway settings
   - Email/SMS providers
   - Third-party integrations

---

### 📍 LOCATION-SPECIFIC ONLY
**Always varies by location**

1. **Location Details**
   - Physical address
   - Phone number
   - Email address
   - Store manager info

2. **Operating Hours**
   - Daily open/close times
   - Holiday schedules
   - Special event hours

3. **Local Compliance**
   - Sales tax rates
   - Local permits & licenses
   - Health inspection records

4. **Delivery Settings**
   - Delivery zones & radius
   - Delivery fees
   - Minimum order amounts
   - Estimated delivery times

5. **Staff Management**
   - Local staff accounts
   - Role assignments
   - Shift schedules

---

### 🔄 HYBRID (Global with Local Overrides)
**Corporate sets defaults, locations can customize**

#### **Menu Items**
**Global Default:**
- Item name & description
- Base image
- Default price
- Allergen info
- Modifier groups
- Nutritional information

**Location Override:**
- ✅ Custom pricing (e.g., higher costs in expensive cities)
- ✅ Availability (enable/disable items)
- ✅ Local variations (e.g., "Add spice level" only in certain markets)
- ✅ Preparation time
- ✅ Inventory status (86'd items)

**Implementation:**
```typescript
interface MenuItem {
  id: string;
  name: string; // Global
  description: string; // Global
  basePrice: number; // Global default
  image: string; // Global
  
  // Location overrides
  locationOverrides: {
    [locationId: string]: {
      price?: number; // Override price
      isAvailable?: boolean; // Override availability
      preparationTime?: number; // Override time
      customDescription?: string; // Local description
    }
  }
}
```

**Example:**
```typescript
{
  name: "Butter Chicken",
  basePrice: 14.99,
  locationOverrides: {
    "loc_nyc_manhattan": { price: 17.99 }, // NYC premium
    "loc_sf_downtown": { price: 16.99 }, // SF premium
    "loc_austin_downtown": { isAvailable: false } // Not available
  }
}
```

---

#### **Promotions**
**Global (Corporate Campaigns):**
- Brand-wide marketing campaigns
- National holidays (July 4th sale)
- Corporate partnerships

**Local (Store-Specific):**
- Grand opening deals
- Local event promotions
- Store anniversary specials

**Both Run Simultaneously:**
- Customer sees: Corporate 20% off FIRST ORDER + Local FREE DELIVERY
- Priority: Local promotions display first

**Implementation:**
```typescript
interface Promotion {
  scope: 'global' | 'location-specific';
  locationIds: string[]; // Empty = all locations
  priority: number; // Higher = shows first
}
```

---

#### **Categories**
**Global Default:**
- Standard category structure
- Category names & icons
- Sort order

**Location Override:**
- ✅ Hide/show categories
- ✅ Reorder categories
- ✅ Add location-only categories

**Use Case:** Downtown location hides "Family Packs" category (no demand), adds "Office Lunch Specials"

---

#### **Business Settings**
**Global:**
- Accepted payment methods
- Loyalty program structure
- Customer support contacts

**Location Override:**
- ✅ Delivery fee (urban vs suburban)
- ✅ Minimum order amount
- ✅ Order lead time
- ✅ Peak hour surcharges

---

#### **Subscription Plans** (Tiffin Service)
**Global:**
- Available subscription tiers
- Base pricing
- Plan features

**Location Override:**
- ✅ Enable/disable plans
- ✅ Adjust pricing for local market
- ✅ Delivery frequency options
- ✅ Available meal count options

**Example:**
- Corporate: 5-day plan @ $99/week
- NYC location: 5-day plan @ $119/week (higher costs)
- Small town: 5-day plan disabled (no demand)

---

## Franchise Model Considerations

### **Corporate-Owned Locations**
- Full control of all settings
- Can push updates to all locations
- Centralized menu management

### **Franchise Locations**
- Franchisees get more local control
- Corporate sets mandatory standards (brand colors, core menu)
- Franchisees can adjust prices within approved ranges (e.g., ±15%)
- Franchisees create local promotions
- Corporate approves major menu changes

### **Permission Levels**
```typescript
enum LocationPermission {
  CORPORATE_ADMIN = "full_control",
  FRANCHISE_OWNER = "local_control_with_restrictions",
  STORE_MANAGER = "operational_only",
  STAFF = "view_only"
}
```

### **Restrictions for Franchisees**
```typescript
interface FranchiseRestrictions {
  canChangeBranding: boolean; // Usually false
  canAddMenuItems: boolean; // Usually false
  canModifyPrices: boolean; // Usually true
  priceAdjustmentRange: { min: number, max: number }; // e.g., -10% to +20%
  canCreatePromotions: boolean; // Usually true
  requiresCorporateApproval: string[]; // ['menu_changes', 'major_promotions']
}
```

---

## Implementation Plan

### **Phase 1: Data Structure Updates**
- [ ] Add `locationOverrides` to MenuItem interface
- [ ] Add `scope` and `priority` to Promotion interface
- [ ] Add `categoryOverrides` to Category interface
- [ ] Add `franchiseRestrictions` to Location interface

### **Phase 2: Admin UI Updates**
- [ ] Add "Override at Location" buttons in menu management
- [ ] Add location selector when creating items
- [ ] Add "Apply to All Locations" vs "This Location Only" toggles
- [ ] Add pricing override interface per location

### **Phase 3: Customer Experience**
- [ ] Filter menu items by selected location
- [ ] Apply location-specific pricing
- [ ] Show location-specific promotions first
- [ ] Handle unavailable items gracefully

### **Phase 4: Reporting**
- [ ] Location-level sales reports
- [ ] Compare performance across locations
- [ ] Track location-specific promotions ROI
- [ ] Inventory management per location

---

## Best Practices

### **For Corporate Teams**
1. Set sensible defaults that work for 80% of locations
2. Allow overrides for the 20% edge cases
3. Monitor location-specific changes for quality control
4. Push updates to all locations for brand consistency
5. Require approval for major deviations

### **For Franchise Owners**
1. Respect corporate brand standards
2. Adjust pricing based on local market conditions
3. Create promotions that resonate locally
4. Report customer feedback to corporate
5. Test local menu variations (with approval)

### **For Customers**
1. Always see accurate prices for selected location
2. Only see items available at chosen location
3. Clear indication of location-specific deals
4. Consistent brand experience across locations
5. Local contact info for support

---

## Technical Considerations

### **Data Synchronization**
- Corporate pushes menu updates → All locations receive
- Locations update overrides → Stored separately, not synced
- Conflict resolution: Location overrides always win

### **Caching Strategy**
- Cache global menu structure
- Cache location-specific overrides separately
- Invalidate cache when corporate pushes updates
- TTL: 5 minutes for menu, 1 hour for promotions

### **Database Schema**
```sql
-- Global menu items
menu_items (id, name, description, base_price, image, ...)

-- Location-specific overrides
menu_item_overrides (
  location_id, 
  menu_item_id, 
  price_override,
  is_available,
  ...
)

-- Query: Get effective menu for location
SELECT 
  mi.*,
  COALESCE(mio.price_override, mi.base_price) as price,
  COALESCE(mio.is_available, true) as is_available
FROM menu_items mi
LEFT JOIN menu_item_overrides mio 
  ON mi.id = mio.menu_item_id 
  AND mio.location_id = ?
```

---

## Future Enhancements

1. **Menu Templates**: Create menu templates for different location types (mall, standalone, food court)
2. **Seasonal Menus**: Auto-enable/disable items based on season per location
3. **Dynamic Pricing**: Adjust prices based on demand, time of day, inventory
4. **A/B Testing**: Test different promotions across locations
5. **Predictive Inventory**: Suggest menu item availability based on historical data
6. **Multi-Brand Support**: Manage multiple brands under one system (e.g., Taco Bell + KFC)
