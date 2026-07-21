


import cron from 'node-cron';
import Wallet from '../model/admin/Wallet.js';
import DailyProfitLoss from '../model/admin/DailyProfitLoss.js';
import sequelize from '../config/db.js';

// Run every day at 3:20 PM
cron.schedule('20 15 * * *', async () => {
  //  cron.schedule('*/2 * * * * *', async () => { // for testing run at every 2 sec
  console.log('Starting daily P&L snapshot at 3:20 PM...');

  const t = await sequelize.transaction();

  try {
    // Step 1: Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

    // Step 2: Fetch all wallets
    const wallets = await Wallet.findAll({
      attributes: ['wallet_id', 'user_type', 'username', 'profit_loss'],
      transaction: t,
    });

    if (wallets.length === 0) {
      await t.commit();
      console.log('No wallets found.');
      return;
    }

    // Step 3: Prepare data for upsert
    const records = wallets.map(wallet => {
      const pl = parseFloat(wallet.profit_loss) || 0;
      return {
        date: dateStr,
        profit_loss: pl,
        verdict: pl >= 0 ? 'profit' : 'loss',
        wallet_id: wallet.wallet_id,
        user_type: wallet.user_type,
        username: wallet.username,
        // createdat & updatedat are auto-managed by timestamps: true
      };
    });

    // Step 4: Use bulkCreate with updateOnDuplicate (PostgreSQL)
    await DailyProfitLoss.bulkCreate(records, {
      updateOnDuplicate: ['profit_loss', 'verdict', 'updatedat'], // Update these fields
      transaction: t,
      // No need to specify createdat/updatedat — handled by DB
    });

    await t.commit();
    console.log(`Daily P&L saved for ${records.length} users on ${dateStr}`);
  } catch (error) {
    await t.rollback();
    console.error('Daily P&L job failed:', error.message);
  }
});

console.log('Daily P&L job scheduled for 3:20 PM every day (Sequelize ORM)');