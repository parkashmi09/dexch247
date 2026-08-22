import express from 'express';
import CasinoController from '../../controller/casino/casinoController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
const router = express.Router();


// POST route for fetching casino data with body parameters
router.post('/casino/all-data', CasinoController.fetchAllData);

router.post('/casino/last-results', CasinoController.fetchLastResults);

router.post('/casino/detail-results', CasinoController.fetchDetailResults);

router.post('/casino/placebet', CasinoController.placeBet);

// Undo the caller's last open bet on a round. AUTHENTICATED on purpose: it moves
// money, and the user_id comes from the token so nobody can void someone else's
// bet. (The sibling routes above are unauthenticated legacy — see the note in
// CasinoController.undoBet.)
router.post('/casino/undobet', authMiddleware, CasinoController.undoBet);

router.post('/casino/mybets', CasinoController.getUserBets);
router.post('/casino/bet-history', CasinoController.UserBets);






// Protected route: Logout
// router.post('/logout', authMiddleware, AuthController.logout);

export default router;