'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Панель управления JUV</h1>
        <p className="text-gray-600 mt-2">Добро пожаловать в админскую панель</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего заказов</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Выручка</p>
              <p className="text-2xl font-bold text-gray-900">1,250,000 ₽</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🛍️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Товаров</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Пользователей</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/dashboard"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 text-white">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Дашборд</h3>
                <p className="text-sm text-gray-600">Подробная аналитика</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 text-white">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Заказы</h3>
                <p className="text-sm text-gray-600">Управление заказами</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500 text-white">
                <span className="text-2xl">🛍️</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Товары</h3>
                <p className="text-sm text-gray-600">Управление каталогом</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-500 text-white">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Пользователи</h3>
                <p className="text-sm text-gray-600">Управление пользователями</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Test Link */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Тестирование:</h3>
        <Link 
          href="/admin/test" 
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Тестовая страница работает ✅
        </Link>
      </div>
    </div>
  );
} 