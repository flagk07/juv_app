require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Проверка данных в Supabase...\n');
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcvylzkgjxiytyrqiece.supabase.co';
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdnlsemtnanhpeXR5cnFpZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzgxNzAsImV4cCI6MjA2ODYxNDE3MH0.c89mXFxEr3FY7XFRjRTHus8w9M-V76pOBVnn7XT7jaM';
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('❌ Не найдены переменные Supabase в .env файле');
    console.log('Проверьте данные в Vercel Dashboard или создайте .env файл\n');
    
    console.log('📋 Для проверки в Supabase Dashboard:');
    console.log('1. Откройте: https://supabase.com/dashboard');
    console.log('2. Выберите ваш проект');
    console.log('3. Table Editor → выберите таблицу (users, logs, orders)');
    return;
  }
  
  try {
    // Проверим таблицы напрямую через API
    console.log('📊 Проверяем таблицу users...');
    const usersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=*&order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log(`✅ Найдено пользователей: ${users.length}`);
      users.forEach((user, i) => {
        console.log(`${i+1}. ID: ${user.telegram_id}, Username: @${user.telegram_username || 'нет'}`);
      });
    } else {
      console.log('❌ Ошибка при получении пользователей');
    }
    
    console.log('\n📋 Проверяем таблицу logs...');
    const logsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/logs?select=*&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (logsResponse.ok) {
      const logs = await logsResponse.json();
      console.log(`✅ Найдено записей в логах: ${logs.length}`);
      logs.forEach((log, i) => {
        console.log(`${i+1}. ${log.action_type} - @${log.telegram_username || 'нет'} - ${new Date(log.created_at).toLocaleString()}`);
      });
    } else {
      console.log('❌ Ошибка при получении логов');
    }
    
    console.log('\n🛒 Проверяем таблицу orders...');
    const ordersResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      console.log(`✅ Найдено заказов: ${orders.length}`);
      orders.forEach((order, i) => {
        console.log(`${i+1}. Заказ #${order.id} - ${order.total}₽ - ${new Date(order.created_at).toLocaleString()}`);
      });
    } else {
      console.log('❌ Ошибка при получении заказов');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error.message);
  }
  
  console.log('\n💡 Для более детальной проверки используйте Supabase Dashboard');
}

// Запустить если вызван напрямую
if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase }; 