
import PlatformGames from './model/admin/PlatformGames.js';
import sequelize from './config/db.js';

const syncGames = async () => {
  try {
    console.log('Syncing PlatformGames data...');
    await PlatformGames.syncFixedData();
    
    // Explicitly update sport_id for existing records because findOrCreate defaults only work on creation
    for (const game of PlatformGames.FIXED_GAMES) {
      await PlatformGames.update({ sport_id: game.sport_id }, { where: { id: game.id } });
    }
    
    console.log('PlatformGames synced successfully.');
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    await sequelize.close();
  }
};

syncGames();
