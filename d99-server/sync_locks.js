
import sequelize from './config/db.js';
import UserMatchLocks from './model/admin/UserMatchLocks.js';

const sync = async () => {
  try {
    await UserMatchLocks.sync({ alter: true });
    console.log("UserMatchLocks synced successfully");
  } catch (error) {
    console.error("Error syncing UserMatchLocks:", error);
  } finally {
    await sequelize.close();
  }
};

sync();
