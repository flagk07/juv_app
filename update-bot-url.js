// Скрипт для обновления URL WebApp в боте после деплоя на Vercel
require('dotenv').config();

const VERCEL_URL = 'https://ваш-домен.vercel.app'; // Замените на ваш URL от Vercel

console.log('🔄 Обновление конфигурации бота...');
console.log(`📱 WebApp URL: ${VERCEL_URL}`);

// Обновите переменную окружения
process.env.WEBAPP_URL = VERCEL_URL;

console.log('✅ Конфигурация обновлена!');
console.log('📋 Следующие шаги:');
console.log('1. Обновите WEBAPP_URL в .env файле');
console.log('2. Перезапустите Telegram бота');
console.log('3. Протестируйте WebApp в Telegram');

// Инструкции для BotFather
console.log('\n🤖 Настройка в BotFather:');
console.log('1. Откройте @BotFather в Telegram');
console.log('2. Выберите команду /mybots');
console.log('3. Выберите @juv_app_bot');
console.log('4. Bot Settings → Menu Button → Configure Menu Button');
console.log(`5. Введите URL: ${VERCEL_URL}`);
console.log('6. Введите текст кнопки: "Открыть магазин"'); 