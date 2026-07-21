

//==============================================unlimited owner balance 

import WalletService from '../services/walletService.js';
import Wallet from '../model/admin/Wallet.js';
import sequelize from '../config/db.js';
import UserTransaction from '../model/user/user_transaction.js';

const WalletController = {
  // --------------------------------------------------------------
  // CREDIT (admin/staff/owner → user)
  // --------------------------------------------------------------
  creditBalance: async (req, res) => {
    console.log('creditBalance called by:', req?.user?.username);
    const { userId, amount, userType, initiatedBy = req?.user?.username } = req.body;

    if (!userId || !amount) return res.status(400).json({ error: 'userId and amount required' });

    const t = await sequelize.transaction();
    try {
      const senderId = req.user.user_id || req.user.account.id;
      const senderRole = req.user.role;
      const senderUsername = req.user.username;

      // === OWNER gets unlimited credits → no deduction ===
      if (senderRole !== 'OWNER') {
        await WalletService.debitBalance(
          senderId,
          amount,
          senderRole,               // sender's role/type
          t,
          senderUsername,
          initiatedBy
        );
      } else {
        console.log(`OWNER (${senderUsername}) giving credit → no wallet deduction`);
      }

      const wallet = await WalletService.creditBalance(
        userId,
        amount,
        userType,
        t,
        senderUsername,
        initiatedBy
      );

      await t.commit();
      res.json({ success: true, data: wallet });
    } catch (e) {
      await t.rollback();
      console.error('creditBalance error:', e);
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // --------------------------------------------------------------
  // DEBIT (admin/staff ← user)
  // --------------------------------------------------------------
  debitBalance: async (req, res) => {
    console.log('debitBalance called by:', req?.user?.username);

    const initiated_by = req?.user?.username;
    const { userId, amount, userType } = req.body;

    if (!userId || !amount) return res.status(400).json({ error: 'userId and amount required' });

    const t = await sequelize.transaction();
    try {
      const wallet = await WalletService.debitBalance(
        userId,
        amount,
        userType,
        t,
        initiated_by
      );

      await t.commit();
      res.json({ success: true, data: wallet });
    } catch (e) {
      await t.rollback();
      res.status(500).json({ success: false, error: e.message });
    }
  },

  // --------------------------------------------------------------
  // ADD CASH (staff/owner → user)
  // --------------------------------------------------------------
  addCash: async (req, res) => {
    console.log('addCash called by:', req?.user);

    const { userId, amount, userType, initiatedBy = req?.user?.username } = req.body;
    if (!userId || !amount || !userType) {
      return res.status(400).json({ error: 'userId, amount, userType required' });
    }

    const t = await sequelize.transaction();
    try {
      const senderId = req.user.user_id || req.user.account.id;
      const senderRole = req.user.role;

      // === Deduction logic is now handled inside WalletService.addCash ===
      if (senderRole === 'OWNER') {
        console.log(`OWNER adding cash to ${userId} → no deduction`);
      }

      const w = await WalletService.addCash(
        userId,
        amount,
        userType,
        t,
        initiatedBy,
        senderId,
        senderRole
      );

      await t.commit();
      res.json({ success: true, message: 'Cash added', data: w });
    } catch (e) {
      await t.rollback();
      res.status(400).json({ success: false, message: e.message });
    }
  },

  // --------------------------------------------------------------
  // SUBTRACT CASH (user → staff/admin)
  // --------------------------------------------------------------
  subtractCash: async (req, res) => {
    console.log('subtractCash called by:', req?.user);

    const { userId, amount, userType, initiatedBy = req?.user?.username } = req.body;
    if (!userId || !amount || !userType) {
      return res.status(400).json({ error: 'userId, amount, userType required' });
    }

    const t = await sequelize.transaction();
    try {
      const w = await WalletService.subtractCash(
        userId,
        amount,
        userType,
        t,
        initiatedBy || req.user.username,
        req.user.user_id || req.user.account.id,
        req.user.role
      );

      await t.commit();
      res.json({ success: true, message: 'Cash subtracted', data: w });
    } catch (e) {
      await t.rollback();
      res.status(400).json({ success: false, message: e.message });
    }
  },

  // --------------------------------------------------------------
  // UPDATE CREDIT REFERENCE (cash_received) - Manual only
  // --------------------------------------------------------------
  updateCreditReference: async (req, res) => {
    const { userId, amount, userType, transactionPassword } = req.body;
    if (!userId || !amount || !userType) {
      return res.status(400).json({ error: 'userId, amount, userType required' });
    }

    const t = await sequelize.transaction();
    try {
      const idField = WalletService.getWalletQueryField(userType);
      const wallet = await Wallet.findOne({ where: { [idField]: userId }, transaction: t });
      if (!wallet) throw new Error('Wallet not found');

      const prevCashReceived = parseFloat(wallet.cash_received || 0);
      wallet.cash_received = parseFloat(amount);
      await wallet.save({ transaction: t });

      await t.commit();
      res.json({
        success: true,
        message: 'Credit reference updated',
        data: {
          previous_cash_received: prevCashReceived,
          new_cash_received: wallet.cash_received,
          cash: parseFloat(wallet.cash || 0),
          inr_balance: parseFloat(wallet.inr_balance || 0),
        }
      });
    } catch (e) {
      await t.rollback();
      res.status(400).json({ success: false, message: e.message });
    }
  },

  // --------------------------------------------------------------
  // WALLET INFO
  // --------------------------------------------------------------
  getUserWallet: async (req, res) => {
    const { userId, userType } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    try {
      const w = await WalletService.getUserWallet(userId, userType);
      res.json({ success: true, data: w });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  },

  getAllWallets: async (req, res) => {
    try {
      const list = await WalletService.getAllWallets();
      res.json({ success: true, data: list });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },

  getWalletsByRole: async (req, res) => {
    const { role } = req.params;
    try {
      const list = await WalletService.getWalletsByRole(role);
      res.json({ success: true, data: list });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },

  // --------------------------------------------------------------
  // GET BALANCE
  // --------------------------------------------------------------
  getBalance: async (req, res) => {
    try {
      // Get userId from params or fallback to logged-in user
      const targetId = req.params?.userId || req.user.account.id;
      const userType = req.user?.role || 'USER'; 

      if (!targetId) {
        return res.status(400).json({ success: false, error: "Missing user details" });
      }

      // Use getUserWallet instead of getBalance
      const data = await WalletService.getUserWallet(targetId, userType);
      return res.json({ success: true, data });

    } catch (e) {
      console.error("getBalance controller error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  },

  // --------------------------------------------------------------
  // USER TRANSACTIONS
  // --------------------------------------------------------------
  getUserTransactions: async (req, res) => {
    const userId = req.user.user_id || req.user.account.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    try {
      const txns = await UserTransaction.findAll({
        where: { user_id: userId },
        order: [['date', 'DESC']],
      });
      res.json({ success: true, data: txns });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  },
};

export default WalletController;
