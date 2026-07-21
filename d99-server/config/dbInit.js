
import sequelize from './db.js';

// Admin Models
import Role from '../model/admin/Role.js';
import Staff from '../model/admin/Staff.js';
import Wallet from '../model/admin/Wallet.js';
import Transaction from '../model/admin/Transaction.js';
import PlatformGames from '../model/admin/PlatformGames.js';
import GamesMarkets from '../model/admin/GamesMarkets.js';
import StaffSportsLock from '../model/admin/StaffSportsLock.js';
import UserSportsLock from '../model/admin/UserSportsLock.js';
import Affiliate from '../model/admin/Affiliate.js';
import Agent from '../model/admin/Agent.js';
import Bank from '../model/admin/Bank.js';
import BetLock from '../model/admin/BetLock.js';
import DailyProfitLoss from '../model/admin/DailyProfitLoss.js';
import Deposit from '../model/admin/Deposit.js';
import Owner from '../model/admin/Owner.js';
import TokenBlacklistAdmin from '../model/admin/TokenBlacklist.js';
import UserMatchLocks from '../model/admin/UserMatchLocks.js';
import UserEventMarketLocks from '../model/admin/UserEventMarketLocks.js';
import Withdrawal from '../model/admin/Withdrawal.js';
import UserActivityLog from '../model/admin/UserActivityLog.js';
import TableCasino from '../model/admin/TableCasino.js';
import StaffTableLock from '../model/admin/StaffTableLock.js';
import UserTableLock from '../model/admin/UserTableLock.js';

// User Models
import User from '../model/user/User.js';
import SportsBet from '../model/user/SportsBet.js';
import DeactivatedMatch from '../model/user/DeactivatedMatch.js';
import CreditsLedger from '../model/user/CreditsLedger.js';
import Exposure from '../model/user/Exposure.js';
import FanWin from '../model/user/FanWin.js';
import JSGameSession from '../model/user/JSGameSession.js';
import MarketWin from '../model/user/MarketWin.js';
import Match from '../model/user/Match.js';
import SportsBetResultCache from '../model/user/SportsBetResultCache.js';
import SportsConfig from '../model/user/SportsConfig.js';
import SportsEventResultScan from '../model/user/SportsEventResultScan.js';
import SportsEventResultSummary from '../model/user/SportsEventResultSummary.js';
import SportsEventSettlementJobs from '../model/user/SportsEventSettlementJobs.js';
import SportsSettlementReport from '../model/user/SportsSettlementReport.js';
import TokenBlacklistUser from '../model/user/TokenBlacklist.js';
import Tokens from '../model/user/Tokens.js';
import TotalCredit from '../model/user/TotalCredit.js';
import TotalExposure from '../model/user/TotalExposure.js';
import UserExposure from '../model/user/UserExposure.js';
import UserTransaction from '../model/user/user_transaction.js';

// Root Models
import GameSession from '../model/GameSession.js';
import SiteConfig from '../model/SiteConfig.js';
import SportsResult from '../model/SportsResult.js';

// JSGames DB Init (syncs tables + seeds data)
import { initializeJSGames } from '../jsgames/db/dbinit.js';

// ======================
// Auto-Insert Fixed Platform Games
// ======================
const insertFixedPlatformGames = async () => {
  try {
    for (const { id, name, sport_id } of PlatformGames.FIXED_GAMES) {
      const [game] = await PlatformGames.findOrCreate({
        where: { id },
        defaults: { id, name, sport_id },
      });

      // No need to create default markets in new structure (empty = unlocked)
      // But we keep this if legacy support is needed or for GamesMarkets table
      if (sport_id) {
        await GamesMarkets.findOrCreate({
          where: { game_id: sport_id },
          defaults: { game_id: sport_id },
        });
      }
    }
    console.log('Fixed platform games & markets inserted/verified.');
  } catch (error) {
    console.error('Failed to insert fixed platform games:', error.message);
  }
};

// ======================
// Auto-Insert Table Casino Games
// ======================
const insertTableCasinoGames = async () => {
  console.log('Syncing Table Casino games...');
  await TableCasino.syncFixedData();
};

// ==============================================
// Sync Wallet for profit and loss fields
// ==============================================
async function syncExistingWallets() {
  try {
    const wallets = await Wallet.findAll();
    for (const wallet of wallets) {
      const cashReceived = parseFloat(wallet.cash_received) || 0;
      const inrBalance = parseFloat(wallet.inr_balance) || 0;
      const profitLoss = parseFloat((inrBalance - cashReceived).toFixed(2));
      const verdict = profitLoss >= 0 ? 'profit' : 'loss';
      await wallet.update({
        profit_loss: profitLoss,
        verdict: verdict,
      });
      console.log(
        `Updated wallet_id: ${wallet.wallet_id}, profit_loss: ${profitLoss}, verdict: ${verdict}`
      );
    }
    console.log('All wallets synced successfully!');
  } catch (error) {
    console.error('Error syncing wallets:', error);
  }
}

// ==============================================
// Roles to Seed
// ==============================================
const rolesToSeed = [
  { role: 'OWNER', level: 'L0', power: ['*'], max_downline_percentage: 100, is_owner: true },
  {
    role: 'COMPANY',
    level: 'L1',
    power: ['manage_company', 'create_superadmin'],
    max_downline_percentage: 100,
    is_company: true
  },
  {
    role: 'SUPERADMIN',
    level: 'L2',
    power: ['manage_staff', 'view_reports', 'manage_wallets'],
    max_downline_percentage: 100,
  },
  {
    role: 'ADMIN',
    level: 'L3',
    power: ['create_master', 'view_downline'],
    max_downline_percentage: 100,
  },
  {
    role: 'SUPERMASTER',
    level: 'L4',
    power: ['create_agent'],
    max_downline_percentage: 100,
  },
  {
    role: 'MASTER',
    level: 'L5',
    power: ['create_user'],
    max_downline_percentage: 100,
  },
  {
    role: 'USER',
    level: 'L7',
    power: ['play_games'],
    max_downline_percentage: 100,
  },
];

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database.');

    // ✅ Step 1: Core Dependencies (Role -> Staff -> User)
    // await Role.sync({ alter: true });
    // await Staff.sync({ alter: true });
    // await User.sync({ alter: true });
    // console.log('✅ Core models (Role, Staff, User) synced');

    //     // ✅ Step 2: Financials & Transactions
    //     await Wallet.sync({ alter: true });
    //     await Transaction.sync({ alter: true });
    //     await Bank.sync({ alter: true });
    //     await Deposit.sync({ alter: true });
    //     await Withdrawal.sync({ alter: true });
    //     await CreditsLedger.sync({ alter: true });
    //     await UserTransaction.sync({ alter: true });
    //     console.log('✅ Financial models synced');

    //     // ✅ Step 3: Game Configuration & Platform
    //     await PlatformGames.sync({ alter: true });
    //     await GamesMarkets.sync({ alter: true });
    //     await SiteConfig.sync({ alter: true });
    //     await SportsConfig.sync({ alter: true });
    //     console.log('✅ Game config models synced');

    //     // ✅ Step 4: Betting & Gameplay
    //     await SportsBet.sync({ alter: true });
    //     await GameSession.sync({ alter: true });
    //     await JSGameSession.sync({ alter: true });
    //     await Match.sync({ alter: true });
    //     await DeactivatedMatch.sync({ alter: true });
    //     console.log('✅ Betting & Gameplay models synced');

    //     // ✅ Step 5: Admin & Risk Management
    //     await Affiliate.sync({ alter: true });
    //     await Agent.sync({ alter: true });
    //     await Owner.sync({ alter: true });
    //     await StaffSportsLock.sync({ alter: true });
    // await UserSportsLock.sync({ alter: true });
    //     await UserMatchLocks.sync({ alter: true });
    //     await BetLock.sync({ alter: true });
    //     await TokenBlacklistAdmin.sync({ alter: true });
    //     await TokenBlacklistUser.sync({ alter: true });
    //     await UserActivityLog.sync({ alter: true });
    //     await TableCasino.sync({ alter: true });
    //     await StaffTableLock.sync({ alter: true });
    //     await UserTableLock.sync({ alter: true });
    //     console.log('✅ Admin & Risk Management models synced');

    //     // ✅ Step 6: Reporting & Analytics
    //     await DailyProfitLoss.sync({ alter: true });
    //     await Exposure.sync({ alter: true });
    //     await FanWin.sync({ alter: true });
    //     await MarketWin.sync({ alter: true });
    //     await SportsResult.sync({ alter: true });
    //     await SportsBetResultCache.sync({ alter: true });
    //     await SportsEventResultScan.sync({ alter: true });
    //     await SportsEventResultSummary.sync({ alter: true });
    //     await SportsEventSettlementJobs.sync({ alter: true });
    //     await SportsSettlementReport.sync({ alter: true });
    //     await Tokens.sync({ alter: true });
    //     await TotalCredit.sync({ alter: true });
    //     await TotalExposure.sync({ alter: true });
    //     await UserExposure.sync({ alter: true });
    //     console.log('✅ Reporting & Analytics models synced');

    // ✅ Step 7: Final Catch-all Sync (for any missed associations)
    await sequelize.sync({ alter: true });
    console.log('✅ All remaining Sequelize models synced');

    // ✅ Step 7: Seed roles
    await Role.bulkCreate(rolesToSeed, {
      ignoreDuplicates: true,
      validate: true,
    });
    console.log('✅ Roles seeded successfully');

    // ✅ Step 8: Sync existing wallets (Optional, can be commented out if not needed every time)
    // await syncExistingWallets();

    // ✅ Step 9: Insert fixed games and markets
    await insertFixedPlatformGames();

    // ✅ Step 10: Insert Table Casino games
    await insertTableCasinoGames();

    // ✅ Step 11: Sync JSGames/JSGamesV2 tables & seed data
    await initializeJSGames();

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};
