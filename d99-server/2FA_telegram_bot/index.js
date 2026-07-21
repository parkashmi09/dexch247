
import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Adjust path if needed

const startBot = () => {
  try {
    // Access env vars lazily to ensure dotenv has loaded them
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const PROJECT_BASE_URL = process.env.PROJECT_BASE_URL || 'http://localhost:9299';

    console.log('🤖 Initializing Telegram Bot...');

    if (!BOT_TOKEN) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN is missing in .env. Bot will not start.');
      return;
    }

    const bot = new Telegraf(BOT_TOKEN);

    // Debug middleware to log every update
    bot.use((ctx, next) => {
        console.log(`📩 [Bot Debug] Update received: ${ctx.updateType}`);
        if (ctx.message) console.log(`📩 [Bot Debug] Message text: ${ctx.message.text}`);
        return next();
    });

    bot.start(async (ctx) => {
      const args = ctx.message.text.split(' ');
      console.log('📩 Bot received command:', ctx.message.text);
      if (args.length > 1) {
        // Support /start <code> as legacy/fallback
        const code = args[1];
        await verifyLink(ctx, code, PROJECT_BASE_URL);
      } else {
        await ctx.reply('Hey! You are 1 step away from 2-Step Verification.\nNow please proceed for further step:\n/connect your_id\nto enable it for your account.');
      }
    });

    bot.command('connect', async (ctx) => {
        const args = ctx.message.text.split(' ');
        console.log('📩 Bot received command:', ctx.message.text);
        if (args.length > 1) {
            const code = args[1];
            await verifyLink(ctx, code, PROJECT_BASE_URL);
        } else {
            await ctx.reply('⚠️ Please provide your code.\nUsage: /connect <your_code>');
        }
    });

    // Clear any existing webhook to ensure polling works
    bot.telegram.deleteWebhook().then(() => {
        console.log('🧹 Previous webhook deleted');
        return bot.launch();
    }).then(() => {
        console.log('🤖 Telegram Bot is running...');
    }).catch(err => {
        console.error('⚠️ Telegram Bot failed to start (likely invalid token). Server will continue running.');
        console.error(`❌ Bot Error: ${err.message}`);
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    console.error('⚠️ Unexpected error in Telegram Bot setup. Server continuing.');
    console.error(error);
  }
};

async function verifyLink(ctx, code, PROJECT_BASE_URL) {
  try {
    const telegramId = ctx.from.id;
    const username = ctx.from.username || '';

    const res = await fetch(`${PROJECT_BASE_URL}/api/2fa/telegram/webhook/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        telegramId,
        username
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Success handled by server response usually, but we can ack
    } else {
      await ctx.reply(`❌ Link Failed: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Link Error:', error);
    await ctx.reply('❌ Server Error. Please try again later.');
  }
}

export default startBot;