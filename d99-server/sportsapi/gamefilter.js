


import SportsConfig from '../model/user/SportsConfig.js';

export const filterEnabledGames = async (games) => {
  try {
    // Fetch enabled games from the database using Sequelize
    const enabledGames = await SportsConfig.findAll({
      where: { enabled: true },
      attributes: ['game_id']
    });

    const enabledGameIds = enabledGames.map(g => g.game_id.toString());
    console.log('Enabled Game IDs:', enabledGameIds);

    // Filter games
    const filteredGames = games.filter(game => {
      const gameId = game.id.toString();
      const isEnabled = enabledGameIds.includes(gameId);

      console.log('Game Details:', {
        id: game.id,
        name: game.name,
        gameIdType: typeof game.id,
        isEnabled
      });

      return isEnabled;
    });

    console.log('Filtered Games Full Details:', filteredGames);
    return filteredGames;

  } catch (error) {
    console.error('Game filtering error:', error);
    throw new Error('Error filtering games');
  }
};
