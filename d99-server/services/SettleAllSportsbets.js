import cron from 'node-cron';
import { settleMatchBets } from './SettleMatchbets.js';
import Match from '../model/user/Match.js';
import sequelize from '../config/db.js';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('🕐 Running hourly match settlement...');
  try {
    // Fetch all active matches
    const activeMatches = await Match.findAll({ where: { status: 'active' } });
    for (const match of activeMatches) {
      // You may need to fetch sid, event_name, market_id, market_name from elsewhere or store them in the match table
      // For now, assume they are available as properties on the match object
      const { match_id, sid, event_name, market_id, market_name } = match;
      try {
        const result = await settleMatchBets(match_id, sid, event_name, market_id, market_name);
        console.log(`✅ Settled match: ${match_id}`, result);
      } catch (err) {
        console.error(`❌ Error settling match ${match_id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Error in hourly settlement cron:', err.message);
  }
});
