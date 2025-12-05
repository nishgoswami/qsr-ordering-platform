'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRestaurant, logout } from '../../lib/auth';
import { Clock, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApprovalStatus();
  }, []);

  const checkApprovalStatus = async () => {
    const result = await getUserRestaurant();
    
    if (result.success && result.restaurant) {
      const rest = result.restaurant;
      setRestaurant(rest);

      // If approved, redirect to dashboard
      if (rest.approval_status === 'approved' && rest.is_active) {
        router.push('/');
      }
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isPending = restaurant?.approval_status === 'pending';
  const isRejected = restaurant?.approval_status === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Status Icon */}
          <div className="text-center mb-6">
            {isPending && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Account Pending Approval
                </h1>
                <p className="text-gray-600">
                  Thanks for signing up! We're reviewing your application.
                </p>
              </>
            )}

            {isRejected && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Application Not Approved
                </h1>
                <p className="text-gray-600">
                  Unfortunately, we couldn't approve your application at this time.
                </p>
              </>
            )}
          </div>

          {/* Restaurant Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Your Application</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Restaurant Name</p>
                <p className="font-medium text-gray-900">{restaurant?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{restaurant?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{restaurant?.phone || 'Not provided'}</p>
                </div>
              </div>
              {restaurant?.address && (
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zip_code}
                  </p>
                </div>
              )}
            </div>
          </div>

          {isPending && (
            <>
              {/* What Happens Next */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Review Process</p>
                      <p className="text-sm text-gray-600">
                        Our team will review your application within 24-48 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Notification</p>
                      <p className="text-sm text-gray-600">
                        You'll receive an email at <span className="font-medium">{restaurant?.email}</span> once approved
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Start Using</p>
                      <p className="text-sm text-gray-600">
                        Once approved, you'll get full access to your dashboard
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={checkApprovalStatus}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
              >
                Check Approval Status
              </button>
            </>
          )}

          {isRejected && restaurant?.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-red-900 mb-2">Reason:</p>
              <p className="text-red-700">{restaurant.rejection_reason}</p>
            </div>
          )}

          {/* Contact Support */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need help?</h3>
            <div className="space-y-2">
              <a
                href="mailto:support@yourplatform.com"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@yourplatform.com</span>
              </a>
              <a
                href="tel:+15550100"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 0100</span>
              </a>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
