# Инструкции по развертыванию и тестированию

## Проблема
При нажатии на кнопку "Меню" в Telegram WebApp показывалась реклама эфира вместо меню бота.

## Исправления внесены в:

### 1. WebApp (src/app/page.tsx)
- ✅ Добавлена кнопка "Меню" в нижней части экрана
- ✅ При нажатии отправляются данные в бот с действием `show_menu`

### 2. Бот (bot/src/index.js)
- ✅ Добавлен обработчик `message:web_app_data`
- ✅ При получении данных с `action: 'show_menu'` показывается меню

### 3. Webhook (api/webhook.js)
- ✅ Добавлен обработчик для данных из WebApp
- ✅ Обеспечена совместимость с webhook-версией

## Для развертывания:

### 1. Установите Node.js
```bash
# Установите Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установите Node.js
brew install node
```

### 2. Запустите WebApp
```bash
# В корневой папке проекта
npm install
npm run dev
```

### 3. Запустите бота
```bash
# В папке bot
cd bot
npm install
npm run dev
```

### 4. Настройте переменные окружения
Создайте файл `.env` в корневой папке:
```env
BOT_TOKEN=ваш_токен_бота
SUPABASE_URL=ваш_url_supabase
SUPABASE_ANON_KEY=ваш_ключ_supabase
OPENAI_API_KEY=ваш_ключ_openai
WEBAPP_URL=https://juv-app.vercel.app/
ADMIN_ID=ваш_telegram_id
```

### 5. Настройте webhook (опционально)
Если используете webhook вместо polling:
```bash
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://ваш-домен.com/api/webhook"}'
```

## Тестирование:

### 1. Откройте WebApp в Telegram
- Найдите вашего бота в Telegram
- Нажмите кнопку "Открыть магазин" или используйте команду `/shop`

### 2. Проверьте кнопку "Меню"
- В WebApp должна появиться кнопка "Меню" в нижней части экрана
- При нажатии на неё должно появиться меню бота с кнопками:
  - 🛍 Магазин
  - 🤖 Помощь
  - ❓ Справка
  - 📊 Статистика (для админа)

### 3. Проверьте логи
В консоли бота должны появиться сообщения:
```
📱 WebApp data received: { action: 'show_menu', user_id: 123456789 }
✅ Action logged: webapp_menu_request
```

## Если проблема не решена:

### 1. Проверьте, что бот запущен
```bash
# Проверьте процессы
ps aux | grep node
```

### 2. Проверьте логи бота
```bash
# В папке bot
npm run dev
```

### 3. Проверьте webhook (если используется)
```bash
# Проверьте статус webhook
curl "https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"
```

### 4. Проверьте переменные окружения
```bash
# Убедитесь, что все переменные установлены
echo $BOT_TOKEN
echo $SUPABASE_URL
echo $WEBAPP_URL
```

## Альтернативное решение:

Если Node.js не установлен, можно развернуть на хостинге:

### Vercel (для WebApp)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой произойдет автоматически

### Railway/Heroku (для бота)
1. Подключите папку `bot` к Railway или Heroku
2. Настройте переменные окружения
3. Настройте webhook URL

## Контакты для поддержки:
Если проблема не решена, проверьте:
1. Логи бота в консоли
2. Логи WebApp в браузере (F12)
3. Статус webhook в Telegram API 