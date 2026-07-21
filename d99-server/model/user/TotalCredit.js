
import { DataTypes } from "sequelize"
import sequelize from '../../config/db.js'; 

const TotalCredit = sequelize.define(
  "TotalCredit",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users", 
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    total_credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      comment: "Tracks total credited amount for the user",
    },
  },
  {
    tableName: "total_credits",
    timestamps: true, // ✅ automatically adds createdAt & updatedAt
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["user_id"] }],
  }
)

export default TotalCredit
