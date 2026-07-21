// import sequelize from '../config/db.js';
// import ExposureModel from '../model/user/Exposure.js';
// import Wallet from '../model/admin/Wallet.js';
// import SportsBet from '../model/user/sports_bet.js';
// import MatchModel from '../model/user/Match.js';
// import CricketService from './CricketService.js';
// import { emitBalanceUpdate } from '../utils/socketUtils.js';
// import { updateUserTotalExposureAfterBet } from './ExposureService.js';

// const Exposure = ExposureModel(sequelize);
// const Match = MatchModel(sequelize);

// async function settleMatchBets(matchId, sid, event_name, market_id, market_name) {
//   const t = await sequelize.transaction();
//   try {
//     // Fetch all exposures for this match
//     const exposures = await Exposure.findAll({ where: { match_id: matchId }, transaction: t });
//     // Get match result from CricketService
//     const result = await CricketService.GetResult(sid, matchId, event_name, market_id, market_name);
//     // For summary
//     const settlements = [];
//     for (const exposure of exposures) {
//       const { user_id, profit_if_win } = exposure;
//       // Fetch user wallet
//       const wallet = await Wallet.findOne({ where: { user_id, user_type: 'User' }, transaction: t, lock: t.LOCK.UPDATE });
//       // Credit profit if any
//       if (profit_if_win > 0) {
//         wallet.inr_balance = parseFloat(wallet.inr_balance) + parseFloat(profit_if_win);
//         await wallet.save({ transaction: t });
        
//         // Update total exposure after settlement
//         const total_exposure = await updateUserTotalExposureAfterBet(user_id, t);
        
//         // Emit real-time balance update after credit
//         emitBalanceUpdate(user_id, {
//           inr_balance: wallet.inr_balance,
//           exposure: total_exposure // Send total_exposure as exposure
//         });
//       }
//       // Settle all bets for this user and match
//       await SportsBet.update(
//         { settlened: 'true', status: 'settled' },
//         { where: { user_id, event_id: matchId }, transaction: t }
//       );
//       // Remove exposure entry
//       await Exposure.destroy({ where: { user_id, match_id: matchId }, transaction: t });
//       settlements.push({ user_id, profit: profit_if_win });
//     }
//     // Update match status
//     await Match.update(
//       { status: 'settled' },
//       { where: { match_id: matchId }, transaction: t }
//     );
//     await t.commit();
//     return { success: true, settlements, result };
//   } catch (error) {
//     await t.rollback();
//     throw error;
//   }
// }

// export { settleMatchBets };
  