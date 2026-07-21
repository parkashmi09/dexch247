import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const SportsBet = sequelize.define(
  "SportsBet",
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
    game_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    match_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    team_one: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    team_two: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    selection_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bet_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    market_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null, // or "Over By Over" if you want
    },
    odds: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    stake_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    original_currency: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "INR",
    },
    original_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    usd_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    liability: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    match_start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    match_end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    match_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    exposure_after_bet: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    eventid: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fancy_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    result_status: {
      type: DataTypes.TEXT,
      defaultValue: "pending",
    },
    fixed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    counts: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    },
    sport_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unmatched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    unmatched_odds: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    runners: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  },
  {
    tableName: "SportsBet",
    timestamps: false,
  }
);
export default SportsBet;
