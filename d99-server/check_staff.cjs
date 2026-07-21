
const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function checkStaff() {
    try {
        const [userResults] = await sequelize.query("SELECT * FROM users WHERE user_id = 1");
        console.log("User 1:", userResults[0]);

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

checkStaff();
