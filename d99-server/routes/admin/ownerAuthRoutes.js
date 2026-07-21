

import express from 'express';
import ownerAuthController from '../../controller/admin/ownerAuthController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

//  Owner / Website Login
router.post('/login-owner', ownerAuthController.login);

// Verify 2FA
router.post('/owner/verify-2fa', ownerAuthController.verify2FA);

//  Owner Logout
router.post('/logout', authMiddleware, ownerAuthController.logout);

// Owner Profile
router.get('/profile', authMiddleware, ownerAuthController.getProfile);

// Update Platform Configurations
router.post('/update-platform-configurations', authMiddleware, ownerAuthController.updatePlatformConfigurations);

export default router;
