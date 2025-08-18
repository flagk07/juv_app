'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatMoscow } from '@/lib/date'
import { migrateLocalStorageToSupabase, syncSupabaseToLocalStorage, testSupabaseConnection } from '@/lib/migration'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({
    localStorageAvailable: false,
    rawData: null as string | null,
    parsedData: null as any,
    error: null as string | null,
    timestamp: null as string | null
  });

  const [supabaseInfo, setSupabaseInfo] = useState({
    connected: false,
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    error: null as string | null
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    checkLocalStorage();
    checkSupabase();
  }, [isClient]);

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
        timestamp: formatMoscow(new Date())
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
        timestamp: formatMoscow(new Date())
      }));
    }
  };

  const checkSupabase = async () => {
    try {
      console.log('🔍 Проверяем подключение к Supabase...');
      
      const connection = await testSupabaseConnection();
      if (!connection.success) {
        setSupabaseInfo(prev => ({
          ...prev,
          connected: false,
          error: connection.error || 'Нет подключения'
        }));
        return;
      }

      // Получаем статистику из Supabase
      const [
        { count: productsCount },
        { count: ordersCount },
        { count: usersCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ]);

      setSupabaseInfo({
        connected: true,
        productsCount: productsCount || 0,
        ordersCount: ordersCount || 0,
        usersCount: usersCount || 0,
        error: null
      });

      console.log('✅ Supabase статистика:', {
        products: productsCount,
        orders: ordersCount,
        users: usersCount
      });

    } catch (error) {
      console.error('❌ Ошибка проверки Supabase:', error);
      setSupabaseInfo(prev => ({
        ...prev,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const addTestProduct = async () => {
    if (!isClient) return;

    try {
      const testProduct = {
        name: `Тестовый товар ${Date.now()}`,
        description: 'Это тестовый товар для проверки функциональности',
        price: Math.floor(Math.random() * 10000) + 1000,
        image_url: 'https://via.placeholder.com/300x200',
        category: 'rings',
        in_stock: true
      };

      console.log('📤 Добавляем тестовый товар в Supabase:', testProduct);

      // Добавляем в Supabase
      const { data: supabaseProduct, error: supabaseError } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`Supabase: ${supabaseError.message}`);
      }

      console.log('✅ Тестовый товар добавлен в Supabase:', supabaseProduct);

      // Также добавляем в localStorage
      if (window.localStorage) {
        const localProduct = {
          id: supabaseProduct.id,
          ...testProduct,
          createdAt: supabaseProduct.created_at
        };

        const existingProducts = JSON.parse(localStorage.getItem('juv_products') || '[]');
        existingProducts.push(localProduct);
        localStorage.setItem('juv_products', JSON.stringify(existingProducts));
        
        console.log('✅ Тестовый товар также добавлен в localStorage');
      }

      alert('✅ Тестовый товар успешно добавлен в Supabase и localStorage!');
      
      // Обновляем отладочную информацию
      checkLocalStorage();
      checkSupabase();

    } catch (error) {
      console.error('❌ Ошибка добавления тестового товара:', error);
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearAllProducts = async () => {
    if (!isClient) return;

    if (confirm('Вы уверены, что хотите удалить ВСЕ товары из Supabase и localStorage?')) {
      try {
        // Удаляем из Supabase
        const { error: supabaseError } = await supabase
          .from('products')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Удаляем все записи

        if (supabaseError) {
          console.error('❌ Ошибка очистки Supabase:', supabaseError);
        } else {
          console.log('✅ Все товары удалены из Supabase');
        }

        // Удаляем из localStorage
        localStorage.removeItem('juv_products');
        console.log('✅ Все товары удалены из localStorage');
        
        // Обновляем отладочную информацию
        checkLocalStorage();
        checkSupabase();

        alert('✅ Все товары удалены из Supabase и localStorage!');

      } catch (error) {
        console.error('❌ Ошибка очистки товаров:', error);
        alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleMigration = async () => {
    try {
      const result = await migrateLocalStorageToSupabase();
      
      if (result.success) {
        alert(`✅ Миграция завершена! Мигрировано товаров: ${result.migrated} из ${result.total}`);
        checkSupabase();
      } else {
        alert(`❌ Ошибка миграции: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncSupabaseToLocalStorage();
      
      if (result.success) {
        alert(`✅ Синхронизация завершена! Синхронизировано товаров: ${result.synced}`);
        checkLocalStorage();
      } else {
        alert(`❌ Ошибка синхронизации: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Отладка системы</h1>
          <p className="text-gray-600">Диагностика localStorage и Supabase</p>
        </div>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Назад к товарам
        </Link>
      </div>

      {/* Статус Supabase */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Статус Supabase</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                supabaseInfo.connected ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm">
                Подключение: {supabaseInfo.connected ? 'Активно' : 'Отсутствует'}
              </span>
            </div>
            <button
              onClick={checkSupabase}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Проверить
            </button>
          </div>

          {supabaseInfo.connected && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{supabaseInfo.productsCount}</div>
                <div className="text-sm text-gray-600">Товаров</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{supabaseInfo.ordersCount}</div>
                <div className="text-sm text-gray-600">Заказов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{supabaseInfo.usersCount}</div>
                <div className="text-sm text-gray-600">Пользователей</div>
              </div>
            </div>
          )}

          {supabaseInfo.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold">Ошибка Supabase:</h3>
              <p className="text-red-600 text-sm">{supabaseInfo.error}</p>
            </div>
          )}
        </div>
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
          {debugInfo.parsedData && Array.isArray(debugInfo.parsedData) && (
            <p className="text-sm text-green-600">
              Найдено товаров в localStorage: {debugInfo.parsedData.length}
            </p>
          )}
        </div>
      </div>

      {/* Ошибки */}
      {debugInfo.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Ошибка localStorage:</h3>
          <p className="text-red-600">{debugInfo.error}</p>
        </div>
      )}

      {/* Действия */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Действия</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={addTestProduct}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Добавить тестовый товар
          </button>
          <button
            onClick={handleMigration}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Мигрировать в Supabase
          </button>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Синхронизировать
          </button>
          <button
            onClick={clearAllProducts}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Очистить все товары
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Обновить страницу
          </button>
          <button
            onClick={() => {
              checkLocalStorage();
              checkSupabase();
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Обновить данные
          </button>
        </div>
      </div>

      {/* Сырые данные localStorage */}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Парсенные данные localStorage</h2>
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
