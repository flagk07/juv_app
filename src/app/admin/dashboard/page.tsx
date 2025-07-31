'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  products: {
    total: number;
    inStock: number;
    outOfStock: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Моковые данные дашборда
    const mockData: DashboardData = {
      orders: {
        total: 24,
        pending: 3,
        processing: 5,
        shipped: 8,
        delivered: 6,
        cancelled: 2
      },
      revenue: {
        total: 1250000,
        thisMonth: 180000,
        lastMonth: 150000
      },
      products: {
        total: 12,
        inStock: 10,
        outOfStock: 2
      },
      users: {
        total: 156,
        active: 89,
        newThisMonth: 23
      },
      recentOrders: [
        {
          id: '1234',
          customer: 'Иван Иванов',
          amount: 85000,
          status: 'pending',
          date: '2024-01-15T10:30:00Z'
        },
        {
          id: '1235',
          customer: 'Мария Петрова',
          amount: 60000,
          status: 'processing',
          date: '2024-01-14T15:45:00Z'
        },
        {
          id: '1236',
          customer: 'Алексей Сидоров',
          amount: 55000,
          status: 'delivered',
          date: '2024-01-13T09:15:00Z'
        }
      ],
      topProducts: [
        {
          name: 'Золотое кольцо с бриллиантом',
          sales: 8,
          revenue: 680000
        },
        {
          name: 'Серьги с жемчугом',
          sales: 12,
          revenue: 300000
        },
        {
          name: 'Золотая цепочка',
          sales: 6,
          revenue: 210000
        }
      ]
    };

    setData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const revenueGrowth = ((data.revenue.thisMonth - data.revenue.lastMonth) / data.revenue.lastMonth * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600 mt-2">Подробная аналитика и статистика</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего заказов</p>
              <p className="text-2xl font-bold text-gray-900">{data.orders.total}</p>
              <p className="text-xs text-gray-500">+12% с прошлого месяца</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.revenue.total.toLocaleString()} ₽
              </p>
              <p className={`text-xs ${revenueGrowth.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                {revenueGrowth}% с прошлого месяца
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Пользователи</p>
              <p className="text-2xl font-bold text-gray-900">{data.users.total}</p>
              <p className="text-xs text-gray-500">+{data.users.newThisMonth} новых</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">🛍️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Товары</p>
              <p className="text-2xl font-bold text-gray-900">{data.products.total}</p>
              <p className="text-xs text-gray-500">{data.products.inStock} в наличии</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Статусы заказов</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Новые</span>
                </div>
                <span className="text-sm font-medium">{data.orders.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">В обработке</span>
                </div>
                <span className="text-sm font-medium">{data.orders.processing}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Отправлены</span>
                </div>
                <span className="text-sm font-medium">{data.orders.shipped}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Доставлены</span>
                </div>
                <span className="text-sm font-medium">{data.orders.delivered}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Отменены</span>
                </div>
                <span className="text-sm font-medium">{data.orders.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Топ товаров</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} продаж</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {product.revenue.toLocaleString()} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Последние заказы</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Посмотреть все →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.amount.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Новый' :
                       order.status === 'processing' ? 'В обработке' :
                       order.status === 'delivered' ? 'Доставлен' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">📦</span>
            <div>
              <p className="font-medium text-gray-900">Управление заказами</p>
              <p className="text-sm text-gray-600">Просмотр и обработка заказов</p>
            </div>
          </Link>
          
          <Link
            href="/admin/products/add"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">➕</span>
            <div>
              <p className="font-medium text-gray-900">Добавить товар</p>
              <p className="text-sm text-gray-600">Создание нового товара</p>
            </div>
          </Link>
          
          <Link
            href="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">👥</span>
            <div>
              <p className="font-medium text-gray-900">Пользователи</p>
              <p className="text-sm text-gray-600">Управление пользователями</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 