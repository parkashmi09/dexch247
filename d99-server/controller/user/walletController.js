// import WalletService from '../../services/walletService.js';
// import UserTransaction from '../../model/user/user_transaction.js';
// import { io } from '../../server.js';

// const WalletController = {


//     getBalance: async (req, res) => {
//         try {
//             console.log(req.body, 'req body from wallet controller:'); // Debugging log
//             console.log(req.user, 'req user from wallet controller:'); // Debugging log

//             const { userId } = req.body;
//             const adminUserId = req.user.user_id; // Admin's userId from the token

//             // Use the provided userId or fallback to the admin's userId
//             const targetUserId = userId || adminUserId;
//             const userRole = req.user.role || 'User';

//             const balance = await WalletService.getBalance(targetUserId, userRole);

//             // Emit real-time balance update via socket
//             if (io) {
//                 io.to(`user_${targetUserId}`).emit('balanceUpdate', {
//                     userId: targetUserId,
//                     balance: {
//                         inr_balance: balance.inr_balance,
//                         exposure: balance.exposure
//                     },
//                     timestamp: new Date().toISOString()
//                 });
//             }

//             res.status(200).json({ success: true, data: balance });
//         } catch (error) {
//             console.error('Error in getBalance:', error);
//             res.status(500).json({ success: false, error: error.message });
//         }
//     },

//     getUserTransactions: async (req, res) => {
//         try {
//             const userId = req.user.user_id;
//             if (!userId) {
//                 return res.status(401).json({ success: false, error: 'Unauthorized: user_id missing' });
//             }
//             const transactions = await UserTransaction.findAll({
//                 where: { user_id: userId },
//                 order: [['date', 'DESC']],
//             });

//             // Emit real-time transaction update via socket
//             if (io) {
//                 io.to(`user_${userId}`).emit('transactionUpdate', {
//                     userId: userId,
//                     transactions: transactions,
//                     timestamp: new Date().toISOString()
//                 });
//             }

//             res.status(200).json({ success: true, data: transactions });
//         } catch (error) {
//             console.error('Error in getUserTransactions:', error);
//             res.status(500).json({ success: false, error: error.message });
//         }
//     },
// };

// export default WalletController;

import WalletService from '../../services/walletService.js';
import UserTransaction from '../../model/user/user_transaction.js';
import { io } from '../../server.js';

const WalletController = {
  // -----------------------------------------------------------------------
  // GET BALANCE – returns inr_balance, cash, credit for the logged-in user
  // -----------------------------------------------------------------------
  getBalance: async (req, res) => {
    try {
      const userId = req.user.user_id || req?.user?.account?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: user_id missing' });
      }

      // Wallet is keyed by the ACCOUNT type ('USER'/'OWNER'/'STAFF' roles).
      // NOTE: WalletService exposes getUserWallet — there is no getBalance().
      const userType = req?.user?.account?.type || 'USER';
      const balance = await WalletService.getUserWallet(userId, userType);

      // Emit real-time balance update via socket
      if (io) {
        io.to(`user_${userId}`).emit('balanceUpdate', {
          userId,
          balance: {
            inr_balance: balance.inr_balance,
            cash: balance.cash,
          },
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({ success: true, data: balance });
    } catch (error) {
      console.error('Error in getBalance (user):', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // -----------------------------------------------------------------------
  // GET USER TRANSACTIONS – with real-time socket emit
  // -----------------------------------------------------------------------
  getUserTransactions: async (req, res) => {
    try {
      const userId = req.user.user_id || req?.user?.account?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized: user_id missing' });
      }

      const transactions = await UserTransaction.findAll({
        where: { user_id: userId },
        order: [['date', 'DESC']],
      });

      // Emit real-time transaction update
      if (io) {
        io.to(`user_${userId}`).emit('transactionUpdate', {
          userId,
          transactions,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error in getUserTransactions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default WalletController;