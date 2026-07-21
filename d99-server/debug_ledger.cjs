const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '/var/www/main/CFZ-d99/d99-server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: console.log,
  }
);

const CreditsLedger = sequelize.define(
  "CreditsLedger",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id:      { type: DataTypes.TEXT, allowNull: false },
    currency:     { type: DataTypes.TEXT, allowNull: true, defaultValue: "INR" },
    amount:       { type: DataTypes.DECIMAL, allowNull: false },
    reason:       { type: DataTypes.TEXT, allowNull: false },
    description:  { type: DataTypes.TEXT, allowNull: true },
    eventid:      { type: DataTypes.TEXT, allowNull: true },
    job_id:       { type: DataTypes.UUID, allowNull: true },
    match_id:     { type: DataTypes.TEXT, allowNull: true },
    meta:         { type: DataTypes.JSONB, allowNull: true },
    market_type:  { type: DataTypes.TEXT, allowNull: true },
    sport_id:     { type: DataTypes.TEXT, allowNull: true },
    commission: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true,
    },
    finalAmount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "credits_ledger",
    timestamps: false,
  }
);

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Fetch all columns to see what's actually there
    const rows = await CreditsLedger.findAll({
      where: { user_id: '1' },
      limit: 5,
      raw: true
    });

    console.log('Found rows:', rows);
    
    if (rows.length > 0) {
        console.log('Keys in first row:', Object.keys(rows[0]));
    } else {
        console.log('No rows found for user_id "1". Trying integer 1...');
        const rowsInt = await CreditsLedger.findAll({
            where: { user_id: 1 },
            limit: 5,
            raw: true
        });
        console.log('Found rows with int:', rowsInt);
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

test();
