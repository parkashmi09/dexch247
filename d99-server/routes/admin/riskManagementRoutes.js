import express from "express";
import { getRiskBets, updateBetsStatus, getOpenBetsByEvent, getDeactivatedMatches, addDeactivatedMatch, removeDeactivatedMatch } from "../../controller/admin/riskManagementController.js";
// import authMiddleware from "../../middleware/authMiddleware.js"; // Assuming we need auth

const router = express.Router();

// Apply auth middleware if needed, usually admin routes are protected
// router.use(authMiddleware);

router.get("/risk-management/bets", getRiskBets);
router.post("/risk-management/bets/update-status", updateBetsStatus);
router.get("/risk-management/open-bets-by-event", getOpenBetsByEvent);

// Deactivated Matches Routes
router.get("/risk-management/deactivated-matches", getDeactivatedMatches);
router.post("/risk-management/match/deactivate", addDeactivatedMatch);
router.post("/risk-management/match/activate", removeDeactivatedMatch);

export default router;
