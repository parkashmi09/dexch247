import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const FanWin = sequelize.define(
  "FanWin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id", // maps correctly to DB
    },
    fancyname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    selection: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
   runsodds: {
  type: DataTypes.DECIMAL(10, 4), // allows 1.4600
  allowNull: false,
},
    payout: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    eventid: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    matchid: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "fanwins",
    schema: "public",
    timestamps: false, 
  }
);

export default FanWin;
