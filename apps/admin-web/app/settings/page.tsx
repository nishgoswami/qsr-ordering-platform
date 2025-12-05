'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Store, 
  Globe, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Palette,
  Image,
  Save,
  Eye,
  Plus,
  X,
  Type,
  Sparkles,
  FileText,
  Zap,
  MessageSquare,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  badge?: string;
  buttonText?: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
  type: 'featured' | 'secondary';
  isActive: boolean;
  locationIds: string[]; // empty array means global (all locations)
  startDate?: string;
  endDate?: string;
  sortOrder: number;
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxRate: number;
  phone: string;
  email: string;
  isActive: boolean;
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  badge?: string;
  buttonText?: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
  type: 'featured' | 'secondary';
  isActive: boolean;
  locationIds: string[]; // empty array means global (all locations)
  startDate?: string;
  endDate?: string;
  sortOrder: number;
}

export default function SettingsPage() {
  return (
    <AdminLayout>
      <SettingsContent />
    </AdminLayout>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<'business' | 'website' | 'branding' | 'locations' | 'promotions' | 'integrations'>('business');

  // Business Info State
  const [businessInfo, setBusinessInfo] = useState({
    restaurantName: 'Restaurant Name',
    tagline: 'Delicious food delivered to your door',
    phone: '(555) 123-4567',
    email: 'hello@restaurant.com',
    website: 'www.restaurant.com',
  });

  // Website Content State
  const [websiteContent, setWebsiteContent] = useState({
    heroTitle: 'Authentic Gujarati Food',
    heroSubtitle: 'Delivered Fresh',
    heroDescription: 'Traditional Gujarati cuisine made with authentic recipes and the finest ingredients. From farsan to thali, experience homestyle flavors delivered to your door.',
    aboutTitle: 'About Us',
    aboutParagraph1: 'Welcome to our restaurant. We serve delicious food made with fresh ingredients and time-honored recipes.',
    aboutParagraph2: 'We pride ourselves on serving 100% vegetarian dishes that taste just like home. Whether you\'re craving dhokla, pani puri, or a full Gujarati thali, we\'re here to serve you authentic flavors that remind you of Gujarat.',
    footerText: '© 2025 Restaurant. All rights reserved.',
    // Section Visibility Controls
    showPopularItems: true,
    showOffers: true,
    showReviews: true,
    showWhyChooseUs: true,
    showStats: true,
  });

  // Branding State - Enhanced
  const [branding, setBranding] = useState({
    primaryColor: '#ea580c', // orange-600
    secondaryColor: '#dc2626', // red-600
    accentColor: '#f97316', // orange-500
    logoUrl: '',
    faviconUrl: '',
    fontFamily: 'Inter',
    buttonStyle: 'rounded' as 'rounded' | 'sharp' | 'pill',
    menuStyle: 'cards' as 'cards' | 'list' | 'grid',
  });

  // Locations State
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Main Location',
      address: '123 Main Street',
      city: 'City',
      state: 'CA',
      zip: '12345',
      country: 'United States',
      taxRate: 8.5,
      phone: '(555) 123-4567',
      email: 'main@restaurant.com',
      isActive: true,
      hours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false },
      },
    },
  ]);

  // Promotions State
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      title: 'Get 20% Off Your First Order!',
      description: 'Use code WELCOME20 at checkout. Valid for new customers only.',
      badge: '🔥 LIMITED TIME',
      buttonText: 'Order Now',
      backgroundColor: 'linear-gradient(to right, #f97316, #ef4444, #ec4899)',
      textColor: '#ffffff',
      type: 'featured',
      isActive: true,
      locationIds: [], // Global
      sortOrder: 1,
    },
    {
      id: '2',
      title: 'Free Delivery',
      description: 'On orders over $25',
      icon: '🚀',
      backgroundColor: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
      textColor: '#ffffff',
      type: 'secondary',
      isActive: true,
      locationIds: [],
      sortOrder: 2,
    },
    {
      id: '3',
      title: 'Loyalty Rewards',
      description: 'Earn points with every order',
      icon: '⭐',
      backgroundColor: 'linear-gradient(to bottom right, #a855f7, #9333ea)',
      textColor: '#ffffff',
      type: 'secondary',
      isActive: true,
      locationIds: [],
      sortOrder: 3,
    },
  ]);
  const [showAddPromotion, setShowAddPromotion] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);

  // Load data from database on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load restaurant and locations
      const { data: staffData } = await supabase
        .from('staff')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .single();

      if (!staffData) return;

      setRestaurantId(staffData.restaurant_id);

      // Load restaurant
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', staffData.restaurant_id)
        .single();

      if (restaurant) {
        setBusinessInfo({
          restaurantName: restaurant.name || '',
          tagline: restaurant.tagline || '',
          phone: restaurant.phone || '',
          email: restaurant.email || '',
          website: restaurant.website || ''
        });
      }

      // Load locations
      const { data: locationData } = await supabase
        .from('locations')
        .select('*')
        .eq('restaurant_id', staffData.restaurant_id)
        .eq('is_active', true);

      if (locationData && locationData.length > 0) {
        setLocations(locationData.map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          zip: loc.zip_code,
          country: 'United States',
          taxRate: 0,
          phone: loc.phone,
          email: loc.email,
          isActive: loc.is_active,
          hours: loc.business_hours || {
            monday: { open: '11:00', close: '22:00', closed: false },
            tuesday: { open: '11:00', close: '22:00', closed: false },
            wednesday: { open: '11:00', close: '22:00', closed: false },
            thursday: { open: '11:00', close: '22:00', closed: false },
            friday: { open: '11:00', close: '22:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false }
          }
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading settings');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!restaurantId) {
      alert('Restaurant ID not found');
      return;
    }

    try {
      setSaving(true);

      // Update restaurant
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .update({
          name: businessInfo.restaurantName,
          tagline: businessInfo.tagline,
          email: businessInfo.email,
          phone: businessInfo.phone,
          website: businessInfo.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (restaurantError) throw restaurantError;

      // Update locations
      for (const location of locations) {
        if (location.id.startsWith('new-')) {
          // Insert new location
          const { error } = await supabase
            .from('locations')
            .insert({
              restaurant_id: restaurantId,
              name: location.name,
              address: location.address,
              city: location.city,
              state: location.state,
              zip_code: location.zip,
              phone: location.phone,
              email: location.email,
              is_active: location.isActive,
              business_hours: location.hours
            });
          if (error) throw error;
        } else {
          // Update existing location
          const { error } = await supabase
            .from('locations')
            .update({
              name: location.name,
              address: location.address,
              city: location.city,
              state: location.state,
              zip_code: location.zip,
              phone: location.phone,
              email: location.email,
              is_active: location.isActive,
              business_hours: location.hours,
              updated_at: new Date().toISOString()
            })
            .eq('id', location.id);
          if (error) throw error;
        }
      }

      alert('Settings saved! (This will save to database in production)');
      setShowSaveConfirmation(false);
      
      // Reload data to ensure UI is in sync
      await loadData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const addLocation = () => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name: 'New Location',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      taxRate: 0,
      phone: '',
      email: '',
      isActive: true,
      hours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false },
      },
    };
    setLocations([...locations, newLocation]);
  };

  const removeLocation = (id: string) => {
    if (locations.length === 1) {
      alert('You must have at least one location');
      return;
    }
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, ...updates } : loc
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
                <p className="text-sm text-gray-600">Configure your business information and website</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open('/preview', '_blank')}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <Eye className="w-4 h-4" />
                Preview Website
              </button>
              <button
                onClick={() => setShowSaveConfirmation(true)}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition font-medium shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Tabs */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            <TabItem
              icon={Store}
              label="Business Information"
              active={activeTab === 'business'}
              onClick={() => setActiveTab('business')}
            />
            <TabItem
              icon={Globe}
              label="Website Content"
              active={activeTab === 'website'}
              onClick={() => setActiveTab('website')}
            />
            <TabItem
              icon={Palette}
              label="Branding & Theme"
              active={activeTab === 'branding'}
              onClick={() => setActiveTab('branding')}
            />
            <TabItem
              icon={MapPin}
              label="Locations"
              active={activeTab === 'locations'}
              onClick={() => setActiveTab('locations')}
            />
            <TabItem
              icon={Sparkles}
              label="Promotions"
              active={activeTab === 'promotions'}
              onClick={() => setActiveTab('promotions')}
            />
            <TabItem
              icon={Zap}
              label="Integrations"
              active={activeTab === 'integrations'}
              onClick={() => setActiveTab('integrations')}
            />
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-gray-700 mb-2">
                💡 <strong>Note:</strong> Delivery settings (fees, zones, times) are managed in the <strong>Delivery Zones</strong> module for each location.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
          <div className="max-w-4xl mx-auto pb-20">
            {/* Business Information Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-orange-600" />
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Restaurant Name *
                      </label>
                      <input
                        type="text"
                        value={businessInfo.restaurantName}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, restaurantName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Your Restaurant Name"
                      />
                      <p className="text-xs text-gray-500 mt-1">This appears on your website, menu, and all customer communications</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={businessInfo.tagline}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, tagline: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="A short, catchy description"
                      />
                      <p className="text-xs text-gray-500 mt-1">One-liner that describes your restaurant (e.g., "Fresh food, delivered fast")</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={businessInfo.phone}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={businessInfo.email}
                          onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="hello@restaurant.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Website URL
                      </label>
                      <input
                        type="text"
                        value={businessInfo.website}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="www.yourrestaurant.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional: Your custom domain (if you have one)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Website Content Tab */}
            {activeTab === 'website' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-600" />
                    Hero Section
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hero Title (Line 1)
                        </label>
                        <input
                          type="text"
                          value={websiteContent.heroTitle}
                          onChange={(e) => setWebsiteContent({ ...websiteContent, heroTitle: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Delicious Food"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hero Subtitle (Line 2 - Colored)
                        </label>
                        <input
                          type="text"
                          value={websiteContent.heroSubtitle}
                          onChange={(e) => setWebsiteContent({ ...websiteContent, heroSubtitle: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Delivered Fast"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hero Description
                      </label>
                      <textarea
                        value={websiteContent.heroDescription}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, heroDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="A brief description that appears below the hero title..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    About Section
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={websiteContent.aboutTitle}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, aboutTitle: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="About [Your Restaurant]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Paragraph 1
                      </label>
                      <textarea
                        value={websiteContent.aboutParagraph1}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, aboutParagraph1: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="Tell your restaurant's story..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Paragraph 2
                      </label>
                      <textarea
                        value={websiteContent.aboutParagraph2}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, aboutParagraph2: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="What makes you unique..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Footer Text
                      </label>
                      <input
                        type="text"
                        value={websiteContent.footerText}
                        onChange={(e) => setWebsiteContent({ ...websiteContent, footerText: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="© 2025 Your Restaurant. All rights reserved."
                      />
                    </div>
                  </div>
                </div>

                {/* Section Visibility Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Marketing Sections</h3>
                      <p className="text-sm text-gray-600">Control which sections appear on your website</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Popular Items Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-semibold text-gray-900">Popular Items Section</div>
                          <div className="text-sm text-gray-600">Shows customer favorite dishes with ratings</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={websiteContent.showPopularItems}
                          onChange={(e) => setWebsiteContent({ ...websiteContent, showPopularItems: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    {/* Offers & Deals Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-semibold text-gray-900">Special Offers & Deals</div>
                          <div className="text-sm text-gray-600">Displays promotional offers and loyalty program</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={websiteContent.showOffers}
                          onChange={(e) => setWebsiteContent({ ...websiteContent, showOffers: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    {/* Customer Reviews Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-semibold text-gray-900">Customer Reviews</div>
                          <div className="text-sm text-gray-600">Shows testimonials from satisfied customers</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={websiteContent.showReviews}
                          onChange={(e) => setWebsiteContent({ ...websiteContent, showReviews: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    {/* Why Choose Us Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-semibold text-gray-900">Why Choose Us Section</div>
                          <div className="text-sm text-gray-600">Highlights your unique value propositions</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={websiteContent.showWhyChooseUs}
                          onChange={(e) => setWebsiteContent({ ...websiteContent, showWhyChooseUs: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    {/* Stats Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-semibold text-gray-900">Social Proof Stats</div>
                          <div className="text-sm text-gray-600">Shows customer count, ratings, and order stats</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={websiteContent.showStats}
                          onChange={(e) => setWebsiteContent({ ...websiteContent, showStats: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Hide sections temporarily during special events or seasonal campaigns. Changes apply immediately to your live website.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Pro Tip
                  </h3>
                  <p className="text-sm text-gray-700">
                    Keep your content concise and engaging. Highlight what makes your restaurant special and use your authentic voice. The menu categories you create will automatically appear on the website!
                  </p>
                </div>
              </div>
            )}

            {/* Branding & Theme Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-orange-600" />
                    Color Scheme
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.primaryColor}
                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                            className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                            title="Primary Color"
                          />
                          <input
                            type="text"
                            value={branding.primaryColor}
                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                            placeholder="#ea580c"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Main brand color (buttons, headers)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.secondaryColor}
                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                            className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                            title="Secondary Color"
                          />
                          <input
                            type="text"
                            value={branding.secondaryColor}
                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                            placeholder="#dc2626"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Gradient end color</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.accentColor}
                            onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                            className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                            title="Accent Color"
                          />
                          <input
                            type="text"
                            value={branding.accentColor}
                            onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                            placeholder="#f97316"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Highlights & badges</p>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="mt-6 p-6 border-2 border-gray-200 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Live Preview:</p>
                      <div className="space-y-3">
                        <button 
                          className="px-6 py-3 rounded-lg text-white font-semibold shadow-md"
                          style={{ 
                            background: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})` 
                          }}
                        >
                          Add to Cart
                        </button>
                        <div 
                          className="inline-block px-4 py-2 rounded-full text-white text-sm font-bold"
                          style={{ backgroundColor: branding.accentColor }}
                        >
                          🔥 Popular
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Image className="w-5 h-5 text-orange-600" />
                    Logos & Assets
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={branding.logoUrl}
                        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-sm text-gray-500 mt-2">Recommended: 200x200px PNG with transparent background</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Favicon URL
                      </label>
                      <input
                        type="url"
                        value={branding.faviconUrl}
                        onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://example.com/favicon.ico"
                      />
                      <p className="text-sm text-gray-500 mt-2">Recommended: 32x32px or 64x64px ICO or PNG</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Type className="w-5 h-5 text-orange-600" />
                    Typography & Style
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={branding.fontFamily}
                        onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="Inter">Inter (Default)</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Lato">Lato</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Button Style
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setBranding({ ...branding, buttonStyle: 'rounded' })}
                          className={`p-4 border-2 rounded-xl text-center transition ${
                            branding.buttonStyle === 'rounded'
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="w-full h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg mb-2"></div>
                          <span className="text-sm font-medium">Rounded</span>
                        </button>

                        <button
                          onClick={() => setBranding({ ...branding, buttonStyle: 'sharp' })}
                          className={`p-4 border-2 rounded-xl text-center transition ${
                            branding.buttonStyle === 'sharp'
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="w-full h-10 bg-gradient-to-r from-orange-600 to-red-600 mb-2"></div>
                          <span className="text-sm font-medium">Sharp</span>
                        </button>

                        <button
                          onClick={() => setBranding({ ...branding, buttonStyle: 'pill' })}
                          className={`p-4 border-2 rounded-xl text-center transition ${
                            branding.buttonStyle === 'pill'
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="w-full h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mb-2"></div>
                          <span className="text-sm font-medium">Pill</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Menu Display Style
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setBranding({ ...branding, menuStyle: 'cards' })}
                          className={`p-4 border-2 rounded-xl text-center transition ${
                            branding.menuStyle === 'cards'
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="space-y-2 mb-2">
                            <div className="w-full h-6 bg-gray-300 rounded"></div>
                            <div className="w-full h-4 bg-gray-200 rounded"></div>
                          </div>
                          <span className="text-sm font-medium">Cards</span>
                        </button>

                        <button
                          onClick={() => setBranding({ ...branding, menuStyle: 'list' })}
                          className={`p-4 border-2 rounded-xl text-center transition ${
                            branding.menuStyle === 'list'
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="space-y-1 mb-2">
                            <div className="w-full h-3 bg-gray-300 rounded"></div>
                            <div className="w-full h-3 bg-gray-300 rounded"></div>
                            <div className="w-full h-3 bg-gray-300 rounded"></div>
                          </div>
                          <span className="text-sm font-medium">List</span>
                        </button>

                        <button
                          onClick={() => setBranding({ ...branding, menuStyle: 'grid' })}
                          className={`p-4 border-2 rounded-xl text-center transition ${
                            branding.menuStyle === 'grid'
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-1 mb-2">
                            <div className="h-6 bg-gray-300 rounded"></div>
                            <div className="h-6 bg-gray-300 rounded"></div>
                            <div className="h-6 bg-gray-300 rounded"></div>
                            <div className="h-6 bg-gray-300 rounded"></div>
                          </div>
                          <span className="text-sm font-medium">Grid</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Locations & Tax Tab */}
            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      Restaurant Locations
                    </h2>
                    <button
                      onClick={addLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition font-medium shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add Location
                    </button>
                  </div>

                  <div className="space-y-6">
                    {locations.map((location, index) => (
                      <div key={location.id} className="border-2 border-gray-200 rounded-lg p-6 relative">
                        {locations.length > 1 && (
                          <button
                            onClick={() => removeLocation(location.id)}
                            className="absolute top-4 right-4 p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                            title="Remove Location"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                          <Store className="w-5 h-5 text-orange-600" />
                          Location {index + 1}
                        </h3>

                        {/* Basic Info */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Location Name *
                            </label>
                            <input
                              type="text"
                              value={location.name}
                              onChange={(e) => updateLocation(location.id, { name: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Main Location, Downtown Branch, etc."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                value={location.phone}
                                onChange={(e) => updateLocation(location.id, { phone: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="(555) 123-4567"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                Email Address *
                              </label>
                              <input
                                type="email"
                                value={location.email}
                                onChange={(e) => updateLocation(location.id, { email: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="location@restaurant.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              value={location.address}
                              onChange={(e) => updateLocation(location.id, { address: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="123 Main Street"
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                value={location.city}
                                onChange={(e) => updateLocation(location.id, { city: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="City"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                State/Province *
                              </label>
                              <input
                                type="text"
                                value={location.state}
                                onChange={(e) => updateLocation(location.id, { state: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="CA"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ZIP/Postal *
                              </label>
                              <input
                                type="text"
                                value={location.zip}
                                onChange={(e) => updateLocation(location.id, { zip: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="12345"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Country *
                              </label>
                              <select
                                value={location.country}
                                onChange={(e) => updateLocation(location.id, { country: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                title="Select Country"
                              >
                                <option value="United States">United States</option>
                                <option value="Canada">Canada</option>
                                <option value="India">India</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Australia">Australia</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tax Rate (%) *
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={location.taxRate}
                                  onChange={(e) => updateLocation(location.id, { taxRate: parseFloat(e.target.value) })}
                                  className="w-full pr-12 pl-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                  placeholder="8.5"
                                  title="Tax Rate"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-2">
                                Tax rate specific to this location's jurisdiction
                              </p>
                            </div>

                            <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={location.isActive}
                                  onChange={(e) => updateLocation(location.id, { isActive: e.target.checked })}
                                  className="w-5 h-5 text-orange-600 rounded"
                                  id={`active-${location.id}`}
                                  title="Active Location"
                                />
                                <label htmlFor={`active-${location.id}`} className="font-semibold text-gray-900">
                                  Active Location
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="border-t-2 border-gray-200 pt-6">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-600" />
                            Operating Hours
                          </h4>

                          <div className="space-y-2">
                            {Object.entries(location.hours).map(([day, times]) => (
                              <div key={day} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="w-28">
                                  <span className="font-semibold text-gray-900 capitalize text-sm">{day}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`closed-${location.id}-${day}`}
                                    checked={times.closed}
                                    onChange={(e) => {
                                      const updatedHours = {
                                        ...location.hours,
                                        [day]: { ...times, closed: e.target.checked }
                                      };
                                      updateLocation(location.id, { hours: updatedHours });
                                    }}
                                    className="w-4 h-4 text-orange-600 rounded"
                                    title={`Closed on ${day}`}
                                  />
                                  <label htmlFor={`closed-${location.id}-${day}`} className="text-sm text-gray-600">Closed</label>
                                </div>

                                {!times.closed && (
                                  <>
                                    <input
                                      type="time"
                                      value={times.open}
                                      onChange={(e) => {
                                        const updatedHours = {
                                          ...location.hours,
                                          [day]: { ...times, open: e.target.value }
                                        };
                                        updateLocation(location.id, { hours: updatedHours });
                                      }}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                      title={`Opening time for ${day}`}
                                    />
                                    <span className="text-gray-600 text-sm">to</span>
                                    <input
                                      type="time"
                                      value={times.close}
                                      onChange={(e) => {
                                        const updatedHours = {
                                          ...location.hours,
                                          [day]: { ...times, close: e.target.value }
                                        };
                                        updateLocation(location.id, { hours: updatedHours });
                                      }}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                      title={`Closing time for ${day}`}
                                    />
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Multi-Location Configuration
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Each location has its own hours, contact info, and tax rate</li>
                    <li>• Customers can select their preferred location or enter delivery address</li>
                    <li>• Menu items and prices can be customized per location (configured in Menu module)</li>
                    <li>• Delivery zones and fees are configured per location in the <strong>Delivery Zones</strong> module</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Promotions Tab */}
            {activeTab === 'promotions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Promotions & Deals</h2>
                    <p className="text-gray-600 mt-1">Manage promotional banners displayed on your menu page</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPromotion(null);
                      setShowAddPromotion(true);
                    }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Plus className="w-5 h-5" />
                    Add Promotion
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Promotions are automatically displayed on the customer menu page. You can create global promotions for all locations or target specific locations.
                  </p>
                </div>

                {/* Promotions List */}
                <div className="space-y-4">
                  {promotions.sort((a, b) => a.sortOrder - b.sortOrder).map((promo) => (
                    <div
                      key={promo.id}
                      className="bg-white rounded-xl border-2 border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{promo.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              promo.type === 'featured' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {promo.type === 'featured' ? 'Featured Banner' : 'Small Card'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              promo.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {promo.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{promo.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              📍 {promo.locationIds.length === 0 
                                ? 'All Locations (Global)' 
                                : `${promo.locationIds.length} Location${promo.locationIds.length > 1 ? 's' : ''}`
                              }
                            </span>
                            {promo.badge && <span>🏷️ {promo.badge}</span>}
                            {promo.icon && <span>{promo.icon}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPromotions(promotions.map(p => 
                                p.id === promo.id ? { ...p, isActive: !p.isActive } : p
                              ));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                              promo.isActive
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {promo.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this promotion?')) {
                                setPromotions(promotions.filter(p => p.id !== promo.id));
                              }
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                        <div
                          className="rounded-lg p-4"
                          style={{ background: promo.backgroundColor, color: promo.textColor }}
                        >
                          {promo.badge && (
                            <div className="inline-block bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold mb-2">
                              {promo.badge}
                            </div>
                          )}
                          <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
                          <p className="text-sm opacity-90 mb-2">{promo.description}</p>
                          {promo.buttonText && (
                            <button className="bg-white text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold">
                              {promo.buttonText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {promotions.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No promotions yet</p>
                      <p className="text-sm text-gray-500 mt-1">Create your first promotion to engage customers</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-orange-600" />
                      Third-Party Integrations
                    </h2>
                    <p className="text-gray-600 mt-1">Connect delivery platforms, email, messaging, and payment services</p>
                  </div>
                  <Link
                    href="/settings/integrations"
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg transition font-medium shadow-md"
                  >
                    <Zap className="w-5 h-5" />
                    Manage Integrations
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delivery Platforms */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Delivery Platforms</h3>
                        <p className="text-sm text-gray-600">Uber Eats, Skip The Dishes, DoorDash</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Receive orders from third-party delivery apps directly to your kitchen tablet
                    </p>
                    <Link
                      href="/settings/integrations"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      Configure →
                    </Link>
                  </div>

                  {/* Email Services */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Email Services</h3>
                        <p className="text-sm text-gray-600">O365, Google, SendGrid</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Send order confirmations and notifications via email
                    </p>
                    <Link
                      href="/settings/integrations"
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                    >
                      Configure →
                    </Link>
                  </div>

                  {/* Messaging */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Messaging Services</h3>
                        <p className="text-sm text-gray-600">WhatsApp, Twilio SMS, 3CX</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Send SMS and WhatsApp notifications to customers
                    </p>
                    <Link
                      href="/settings/integrations"
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                    >
                      Configure →
                    </Link>
                  </div>

                  {/* Payment Processors */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Payment Processors</h3>
                        <p className="text-sm text-gray-600">Stripe, Square, PayPal</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Accept online payments from your customers
                    </p>
                    <Link
                      href="/settings/integrations"
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                    >
                      Configure →
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Integration Benefits
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Receive orders from all platforms in one place</li>
                    <li>• Automatic order synchronization with your kitchen</li>
                    <li>• Unified customer notifications across channels</li>
                    <li>• Centralized payment processing and reporting</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Save Confirmation Modal */}
      {showSaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Changes</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save these changes? This will update your restaurant information and website immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveConfirmation(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Yes, Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabItem({ icon: Icon, label, active, onClick }: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
        active
          ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 font-medium border-2 border-orange-200'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
