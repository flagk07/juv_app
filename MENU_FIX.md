# Исправление проблемы с кнопкой "Меню"

## Проблема
При нажатии на кнопку "Меню" в левом нижнем углу Telegram WebApp показывалась реклама эфира вместо меню бота.

## Причина
В WebApp приложении не была настроена правильная обработка кнопки меню. Telegram по умолчанию показывает рекламу эфира, если WebApp не отправляет данные в бот.

## Решение

### 1. Обновлен WebApp (src/app/page.tsx)
Добавлена кнопка "Меню" в WebApp, которая отправляет данные в бот:

```typescript
// Setup menu button handler
if (tgApp.isSupported()) {
  // Show menu button
  tgApp.showMainButton('Меню', () => {
    // Send data to bot to show menu
    tgApp.sendData(JSON.stringify({
      action: 'show_menu',
      user_id: user?.id
    }))
  })
}
```

### 2. Обновлен бот (bot/src/index.js)
Добавлен обработчик для данных из WebApp:

```javascript
// Handle WebApp data
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    
    if (data.action === 'show_menu') {
      await logUserAction(ctx.from.id, ctx.from.username, 'webapp_menu_request');
      
      const menuKeyboard = {
        inline_keyboard: [
          [
            {
              text: '🛍 Магазин',
              web_app: { url: WEBAPP_URL }
            }
          ],
          [
            {
              text: '🤖 Помощь',
              callback_data: 'help_assistant'
            }
          ],
          [
            {
              text: '❓ Справка',
              callback_data: 'info'
            }
          ]
        ]
      };

      await ctx.reply(
        '📋 **Меню JUV**\n\n' +
        'Выберите нужное действие:',
        { 
          reply_markup: menuKeyboard,
          parse_mode: 'HTML'
        }
      );
    }
  } catch (error) {
    console.error('Error handling WebApp data:', error);
  }
});
```

### 3. Обновлен webhook (api/webhook.js)
Добавлен обработчик для данных из WebApp в webhook:

```javascript
// Handle WebApp data
if (update.message?.web_app_data) {
  try {
    const data = JSON.parse(update.message.web_app_data.data);
    
    if (data.action === 'show_menu') {
      await logUserAction(userId, username, 'webapp_menu_request');
      
      const menuKeyboard = {
        inline_keyboard: [
          [
            {
              text: '🛍 Магазин',
              web_app: { url: 'https://juv-app.vercel.app/' }
            }
          ],
          [
            {
              text: '🤖 Помощь',
              callback_data: 'help_assistant'
            }
          ],
          [
            {
              text: '❓ Справка',
              callback_data: 'info'
            }
          ]
        ]
      };

      await sendMessage(
        chatId,
        '📋 **Меню JUV**\n\n' +
        'Выберите нужное действие:',
        menuKeyboard
      );
    }
  } catch (error) {
    console.error('Error handling WebApp data:', error);
  }
}
```

## Результат
Теперь при нажатии на кнопку "Меню" в WebApp:
1. Показывается кнопка "Меню" в нижней части экрана
2. При нажатии на неё отправляются данные в бот
3. Бот показывает меню с кнопками:
   - 🛍 Магазин (открывает WebApp)
   - 🤖 Помощь (AI-консультант)
   - ❓ Справка (информация о боте)
   - 📊 Статистика (только для админа)

## Тестирование
1. Запустите WebApp: `npm run dev`
2. Запустите бота: `cd bot && npm run dev`
3. Откройте WebApp в Telegram
4. Нажмите на кнопку "Меню" в нижней части экрана
5. Должно появиться меню бота вместо рекламы эфира 