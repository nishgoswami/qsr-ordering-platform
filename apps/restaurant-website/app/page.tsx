'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Mail, Star, ChefHat, Truck, Heart, ChevronDown, Award, TrendingUp, Gift, Users } from 'lucide-react';
import { 
  getRestaurant,
  getLocations,
  getRestaurantSettings,
  formatLocationAddress, 
  formatHours, 
  isLocationOpenNow,
  getTodayHours,
  type Restaurant,
  type Location,
  type Settings
} from '@/lib/database';

export const dynamic = 'force-dynamic';

export default function RestaurantHomepage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('Starting to load restaurant data...');
        
        // Load restaurant data
        const restaurantData = await getRestaurant();
        console.log('Restaurant data:', restaurantData);
        
        if (restaurantData) {
          setRestaurant(restaurantData);
          
          // Load locations
          const locationData = await getLocations(restaurantData.id);
          console.log('Location data:', locationData);
          setLocations(locationData);
          if (locationData.length > 0) {
            setSelectedLocation(locationData[0]);
          }
          
          // Load settings
          const settingsData = await getRestaurantSettings(restaurantData.id);
          console.log('Settings data:', settingsData);
          setSettings(settingsData);
        } else {
          console.log('No restaurant found');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const orderingUrl = settings?.ordering_url || 'http://localhost:3000/menu';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-orange-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{restaurant.name}</span>
              
              {/* Location Selector */}
              {selectedLocation && locations.length > 1 && (
                <div className="relative ml-4">
                  <button
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                  >
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">{selectedLocation.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {locations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setSelectedLocation(location);
                            setShowLocationDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                            selectedLocation.id === location.id ? 'bg-orange-50' : ''
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{location.name}</div>
                          <div className="text-sm text-gray-600">{location.city}, {location.state}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-gray-700 hover:text-orange-600 transition">About</a>
              <a href="#menu" className="text-gray-700 hover:text-orange-600 transition">Menu</a>
              <a href="#hours" className="text-gray-700 hover:text-orange-600 transition">Hours</a>
              <a href="#contact" className="text-gray-700 hover:text-orange-600 transition">Contact</a>
              <a 
                href={orderingUrl}
                className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition font-medium"
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {selectedLocation && (
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                <div className={`w-2 h-2 rounded-full ${
                  isLocationOpenNow(selectedLocation) 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isLocationOpenNow(selectedLocation) 
                    ? `Open Now • ${getTodayHours(selectedLocation)}` 
                    : `Closed • Opens ${getTodayHours(selectedLocation)}`}
                </span>
              </div>
            )}
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Authentic Gujarati Food,
              <br />
              <span className="text-orange-600">Delivered Fresh</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Traditional Gujarati cuisine made with authentic recipes and the finest ingredients. From farsan to thali, experience homestyle flavors delivered to your door.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={orderingUrl}
                className="bg-orange-600 text-white px-8 py-4 rounded-full hover:bg-orange-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                🍽️ See Menu & Order
              </a>
              <a 
                href="#about"
                className="bg-white text-gray-900 px-8 py-4 rounded-full hover:bg-gray-50 transition font-semibold text-lg border-2 border-gray-200"
              >
                Learn More
              </a>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-700 font-medium">4.8/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-gray-700 font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span className="text-gray-700 font-medium">500+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items */}
      {settings?.showPopularItems !== false && (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-orange-900 font-semibold">Customer Favorites</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Most Popular Dishes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Try our most-loved items that keep our customers coming back
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Gujarati Thali */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden group">
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center overflow-hidden">
                <span className="text-8xl group-hover:scale-110 transition-transform">🍽️</span>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Gujarati Thali</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Complete meal with vegetables, dal, kadhi, rice, rotis, farsan & sweet
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">4.9</span>
                    <span className="text-xs text-gray-500">(1456 reviews)</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">$16.99</span>
                </div>
              </div>
            </div>

            {/* Dhokla */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden group">
              <div className="relative h-48 bg-gradient-to-br from-yellow-100 to-orange-50 flex items-center justify-center overflow-hidden">
                <span className="text-8xl group-hover:scale-110 transition-transform">🧈</span>
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  🌱 Vegan
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dhokla</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Steamed gram flour cake with mustard seeds & curry leaves
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">4.8</span>
                    <span className="text-xs text-gray-500">(567 reviews)</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">$6.99</span>
                </div>
              </div>
            </div>

            {/* Pav Bhaji */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden group">
              <div className="relative h-48 bg-gradient-to-br from-red-100 to-orange-50 flex items-center justify-center overflow-hidden">
                <span className="text-8xl group-hover:scale-110 transition-transform">🍞</span>
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  🌶️ Spicy
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pav Bhaji</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Spicy mixed vegetable curry with buttered pav bread
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">4.7</span>
                    <span className="text-xs text-gray-500">(723 reviews)</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">$8.99</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a 
              href={orderingUrl}
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-full hover:bg-orange-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              View Full Menu
            </a>
          </div>
        </div>
      </section>
      )}

      {/* Current Offers */}
      {settings?.showOffers !== false && (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
              <Gift className="w-5 h-5 text-orange-600" />
              <span className="text-orange-900 font-semibold">Limited Time</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Special Offers & Deals</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don&apos;t miss out on our exclusive offers and seasonal specials
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Tiffin Service Offer */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-200">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold opacity-90">WEEKLY SPECIAL</div>
                    <div className="text-2xl font-bold">15% OFF</div>
                  </div>
                  <div className="text-5xl opacity-20">🍱</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tiffin Subscription</h3>
                <p className="text-gray-600 mb-4">
                  Subscribe to our weekly tiffin service and save 15% on your first month. Fresh homestyle food delivered daily!
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Valid until end of month</span>
                </div>
                <a 
                  href={orderingUrl}
                  className="block w-full text-center bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  Subscribe Now
                </a>
              </div>
            </div>

            {/* Family Bundle */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-green-200">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold opacity-90">FAMILY DEAL</div>
                    <div className="text-2xl font-bold">$5 OFF</div>
                  </div>
                  <div className="text-5xl opacity-20">👨‍👩‍👧‍👦</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Family Bundle</h3>
                <p className="text-gray-600 mb-4">
                  Order 3+ thalis and get $5 off your order. Perfect for family dinners or gatherings!
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Gift className="w-4 h-4" />
                  <span>Auto-applied at checkout</span>
                </div>
                <a 
                  href={orderingUrl}
                  className="block w-full text-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Order Family Bundle
                </a>
              </div>
            </div>
          </div>

          {/* Loyalty Program Teaser */}
          <div className="mt-12 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Join Our Rewards Program</h3>
            <p className="text-gray-600 mb-6">
              Earn points with every order, get exclusive deals, and enjoy birthday surprises. Sign up for free!
            </p>
            <a 
              href={orderingUrl}
              className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition font-semibold"
            >
              Sign Up Free
            </a>
          </div>
        </div>
      </section>
      )}

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{settings?.about_title || 'About Us'}</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              {settings?.about_paragraph_1 || restaurant.description}
            </p>
            {settings?.about_paragraph_2 && (
              <p className="text-lg text-gray-600 leading-relaxed mt-4">
                {settings.about_paragraph_2}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced Marketing */}
      {settings?.showWhyChooseUs !== false && (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose {restaurant.name}?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy customers who trust us for authentic Gujarati cuisine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authentic Recipes</h3>
              <p className="text-gray-600 mb-4">
                Traditional Gujarati recipes passed down through generations, made with authentic spices and techniques.
              </p>
              <div className="text-sm text-orange-600 font-semibold">20+ Years Experience</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Fresh Delivery</h3>
              <p className="text-gray-600 mb-4">
                Hot, fresh food delivered to your door in 30-45 minutes. Real-time tracking and temperature-controlled packaging.
              </p>
              <div className="text-sm text-orange-600 font-semibold">99% On-Time Delivery</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Guaranteed</h3>
              <p className="text-gray-600 mb-4">
                Fresh ingredients sourced daily. If you&apos;re not satisfied, we&apos;ll make it right - guaranteed.
              </p>
              <div className="text-sm text-orange-600 font-semibold">100% Money-Back Promise</div>
            </div>
          </div>

          {/* Social Proof Stats */}
          {settings?.showStats !== false && (
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">2000+</div>
              <div className="text-gray-600 font-medium">Orders Delivered</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">85%</div>
              <div className="text-gray-600 font-medium">Repeat Customers</div>
            </div>
          </div>
          )}
        </div>
      </section>
      )}

      {/* Customer Reviews */}
      {settings?.showReviews !== false && (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-orange-900 font-semibold">Customer Love</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real reviews from real customers who love our food
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Review 1 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                &quot;The Gujarati Thali is absolutely amazing! Reminds me of my grandmother&apos;s cooking. Fresh, authentic, and delicious every single time.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl font-bold text-orange-700">
                  P
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Priya Shah</div>
                  <div className="text-sm text-gray-500">Regular Customer</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                &quot;Best tiffin service in the area! The food is always hot, portions are generous, and delivery is super fast. Highly recommend!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl font-bold text-orange-700">
                  R
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Raj Patel</div>
                  <div className="text-sm text-gray-500">Tiffin Subscriber</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                &quot;Finally found authentic Gujarati food! The dhokla and khaman are just like back home. Customer service is excellent too!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl font-bold text-orange-700">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Meera Desai</div>
                  <div className="text-sm text-gray-500">Weekly Orderer</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Join our community of satisfied customers</p>
            <a 
              href={orderingUrl}
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-full hover:bg-orange-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Place Your First Order
            </a>
          </div>
        </div>
      </section>
      )}

      {/* Menu Preview */}
      <section id="menu" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h2>
            <p className="text-lg text-gray-600 mb-8">
              Explore our authentic Gujarati dishes - from farsan to thali, tiffin service to sweets
            </p>
            <a 
              href={orderingUrl}
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-full hover:bg-orange-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              View Full Menu & Order
            </a>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            {['🥟 Farsan', '🍽️ Thali', '🌮 Street Food', '🍬 Sweets'].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl text-center hover:shadow-lg transition">
                <div className="text-6xl mb-4">{item.split(' ')[0]}</div>
                <h3 className="text-xl font-semibold text-gray-900">{item.split(' ')[1]}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours & Location */}
      <section id="hours" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Hours & Location</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">Opening Hours</h3>
                </div>
                {selectedLocation && (
                  <div className="space-y-3">
                    {Object.entries(selectedLocation.business_hours || {}).map(([day]) => (
                      <div key={day} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700 font-medium capitalize">{day}</span>
                        <span className="text-gray-900">{formatHours(String(day), selectedLocation)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">Location</h3>
                </div>
                {selectedLocation && (
                  <>
                    <p className="text-gray-700 mb-4">
                      <strong>{selectedLocation.name}</strong><br />
                      {selectedLocation.address}<br />
                      {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip_code}<br />
                      {selectedLocation.country}
                    </p>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(formatLocationAddress(selectedLocation))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Get Directions →
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-600 mb-8">
              Have questions? We&apos;d love to hear from you.
            </p>
            
            {selectedLocation && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <a 
                  href={`tel:${selectedLocation.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl hover:bg-gray-100 transition"
                >
                  <Phone className="w-5 h-5 text-orange-600" />
                  <div className="text-left">
                    <div className="text-sm text-gray-600">Call us</div>
                    <div className="font-semibold text-gray-900">{selectedLocation.phone}</div>
                  </div>
                </a>
                
                <a 
                  href={`mailto:${selectedLocation.email}`}
                  className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl hover:bg-gray-100 transition"
                >
                  <Mail className="w-5 h-5 text-orange-600" />
                  <div className="text-left">
                    <div className="text-sm text-gray-600">Email us</div>
                    <div className="font-semibold text-gray-900">{selectedLocation.email}</div>
                  </div>
                </a>
              </div>
            )}

            <a 
              href={orderingUrl}
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-full hover:bg-orange-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Order Online Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="w-6 h-6 text-orange-500" />
                  <span className="text-xl font-bold">{restaurant.name}</span>
                </div>
                <p className="text-gray-400">
                  {restaurant.tagline}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#about" className="hover:text-white transition">About</a></li>
                  <li><a href={orderingUrl} className="hover:text-white transition">Menu</a></li>
                  <li><a href="#hours" className="hover:text-white transition">Hours</a></li>
                  <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                {selectedLocation && (
                  <ul className="space-y-2 text-gray-400">
                    <li>{selectedLocation.phone}</li>
                    <li>{selectedLocation.email}</li>
                    <li>{selectedLocation.address}</li>
                    <li>{selectedLocation.city}, {selectedLocation.state} {selectedLocation.zip_code}</li>
                  </ul>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Hours</h4>
                {selectedLocation && (
                  <ul className="space-y-2 text-gray-400">
                    {Object.entries(selectedLocation.business_hours || {}).slice(0, 3).map(([day]) => (
                      <li key={day} className="capitalize">
                        {day.slice(0, 3)}: {formatHours(String(day), selectedLocation)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>{settings?.footer_text || `© ${new Date().getFullYear()} ${restaurant.name}. All rights reserved.`}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
