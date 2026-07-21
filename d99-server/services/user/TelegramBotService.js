
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

let bot = null;

if (process.env.TELEGRAM_BOT_TOKEN) {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    // Don't launch here, we just use it for sending messages or the bot script will handle polling
    // Actually, if we want to send messages from the main server, we just need the instance.
}

const TelegramBotService = {
    sendMessage: async (chatId, text) => {
        if (!bot) {
            console.warn('⚠️ Telegram Bot Token not set, cannot send message.');
            return;
        }
        try {
            await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (error) {
            console.error('❌ Telegram Send Message Error:', error.message);
        }
    }
};

export default TelegramBotService;
