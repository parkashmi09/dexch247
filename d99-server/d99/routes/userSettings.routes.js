import express from 'express';
import { 
    updateCreditLimit, 
    updateExposureLimit, 
    updateStatus, 
    updatePassword 
} from '../controller/userSettings.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';

const router = express.Router();

// Middleware: Auth + Transaction Password (optional or required per endpoint?)
// Usually sensitive updates require Transaction Password.
// We'll apply verifyTransactionPassword to all for now as per previous logic, 
// OR let controller handle it if it's passed in body. 
// Ideally middleware verifies it from header/body. 
// Existing routes use it as middleware. 
// Frontend sends 'masterPassword' -> 'transactionPassword'.

router.post('/credit-limit', authMiddleware, verifyTransactionPassword, updateCreditLimit);
router.post('/exposure-limit', authMiddleware, verifyTransactionPassword, updateExposureLimit);
router.post('/status', authMiddleware, verifyTransactionPassword, updateStatus);
router.post('/update-password', authMiddleware, verifyTransactionPassword, updatePassword);

export default router;
