

import express from 'express';
import UserAuthController from '../../controller/user/userAuthController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
// import userProfileController from '../../controller/user/userProfileController.js';

const router = express.Router();

// 🔐 Public: User Login
router.post('/login', UserAuthController.login);
router.post('/verify-2fa', UserAuthController.verify2FA);
router.post('/resend-2fa-otp', UserAuthController.resend2FA);

// 🚪 Protected: User Logout
router.post('/logout', authMiddleware, UserAuthController.logout);

// 🔐 Protected: Change Password
router.post('/change-password', authMiddleware, UserAuthController.changePassword);


//no need 
// Protected route: Get user profile with wallet -- need to shift this route from here to userRoutes
// router.get('/profile', authMiddleware, userProfileController.getUserProfileWithWallet);

export default router;
