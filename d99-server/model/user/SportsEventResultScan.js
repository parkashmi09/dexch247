// models/SportsEventResultScan.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; 

const SportsEventResultScan = sequelize.define(
  "SportsEventResultScan",
  {
    user_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
    },
    eventid: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
    },
    declared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    counts: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    checked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sports_event_result_scan", // 👈 your table
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "eventid"],
      },
    ],
  }
);

export default SportsEventResultScan;
