# Combo Meals & Upselling Strategy

## Overview

This document explains the combo meal and upselling/cross-selling system implemented in the QSR platform.

## Features

### 1. Combo Meals

**What it is:** Bundle multiple menu items together at a discounted price

**Use Cases:**
- Value meals (burger + fries + drink)
- Family bundles (2 pizzas + wings + soda)
- Lunch specials
- Promotional packages

**Key Features:**
- Automatic savings calculation
- Component item tracking
- Individual item requirements
- Popularity tagging
- Active/inactive status

**Example:**
```typescript
{
  name: 'Burger Meal Deal',
  description: 'Burger + Fries + Drink',
  items: [
    { id: 'm1', name: 'Classic Cheeseburger', required: true },
    { id: 'm5', name: 'French Fries', required: true },
    { id: 'm6', name: 'Soft Drink', required: true }
  ],
  regularPrice: 15.97,
  comboPrice: 12.99,
  savings: 2.98
}
```

### 2. Upselling

**What it is:** Suggest premium or larger versions of selected items

**Types:**
- **Size Upgrades** - "Make it a Large for $2 more"
- **Premium Versions** - "Upgrade to Deluxe with bacon"
- **Add-ons** - "Add extra cheese for $1"

**Use Cases:**
- When customer adds regular burger, suggest double patty
- When customer selects small pizza, offer large size
- When customer picks basic item, show premium alternative

**Example:**
```typescript
{
  itemId: 'm1',
  itemName: 'Classic Cheeseburger',
  upsells: [
    {
      type: 'size_upgrade',
      title: 'Make it a Double',
      description: 'Double patty for just $3 more',
      priceIncrease: 3.00,
      targetItemId: 'm2'
    }
  ]
}
```

### 3. Cross-selling ("Goes With")

**What it is:** Recommend complementary items that pair well together

**Use Cases:**
- Burger → Suggest fries and drink
- Pizza → Suggest garlic bread and salad
- Sandwich → Suggest chips and beverage

**Key Features:**
- Reason for recommendation ("Classic pairing", "Popular add-on")
- Optional bundle discount
- Shows as "Frequently Bought Together"

**Example:**
```typescript
{
  itemId: 'm1',
  itemName: 'Classic Cheeseburger',
  recommendations: [
    { 
      id: 'm5', 
      name: 'French Fries', 
      reason: 'Classic pairing', 
      discount: 0.50 // $0.50 off when added together
    },
    { 
      id: 'm6', 
      name: 'Soft Drink', 
      reason: 'Complete your meal', 
      discount: 0.30 
    }
  ]
}
```

## Admin Interface

### Tab Navigation

The Menu Management page now has three tabs:

1. **Menu Items** - Standard menu management with location overrides
2. **Combo Meals** - Create and manage combo packages
3. **Upselling & Cross-sell** - Configure upsell rules and recommendations

### Combo Management

**Features:**
- Visual list of all combos
- Shows component items with package icon
- Displays savings amount prominently
- Edit/delete functionality
- Popular tag for high-performing combos

**Creating a Combo:**
1. Click "Create Combo" button
2. Enter combo name and description
3. Select component items (mark as required/optional)
4. Set individual and combo pricing
5. System auto-calculates savings
6. Toggle active/inactive status

### Upselling Configuration

**Two Sub-tabs:**

#### Upsells Tab
- Lists all items with configured upsell rules
- Shows suggested upgrades per item
- Displays price increase
- Type badges (Size Upgrade / Premium Version)

#### Goes With Tab  
- Shows cross-sell recommendations per item
- Grid layout with item cards
- Displays recommendation reason
- Shows bundle discounts

**Best Practices:**
- Set upsells for your most popular items
- Keep price increases reasonable (20-40% range)
- Use clear, benefit-focused descriptions
- Test different offers to see what converts

## Customer Experience

### When Customer Adds Item:

1. **Upsell Prompt Shows:**
   ```
   ⬆️ Upgrade Your Order
   
   Make it a Double
   Double patty for just $3 more
   [Yes, Upgrade] [No Thanks]
   ```

2. **Cross-sell Suggestions Display:**
   ```
   🤝 Frequently Bought Together
   
   [Image] French Fries - $3.49
   Classic pairing • Save $0.50
   [Add to Cart]
   
   [Image] Soft Drink - $1.69
   Complete your meal • Save $0.30
   [Add to Cart]
   ```

3. **Combo Badge on Menu:**
   ```
   Burger Meal Deal
   Burger + Fries + Drink
   
   $15.97 → $12.99
   SAVE $2.98!
   ```

## Business Benefits

### Increased Revenue
- **Higher Average Order Value (AOV)** - Combos and upsells increase ticket size
- **Attachment Rate** - Cross-sells drive additional item purchases
- **Premium Mix** - Upsells move customers to higher-margin items

### Operational Efficiency
- **Simplified Ordering** - Combos reduce customization time
- **Inventory Management** - Bundle slow-moving items with popular ones
- **Staff Training** - Automated suggestions replace manual upselling

### Customer Benefits
- **Value Perception** - Savings clearly displayed
- **Convenience** - Pre-configured bundles save decision time
- **Discovery** - Learn about items they might not have considered

## Revenue Impact Examples

### Scenario 1: Combo Meal
- Base order: $8.99 burger only
- With combo: $12.99 (burger + fries + drink)
- **Uplift: +44% per order**

### Scenario 2: Upsell
- Base order: $8.99 regular burger
- With upsell: $11.99 deluxe burger
- **Uplift: +33% per order**

### Scenario 3: Cross-sell
- Base order: $8.99 burger
- Add fries ($3.49) + drink ($1.69) = $14.17
- **Uplift: +58% per order**

### Combined Strategy
- Start: $8.99 burger
- Upsell to deluxe: $11.99
- Add combo sides: +$3.50 (discounted)
- **Final order: $15.49 (+72%)**

## Implementation Roadmap

### Phase 1: Admin Setup ✅ COMPLETE
- [x] Data structures for combos, upsells, cross-sells
- [x] Admin UI with tab navigation
- [x] List/view functionality
- [x] Demo data

### Phase 2: Customer Display (Next)
- [ ] Combo cards on menu page
- [ ] Upsell modal on add-to-cart
- [ ] "Goes with" section in item details
- [ ] Bundle discount calculations

### Phase 3: Advanced Features
- [ ] A/B testing for upsell messages
- [ ] Analytics dashboard (conversion rates)
- [ ] Dynamic pricing based on time/location
- [ ] AI-powered recommendations

### Phase 4: Optimization
- [ ] Performance tracking
- [ ] Personalized suggestions
- [ ] Seasonal combo automation
- [ ] Bulk editing tools

## Technical Details

### Data Models

```typescript
// Combo Structure
interface Combo {
  id: string;
  name: string;
  description: string;
  items: Array<{
    id: string;
    name: string;
    required: boolean;
  }>;
  regularPrice: number;
  comboPrice: number;
  savings: number;
  available: boolean;
  popular: boolean;
}

// Upsell Structure
interface Upsell {
  itemId: string;
  upsells: Array<{
    id: string;
    type: 'size_upgrade' | 'premium_version' | 'addon';
    title: string;
    description: string;
    priceIncrease: number;
    targetItemId?: string;
  }>;
}

// Cross-sell Structure
interface CrossSell {
  itemId: string;
  recommendations: Array<{
    id: string;
    name: string;
    reason: string;
    discount: number;
  }>;
}
```

### Location Support

All three features respect the multi-location architecture:

- **Combos** - Can set different pricing per location
- **Upsells** - Price increases adjust for location-specific base prices
- **Cross-sells** - Recommendations filter based on location availability

### Integration Points

1. **Menu Display** - Combo badges and indicators
2. **Cart Flow** - Upsell prompts on add-to-cart
3. **Item Details** - Cross-sell recommendations
4. **Checkout** - Combo discounts applied
5. **Analytics** - Track conversion rates

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Attachment Rate**
   - % of orders with upsold items
   - % of orders with cross-sold items
   - Target: 30-40%

2. **Average Order Value (AOV)**
   - Baseline AOV vs. with combos/upsells
   - Target: +20-30% increase

3. **Combo Take Rate**
   - % of customers choosing combos vs. individual items
   - Target: 40-50% for popular combos

4. **Conversion Rate**
   - % of upsell prompts accepted
   - Target: 15-25%

### A/B Testing Ideas

- Test different upsell message wording
- Compare discount amounts for cross-sells
- Try different combo bundle compositions
- Test placement of recommendations

## Best Practices

### Do's ✅
- Keep combo savings meaningful (15-20% off)
- Limit upsell options to 2-3 per item
- Use action-oriented language ("Make it a Double!")
- Show clear value ("Save $2.98!")
- Test and iterate based on data

### Don'ts ❌
- Don't overwhelm with too many options
- Don't make upsells too expensive
- Don't show unavailable items
- Don't ignore mobile experience
- Don't forget to track performance

## Support & Documentation

- Admin UI: http://localhost:3002/menu
- Customer Menu: http://localhost:3000/menu
- Architecture Docs: `/docs/MULTI_LOCATION_ARCHITECTURE.md`
- API Documentation: Coming soon

## Questions?

Contact the development team for:
- Custom combo configurations
- Advanced upselling rules
- Analytics setup
- Integration support
