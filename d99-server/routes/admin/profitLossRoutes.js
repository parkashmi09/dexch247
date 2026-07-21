// routes/profitLossRoutes.js
import express from 'express';
import {
  getAllUsersPL,
  getUserPL,
  getMyPL,
} from '../../controller/admin/profitLossController.js';


import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// === PUBLIC / ADMIN ROUTES :  access can be handle in authorize middleware ===
router.get('/pl/all', authMiddleware, getAllUsersPL);           // All users + range range is must : eg: get https://apidiamond99.codefactory.games/api/admin/pl/all?start=2025-11-01&end=2025-11-30&summary=true
router.get('/pl/all/today', authMiddleware, getAllUsersPL);      // Today only

// === SINGLE USER ===
router.get('/pl/user/:wallet_id', getUserPL);

// === LOGGED-IN staff ===
// router.get('/pl/staff', authMiddleware, getMyPL);

export default router;