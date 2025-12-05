'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Tag, Percent, Calendar, Plus, TrendingUp } from 'lucide-react';

export default function PromotionsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Promotions & Discounts
            </h1>
            <p className="text-gray-600">
              Create coupon codes, happy hours, and special offers
            </p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Promotion
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Tag}
            label="Active Promotions"
            value="0"
            color="blue"
          />
          <StatCard
            icon={Percent}
            label="Redemptions"
            value="0"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue Impact"
            value="$0.00"
            color="purple"
          />
          <StatCard
            icon={Calendar}
            label="Scheduled"
            value="0"
            color="orange"
          />
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Promotions Management Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            Create discount codes, set up happy hour pricing, schedule seasonal
            promotions, track redemption rates, and measure campaign effectiveness.
          </p>
          <div className="text-sm text-gray-500">
            Database schema needed. Full implementation in progress.
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
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
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
