import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Staff from './Staff.js';
import Owner from './Owner.js';

const StaffSportsLock = sequelize.define('StaffSportsLock', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Staff,
      key: 'staff_id'
    },
    onDelete: 'CASCADE'
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Owner,
      key: 'owner_id'
    },
    onDelete: 'CASCADE'
  },
  // Dynamic String IDs for Sports Hierarchy
  // "4", "4-0", "1.12345678", "1.12345678-0"
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
  tableName: 'staff_sports_lock',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
       name: 'staff_sports_lock_unique_idx',
       unique: true,
       fields: ['staff_id', 'owner_id', 'sport_id', 'series_id', 'match_id', 'market_id']
    }
  ]
});

// Associations
Staff.hasMany(StaffSportsLock, { foreignKey: 'staff_id' });
StaffSportsLock.belongsTo(Staff, { foreignKey: 'staff_id' });

Owner.hasMany(StaffSportsLock, { foreignKey: 'owner_id' });
StaffSportsLock.belongsTo(Owner, { foreignKey: 'owner_id' });

export default StaffSportsLock;
