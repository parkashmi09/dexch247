
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import PlatformGames from "./PlatformGames.js";
import Staff from "./Staff.js";

const StaffMarketLocks = sequelize.define(
  "StaffMarketLocks",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = Owner/Global
      references: {
        model: Staff,
        key: "staff_id",
      },
      onDelete: "CASCADE",
    },
    game_id: {
      type: DataTypes.INTEGER, // PlatformGames uses INTEGER id
      allowNull: false,
      references: {
        model: PlatformGames,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    market_name: {
      type: DataTypes.STRING,
      allowNull: false,
      // e.g. "Match_Odds", "ALL", "TurboGrill_Studio"
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "staff_market_locks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["staff_id", "game_id", "market_name"],
      },
    ],
  }
);

// Associations
Staff.hasMany(StaffMarketLocks, { foreignKey: "staff_id" });
StaffMarketLocks.belongsTo(Staff, { foreignKey: "staff_id" });

PlatformGames.hasMany(StaffMarketLocks, { foreignKey: "game_id" });
StaffMarketLocks.belongsTo(PlatformGames, { foreignKey: "game_id" });

export default StaffMarketLocks;
