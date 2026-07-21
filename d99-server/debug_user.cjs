const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '/var/www/html/d99/d247-server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

async function test() {
  try {
    await sequelize.authenticate();
    const user = await User.findByPk(1);
    console.log('User 1:', user ? user.toJSON() : 'Not found');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

test();
