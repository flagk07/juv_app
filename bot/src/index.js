require('dotenv').config();

const { Bot, session, GrammyError, HttpError } = require('grammy');
const { Menu } = require('@grammyjs/menu');
const OpenAI = require('openai');

// Debug: Check environment variables
console.log('🔧 Environment variables check:');
console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('BOT_TOKEN length:', process.env.BOT_TOKEN ? process.env.BOT_TOKEN.length : 0);
console.log('BOT_TOKEN first 10 chars:', process.env.BOT_TOKEN ? process.env.BOT_TOKEN.substring(0, 10) + '...' : 'N/A');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('WEBAPP_URL:', process.env.WEBAPP_URL || 'DEFAULT');

// Initialize services
console.log('🤖 Creating bot instance...');
const bot = new Bot(process.env.BOT_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// WebApp URL
const WEBAPP_URL = process.env.WEBAPP_URL || "https://juv-app.vercel.app/";

// Session data
bot.use(session({ 
  initial: () => ({ 
    awaitingAIQuestion: false,
    aiConversationHistory: [] // История диалога с AI
  }) 
}));

// Simple logging function (no Supabase)
async function logUserAction(telegramId, username, actionType, metadata = null) {
  console.log(`📝 Log: ${actionType} by ${username} (${telegramId})`, metadata);
}

// Simple user check (no Supabase)
async function ensureUser(ctx) {
  const user = ctx.from;
  if (!user) return null;
  
  console.log(`👤 User check: ${user.username} (${user.id})`);
  return { id: user.id, username: user.username };
}

// Main menu
const mainMenu = new Menu("main-menu")
  .webApp("🛍 Открыть магазин", WEBAPP_URL)
  .row()
  .text("🤖 AI-помощник", async (ctx) => {
    await logUserAction(ctx.from.id, ctx.from.username, 'call_support');
    
    // Очищаем историю диалога и активируем AI-помощника
    ctx.session.awaitingAIQuestion = true;
    ctx.session.aiConversationHistory = [];
    
    await ctx.reply(
      "👋 Привет! Я AI-помощник JUV.\n\n" +
      "Я могу ответить на вопросы о:\n" +
      "• Ювелирных изделиях и их характеристиках\n" +
      "• Уходе за украшениями\n" +
      "• Выборе размера\n" +
      "• Камнях и металлах\n" +
      "• Подборе украшений\n\n" +
      "💡 Задайте ваш вопрос:"
    );
  });

bot.use(mainMenu);

// Start command
bot.command("start", async (ctx) => {
  await ensureUser(ctx);
  await logUserAction(ctx.from.id, ctx.from.username, 'start_bot');
  
  const firstName = ctx.from.first_name || 'Друг';
  
  await ctx.reply(
    `✨ Добро пожаловать в JUV, ${firstName}!\n\n` +
    `Мы создаем изысканные ювелирные украшения, которые подчеркивают вашу индивидуальность.\n\n` +
    `Выберите действие:`,
    { reply_markup: mainMenu }
  );
});

// Menu command (same as start)
bot.command("menu", async (ctx) => {
  await ensureUser(ctx);
  await logUserAction(ctx.from.id, ctx.from.username, 'menu_command');
  
  const firstName = ctx.from.first_name || 'Друг';
  
  await ctx.reply(
    `📋 Меню JUV, ${firstName}!\n\n` +
    `Мы создаем изысканные ювелирные украшения, которые подчеркивают вашу индивидуальность.\n\n` +
    `Выберите действие:`,
    { reply_markup: mainMenu }
  );
});

// Shop command
bot.command("shop", async (ctx) => {
  await ensureUser(ctx);
  await logUserAction(ctx.from.id, ctx.from.username, 'open_webapp');
  
  await ctx.reply(
    "🛍 Добро пожаловать в магазин JUV!\n\nОткройте наш каталог украшений:",
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "Открыть магазин",
            web_app: { url: WEBAPP_URL }
          }
        ]]
      }
    }
  );
});

// Assistant command
bot.command("assistant", async (ctx) => {
  await ensureUser(ctx);
  await logUserAction(ctx.from.id, ctx.from.username, 'call_support');
  
  // Очищаем историю диалога и активируем AI-помощника
  ctx.session.awaitingAIQuestion = true;
  ctx.session.aiConversationHistory = [];
  
  await ctx.reply(
    "🤖 AI-помощник JUV активирован!\n\n" +
    "Я эксперт по ювелирным изделиям. Задайте ваш вопрос:\n\n" +
    "💡 Вы можете задавать вопросы один за другим.\n" +
    "❌ Чтобы завершить диалог, напишите /stop"
  );
});

// Help command
bot.command("help", async (ctx) => {
  await ctx.reply(
    "📋 Доступные команды:\n\n" +
    "🛍 /shop - Открыть магазин\n" +
    "🤖 /assistant - AI-помощник\n" +
    "📞 /start - Главное меню\n" +
    "📋 /menu - Показать меню\n" +
    "❌ /stop - Завершить диалог с AI\n" +
    "❓ /help - Эта справка\n\n" +
    "Используйте кнопки меню для удобной навигации!"
  );
});

// Stop command - завершить диалог с AI
bot.command("stop", async (ctx) => {
  if (ctx.session.awaitingAIQuestion) {
    ctx.session.awaitingAIQuestion = false;
    ctx.session.aiConversationHistory = []; // Очищаем историю диалога
    await logUserAction(ctx.from.id, ctx.from.username, 'stop_ai_dialog');
    
    await ctx.reply(
      "✅ Диалог с AI-помощником завершен.\n\n" +
      "Выберите действие:",
      { reply_markup: mainMenu }
    );
  } else {
    await ctx.reply(
      "🤖 AI-помощник не активен.\n\n" +
      "Используйте /assistant для начала диалога."
    );
  }
});

// AI Assistant handler
bot.on("message:text", async (ctx) => {
  if (!ctx.session.awaitingAIQuestion) return;

  const question = ctx.message.text;
  const user = ctx.from;

  try {
    // Log AI question
    await logUserAction(user.id, user.username, 'ai_question', { question });

    // Send typing indicator
    await ctx.replyWithChatAction("typing");

    // Добавляем текущий вопрос в историю
    ctx.session.aiConversationHistory.push({
      role: "user",
      content: question
    });

    // Создаем массив сообщений для OpenAI с историей
    const messages = [
      {
        role: "system",
        content: `Вы - эксперт-консультант ювелирного магазина JUV. 
        
Вы помогаете клиентам с:
- Выбором ювелирных изделий
- Информацией о камнях, металлах, пробах
- Уходом за украшениями  
- Подбором размера
- Рекомендациями по стилю
- Ценовыми консультациями

Отвечайте дружелюбно, профессионально и информативно. 
Если вопрос не связан с ювелирными изделиями, вежливо перенаправьте разговор на тему украшений.
Длина ответа - до 500 символов.

Важно: Помните контекст предыдущих сообщений в диалоге и отвечайте с учетом всей истории разговора.`
      },
      ...ctx.session.aiConversationHistory
    ];

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 300,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 
                    "Извините, не смог обработать ваш вопрос. Попробуйте переформулировать.";

    // Добавляем ответ AI в историю
    ctx.session.aiConversationHistory.push({
      role: "assistant",
      content: response
    });

    // Ограничиваем историю последними 10 сообщениями (5 вопросов + 5 ответов)
    if (ctx.session.aiConversationHistory.length > 10) {
      ctx.session.aiConversationHistory = ctx.session.aiConversationHistory.slice(-10);
    }

    await ctx.reply(
      `🤖 ${response}\n\n` +
      `💬 Продолжайте задавать вопросы! Я помню наш разговор.\n` +
      `🛍 Чтобы открыть магазин, используйте /shop\n` +
      `❌ Чтобы завершить диалог, напишите /stop`
    );

    // Log AI response
    await logUserAction(user.id, user.username, 'ai_response', { 
      question, 
      response: response.substring(0, 100) + '...',
      conversationLength: ctx.session.aiConversationHistory.length
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    await ctx.reply(
      "😔 Извините, произошла ошибка при обработке вашего вопроса.\n\n" +
      "Попробуйте:\n" +
      "• Переформулировать вопрос\n" +
      "• Использовать /assistant для перезапуска\n" +
      "• Связаться с нами напрямую через /shop"
    );

    await logUserAction(user.id, user.username, 'ai_error', { question, error: error.message });
  }
});

// Handle WebApp data
bot.on("message:web_app_data", async (ctx) => {
  console.log('📱 WebApp data received:', ctx.message.web_app_data);
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    console.log('📋 Parsed WebApp data:', data);
    
    if (data.action === 'show_menu') {
      console.log('🎯 Processing show_menu action for user:', ctx.from.id);
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

      // Add stats button for admin
      const adminId = process.env.ADMIN_ID || '195830791';
      if (ctx.from.id.toString() === adminId) {
        menuKeyboard.inline_keyboard.splice(2, 0, [
          {
            text: '📊 Статистика',
            callback_data: 'stats'
          }
        ]);
      }

      console.log('📋 Sending menu keyboard:', menuKeyboard);
      await ctx.reply(
        '📋 **Меню JUV**\n\n' +
        'Выберите нужное действие:',
        { 
          reply_markup: menuKeyboard,
          parse_mode: 'HTML'
        }
      );
      console.log('✅ Menu sent successfully');
    } else {
      console.log('❌ Unknown action:', data.action);
    }
  } catch (error) {
    console.error('❌ Error handling WebApp data:', error);
  }
});

// Handle callback queries (menu buttons)
bot.on("callback_query", async (ctx) => {
  console.log('🔍 Callback query received:', ctx.callbackQuery.data);
  
  try {
    const callbackData = ctx.callbackQuery.data;
    
    switch (callbackData) {
      case 'help_assistant':
        await logUserAction(ctx.from.id, ctx.from.username, 'menu_help_assistant');
        
        ctx.session.awaitingAIQuestion = true;
        await ctx.reply(
          "👋 Привет! Я AI-помощник JUV.\n\n" +
          "Я могу ответить на вопросы о:\n" +
          "• Ювелирных изделиях и их характеристиках\n" +
          "• Уходе за украшениями\n" +
          "• Выборе размера\n" +
          "• Камнях и металлах\n" +
          "• Подборе украшений\n\n" +
          "Задайте ваш вопрос:"
        );
        break;
        
      case 'info':
        await logUserAction(ctx.from.id, ctx.from.username, 'menu_info');
        
        await ctx.reply(
          "ℹ️ **Информация о JUV**\n\n" +
          "Мы специализируемся на ювелирных изделиях:\n" +
          "• Золотые и серебряные украшения\n" +
          "• Драгоценные камни\n" +
          "• Индивидуальный подбор\n" +
          "• Консультации экспертов\n\n" +
          "🛍 Откройте наш магазин для просмотра товаров!"
        );
        break;
        
      case 'stats':
        if (ctx.from.id.toString() === process.env.ADMIN_ID) {
          await logUserAction(ctx.from.id, ctx.from.username, 'menu_stats');
          
          await ctx.reply(
            "📊 Статистика временно недоступна\n" +
            "(Проблемы с подключением к базе данных)"
          );
        } else {
          await ctx.reply("❌ Доступ запрещен");
        }
        break;
        
      default:
        console.log('❌ Unknown callback data:', callbackData);
        await ctx.reply("❌ Неизвестная команда");
    }
    
    // Answer callback query to remove loading state
    await ctx.answerCallbackQuery();
    
  } catch (error) {
    console.error('❌ Error handling callback query:', error);
    await ctx.answerCallbackQuery("Произошла ошибка");
  }
});

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Admin commands (for admin user only)
bot.command("stats", async (ctx) => {
  if (ctx.from.id.toString() !== process.env.ADMIN_ID) {
    return;
  }

  await ctx.reply(
    "📊 Статистика временно недоступна\n" +
    "(Проблемы с подключением к базе данных)"
  );
});

// Start bot
bot.start().then(() => {
  console.log('🚀 JUV Telegram Bot is running!');
  console.log(`📱 Bot username: @${bot.botInfo.username}`);
  console.log(`🌐 WebApp URL: ${WEBAPP_URL}`);
}).catch(console.error); 