export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to QSR Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Customer Ordering Website
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              We're building an amazing food ordering experience. Features include:
            </p>
            <ul className="text-left space-y-2 text-gray-700">
              <li>✅ Browse restaurant menu with photos</li>
              <li>✅ Customize items with modifiers</li>
              <li>✅ Choose pickup or delivery</li>
              <li>✅ Schedule orders in advance</li>
              <li>✅ Secure payment with Stripe</li>
              <li>✅ Real-time order tracking</li>
              <li>✅ Chat with restaurant</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
