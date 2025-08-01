'use client'

import { useState, useEffect } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // В реальном проекте здесь будет загрузка заказов с сервера
    setOrders([]);
    setLoading(false);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // В реальном проекте здесь будет обновление статуса на сервере
    console.log(`Обновление статуса заказа ${orderId} на ${newStatus}`);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="text-gray-600">Управление заказами клиентов</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Новые
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            В обработке
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Завершенные
          </button>
        </div>
      </div>

      {/* Список заказов */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Список заказов</h2>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
              <p className="text-gray-600">Когда появятся заказы, они будут отображаться здесь</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Здесь будут отображаться заказы */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 