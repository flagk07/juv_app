#!/bin/bash

echo "🚀 Начинаем деплой админской панели на Vercel..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

echo "📋 Проверяем статус Git..."
git status

echo "➕ Добавляем все файлы в Git..."
git add .

echo "📝 Создаем коммит..."
git commit -m "Add complete admin panel with dashboard, orders, products, and users management"

echo "🚀 Отправляем изменения в репозиторий..."
git push origin main

echo "✅ Деплой завершен!"
echo ""
echo "🔗 Проверьте админскую панель по ссылкам:"
echo "   • Главная: https://juv-app.vercel.app/"
echo "   • Админ панель: https://juv-app.vercel.app/admin"
echo "   • Дашборд: https://juv-app.vercel.app/admin/dashboard"
echo "   • Заказы: https://juv-app.vercel.app/admin/orders"
echo "   • Товары: https://juv-app.vercel.app/admin/products"
echo "   • Пользователи: https://juv-app.vercel.app/admin/users"
echo ""
echo "⏳ Подождите 2-3 минуты для автоматического деплоя на Vercel..."
echo ""
echo "🔧 Если деплой не сработал автоматически, выполните:"
echo "   npm install -g vercel"
echo "   vercel login"
echo "   vercel --prod" 