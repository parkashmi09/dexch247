import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const UserEventMarketLocks = sequelize.define(
  "UserEventMarketLocks",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "staff_id or user_id",
    },
    account_type: {
      type: DataTypes.ENUM("staff", "user"),
      allowNull: false,
    },
    event_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    market_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Primary identifier for the market (mid)",
    },
    market_name: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Fallback: e.g. MATCH_ODDS, bookmaker, Normal, fancy1, etc.",
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    locked_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "staff_id or owner_id who locked",
    },
  },
  {
    tableName: "user_event_market_locks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        name: "uq_event_market_lock",
        fields: ["account_id", "account_type", "event_id", "market_id"],
      },
    ],
  }
);

export default UserEventMarketLocks;
