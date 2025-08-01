'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const categories = [
  { value: 'rings', label: 'Кольца' },
  { value: 'earrings', label: 'Серьги' },
  { value: 'necklaces', label: 'Цепочки' },
  { value: 'bracelets', label: 'Браслеты' }
];

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'rings',
    inStock: true
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Проверяем доступность localStorage
      if (!isClient || typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage недоступен');
      }

      // Создаем новый товар
      const newProduct = {
        id: Date.now().toString(),
        ...formData,
        price: parseFloat(formData.price),
        createdAt: new Date().toISOString()
      };

      // Сохраняем в localStorage
      const existingProducts = JSON.parse(localStorage.getItem('juv_products') || '[]');
      existingProducts.push(newProduct);
      localStorage.setItem('juv_products', JSON.stringify(existingProducts));

      console.log('✅ Товар создан:', newProduct);
      console.log('✅ Всего товаров:', existingProducts.length);
      
      alert('Товар успешно добавлен!');
      
      // Перенаправление на список товаров
      router.push('/admin/products');
    } catch (error) {
      console.error('❌ Ошибка при создании товара:', error);
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Добавить товар</h1>
          <p className="text-gray-600">Создание нового товара в каталоге</p>
        </div>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Назад к товарам
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Форма */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Информация о товаре</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Золотое кольцо с бриллиантом"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Подробное описание товара..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL изображения
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Товар в наличии
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/products"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Создание...' : 'Создать товар'}
              </button>
            </div>
          </form>
        </div>

        {/* Предварительный просмотр */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Предварительный просмотр</h2>
          </div>
          <div className="p-6">
            {formData.name ? (
              <div className="space-y-4">
                {formData.imageUrl && (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt={formData.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {formData.price ? `${parseFloat(formData.price).toLocaleString()} ₽` : 'Цена не указана'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    formData.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {formData.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  Категория: {categories.find(c => c.value === formData.category)?.label}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🛍</div>
                <p className="text-gray-600">Заполните форму, чтобы увидеть предварительный просмотр</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 