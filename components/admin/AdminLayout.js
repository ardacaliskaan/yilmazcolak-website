// components/admin/AdminLayout.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  X,
  Home,
  Users,
  FileText,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Shield,
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Kullanıcı bilgilerini getir
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('User fetch error:', error);
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    // Login sayfasında user fetch etme
    if (pathname !== '/admin/login') {
      fetchUserData();
    }
  }, [pathname, fetchUserData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Eğer login sayfasındaysak layoutu bypass et
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Menü yapısı
  const getMenuItems = () => {
    if (!user) return [];

    const items = [
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: Home,
      },
    ];

    if (
      user.permissions?.some(
        (p) => p.module === 'team' && p.actions.includes('read')
      )
    ) {
      items.push({
        name: 'Ekip Yönet',
        href: '/admin/team',
        icon: Users,
      });
    }

    if (
      user.permissions?.some(
        (p) => p.module === 'articles' && p.actions.includes('read')
      )
    ) {
      items.push({
        name: 'Makaleler',
        href: '/admin/articles',
        icon: FileText,
      });
    }

    if (
      user.permissions?.some(
        (p) => p.module === 'users' && p.actions.includes('read')
      )
    ) {
      items.push({
        name: 'Kullanıcılar',
        href: '/admin/users',
        icon: Shield,
      });
    }

    if (
      user.permissions?.some(
        (p) => p.module === 'settings' && p.actions.includes('read')
      )
    ) {
      items.push({
        name: 'Ayarlar',
        href: '/admin/settings',
        icon: Settings,
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const Sidebar = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile ? 'lg:hidden' : 'hidden lg:block'
      } w-64 bg-white shadow-lg border-r border-gray-200 h-full`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-xs text-gray-500">Yılmaz Çolak Hukuk</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info (Mobile) */}
      {isMobile && user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 bg-white h-full">
            <div className="absolute top-4 right-4 lg:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar isMobile={true} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find((item) => pathname === item.href)?.name ||
                'Admin Panel'}
            </h2>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-amber-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
