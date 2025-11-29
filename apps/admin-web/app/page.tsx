'use client';

import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Settings, BarChart3, MapPin, Users } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-600">
              Demo Restaurant
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" href="/" active />
            <NavItem icon={ShoppingBag} label="Orders" href="/orders" />
            <NavItem icon={UtensilsCrossed} label="Menu" href="/menu" />
            <NavItem icon={MapPin} label="Delivery Zones" href="/zones" />
            <NavItem icon={BarChart3} label="Reports" href="/reports" />
            <NavItem icon={Users} label="Staff" href="/staff" />
            <NavItem icon={Settings} label="Settings" href="/settings" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
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
                value="24"
                change="+12%"
                changeType="positive"
                icon={ShoppingBag}
              />
              <StatCard
                title="Revenue"
                value="$482.50"
                change="+8%"
                changeType="positive"
                icon={BarChart3}
              />
              <StatCard
                title="Active Orders"
                value="5"
                change="Live"
                changeType="neutral"
                icon={ShoppingBag}
              />
              <StatCard
                title="Menu Items"
                value="45"
                change="5 categories"
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
                color="orange"
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
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, href, active = false }: { 
  icon: any; 
  label: string; 
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
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
