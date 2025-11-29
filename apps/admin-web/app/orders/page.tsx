'use client';

import { useState } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';

// Simulated orders data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    orderNumber: 1,
    customer: { name: 'John Doe', phone: '(555) 123-4567', email: 'john@example.com' },
    status: 'delivered',
    type: 'delivery',
    items: 3,
    total: 33.43,
    orderDate: '2025-11-22 14:30',
    completedDate: '2025-11-22 15:15',
  },
  {
    id: 'ORD-002',
    orderNumber: 2,
    customer: { name: 'Sarah Miller', phone: '(555) 234-5678', email: 'sarah@example.com' },
    status: 'preparing',
    type: 'pickup',
    items: 2,
    total: 16.98,
    orderDate: '2025-11-22 14:28',
    completedDate: null,
  },
  {
    id: 'ORD-003',
    orderNumber: 3,
    customer: { name: 'Mike Roberts', phone: '(555) 345-6789', email: 'mike@example.com' },
    status: 'ready',
    type: 'delivery',
    items: 3,
    total: 18.97,
    orderDate: '2025-11-22 14:25',
    completedDate: null,
  },
  {
    id: 'ORD-004',
    orderNumber: 4,
    customer: { name: 'Emily King', phone: '(555) 456-7890', email: 'emily@example.com' },
    status: 'cancelled',
    type: 'delivery',
    items: 4,
    total: 41.96,
    orderDate: '2025-11-22 14:20',
    completedDate: '2025-11-22 14:22',
  },
  {
    id: 'ORD-005',
    orderNumber: 5,
    customer: { name: 'David Lee', phone: '(555) 567-8901', email: 'david@example.com' },
    status: 'new',
    type: 'pickup',
    items: 1,
    total: 8.99,
    orderDate: '2025-11-22 14:35',
    completedDate: null,
  },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filteredOrders = statusFilter === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(order => order.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const selectedOrderData = MOCK_ORDERS.find(o => o.id === selectedOrder);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
            <p className="text-gray-600">Manage and track all orders</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Orders
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900">{MOCK_ORDERS.length}</div>
            <div className="text-sm text-green-600 mt-2">↑ 12% from yesterday</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Active Orders</div>
            <div className="text-3xl font-bold text-yellow-600">
              {MOCK_ORDERS.filter(o => ['new', 'preparing', 'ready'].includes(o.status)).length}
            </div>
            <div className="text-sm text-gray-500 mt-2">Currently processing</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">
              ${MOCK_ORDERS.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </div>
            <div className="text-sm text-green-600 mt-2">↑ 8% from yesterday</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Order Value</div>
            <div className="text-3xl font-bold text-blue-600">
              ${(MOCK_ORDERS.reduce((sum, o) => sum + o.total, 0) / MOCK_ORDERS.length).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-2">Per order</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full border rounded-lg pl-10 pr-4 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({MOCK_ORDERS.length})
              </button>
              <button
                onClick={() => setStatusFilter('new')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New
              </button>
              <button
                onClick={() => setStatusFilter('preparing')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'preparing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Preparing
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'delivered'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">{order.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-sm text-gray-600">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      {order.type === 'delivery' ? '🚚' : '🏃'} {order.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-sm px-3 py-1 rounded-full capitalize ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{order.items}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-600">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.orderDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order.id)}
                      className="text-blue-600 hover:text-blue-700 p-2"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && selectedOrderData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Order #{selectedOrderData.orderNumber}</h2>
                  <p className="text-gray-600">{selectedOrderData.id}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusBadge(selectedOrderData.status)}`}>
                  {selectedOrderData.status}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <div><strong>Name:</strong> {selectedOrderData.customer.name}</div>
                  <div><strong>Phone:</strong> {selectedOrderData.customer.phone}</div>
                  <div><strong>Email:</strong> {selectedOrderData.customer.email}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <div><strong>Type:</strong> {selectedOrderData.type === 'delivery' ? '🚚 Delivery' : '🏃 Pickup'}</div>
                  <div><strong>Order Time:</strong> {selectedOrderData.orderDate}</div>
                  {selectedOrderData.completedDate && (
                    <div><strong>Completed:</strong> {selectedOrderData.completedDate}</div>
                  )}
                  <div><strong>Items:</strong> {selectedOrderData.items} items</div>
                  <div><strong>Total:</strong> <span className="text-green-600 font-bold">${selectedOrderData.total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
