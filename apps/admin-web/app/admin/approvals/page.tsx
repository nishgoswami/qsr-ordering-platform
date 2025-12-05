'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { getCurrentUser } from '../../../lib/auth';
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin, RefreshCw } from 'lucide-react';

interface PendingRestaurant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  approval_status: string;
  created_at: string;
  staff: Array<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }>;
}

export default function ApprovalsPage() {
  const [restaurants, setRestaurants] = useState<PendingRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        staff (first_name, last_name, email, phone)
      `)
      .in('approval_status', ['pending', 'rejected'])
      .order('created_at', { ascending: false });

    if (data) {
      setRestaurants(data);
    }

    setLoading(false);
  };

  const approveRestaurant = async (restaurantId: string) => {
    setActionLoading(restaurantId);

    const { user } = await getCurrentUser();

    const { error } = await supabase
      .from('restaurants')
      .update({
        approval_status: 'approved',
        is_active: true,
        subscription_status: 'active',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', restaurantId);

    if (!error) {
      // Remove from list
      setRestaurants(restaurants.filter(r => r.id !== restaurantId));
      
      // TODO: Send approval email to restaurant
      alert('Restaurant approved! (Email notification would be sent here)');
    } else {
      alert('Failed to approve restaurant');
    }

    setActionLoading(null);
  };

  const rejectRestaurant = async (restaurantId: string) => {
    const reason = prompt('Reason for rejection (will be shown to user):');
    if (!reason) return;

    setActionLoading(restaurantId);

    const { error } = await supabase
      .from('restaurants')
      .update({
        approval_status: 'rejected',
        is_active: false,
        rejection_reason: reason,
      })
      .eq('id', restaurantId);

    if (!error) {
      // Update in list
      fetchPendingRestaurants();
      
      // TODO: Send rejection email to restaurant
      alert('Restaurant rejected. (Email notification would be sent here)');
    } else {
      alert('Failed to reject restaurant');
    }

    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  const pendingCount = restaurants.filter(r => r.approval_status === 'pending').length;
  const rejectedCount = restaurants.filter(r => r.approval_status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Approvals</h1>
            <p className="text-gray-600 mt-1">Review and approve new restaurant signups</p>
          </div>
          <button
            onClick={fetchPendingRestaurants}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant List */}
        {restaurants.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-600">No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Restaurant Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          restaurant.approval_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {restaurant.approval_status === 'pending' ? 'Pending' : 'Rejected'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                      {/* Owner Info */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Owner Details</p>
                        {restaurant.staff && restaurant.staff[0] && (
                          <>
                            <p className="text-sm text-gray-900">
                              {restaurant.staff[0].first_name} {restaurant.staff[0].last_name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Mail className="w-4 h-4" />
                              {restaurant.staff[0].email}
                            </div>
                            {restaurant.staff[0].phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Phone className="w-4 h-4" />
                                {restaurant.staff[0].phone}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Restaurant Details */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Restaurant Details</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {restaurant.email}
                        </div>
                        {restaurant.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone}
                          </div>
                        )}
                        {restaurant.address && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zip_code}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Signed up: {new Date(restaurant.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Slug: {restaurant.slug}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {restaurant.approval_status === 'pending' && (
                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => approveRestaurant(restaurant.id)}
                        disabled={actionLoading === restaurant.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectRestaurant(restaurant.id)}
                        disabled={actionLoading === restaurant.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
