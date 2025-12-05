'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor, Tablet, Smartphone, Calendar, Rocket, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export default function PreviewWebsite() {
  const router = useRouter();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploymentScheduled, setDeploymentScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    loadRestaurantData();
  }, []);

  async function loadRestaurantData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: staffData } = await supabase
      .from('staff')
      .select('restaurant_id')
      .eq('user_id', user.id)
      .single();

    if (staffData) {
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', staffData.restaurant_id)
        .single();
      
      setRestaurant(restaurantData);
    }
  }

  const websiteUrl = restaurant?.slug 
    ? `https://restaurant-website-ruby-five.vercel.app/?preview=${restaurant.slug}&t=${Date.now()}`
    : `https://restaurant-website-ruby-five.vercel.app/?t=${Date.now()}`;

  const handleDeploy = () => {
    setShowDeployModal(true);
  };

  const handleDeployNow = () => {
    // In production, this would trigger a Vercel deployment
    alert('Deployment initiated! Your website will be live in a few moments.');
    setShowDeployModal(false);
  };

  const handleScheduleDeploy = () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select both date and time');
      return;
    }
    setDeploymentScheduled(true);
    alert(`Deployment scheduled for ${scheduleDate} at ${scheduleTime}`);
    setShowDeployModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Settings</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Website Preview</h1>
            </div>
            
            <button
              onClick={handleDeploy}
              className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium shadow-sm"
            >
              <Rocket className="w-5 h-5" />
              Deploy Website
            </button>
          </div>
        </div>
      </div>

      {/* Device Selector */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedDevice('mobile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              selectedDevice === 'mobile'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            iPhone
          </button>
          <button
            onClick={() => setSelectedDevice('tablet')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              selectedDevice === 'tablet'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Tablet className="w-5 h-5" />
            iPad
          </button>
          <button
            onClick={() => setSelectedDevice('desktop')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              selectedDevice === 'desktop'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Monitor className="w-5 h-5" />
            MacBook
          </button>
        </div>

        {/* Device Mockups */}
        <div className="flex items-center justify-center min-h-[600px] py-8">
          {/* iPhone Mockup */}
          {selectedDevice === 'mobile' && (
            <div className="relative">
              {/* iPhone Frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-inner" style={{ width: '375px', height: '667px' }}>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-b-3xl h-7 w-40 z-10"></div>
                  
                  {/* Screen Content */}
                  <iframe
                    src={websiteUrl}
                    className="w-full h-full border-0"
                    title="Mobile Preview"
                  />
                </div>
                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-300 rounded-full h-1 w-32"></div>
              </div>
              <div className="text-center mt-6">
                <p className="text-lg font-semibold text-gray-900">iPhone 13 Pro</p>
                <p className="text-sm text-gray-500">375 × 667 pixels</p>
              </div>
            </div>
          )}

          {/* iPad Mockup */}
          {selectedDevice === 'tablet' && (
            <div className="relative">
              {/* iPad Frame */}
              <div className="relative bg-gray-900 rounded-[2rem] p-4 shadow-2xl">
                <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-inner" style={{ width: '768px', height: '1024px', maxHeight: '70vh' }}>
                  {/* Camera */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full h-2 w-2 z-10"></div>
                  
                  {/* Screen Content */}
                  <iframe
                    src={websiteUrl}
                    className="w-full h-full border-0"
                    title="Tablet Preview"
                  />
                </div>
                {/* Home Button */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full h-10 w-10 border-2 border-gray-700"></div>
              </div>
              <div className="text-center mt-6">
                <p className="text-lg font-semibold text-gray-900">iPad Pro</p>
                <p className="text-sm text-gray-500">768 × 1024 pixels</p>
              </div>
            </div>
          )}

          {/* MacBook Mockup */}
          {selectedDevice === 'desktop' && (
            <div className="relative">
              {/* MacBook Frame */}
              <div className="relative">
                {/* Screen */}
                <div className="bg-gray-900 rounded-t-xl p-2 shadow-2xl">
                  <div className="bg-white rounded-lg overflow-hidden shadow-inner" style={{ width: '1280px', height: '800px', maxWidth: '90vw', maxHeight: '60vh' }}>
                    {/* Camera */}
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-gray-400 rounded-full h-1.5 w-1.5 z-10"></div>
                    
                    {/* Screen Content */}
                    <iframe
                      src={websiteUrl}
                      className="w-full h-full border-0"
                      title="Desktop Preview"
                    />
                  </div>
                </div>
                {/* Base */}
                <div className="h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-xl shadow-lg" style={{ width: 'calc(100% + 100px)', marginLeft: '-50px' }}></div>
                {/* Keyboard Area */}
                <div className="h-1 bg-gray-200 rounded-b-lg shadow-inner" style={{ width: 'calc(100% + 120px)', marginLeft: '-60px' }}></div>
              </div>
              <div className="text-center mt-6">
                <p className="text-lg font-semibold text-gray-900">MacBook Pro</p>
                <p className="text-sm text-gray-500">1280 × 800 pixels</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Deploy Website</h2>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Deploy Now */}
              <button
                onClick={handleDeployNow}
                className="w-full flex items-center justify-between p-4 border-2 border-orange-600 rounded-xl hover:bg-orange-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Rocket className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Deploy Now</p>
                    <p className="text-sm text-gray-500">Go live immediately</p>
                  </div>
                </div>
              </button>

              {/* Schedule Deployment */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Schedule Deployment</p>
                    <p className="text-sm text-gray-500">Choose a future date/time</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleScheduleDeploy}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Schedule Deployment
                  </button>
                </div>
              </div>
            </div>

            {deploymentScheduled && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Deployment scheduled for {scheduleDate} at {scheduleTime}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
