'use client';

import { useState } from 'react';
import { UtensilsCrossed, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

// Simulated menu data
const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Burgers', itemCount: 2, active: true },
  { id: 'c2', name: 'Pizza', itemCount: 2, active: true },
  { id: 'c3', name: 'Sides', itemCount: 2, active: true },
  { id: 'c4', name: 'Beverages', itemCount: 2, active: true },
  { id: 'c5', name: 'Desserts', itemCount: 2, active: true },
];

const MOCK_MENU_ITEMS = [
  {
    id: 'm1',
    categoryId: 'c1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese',
    price: 8.99,
    available: true,
    popular: true,
  },
  {
    id: 'm2',
    categoryId: 'c1',
    name: 'Bacon Deluxe Burger',
    description: 'Double beef patty, crispy bacon, cheese',
    price: 10.99,
    available: true,
    popular: true,
  },
  {
    id: 'm3',
    categoryId: 'c2',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, basil',
    price: 12.99,
    available: true,
    popular: false,
  },
  {
    id: 'm4',
    categoryId: 'c2',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella',
    price: 13.99,
    available: true,
    popular: true,
  },
  {
    id: 'm5',
    categoryId: 'c3',
    name: 'French Fries',
    description: 'Crispy golden fries',
    price: 3.99,
    available: true,
    popular: true,
  },
];

export default function MenuManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredItems = selectedCategory === 'all'
    ? MOCK_MENU_ITEMS
    : MOCK_MENU_ITEMS.filter(item => item.categoryId === selectedCategory);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
            <p className="text-gray-600">Manage categories, items, and pricing</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowItemModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categories</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_CATEGORIES.map(cat => (
              <div
                key={cat.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  selectedCategory === cat.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="font-semibold mb-1">{cat.name}</div>
                <div className="text-sm text-gray-600">{cat.itemCount} items</div>
                <div className="mt-2">
                  {cat.active ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items ({MOCK_MENU_ITEMS.length})
            </button>
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({cat.itemCount})
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map(item => {
                const category = MOCK_CATEGORIES.find(c => c.id === item.categoryId);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                        {category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">${item.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.available ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                          <Eye className="w-4 h-4" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                          <EyeOff className="w-4 h-4" />
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.popular && (
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          ⭐ Popular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowItemModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-2"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  defaultValue={editingItem?.name}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="e.g., Classic Cheeseburger"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  defaultValue={editingItem?.description}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Describe the item..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full border rounded-lg px-4 py-2" aria-label="Select category">
                    {MOCK_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={editingItem?.price}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={editingItem?.available ?? true} className="rounded" />
                  <span className="text-sm font-medium">Available for ordering</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={editingItem?.popular} className="rounded" />
                  <span className="text-sm font-medium">Mark as popular</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
