'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: 'Дашборд', href: '/admin/dashboard', icon: '📊' },
    { name: 'Заказы', href: '/admin/orders', icon: '📦' },
    { name: 'Товары', href: '/admin/products', icon: '🛍️' },
    { name: 'Пользователи', href: '/admin/users', icon: '👥' },
  ];

  useEffect(() => {
    // Проверка админских прав через Telegram WebApp
    const checkAdminAccess = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) {
        console.log('Telegram WebApp не найден');
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      const userId = tg.initDataUnsafe?.user?.id;
      const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || '195830791';
      
      if (userId?.toString() === adminId) {
        console.log('Админ авторизован:', userId);
        setIsAuthorized(true);
      } else {
        console.log('Доступ запрещен. User ID:', userId, 'Admin ID:', adminId);
        setIsAuthorized(false);
      }
      setIsLoading(false);
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-6">
            У вас нет прав для доступа к админской панели. 
            Обратитесь к администратору для получения доступа.
          </p>
          <Link
            href="https://t.me/juv_app_bot"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Открыть бота
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">JUV Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              ☰
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Админ панель</span>
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Вернуться на сайт
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 