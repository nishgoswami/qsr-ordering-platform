export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🍔 Demo Restaurant
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Delicious food delivered to your door
          </p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-lg font-medium text-green-600">Open Now</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-600">30-45 min delivery</span>
          </div>
          <div className="flex gap-4 justify-center">
            <a
              href="/menu"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-medium text-lg shadow-lg"
            >
              Browse Menu
            </a>
            <a
              href="/order-tracking"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-medium text-lg shadow-lg border-2 border-blue-600"
            >
              Track Order
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-3">🍕</div>
            <h3 className="text-xl font-semibold mb-2">Browse Menu</h3>
            <p className="text-gray-600">
              Explore our delicious menu with photos and customize your order
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-3">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Quick Delivery</h3>
            <p className="text-gray-600">
              Choose pickup or delivery with real-time tracking
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-3">💬</div>
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600">
              Chat directly with the restaurant for any questions
            </p>
          </div>
        </div>

        {/* Demo Pages */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">🎨 UI Demo Pages</h2>
          <p className="text-gray-600 mb-6 text-center">
            Explore the complete customer ordering flow with simulated data
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/menu"
              className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="text-3xl mb-2">🍔</div>
              <h3 className="font-semibold mb-1">Menu Browsing</h3>
              <p className="text-sm text-gray-600">
                Browse categories, view items, add to cart
              </p>
            </a>
            <a
              href="/cart"
              className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="text-3xl mb-2">🛒</div>
              <h3 className="font-semibold mb-1">Shopping Cart</h3>
              <p className="text-sm text-gray-600">
                Review items, update quantities, proceed to checkout
              </p>
            </a>
            <a
              href="/order-tracking"
              className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-semibold mb-1">Order Tracking</h3>
              <p className="text-sm text-gray-600">
                Real-time status, driver info, live chat
              </p>
            </a>
            <a
              href="/test-db"
              className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">Database Test</h3>
              <p className="text-sm text-gray-600">
                View live data from Supabase
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
