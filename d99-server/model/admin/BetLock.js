import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const BetLock = sequelize.define(
  "BetLock",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true, // ✅ Ensure no duplicate user_ids
    },

    MatchOdds: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    OtherMarkets: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "betlocks",

    // Adds created_at and updated_at
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default BetLock;
