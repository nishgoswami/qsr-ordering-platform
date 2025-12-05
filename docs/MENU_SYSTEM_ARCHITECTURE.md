# Menu System Architecture

## Overview
The menu system is now designed to be **completely flexible** with no hardcoded data. All categories, products, modifiers, and subscription plans are configured through the admin portal during restaurant setup.

## Key Features

### 1. **Flexible Category System**
- Admin creates categories dynamically
- Each category can be:
  - **Standard** - Regular menu items (food, drinks, etc.)
  - **Subscription** - Subscription-based services (tiffin service, meal plans)

### 2. **Reusable Modifier Groups** (Choices & Addons)
- Create modifier groups once, apply to multiple items/categories
- Two types:
  - **Radio (Single Choice)** - Size, Spice Level, etc.
  - **Checkbox (Multiple Choice)** - Extras, Toppings, Removals, etc.
- Each option can have:
  - Price (add-on cost or free)
  - Default selection flag
  - Required/Optional setting

### 3. **Product Management**
- Each menu item can have:
  - Base price (one-time purchase)
  - Optional subscription plans
  - Custom modifiers (inherited from category or item-specific)
  - Images, ratings, dietary flags
  - Availability status

### 4. **Subscription Support**
- Special category type for tiffin/meal subscription services
- Each subscription item can offer multiple plans:
  - **Daily** - Single day delivery
  - **Weekly** - 5-7 days
  - **Monthly** - 20-30 days
- Customer can choose:
  - One-time purchase (single meal)
  - Subscription plan (recurring delivery)
  - Start date (when to begin subscription)

## Data Structure

### Restaurant Configuration
```typescript
interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;      // e.g., "25-35"
  deliveryFee: number;
  isOpen: boolean;
}
```

### Categories
```typescript
interface Category {
  id: string;
  name: string;
  icon?: string;             // Emoji or icon identifier
  sortOrder: number;
  isActive: boolean;
  categoryType: 'standard' | 'subscription';
}
```

**Example Categories:**
- Standard: Burgers, Pizza, Salads, Desserts
- Subscription: Tiffin Service, Meal Plans

### Modifier Groups
```typescript
interface ModifierGroup {
  id: string;
  name: string;              // e.g., "Size", "Extras", "Tiffin Top Ups"
  type: 'radio' | 'checkbox';
  required: boolean;
  minSelections?: number;    // For checkbox groups
  maxSelections?: number;    // For checkbox groups
  options: ModifierOption[];
}

interface ModifierOption {
  id: string;
  name: string;              // e.g., "Large", "Extra Cheese"
  price: number;             // Additional cost (0 for free)
  isDefault?: boolean;       // Pre-selected
}
```

**Example Modifier Groups:**

```typescript
// Size Selection (Radio - Required)
{
  name: "Size",
  type: "radio",
  required: true,
  options: [
    { name: "Regular", price: 0, isDefault: true },
    { name: "Large", price: 3.00 },
    { name: "Extra Large", price: 5.00 }
  ]
}

// Extras (Checkbox - Optional)
{
  name: "Extras",
  type: "checkbox",
  required: false,
  options: [
    { name: "Extra Cheese", price: 1.50 },
    { name: "Bacon", price: 2.50 },
    { name: "Avocado", price: 2.00 }
  ]
}

// Tiffin Top Ups (Checkbox - Optional)
{
  name: "Tiffin Top Ups",
  type: "checkbox",
  required: false,
  options: [
    { name: "Extra Roti (2 pcs)", price: 2.00 },
    { name: "Extra Rice", price: 3.00 },
    { name: "Papad (2 pcs)", price: 1.50 },
    { name: "Pickle", price: 1.00 }
  ]
}

// Remove Items (Checkbox - Optional)
{
  name: "Remove Items",
  type: "checkbox",
  required: false,
  options: [
    { name: "No Onions", price: 0 },
    { name: "No Tomato", price: 0 },
    { name: "No Lettuce", price: 0 }
  ]
}

// Cutlery (Checkbox - Optional)
{
  name: "Cutlery",
  type: "checkbox",
  required: false,
  options: [
    { name: "Include Cutlery", price: 0, isDefault: true },
    { name: "Extra Napkins", price: 0 }
  ]
}

// Spice Level (Radio - Required for Indian items)
{
  name: "Spice Level",
  type: "radio",
  required: true,
  options: [
    { name: "Mild", price: 0, isDefault: true },
    { name: "Medium", price: 0 },
    { name: "Hot", price: 0 },
    { name: "Extra Hot", price: 0 }
  ]
}
```

### Menu Items
```typescript
interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;              // Base price (one-time)
  imageUrl?: string;
  imageFallback?: string;     // Emoji fallback
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isVegetarian: boolean;
  isVegan?: boolean;
  isAvailable: boolean;
  sortOrder: number;
  
  // Subscription support
  isSubscriptionItem: boolean;
  subscriptionPlans?: SubscriptionPlan[];
  
  // Modifiers (links to modifier groups)
  modifierGroupIds: string[];
}
```

### Subscription Plans
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;                    // e.g., "Daily", "20 Days", "30 Days"
  durationDays: number;            // 1, 20, 30, etc.
  price: number;                   // Total price for the plan
  deliveryDays?: string[];         // ["Mon", "Tue", "Wed", "Thu", "Fri"]
  description?: string;            // "Mon-Fri delivery"
}
```

**Example: Tiffin Service Item**
```typescript
{
  name: "Regular Tiffin",
  description: "4 Roti • 1 Sabzi (8 oz) • 1 Dal (8 oz) • 1 Rice (8 oz)",
  price: 9.99,                     // One-time purchase price
  isSubscriptionItem: true,
  subscriptionPlans: [
    {
      name: "Daily (Single Day)",
      durationDays: 1,
      price: 9.99,
      description: "One-time delivery"
    },
    {
      name: "20 Days (Mon-Fri)",
      durationDays: 20,
      price: 180.00,
      deliveryDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      description: "20 weekdays delivery"
    },
    {
      name: "30 Days (Mon-Sun)",
      durationDays: 30,
      price: 270.00,
      deliveryDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      description: "Full month delivery"
    }
  ],
  modifierGroupIds: ["spiceLevel", "tiffinTopUps", "cutlery"]
}
```

## Admin Setup Flow

### Step 1: Restaurant Basics
- Restaurant name
- Delivery time estimate
- Delivery fee
- Operating hours

### Step 2: Create Modifier Groups (Choices & Addons)
Admin creates reusable modifier groups:
1. Click "Add Group"
2. Enter group name ("Size", "Extras", "Tiffin Top Ups")
3. Choose type (Radio or Checkbox)
4. Mark as required/optional
5. Add options with prices
6. Save

**Example:**
```
Group: "Extras"
Type: Checkbox (Multiple Selection)
Required: No

Options:
  - Extra Cheese (+$1.50)
  - Bacon (+$2.50)
  - Avocado (+$2.00)
  - Fried Egg (+$2.00)
```

### Step 3: Create Categories
1. Click "Add Category"
2. Enter category name
3. Choose type:
   - **Standard** - Regular menu items
   - **Subscription** - For tiffin/subscription services
4. Select icon (emoji picker)
5. Set sort order
6. Save

**Example:**
```
Category: "Tiffin Service"
Type: Subscription
Icon: 🍱
Sort Order: 1
```

### Step 4: Add Products
For each product:
1. Select category
2. Enter name, description
3. Upload image or select emoji
4. Set base price
5. Mark dietary flags (vegetarian, vegan, etc.)
6. **If subscription item:**
   - Toggle "Subscription Item"
   - Add subscription plans:
     - Plan name
     - Duration (days)
     - Price
     - Delivery days (optional)
7. **Assign Modifiers:**
   - Select applicable modifier groups
   - Order matters (displayed top to bottom)
8. Save

**Example: Regular Tiffin**
```
Name: "Regular Tiffin"
Description: "4 Roti • 1 Sabzi • 1 Dal • 1 Rice"
Category: Tiffin Service
Base Price: $9.99
Is Subscription Item: Yes

Subscription Plans:
  1. Daily - 1 day - $9.99
  2. 20 Days - 20 days - $180 (Mon-Fri)
  3. 30 Days - 30 days - $270 (All days)

Modifiers:
  - Spice Level (required)
  - Tiffin Top Ups (optional)
  - Cutlery (optional)
```

## Customer Order Flow

### Standard Item (e.g., Burger)
1. Browse menu → Click item
2. Card expands inline
3. Select modifiers:
   - Size: Regular / Large / Extra Large
   - Extras: Check desired add-ons
   - Remove: Check items to exclude
   - Special instructions: Text field
4. Adjust quantity (1, 2, 3...)
5. Click "Add to Cart · $XX.XX"
6. Item added with all customizations

### Subscription Item (e.g., Tiffin)
1. Browse menu → Click tiffin item
2. Card expands inline
3. **Choose order type:**
   - **One-Time Order** - $9.99 (single delivery)
   - **Subscription** - Save more (recurring)
4. **If Subscription selected:**
   - Choose plan:
     - ○ Daily - $9.99
     - ○ 20 Days (Mon-Fri) - $180
     - ○ 30 Days (All days) - $270
   - Select start date (optional)
5. Select modifiers (Spice Level, Top Ups, etc.)
6. Special instructions
7. Click "Subscribe · $180.00" or "Add to Cart · $9.99"
8. Item added to cart with subscription details

## Cart Display

### Regular Items
```
🍔 Classic Burger
Size: Large, Extras: Bacon, Avocado
No Onions
$17.99 × 2 = $35.98
```

### Subscription Items
```
🍱 Regular Tiffin
📅 20 Days (Mon-Fri)
Spice Level: Medium
Extra Roti, Extra Rice
$180.00 × 1 = $180.00
```

## Database Schema Mapping

### Supabase Tables

```sql
-- categories
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  category_type TEXT CHECK (category_type IN ('standard', 'subscription')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- modifier_groups
CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('radio', 'checkbox')),
  required BOOLEAN DEFAULT false,
  min_selections INTEGER,
  max_selections INTEGER,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- modifier_options
CREATE TABLE modifier_options (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- menu_items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  image_fallback TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  is_subscription_item BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- subscription_plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delivery_days JSONB,  -- ["Mon", "Tue", "Wed"]
  description TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- item_modifiers (junction table)
CREATE TABLE item_modifiers (
  id UUID PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  modifier_group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(menu_item_id, modifier_group_id)
);

-- category_modifiers (apply modifiers to all items in category)
CREATE TABLE category_modifiers (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  modifier_group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, modifier_group_id)
);
```

## Benefits of This Architecture

### 1. **Complete Flexibility**
- No hardcoded data - works for any restaurant type
- Admin controls everything via portal
- Easy to add new categories/items/modifiers

### 2. **Reusability**
- Create modifier groups once, use everywhere
- Apply at category level (all items inherit)
- Override at item level when needed

### 3. **Subscription Support**
- Native support for tiffin/meal subscriptions
- Flexible plan structures (daily, weekly, monthly)
- Customer chooses one-time or subscription

### 4. **Scalability**
- Works for small restaurants (5-10 items)
- Works for large chains (100+ items)
- Easy to manage as business grows

### 5. **Future-Ready**
- Mobile app uses same data structure
- API endpoints return structured JSON
- Easy to add features (combos, deals, etc.)

## Next Steps

1. **Admin Portal Development**
   - Build modifier group management UI
   - Build category management UI
   - Build product management UI with subscription support
   - Build preview & testing interface

2. **Database Setup**
   - Create Supabase tables with above schema
   - Set up Row Level Security (RLS) policies
   - Create indexes for performance

3. **API Integration**
   - Replace empty data arrays with Supabase queries
   - Add real-time updates (when admin changes menu)
   - Add image upload to Supabase Storage

4. **Mobile App**
   - Use same TypeScript interfaces
   - Reuse MenuItemCard logic
   - Native subscription management

## Example Use Cases

### Use Case 1: Pizza Restaurant
**Categories:** Appetizers, Pizzas, Pasta, Salads, Desserts, Drinks

**Modifier Groups:**
- Size (Radio): Personal, Medium, Large, Extra Large
- Crust (Radio): Thin, Thick, Stuffed
- Toppings (Checkbox): Pepperoni, Mushrooms, Olives, etc.
- Remove (Checkbox): No Cheese, No Sauce, etc.

### Use Case 2: Indian Restaurant with Tiffin Service
**Categories:** Appetizers, Curries, Breads, Rice, Tiffin Service

**Tiffin Service Items:**
- Regular Tiffin ($9.99)
  - Plans: Daily ($9.99), 20 Days ($180), 30 Days ($270)
  - Modifiers: Spice Level, Tiffin Top Ups, Cutlery
- Premium Tiffin ($12.99)
  - Plans: Daily ($12.99), 20 Days ($240), 30 Days ($360)
  - Modifiers: Spice Level, Tiffin Top Ups, Cutlery

### Use Case 3: Cafe
**Categories:** Coffee, Tea, Pastries, Sandwiches

**Modifier Groups:**
- Size (Radio): Small, Medium, Large
- Milk (Radio): Whole, Skim, Almond, Oat, Soy
- Extras (Checkbox): Extra Shot, Whipped Cream, Flavor Shot
- Temperature (Radio): Hot, Iced

---

**Version:** 2.0  
**Last Updated:** November 29, 2025  
**Status:** Empty State Ready - Awaiting Admin Setup
