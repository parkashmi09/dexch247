import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const JSGame = sequelize.define('JSGame', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  game_uid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  game_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vendor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  game_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  game_icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'js_games',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default JSGame;
