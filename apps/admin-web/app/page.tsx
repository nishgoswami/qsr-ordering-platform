'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Settings, BarChart3, MapPin, Users, ChefHat, Package } from 'lucide-react';
import { getUserRestaurant } from '../lib/auth';
import { getDashboardStats } from '../lib/database';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const [restaurantName, setRestaurantName] = useState('Loading...');
  const [stats, setStats] = useState({
    todaysOrders: 0,
    revenue: 0,
    activeOrders: 0,
    menuItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { restaurant } = await getUserRestaurant();
        if (restaurant) {
          setRestaurantName(restaurant.name);
        }

        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Welcome to Admin Dashboard
              </h2>
              <p className="text-blue-100 mb-4">
                Manage your restaurant operations with ease
              </p>
              <div className="flex gap-4">
                <Link
                  href="/orders"
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  View Orders
                </Link>
                <Link
                  href="/menu"
                  className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition font-medium"
                >
                  Manage Menu
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Today's Orders"
                value={loading ? '...' : stats.todaysOrders.toString()}
                change={stats.todaysOrders > 0 ? '+' + stats.todaysOrders : 'No orders yet'}
                changeType={stats.todaysOrders > 0 ? 'positive' : 'neutral'}
                icon={ShoppingBag}
              />
              <StatCard
                title="Revenue"
                value={loading ? '...' : `$${stats.revenue.toFixed(2)}`}
                change={stats.revenue > 0 ? 'Today' : '$0.00'}
                changeType={stats.revenue > 0 ? 'positive' : 'neutral'}
                icon={BarChart3}
              />
              <StatCard
                title="Active Orders"
                value={loading ? '...' : stats.activeOrders.toString()}
                change={stats.activeOrders > 0 ? 'In Progress' : 'None active'}
                changeType="neutral"
                icon={ShoppingBag}
              />
              <StatCard
                title="Menu Items"
                value={loading ? '...' : stats.menuItems.toString()}
                change={stats.menuItems > 0 ? 'Active items' : 'Add items'}
                changeType="neutral"
                icon={UtensilsCrossed}
              />
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={ShoppingBag}
                title="Order Management"
                description="View, manage and track all orders in real-time with detailed analytics"
                href="/orders"
                color="blue"
              />
              <FeatureCard
                icon={UtensilsCrossed}
                title="Menu Builder"
                description="Create categories, add items, set pricing and manage modifiers"
                href="/menu"
                color="green"
              />
              <FeatureCard
                icon={ChefHat}
                title="Recipe Management"
                description="Create recipes with ingredients that auto-sync to inventory"
                href="/recipes"
                color="orange"
              />
              <FeatureCard
                icon={Package}
                title="Inventory Tracking"
                description="Monitor stock levels, manage suppliers, and get low stock alerts"
                href="/inventory"
                color="emerald"
              />
              <FeatureCard
                icon={MapPin}
                title="Delivery Zones"
                description="Setup geofencing, delivery fees and minimum order amounts"
                href="/zones"
                color="purple"
              />
              <FeatureCard
                icon={BarChart3}
                title="Analytics & Reports"
                description="Sales reports, popular items, peak hours and revenue insights"
                href="/reports"
                color="blue"
              />
              <FeatureCard
                icon={Users}
                title="Staff Management"
                description="Manage users, assign roles, and control access permissions"
                href="/staff"
                color="pink"
              />
              <FeatureCard
                icon={Settings}
                title="Settings"
                description="Restaurant hours, contact info, payment methods, and preferences"
                href="/settings"
                color="gray"
              />
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon 
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
}) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm text-gray-600">{title}</div>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className={`text-sm ${changeColor}`}>{change}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, href, color }: {
  icon: any;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
    pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
    gray: 'bg-gray-50 text-gray-600 group-hover:bg-gray-100',
  };

  return (
    <Link
      href={href}
      className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-200"
    >
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4 transition`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1">
        Open →
      </div>
    </Link>
  );
}
