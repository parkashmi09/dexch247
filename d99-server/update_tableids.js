import sequelize from './config/db.js';

const updateTableIds = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const [results, metadata] = await sequelize.query("UPDATE table_casino SET tableid = id::text");
    console.log(`Updated ${metadata.rowCount} rows.`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating tableids:', error);
    process.exit(1);
  }
};

updateTableIds();
