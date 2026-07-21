// models/SportsConfig.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/db.js'; 

class SportsConfig extends Model {}

SportsConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    game_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'SportsConfig',
    tableName: 'sports_config',
    timestamps: false, // because you have custom created_at and updated_at
  }
);

export default SportsConfig;
