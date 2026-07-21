import express from 'express';
import CricketController from '../../controller/sports/cricket/cricketController.js';
import BannerController from '../../controller/user/bannerController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
const router = express.Router();

// Dynamic welcome banner (proxied — upstream feed has no CORS headers)
router.get('/banners/welcome', BannerController.getWelcomeBanner);



// POST route for fetching casino data with body parameters
router.post('/cricket/all-data', CricketController.fetchCricketData);
router.get('/cricket/get-all-sports-data', CricketController.GetallSportsdata);
router.post('/cricket/get-sport-data-by-id', CricketController.getSportdetailsById);
router.post('/cricket/get-match-private-data', CricketController.GetMatchPrivateData);

router.post('/cricket/live-stream', CricketController.fetchLiveStream); 
router.post('/cricket/score-card', CricketController.fetchScoreCard);
router.get('/all/sports/tree', CricketController.fetchTreeData);
// router.post('/cricket/place-bet', authMiddleware, CricketController.Placebetdata); // this is not used now,  bet place function inside sports folder
router.post('/cricket/gameresults', CricketController.GetResults);
router.get('/cricket/sports-bets/all', CricketController.getAllSportsBets);
router.get('/cricket/sports-bets/user', authMiddleware, CricketController.getSportsBetsByUserId);

router.get('/cricket/total-stake', CricketController.getTotalStakeOnEvent);

router.get('/cricket/total-stake-live-events', CricketController.getTotalStakeOnLiveAndUpcomingEvents);



router.post('/sports-bets/user', authMiddleware, CricketController.getSportsBetsOfUser); // used by admin to get particular user's bets

router.get('/cricket/wins/user', authMiddleware, CricketController.getWinsByUserId);

//matched bets and open bets

router.get('/cricket/matched-bets/user/event', CricketController.getUserMatchedBetsByEvent);
router.get('/cricket/open-bets/user/event', CricketController.getUserOpenBetsForEvent); // Replaced with fresh implementation
router.get('/cricket/user-open-bets', CricketController.getUserOpenBetsForEvent); // New explicit route

// for admin

router.get('/cricket/matched-bets/all', CricketController.getMatchedBetsByEvent); //total bets on particular event - admin
router.get('/cricket/open-bets/all', CricketController.getOpenBetsByEvent);
// router.get('/cricket/all-time-credit/user', authMiddleware, CricketController.getAllTimeCreditByUserId);

// Protected route: Logout
// router.post('/logout', authMiddleware, AuthController.logout);

export default router;

