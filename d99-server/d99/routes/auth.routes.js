import express from 'express';
import { updateLordsPassword } from '../controller/lordsAuth.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// UPDATE PASSWORD (Old Password Verification)
router.put('/update-password', authMiddleware, updateLordsPassword);

export default router;
