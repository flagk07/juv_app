'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  telegramId: number;
  telegramUsername: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    // Моковые данные заказов
    const mockOrders: Order[] = [
      {
        id: '1',
        telegramId: 123456789,
        telegramUsername: 'user1',
        items: [
          { name: 'Золотое кольцо с бриллиантом', price: 85000, quantity: 1 }
        ],
        total: 85000,
        status: 'pending',
        contactInfo: {
          name: 'Иван Иванов',
          phone: '+7 (999) 123-45-67',
          email: 'ivan@example.com'
        },
        deliveryAddress: 'г. Москва, ул. Примерная, д. 1, кв. 1',
        notes: 'Доставка до 18:00',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        telegramId: 987654321,
        telegramUsername: 'user2',
        items: [
          { name: 'Серьги с жемчугом', price: 25000, quantity: 1 },
          { name: 'Золотая цепочка', price: 35000, quantity: 1 }
        ],
        total: 60000,
        status: 'processing',
        contactInfo: {
          name: 'Мария Петрова',
          phone: '+7 (999) 987-65-43'
        },
        createdAt: '2024-01-14T15:45:00Z'
      },
      {
        id: '3',
        telegramId: 555666777,
        telegramUsername: 'user3',
        items: [
          { name: 'Обручальные кольца', price: 55000, quantity: 1 }
        ],
        total: 55000,
        status: 'delivered',
        contactInfo: {
          name: 'Алексей Сидоров',
          phone: '+7 (999) 555-44-33'
        },
        createdAt: '2024-01-10T09:15:00Z'
      }
    ];

    setOrders(mockOrders);
    setLoading(false);
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.telegramUsername.toLowerCase().includes(searchLower) ||
        order.contactInfo.name.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // Здесь будет API вызов для обновления статуса
    console.log(`Обновление статуса заказа ${orderId} на ${newStatus}`);
    
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
          <p className="text-gray-600 mt-2">Управление заказами и их статусами</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Всего заказов</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все статусы</option>
              <option value="pending">Новые</option>
              <option value="processing">В обработке</option>
              <option value="shipped">Отправлены</option>
              <option value="delivered">Доставлены</option>
              <option value="cancelled">Отменены</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              placeholder="ID, пользователь, имя"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата от
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата до
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Заказы ({filteredOrders.length})
          </h2>
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
                  Товары
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.contactInfo.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{order.telegramUsername}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.map(item => (
                        <div key={item.name} className="mb-1">
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.total.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Просмотр
                    </Link>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Новый</option>
                      <option value="processing">В обработке</option>
                      <option value="shipped">Отправлен</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 