'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Главная', href: '/admin', icon: '🏠' },
  { name: 'Заказы', href: '/admin/orders', icon: '📦' },
  { name: 'Товары', href: '/admin/products', icon: '🛍' },
  { name: 'Пользователи', href: '/admin/users', icon: '👥' },
  { name: 'Статистика', href: '/admin/dashboard', icon: '📊' },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const pathname = usePathname();

  useEffect(() => {
    // Проверка админских прав через Telegram WebApp
    const checkAdminAccess = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        const userId = tg.initDataUnsafe?.user?.id;
        const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || '195830791';
        
        if (userId?.toString() === adminId) {
          console.log('Админ авторизован через Telegram:', userId);
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // Если не авторизован через Telegram, показываем форму входа
      console.log('Telegram авторизация не удалась, показываем форму входа');
      setIsAuthorized(false);
      setIsLoading(false);
      setShowLoginForm(true);
    };

    checkAdminAccess();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Простая проверка логина/пароля (в реальном проекте должна быть на сервере)
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'juv2024';
    
    if (loginData.username === adminUsername && loginData.password === adminPassword) {
      console.log('Админ авторизован через браузер');
      setIsAuthorized(true);
      setShowLoginForm(false);
    } else {
      alert('Неверный логин или пароль');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Админ панель JUV</h1>
          
          {showLoginForm ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Логин
                </label>
                <input
                  type="text"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Войти
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Для доступа к админской панели требуется авторизация.
              </p>
              <button
                onClick={() => setShowLoginForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Войти в админ панель
              </button>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Или войдите через Telegram:</p>
            <Link
              href="https://t.me/juv_app_bot"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Открыть бота
            </Link>
          </div>
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
              <button
                onClick={() => {
                  setIsAuthorized(false);
                  setShowLoginForm(false);
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 