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
  { name: 'Отладка', href: '/admin/debug', icon: '🔧' },
  { name: 'Проверка', href: '/admin/test-changes', icon: '✅' },
]

// Session helpers for admin auth persistence
const SESSION_STORAGE_KEY = 'juv_admin_session';
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

type AdminSession = {
  createdAt: number;
  expiresAt: number;
  type: 'telegram' | 'password';
};

function readSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function startSession(type: 'telegram' | 'password') {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const session: AdminSession = {
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    type,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function refreshSession() {
  const session = readSession();
  if (!session) return;
  const refreshed: AdminSession = {
    ...session,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(refreshed));
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const pathname = usePathname();

  useEffect(() => {
    // Сначала пытаемся восстановить сессию
    const existing = readSession();
    if (existing) {
      setIsAuthorized(true);
      setIsLoading(false);
      refreshSession();
      return;
    }

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
          startSession('telegram');
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

  // Measure sidebar header height and nav offset to align content baseline
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headerEl = document.getElementById('admin-sidebar-header');
    const navEl = document.getElementById('admin-sidebar-nav');
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 64;
    const navMarginTop = navEl ? parseInt(window.getComputedStyle(navEl).marginTop || '0', 10) : 0;
    const offset = Math.max(0, Math.round(headerH + navMarginTop));
    document.documentElement.style.setProperty('--adminTopOffset', `${offset}px`);
  }, [pathname]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Простая проверка логина/пароля (в реальном проекте должна быть на сервере)
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'juv2024';
    
    if (loginData.username === adminUsername && loginData.password === adminPassword) {
      console.log('Админ авторизован через браузер');
      setIsAuthorized(true);
      setShowLoginForm(false);
      startSession('password');
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
        <div id="admin-sidebar-header" className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">JUV Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>
        
        <nav id="admin-sidebar-nav" className="mt-0">
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
        {/* Align content baseline using measured offset and show Logout */}
        <main className="px-6 pb-6 relative" style={{ paddingTop: 'var(--adminTopOffset, 64px)' }} onMouseMove={refreshSession} onKeyDown={refreshSession}>
          <button
            onClick={() => {
              setIsAuthorized(false);
              setShowLoginForm(false);
              if (typeof window !== 'undefined') localStorage.removeItem(SESSION_STORAGE_KEY);
            }}
            className="absolute right-6 top-4 text-sm text-red-600 hover:text-red-700"
          >
            Выйти
          </button>
          {children}
        </main>
      </div>
    </div>
  );
} 