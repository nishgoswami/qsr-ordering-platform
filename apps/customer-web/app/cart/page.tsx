'use client';

import { useState } from 'react';

// Simulated cart data
const MOCK_CART_ITEMS = [
  {
    id: '1',
    name: 'Classic Cheeseburger',
    price: 8.99,
    quantity: 2,
    modifiers: ['Extra Cheese (+$1.00)', 'No Onions'],
    image: '🍔',
  },
  {
    id: '2',
    name: 'French Fries',
    price: 3.99,
    quantity: 1,
    modifiers: [],
    image: '🍟',
  },
  {
    id: '3',
    name: 'Soft Drink',
    price: 1.99,
    quantity: 2,
    modifiers: ['Coca-Cola'],
    image: '🥤',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? 5.00 : 0;
  const tax = (subtotal + deliveryFee) * 0.08;
  const total = subtotal + deliveryFee + tax;

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => setShowCheckout(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Cart
            </button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Checkout Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {orderType === 'delivery' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-4 py-2"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-4 py-2"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        className="w-full border rounded-lg px-4 py-2"
                        rows={3}
                        placeholder="e.g., Ring doorbell, Leave at door"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Order */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">When do you want it?</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="schedule" defaultChecked className="w-4 h-4" />
                    <div>
                      <div className="font-medium">ASAP</div>
                      <div className="text-sm text-gray-600">Estimated: 30-45 minutes</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="schedule" className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Schedule for later</div>
                      <div className="text-sm text-gray-600">Choose a time</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, Amex</div>
                    </div>
                    <span className="text-2xl">💳</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive</div>
                    </div>
                    <span className="text-2xl">💵</span>
                  </label>
                </div>

                {/* Card Details (simulated) */}
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium mt-6">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Order Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setOrderType('delivery')}
              className={`p-4 rounded-lg border-2 transition ${
                orderType === 'delivery'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">🚚</div>
              <div className="font-semibold">Delivery</div>
              <div className="text-sm text-gray-600">30-45 min · $5.00</div>
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className={`p-4 rounded-lg border-2 transition ${
                orderType === 'pickup'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">🏃</div>
              <div className="font-semibold">Pickup</div>
              <div className="text-sm text-gray-600">15-20 min · Free</div>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md divide-y">
          {cartItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
              <a
                href="/menu"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Browse Menu
              </a>
            </div>
          ) : (
            <>
              {cartItems.map(item => (
                <div key={item.id} className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">{item.image}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      {item.modifiers.length > 0 && (
                        <p className="text-sm text-gray-600 mb-2">
                          {item.modifiers.join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-3 py-1 hover:bg-gray-100 transition"
                          >
                            −
                          </button>
                          <span className="px-4 py-1 border-x">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">${item.price} each</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="p-6 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Delivery Fee</span>
                      <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-medium text-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
