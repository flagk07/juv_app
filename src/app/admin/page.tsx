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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Последние действия</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Новый заказ #1234</p>
                <p className="text-xs text-gray-500">2 минуты назад</p>
              </div>
              <span className="text-sm font-medium text-green-600">+15,000 ₽</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Добавлен новый товар</p>
                <p className="text-xs text-gray-500">1 час назад</p>
              </div>
              <span className="text-sm font-medium text-blue-600">Кольцо с бриллиантом</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Новый пользователь</p>
                <p className="text-xs text-gray-500">3 часа назад</p>
              </div>
              <span className="text-sm font-medium text-purple-600">@user123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 