'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  createdAt: string;
}

const categories = [
  { value: 'rings', label: 'Кольца' },
  { value: 'earrings', label: 'Серьги' },
  { value: 'necklaces', label: 'Цепочки' },
  { value: 'bracelets', label: 'Браслеты' }
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    inStock: 'all'
  });

  useEffect(() => {
    // Моковые данные товаров
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Золотое кольцо с бриллиантом',
        description: 'Элегантное кольцо из белого золота 585 пробы с бриллиантом 0.25 карат',
        price: 85000,
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
        category: 'rings',
        inStock: true,
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        name: 'Серьги с жемчугом',
        description: 'Классические серьги с натуральным жемчугом',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
        category: 'earrings',
        inStock: true,
        createdAt: '2024-01-12T14:30:00Z'
      },
      {
        id: '3',
        name: 'Золотая цепочка',
        description: 'Изящная золотая цепочка 585 пробы, плетение "Якорное"',
        price: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        category: 'necklaces',
        inStock: false,
        createdAt: '2024-01-08T09:15:00Z'
      }
    ];

    setProducts(mockProducts);
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(product => {
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    
    if (filters.inStock !== 'all') {
      const inStockFilter = filters.inStock === 'true';
      if (product.inStock !== inStockFilter) {
        return false;
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const deleteProduct = async (productId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      // Здесь будет API вызов для удаления
      console.log(`Удаление товара ${productId}`);
      
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
  };

  const toggleStock = async (productId: string) => {
    // Здесь будет API вызов для обновления наличия
    console.log(`Переключение наличия товара ${productId}`);
    
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, inStock: !product.inStock } : product
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
          <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-600 mt-2">Управление каталогом товаров</p>
        </div>
        <Link
          href="/admin/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Добавить товар
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все категории</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              placeholder="Название или описание"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Наличие
            </label>
            <select
              value={filters.inStock}
              onChange={(e) => setFilters({...filters, inStock: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все</option>
              <option value="true">В наличии</option>
              <option value="false">Нет в наличии</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.inStock 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? 'В наличии' : 'Нет в наличии'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {product.price.toLocaleString()} ₽
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {categories.find(c => c.value === product.category)?.label}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Редактировать
                </Link>
                
                <button
                  onClick={() => toggleStock(product.id)}
                  className={`px-3 py-2 rounded border transition-colors ${
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Товары не найдены</h3>
          <p className="text-gray-600 mb-6">
            Попробуйте изменить фильтры или добавьте новый товар
          </p>
          <Link
            href="/admin/products/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Добавить первый товар
          </Link>
        </div>
      )}
    </div>
  );
} 