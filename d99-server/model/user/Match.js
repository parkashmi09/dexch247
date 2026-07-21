import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    match_id: {
      type: DataTypes.BIGINT, // Changed from STRING to BIGINT
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    }
  }, {
    tableName: 'matches',
    timestamps: true
  });

export default Match; 