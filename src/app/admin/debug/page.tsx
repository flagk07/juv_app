'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Проверяем localStorage
    const checkLocalStorage = () => {
      try {
        const storedProducts = localStorage.getItem('juv_products');
        console.log('localStorage juv_products:', storedProducts);
        
        if (storedProducts) {
          const parsedProducts = JSON.parse(storedProducts);
          console.log('Parsed products:', parsedProducts);
          setProducts(parsedProducts);
          setLocalStorageData({
            raw: storedProducts,
            parsed: parsedProducts,
            count: parsedProducts.length
          });
        } else {
          setLocalStorageData({
            raw: null,
            parsed: null,
            count: 0
          });
        }
      } catch (error) {
        console.error('Error reading localStorage:', error);
        setLocalStorageData({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    checkLocalStorage();
  }, []);

  const addTestProduct = () => {
    const testProduct = {
      id: Date.now().toString(),
      name: 'Тестовый товар',
      description: 'Описание тестового товара',
      price: 1000,
      category: 'rings',
      inStock: true,
      imageUrl: '',
      createdAt: new Date().toISOString()
    };

    const existingProducts = JSON.parse(localStorage.getItem('juv_products') || '[]');
    existingProducts.push(testProduct);
    localStorage.setItem('juv_products', JSON.stringify(existingProducts));
    
    console.log('Added test product:', testProduct);
    console.log('Updated localStorage:', localStorage.getItem('juv_products'));
    
    // Обновляем состояние
    setProducts(existingProducts);
    setLocalStorageData({
      raw: localStorage.getItem('juv_products'),
      parsed: existingProducts,
      count: existingProducts.length
    });
  };

  const clearProducts = () => {
    localStorage.removeItem('juv_products');
    setProducts([]);
    setLocalStorageData({
      raw: null,
      parsed: null,
      count: 0
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Отладка</h1>
        <p className="text-gray-600">Проверка localStorage и товаров</p>
      </div>

      {/* Кнопки управления */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Действия</h2>
        <div className="flex space-x-4">
          <button
            onClick={addTestProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Добавить тестовый товар
          </button>
          <button
            onClick={clearProducts}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Очистить все товары
          </button>
        </div>
      </div>

      {/* Информация о localStorage */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">localStorage</h2>
        <div className="space-y-2">
          <p><strong>Количество товаров:</strong> {localStorageData?.count || 0}</p>
          <p><strong>Сырые данные:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {localStorageData?.raw || 'null'}
          </pre>
          {localStorageData?.error && (
            <p className="text-red-600"><strong>Ошибка:</strong> {localStorageData.error}</p>
          )}
        </div>
      </div>

      {/* Список товаров */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Товары ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-gray-600">Товаров нет</p>
        ) : (
          <div className="space-y-4">
            {products.map((product: any) => (
              <div key={product.id} className="border p-4 rounded">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-lg font-bold">{product.price} ₽</p>
                <p className="text-sm text-gray-500">Категория: {product.category}</p>
                <p className="text-sm text-gray-500">В наличии: {product.inStock ? 'Да' : 'Нет'}</p>
                <p className="text-xs text-gray-400">ID: {product.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Консоль */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Консоль браузера</h2>
        <p className="text-gray-600">
          Откройте консоль браузера (F12) и посмотрите на логи для отладки
        </p>
      </div>
    </div>
  );
} 