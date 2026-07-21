
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const UserMatchLocks = sequelize.define(
  "UserMatchLocks",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    event_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "user_match_locks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "event_id"],
      },
    ],
  }
);

export default UserMatchLocks;
