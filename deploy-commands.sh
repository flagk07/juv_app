#!/bin/bash

# JUV GitHub Deploy Commands
echo "🚀 Загрузка JUV проекта в GitHub..."

# Замените ВАШ-USERNAME на ваш GitHub username
GITHUB_USERNAME="ВАШ-USERNAME"
REPO_NAME="juv-telegram-webapp"

echo "📋 Инструкции:"
echo "1. Создайте репозиторий на GitHub: https://github.com/new"
echo "   - Name: juv-telegram-webapp"
echo "   - НЕ инициализируйте с README"
echo ""
echo "2. Замените ВАШ-USERNAME в команде ниже на ваш GitHub username"
echo ""

# GitHub commands
echo "🔗 Выполните эти команды:"
echo ""
echo "git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""

# Или выполните автоматически, если username корректен
read -p "Введите ваш GitHub username: " username

if [ ! -z "$username" ]; then
    echo "📤 Настройка репозитория для @$username..."
    
    git remote add origin https://github.com/$username/$REPO_NAME.git
    git branch -M main
    
    echo "🚀 Загрузка кода..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Код успешно загружен в GitHub!"
        echo "🔗 Ваш репозиторий: https://github.com/$username/$REPO_NAME"
        echo ""
        echo "📋 Следующие шаги:"
        echo "1. Перейдите на vercel.com"
        echo "2. Войдите через GitHub"
        echo "3. Нажмите 'New Project'"
        echo "4. Выберите репозиторий '$REPO_NAME'"
        echo "5. Добавьте переменные окружения в Vercel:"
        echo "   NEXT_PUBLIC_SUPABASE_URL=https://hsrqdpwzgcugnanssawpl.supabase.co"
        echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        echo ""
        echo "🎉 Готово к деплою!"
    else
        echo "❌ Ошибка при загрузке. Проверьте:"
        echo "- Создан ли репозиторий на GitHub"
        echo "- Правильный ли username"
        echo "- Есть ли доступ к репозиторию"
    fi
else
    echo "❌ Username не введен. Выполните команды вручную."
fi 