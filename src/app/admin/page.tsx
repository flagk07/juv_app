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
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'localStorage' | 'error'>('supabase');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const connection = await testSupabaseConnection();
      if (!connection.success) {
        setConnectionStatus('disconnected');
        throw new Error('Нет подключения к Supabase');
      }
      setConnectionStatus('connected');

      const [ordersMeta, usersMeta, productsMeta, ordersData, productsData] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      const totalRevenue = (ordersData.data || []).reduce((sum, o: any) => sum + (Number(o.total) || 0), 0);

      setStats({
        totalOrders: ordersMeta.count || 0,
        totalRevenue,
        totalUsers: usersMeta.count || 0,
        totalProducts: productsMeta.count || 0
      });

      setLatestProducts(productsData.data || []);
      setDataSource('supabase');
    } catch (error) {
      // fallback
      try {
        const storedProducts = localStorage.getItem('juv_products');
        const localProducts = storedProducts ? JSON.parse(storedProducts) : [];
        setStats(prev => ({ ...prev, totalProducts: localProducts.length }));
        setLatestProducts(localProducts.slice(0, 5));
        setDataSource('localStorage');
      } catch {}
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
      <div className="sticky top-0 bg-gray-50 z-10 pt-1 flex justify-between items-center">
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

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg"><span className="text-2xl">📦</span></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Заказов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg"><span className="text-2xl">💰</span></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Выручка</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} ₽</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg"><span className="text-2xl">👥</span></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Пользователей</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg"><span className="text-2xl">🛍</span></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Товаров</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Последние товары */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Последние товары</h2>
        </div>
        <div className="p-6">
          {latestProducts.length === 0 ? (
            <p className="text-gray-600">Товары отсутствуют</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {latestProducts.map((p: any) => (
                <div key={p.id} className="bg-white border border-cream-200 rounded-lg p-3">
                  <div className="relative aspect-square bg-white rounded mb-2 overflow-hidden">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-800 line-clamp-2">{p.name}</div>
                  <div className="text-sm text-gray-600">{Number(p.price).toLocaleString()} ₽</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
