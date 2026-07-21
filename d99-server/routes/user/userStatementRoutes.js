import express from 'express';
import UserStatementController from '../../controller/user/UserStatementController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Protected: Get Logged-in User Account Statement
router.post('/account-statement', authMiddleware, UserStatementController.getAccountStatement);

export default router;
