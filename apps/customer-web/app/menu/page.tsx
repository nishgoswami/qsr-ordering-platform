'use client';

import { useState } from 'react';

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
  { id: 'c1', name: 'Burgers', icon: '🍔' },
  { id: 'c2', name: 'Pizza', icon: '🍕' },
  { id: 'c3', name: 'Sides', icon: '🍟' },
  { id: 'c4', name: 'Beverages', icon: '🥤' },
  { id: 'c5', name: 'Desserts', icon: '🍰' },
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
    image: '🍔',
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
    image: '🍋',
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

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const [showItemModal, setShowItemModal] = useState<string | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? MOCK_MENU_ITEMS
    : MOCK_MENU_ITEMS.filter(item => item.categoryId === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: typeof MOCK_MENU_ITEMS[0]) => {
    const existingItem = cart.find(c => c.id === item.id);
    if (existingItem) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
    setShowItemModal(null);
  };

  const selectedItem = MOCK_MENU_ITEMS.find(i => i.id === showItemModal);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{MOCK_RESTAURANT.name}</h1>
              <p className="text-sm text-gray-600">{MOCK_RESTAURANT.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium text-green-600">Open Now</span>
              </div>
              <p className="text-xs text-gray-600">{MOCK_RESTAURANT.estimatedDeliveryTime}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-[88px] z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {MOCK_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => setShowItemModal(item.id)}
            >
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <span className="text-8xl">{item.image}</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  {item.popular && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-600">${item.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <span className="text-9xl">{selectedItem.image}</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
                {selectedItem.popular && (
                  <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              
              {/* Simulated Modifiers */}
              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold mb-2">Customize</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Extra Cheese (+$1.00)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Bacon (+$2.00)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">No Onions</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <label className="block mb-2 font-semibold">Special Instructions</label>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm"
                  rows={3}
                  placeholder="Any special requests?"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowItemModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addToCart(selectedItem)}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Add to Cart - ${selectedItem.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="container mx-auto px-4 py-4">
            <button className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition flex justify-between items-center font-medium text-lg">
              <span>View Cart ({cartItemCount} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
