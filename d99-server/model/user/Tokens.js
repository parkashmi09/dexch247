// models/ApiToken.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Tokens = sequelize.define(
  "Tokens",
  {
    uid: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      primaryKey: true,
    },
    key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "tokens", // explicitly set table name
    timestamps: false,   // disable createdAt/updatedAt if not needed
  }
);

export default Tokens;
