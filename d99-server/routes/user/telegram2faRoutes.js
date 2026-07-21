
import express from 'express';
import Telegram2FAController from '../../controller/user/telegram2faController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// Step 1: Verify Password
router.post('/verify-password', AuthMiddleware, Telegram2FAController.verifyPassword);

// Step 2: Generate code (Requires User Login)
router.post('/generate-link-code', AuthMiddleware, Telegram2FAController.generateLinkCode);

// Verify link (Called by Bot) - Open endpoint or secured by secret if possible (for now public but requires valid code)
router.post('/webhook/link', Telegram2FAController.verifyLinkWebhook);

// Send Disable OTP
router.post('/send-disable-code', AuthMiddleware, Telegram2FAController.sendDisableCode);

// Disable 2FA
router.post('/disable-2fa', AuthMiddleware, Telegram2FAController.disable2FA);

export default router;