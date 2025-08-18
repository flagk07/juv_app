'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TestChangesPage() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
  }, []);

  const changes = [
    '✅ Добавлена проверка isClient для предотвращения SSR ошибок',
    '✅ Улучшена обработка localStorage с проверками доступности',
    '✅ Добавлены подробные логи для отладки',
    '✅ Исправлена типизация для избежания TypeScript ошибок',
    '✅ Добавлены уведомления об успешном создании товара',
    '✅ Обнулена тестовая статистика на главной странице',
    '✅ Создана страница отладки /admin/debug',
    '✅ Добавлена кнопка "Отладка" в навигацию'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Проверка изменений</h1>
          <p className="text-gray-600">Версия: 2.1.0 | Время: {currentTime}</p>
        </div>
        <Link
          href="/admin"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Назад к панели
        </Link>
      </div>

      {/* Статус деплоя */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-semibold flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Изменения успешно развернуты
        </h3>
        <p className="text-green-600 text-sm mt-1">
          Если вы видите эту страницу, значит новая версия работает корректно.
        </p>
      </div>

      {/* Список изменений */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Внесенные изменения:</h2>
        <ul className="space-y-2">
          {changes.map((change, index) => (
            <li key={index} className="text-sm text-gray-700">
              {change}
            </li>
          ))}
        </ul>
      </div>

      {/* Быстрые тесты */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые тесты:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/products/add"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Добавить товар</h3>
            <p className="text-sm text-gray-600">Протестировать создание товара</p>
          </Link>
          
          <Link
            href="/admin/products"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Список товаров</h3>
            <p className="text-sm text-gray-600">Проверить отображение товаров</p>
          </Link>
          
          <Link
            href="/admin/debug"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Отладка</h3>
            <p className="text-sm text-gray-600">Диагностика localStorage</p>
          </Link>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900">localStorage</h3>
            <p className="text-sm text-gray-600">
              Статус: {typeof window !== 'undefined' && window.localStorage ? '✅ Доступен' : '❌ Недоступен'}
            </p>
          </div>
        </div>
      </div>

      {/* Устранение неполадок */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-yellow-800 font-semibold">Если изменения не видны:</h3>
        <ul className="text-yellow-700 text-sm mt-2 space-y-1">
          <li>• Обновите страницу (Ctrl+F5 / Cmd+Shift+R)</li>
          <li>• Очистите кеш браузера</li>
          <li>• Проверьте консоль браузера на ошибки</li>
          <li>• Попробуйте открыть в режиме инкогнито</li>
        </ul>
      </div>
    </div>
  );
}
