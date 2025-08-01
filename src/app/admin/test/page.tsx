export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-600">✅ Тестовая страница работает!</h1>
      <p className="text-gray-600 mt-4">Если вы видите эту страницу, значит роутинг работает.</p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold text-blue-900">Информация:</h2>
        <ul className="mt-2 text-sm text-blue-800">
          <li>• Next.js App Router работает</li>
          <li>• Страницы админки должны быть доступны</li>
          <li>• Проверьте: /admin/dashboard</li>
          <li>• Проверьте: /admin/orders</li>
        </ul>
      </div>
    </div>
  );
} 