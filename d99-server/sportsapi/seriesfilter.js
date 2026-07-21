
//====================


import SportsConfig from '../model/user/SportsConfig.js'; // adjust path if needed

export const filterSeriesData = async (seriesData, gameId) => {
  try {
    // Convert gameId to string for consistent comparison
    const gameIdStr = gameId.toString();

    // Check if the game is enabled using Sequelize
    const gameConfig = await SportsConfig.findOne({
      where: { game_id: gameIdStr, enabled: true },
    });

    if (!gameConfig) {
      console.log(`Game ID ${gameIdStr} is not enabled or not found`);
      return "Game not found or not enabled for you";
    }

    // Return the original series data if enabled
    return seriesData;
  } catch (error) {
    console.error('Series filtering error:', error);
    throw new Error('Error filtering series data');
  }
};
