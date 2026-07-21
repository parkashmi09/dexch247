// models/SportsBetResultCache.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; 

const SportsBetResultCache = sequelize.define(
  "SportsBetResultCache",
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
    match_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
    },
    bucket: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true,
    },
    declared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_match_over: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    winner_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    winner_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    market_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    market_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    provider: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    betting_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    declared_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    api_snapshot: {
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
    tableName: "sports_bet_result_cache",
    timestamps: false, // no auto createdAt/updatedAt
    indexes: [
      {
        unique: true,
        fields: ["user_id", "eventid", "match_id", "bucket"], // composite PK
      },
      {
        fields: ["declared"],
      },
      {
        fields: ["is_match_over"],
      },
    ],
  }
);

export default SportsBetResultCache;
