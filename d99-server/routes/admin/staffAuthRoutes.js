import express from 'express';
import staffAuthController from '../../controller/admin/staffAuthController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Login (Staff / Admin / Owner / etc.)
router.post('/staff/login', staffAuthController.login);

// Verify 2FA
router.post('/staff/verify-2fa', staffAuthController.verify2FA);

// 🚪 Logout
router.post('/staff/logout', authMiddleware, staffAuthController.logout);

// 👤 Profile
router.get('/staff/profile', authMiddleware, staffAuthController.getProfile);

export default router;
