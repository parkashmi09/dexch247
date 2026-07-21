import express from 'express';
import GameController from './gameController.js';
const router = express.Router();

router.post('/launch', GameController.getGameLaunchURL);
router.post('/bet-callback', GameController.processBetCallbackV2);
router.get('/games', GameController.getActiveGames);
router.get('/games/search', GameController.searchGames);
router.get('/history', GameController.userhistory);
router.get('/historyAdmin', GameController.userhistoryAdmin);
router.post('/v2/bet-callback', GameController.processBetCallbackV2);

export default router;