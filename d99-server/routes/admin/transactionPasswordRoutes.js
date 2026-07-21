import express from 'express';
import TransactionPasswordController from '../../controller/admin/TransactionPasswordController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Verify Transaction Password
router.post('/transaction-password/verify', authMiddleware, TransactionPasswordController.verifyTransactionPassword);

// 🔄 Regenerate Transaction Password (Owner Only)
// Note: The controller checks for OWNER role, but we can also add a middleware if strict role check is needed here.
// For now, relying on controller logic and authMiddleware.
router.post('/transaction-password/regenerate', authMiddleware, TransactionPasswordController.regenerateTransactionPassword);

export default router;
