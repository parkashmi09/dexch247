// // services/SettlementService.js
// import sequelize from '../config/db.js';
// import SportsBet from '../model/user/SportsBet.js';
// import WalletService from './WalletService.js';
// import Exposure from '../model/user/Exposure.js';
// import TotalExposure from '../model/user/TotalExposure.js';
// import UserTransaction from '../model/user/UserTransaction.js';
// import { emitBalanceUpdate } from '../utils/socketUtils.js';

// const SettlementService = {
//   settleBets: async (eventId, resultNation, loggedInAdmin) => {
//     const t = await sequelize.transaction();
//     try {
//       // 1. Fetch all unsettled bets for this event
//       const bets = await SportsBet.findAll({
//         where: { event_id: eventId, settlened: 'pending' },
//         transaction: t,
//       });

//       if (!bets || bets.length === 0) {
//         console.log(`No pending bets for event ${eventId}`);
//         await t.commit();
//         return { message: 'No bets to settle' };
//       }

//       // 2. Loop through bets and calculate P&L
//       for (const bet of bets) {
//         const { user_id, amount, user_rate, bet_type, nation } = bet;

//         let pnl = 0;
//         if (bet_type === 'back') {
//           // Back bet: win if nation == result
//           pnl = nation === resultNation
//             ? (parseFloat(user_rate) - 1) * parseFloat(amount)
//             : -parseFloat(amount);
//         } else {
//           // Lay bet: win if nation != result
//           pnl = nation !== resultNation
//             ? parseFloat(amount)
//             : -(parseFloat(user_rate) - 1) * parseFloat(amount);
//         }

//         // 3. Update Wallet (Credit if win, no action if loss since already debited)
//         if (pnl > 0) {
//           await WalletService.creditBalance(
//             user_id,
//             pnl,
//             'USDT',
//             'User',
//             t,
//             loggedInAdmin.username
//           );
//         }

//         // 4. Update Ledger
//         await UserTransaction.create(
//           {
//             user_id,
//             transaction_type: pnl > 0 ? 'credit' : 'debit',
//             pts: Math.abs(pnl),
//             remark: `Settlement for event ${eventId}, nation: ${resultNation}`,
//             action_by: loggedInAdmin.user_id,
//           },
//           { transaction: t }
//         );

//         // 5. Mark bet as settled
//         bet.settlened = 'true';
//         await bet.save({ transaction: t });

//         // 6. Reset Exposure for this match
//         await Exposure.destroy({
//           where: { user_id, match_id: eventId },
//           transaction: t,
//         });

//         // 7. Reset Total Exposure
//         let totalExp = await TotalExposure.findOne({
//           where: { user_id },
//           transaction: t,
//         });

//         if (totalExp) {
//           totalExp.total_exposure = 0;
//           await totalExp.save({ transaction: t });
//         }

//         // 8. Emit Updated Balance
//         const balance = await WalletService.getBalance(user_id, 'User');
//         emitBalanceUpdate(user_id, {
//           balance: balance.balance,
//           exposure: totalExp ? totalExp.total_exposure : 0,
//         });
//       }

//       await t.commit();
//       return { success: true, settled: bets.length };
//     } catch (error) {
//       await t.rollback();
//       console.error('Error in settleBets:', error);
//       throw error;
//     }
//   },
// };

// export default SettlementService;
