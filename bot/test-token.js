require('dotenv').config();

console.log('🔧 Testing token...');
console.log('BOT_TOKEN:', process.env.BOT_TOKEN);
console.log('BOT_TOKEN length:', process.env.BOT_TOKEN ? process.env.BOT_TOKEN.length : 0);

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is not set!');
  process.exit(1);
}

const { Bot } = require('grammy');

try {
  console.log('🤖 Creating bot instance...');
  const bot = new Bot(process.env.BOT_TOKEN);
  console.log('✅ Bot created successfully!');
  
  // Test the bot
  bot.api.getMe().then((me) => {
    console.log('✅ Bot info:', me);
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error getting bot info:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Error creating bot:', error);
  process.exit(1);
} 