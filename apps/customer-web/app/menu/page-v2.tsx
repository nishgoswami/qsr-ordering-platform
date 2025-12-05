'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, Clock, Search, Star, ChevronLeft, MapPin, Calendar } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS - Matches Admin Portal Structure
// ============================================================================

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  isOpen: boolean;
}

interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: ModifierOption[];
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  categoryType: 'standard' | 'subscription';
}

interface SubscriptionPlan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  deliveryDays?: string[];
  description?: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  imageFallback?: string;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isVegetarian: boolean;
  isVegan?: boolean;
  isAvailable: boolean;
  sortOrder: number;
  isSubscriptionItem: boolean;
  subscriptionPlans?: SubscriptionPlan[];
  modifierGroupIds: string[];
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  finalPrice: number;
  quantity: number;
  image: string;
  selectedModifiers: Record<string, string[]>;
  instructions?: string;
  isSubscription: boolean;
  subscriptionPlan?: {
    id: string;
    name: string;
    durationDays: number;
    startDate?: string;
  };
}

// ============================================================================
// EMPTY DATA STRUCTURES - To be populated by Admin Setup
// ============================================================================

// Will be fetched from Supabase
const RESTAURANT_DATA: Restaurant = {
  id: '',
  name: 'Setup Required',
  rating: 0,
  reviewCount: 0,
  deliveryTime: '30-45',
  deliveryFee: 0,
  isOpen: false,
};

// Empty arrays - Admin populates via setup wizard
const MODIFIER_GROUPS_DATA: ModifierGroup[] = [];
const CATEGORIES_DATA: Category[] = [];
const MENU_ITEMS_DATA: MenuItem[] = [];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Check if restaurant setup is complete
  const isSetupComplete = CATEGORIES_DATA.length > 0 && MENU_ITEMS_DATA.length > 0;

  const setExpanded = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const addToCart = (item: MenuItem, customization?: any) => {
    const modifierPrice = customization?.priceBreakdown?.modifiers || 0;
    const finalPrice = item.price + modifierPrice;

    const newItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      finalPrice: finalPrice,
      quantity: customization?.quantity || 1,
      image: item.imageUrl || item.imageFallback || '🍽️',
      selectedModifiers: customization?.selections || {},
      instructions: customization?.instructions,
      isSubscription: customization?.isSubscription || false,
      subscriptionPlan: customization?.subscriptionPlan,
    };

    setCart([...cart, newItem]);
    setExpandedItem(null);
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(cart.map(item => 
      item.id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const filteredItems = MENU_ITEMS_DATA.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  // Empty state when setup not complete
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Setup Required</h1>
          <p className="text-gray-600 mb-6">
            Please complete your restaurant setup to start accepting orders. Configure your categories, menu items, and customization options in the admin portal.
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition">
            Go to Admin Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Go back">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition shadow-md"
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{RESTAURANT_DATA.name}</h1>
            {RESTAURANT_DATA.reviewCount > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{RESTAURANT_DATA.rating}</span>
                  <span>({RESTAURANT_DATA.reviewCount}+)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{RESTAURANT_DATA.deliveryTime} min</span>
                </div>
                <span>•</span>
                <span>${RESTAURANT_DATA.deliveryFee} delivery</span>
              </div>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Items
            </button>
            {CATEGORIES_DATA.filter(c => c.isActive).map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                {category.name}
                {category.categoryType === 'subscription' && (
                  <Calendar className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              modifierGroups={MODIFIER_GROUPS_DATA.filter(g => 
                item.modifierGroupIds.includes(g.id)
              )}
              isExpanded={expandedItem === item.id}
              onToggle={() => setExpanded(item.id)}
              onAddToCart={(customization) => addToCart(item, customization)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No items found</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-end">
          <div className="bg-white w-full md:w-96 md:h-full md:rounded-l-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-full animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-sm text-gray-500">{cartItemCount} items</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="py-4 border-b">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                          {item.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500">${item.finalPrice.toFixed(2)} each</p>
                          
                          {item.isSubscription && item.subscriptionPlan && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full w-fit">
                              <Calendar className="w-3 h-3" />
                              <span>{item.subscriptionPlan.name}</span>
                            </div>
                          )}
                          
                          {Object.keys(item.selectedModifiers).length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              {Object.entries(item.selectedModifiers).map(([group, options]) => (
                                <div key={group}>{options.join(', ')}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t px-6 py-5 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery fee</span>
                    <span className="font-semibold">${RESTAURANT_DATA.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${(cartTotal + RESTAURANT_DATA.deliveryFee).toFixed(2)}</span>
                  </div>
                </div>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl active:scale-95">
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {cartItemCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-6 left-4 right-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between z-30 font-bold transition active:scale-95"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span>{cartItemCount} items</span>
          </div>
          <span className="text-lg">${cartTotal.toFixed(2)}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MENU ITEM CARD COMPONENT
// ============================================================================

function MenuItemCard({
  item,
  modifierGroups,
  isExpanded,
  onToggle,
  onAddToCart,
}: {
  item: MenuItem;
  modifierGroups: ModifierGroup[];
  isExpanded: boolean;
  onToggle: () => void;
  onAddToCart: (customization: any) => void;
}) {
  const [selections, setSelections] = useState<Record<string, string | string[]>>(() => {
    const initial: Record<string, string | string[]> = {};
    modifierGroups.forEach(group => {
      if (group.type === 'radio' && group.required) {
        const defaultOption = group.options.find(o => o.isDefault) || group.options[0];
        initial[group.id] = defaultOption?.id || '';
      } else if (group.type === 'checkbox') {
        initial[group.id] = group.options.filter(o => o.isDefault).map(o => o.id);
      } else {
        initial[group.id] = '';
      }
    });
    return initial;
  });

  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Subscription state
  const [selectedPlanId, setSelectedPlanId] = useState(
    item.subscriptionPlans?.[0]?.id || ''
  );
  const [orderType, setOrderType] = useState<'one-time' | 'subscription'>(
    item.isSubscriptionItem ? 'subscription' : 'one-time'
  );
  const [startDate, setStartDate] = useState('');

  const calculatePrice = () => {
    let basePrice = item.price;

    // If subscription selected, use subscription plan price
    if (orderType === 'subscription' && selectedPlanId) {
      const plan = item.subscriptionPlans?.find(p => p.id === selectedPlanId);
      if (plan) basePrice = plan.price;
    }

    let modifierTotal = 0;
    modifierGroups.forEach(group => {
      if (group.type === 'radio') {
        const selectedId = selections[group.id] as string;
        const option = group.options.find(opt => opt.id === selectedId);
        if (option) modifierTotal += option.price;
      } else if (group.type === 'checkbox') {
        const selectedIds = selections[group.id] as string[];
        selectedIds?.forEach(id => {
          const option = group.options.find(opt => opt.id === id);
          if (option) modifierTotal += option.price;
        });
      }
    });

    // For subscriptions, don't multiply by quantity (it's a plan)
    if (orderType === 'subscription') {
      return basePrice + modifierTotal;
    }

    return (basePrice + modifierTotal) * quantity;
  };

  const totalPrice = calculatePrice();

  const handleRadioChange = (groupId: string, optionId: string) => {
    setSelections(prev => ({ ...prev, [groupId]: optionId }));
  };

  const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean) => {
    setSelections(prev => {
      const current = (prev[groupId] as string[]) || [];
      return {
        ...prev,
        [groupId]: checked
          ? [...current, optionId]
          : current.filter(id => id !== optionId),
      };
    });
  };

  const handleAddToCart = () => {
    const selectedModifiersFormatted: Record<string, string[]> = {};
    let modifierTotal = 0;

    modifierGroups.forEach(group => {
      if (group.type === 'radio') {
        const selectedId = selections[group.id] as string;
        const option = group.options.find(opt => opt.id === selectedId);
        if (option) {
          selectedModifiersFormatted[group.name] = [option.name];
          modifierTotal += option.price;
        }
      } else if (group.type === 'checkbox') {
        const selectedIds = (selections[group.id] as string[]) || [];
        const selectedOptions = selectedIds
          .map(id => group.options.find(opt => opt.id === id))
          .filter(Boolean);
        if (selectedOptions.length > 0) {
          selectedModifiersFormatted[group.name] = selectedOptions.map(opt => opt!.name);
          selectedOptions.forEach(opt => (modifierTotal += opt!.price));
        }
      }
    });

    const customization: any = {
      quantity: orderType === 'subscription' ? 1 : quantity,
      instructions,
      selections: selectedModifiersFormatted,
      priceBreakdown: {
        base: item.price,
        modifiers: modifierTotal,
      },
      isSubscription: orderType === 'subscription',
    };

    if (orderType === 'subscription' && selectedPlanId) {
      const plan = item.subscriptionPlans?.find(p => p.id === selectedPlanId);
      if (plan) {
        customization.subscriptionPlan = {
          id: plan.id,
          name: plan.name,
          durationDays: plan.durationDays,
          startDate: startDate || new Date().toISOString().split('T')[0],
        };
      }
    }

    onAddToCart(customization);
  };

  const hasModifiers = modifierGroups.length > 0 || item.isSubscriptionItem;
  const image = item.imageUrl || item.imageFallback || '🍽️';

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
        isExpanded ? 'md:col-span-2 lg:col-span-3 shadow-xl ring-2 ring-orange-500' : 'hover:shadow-lg'
      }`}
    >
      <div className="cursor-pointer" onClick={!isExpanded ? onToggle : undefined}>
        <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden">
          <span className="text-8xl">{image}</span>
          {item.isPopular && (
            <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-current" />
              Popular
            </div>
          )}
          {item.isVegetarian && (
            <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              🌱 Veg
            </div>
          )}
          {item.isSubscriptionItem && (
            <div className="absolute bottom-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Subscription
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900 flex-1">{item.name}</h3>
            {item.rating > 0 && (
              <div className="flex items-center gap-1 text-sm flex-shrink-0 ml-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{item.rating}</span>
              </div>
            )}
          </div>

          <p className={`text-sm text-gray-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
            {item.description}
          </p>

          {!isExpanded && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-2xl font-bold text-gray-900">
                ${item.price.toFixed(2)}
                {item.isSubscriptionItem && <span className="text-sm text-gray-500 font-normal">/plan</span>}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasModifiers) {
                    onToggle();
                  } else {
                    onAddToCart({ quantity: 1 });
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {hasModifiers ? 'Customize' : 'Add'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && hasModifiers && (
        <div className="border-t bg-gray-50 p-5 space-y-5">
          {/* Order Type Selection (for subscription items) */}
          {item.isSubscriptionItem && item.subscriptionPlans && item.subscriptionPlans.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Order Type</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOrderType('one-time')}
                  className={`p-4 border-2 rounded-xl text-center transition ${
                    orderType === 'one-time'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 bg-white'
                  }`}
                >
                  <div className="font-semibold">One-Time Order</div>
                  <div className="text-sm text-gray-600">${item.price.toFixed(2)}</div>
                </button>
                <button
                  onClick={() => setOrderType('subscription')}
                  className={`p-4 border-2 rounded-xl text-center transition ${
                    orderType === 'subscription'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 bg-white'
                  }`}
                >
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Subscription
                  </div>
                  <div className="text-sm text-gray-600">Save more</div>
                </button>
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          {orderType === 'subscription' && item.subscriptionPlans && item.subscriptionPlans.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3">
                Choose Plan <span className="text-sm font-normal text-red-600">(Required)</span>
              </h4>
              <div className="space-y-2">
                {item.subscriptionPlans.map(plan => (
                  <label
                    key={plan.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                      selectedPlanId === plan.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="subscription-plan"
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="w-4 h-4 text-orange-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{plan.name}</div>
                        {plan.description && (
                          <div className="text-xs text-gray-500">{plan.description}</div>
                        )}
                        {plan.deliveryDays && (
                          <div className="text-xs text-gray-500 mt-1">
                            {plan.deliveryDays.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${plan.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>

              {/* Start Date */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Modifier Groups */}
          {modifierGroups.map(group => (
            <div key={group.id}>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                {group.name}
                {group.required && <span className="text-sm font-normal text-red-600">(Required)</span>}
              </h4>

              {group.type === 'radio' ? (
                <div className="space-y-2">
                  {group.options.map(option => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                        selections[group.id] === option.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={group.id}
                          checked={selections[group.id] === option.id}
                          onChange={() => handleRadioChange(group.id, option.id)}
                          className="w-4 h-4 text-orange-600"
                        />
                        <span className="font-semibold text-gray-900">{option.name}</span>
                      </div>
                      {option.price > 0 && (
                        <span className="text-sm font-semibold text-gray-600">
                          +${option.price.toFixed(2)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {group.options.map(option => {
                    const isSelected = ((selections[group.id] as string[]) || []).includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleCheckboxChange(group.id, option.id, e.target.checked)}
                            className="w-4 h-4 text-orange-600 rounded"
                          />
                          <span className="font-semibold text-gray-900">{option.name}</span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-sm font-semibold text-gray-600">
                            +${option.price.toFixed(2)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Special Instructions */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Special Instructions</h4>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any special requests..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 pt-4 border-t">
            {orderType === 'one-time' && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              {orderType === 'subscription' ? 'Subscribe' : 'Add to Cart'} · ${totalPrice.toFixed(2)}
            </button>

            <button
              onClick={onToggle}
              className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
              aria-label="Close customization"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
