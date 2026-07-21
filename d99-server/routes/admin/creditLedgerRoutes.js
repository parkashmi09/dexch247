import express from 'express';
import {
  getUserTotalCreditsController,
  getUserCreditHistory,
  getAllUsersCreditHistory,
  getCommissionReport,
} from '../../controller/admin/CreditLedgerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';


const router = express.Router();

/**
 * @desc    Get total credits for a specific user
 * @route   POST /api/credits/:userId/total
 * @access  Private
 */
router.post('/ledger/user/total', authMiddleware, getUserTotalCreditsController);

/**
 * @desc    Get credit history for a specific user (paginated)
 * @route   POST /api/credits/:userId/history
 * @access  Private
 */
router.post('/ledger/user/history', authMiddleware, getUserCreditHistory);

/**
 * @desc    Get credit history of all users (admin only, paginated)
 * @route   POST /api/credits/history
 * @access  Private (Admin)
 */
router.post('/ledger/history-all', authMiddleware, getAllUsersCreditHistory);
/**
 * @desc    Get commission report
 * @route   POST /api/credits/ledger/commission-report
 * @access  Private (Admin)
 */
router.post('/ledger/commission-report', authMiddleware, getCommissionReport);

export default router;
