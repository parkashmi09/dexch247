// services/BetService.js
import sequelize from '../config/db.js';
import SportsBet from '../model/user/SportsBet.js';
import WalletService from './WalletService.js';
import Exposure from '../model/user/Exposure.js';
import TotalExposure from '../model/user/TotalExposure.js';
import UserTransaction from '../model/user/UserTransaction.js';
import { emitBalanceUpdate } from '../utils/socketUtils.js';

const BetService = {
  placeBet: async (betData, loggedInUser) => {
    const t = await sequelize.transaction();
    try {
      const {
        user_id,
        sports,
        event_name,
        market_name,
        market_type,
        nation,
        user_rate,
        amount,
        event_id,
        market_id,
        sid,
        bet_type,
        odds_from_api,  // pass from frontend/api check
        market_status   // pass from frontend/api check
      } = betData;

      // 1. Market Validation
      if (market_status !== 'OPEN') {
        throw new Error('Market is not open for betting');
      }

      // 2. Odds Validation
      const allowedDiff = 0.05; // 5% difference tolerance
      const diff = Math.abs((user_rate - odds_from_api) / odds_from_api);
      if (diff > allowedDiff) {
        throw new Error('Odds changed, please refresh');
      }

      // 3. Balance Check & Debit (atomic)
      await WalletService.debitBalance(
        user_id,
        amount,
        'USDT',
        'User',
        t,
        loggedInUser.username
      );

      // 4. Save Bet
      const bet = await SportsBet.create(
        {
          sports,
          event_name,
          market_name,
          market_type,
          nation,
          user_rate,
          amount,
          place_date: new Date().toISOString(),
          event_id,
          market_id,
          sid,
          bet_type,
          user_id,
          settlened: 'pending',
        },
        { transaction: t }
      );

      // 5. Exposure Update
      let exposure = await Exposure.findOne({
        where: { user_id, match_id: event_id },
        transaction: t,
      });

      if (!exposure) {
        exposure = await Exposure.create(
          {
            user_id,
            match_id: event_id,
            match_exposure: 0,
            profit_if_win: 0,
            loss_if_lose: 0,
          },
          { transaction: t }
        );
      }

      // Example exposure update (adjust logic to your calculation)
      if (bet_type === 'back') {
        exposure.match_exposure += parseFloat(amount);
        exposure.profit_if_win += (parseFloat(user_rate) - 1) * parseFloat(amount);
        exposure.loss_if_lose -= parseFloat(amount);
      } else {
        exposure.match_exposure += parseFloat(amount);
        exposure.profit_if_win -= (parseFloat(user_rate) - 1) * parseFloat(amount);
        exposure.loss_if_lose += parseFloat(amount);
      }

      await exposure.save({ transaction: t });

      // 6. Total Exposure Update
      let totalExp = await TotalExposure.findOne({
        where: { user_id },
        transaction: t,
      });

      if (!totalExp) {
        totalExp = await TotalExposure.create(
          { user_id, total_exposure: exposure.match_exposure },
          { transaction: t }
        );
      } else {
        totalExp.total_exposure = exposure.match_exposure;
        await totalExp.save({ transaction: t });
      }

      // 7. Ledger (UserTransaction entry)
      await UserTransaction.create(
        {
          user_id,
          transaction_type: 'debit',
          pts: amount,
          remark: `Bet placed on ${market_name} - ${nation}`,
          action_by: loggedInUser.user_id,
        },
        { transaction: t }
      );

      // 8. Emit Balance Update
      const balance = await WalletService.getBalance(user_id, 'User');
      emitBalanceUpdate(user_id, {
        balance: balance.balance,
        exposure: totalExp.total_exposure,
      });

      await t.commit();
      return { success: true, bet, balance };
    } catch (error) {
      await t.rollback();
      console.error('Error placing bet:', error);
      throw error;
    }
  },
};

export default BetService;
