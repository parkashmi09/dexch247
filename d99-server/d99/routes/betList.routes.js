import express from 'express';
import { getBetList, getCasinoOpenBetsDownline, getCasinoAllBetsDownline, getBetTicker } from '../controller/betList.controller.js';
import { getBetListByUser } from '../controller/betListByUser.controller.js';
import { getNetExposureSports, getNetExposureCasino, getMarketUserBook } from '../controller/netExposure.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import updateCreditLimit from '../controller/current-update.js';
import verifyTransactionPassword from '../../middleware/transactionPasswordMiddleware.js';
import controller from '../../sportsbet/sportbetscontroller.js';
const router = express.Router();

router.get('/bet-list', authMiddleware, getBetList);
router.get('/bet-ticker', authMiddleware, getBetTicker);
router.get('/bet-list-by-user', authMiddleware, getBetListByUser);

// ✅ Separated Routes
router.get('/net-exposure', authMiddleware, getNetExposureSports); // Default to sports for backward compatibility
router.get('/net-exposure/sports', authMiddleware, getNetExposureSports);
router.get('/net-exposure/casino', authMiddleware, getNetExposureCasino);

router.get('/net-exposure/market-book/:matchId', authMiddleware, getMarketUserBook);
router.post('/update-current', authMiddleware, verifyTransactionPassword, updateCreditLimit);

// Casino Downline Routes
router.get('/bet-list/casino/open-downline', authMiddleware, getCasinoOpenBetsDownline);
router.get('/bet-list/casino/all-downline', authMiddleware, getCasinoAllBetsDownline);
router.get('/bets/exposure/:user_id', authMiddleware, controller.getUserBets);


export default router;
