import express from 'express';
import ActivityLogController from '../../controller/admin/ActivityLogController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// Protect route with authMiddleware
router.get('/activity-logs', authMiddleware, ActivityLogController.getLogs);

export default router;
