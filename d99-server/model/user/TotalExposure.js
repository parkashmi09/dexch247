import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const TotalExposure = sequelize.define(
  "TotalExposure",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true   // 🔥 REQUIRED for upsert
    },
    total_exposure: {
      type: DataTypes.DECIMAL(15, 2), // ✅ money-safe
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: "total_exposures",
    timestamps: true
  }
);

export default TotalExposure;
