

//=================================

import express from "express";
import SportsBetController from "./bettingcontroller.js";

const router = express.Router();

// ========== USER ROUTES ==========
router.post("/bets", SportsBetController.createBet);
router.get("/users/:userId/bets", SportsBetController.getUserBets);

// ========== ADMIN ROUTES ==========
router.get("/admin/bets", SportsBetController.getAllBets);
router.put("/admin/bets/:betId/status", SportsBetController.updateBetStatus);
router.delete("/admin/bets/:betId", SportsBetController.deleteBet);

export default router;
