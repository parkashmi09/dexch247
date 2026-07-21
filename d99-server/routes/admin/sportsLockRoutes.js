import express from 'express';
import SportsLockController from '../../controller/admin/SportsLockController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get locks for a target (User/Staff/Owner)
router.get('/get/:targetId', SportsLockController.getSportsLocks);

// Update lock (Toggle)
router.post('/update', SportsLockController.updateSportsLock);

export default router;
