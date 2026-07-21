
import sequelize from './config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    await sequelize.query('ALTER TABLE staff_table_locks ALTER COLUMN staff_id DROP NOT NULL;');
    console.log('Migration successful.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

migrate();
