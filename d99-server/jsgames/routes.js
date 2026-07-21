import express from 'express';
import GameController from './controller.js';
const router = express.Router();

// 1. Get Game Launch URL (SEAMLESS)
router.post('/game/launch', async (req, res) => {
    await GameController.getGameLaunchURL(req, res);
});

// 2. Bet Callback (External API Callback)
router.post('/game/bet-callback', async (req, res) => {
    await GameController.processBetCallback(req, res);
});

// 3. Game Transfer (Deposit/Withdrawal)
router.post('/game/transfer', async (req, res) => {
    await GameController.processGameTransfer(req, res);
});

// 4. Get Transaction Records
router.post('/game/transactions', async (req, res) => {
    await GameController.getTransactionRecords(req, res);
});

// 5. Get active games with pagination
router.get('/games', async (req, res) => {
    await GameController.getActiveGames(req, res);
});

// 6. Search games
router.get('/games/search', async (req, res) => {
    await GameController.searchGames(req, res);
});

export default router;
