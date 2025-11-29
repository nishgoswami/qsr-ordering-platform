'use client';

import { Clock, MapPin, Phone, Mail, Star, ChefHat, Truck, Heart } from 'lucide-react';

export default function RestaurantHomepage() {
  const orderingUrl = 'http://localhost:3000/menu'; // Link to customer-web app

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">Demo Restaurant</span>
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
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Open Now • Delivering in 30-45 min</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Delicious Food,
              <br />
              <span className="text-orange-600">Delivered Fast</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Fresh ingredients, expertly prepared, delivered to your door. Experience the taste of quality with every order.
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

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About Demo Restaurant</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At Demo Restaurant, we offer meals of excellent quality and invite you to try our delicious food. 
              The key to our success is simple: providing quality consistent food that tastes great every single time.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We pride ourselves on serving our customers delicious genuine dishes. Eat delicious food. Grab a drink. 
              But most of all, relax! We thank you from the bottom of our hearts for your continued support.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Chefs</h3>
              <p className="text-gray-600">
                Our experienced chefs prepare every dish with passion and precision using the finest ingredients.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Hot, fresh food delivered to your door in 30-45 minutes. Track your order in real-time.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Made with Love</h3>
              <p className="text-gray-600">
                Every dish is crafted with care and attention to detail. Quality you can taste in every bite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h2>
            <p className="text-lg text-gray-600 mb-8">
              Explore our delicious selection of burgers, pizzas, sides, and more
            </p>
            <a 
              href={orderingUrl}
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-full hover:bg-orange-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              View Full Menu & Order
            </a>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            {['🍔 Burgers', '🍕 Pizza', '🍟 Sides', '🥤 Beverages'].map((item, idx) => (
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
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Monday - Friday</span>
                    <span className="text-gray-900">11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Saturday</span>
                    <span className="text-gray-900">10:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700 font-medium">Sunday</span>
                    <span className="text-gray-900">10:00 AM - 09:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">Location</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  123 Main Street<br />
                  City, ST 12345<br />
                  United States
                </p>
                <a 
                  href="https://maps.google.com" 
                  target="_blank"
                  className="inline-block text-orange-600 hover:text-orange-700 font-medium"
                >
                  Get Directions →
                </a>
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
              Have questions? We'd love to hear from you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <a 
                href="tel:+15551234567"
                className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl hover:bg-gray-100 transition"
              >
                <Phone className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <div className="text-sm text-gray-600">Call us</div>
                  <div className="font-semibold text-gray-900">(555) 123-4567</div>
                </div>
              </a>
              
              <a 
                href="mailto:hello@demorestaurant.com"
                className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl hover:bg-gray-100 transition"
              >
                <Mail className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <div className="text-sm text-gray-600">Email us</div>
                  <div className="font-semibold text-gray-900">hello@demo.com</div>
                </div>
              </a>
            </div>

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
                  <span className="text-xl font-bold">Demo Restaurant</span>
                </div>
                <p className="text-gray-400">
                  Delicious food delivered to your door.
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
                <ul className="space-y-2 text-gray-400">
                  <li>(555) 123-4567</li>
                  <li>hello@demo.com</li>
                  <li>123 Main Street</li>
                  <li>City, ST 12345</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Hours</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Mon-Fri: 11am-10pm</li>
                  <li>Sat: 10am-11pm</li>
                  <li>Sun: 10am-9pm</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Demo Restaurant. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
