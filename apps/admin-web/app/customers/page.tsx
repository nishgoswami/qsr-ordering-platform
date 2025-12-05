'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Mail, Phone, MapPin, ShoppingBag, Star } from 'lucide-react';

export default function CustomersPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Management
          </h1>
          <p className="text-gray-600">
            View customer profiles, order history, and preferences
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} label="Total Customers" value="0" color="blue" />
          <StatCard
            icon={ShoppingBag}
            label="Repeat Customers"
            value="0"
            color="green"
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value="0.0"
            color="yellow"
          />
          <StatCard
            icon={ShoppingBag}
            label="Lifetime Value"
            value="$0.00"
            color="purple"
          />
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Customer Management Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            View customer profiles, track order history, analyze preferences, manage
            contact information, and identify your best customers.
          </p>
          <div className="text-sm text-gray-500">
            Customer data exists in users table. UI implementation in progress.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
}
