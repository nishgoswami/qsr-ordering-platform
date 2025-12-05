'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, Package, User, Phone, CheckCircle2, AlertCircle, ChefHat, Store } from 'lucide-react';
import { getOrders, updateOrderStatus as updateStatus, Order } from '../lib/database';

export default function KitchenApp() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadOrders() {
    const data = await getOrders();
    setOrders(data.filter(o => o.status !== 'completed' && o.status !== 'cancelled'));
    setLoading(false);
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    const success = await updateStatus(orderId, newStatus);
    if (success) {
      await loadOrders();
    }
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const newCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-2.5 rounded-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
                <p className="text-sm text-gray-600">Restaurant Orders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xs text-gray-600">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="text-center px-4 py-2 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="text-2xl font-bold text-red-600">{newCount}</div>
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

      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'pending' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            New ({newCount})
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'preparing' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Preparing ({preparingCount})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'ready' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Ready ({readyCount})
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders to display</p>
            <p className="text-gray-400">New orders will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (id: string, status: string) => void }) {
  const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const isUrgent = elapsed > 15;

  return (
    <div className={`bg-white rounded-lg shadow-md p-5 border-2 ${isUrgent ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">#{order.order_number}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {elapsed} min ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.order_type === 'delivery' ? <Package className="w-5 h-5 text-blue-500" /> : <Store className="w-5 h-5 text-gray-500" />}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <User className="w-4 h-4" />
          {order.customer_name}
        </p>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Phone className="w-4 h-4" />
          {order.customer_phone}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="font-medium">{item.quantity}x {item.name}</span>
          </div>
        ))}
      </div>

      {order.special_instructions && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">{order.special_instructions}</p>
        </div>
      )}

      <div className="flex gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'preparing')}
            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-medium hover:bg-yellow-600 transition"
          >
            Start Preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'ready')}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition"
          >
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onStatusUpdate(order.id, 'completed')}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
