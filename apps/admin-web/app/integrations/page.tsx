'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Plug, Plus, Check, X, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  slug: string;
  category: 'delivery' | 'email' | 'messaging' | 'payment';
  description?: string;
  logo_url?: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error' | 'testing';
  connected_at?: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      // TODO: Implement API route for integrations
      // const response = await fetch('/api/integrations');
      // if (response.ok) {
      //   const data = await response.json();
      //   setIntegrations(data.data);
      // }
    } catch (err) {
      console.error('Error loading integrations:', err);
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'delivery':
        return 'bg-blue-100 text-blue-700';
      case 'email':
        return 'bg-green-100 text-green-700';
      case 'messaging':
        return 'bg-purple-100 text-purple-700';
      case 'payment':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
            <X className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'error':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-600">
            Connect third-party services for delivery, payments, messaging, and more
          </p>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <CategoryCard
            title="Delivery"
            description="Uber Eats, DoorDash, Grubhub"
            icon="🚗"
            count={0}
          />
          <CategoryCard
            title="Payments"
            description="Stripe, Square, PayPal"
            icon="💳"
            count={0}
          />
          <CategoryCard
            title="Email"
            description="SendGrid, Mailgun"
            icon="📧"
            count={0}
          />
          <CategoryCard
            title="Messaging"
            description="Twilio, WhatsApp"
            icon="💬"
            count={0}
          />
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Plug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Integration Management Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            Connect delivery platforms, payment gateways, email services, and
            messaging providers. Test connections, manage credentials, and monitor
            status.
          </p>
          <div className="text-sm text-gray-500">
            IntegrationService and IntegrationRepository are ready. UI implementation
            in progress.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function CategoryCard({ title, description, icon, count }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="text-sm text-gray-500">{count} connected</div>
    </div>
  );
}
