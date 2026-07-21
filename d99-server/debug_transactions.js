
import Transaction from './model/admin/Transaction.js';
import sequelize from './config/db.js';

async function checkTransactions() {
  try {
    const transactions = await Transaction.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      raw: true
    });
    console.log(JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkTransactions();
