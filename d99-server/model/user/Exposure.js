import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Exposure = sequelize.define('Exposure', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    match_id: {
      type: DataTypes.BIGINT, // Changed from STRING to BIGINT
      allowNull: false
    },
    match_exposure: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    profit_if_win: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    loss_if_lose: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }
  }, {
    tableName: 'exposures',
    timestamps: true
  });

export default Exposure;
