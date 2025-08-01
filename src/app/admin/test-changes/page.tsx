'use client'

import { useState, useEffect } from 'react'

export default function TestChangesPage() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Проверка изменений</h1>
        <p className="text-gray-600">Эта страница показывает, что изменения применились</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация</h2>
        <div className="space-y-2">
          <p><strong>Время загрузки:</strong> {currentTime}</p>
          <p><strong>Версия:</strong> 1.0.1 (с отладкой)</p>
          <p><strong>Статус:</strong> ✅ Изменения применены</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Что должно работать:</h2>
        <ul className="space-y-2 text-gray-600">
          <li>✅ Кнопка "Отладка" на странице товаров</li>
          <li>✅ Очищенная статистика (все нули)</li>
          <li>✅ Страница отладки по адресу /admin/debug</li>
          <li>✅ Улучшенная загрузка товаров из localStorage</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Если не работает:</h2>
        <ul className="space-y-2 text-gray-600">
          <li>🔄 Обновите страницу (Ctrl+F5 или Cmd+Shift+R)</li>
          <li>🗑️ Очистите кэш браузера</li>
          <li>🌐 Попробуйте открыть в режиме инкогнито</li>
          <li>⏰ Подождите 1-2 минуты (деплой может занять время)</li>
        </ul>
      </div>
    </div>
  );
} 