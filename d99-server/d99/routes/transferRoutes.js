import express from 'express';
import TransferController from '../controller/transferController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, verifyTransactionPassword, TransferController.transfer);
router.post('/statement', authMiddleware, TransferController.getStatement);

export default router;
