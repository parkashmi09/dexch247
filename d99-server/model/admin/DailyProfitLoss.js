// models/DailyProfitLoss.js
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Wallet from '../../model/admin/Wallet.js';

const DailyProfitLoss = sequelize.define(
  'DailyProfitLoss',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,          // YYYY‑MM‑DD
      allowNull: false,
    },
    profit_loss: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    verdict: {
      type: DataTypes.ENUM('profit', 'loss'),
      allowNull: false,
      defaultValue: 'profit',
    },

    // ----- reference to wallet ------------------------------------------------
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ----- copied for fast reporting -----------------------------------------
    user_type: {
      type: DataTypes.ENUM(
        'OWNER',
        'COMPANY',
        'SUPERADMIN',
        'ADMIN',
        'SUPERMASTER',
        'MASTER',
        'USER'
      ),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'daily_profit_loss',
    timestamps: true,
    indexes: [
      { fields: ['date'] },
      { fields: ['wallet_id'] },
      { fields: ['user_type'] },
      // unique per wallet per day
      { unique: true, fields: ['wallet_id', 'date'] },
    ],
  }
);

// Associations
DailyProfitLoss.belongsTo(Wallet, { foreignKey: 'wallet_id' });
Wallet.hasMany(DailyProfitLoss, { foreignKey: 'wallet_id' });

export default DailyProfitLoss;