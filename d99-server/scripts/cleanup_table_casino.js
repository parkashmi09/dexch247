
import sequelize from '../config/db.js';
import TableCasino from '../model/admin/TableCasino.js';
import { Op } from 'sequelize';

const cleanupTableCasino = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Count records to be deleted
    const count = await TableCasino.count({
      where: {
        tableid: {
          [Op.is]: null
        }
      }
    });

    console.log(`Found ${count} records with null tableid.`);

    if (count > 0) {
      const deleted = await TableCasino.destroy({
        where: {
          tableid: {
            [Op.is]: null
          }
        }
      });
      console.log(`Successfully deleted ${deleted} records.`);
    } else {
      console.log('No records to delete.');
    }

    // Verify
    const remaining = await TableCasino.count();
    console.log(`Total remaining records: ${remaining}`);

    // Check fixed tables
    const fixedCount = await TableCasino.count({
        where: {
            tableid: {
                [Op.not]: null
            }
        }
    });
    console.log(`Records with valid tableid: ${fixedCount}`);


  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await sequelize.close();
  }
};

cleanupTableCasino();
