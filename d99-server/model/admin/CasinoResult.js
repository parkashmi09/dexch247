import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const CasinoResult = sequelize.define(
  "CasinoResult",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    gamename: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    mid: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    win: {
      type: DataTypes.STRING(50),
      allowNull: false,

    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "casinoresult",

    // Adds created_at and updated_at
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    // Optional but recommended
    indexes: [
      {
        fields: ["mid"],
      },
      {
        fields: ["gamename"],
      },
      {
        unique: true,
        fields: ["gamename", "mid"],
      },
    ],
  }
);

export default CasinoResult;
