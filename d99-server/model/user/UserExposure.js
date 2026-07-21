
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const UserExposure = sequelize.define(
  "UserExposure",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    match_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    team_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exposure_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    match_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    game_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: true, // or false if DB has NOT NULL
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_exposures",
    timestamps: false, // we manually manage timestamps
    indexes: [
      {
        unique: true,
        fields: ["user_id", "match_id", "team_name", "game_type"],
      },
    ],
  }
);

export default UserExposure;


