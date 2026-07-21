import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const DeactivatedMatch = sequelize.define(
  "DeactivatedMatch",
  {
    eventid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    match_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sport_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "INACTIVE", // "INACTIVE" = Deactivated, "ACTIVE" = Activated
      allowNull: false,
    },
  },
  {
    tableName: "deactivated_matches",
    timestamps: false,
  }
);

export default DeactivatedMatch;
