import express from 'express';
import TableCasinoController from '../../controller/admin/TableCasinoController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';

const router = express.Router();

// Get list of all casino tables
router.get('/list', authMiddleware, TableCasinoController.getCasinoList);

// Get locks for a specific staff member
router.get('/locks/:staffId', authMiddleware, TableCasinoController.getStaffLocks);

// Toggle lock for a specific table and staff
router.post('/lock', authMiddleware, verifyTransactionPassword, TableCasinoController.updateStaffLock);

router.post('/openCasinoBets',authMiddleware,TableCasinoController.casinoOpenBets);

router.post('/casinoResults',authMiddleware,TableCasinoController.getCasinoResults);

export default router;
