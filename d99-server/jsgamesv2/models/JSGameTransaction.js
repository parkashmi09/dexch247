import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const JSGameTransaction = sequelize.define('JSGameTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  game_uid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transaction_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transaction_status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'processed',
  },
  external_transaction_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serial_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  additional_data: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'js_game_transactions',
  timestamps: false,
});

export default JSGameTransaction;
