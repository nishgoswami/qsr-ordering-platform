'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, Clock, Search, ChevronRight, Home } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  isOpen: boolean;
  estimatedDeliveryTime: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
  display_order?: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular: boolean;
  imageUrl?: string | null;
}

interface MenuClientProps {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
}

// Simulated menu data
const MOCK_RESTAURANT = {
  id: '1',
  name: 'Demo Restaurant',
  description: 'Delicious food delivered to your door',
  phone: '(555) 123-4567',
  address: '123 Main Street, City, ST 12345',
  isOpen: true,
  estimatedDeliveryTime: '30-45 min',
};

const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Burgers', icon: '🍔', itemCount: 2 },
  { id: 'c2', name: 'Pizza', icon: '🍕', itemCount: 2 },
  { id: 'c3', name: 'Sides', icon: '🍟', itemCount: 2 },
  { id: 'c4', name: 'Beverages', icon: '🥤', itemCount: 2 },
  { id: 'c5', name: 'Desserts', icon: '🍰', itemCount: 2 },
];

const MOCK_MENU_ITEMS = [
  {
    id: 'm1',
    categoryId: 'c1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce',
    price: 8.99,
    image: '🍔',
    popular: true,
  },
  {
    id: 'm2',
    categoryId: 'c1',
    name: 'Bacon Deluxe Burger',
    description: 'Double beef patty, crispy bacon, cheese, caramelized onions',
    price: 10.99,
    image: '��',
    popular: true,
  },
  {
    id: 'm3',
    categoryId: 'c2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, basil',
    price: 12.99,
    image: '🍕',
    popular: false,
  },
  {
    id: 'm4',
    categoryId: 'c2',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella and tomato sauce',
    price: 13.99,
    image: '🍕',
    popular: true,
  },
  {
    id: 'm5',
    categoryId: 'c3',
    name: 'French Fries',
    description: 'Crispy golden fries with sea salt',
    price: 3.99,
    image: '🍟',
    popular: true,
  },
  {
    id: 'm6',
    categoryId: 'c3',
    name: 'Onion Rings',
    description: 'Beer-battered onion rings with ranch dip',
    price: 4.99,
    image: '🧅',
    popular: false,
  },
  {
    id: 'm7',
    categoryId: 'c4',
    name: 'Soft Drink',
    description: 'Coca-Cola, Sprite, or Fanta',
    price: 1.99,
    image: '🥤',
    popular: false,
  },
  {
    id: 'm8',
    categoryId: 'c4',
    name: 'Fresh Lemonade',
    description: 'Homemade fresh-squeezed lemonade',
    price: 2.99,
    image: '��',
    popular: true,
  },
  {
    id: 'm9',
    categoryId: 'c5',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with fudge frosting',
    price: 5.99,
    image: '🍰',
    popular: true,
  },
  {
    id: 'm10',
    categoryId: 'c5',
    name: 'Ice Cream Sundae',
    description: 'Vanilla ice cream with chocolate sauce and whipped cream',
    price: 4.99,
    image: '🍨',
    popular: false,
  },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: string[];
  instructions?: string;
}

export default function MenuClient({ restaurant, categories, menuItems }: MenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showItemModal, setShowItemModal] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: typeof MOCK_MENU_ITEMS[0], modifiers?: string[], instructions?: string) => {
    const existingItem = cart.find(c => c.id === item.id);
    if (existingItem) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1,
        modifiers,
        instructions 
      }]);
    }
    setShowItemModal(null);
  };

  const updateCartItemQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const selectedItem = menuItems.find(i => i.id === showItemModal);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Top bar */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a href="http://localhost:3004" className="text-gray-600 hover:text-gray-900 transition" title="Back to Homepage" aria-label="Back to Homepage">
                  <Home className="w-5 h-5" />
                </a>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-0.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Open</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{restaurant.estimatedDeliveryTime}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                aria-label={`View cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="font-medium">
                  {cartItemCount > 0 ? `${cartItemCount} items` : 'Cart'}
                </span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 py-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={\`px-4 py-2 rounded-full whitespace-nowrap font-medium transition text-sm \${
                  selectedCategory === 'all'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }\`}
              >
                All Items
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition flex items-center gap-1.5 text-sm ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }\`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">({category.itemCount})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Items */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {selectedCategory === 'all' ? (
            // Group by category when showing all
            categories.map(category => {
              const categoryItems = menuItems.filter(item => item.categoryId === category.id);
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category.id} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-3xl">{category.icon}</span>
                  {category.name}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map(item => (
                    <MenuItem key={item.id} item={item} onAdd={() => setShowItemModal(item.id)} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Show filtered items
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <MenuItem key={item.id} item={item} onAdd={() => setShowItemModal(item.id)} />
            ))}
          </div>
        )}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your search.</p>
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setShowItemModal(null)}
          onAdd={addToCart}
        />
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          total={cartTotal}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateCartItemQuantity}
          onRemove={removeFromCart}
        />
      )}

      {/* Floating Cart Button (Mobile) */}
      {cartItemCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-4 right-4 bg-orange-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-orange-700 transition flex items-center gap-2 z-30"
          aria-label="View cart"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">\${cartTotal.toFixed(2)}</span>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
            {cartItemCount}
          </div>
        </button>
      )}
    </div>
  );
}

// Menu Item Card Component
function MenuItem({ item, onAdd }: { item: typeof MOCK_MENU_ITEMS[0]; onAdd: () => void }) {
  return (
    <div
      onClick={onAdd}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer group"
    >
      <div className="flex gap-4 p-4">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition">
              {item.name}
            </h3>
            {item.popular && (
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded font-medium">
                Popular
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">\${item.price.toFixed(2)}</span>
            <button className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition" aria-label="Add to cart">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
          <span className="text-5xl">{item.image}</span>
        </div>
      </div>
    </div>
  );
}

// Item Modal Component
function ItemModal({ 
  item, 
  onClose, 
  onAdd 
}: { 
  item: typeof MOCK_MENU_ITEMS[0]; 
  onClose: () => void;
  onAdd: (item: typeof MOCK_MENU_ITEMS[0], modifiers?: string[], instructions?: string) => void;
}) {
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  const handleAdd = () => {
    onAdd(item, selectedModifiers, instructions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Customize your order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
              <span className="text-7xl">{item.image}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                {item.popular && (
                  <span className="bg-orange-100 text-orange-700 text-sm px-2 py-1 rounded-full font-medium">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">{item.description}</p>
              <p className="text-2xl font-bold text-orange-600">\${item.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Customize (Optional)</h3>
            <div className="space-y-2">
              {['Extra Cheese (+\$1.00)', 'Bacon (+\$2.00)', 'No Onions'].map((modifier, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-orange-600 focus:ring-orange-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedModifiers([...selectedModifiers, modifier]);
                      } else {
                        setSelectedModifiers(selectedModifiers.filter(m => m !== modifier));
                      }
                    }}
                  />
                  <span className="text-gray-700">{modifier}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <label className="block font-semibold text-gray-900 mb-3">Special Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Any special requests? (e.g., no pickles, extra sauce)"
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-orange-600 text-white px-6 py-4 rounded-xl hover:bg-orange-700 transition font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add to Cart - \${item.price.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

// Cart Sidebar Component
function CartSidebar({
  cart,
  total,
  onClose,
  onUpdateQuantity,
  onRemove,
}: {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close cart">
            <X className="w-6 h-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some delicious items to get started!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      aria-label="Remove item"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {item.modifiers && item.modifiers.length > 0 && (
                    <ul className="text-sm text-gray-600 mb-2 space-y-1">
                      {item.modifiers.map((mod, idx) => (
                        <li key={idx}>• {mod}</li>
                      ))}
                    </ul>
                  )}

                  {item.instructions && (
                    <p className="text-sm text-gray-600 italic mb-2">Note: {item.instructions}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-orange-600 text-white rounded-full hover:bg-orange-700 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">\${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>\${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>\$3.99</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>\${(total + 3.99).toFixed(2)}</span>
                </div>
              </div>

              <a
                href="/cart"
                className="block w-full bg-orange-600 text-white px-6 py-4 rounded-xl hover:bg-orange-700 transition font-semibold text-center"
              >
                Proceed to Checkout
                <ChevronRight className="w-5 h-5 inline ml-2" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
