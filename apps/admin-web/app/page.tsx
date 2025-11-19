'use client';

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
              Restaurant Management System
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active />
            <NavItem icon={ShoppingBag} label="Orders" />
            <NavItem icon={UtensilsCrossed} label="Menu" />
            <NavItem icon={MapPin} label="Delivery Zones" />
            <NavItem icon={BarChart3} label="Reports" />
            <NavItem icon={Users} label="Staff" />
            <NavItem icon={Settings} label="Settings" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <LayoutDashboard className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Restaurant Admin Dashboard
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Comprehensive management for your restaurant
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <FeatureCard
                  icon={ShoppingBag}
                  title="Order Management"
                  description="Real-time order tracking and management"
                  color="blue"
                />
                <FeatureCard
                  icon={UtensilsCrossed}
                  title="Menu Builder"
                  description="Create and manage menu items"
                  color="green"
                />
                <FeatureCard
                  icon={MapPin}
                  title="Delivery Zones"
                  description="Setup geofencing and pricing"
                  color="purple"
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Analytics"
                  description="Sales reports and insights"
                  color="orange"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 text-left">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
