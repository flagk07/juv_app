require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = 'https://juv-app.vercel.app/api/webhook';

async function setupWebhook() {
  console.log('🚀 Настройка Telegram webhook...');
  
  try {
    // Set webhook
    const setWebhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
    
    const response = await fetch(setWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook успешно настроен!');
      console.log(`📡 URL: ${WEBHOOK_URL}`);
    } else {
      console.error('❌ Ошибка настройки webhook:', result);
    }

    // Get webhook info
    const getWebhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    const infoResponse = await fetch(getWebhookUrl);
    const webhookInfo = await infoResponse.json();
    
    console.log('\n📋 Информация о webhook:');
    console.log(webhookInfo.result);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Execute if called directly
if (require.main === module) {
  setupWebhook();
}

module.exports = { setupWebhook }; 