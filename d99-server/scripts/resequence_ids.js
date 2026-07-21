
import TableCasino from '../model/admin/TableCasino.js';
import sequelize from '../config/db.js';

async function resequenceIds() {
  const transaction = await sequelize.transaction();
  try {
    // 1. Fetch all existing records ordered by current ID
    const tables = await TableCasino.findAll({ 
      order: [['id', 'ASC']],
      transaction 
    });

    if (tables.length === 0) {
      console.log('No tables found to resequence.');
      await transaction.rollback();
      return;
    }

    console.log(`Found ${tables.length} tables. Resequencing...`);

    // 2. Clear the table (TRUNCATE). 
    // Since there are no dependencies (checked previously), this is safe.
    // However, destroying and re-creating is safer to avoid ID conflicts during update.
    // But truncate resets auto-increment, which is what we want.
    // We need to disable foreign key checks temporarily just in case, or rely on our check.
    
    // Using raw query to force CASCADE
    await sequelize.query('TRUNCATE TABLE "table_casino" RESTART IDENTITY CASCADE;', { transaction });

    // 3. Re-insert records with new IDs
    // We utilize bulkCreate. We don't specify ID so it auto-increments from 1.
    const recordsToInsert = tables.map(t => ({
      tablename: t.tablename,
      tableid: t.tableid,
      // Add other fields if necessary, but define showed only these.
      // Timestamps will be newly generated or we can preserve them if we map them.
      createdAt: t.createdAt,
      updatedAt: new Date()
    }));

    await TableCasino.bulkCreate(recordsToInsert, { transaction });

    await transaction.commit();
    console.log('Resequencing complete.');

  } catch (error) {
    await transaction.rollback();
    console.error('Error resequencing IDs:', error);
  }
}

resequenceIds();
