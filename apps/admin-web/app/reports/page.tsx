'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  PieChart,
  Clock,
  Award,
} from 'lucide-react';

interface SalesReport {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    period: string;
  };
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  hourlyOrders: { [key: number]: number };
}

interface MenuItem {
  name: string;
  quantity: number;
  revenue: number;
  orders: number;
  avgPrice: number;
}

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Load sales report
      const salesRes = await fetch(`/api/reports/sales?period=${period}`);
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesReport(salesData.data);
      }

      // Load menu report
      const menuRes = await fetch(`/api/reports/menu?period=${period}`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData.data.popularItems);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPeakHours = () => {
    if (!salesReport?.hourlyOrders) return [];
    return Object.entries(salesReport.hourlyOrders)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        label: `${hour}:00`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics & Reports
            </h1>
            <p className="text-gray-600">
              Sales insights, menu performance, and business metrics
            </p>
          </div>

          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reports...</div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={formatCurrency(salesReport?.summary.totalRevenue || 0)}
                color="green"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Orders"
                value={salesReport?.summary.totalOrders || 0}
                color="blue"
              />
              <StatCard
                icon={TrendingUp}
                label="Avg Order Value"
                value={formatCurrency(salesReport?.summary.avgOrderValue || 0)}
                color="purple"
              />
            </div>

            {/* Daily Sales Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Daily Sales</h2>
              </div>

              <div className="space-y-3">
                {salesReport?.dailySales.slice(-14).map((day) => {
                  const maxRevenue = Math.max(
                    ...salesReport.dailySales.map((d) => d.revenue)
                  );
                  const width = (day.revenue / maxRevenue) * 100;

                  return (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-600">
                        {formatDate(day.date)}
                      </div>
                      <div className="flex-1">
                        <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center px-3"
                            style={{ width: `${width}%` }}
                          >
                            <span className="text-white text-sm font-medium">
                              {formatCurrency(day.revenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-600 text-right">
                        {day.orders} orders
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-1 gap-8 mb-8">
              {/* Peak Hours */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">Peak Hours</h2>
                </div>

                <div className="space-y-4">
                  {getPeakHours().map((item, index) => (
                    <div
                      key={item.hour}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.count} orders
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Top Selling Items
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantity Sold
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Avg Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {menuItems.slice(0, 10).map((item, index) => (
                      <tr key={item.name} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-900 font-semibold">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {formatCurrency(item.avgPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string | number;
  color: 'green' | 'blue' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}
