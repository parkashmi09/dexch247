import express from 'express';
import ReportsController from '../../controller/admin/reportsController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Protected: Get Account Statement
router.post('/accountstatement', authMiddleware, ReportsController.getAccountStatement);

// 🔐 Protected: Get Current Bets
router.get('/current-bets', authMiddleware, ReportsController.getCurrentBets);

router.post('/casino-report', authMiddleware, ReportsController.getCasinoReport);



router.post('/market-analysis', authMiddleware, ReportsController.getMarketAnalysis);

router.post('/user-win-loss', authMiddleware, ReportsController.getUserWinLoss);

router.post('/total-profit-loss', authMiddleware, ReportsController.getTotalProfitLoss);

// 🔐 Protected: User Bet History (downline only)
router.get('/user-bet-history', authMiddleware, ReportsController.getUserBetHistory);

// 🔐 Protected: Match-scoped bets (downline only) — used by game-details page
router.get('/match-downline-bets', authMiddleware, ReportsController.getMatchDownlineBets);

export default router;
