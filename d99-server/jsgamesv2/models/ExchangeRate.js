import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ExchangeRate = sequelize.define('ExchangeRate', {
  currency: {
    type: DataTypes.STRING(10),
    primaryKey: true,
  },
  usd_rate: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: true,
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'exchangerate',
  timestamps: false,
});

export default ExchangeRate;
