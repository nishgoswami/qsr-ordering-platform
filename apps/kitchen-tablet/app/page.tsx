'use client';

import { ChefHat, Clock, CheckCircle } from 'lucide-react';

export default function KitchenApp() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold">Kitchen Orders</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Active Orders</div>
            <div className="text-3xl font-bold">0</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <ChefHat className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Kitchen Order Management</h2>
            <p className="text-xl text-gray-400 mb-8">
              Touch-friendly PWA for managing restaurant orders
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className="bg-gray-700 rounded-lg p-6">
                <Clock className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Real-time Orders</h3>
                <p className="text-gray-300">
                  Orders appear instantly via WebSocket connection
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-6">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Status Updates</h3>
                <p className="text-gray-300">
                  Accept, prepare, and mark orders ready with large touch targets
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-6">
                <ChefHat className="w-12 h-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Auto-print</h3>
                <p className="text-gray-300">
                  Kitchen tickets print automatically to thermal printers
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
