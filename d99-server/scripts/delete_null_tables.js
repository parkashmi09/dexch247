
import TableCasino from '../model/admin/TableCasino.js';
import { Op } from 'sequelize';

async function deleteNullTables() {
  try {
    const deletedCount = await TableCasino.destroy({
      where: {
        tableid: {
          [Op.is]: null
        }
      }
    });
    console.log(`Deleted ${deletedCount} rows where tableid was NULL.`);
  } catch (error) {
    console.error('Error deleting rows:', error);
  }
}

deleteNullTables();
