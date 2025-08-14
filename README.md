# JUV - Telegram WebApp для ювелирного магазина

Полнофункциональная система для продажи ювелирных изделий через Telegram WebApp с AI-помощником на базе OpenAI GPT-4o.

## 🌟 Возможности

### WebApp (React/Next.js)
- 📱 Каталог ювелирных изделий в стиле JUV
- 🛒 Корзина покупок с управлением количеством
- 📝 Оформление заказа без обязательной регистрации  
- 👤 Опциональная регистрация по email/телефону
- 🎨 Фирменный дизайн в кремово-синих тонах

### Telegram Bot (Node.js)
- 🚀 Главное меню с кнопками
- 🛍 Прямая ссылка на WebApp
- 🤖 AI-помощник для консультаций
- 📊 Логирование всех действий пользователей
- 👑 Админ-команды для статистики

### AI-Помощник (OpenAI GPT-4o)
- 💎 Консультации по ювелирным изделиям
- 🔍 Помощь в выборе украшений
- 💍 Информация о камнях и металлах
- 🧹 Советы по уходу за украшениями

### База данных (Supabase)
- 👥 Пользователи (с поддержкой Telegram ID)
- 📦 Каталог товаров
- 🛒 Корзины покупок
- 📋 Заказы с детализацией
- 📈 Полное логирование действий

## 🚀 Быстрый старт

### 1. Клонирование проекта
```bash
git clone <repository-url>
cd juv
```

### 2. Настройка окружения
Создайте файл `.env` в корне проекта:
```env
# Telegram Bot
BOT_TOKEN=7726909438:AAE25m0W57yjZjk0fO4KCPGsspeldX8h_ws
ADMIN_ID=195830791
BOT_USERNAME=juv_app_bot

# Supabase
SUPABASE_URL=https://hsrqdpwzgcugnanssawpl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# WebApp
WEBAPP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Установка зависимостей
```bash
# Установка всех зависимостей
npm run install:all

# Или по отдельности:
npm install              # Корневые зависимости
cd webapp && npm install # WebApp
cd ../bot && npm install # Bot
```

### 4. Настройка базы данных
```bash
# Создание схемы и добавление тестовых данных
npm run setup:db
```

### 5. Запуск в разработке
```bash
# Запуск WebApp и Bot одновременно
npm run dev

# Или по отдельности:
npm run dev:webapp  # WebApp на http://localhost:3000
npm run dev:bot     # Telegram Bot
```

## 📁 Структура проекта

```
juv/
├── webapp/                 # Next.js WebApp
│   ├── src/
│   │   ├── app/           # App Router страницы
│   │   ├── components/    # React компоненты
│   │   └── lib/          # Утилиты и конфигурация
│   ├── package.json
│   └── next.config.js
├── bot/                   # Telegram Bot
│   ├── src/
│   │   ├── index.js      # Главный файл бота
│   │   └── setup-database.js
│   └── package.json
├── scripts/               # Вспомогательные скрипты
├── package.json          # Корневой package.json
└── README.md
```

## 🎨 Дизайн-система JUV

### Цветовая палитра
- **Основной:** `#627d98` (серо-синий)
- **Фон:** `#fdf2e9` (кремово-бежевый)
- **Акценты:** `#d4af37` (золотой)

### Типографика
- **Основной шрифт:** Inter
- **Заголовки:** Georgia (с засечками)

### Компоненты
- Закругленные кнопки с тенями
- Карточки товаров с hover-эффектами
- Минималистичные формы
- Студийные фотографии украшений

## 🔧 Команды разработки

### Общие команды
```bash
npm run dev          # Запуск всего проекта
npm run build        # Сборка WebApp
npm run start        # Запуск в продакшене
npm run install:all  # Установка всех зависимостей
```

### WebApp команды
```bash
cd webapp
npm run dev          # Разработка
npm run build        # Сборка
npm run start        # Продакшен
npm run lint         # Проверка кода
```

### Bot команды
```bash
cd bot
npm run dev          # Разработка с nodemon
npm run start        # Продакшен
npm run setup:db     # Настройка БД
```

## 📊 API и интеграции

### Supabase таблицы
- **users** - пользователи с Telegram ID
- **products** - каталог товаров
- **cart_items** - содержимое корзин
- **orders** - заказы с деталями
- **logs** - логи всех действий

### Логируемые действия
- `open_webapp` - открытие WebApp
- `view_product` - просмотр товара  
- `add_to_cart` - добавление в корзину
- `confirm_order` - подтверждение заказа
- `call_support` - вызов AI-помощника
- `ai_question` - вопрос AI
- `ai_response` - ответ AI

## 🚀 Деплой

### WebApp (Vercel)
1. Подключите репозиторий к Vercel
2. Установите переменные окружения
3. Настройте домен в Telegram Bot

### Bot (любой VPS)
```bash
# Производственный запуск
cd bot
npm start

# С PM2
pm2 start src/index.js --name "juv-bot"
```

### Настройка Telegram Bot
1. Установите WebApp URL в BotFather
2. Настройте команды:
   ```
   shop - Открыть магазин
   assistant - AI-помощник  
   help - Справка
   ```

## 🔐 Безопасность

- Пароли хэшируются через Supabase Auth
- Корзины привязываются к Telegram ID
- Логирование всех действий
- Валидация данных на клиенте и сервере

## 📝 Использование

### Для пользователей
1. Найдите бота `@juv_app_bot` в Telegram
2. Нажмите `/start` для начала
3. Используйте "🛍 Открыть магазин" для покупок
4. Задавайте вопросы AI-помощнику

### Для администраторов
- `/stats` - статистика пользователей и заказов
- Просмотр логов в Supabase Dashboard
- Управление товарами через админ-панель Supabase

## 🆘 Поддержка

### Часто встречающиеся проблемы

**WebApp не открывается**
- Проверьте WEBAPP_URL в .env
- Убедитесь, что WebApp запущен на правильном порту

**Bot не отвечает**
- Проверьте BOT_TOKEN
- Убедитесь, что бот запущен и имеет доступ к интернету

**Ошибки базы данных**  
- Проверьте SUPABASE_URL и SUPABASE_ANON_KEY
- Запустите `npm run setup:db` для создания таблиц

## 📜 Лицензия

MIT License - используйте свободно для коммерческих и личных проектов.

---

**JUV** - Изысканные украшения в современном формате 💎 