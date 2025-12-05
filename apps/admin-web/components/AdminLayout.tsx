'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Settings, BarChart3, MapPin, Users, ChefHat, Package, LogOut, UserCircle, ChevronDown, FileText, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserRestaurant } from '../lib/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [userEmail, setUserEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          
          // Get user's restaurant and staff info
          const { restaurant, staff } = await getUserRestaurant();
          if (restaurant) {
            setRestaurantName(restaurant.name);
          }
          if (staff) {
            setUserName(`${staff.first_name} ${staff.last_name}`);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  // Define navigation items
  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/', path: '/' },
    { icon: ShoppingBag, label: 'Orders', href: '/orders', path: '/orders' },
    { icon: UtensilsCrossed, label: 'Menu', href: '/menu', path: '/menu' },
    { icon: ChefHat, label: 'Recipes', href: '/recipes', path: '/recipes' },
    { icon: Package, label: 'Inventory', href: '/inventory', path: '/inventory' },
    { icon: MapPin, label: 'Delivery Zones', href: '/zones', path: '/zones' },
    { icon: BarChart3, label: 'Reports', href: '/reports', path: '/reports' },
    { icon: Users, label: 'Staff', href: '/staff', path: '/staff' },
    { icon: Briefcase, label: 'HR', href: '/hr', path: '/hr' },
    { icon: FileText, label: 'Change Requests', href: '/tickets', path: '/tickets' },
    { icon: Settings, label: 'Settings', href: '/settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            {/* User Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {userName}
                  </div>
                  <div className="text-xs text-gray-600">{restaurantName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-8 h-8 text-gray-400" />
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="font-semibold text-gray-900 mb-1">
                      {userName}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{userEmail}</div>
                    <div className="text-xs text-gray-500">{restaurantName}</div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            {navigationItems.map(item => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={pathname === item.path}
              />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, href, active = false }: { 
  icon: any; 
  label: string; 
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}
