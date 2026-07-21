
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Always load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });



const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // set to true for SQL logs
    pool: {
      max: 10,        // max connections in pool
      min: 2,         // min connections kept open
      acquire: 30000, // max ms to wait for a connection before throwing error
      idle: 10000,    // max ms a connection can be idle before being released
      evict: 1000,    // how often to check for idle connections (ms)
    },
  }
);

export default sequelize;
