
import sequelize from './config/db.js';

const inspect = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    const [transactions] = await sequelize.query("SELECT column_name, data_type, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_name = 'transactions' AND column_name IN ('amount', 'balance', 'previous_balance', 'new_balance');");
    console.log('Transactions Table:', transactions);
    const [userTransactions] = await sequelize.query("SELECT column_name, data_type, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_name = 'user_transactions' AND column_name = 'pts';");
    console.log('User Transactions Table:', userTransactions);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

inspect();
