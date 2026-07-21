
import express from "express";
import {
  syncPlatformGames,
  getAllPlatformGames,
  createPlatformGame,
  updateGameMarkets,
} from "../../controller/admin/platformGamesController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/platform/game/sync", authMiddleware, syncPlatformGames);
router.get("/platform/game-all", (req, res, next) => {
  console.log("GET /platform/game-all hit");
  next();
}, authMiddleware, getAllPlatformGames);
router.post("/platform/game/create", authMiddleware, createPlatformGame);
router.put("/platform/game/update-markets", authMiddleware, updateGameMarkets);

export default router;
