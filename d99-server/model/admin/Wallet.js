


// models/Wallet.js
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Staff from './Staff.js';

// Hook: Auto-calculate profit_loss = inr_balance - cash_received
function calculateProfitLoss(instance) {
  const cashReceived = parseFloat(instance.getDataValue('cash_received')) || 0;
  const inrBalance   = parseFloat(instance.getDataValue('inr_balance')) || 0;

  const profitLoss = parseFloat((inrBalance - cashReceived).toFixed(2));
  const verdict    = profitLoss >= 0 ? 'profit' : 'loss';

  instance.setDataValue('profit_loss', profitLoss);
  instance.setDataValue('verdict',    verdict);
}

const Wallet = sequelize.define(
  'Wallet',
  {
    wallet_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Generic Reference Fields
    user_id:   { type: DataTypes.INTEGER, allowNull: true, comment: 'Reference for normal user wallet (end user)' },
    staff_id:  { type: DataTypes.INTEGER, allowNull: true, comment: 'Reference for staff wallet (admin/supermaster/master)' },
    owner_id:  { type: DataTypes.INTEGER, allowNull: true, comment: 'Reference for owner wallet (top-level company or super admin)' },

    // Wallet Classification
    user_type: {
      type: DataTypes.ENUM('OWNER','COMPANY','SUPERADMIN','ADMIN','SUPERMASTER','MASTER','USER'),
      allowNull: false,
    },

    // Wallet Info
    username: { type: DataTypes.STRING, allowNull: false, unique: true },

    // Core Financial Fields
    inr_balance: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0.0 },
    cash:        { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0.0 },
    cash_received:   { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0.0 },

    // Calculated Metrics
    profit_loss: { type: DataTypes.DECIMAL(18,2), allowNull: false, defaultValue: 0.0 },
    verdict:     { type: DataTypes.ENUM('profit','loss'), allowNull: false, defaultValue: 'profit' },

    // NEW – total commission the user has **received** (cumulative)
    totalCommission: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: false,
      defaultValue: 0.0,
      comment: 'Cumulative platform-fee commission earned by this wallet',
    },
  },
  {
    tableName: 'Wallets',
    timestamps: true,
    hooks: {
      beforeCreate: calculateProfitLoss,
      beforeUpdate: calculateProfitLoss,
    },
  }
);

Wallet.belongsTo(Staff, {
  foreignKey: 'staff_id',
  as: 'staff',
  constraints: false,
});


export default Wallet;