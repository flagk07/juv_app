'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  telegramId: number;
  telegramUsername: string;
  fullName?: string;
  email?: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastActivity: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    hasOrders: 'all'
  });

  useEffect(() => {
    // Моковые данные пользователей
    const mockUsers: User[] = [
      {
        id: '1',
        telegramId: 123456789,
        telegramUsername: 'user1',
        fullName: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        ordersCount: 3,
        totalSpent: 145000,
        lastActivity: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T09:00:00Z'
      },
      {
        id: '2',
        telegramId: 987654321,
        telegramUsername: 'user2',
        fullName: 'Мария Петрова',
        phone: '+7 (999) 987-65-43',
        ordersCount: 1,
        totalSpent: 60000,
        lastActivity: '2024-01-14T15:45:00Z',
        createdAt: '2024-01-05T14:30:00Z'
      },
      {
        id: '3',
        telegramId: 555666777,
        telegramUsername: 'user3',
        fullName: 'Алексей Сидоров',
        ordersCount: 2,
        totalSpent: 110000,
        lastActivity: '2024-01-10T09:15:00Z',
        createdAt: '2024-01-03T11:20:00Z'
      },
      {
        id: '4',
        telegramId: 111222333,
        telegramUsername: 'user4',
        ordersCount: 0,
        totalSpent: 0,
        lastActivity: '2024-01-12T16:00:00Z',
        createdAt: '2024-01-08T13:45:00Z'
      }
    ];

    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(user => {
    if (filters.hasOrders !== 'all') {
      const hasOrdersFilter = filters.hasOrders === 'true';
      if ((user.ordersCount > 0) !== hasOrdersFilter) {
        return false;
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.telegramUsername.toLowerCase().includes(searchLower) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => new Date(u.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    usersWithOrders: users.filter(u => u.ordersCount > 0).length,
    totalRevenue: users.reduce((sum, user) => sum + user.totalSpent, 0)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
        <p className="text-gray-600 mt-2">Управление пользователями бота</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активные (7 дней)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🛍️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">С заказами</p>
              <p className="text-2xl font-bold text-gray-900">{stats.usersWithOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} ₽
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              placeholder="Username, имя, email"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={filters.hasOrders}
              onChange={(e) => setFilters({...filters, hasOrders: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все пользователи</option>
              <option value="true">С заказами</option>
              <option value="false">Без заказов</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Пользователи ({filteredUsers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказы
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Последняя активность
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        @{user.telegramUsername}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.telegramId}
                      </div>
                      {user.fullName && (
                        <div className="text-sm text-gray-500">
                          {user.fullName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.phone && <div>{user.phone}</div>}
                      {user.email && <div>{user.email}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.ordersCount} заказов
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.totalSpent.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.lastActivity).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      Просмотр заказов
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
          <p className="text-gray-600">
            Попробуйте изменить фильтры поиска
          </p>
        </div>
      )}
    </div>
  );
} 