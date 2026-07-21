

import express from 'express';
const router = express.Router();

import WalletController from '../../controller/walletController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';
import requirePermission from '../../middleware/permissionMiddleware.js';

// below two routes working but not recommended to use as it directly credit and debit in inr_balance can be used for rare scenarios
// router.post('/credit', authMiddleware, WalletController.creditBalance);
// router.post('/debit', authMiddleware, WalletController.debitBalance);

// without userId param logged in user (ADMIN) can get their balance, with userId admin can get individual user's balance  
// router.get('/balance/:userId', authMiddleware, WalletController.getBalance);   

// New routes for fetching wallets
router.get('/wallet-list', authMiddleware, WalletController.getAllWallets); // Get all wallets
router.get('/wallets/:role', authMiddleware, WalletController.getWalletsByRole); // Get wallets by role

// ===============================
// 🆕 NEW ROUTES FOR CASH & CREDIT  : new concept added
// ===============================

// ➕ Add or subtract cash from  wallet
// Executive gate: deposit = add chips, withdraw = subtract chips. Owners/staff bypass.
router.post('/wallet/cash/add', authMiddleware, requirePermission('deposit'), verifyTransactionPassword, WalletController.addCash);
router.post('/wallet/cash/subtract', authMiddleware, requirePermission('withdraw'), verifyTransactionPassword, WalletController.subtractCash);

// ➕ Update credit reference (cash_received) - manual only
router.post('/wallet/credit/add', authMiddleware, requirePermission('creditReference'), verifyTransactionPassword, WalletController.updateCreditReference);

// 🧾 Get individual full wallet details
router.get('/wallet/:userId', authMiddleware, WalletController.getUserWallet);

// 🧾 Get all wallets with balances
router.get('/wallets/all', authMiddleware, WalletController.getAllWallets);

export default router;
