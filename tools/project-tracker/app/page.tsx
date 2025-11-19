'use client';

import { CheckCircle2, Clock, Lightbulb, Package, Database, Smartphone, Settings, CreditCard, MapPin, Bell, MessageSquare, Printer, BarChart3, Users, Shield } from 'lucide-react';

type FeatureStatus = 'production' | 'development' | 'planning' | 'backlog';

interface Feature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  category: string;
  icon: any;
  details?: string[];
  priority: 'high' | 'medium' | 'low';
}

const features: Feature[] = [
  // INFRASTRUCTURE
  {
    id: 'monorepo',
    name: 'Monorepo Setup',
    description: 'Turborepo with shared packages and apps structure',
    status: 'development',
    category: 'Infrastructure',
    icon: Package,
    details: [
      'Turbo build system configured',
      'Shared UI component library',
      'TypeScript workspace setup',
      'ESLint and Prettier configured'
    ],
    priority: 'high'
  },
  {
    id: 'database',
    name: 'Database Schema',
    description: '10 core tables with RLS and PostGIS',
    status: 'planning',
    category: 'Infrastructure',
    icon: Database,
    details: [
      'Organizations (multi-tenant)',
      'Users with RBAC',
      'Menu items and categories',
      'Orders with status tracking',
      'Delivery zones with geofencing',
      'Printers configuration',
      'Chat conversations'
    ],
    priority: 'high'
  },
  {
    id: 'auth',
    name: 'Authentication System',
    description: 'Supabase Auth with JWT and RLS',
    status: 'planning',
    category: 'Infrastructure',
    icon: Shield,
    details: [
      'Email/password authentication',
      'Role-based access control',
      'Row Level Security policies',
      'Password reset flow',
      'Multi-tenant isolation'
    ],
    priority: 'high'
  },

  // CUSTOMER FEATURES
  {
    id: 'menu-browse',
    name: 'Menu Browsing',
    description: 'Customer-facing menu with search and filters',
    status: 'planning',
    category: 'Customer App',
    icon: Smartphone,
    details: [
      'Category navigation',
      'Item cards with images',
      'Search functionality',
      'Dietary filters',
      'Mobile-responsive design'
    ],
    priority: 'high'
  },
  {
    id: 'cart',
    name: 'Shopping Cart',
    description: 'Cart with modifiers and customization',
    status: 'planning',
    category: 'Customer App',
    icon: Package,
    details: [
      'Add/remove items',
      'Quantity adjustment',
      'Modifier selection (size, extras)',
      'Special instructions',
      'Local storage persistence'
    ],
    priority: 'high'
  },
  {
    id: 'checkout',
    name: 'Checkout & Payment',
    description: 'Stripe integration with order placement',
    status: 'planning',
    category: 'Customer App',
    icon: CreditCard,
    details: [
      'Order type selection (pickup/delivery)',
      'Timing (ASAP/scheduled)',
      'Address validation',
      'Stripe Payment Element',
      'Order confirmation'
    ],
    priority: 'high'
  },
  {
    id: 'order-tracking',
    name: 'Order Tracking',
    description: 'Real-time order status updates',
    status: 'planning',
    category: 'Customer App',
    icon: MapPin,
    details: [
      'Live status updates via WebSockets',
      'ETA display',
      'Order history',
      'Email notifications',
      'WhatsApp updates'
    ],
    priority: 'medium'
  },

  // KITCHEN FEATURES
  {
    id: 'kitchen-app',
    name: 'Kitchen Tablet App',
    description: 'Touch-friendly order management PWA',
    status: 'planning',
    category: 'Kitchen App',
    icon: Smartphone,
    details: [
      'Real-time order queue',
      'Large touch targets',
      'Accept/reject orders',
      'Status updates',
      'Audio alerts',
      'Works on phones and tablets'
    ],
    priority: 'high'
  },
  {
    id: 'printer',
    name: 'Thermal Printing',
    description: 'ESC/POS printer support',
    status: 'planning',
    category: 'Kitchen App',
    icon: Printer,
    details: [
      'Network printer support',
      'Kitchen tickets (no prices)',
      'Customer receipts (full)',
      'Dual print stations',
      'Auto-print on new orders'
    ],
    priority: 'medium'
  },

  // ADMIN FEATURES
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Restaurant management interface',
    status: 'planning',
    category: 'Admin',
    icon: BarChart3,
    details: [
      'Today\'s order overview',
      'Sales summary',
      'Real-time order management',
      'Quick actions',
      'Multi-device access'
    ],
    priority: 'high'
  },
  {
    id: 'menu-management',
    name: 'Menu Management',
    description: 'CRUD interface for menu items',
    status: 'planning',
    category: 'Admin',
    icon: Settings,
    details: [
      'Add/edit/delete items',
      'Photo upload',
      'Category management',
      'Modifier builder',
      'Availability toggle',
      'Printer station assignment'
    ],
    priority: 'high'
  },
  {
    id: 'delivery-zones',
    name: 'Delivery Zones',
    description: 'Geofencing setup and management',
    status: 'planning',
    category: 'Admin',
    icon: MapPin,
    details: [
      'Draw custom polygons',
      'Radius-based zones',
      'Per-zone pricing',
      'Minimum order amounts',
      'Estimated delivery times',
      'Google Maps integration'
    ],
    priority: 'medium'
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Sales and performance insights',
    status: 'planning',
    category: 'Admin',
    icon: BarChart3,
    details: [
      'Daily/weekly/monthly sales',
      'Popular items',
      'Pickup vs delivery split',
      'Order model breakdown',
      'Export to CSV',
      'Revenue tracking'
    ],
    priority: 'medium'
  },

  // COMMUNICATION
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'O365/SendGrid transactional emails',
    status: 'planning',
    category: 'Communication',
    icon: Bell,
    details: [
      'Order confirmations',
      'Status updates',
      'Scheduled order reminders',
      'Receipts',
      'Password resets'
    ],
    priority: 'high'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Notifications',
    description: 'Twilio WhatsApp integration',
    status: 'planning',
    category: 'Communication',
    icon: Bell,
    details: [
      'Real-time order updates',
      'Rich media messages',
      'Two-way communication',
      '$0.0042 per message',
      'Opt-in system'
    ],
    priority: 'medium'
  },
  {
    id: 'chat',
    name: 'In-App Chat',
    description: 'Supabase Realtime chat',
    status: 'planning',
    category: 'Communication',
    icon: MessageSquare,
    details: [
      'Customer-restaurant messaging',
      'Order-specific conversations',
      'Real-time WebSocket updates',
      'Message history',
      'Free (included with Supabase)'
    ],
    priority: 'low'
  },

  // FUTURE FEATURES
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Track stock levels and ingredients',
    status: 'backlog',
    category: 'Future',
    icon: Package,
    details: [
      'Stock tracking',
      'Low stock alerts',
      'Purchase orders',
      'Supplier management',
      'Recipe costing'
    ],
    priority: 'low'
  },
  {
    id: 'staff',
    name: 'Staff Management',
    description: 'Employee scheduling and time tracking',
    status: 'backlog',
    category: 'Future',
    icon: Users,
    details: [
      'Employee profiles',
      'Shift scheduling',
      'Time clock',
      'Permissions',
      'Performance tracking'
    ],
    priority: 'low'
  },
  {
    id: 'loyalty',
    name: 'Loyalty Program',
    description: 'Customer rewards and points',
    status: 'backlog',
    category: 'Future',
    icon: Package,
    details: [
      'Points system',
      'Rewards tiers',
      'Redemption options',
      'Birthday rewards',
      'Referral bonuses'
    ],
    priority: 'low'
  }
];

const statusColors = {
  production: 'bg-green-100 text-green-800 border-green-300',
  development: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  planning: 'bg-blue-100 text-blue-800 border-blue-300',
  backlog: 'bg-gray-100 text-gray-800 border-gray-300'
};

const statusIcons = {
  production: CheckCircle2,
  development: Clock,
  planning: Lightbulb,
  backlog: Package
};

export default function ProjectTracker() {
  const categories = [...new Set(features.map(f => f.category))];
  
  const getStats = () => {
    return {
      production: features.filter(f => f.status === 'production').length,
      development: features.filter(f => f.status === 'development').length,
      planning: features.filter(f => f.status === 'planning').length,
      backlog: features.filter(f => f.status === 'backlog').length,
      total: features.length
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">QSR Ordering Platform</h1>
              <p className="text-slate-600 mt-1">Real-time Project Status Tracker</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Last Updated</div>
              <div className="text-lg font-semibold text-slate-900">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Production" count={stats.production} color="green" />
          <StatCard label="Development" count={stats.development} color="yellow" />
          <StatCard label="Planning" count={stats.planning} color="blue" />
          <StatCard label="Backlog" count={stats.backlog} color="gray" />
          <StatCard label="Total Features" count={stats.total} color="slate" />
        </div>
      </div>

      {/* Features by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features
                .filter(f => f.category === category)
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map(feature => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm">
              © 2025 QSR Ordering Platform • Version 0.1.0 • Initial Development
            </p>
            <div className="flex gap-4 text-sm">
              <a href="/docs" className="text-blue-600 hover:text-blue-700">Documentation</a>
              <a href="/api" className="text-blue-600 hover:text-blue-700">API Docs</a>
              <a href="https://github.com" className="text-blue-600 hover:text-blue-700">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
    slate: 'bg-slate-50 border-slate-200 text-slate-900'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const StatusIcon = statusIcons[feature.status];
  const Icon = feature.icon;
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Icon className="w-6 h-6 text-slate-700" />
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusColors[feature.status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{feature.name}</h3>
      <p className="text-sm text-slate-600 mb-3">{feature.description}</p>
      
      {feature.details && (
        <div className="border-t border-slate-100 pt-3 mt-3">
          <ul className="space-y-1">
            {feature.details.slice(0, 3).map((detail, idx) => (
              <li key={idx} className="text-xs text-slate-500 flex items-start">
                <span className="text-slate-400 mr-2">•</span>
                {detail}
              </li>
            ))}
            {feature.details.length > 3 && (
              <li className="text-xs text-slate-400 italic">
                +{feature.details.length - 3} more...
              </li>
            )}
          </ul>
        </div>
      )}
      
      <div className="mt-3 flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          feature.priority === 'high' ? 'bg-red-100 text-red-700' :
          feature.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {feature.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
