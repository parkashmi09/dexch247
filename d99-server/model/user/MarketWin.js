
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; 

const MarketWin = sequelize.define(
  "MarketWin",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    totalbets: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    matchid: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    eventid: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    team1ex: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    team2ex: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    drawex: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    winteam: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    matchname: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    payout: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
       created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
 {
  tableName: "marketwins",
  schema: "public",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
}
);

export default MarketWin;
