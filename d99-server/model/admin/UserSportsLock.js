import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const UserSportsLock = sequelize.define('UserSportsLock', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  // Dynamic String IDs
  sport_id: {
     type: DataTypes.STRING,
     allowNull: false
  },
  series_id: {
      type: DataTypes.STRING,
      allowNull: true
  },
  match_id: {
      type: DataTypes.STRING,
      allowNull: true
  },
  market_id: {
      type: DataTypes.STRING,
      allowNull: true
  },
  lock_type: {
      type: DataTypes.STRING,
      allowNull: true
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'user_sports_lock',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
       name: 'user_sports_lock_unique_idx',
       unique: true,
       fields: ['user_id', 'sport_id', 'series_id', 'match_id', 'market_id']
    }
  ]
});

export default UserSportsLock;
