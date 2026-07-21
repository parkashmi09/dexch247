// models/SportsEventResultSummary.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; 

const SportsEventResultSummary = sequelize.define(
  "SportsEventResultSummary",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    eventid: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    result_meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    sections: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sports_event_result_summary",
    timestamps: false, // no createdAt/updatedAt
  }
);

export default SportsEventResultSummary;
