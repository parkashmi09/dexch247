import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import User from './User.js';

const UserTransaction = sequelize.define('user_transaction', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
  },
  transaction_type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false,
  },
  pts: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  action_by: {
    type: DataTypes.INTEGER, // agent id or owner id
    allowNull: true,
  },
}, {
  tableName: 'user_transactions',
  timestamps: false,
});


UserTransaction.belongsTo(User, {
  foreignKey: 'user_id',
  targetKey: 'user_id',
  onDelete: 'CASCADE',
});

export default UserTransaction; 