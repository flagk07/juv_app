'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { migrateLocalStorageToSupabase, syncSupabaseToLocalStorage } from '@/lib/migration'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isClient, setIsClient] = useState(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'localStorage' | 'error'>('supabase');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    loadProducts();
  }, [isClient]);

  const loadProducts = async () => {
    try {
      console.log('🔍 Загрузка товаров из Supabase...');
      
      // 1. Пытаемся загрузить из Supabase
      const { data: supabaseProducts, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('❌ Ошибка Supabase:', supabaseError);
        throw new Error('Supabase недоступен');
      }

      if (supabaseProducts && supabaseProducts.length > 0) {
        console.log('✅ Товары загружены из Supabase:', supabaseProducts.length);
        setProducts(supabaseProducts);
        setDataSource('supabase');
        
        // Синхронизируем с localStorage
        localStorage.setItem('juv_products', JSON.stringify(supabaseProducts));
        return;
      }

      // 2. Если Supabase пуст, пытаемся загрузить из localStorage
      console.log('📭 Supabase пуст, проверяем localStorage...');
      const storedProducts = localStorage.getItem('juv_products');
      
      if (storedProducts) {
        const localProducts = JSON.parse(storedProducts);
        console.log('✅ Товары загружены из localStorage:', localProducts.length);
        setProducts(localProducts);
        setDataSource('localStorage');
      } else {
        console.log('📭 Нет товаров ни в Supabase, ни в localStorage');
        setProducts([]);
        setDataSource('supabase');
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки из Supabase:', error);
      
      // Fallback к localStorage
      try {
        const storedProducts = localStorage.getItem('juv_products');
        if (storedProducts) {
          const localProducts = JSON.parse(storedProducts);
          console.log('⚠️ Fallback: товары загружены из localStorage:', localProducts.length);
          setProducts(localProducts);
          setDataSource('localStorage');
        } else {
          setProducts([]);
          setDataSource('error');
        }
      } catch (localError) {
        console.error('❌ Ошибка загрузки из localStorage:', localError);
        setProducts([]);
        setDataSource('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    try {
      setLoading(true);
      console.log('🔄 Начинаем миграцию localStorage → Supabase...');
      
      const result = await migrateLocalStorageToSupabase();
      
      if (result.success) {
        alert(`✅ Миграция завершена! Мигрировано товаров: ${result.migrated} из ${result.total}`);
        loadProducts(); // Перезагружаем данные
      } else {
        alert(`❌ Ошибка миграции: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Ошибка миграции:', error);
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      console.log('🔄 Синхронизация Supabase → localStorage...');
      
      const result = await syncSupabaseToLocalStorage();
      
      if (result.success) {
        alert(`✅ Синхронизация завершена! Синхронизировано товаров: ${result.synced}`);
        loadProducts(); // Перезагружаем данные
      } else {
        alert(`❌ Ошибка синхронизации: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (productId: string) => {
    if (!isClient) return;
    
    try {
      console.log('🔄 Переключение статуса товара:', productId);
      
      // Находим товар
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const newStockStatus = !product.in_stock;

      // 1. Обновляем в Supabase
      const { error: supabaseError } = await supabase
        .from('products')
        .update({ in_stock: newStockStatus })
        .eq('id', productId);

      if (supabaseError) {
        console.error('❌ Ошибка обновления в Supabase:', supabaseError);
        throw new Error(`Supabase: ${supabaseError.message}`);
      }

      // 2. Обновляем локальное состояние
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, in_stock: newStockStatus } : p
      );
      setProducts(updatedProducts);

      // 3. Обновляем localStorage
      localStorage.setItem('juv_products', JSON.stringify(updatedProducts));
      
      console.log('✅ Статус товара обновлен');
    } catch (error) {
      console.error('❌ Ошибка обновления статуса:', error);
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!isClient) return;
    
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        console.log('🗑️ Удаление товара:', productId);
        
        // 1. Удаляем из Supabase
        const { error: supabaseError } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (supabaseError) {
          console.error('❌ Ошибка удаления из Supabase:', supabaseError);
          throw new Error(`Supabase: ${supabaseError.message}`);
        }

        // 2. Обновляем локальное состояние
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);

        // 3. Обновляем localStorage
        localStorage.setItem('juv_products', JSON.stringify(updatedProducts));
        
        console.log('✅ Товар удален');
      } catch (error) {
        console.error('❌ Ошибка удаления товара:', error);
        alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    }
  };

  const filteredProducts = products.filter((product: any) => {
    if (filter === 'active' && !product.in_stock) return false;
    if (filter === 'inactive' && product.in_stock) return false;
    return true;
  });

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
        <div className="flex space-x-2">
          <Link
            href="/admin/debug"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Отладка
          </Link>
          <Link
            href="/admin/products/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Добавить товар
          </Link>
        </div>
      </div>

      {/* Статус источника данных */}
      <div className={`p-4 rounded-lg border ${
        dataSource === 'supabase' ? 'bg-green-50 border-green-200' :
        dataSource === 'localStorage' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              Источник данных: {
                dataSource === 'supabase' ? '🗄️ Supabase (База данных)' :
                dataSource === 'localStorage' ? '💾 localStorage (Локально)' :
                '❌ Ошибка загрузки'
              }
            </h3>
            <p className="text-sm text-gray-600">
              {dataSource === 'supabase' && 'Данные загружены из облачной базы данных'}
              {dataSource === 'localStorage' && 'Fallback: данные из локального хранилища'}
              {dataSource === 'error' && 'Не удалось загрузить данные ни из одного источника'}
            </p>
          </div>
          <div className="flex space-x-2">
            {dataSource === 'localStorage' && (
              <button
                onClick={handleMigration}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Мигрировать в Supabase
              </button>
            )}
            <button
              onClick={handleSync}
              disabled={loading}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              Синхронизировать
            </button>
          </div>
        </div>
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
            Все ({products.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Активные ({products.filter((p: any) => p.in_stock).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Неактивные ({products.filter((p: any) => !p.in_stock).length})
          </button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Список товаров ({filteredProducts.length})
          </h2>
        </div>
        <div className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {products.length === 0 ? 'Товаров пока нет' : 'Товары не найдены'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 
                  ? 'Добавьте первый товар в каталог' 
                  : 'Попробуйте изменить фильтры'
                }
              </p>
              <Link
                href="/admin/products/add"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                + Добавить товар
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                  {product.image_url && (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                      </span>
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        {product.price.toLocaleString()} ₽
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => toggleStock(product.id)}
                        className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                          product.in_stock
                            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {product.in_stock ? 'Снять с продажи' : 'Вернуть в продажу'}
                      </button>
                      
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
