import express from 'express';
import StakeButtonValueController from '../../controller/user/StakeButtonValueController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import controller from '../../sportsbet/sportbetscontroller.js';

const router = express.Router();

// Protect all routes with authMiddleware
router.use(authMiddleware);

router.get('/stake-button-values', StakeButtonValueController.getStakeButtonValues);
router.post('/stake-button-values', StakeButtonValueController.updateStakeButtonValues);


export default router;
