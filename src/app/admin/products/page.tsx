'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // В реальном проекте здесь будет загрузка товаров с сервера
    setProducts([]);
    setLoading(false);
  }, []);

  const toggleStock = (productId: string) => {
    // В реальном проекте здесь будет обновление статуса на сервере
    console.log(`Переключение статуса товара ${productId}`);
  };

  const deleteProduct = (productId: string) => {
    // В реальном проекте здесь будет удаление товара на сервере
    console.log(`Удаление товара ${productId}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-600">Управление каталогом товаров</p>
        </div>
        <Link
          href="/admin/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Добавить товар
        </Link>
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
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Неактивные
          </button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Список товаров</h2>
        </div>
        <div className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Товаров пока нет</h3>
              <p className="text-gray-600 mb-6">Добавьте первый товар в каталог</p>
              <Link
                href="/admin/products/add"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                + Добавить товар
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Здесь будут отображаться товары */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 