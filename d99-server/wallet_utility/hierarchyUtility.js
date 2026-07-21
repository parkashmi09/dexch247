
import User from '../model/user/User.js';
import Staff from '../model/admin/Staff.js';
import Owner from '../model/admin/Owner.js';
import Wallet from '../model/admin/Wallet.js';

/**
 * Recursively decrements cash_received for all ancestors (Staff & Owners)
 * Triggered when a User loses a bet.
 */
export const decrementAncestorCashReceived = async (userId, amount, transaction) => {
  try {
    console.log(`[Hierarchy] Decrementing cash_received for ancestors of user ${userId} by ${amount}`);
    const txnOpts = transaction ? { transaction } : {};
    const lockOpts = transaction ? { transaction, lock: transaction.LOCK.UPDATE } : {};

    const user = await User.findByPk(userId, txnOpts);
    if (!user) return;

    let currentStaffId = user.parent_staff_id;
    let currentOwnerId = user.parent_owner_id;

    // 0. Process User's own Wallet
    const userWallet = await Wallet.findOne({
      where: { user_id: userId, user_type: 'USER' },
      ...lockOpts
    });
    if (userWallet) {
      const prevRec = parseFloat(userWallet.cash_received || 0);
      userWallet.cash_received = prevRec - parseFloat(amount);
      await userWallet.save(txnOpts);
      console.log(`[Hierarchy] Decremented cash_received for User ${userId} (${user.username})`);
    }

    // 1. Process Staff chain
    while (currentStaffId) {
      const staff = await Staff.findByPk(currentStaffId, txnOpts);
      if (!staff) break;

      // Update Wallet for this Staff
      const wallet = await Wallet.findOne({
        where: { staff_id: currentStaffId, user_type: staff.role.toUpperCase() },
        ...lockOpts
      });

      if (wallet) {
        const prevRec = parseFloat(wallet.cash_received || 0);
        wallet.cash_received = prevRec - parseFloat(amount);
        await wallet.save(txnOpts);
        console.log(`[Hierarchy] Decremented cash_received for Staff ${currentStaffId} (${staff.username})`);
      }

      // Move up
      currentOwnerId = staff.parent_owner_id; // Update ownerId as we go up
      currentStaffId = staff.parent_id;
    }

    // 2. Process Owner (if any)
    if (currentOwnerId) {
      const owner = await Owner.findByPk(currentOwnerId, txnOpts);
      if (owner) {
        const wallet = await Wallet.findOne({
          where: { owner_id: currentOwnerId, user_type: 'OWNER' },
          ...lockOpts
        });

        if (wallet) {
          const prevRec = parseFloat(wallet.cash_received || 0);
          wallet.cash_received = prevRec - parseFloat(amount);
          await wallet.save(txnOpts);
          console.log(`[Hierarchy] Decremented cash_received for Owner ${currentOwnerId} (${owner.username})`);
        }
      }
    }
  } catch (e) {
    console.error('❌ decrementAncestorCashReceived error:', e);
    throw e;
  }
};

/**
 * Recursively increments cash_received for all ancestors (Staff & Owners)
 * Triggered when a User wins a bet.
 */
export const incrementAncestorCashReceived = async (userId, amount, transaction) => {
  try {
    console.log(`[Hierarchy] Incrementing cash_received for ancestors of user ${userId} by ${amount}`);
    const txnOpts = transaction ? { transaction } : {};
    const lockOpts = transaction ? { transaction, lock: transaction.LOCK.UPDATE } : {};

    const user = await User.findByPk(userId, txnOpts);
    if (!user) return;

    let currentStaffId = user.parent_staff_id;
    let currentOwnerId = user.parent_owner_id;

    // 0. Process User's own Wallet
    const userWallet = await Wallet.findOne({
      where: { user_id: userId, user_type: 'USER' },
      ...lockOpts
    });
    if (userWallet) {
      const prevRec = parseFloat(userWallet.cash_received || 0);
      userWallet.cash_received = prevRec + parseFloat(amount);
      await userWallet.save(txnOpts);
      console.log(`[Hierarchy] Incremented cash_received for User ${userId} (${user.username})`);
    }

    // 1. Process Staff chain
    while (currentStaffId) {
      const staff = await Staff.findByPk(currentStaffId, txnOpts);
      if (!staff) break;

      // Update Wallet for this Staff
      const wallet = await Wallet.findOne({
        where: { staff_id: currentStaffId, user_type: staff.role.toUpperCase() },
        ...lockOpts
      });

      if (wallet) {
        const prevRec = parseFloat(wallet.cash_received || 0);
        wallet.cash_received = prevRec + parseFloat(amount);
        await wallet.save(txnOpts);
        console.log(`[Hierarchy] Incremented cash_received for Staff ${currentStaffId} (${staff.username})`);
      }

      // Move up
      currentOwnerId = staff.parent_owner_id;
      currentStaffId = staff.parent_id;
    }

    // 2. Process Owner (if any)
    if (currentOwnerId) {
      const owner = await Owner.findByPk(currentOwnerId, txnOpts);
      if (owner) {
        const wallet = await Wallet.findOne({
          where: { owner_id: currentOwnerId, user_type: 'OWNER' },
          ...lockOpts
        });

        if (wallet) {
          const prevRec = parseFloat(wallet.cash_received || 0);
          wallet.cash_received = prevRec + parseFloat(amount);
          await wallet.save(txnOpts);
          console.log(`[Hierarchy] Incremented cash_received for Owner ${currentOwnerId} (${owner.username})`);
        }
      }
    }
  } catch (e) {
    console.error('❌ incrementAncestorCashReceived error:', e);
    throw e;
  }
};
