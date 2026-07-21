// models/GameSession.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const GameSession = sequelize.define('GameSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  game_uid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  session_token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  launch_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  entry_balance: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  },
  exit_balance: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  },
  game_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'game_sessions'
});

export default GameSession;
