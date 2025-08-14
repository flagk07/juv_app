# Диагностика проблемы с ботом

## Проблема
Вместо ответов бота показывается реклама Ethereum.

## Возможные причины

### 1. Бот не запущен
```bash
# Проверьте, запущен ли бот
ps aux | grep node
```

### 2. Неправильный токен бота
Проверьте переменную `BOT_TOKEN` в `.env`:
```env
BOT_TOKEN=7726909438:AAE25m0W57yjZjk0fO4KCPGsspeldX8h_ws
```

### 3. Бот заблокирован или удален
Проверьте статус бота в @BotFather:
- Отправьте `/mybots` в @BotFather
- Найдите вашего бота
- Проверьте статус

### 4. Webhook не настроен правильно
Если используете webhook:
```bash
# Проверьте webhook
curl "https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"
```

### 5. Polling не работает
Если используете polling, бот должен быть запущен:
```bash
cd bot
npm run dev
```

## Тестирование бота

### 1. Простой тест
Отправьте боту команду `/start` - должен ответить приветствием.

### 2. Тест AI-помощника
1. Отправьте `/assistant`
2. Напишите любой вопрос
3. Должен ответить AI-помощник

### 3. Тест меню
1. Откройте WebApp
2. Нажмите кнопку "Меню"
3. Должно появиться меню бота

## Логи для отладки

### В боте должны быть логи:
```
🚀 JUV Telegram Bot is running!
📱 Bot username: @your_bot_username
🌐 WebApp URL: https://juv-app.vercel.app/
```

### При получении сообщений:
```
📱 WebApp data received: { data: '{"action":"show_menu"}' }
📋 Parsed WebApp data: { action: 'show_menu', user_id: 123456789 }
🎯 Processing show_menu action for user: 123456789
✅ Menu sent successfully
```

## Решение

### 1. Перезапустите бота
```bash
cd bot
npm run dev
```

### 2. Проверьте переменные окружения
```env
BOT_TOKEN=ваш_токен_бота
SUPABASE_URL=ваш_url_supabase
SUPABASE_ANON_KEY=ваш_ключ_supabase
OPENAI_API_KEY=ваш_ключ_openai
WEBAPP_URL=https://juv-app.vercel.app/
ADMIN_ID=ваш_telegram_id
```

### 3. Проверьте права бота
В @BotFather убедитесь, что бот:
- Не заблокирован
- Имеет права на отправку сообщений
- WebApp URL настроен правильно

### 4. Альтернативное решение
Если бот не работает, используйте webhook:
```bash
# Настройте webhook
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://ваш-домен.com/api/webhook"}'
```

## Контакты для поддержки
Если проблема не решена:
1. Проверьте логи бота
2. Убедитесь, что все переменные окружения установлены
3. Проверьте статус бота в @BotFather
4. Попробуйте создать нового бота для тестирования 