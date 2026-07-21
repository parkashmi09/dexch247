import express from 'express';
const router = express.Router();
import WalletController from '../../controller/walletController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import UserTransaction from '../../model/user/user_transaction.js';
import ExposureController from '../../controller/user/userExposureController.js';

router.get('/balance',authMiddleware, WalletController.getBalance);
router.get('/transactions', authMiddleware, WalletController.getUserTransactions);
// router.post('/transfer', authMiddleware, WalletController.transferFunds);
router.post('/exposure',  ExposureController.getAllExposuresForUser);
router.post('/exposures/get-exposure', authMiddleware, ExposureController.getExposureById);




export default router;