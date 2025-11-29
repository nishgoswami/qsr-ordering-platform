'use client';

import { useState, useEffect } from 'react';

// Simulated order data
const MOCK_ORDER = {
  id: 'ORD-2025-001',
  status: 'preparing',
  orderDate: '2025-11-22T14:30:00',
  estimatedTime: '2025-11-22T15:15:00',
  type: 'delivery',
  customer: {
    name: 'John Doe',
    phone: '(555) 123-4567',
    address: '123 Main Street, City, ST 12345',
  },
  items: [
    { name: 'Classic Cheeseburger', quantity: 2, price: 8.99, modifiers: ['Extra Cheese', 'No Onions'] },
    { name: 'French Fries', quantity: 1, price: 3.99, modifiers: [] },
    { name: 'Soft Drink', quantity: 2, price: 1.99, modifiers: ['Coca-Cola'] },
  ],
  subtotal: 25.95,
  deliveryFee: 5.00,
  tax: 2.48,
  total: 33.43,
  driver: {
    name: 'Mike Johnson',
    phone: '(555) 987-6543',
    vehicle: 'Blue Honda Civic',
    photo: '👨‍🦱',
  },
};

const ORDER_STATUSES = [
  { key: 'confirmed', label: 'Order Confirmed', icon: '✅', description: 'Restaurant received your order' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', description: 'Your food is being prepared' },
  { key: 'ready', label: 'Ready', icon: '🎉', description: 'Order is ready for delivery' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚', description: 'Driver is on the way' },
  { key: 'delivered', label: 'Delivered', icon: '✨', description: 'Order has been delivered' },
];

export default function OrderTrackingPage() {
  const [currentStatus, setCurrentStatus] = useState('preparing');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'restaurant', text: 'Your order is being prepared!', time: '14:32' },
    { id: '2', sender: 'customer', text: 'Great! How long will it take?', time: '14:33' },
    { id: '3', sender: 'restaurant', text: 'About 30-35 minutes. We\'ll notify you when it\'s ready!', time: '14:34' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Simulate status progression
  useEffect(() => {
    const statusProgression = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const currentIndex = statusProgression.indexOf(currentStatus);
    
    if (currentIndex < statusProgression.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStatus(statusProgression[currentIndex + 1]);
      }, 8000); // Progress every 8 seconds for demo
      
      return () => clearTimeout(timer);
    }
  }, [currentStatus]);

  const currentStatusIndex = ORDER_STATUSES.findIndex(s => s.key === currentStatus);
  const currentStatusObj = ORDER_STATUSES[currentStatusIndex];

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    setChatMessages([
      ...chatMessages,
      {
        id: Date.now().toString(),
        sender: 'customer',
        text: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMessage('');

    // Simulate restaurant response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'restaurant',
          text: 'Thanks for your message! We\'ll help you shortly.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-sm text-gray-600">Order #{MOCK_ORDER.id}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Current Status Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-3">{currentStatusObj.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{currentStatusObj.label}</h2>
            <p className="text-blue-100 mb-4">{currentStatusObj.description}</p>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 inline-block">
              <span className="text-sm font-medium">
                Estimated Time: {new Date(MOCK_ORDER.estimatedTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
          <div className="space-y-4">
            {ORDER_STATUSES.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={status.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition ${
                        isCompleted
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}
                    >
                      {status.icon}
                    </div>
                    {index < ORDER_STATUSES.length - 1 && (
                      <div
                        className={`w-0.5 h-12 transition ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h4
                      className={`font-semibold ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {status.label}
                    </h4>
                    <p
                      className={`text-sm ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {status.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Info (if out for delivery) */}
        {(currentStatus === 'out_for_delivery' || currentStatus === 'delivered') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Your Driver</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-4xl">
                {MOCK_ORDER.driver.photo}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{MOCK_ORDER.driver.name}</h4>
                <p className="text-sm text-gray-600">{MOCK_ORDER.driver.vehicle}</p>
              </div>
              <a
                href={`tel:${MOCK_ORDER.driver.phone}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                📞 Call
              </a>
            </div>
            
            {/* Simulated Map */}
            <div className="mt-4 bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-5xl mb-2">🗺️</div>
                <p className="text-sm">Live tracking map will appear here</p>
                <p className="text-xs mt-1">(Google Maps integration)</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          
          <div className="space-y-3 mb-4 pb-4 border-b">
            {MOCK_ORDER.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <div className="font-medium">
                    {item.quantity}x {item.name}
                  </div>
                  {item.modifiers.length > 0 && (
                    <div className="text-sm text-gray-600">{item.modifiers.join(', ')}</div>
                  )}
                </div>
                <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>${MOCK_ORDER.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>${MOCK_ORDER.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>${MOCK_ORDER.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-green-600">${MOCK_ORDER.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
          <div className="flex gap-3">
            <div className="text-2xl">📍</div>
            <div>
              <p className="font-medium">{MOCK_ORDER.customer.name}</p>
              <p className="text-gray-600">{MOCK_ORDER.customer.address}</p>
              <p className="text-gray-600">{MOCK_ORDER.customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
          >
            <span>💬</span>
            <span>Chat with Restaurant</span>
          </button>
          <button className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition font-medium">
            Need Help?
          </button>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-lg md:rounded-lg h-[80vh] md:h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center md:rounded-t-lg">
              <div>
                <h3 className="font-semibold">Chat with Restaurant</h3>
                <p className="text-sm text-blue-100">Demo Restaurant</p>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-2xl hover:bg-blue-700 w-8 h-8 rounded"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      msg.sender === 'customer'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-4 py-2"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
