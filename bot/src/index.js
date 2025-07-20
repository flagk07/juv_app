const { Bot, session, GrammyError, HttpError } = require('grammy');
const { Menu } = require('@grammyjs/menu');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize services
const bot = new Bot(process.env.BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// WebApp URL
const WEBAPP_URL = process.env.WEBAPP_URL || "https://juv-app.vercel.app/";

// Session data
bot.use(session({ initial: () => ({ awaitingAIQuestion: false }) }));

// Logging function
async function logUserAction(telegramId, username, actionType, metadata = null) {
  try {
    const { error } = await supabase
      .from('logs')
      .insert({
        telegram_id: telegramId,
        telegram_username: username,
        action_type: actionType,
        metadata: metadata
      });
    
    if (error) {
      console.error('Error logging user action:', error);
    }
  } catch (err) {
    console.error('Failed to log user action:', err);
  }
}

// Create user if not exists
async function ensureUser(ctx) {
  const user = ctx.from;
  if (!user) return null;

  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', user.id)
      .single();

    if (!existingUser) {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: user.id,
          telegram_username: user.username
        })
        .select()
        .single();

      if (error) throw error;
      return newUser;
    }

    return existingUser;
  } catch (error) {
    console.error('Error ensuring user:', error);
    return null;
  }
}

// Main menu
const mainMenu = new Menu("main-menu")
  .webApp("🛍 Открыть магазин", WEBAPP_URL)
  .row()
  .text("🤖 AI-помощник", async (ctx) => {
    await logUserAction(ctx.from.id, ctx.from.username, 'call_support');
    
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
  
  ctx.session.awaitingAIQuestion = true;
  await ctx.reply(
    "🤖 AI-помощник JUV активирован!\n\n" +
    "Я эксперт по ювелирным изделиям. Задайте ваш вопрос:"
  );
});

// Help command
bot.command("help", async (ctx) => {
  await ctx.reply(
    "📋 Доступные команды:\n\n" +
    "🛍 /shop - Открыть магазин\n" +
    "🤖 /assistant - AI-помощник\n" +
    "📞 /start - Главное меню\n" +
    "❓ /help - Эта справка\n\n" +
    "Используйте кнопки меню для удобной навигации!"
  );
});

// AI Assistant handler
bot.on("message:text", async (ctx) => {
  if (!ctx.session.awaitingAIQuestion) {
    return;
  }

  const question = ctx.message.text;
  const user = ctx.from;

  try {
    // Log AI question
    await logUserAction(user.id, user.username, 'ai_question', { question });

    // Send typing indicator
    await ctx.replyWithChatAction("typing");

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
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
Длина ответа - до 500 символов.`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 
                    "Извините, не смог обработать ваш вопрос. Попробуйте переформулировать.";

    await ctx.reply(
      `🤖 ${response}\n\n` +
      `❓ Есть еще вопросы? Просто напишите их.\n` +
      `🛍 Чтобы открыть магазин, используйте /shop`
    );

    // Log AI response
    await logUserAction(user.id, user.username, 'ai_response', { 
      question, 
      response: response.substring(0, 100) + '...' 
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

  try {
    // Get user count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get order count
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get recent actions
    const { data: recentActions } = await supabase
      .from('logs')
      .select('action_type, timestamp')
      .order('timestamp', { ascending: false })
      .limit(10);

    const actionSummary = recentActions?.reduce((acc, action) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {});

    await ctx.reply(
      `📊 Статистика JUV:\n\n` +
      `👥 Пользователей: ${userCount || 0}\n` +
      `🛒 Заказов: ${orderCount || 0}\n\n` +
      `📈 Последние действия:\n` +
      Object.entries(actionSummary || {})
        .map(([action, count]) => `• ${action}: ${count}`)
        .join('\n')
    );
  } catch (error) {
    console.error('Error getting stats:', error);
    await ctx.reply("Ошибка при получении статистики.");
  }
});

// Start bot
bot.start().then(() => {
  console.log('🚀 JUV Telegram Bot is running!');
  console.log(`📱 Bot username: @${bot.botInfo.username}`);
  console.log(`🌐 WebApp URL: ${WEBAPP_URL}`);
}).catch(console.error); 