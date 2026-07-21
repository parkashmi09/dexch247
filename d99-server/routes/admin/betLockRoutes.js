import express from "express";
import {
  getBetLock,
  getAllBetLocks,
  lockBet,
  unlockBet,
  lockMultipleBets,
  unlockMultipleBets,
  lockAllMatchOdds,
  lockAllOtherMarkets,
  unlockAllBets,
  lockMatchForUser,
  unlockMatchForUser,
  getMatchLocks,
  getMarketLockChildren,
  toggleMarketLock,
  bulkToggleMarketLock,
} from "../../controller/admin/betLockController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ===========================
 *  BET LOCK ROUTES (Admin)
 * ===========================
 */

// Global bet lock
router.get("/betlock/", authMiddleware, getAllBetLocks);
router.get("/betlock/:user_id", getBetLock);
router.post("/betlock/lock/user", lockBet);
router.post("/betlock/unlock/user", unlockBet);
router.post("/betlock/lock/multiple", lockMultipleBets);
router.post("/betlock/unlock/multiple", unlockMultipleBets);
router.post("/betlock/lock/all/matchodds", lockAllMatchOdds);
router.post("/betlock/lock/all/othermarkets", lockAllOtherMarkets);
router.post("/betlock/unlock/all", unlockAllBets);

// Match-level locks
router.post("/betlock/lock/match", lockMatchForUser);
router.post("/betlock/unlock/match", unlockMatchForUser);
router.get("/betlock/match/:event_id", getMatchLocks);

// Market-wise locks (event + market)
// Query params: ?market_id=xxx or ?market_name=xxx
router.get("/betlock/market-locks/:event_id", authMiddleware, getMarketLockChildren);
router.post("/betlock/toggle-market-lock", authMiddleware, toggleMarketLock);
router.post("/betlock/bulk-toggle-market-lock", authMiddleware, bulkToggleMarketLock);

export default router;
