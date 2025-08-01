'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({
    localStorageAvailable: false,
    rawData: null as string | null,
    parsedData: null as any,
    error: null as string | null,
    timestamp: null as string | null
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkLocalStorage = () => {
      try {
        const available = typeof window !== 'undefined' && window.localStorage;
        const rawData = available ? localStorage.getItem('juv_products') : null;
        let parsedData = null;
        let error = null;

        if (rawData) {
          try {
            parsedData = JSON.parse(rawData);
          } catch (parseError) {
            error = `Ошибка парсинга: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
          }
        }

        setDebugInfo({
          localStorageAvailable: !!available,
          rawData,
          parsedData,
          error,
          timestamp: new Date().toLocaleString()
        });

        console.log('🔍 Debug info:', {
          localStorageAvailable: !!available,
          rawData,
          parsedData,
          error
        });
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleString()
        }));
      }
    };

    checkLocalStorage();
  }, [isClient]);

  const addTestProduct = () => {
    if (!isClient) return;

    try {
      const testProduct = {
        id: Date.now().toString(),
        name: `Тестовый товар ${Date.now()}`,
        description: 'Это тестовый товар для проверки функциональности',
        price: Math.floor(Math.random() * 10000) + 1000,
        imageUrl: 'https://via.placeholder.com/300x200',
        category: 'rings',
        inStock: true,
        createdAt: new Date().toISOString()
      };

      const existingProducts = JSON.parse(localStorage.getItem('juv_products') || '[]');
      existingProducts.push(testProduct);
      localStorage.setItem('juv_products', JSON.stringify(existingProducts));

      console.log('✅ Тестовый товар добавлен:', testProduct);
      
      // Обновляем отладочную информацию
      setDebugInfo(prev => ({
        ...prev,
        rawData: localStorage.getItem('juv_products'),
        parsedData: existingProducts,
        timestamp: new Date().toLocaleString()
      }));

      alert('Тестовый товар добавлен!');
    } catch (error) {
      console.error('❌ Ошибка добавления тестового товара:', error);
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearAllProducts = () => {
    if (!isClient) return;

    if (confirm('Вы уверены, что хотите удалить ВСЕ товары?')) {
      try {
        localStorage.removeItem('juv_products');
        console.log('🗑️ Все товары удалены');
        
        setDebugInfo(prev => ({
          ...prev,
          rawData: null,
          parsedData: null,
          timestamp: new Date().toLocaleString()
        }));

        alert('Все товары удалены!');
      } catch (error) {
        console.error('❌ Ошибка очистки товаров:', error);
        alert(`Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отладка</h1>
          <p className="text-gray-600">Диагностика localStorage и товаров</p>
        </div>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Назад к товарам
        </Link>
      </div>

      {/* Статус localStorage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Статус localStorage</h2>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${
              debugInfo.localStorageAvailable ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="text-sm">
              localStorage {debugInfo.localStorageAvailable ? 'доступен' : 'недоступен'}
            </span>
          </div>
          {debugInfo.timestamp && (
            <p className="text-xs text-gray-500">Последняя проверка: {debugInfo.timestamp}</p>
          )}
        </div>
      </div>

      {/* Ошибки */}
      {debugInfo.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Ошибка:</h3>
          <p className="text-red-600">{debugInfo.error}</p>
        </div>
      )}

      {/* Действия */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Действия</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={addTestProduct}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Добавить тестовый товар
          </button>
          <button
            onClick={clearAllProducts}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Очистить все товары
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </div>

      {/* Сырые данные */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Сырые данные localStorage</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
            {debugInfo.rawData || 'null (пусто)'}
          </pre>
        </div>
      </div>

      {/* Парсенные данные */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Парсенные данные</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {debugInfo.parsedData ? JSON.stringify(debugInfo.parsedData, null, 2) : 'null (пусто)'}
          </pre>
        </div>
        {debugInfo.parsedData && Array.isArray(debugInfo.parsedData) && (
          <p className="text-sm text-gray-600 mt-2">
            Найдено товаров: {debugInfo.parsedData.length}
          </p>
        )}
      </div>
    </div>
  );
}
// Force rebuild Fri Aug  1 18:36:59 MSK 2025
