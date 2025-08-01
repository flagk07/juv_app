'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Загружаем товары из localStorage
    const loadProducts = () => {
      try {
        const storedProducts = localStorage.getItem('juv_products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
      }
      setLoading(false);
    };

    loadProducts();
  }, []);

  const toggleStock = (productId: string) => {
    // Обновляем статус товара в localStorage
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, inStock: !product.inStock }
        : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('juv_products', JSON.stringify(updatedProducts));
  };

  const deleteProduct = (productId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('juv_products', JSON.stringify(updatedProducts));
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'active' && !product.inStock) return false;
    if (filter === 'inactive' && product.inStock) return false;
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
            Все ({products.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Активные ({products.filter(p => p.inStock).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Неактивные ({products.filter(p => !p.inStock).length})
          </button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Список товаров ({filteredProducts.length})</h2>
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
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                  {product.imageUrl && (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <img
                        src={product.imageUrl}
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
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'В наличии' : 'Нет в наличии'}
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
                          product.inStock
                            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {product.inStock ? 'Снять с продажи' : 'Вернуть в продажу'}
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