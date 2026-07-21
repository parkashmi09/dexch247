import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const PrioritizedGame = sequelize.define('PrioritizedGame', {
  vendor: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  game_ids: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'prioritized_games',
  timestamps: false,
});

export default PrioritizedGame;
