'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { testSupabaseConnection } from '@/lib/migration'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'localStorage' | 'error'>('supabase');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('📊 Загрузка статистики из Supabase...');

      // Сначала проверяем подключение
      const connection = await testSupabaseConnection();
      if (!connection.success) {
        setConnectionStatus('disconnected');
        throw new Error('Нет подключения к Supabase');
      }
      setConnectionStatus('connected');

      // Загружаем статистику из Supabase параллельно
      const [
        { count: ordersCount },
        { count: usersCount }, 
        { count: productsCount },
        { data: ordersData }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total')
      ]);

      // Подсчитываем общую выручку
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      setStats({
        totalOrders: ordersCount || 0,
        totalRevenue: totalRevenue,
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0
      });

      setDataSource('supabase');
      console.log('✅ Статистика загружена из Supabase:', {
        orders: ordersCount,
        users: usersCount,
        products: productsCount,
        revenue: totalRevenue
      });

    } catch (error) {
      console.error('❌ Ошибка загрузки статистики из Supabase:', error);
      setConnectionStatus('disconnected');
      
      // Fallback к localStorage
      try {
        const storedProducts = localStorage.getItem('juv_products');
        const localProductsCount = storedProducts ? JSON.parse(storedProducts).length : 0;

        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
          totalProducts: localProductsCount
        });

        setDataSource('localStorage');
        console.log('⚠️ Fallback: статистика из localStorage');

      } catch (localError) {
        console.error('❌ Ошибка загрузки из localStorage:', localError);
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
          totalProducts: 0
        });
        setDataSource('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    setLoading(true);
    loadStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-600">Управление заказами, товарами и пользователями</p>
        </div>
        <button
          onClick={refreshStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          🔄 Обновить
        </button>
      </div>

      {/* Статус подключения */}
      <div className={`p-4 rounded-lg border ${
        connectionStatus === 'connected' ? 'bg-green-50 border-green-200' :
        connectionStatus === 'disconnected' ? 'bg-red-50 border-red-200' :
        'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              {connectionStatus === 'connected' && '✅ Подключено к Supabase'}
              {connectionStatus === 'disconnected' && '❌ Нет подключения к Supabase'}
              {connectionStatus === 'testing' && '🔄 Проверка подключения...'}
            </h3>
            <p className="text-sm text-gray-600">
              {connectionStatus === 'connected' && `Источник данных: ${dataSource === 'supabase' ? 'База данных' : 'Локальное хранилище'}`}
              {connectionStatus === 'disconnected' && 'Работаем в режиме fallback с localStorage'}
              {connectionStatus === 'testing' && 'Проверяем доступность базы данных...'}
            </p>
          </div>
          <div className="text-2xl">
            {connectionStatus === 'connected' && '🟢'}
            {connectionStatus === 'disconnected' && '🔴'}
            {connectionStatus === 'testing' && '🟡'}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Заказов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              {stats.totalOrders === 0 && (
                <p className="text-xs text-gray-500">Заказы появятся после первой покупки</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} ₽
              </p>
              {stats.totalRevenue === 0 && (
                <p className="text-xs text-gray-500">Выручка появится после первого заказа</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Пользователей</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              {stats.totalUsers === 0 && (
                <p className="text-xs text-gray-500">Пользователи появятся после регистрации</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🛍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Товаров</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              {stats.totalProducts === 0 && (
                <p className="text-xs text-gray-500">
                  <Link href="/admin/products/add" className="text-blue-600 hover:underline">
                    Добавьте первый товар
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Быстрые действия</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/products/add"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">➕</div>
              <h3 className="font-medium text-gray-900">Добавить товар</h3>
              <p className="text-sm text-gray-600">Создать новый товар в каталоге</p>
            </Link>
            
            <Link
              href="/admin/products"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📦</div>
              <h3 className="font-medium text-gray-900">Управление товарами</h3>
              <p className="text-sm text-gray-600">Просмотр и редактирование товаров</p>
            </Link>
            
            <Link
              href="/admin/orders"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900">Заказы</h3>
              <p className="text-sm text-gray-600">Просмотр и обработка заказов</p>
            </Link>
            
            <Link
              href="/admin/debug"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">🔧</div>
              <h3 className="font-medium text-gray-900">Отладка</h3>
              <p className="text-sm text-gray-600">Диагностика и устранение проблем</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Недавняя активность */}
      {dataSource === 'supabase' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Система готова</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Интеграция с Supabase активна!
              </h3>
              <p className="text-gray-600 mb-4">
                Все данные теперь сохраняются в облачной базе данных
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/admin/products/add"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Добавить первый товар
                </Link>
                <Link
                  href="/admin/debug"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Проверить систему
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
