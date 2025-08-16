const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// OpenAI model selection
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5';

function resolveModelName(requested) {
  const model = (requested || '').toLowerCase();
  // Temporary fallback if experimental model is not available
  if (model.startsWith('gpt-5')) return 'gpt-4o';
  return model || 'gpt-4o';
}

// OpenAI integration
async function callOpenAI(question) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return 'AI временно недоступен. Пожалуйста, попробуйте позже.';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: resolveModelName(OPENAI_MODEL),
        messages: [
          {
            role: 'system',
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
            role: 'user',
            content: question
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      // Retry once with stable fallback
      const retry = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'Вы — эксперт по ювелирным изделиям JUV. Отвечайте до 500 символов.' },
            { role: 'user', content: question }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });
      const retryData = await retry.json();
      return retryData.choices?.[0]?.message?.content || 'Извините, не смог обработать ваш вопрос.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Извините, не смог обработать ваш вопрос.';
  } catch (error) {
    console.error('OpenAI Error:', error);
    return 'Извините, произошла ошибка при обработке вашего вопроса.';
  }
}

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
async function ensureUser(telegramId, username) {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (!existingUser) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          telegram_username: username
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

// Helper to get bot token with fallback
function getBotToken() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error('❌ BOT_TOKEN is not set in environment');
    throw new Error('BOT_TOKEN is not configured');
  }
  return token;
}

// Send message to Telegram
async function sendMessage(chatId, text, replyMarkup = null) {
  const botToken = getBotToken();
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  console.log('📤 Sending message:', { chatId, text: text.substring(0, 50) + '...', replyMarkup: !!replyMarkup });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('📤 Message result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return null;
  }
}

// Main webhook handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log('🔍 Webhook received:', JSON.stringify(update, null, 2));
    
    if (!update.message && !update.callback_query) {
      console.log('🔍 No message or callback_query found');
      return res.status(200).json({ ok: true });
    }

    // Handle text messages and commands
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const userId = message.from.id;
      const username = message.from.username;
      const text = message.text;

      // Normalize and extract command
      const rawText = typeof text === 'string' ? text.trim() : '';
      const commandEntity = Array.isArray(message.entities)
        ? message.entities.find((e) => e.type === 'bot_command' && e.offset === 0)
        : null;
      const commandText = commandEntity
        ? rawText.slice(0, commandEntity.length)
        : rawText.split(' ')[0];
      const command = (commandText || '').split('@')[0].toLowerCase();

      // Ensure user exists
      await ensureUser(userId, username);

      // Handle commands
      if (command === '/start') {
        await logUserAction(userId, username, 'start_bot');
        
        const firstName = message.from.first_name || 'Друг';

        await sendMessage(
          chatId,
          `✨ Добро пожаловать в JUV, ${firstName}!\n\n` +
          `Мы создаем изысканные ювелирные украшения, которые подчеркивают вашу индивидуальность.\n\n` +
          `Используйте кнопку "Меню" в левом нижнем углу для навигации.`
        );
      }
      else if (command === '/shop') {
        await logUserAction(userId, username, 'open_webapp');
        
        const shopMenu = {
          inline_keyboard: [
            [
              {
                text: 'Открыть магазин',
                web_app: { url: 'https://juv-app.vercel.app/' }
              }
            ]
          ]
        };

        await sendMessage(
          chatId,
          '🛍 Добро пожаловать в магазин JUV!\n\nОткройте наш каталог украшений:',
          shopMenu
        );
      }
      else if (command === '/assistant') {
        await logUserAction(userId, username, 'call_support');
        
        await sendMessage(
          chatId,
          '🤖 AI-помощник JUV активирован!\n\n' +
          'Я эксперт по ювелирным изделиям. Задайте ваш вопрос:'
        );
      }
      else if (command === '/menu') {
        await logUserAction(userId, username, 'open_menu');
        
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
                text: '🧾 Заказы',
                callback_data: 'orders'
              }
            ],
            [
              {
                text: '🤖 AI-помощник',
                callback_data: 'ai_assistant'
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

        // Добавить кнопку статистики только для админа
        const adminId = process.env.ADMIN_ID || '195830791';
        if (userId.toString() === adminId) {
          menuKeyboard.inline_keyboard.splice(2, 0, [
            {
              text: '📊 Статистика',
              callback_data: 'stats'
            }
          ]);
        }

        await sendMessage(
          chatId,
          '📋 **Меню JUV**\n\n' +
          'Доступные действия:',
          menuKeyboard
        );
      }
      else if (command === '/help') {
        await sendMessage(
          chatId,
          '📋 Доступные команды:\n\n' +
          '🛍 Открыть магазин (/shop) — открыть каталог украшений JUV\n' +
          '🤖 AI-помощник (/assistant) — задать вопросы об изделиях, размерах, материалах\n' +
          '📋 Меню (/menu) — показать клавиатуру действий\n' +
          '🛑 Стоп (/stop) — остановить диалог с AI\n\n' +
          'Используйте кнопки меню для удобной навигации!'
        );
      }
      else if (command === '/stats') {
        const adminId = process.env.ADMIN_ID || '195830791';
        if (userId.toString() === adminId) {
          // Admin stats
          try {
            const { count: userCount } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true });

            const { count: orderCount } = await supabase
              .from('orders')
              .select('*', { count: 'exact', head: true });

            await sendMessage(
              chatId,
              `📊 Статистика JUV:\n\n` +
              `👥 Пользователей: ${userCount || 0}\n` +
              `🛒 Заказов: ${orderCount || 0}`
            );
          } catch (error) {
            await sendMessage(chatId, 'Ошибка при получении статистики.');
          }
        } else {
          await sendMessage(chatId, '❌ Статистика доступна только администратору.');
        }
      }
      else if (rawText && !rawText.startsWith('/')) {
        // AI Assistant response
        await logUserAction(userId, username, 'ai_question', { question: rawText });
        
        const aiResponse = await callOpenAI(rawText);
        
        await sendMessage(
          chatId,
          `🤖 ${aiResponse}\n\n` +
          `❓ Есть еще вопросы? Просто напишите их.\n` +
          `🛍 Чтобы открыть магазин, используйте /menu\n` +
          `🛑 Остановить диалог с AI-помощником /stop`
        );

        await logUserAction(userId, username, 'ai_response', { 
          question: rawText, 
          response: aiResponse.substring(0, 100) + '...' 
        });
      }
    }

    // Handle callback queries (button presses)
    if (update.callback_query) {
      console.log('🔍 Callback query received:', update.callback_query);
      
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const userId = callbackQuery.from.id;
      const username = callbackQuery.from.username;
      const data = callbackQuery.data;
      
      console.log('🔍 Processing callback:', { chatId, userId, username, data });

      if (data === 'help_assistant' || data === 'ai_assistant') {
        await logUserAction(userId, username, 'call_support');
        
        await sendMessage(
          chatId,
          '🤖 **AI-помощник JUV активирован!**\n\n' +
          'Я эксперт по ювелирным изделиям и готов помочь вам с:\n\n' +
          '💎 Выбором украшений\n' +
          '📏 Подбором размера\n' +
          '🔍 Информацией о камнях и металлах\n' +
          '✨ Уходом за украшениями\n' +
          '💰 Ценовыми консультациями\n\n' +
          'Задайте ваш вопрос:'
        );
      }
      else if (data === 'orders') {
        // Fetch user orders from Supabase
        try {
          const { data: orders, error } = await supabase
            .from('orders')
            .select('id, items, status, created_at')
            .eq('telegram_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) throw error;

          if (!orders || orders.length === 0) {
            await sendMessage(chatId, '🧾 У вас пока нет заказов.');
          } else {
            const statusMap = {
              new: 'заказ создан',
              pending: 'заказ создан',
              processing: 'в обработке',
              completed: 'завершен'
            };

            const lines = orders.map((o) => {
              const shortId = (o.id || '').toString().slice(0, 8);
              const items = Array.isArray(o.items) ? o.items : [];
              const itemsText = items
                .map((it) => `${it.title || 'Товар'}${it.sku ? ` (${it.sku})` : ''}`)
                .join(', ');
              const statusText = statusMap[o.status] || o.status || 'заказ создан';
              return `№ ${shortId}\n${itemsText || 'без позиций'}\nСтатус: ${statusText}`;
            });

            await sendMessage(chatId, `🧾 Ваши заказы:\n\n${lines.join('\n\n')}`);
          }
        } catch (e) {
          console.error('Orders fetch error:', e);
          await sendMessage(chatId, 'Не удалось получить список заказов. Попробуйте позже.');
        }
      }
      else if (data === 'stats') {
        console.log('📊 Stats button pressed by user:', userId);
        const adminId = process.env.ADMIN_ID || '195830791';
        console.log('📊 Admin ID:', adminId, 'User ID:', userId.toString());
        
        if (userId.toString() === adminId) {
          try {
            // Получаем количество пользователей
            const usersResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=*`,
              {
                headers: {
                  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            const users = usersResponse.ok ? await usersResponse.json() : [];
            
            // Получаем количество заказов
            const ordersResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?select=*`,
              {
                headers: {
                  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            const orders = ordersResponse.ok ? await ordersResponse.json() : [];
            
            // Получаем количество логов за последний день
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const logsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/logs?select=*&created_at=gte.${yesterday.toISOString()}`,
              {
                headers: {
                  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            const logs = logsResponse.ok ? await logsResponse.json() : [];

            await sendMessage(
              chatId,
              `📊 **Статистика JUV:**\n\n` +
              `👥 Пользователей: ${users.length || 0}\n` +
              `🛒 Заказов: ${orders.length || 0}\n` +
              `📋 Активность (24ч): ${logs.length || 0}\n\n` +
              `🔄 Обновлено: ${new Date().toLocaleString('ru-RU')}`
            );
          } catch (error) {
            console.error('Stats error:', error);
            await sendMessage(
              chatId, 
              `❌ Ошибка при получении статистики.\n\n` +
              `Debug: Admin ID: ${adminId}, User ID: ${userId}`
            );
          }
        } else {
          await sendMessage(chatId, '❌ Статистика доступна только администратору.');
        }
      }
      else if (data === 'info') {
        await sendMessage(
          chatId,
          '📋 **Справка JUV**\n\n' +
          '**Кнопки меню:**\n' +
          '🛍 **Магазин** - открывает каталог украшений\n' +
          '🤖 **Помощь** - чат с AI-консультантом\n' +
          '❓ **Справка** - эта информация\n\n' +
          '**О компании:**\n\n' +
          '✨ JUV — маленькая семейная ювелирная мастерская, в которой каждый камень, каждый изгиб и каждая деталь создаются с душой.\n\n' +
          'Мы воплощаем в украшениях не тренды, а истории — ваши и наши.\n\n' +
          '💍 Украшения на заказ\n' +
          '🛠 Ручная работа\n' +
          '💌 Индивидуальный подход'
        );
      }

      // Answer callback query
      await fetch(`https://api.telegram.org/bot${getBotToken()}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id })
      });
    }

    // Handle WebApp data
    if (update.message?.web_app_data) {
      console.log('📱 WebApp data received:', update.message.web_app_data);
      
      try {
        const data = JSON.parse(update.message.web_app_data.data);
        const chatId = update.message.chat.id;
        const userId = update.message.from.id;
        const username = update.message.from.username;
        
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
                  text: '🧾 Заказы',
                  callback_data: 'orders'
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
          if (userId.toString() === adminId) {
            menuKeyboard.inline_keyboard.splice(2, 0, [
              {
                text: '📊 Статистика',
                callback_data: 'stats'
              }
            ]);
          }

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

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}