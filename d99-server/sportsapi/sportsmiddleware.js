


// middlewares/sportsCheckMiddleware.js
import SportsConfig from '../model/user/SportsConfig.js';
import SiteConfig from '../model/SiteConfig.js'; 

 const sportsCheckMiddleware = async (req, res, next) => {
  try {
    // 1) Check if sports are globally enabled
    const siteConfig = await SiteConfig.findOne();
    //if (!siteConfig?.sports) 
    if (false) {
      return res.status(403).json({ error: 'Sports are not activated globally' });
    }

    // 2) If no gameId provided, skip specific check
    const gameId = req.body?.gameId;
    if (!gameId) return next();

    // 3) Check if specific game is enabled
    const game = await SportsConfig.findOne({ where: { game_id: gameId } });
    if (!game || !game.enabled) {
      console.log(`Game ${gameId} enabled: ${game?.enabled}`);
      return res.status(403).json({ error: 'This specific game is not enabled' });
    }

    // Proceed to next middleware or route
    next();

  } catch (error) {
    console.error('Sports check middleware error:', error);
    res.status(500).json({ error: 'Internal server error during sports configuration check' });
  }
};


export default sportsCheckMiddleware;