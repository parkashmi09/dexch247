import sequelize from './config/db.js';
import Wallet from './model/admin/Wallet.js';

const checkWallet = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const wallet = await Wallet.findOne({
      where: {
        user_id: 1
      }
    });

    if (wallet) {
      console.log('Wallet found:', JSON.stringify(wallet.toJSON(), null, 2));
    } else {
      console.log('Wallet not found for user_id 1');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
};

checkWallet();
