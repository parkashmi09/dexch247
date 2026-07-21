import Wallet from '../model/admin/Wallet.js';
import User from '../model/user/User.js';
import Staff from '../model/admin/Staff.js';
import Owner from '../model/admin/Owner.js';
import Transaction from '../model/admin/Transaction.js';
import { emitBalanceUpdate } from '../utils/socketUtils.js';
import { decrementAncestorCashReceived } from '../wallet_utility/hierarchyUtility.js';

const WalletService = {
  // ---------------------------------------------------------------------------
  // Helper: determine correct ID field
  // ---------------------------------------------------------------------------
  getWalletQueryField(userType) {
    const type = userType ? userType.toUpperCase() : null;

    if (type === 'USER') return 'user_id';
    if (['SUPERADMIN', 'COMPANY', 'ADMIN', 'SUPERMASTER', 'MASTER'].includes(type)) return 'staff_id';
    if (type === 'OWNER') return 'owner_id';
    return 'USER TYPE NOT FOUND';
  },

  // -----------------------------------------------------------------------
  // Helper: Get Hierarchy IDs (User, Staff, Owner)
  // -----------------------------------------------------------------------
  getHierarchyIds: async (entityId, userType) => {
    const type = userType ? userType.toUpperCase() : '';
    let userId = null;
    let staffId = null;
    let ownerId = null;

    if (type === 'USER') {
      userId = entityId;
      const user = await User.findByPk(entityId);
      if (user) {
        staffId = user.parent_staff_id;
        ownerId = user.parent_owner_id;
      }
    } else if (type === 'OWNER') {
      ownerId = entityId;
    } else {
      // Staff (Master, Agent, etc.)
      staffId = entityId;
      const staff = await Staff.findByPk(entityId);
      if (staff && staff.parent_owner_id) {
        ownerId = staff.parent_owner_id;
      } else {
        // Fallback: assume System Owner (ID 1) or fetch first owner
        const owner = await Owner.findOne({ attributes: ['owner_id'] });
        if (owner) ownerId = owner.owner_id;
      }
    }

    return { userId, staffId, ownerId };
  },

  // -----------------------------------------------------------------------
  // CREATE WALLET
  // -----------------------------------------------------------------------
  createWallet: async (entityId, userType, transaction, username, credit = 0, cash = 0) => {
    try {
      const roleMap = {
        company: 'COMPANY',
        superadmin: 'SUPERADMIN',
        admin: 'ADMIN',
        supermaster: 'SUPERMASTER',
        master: 'MASTER',
        owner: 'OWNER',
        user: 'USER',
      };

      const normalised = roleMap[userType?.toLowerCase()] || userType?.toUpperCase();
      const idField = WalletService.getWalletQueryField(normalised);

      const whereClause = { [idField]: entityId, user_type: normalised };
      const existing = await Wallet.findOne({ where: whereClause, transaction });
      if (existing) return existing;

      const walletData = {
        user_type: normalised,
        username,
        inr_balance: parseFloat(cash) || 0,
        cash: parseFloat(cash) || 0,
        cash_received: 0,
      };

      if (idField === 'user_id') walletData.user_id = entityId;
      if (idField === 'staff_id') walletData.staff_id = entityId;
      if (idField === 'owner_id') walletData.owner_id = entityId;

      return await Wallet.create(walletData, { transaction });
    } catch (e) {
      console.error('❌ createWallet error:', e);
      throw e;
    }
  },

  // -----------------------------------------------------------------------
  // CREDIT BALANCE (INR) - Used in creditBalance controller
  // -----------------------------------------------------------------------
  creditBalance: async (entityId, amount, userType, transaction, initiatedBy, senderType = null) => {
    try {
      const idField = WalletService.getWalletQueryField(userType);
      const wallet = await Wallet.findOne({ where: { [idField]: entityId, user_type: userType }, transaction });
      if (!wallet) throw new Error('Wallet not found');

      const prev = parseFloat(wallet.inr_balance);
      wallet.inr_balance = prev + parseFloat(amount);
      await wallet.save({ transaction });

      // Determine IDs for Transaction
      const { userId: t_userId, staffId: t_staffId, ownerId: t_ownerId } = await WalletService.getHierarchyIds(entityId, userType);

      await Transaction.create(
        {
          wallet_id: wallet.wallet_id,
          username: wallet.username,
          user_id: t_userId,
          staff_id: t_staffId,
          owner_id: t_ownerId,
          type: 'CREDIT_INR',
          amount: parseFloat(amount),
          previous_balance: prev,
          new_balance: wallet.inr_balance,
          balance: wallet.inr_balance,
          credit: wallet.username,
          debit: initiatedBy,
          initiated_by: initiatedBy,
        },
        { transaction }
      );

      emitBalanceUpdate(entityId, { inr_balance: wallet.inr_balance });
      return wallet;
    } catch (e) {
      console.error('❌ creditBalance error:', e);
      throw e;
    }
  },

  // -----------------------------------------------------------------------
  // DEBIT BALANCE (INR)
  // -----------------------------------------------------------------------
  debitBalance: async (entityId, amount, userType, transaction, initiatedBy) => {
    try {
      const idField = WalletService.getWalletQueryField(userType);
      const wallet = await Wallet.findOne({ where: { [idField]: entityId, user_type: userType }, transaction });
      if (!wallet) throw new Error('Wallet not found');

      const current = parseFloat(wallet.inr_balance);
      if (current < parseFloat(amount)) throw new Error('Insufficient balance');

      wallet.inr_balance = current - parseFloat(amount);


      // ===================================================== extra patch==================================================
      const updatedPL = Math.round((wallet.inr_balance - parseFloat(wallet.cash_received || 0)) * 100) / 100;
      wallet.profit_loss = updatedPL;
      wallet.verdict = updatedPL >= 0 ? 'profit' : 'loss';
      // ===================================================== extra patch==================================================


      await wallet.save({ transaction });

      // Determine IDs for Transaction
      const { userId: t_userId, staffId: t_staffId, ownerId: t_ownerId } = await WalletService.getHierarchyIds(entityId, userType);

      await Transaction.create({
        wallet_id: wallet.wallet_id,
        username: wallet.username,
        user_id: t_userId,
        staff_id: t_staffId,
        owner_id: t_ownerId,
        type: 'DEBIT_INR',
        amount: parseFloat(amount),
        previous_balance: current,
        new_balance: wallet.inr_balance,
        balance: wallet.inr_balance,
        credit: initiatedBy,
        debit: wallet.username,
        initiated_by: initiatedBy,
      }, { transaction });

      emitBalanceUpdate(entityId, { inr_balance: wallet.inr_balance });
      return wallet;
    } catch (e) {
      console.error('❌ debitBalance error:', e);
      throw e;
    }
  },

  /**
   * Recursively decrements cash_received for all ancestors (Staff & Owners)
   * Triggered when a User loses a bet.
   */
  decrementAncestorCashReceived,

  // -----------------------------------------------------------------------
  // ADD CASH → OWNER gets it for FREE
  // -----------------------------------------------------------------------
  addCash: async (receiverId, amount, userType, transaction, initiatedBy, senderId = null, senderType = null) => {
    if (!userType || !receiverId) throw new Error('ReceiverId and UserType required');

    try {
      const receiverField = WalletService.getWalletQueryField(userType);
      const receiverWallet = await Wallet.findOne({ where: { [receiverField]: receiverId }, transaction });
      if (!receiverWallet) throw new Error('Receiver wallet not found');

      // === DEDUCT FROM SENDER ===
      let performDeduction = false;
      let senderOwner = null; // ✅ Store owner details
      if (senderId && senderType) {
        if (senderType.toUpperCase() !== 'OWNER') {
          performDeduction = true;
        } else {
          // Check owner unlimited balance
          const owner = await Owner.findByPk(senderId, { transaction });
          senderOwner = owner; // ✅ Store owner details
          // If owner not found or unlimited_balance is false, deduct
          if (owner && !owner.unlimited_balance) {
            performDeduction = true;
          }
        }
      }

      if (performDeduction) {
        const senderField = WalletService.getWalletQueryField(senderType);
        const senderWallet = await Wallet.findOne({
          where: { [senderField]: senderId, user_type: senderType },
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!senderWallet) throw new Error('Sender wallet not found');

        const currentBal = parseFloat(senderWallet.inr_balance ?? 0);
        const currentCash = parseFloat(senderWallet.cash ?? 0);
        const deductAmount = parseFloat(amount);

        if (currentBal < deductAmount) throw new Error('Insufficient INR balance in sender');
        if (currentCash < deductAmount) throw new Error('Insufficient CASH in sender');

        const newBalance = Math.round((currentBal - deductAmount) * 100) / 100;
        const newCash = Math.round((currentCash - deductAmount) * 100) / 100;

        senderWallet.setDataValue('inr_balance', newBalance);
        senderWallet.setDataValue('cash', newCash);
        senderWallet.changed('inr_balance', true);
        senderWallet.changed('cash', true);
// ===================================================== extra patch==================================================
        const newProfitLoss = Math.round((newBalance - parseFloat(senderWallet.cash_received || 0)) * 100) / 100;
        senderWallet.setDataValue('profit_loss', newProfitLoss);
        senderWallet.setDataValue('verdict', newProfitLoss >= 0 ? 'profit' : 'loss');
        senderWallet.changed('profit_loss', true);
        senderWallet.changed('verdict', true);
//===================================================== extra patch================================================
        await senderWallet.save({ transaction });

        // Determine IDs for Sender
        let { userId: s_userId, staffId: s_staffId, ownerId: s_ownerId } = await WalletService.getHierarchyIds(senderId, senderType);

        // Fix: If Sender is OWNER and Receiver is STAFF (i.e. not USER and not OWNER), save Receiver's Staff ID
        if (senderType.toUpperCase() === 'OWNER' && userType.toUpperCase() !== 'USER' && userType.toUpperCase() !== 'OWNER') {
          s_staffId = receiverId;
        }

        // Fix: If Sender is OWNER and Receiver is USER, save Receiver's User ID
        if (senderType.toUpperCase() === 'OWNER' && userType.toUpperCase() === 'USER') {
          s_userId = receiverId;
        }

        await Transaction.create({
          wallet_id: senderWallet.wallet_id,
          user_id: s_userId,
          staff_id: s_staffId,
          owner_id: s_ownerId,
          username: (senderType.toUpperCase() === 'OWNER' && senderOwner) ? senderOwner.username : senderWallet.username,
          type: 'DEBIT_FOR_CASH',
          amount: deductAmount,
          previous_balance: currentBal,
          new_balance: newBalance,
          balance: newBalance,
          credit: receiverWallet.username,
          debit: (senderType.toUpperCase() === 'OWNER' && senderOwner) ? senderOwner.username : senderWallet.username,
          initiated_by: initiatedBy,
        }, { transaction });

        emitBalanceUpdate(senderId, { inr_balance: newBalance, cash: newCash });
        console.log(`Cash deducted from ${senderType} (${senderId})`);
      } else if (senderType?.toUpperCase() === 'OWNER') {
        console.log(`OWNER (${senderId}) added cash → FREE (unlimited balance)`);
        // Log transaction for Owner even if no deduction
        let { userId: s_userId, staffId: s_staffId, ownerId: s_ownerId } = await WalletService.getHierarchyIds(senderId, senderType);

        // Fix: If Sender is OWNER and Receiver is STAFF (i.e. not USER and not OWNER), save Receiver's Staff ID
        if (senderType.toUpperCase() === 'OWNER' && userType.toUpperCase() !== 'USER' && userType.toUpperCase() !== 'OWNER') {
          s_staffId = receiverId;
        }
        // Fix: If Sender is OWNER and Receiver is USER, save Receiver's User ID
        if (senderType.toUpperCase() === 'OWNER' && userType.toUpperCase() === 'USER') {
          s_userId = receiverId;
        }

        const senderWallet = await Wallet.findOne({ where: { [WalletService.getWalletQueryField(senderType)]: senderId } });
        const currentBal = senderWallet ? parseFloat(senderWallet.inr_balance || 0) : 0;

        await Transaction.create({
          wallet_id: senderWallet ? senderWallet.wallet_id : null,
          user_id: s_userId,
          staff_id: s_staffId,
          owner_id: s_ownerId,
          username: senderOwner ? senderOwner.username : 'OWNER',
          type: 'DEBIT_FOR_CASH',
          amount: parseFloat(amount),
          previous_balance: currentBal,
          new_balance: currentBal, // Balance unchanged
          balance: currentBal,
          credit: receiverWallet.username,
          debit: senderOwner ? senderOwner.username : 'OWNER',
          initiated_by: initiatedBy,
        }, { transaction });
      }

      // === ALWAYS ADD TO RECEIVER ===
      const prevCash = parseFloat(receiverWallet.cash || 0);
      const prevInr = parseFloat(receiverWallet.inr_balance || 0);

      receiverWallet.cash = prevCash + parseFloat(amount);
      receiverWallet.inr_balance = prevInr + parseFloat(amount);
      // cash_received (Credit Reference) is NEVER touched here — it is a fixed
      // manual field set by the parent and only changes via the Credit button.
      await receiverWallet.save({ transaction });

      // Determine IDs for Receiver
      let { userId: r_userId, staffId: r_staffId, ownerId: r_ownerId } = await WalletService.getHierarchyIds(receiverId, userType);

      // Fix: If Sender is OWNER, do not attribute to Staff ONLY IF Receiver is USER
      if (senderType && senderType.toUpperCase() === 'OWNER' && userType && userType.toUpperCase() === 'USER') {
        r_staffId = null;
        if (!r_ownerId) r_ownerId = senderId;
      }

      await Transaction.create({
        wallet_id: receiverWallet.wallet_id,
        user_id: r_userId,
        staff_id: r_staffId,
        owner_id: r_ownerId,
        username: receiverWallet.username,
        type: 'ADD_CASH',
        amount: parseFloat(amount),
        previous_balance: prevCash,
        new_balance: receiverWallet.cash,
        balance: receiverWallet.inr_balance,
        credit: receiverWallet.username,
        debit: initiatedBy,
        initiated_by: initiatedBy,
      }, { transaction });

      emitBalanceUpdate(receiverId, { cash: receiverWallet.cash, inr_balance: receiverWallet.inr_balance });
      return receiverWallet;
    } catch (e) {
      console.error('❌ addCash error:', e);
      throw e;
    }
  },

  // -----------------------------------------------------------------------
  // SUBTRACT CASH (user → staff/admin)
  // -----------------------------------------------------------------------
  subtractCash: async (senderId, amount, senderType, transaction, initiatedBy, receiverId, receiverType) => {
    try {
      // === DEDUCT FROM SENDER (user/child) ===
      const idField = WalletService.getWalletQueryField(senderType);
      const wallet = await Wallet.findOne({ where: { [idField]: senderId }, transaction });
      if (!wallet) throw new Error('Wallet not found');

      const prevCash = parseFloat(wallet.cash || 0);
      if (prevCash < parseFloat(amount)) throw new Error('Insufficient cash');

      const prevInr = parseFloat(wallet.inr_balance || 0);
      wallet.cash = prevCash - parseFloat(amount);
      wallet.inr_balance = prevInr - parseFloat(amount);
      // cash_received (Credit Reference) is NEVER touched — fixed manual field.
      await wallet.save({ transaction });

      // Determine IDs for Sender transaction log
      let { userId: s_userId, staffId: s_staffId, ownerId: s_ownerId } = await WalletService.getHierarchyIds(senderId, senderType);
      if (receiverType && receiverType.toUpperCase() === 'OWNER' && senderType && senderType.toUpperCase() === 'USER') {
        s_staffId = null;
        if (!s_ownerId) s_ownerId = receiverId;
      }

      await Transaction.create({
        wallet_id: wallet.wallet_id,
        user_id: s_userId,
        staff_id: s_staffId,
        owner_id: s_ownerId,
        username: wallet.username,
        type: 'SUBTRACT_CASH',
        amount: parseFloat(amount),
        previous_balance: prevCash,
        new_balance: wallet.cash,
        balance: wallet.inr_balance,
        credit: initiatedBy,
        debit: wallet.username,
        initiated_by: initiatedBy,
      }, { transaction });

      emitBalanceUpdate(senderId, { cash: wallet.cash, inr_balance: wallet.inr_balance });

      // === CREDIT THE RECEIVER (parent/staff collecting cash back) ===
      // Symmetric to addCash: cash must land somewhere, not vanish.
      // cash_received on receiver is NOT touched — it is a fixed credit reference.
      if (receiverId && receiverType) {
        const receiverField = WalletService.getWalletQueryField(receiverType);
        const receiverWallet = await Wallet.findOne({
          where: { [receiverField]: receiverId },
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (receiverWallet) {
          const rPrevCash = parseFloat(receiverWallet.cash || 0);
          const rPrevInr  = parseFloat(receiverWallet.inr_balance || 0);
          receiverWallet.cash        = rPrevCash + parseFloat(amount);
          receiverWallet.inr_balance = rPrevInr  + parseFloat(amount);
          await receiverWallet.save({ transaction });

          const { userId: r_userId, staffId: r_staffId, ownerId: r_ownerId } = await WalletService.getHierarchyIds(receiverId, receiverType);

          await Transaction.create({
            wallet_id: receiverWallet.wallet_id,
            user_id: r_userId,
            staff_id: r_staffId,
            owner_id: r_ownerId,
            username: receiverWallet.username,
            type: 'COLLECT_CASH',
            amount: parseFloat(amount),
            previous_balance: rPrevCash,
            new_balance: receiverWallet.cash,
            balance: receiverWallet.inr_balance,
            credit: receiverWallet.username,
            debit: wallet.username,
            initiated_by: initiatedBy,
          }, { transaction });

          emitBalanceUpdate(receiverId, { cash: receiverWallet.cash, inr_balance: receiverWallet.inr_balance });
        }
      }

      return wallet;
    } catch (e) {
      console.error('❌ subtractCash error:', e);
      throw e;
    }
  },

  // -----------------------------------------------------------------------
  // ADD CREDIT → OWNER gets it for FREE
  // -----------------------------------------------------------------------
  // -----------------------------------------------------------------------
  // GET USER WALLET
  // -----------------------------------------------------------------------
  getUserWallet: async (entityId, userType) => {
    const idField = WalletService.getWalletQueryField(userType);
    const w = await Wallet.findOne({ where: { [idField]: entityId, user_type: userType } });
    if (!w) throw new Error('Wallet not found');

    return {
      username: w.username,
      user_type: w.user_type,
      cash: parseFloat(w.cash || 0),
      inr_balance: parseFloat(w.inr_balance || 0),
      cash_received: parseFloat(w.cash_received || 0),
    };
  },

  // -----------------------------------------------------------------------
  // Optional: Get all wallets, by role, etc.
  // -----------------------------------------------------------------------
  getAllWallets: async () => await Wallet.findAll(),
  getWalletsByRole: async (role) => await Wallet.findAll({ where: { user_type: role.toUpperCase() } }),
};

export default WalletService;