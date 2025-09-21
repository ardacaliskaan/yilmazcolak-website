// components/admin/AdminLayout.js - Düzeltilmiş Ultra Professional
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
  Layout,
  Package,
  BarChart3,
  Bell,
  Search
} from 'lucide-react';

// Icon mapping
const iconMap = {
  Home,
  Users,
  FileText,
  Settings,
  Shield,
  Layout,
  Package,
  BarChart3
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Kullanıcı bilgilerini getir
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        await fetchDynamicMenuItems(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('User fetch error:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Dinamik menü öğelerini getir
  const fetchDynamicMenuItems = async (userData) => {
    try {
      const response = await fetch('/api/admin/permissions/modules?active=true', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const dynamicItems = [];

        // Dashboard her zaman ilk sırada
        dynamicItems.push({
          key: 'dashboard',
          name: 'Dashboard',
          href: '/admin/dashboard',
          icon: 'Home',
          color: 'blue'
        });

        // Modülleri kullanıcı yetkilerine göre filtrele
        data.modules.forEach(module => {
          const userPermission = userData.permissions?.find(p => p.module === module.key);
          
          if (userPermission && userPermission.actions.includes('read')) {
            // Özel isimlendirme
            let displayName = module.name;
            if (module.key === 'team') displayName = 'Ekip Yönetimi';
            if (module.key === 'users') displayName = 'Kullanıcı Yönetimi';
            if (module.key === 'articles') displayName = 'Makale Yönetimi';
            if (module.key === 'content') displayName = 'İçerik Yönetimi';
            if (module.key === 'settings') displayName = 'Sistem Ayarları';

            dynamicItems.push({
              key: module.key,
              name: displayName,
              href: `/admin/${module.key}`,
              icon: module.icon,
              color: module.color,
              description: module.description
            });
          }
        });

        setMenuItems(dynamicItems);
        console.log('✅ Menü öğeleri yüklendi:', dynamicItems.map(item => item.name));
      } else {
        console.error('❌ Modüller yüklenemedi, fallback menü kullanılıyor');
        setMenuItems(getStaticMenuItems(userData));
      }
    } catch (error) {
      console.error('❌ Dinamik menü fetch error:', error);
      setMenuItems(getStaticMenuItems(userData));
    }
  };

  // Fallback: Static menü
  const getStaticMenuItems = (userData) => {
    const items = [
      {
        key: 'dashboard',
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: 'Home',
        color: 'blue'
      }
    ];

    if (userData.permissions?.some(p => p.module === 'team' && p.actions.includes('read'))) {
      items.push({
        key: 'team',
        name: 'Ekip Yönetimi',
        href: '/admin/team',
        icon: 'Users',
        color: 'blue'
      });
    }

    if (userData.permissions?.some(p => p.module === 'users' && p.actions.includes('read'))) {
      items.push({
        key: 'users',
        name: 'Kullanıcı Yönetimi',
        href: '/admin/users',
        icon: 'Shield',
        color: 'purple'
      });
    }

    return items;
  };

  useEffect(() => {
    if (pathname !== '/admin/login') {
      fetchUserData();
    } else {
      setLoading(false);
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

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-bold text-xl">YÇ</span>
          </div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const Sidebar = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile
          ? 'fixed inset-0 z-50 lg:hidden'
          : 'hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col'
      }`}
    >
      {isMobile && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="relative flex w-80 flex-1 flex-col bg-white border-r border-gray-200 shadow-lg">
        
        {/* Logo/Header Section */}
        <div className="flex flex-shrink-0 items-center px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">YÇ</span>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Yönetim Sistemi</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto w-6 h-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'));
            const IconComponent = iconMap[item.icon] || Settings;
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <IconComponent
                  className={`mr-4 flex-shrink-0 h-6 w-6 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full ml-2"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="flex-shrink-0 border-t border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-base font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      {sidebarOpen && <Sidebar isMobile />}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-80">
        {/* Top Navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-20 bg-white shadow border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-8 flex justify-between items-center">
            {/* Page Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => 
                  pathname === item.href || 
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'))
                )?.name || 'Dashboard'}
              </h2>
            </div>
            
            {/* Right section */}
            <div className="flex items-center space-x-4">
              
              {/* Search */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="flex items-center mt-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-xs text-gray-600 capitalize">{user?.role.replace('-', ' ')}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;