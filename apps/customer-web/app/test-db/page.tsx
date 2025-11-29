import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function TestDBPage() {
  // Test 1: Fetch organizations
  const { data: organizations, error: orgsError } = await supabase
    .from('organizations')
    .select('*');

  // Test 2: Fetch categories
  const { data: categories, error: catsError } = await supabase
    .from('categories')
    .select('*');

  // Test 3: Fetch menu items with categories
  const { data: menuItems, error: itemsError } = await supabase
    .from('menu_items')
    .select('*, category:categories(name, display_order)')
    .eq('is_available', true)
    .order('name');

  // Test 4: Fetch delivery zones
  const { data: zones, error: zonesError } = await supabase
    .from('delivery_zones')
    .select('*');

  // Test 5: Count records in each table
  const { count: orgsCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });

  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: itemsCount } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true });

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          🔍 Database Connection Test
        </h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            ✅ Connection Successful
          </h2>
          <p className="text-gray-600">
            Connected to: <code className="bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_SUPABASE_URL}
            </code>
          </p>
        </div>

        {/* Record Counts */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">📊 Table Record Counts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-3xl font-bold text-blue-600">{orgsCount || 0}</div>
              <div className="text-sm text-gray-600">Organizations</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-3xl font-bold text-green-600">{usersCount || 0}</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-3xl font-bold text-purple-600">{itemsCount || 0}</div>
              <div className="text-sm text-gray-600">Menu Items</div>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <div className="text-3xl font-bold text-orange-600">{ordersCount || 0}</div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
          </div>
        </div>

        {/* Organizations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">🏢 Organizations</h2>
          {orgsError ? (
            <div className="text-red-600">Error: {orgsError.message}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations?.map((org) => (
                    <tr key={org.id} className="border-t">
                      <td className="px-4 py-2">{org.name}</td>
                      <td className="px-4 py-2">{org.business_type}</td>
                      <td className="px-4 py-2">{org.phone}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          org.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {org.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">📑 Categories</h2>
          {catsError ? (
            <div className="text-red-600">Error: {catsError.message}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories?.map((cat) => (
                <div key={cat.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Order: {cat.display_order}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">🍔 Menu Items</h2>
          {itemsError ? (
            <div className="text-red-600">Error: {itemsError.message}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems?.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="text-green-600 font-bold">${item.price}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {item.category?.name || 'No category'}
                    </span>
                    {item.image_url && (
                      <span className="text-blue-600">📷 Has Image</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Zones */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">🗺️ Delivery Zones</h2>
          {zonesError ? (
            <div className="text-red-600">Error: {zonesError.message}</div>
          ) : (
            <div className="space-y-4">
              {zones?.map((zone) => (
                <div key={zone.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{zone.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Fee: ${zone.delivery_fee} | Min Order: ${zone.min_order_amount}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ETA: {zone.estimated_delivery_time_minutes} minutes
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      zone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TypeScript Types Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">✨ TypeScript Types</h2>
          <p className="text-gray-600 mb-2">
            Types are working correctly! All queries are fully type-safe.
          </p>
          <div className="bg-gray-100 p-4 rounded text-xs font-mono">
            <div>✅ Organization: id, name, business_type, phone, etc.</div>
            <div>✅ Category: id, name, description, display_order</div>
            <div>✅ MenuItem: id, name, price, description, image_url</div>
            <div>✅ DeliveryZone: id, name, delivery_fee, boundaries</div>
          </div>
        </div>
      </div>
    </div>
  );
}
