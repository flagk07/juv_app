'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [{ count: ordersCount }, { data: ordersSum }, { count: usersCount }, { count: productsCount }] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total'),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true })
        ])

        const totalRevenue = (ordersSum || []).reduce((sum: number, row: any) => sum + Number(row.total || 0), 0)

        setStats({
          totalOrders: ordersCount || 0,
          totalRevenue,
          totalUsers: usersCount || 0,
          totalProducts: productsCount || 0
        })
      } catch (e) {
        console.error('Failed to load stats', e)
        setStats({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="sticky top-0 bg-gray-50 z-10 pt-1">
        <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
        <p className="text-gray-600">Подробная аналитика и отчеты</p>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Заказов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Оборот</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} ₽</p>
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
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🛍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Товаров</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading placeholder for charts */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">Загрузка…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Продажи по месяцам</h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600">Данные для графиков появятся после первых продаж</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные товары</h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-600">Рейтинг товаров появится после анализа заказов</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 