// platformGamesController.js
import PlatformGames from "../../model/admin/PlatformGames.js";
import GamesMarkets from "../../model/admin/GamesMarkets.js";
import sequelize from "../../config/db.js";

export const syncPlatformGames = async (req, res) => {
  try {
    await PlatformGames.syncFixedData();
    return res.json({ message: "Platform games synced successfully." });
  } catch (error) {
    console.error("Error syncing platform games:", error);
    return res.status(500).json({ 
      error: "Failed to sync platform games.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

import StaffMarketLocks from "../../model/admin/StaffMarketLocks.js";

export const getAllPlatformGames = async (req, res) => {
  try {
    const staffId = req.user?.role === 'OWNER' ? null : req.user.account.id;

    // 1. Fetch all games
    const games = await PlatformGames.findAll();

    // 2. Fetch locks for this staff
    const locks = await StaffMarketLocks.findAll({
      where: { staff_id: staffId }
    });

    // 3. Map locks by game_id
    const locksByGame = {};
    locks.forEach(lock => {
      if (!locksByGame[lock.game_id]) locksByGame[lock.game_id] = {};
      if (lock.is_locked) {
        locksByGame[lock.game_id][lock.market_name] = true;
      }
    });

    // 4. Transform to frontend format
    const formattedGames = games.map(game => {
      const g = game.toJSON();
      // Construct the "GamesMarket" object from locks
      g.GamesMarket = locksByGame[g.id] || {};
      
      // Ensure "ALL" is set if present
      if (g.GamesMarket['ALL']) g.GamesMarket.ALL = true;

      return g;
    });

    return res.json({ success: true, data: formattedGames });
  } catch (error) {
    console.error("Error fetching platform games:", error);
    return res.status(500).json({ 
      error: "Failed to fetch platform games.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createPlatformGame = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id, name } = req.body;

    // Validate input
    if (!id || !name) {
      return res.status(400).json({ 
        error: "Validation failed.",
        details: "Both 'id' and 'name' are required." 
      });
    }

    // Check if game already exists
    const existingGame = await PlatformGames.findByPk(id, { transaction });
    if (existingGame) {
      await transaction.rollback();
      return res.status(409).json({ 
        error: "Game already exists.",
        game: existingGame 
      });
    }

    // Create game
    const game = await PlatformGames.create(
      { id, name },
      { transaction }
    );

    // No need to create default markets in new structure (empty = unlocked)

    await transaction.commit();
    
    return res.status(201).json({ 
      success: true,
      message: "Game created successfully.", 
      game 
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating platform game:", error);
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: "A game with this name already exists." 
      });
    }
    
    return res.status(500).json({ 
      error: "Failed to create platform game.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateGameMarkets = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { game_id, sport_id, markets } = req.body;
    const staffId = req.user?.role === 'OWNER' ? null : req.user.account.id;

    console.log(`updateGameMarkets called with:`, JSON.stringify(req.body));

    // Determine target Game ID
    let targetGameId = game_id;
    if (!targetGameId && sport_id) {
      targetGameId = sport_id; // Since we synced ID = sport_id
    }

    // Validate input
    if (!targetGameId) {
      return res.status(400).json({ 
        error: "Validation failed.",
        details: "'game_id' or 'sport_id' is required." 
      });
    }

    if (!markets || typeof markets !== 'object' || Object.keys(markets).length === 0) {
      return res.status(400).json({ 
        error: "Validation failed.",
        details: "'markets' must be a non-empty object." 
      });
    }

    // Check if game exists
    const game = await PlatformGames.findByPk(targetGameId);
    if (!game) {
      // Try finding by sport_id if PK lookup failed (just in case)
      const gameBySport = await PlatformGames.findOne({ where: { sport_id: String(targetGameId) } });
      if (!gameBySport) {
        return res.status(404).json({ 
          error: "Game not found.",
          details: `No game found with id/sport_id: ${targetGameId}` 
        });
      }
      targetGameId = gameBySport.id;
    }

    // Use targetGameId for locks
    const finalGameId = targetGameId;


    // Process each market key
    for (const [marketName, isLocked] of Object.entries(markets)) {
      if (isLocked === true) {
        // Upsert lock
        await StaffMarketLocks.upsert({
          staff_id: staffId,
          game_id: finalGameId,
          market_name: marketName,
          is_locked: true
        }, { transaction });
      } else {
        // Remove lock (unlock)
        await StaffMarketLocks.destroy({
          where: {
            staff_id: staffId,
            game_id: finalGameId,
            market_name: marketName
          },
          transaction
        });
      }
    }

    await transaction.commit();

    return res.json({ 
      success: true,
      message: "Game markets updated successfully."
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating markets:", error);
    return res.status(500).json({ 
      error: "Failed to update markets.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};