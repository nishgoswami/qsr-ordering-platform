'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Package, Truck, User, Phone, MessageSquare, CheckCircle2, AlertCircle, ChefHat, Printer, Store } from 'lucide-react';

// Simulated orders data
const MOCK_ORDERS = [
  {
    id: 'ORD-12847',
    orderNumber: 47,
    status: 'new',
    type: 'delivery',
    platform: 'app',
    customer: { name: 'John Davidson', phone: '(555) 123-4567', address: '123 Main St, Apt 4B' },
    items: [
      { name: 'Classic Cheeseburger', quantity: 2, modifiers: ['Extra Cheese +$1.00', 'No Onions'], price: 8.99 },
      { name: 'French Fries', quantity: 1, modifiers: ['Large +$1.50'], price: 3.99 },
      { name: 'Soft Drink', quantity: 2, modifiers: ['Coca-Cola'], price: 1.99 },
    ],
    notes: 'Please make the burger well-done. Ring doorbell twice.',
    orderTime: new Date(Date.now() - 2 * 60 * 1000),
    estimatedTime: 30,
    totalAmount: 27.95,
  },
  {
    id: 'ORD-12848',
    orderNumber: 48,
    status: 'preparing',
    type: 'pickup',
    platform: 'phone',
    customer: { name: 'Sarah Miller', phone: '(555) 234-5678', address: null },
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, modifiers: ['Extra Cheese +$2.00', 'Thin Crust'], price: 13.99 },
      { name: 'Caesar Salad', quantity: 1, modifiers: ['Extra Dressing'], price: 7.99 },
      { name: 'Fresh Lemonade', quantity: 2, modifiers: [], price: 2.99 },
    ],
    notes: '',
    orderTime: new Date(Date.now() - 8 * 60 * 1000),
    estimatedTime: 25,
    totalAmount: 31.95,
  },
  {
    id: 'ORD-12849',
    orderNumber: 49,
    status: 'preparing',
    type: 'delivery',
    platform: 'uber',
    customer: { name: 'Mike Roberts', phone: '(555) 345-6789', address: '456 Oak Avenue' },
    items: [
      { name: 'Bacon Deluxe Burger', quantity: 1, modifiers: ['No Tomato', 'Extra Bacon +$2.00'], price: 10.99 },
      { name: 'Onion Rings', quantity: 1, modifiers: [], price: 4.99 },
      { name: 'Chocolate Cake', quantity: 1, modifiers: [], price: 5.99 },
      { name: 'Iced Coffee', quantity: 1, modifiers: ['Large +$1.00'], price: 3.99 },
    ],
    notes: 'Leave at door, contactless delivery',
    orderTime: new Date(Date.now() - 12 * 60 * 1000),
    estimatedTime: 35,
    totalAmount: 28.96,
  },
  {
    id: 'ORD-12850',
    orderNumber: 50,
    status: 'ready',
    type: 'pickup',
    platform: 'app',
    customer: { name: 'Emily King', phone: '(555) 456-7890', address: null },
    items: [
      { name: 'Margherita Pizza', quantity: 2, modifiers: ['Fresh Basil'], price: 12.99 },
      { name: 'Garlic Bread', quantity: 1, modifiers: [], price: 4.99 },
      { name: 'Ice Cream Sundae', quantity: 2, modifiers: ['Chocolate Sauce'], price: 4.99 },
    ],
    notes: 'Customer waiting outside',
    orderTime: new Date(Date.now() - 18 * 60 * 1000),
    estimatedTime: 20,
    totalAmount: 41.96,
  },
  {
    id: 'ORD-12851',
    orderNumber: 51,
    status: 'new',
    type: 'delivery',
    platform: 'doordash',
    customer: { name: 'David Chen', phone: '(555) 567-8901', address: '789 Pine Street, Unit 12' },
    items: [
      { name: 'BBQ Chicken Pizza', quantity: 1, modifiers: ['Extra BBQ Sauce', 'No Onions'], price: 14.99 },
      { name: 'Buffalo Wings', quantity: 1, modifiers: ['12 pieces', 'Ranch Dip'], price: 11.99 },
    ],
    notes: '',
    orderTime: new Date(Date.now() - 1 * 60 * 1000),
    estimatedTime: 35,
    totalAmount: 26.98,
  },
];

type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

export default function KitchenApp() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate new order notification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orders.filter(o => o.status === 'new').length > 0) {
        setShowNotification(true);
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ0fPTgjMGHm7A7+OZUQ0LUKfk8LZjHAY4ktjyzXosBS+Dye7dhzYIHG/A7+CYUg0LT6fk8LdjHAY5k9nxzHos');
        audio.play().catch(() => {});
        setTimeout(() => setShowNotification(false), 3000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [orders]);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (newStatus === 'completed') {
      setTimeout(() => {
        setOrders(orders.filter(order => order.id !== orderId));
      }, 2000);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  const getElapsedTime = (orderTime: Date) => {
    const elapsed = Math.floor((currentTime.getTime() - orderTime.getTime()) / 1000 / 60);
    return elapsed;
  };

  const getPlatformBadge = (platform: string) => {
    const badges = {
      app: { label: 'Online', color: 'bg-blue-500 text-white', icon: Package },
      phone: { label: 'Phone', color: 'bg-gray-600 text-white', icon: Phone },
      uber: { label: 'Uber Eats', color: 'bg-green-600 text-white', icon: Package },
      doordash: { label: 'DoorDash', color: 'bg-red-600 text-white', icon: Package },
    };
    return badges[platform as keyof typeof badges] || badges.app;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const selectedOrderData = orders.find(o => o.id === selectedOrder);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-2.5 rounded-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
                <p className="text-sm text-gray-600">Demo Restaurant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div className="text-xs text-gray-600">{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              </div>
              
              <div className="flex gap-3">
                <div className="text-center px-4 py-2 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="text-2xl font-bold text-red-600">{newOrdersCount}</div>
                  <div className="text-xs text-red-600 font-medium">New</div>
                </div>
                <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{preparingCount}</div>
                  <div className="text-xs text-yellow-600 font-medium">Preparing</div>
                </div>
                <div className="text-center px-4 py-2 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-2xl font-bold text-green-600">{readyCount}</div>
                  <div className="text-xs text-green-600 font-medium">Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* New Order Notification */}
      {showNotification && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <div className="font-bold text-lg">New Order!</div>
              <div className="text-sm">Check incoming orders</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-[89px] z-30 shadow-sm">
        <div className="flex gap-3">
          {(['all', 'new', 'preparing', 'ready'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-lg font-semibold transition text-base ${
                filter === status
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 bg-white bg-opacity-30 px-2 py-0.5 rounded text-sm font-bold">
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <CheckCircle2 className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">All Caught Up!</h2>
              <p className="text-gray-500">
                {filter === 'all' ? 'No orders at the moment' : `No ${filter} orders`}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const elapsedMinutes = getElapsedTime(order.orderTime);
              const isUrgent = elapsedMinutes >= 10;
              const platformBadge = getPlatformBadge(order.platform);
              const PlatformIcon = platformBadge.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order.id)}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-l-8 overflow-hidden ${
                    order.status === 'new' ? 'border-red-500' :
                    order.status === 'preparing' ? 'border-yellow-500' :
                    order.status === 'ready' ? 'border-green-500' :
                    'border-gray-400'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`px-4 py-3 ${
                    order.status === 'new' ? 'bg-red-50' :
                    order.status === 'preparing' ? 'bg-yellow-50' :
                    order.status === 'ready' ? 'bg-green-50' :
                    'bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-gray-900">#{order.orderNumber}</span>
                          {order.type === 'delivery' ? (
                            <Truck className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Store className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mt-1">
                          {order.customer.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${platformBadge.color}`}>
                          <PlatformIcon className="w-3.5 h-3.5" />
                          {platformBadge.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1.5">{formatTime(order.orderTime)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Timer */}
                    <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
                      isUrgent ? 'bg-red-100 border-2 border-red-300' : 'bg-gray-100 border-2 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-600' : 'text-gray-600'}`} />
                        <div>
                          <div className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                            {elapsedMinutes} min
                          </div>
                          <div className="text-xs text-gray-600">Elapsed</div>
                        </div>
                      </div>
                      {isUrgent && (
                        <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-2.5 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-orange-600 text-lg min-w-[28px]">{item.quantity}×</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                              {item.modifiers.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {item.modifiers.map((mod, i) => (
                                    <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">
                                      {mod}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                        <div className="flex gap-2">
                          <MessageSquare className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-900 font-medium">{order.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {order.status === 'new' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'preparing');
                            }}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Accept
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-bold py-3.5 rounded-lg transition"
                            title="Print Order"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'ready');
                          }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'completed');
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Package className="w-5 h-5" />
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && selectedOrderData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 border-l-8 ${
              selectedOrderData.status === 'new' ? 'border-red-500 bg-red-50' :
              selectedOrderData.status === 'preparing' ? 'border-yellow-500 bg-yellow-50' :
              selectedOrderData.status === 'ready' ? 'border-green-500 bg-green-50' :
              'border-gray-500 bg-gray-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-5xl font-bold text-gray-900">#{selectedOrderData.orderNumber}</span>
                    {selectedOrderData.type === 'delivery' ? (
                      <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                        <Truck className="w-4 h-4" />
                        Delivery
                      </div>
                    ) : (
                      <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                        <Store className="w-4 h-4" />
                        Pickup
                      </div>
                    )}
                  </div>
                  <div className="text-xl font-semibold text-gray-900">{selectedOrderData.customer.name}</div>
                  <div className="text-gray-600 mt-1">{selectedOrderData.customer.phone}</div>
                  {selectedOrderData.customer.address && (
                    <div className="text-gray-600 mt-1">{selectedOrderData.customer.address}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${getPlatformBadge(selectedOrderData.platform).color}`}>
                    <Package className="w-4 h-4" />
                    {getPlatformBadge(selectedOrderData.platform).label}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formatTime(selectedOrderData.orderTime)}
                  </div>
                  <div className={`text-3xl font-bold mt-2 ${getElapsedTime(selectedOrderData.orderTime) >= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {getElapsedTime(selectedOrderData.orderTime)} min
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Items */}
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h3>
              <div className="space-y-3 mb-6">
                {selectedOrderData.items.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <div className="flex gap-3">
                      <div className="text-3xl font-bold text-orange-600 min-w-[45px]">
                        {item.quantity}×
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-gray-900">{item.name}</div>
                        {item.modifiers.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.modifiers.map((mod, i) => (
                              <span key={i} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-semibold">
                                {mod}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {selectedOrderData.notes && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Special Instructions
                  </h3>
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                    <p className="text-yellow-900 font-semibold text-lg">{selectedOrderData.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-xl transition text-lg"
                >
                  Close
                </button>
                {selectedOrderData.status === 'new' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrderData.id, 'preparing');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Accept Order
                  </button>
                )}
                {selectedOrderData.status === 'preparing' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrderData.id, 'ready');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Mark Ready
                  </button>
                )}
                {selectedOrderData.status === 'ready' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrderData.id, 'completed');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition text-lg flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Package className="w-6 h-6" />
                    Complete Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
