import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const CasinoBet = sequelize.define(
  "CasinoBet",
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

    player_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    odds: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    stake: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    selection: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    exposer: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },

    libality: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },

    game_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    type: { 
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    mtype:{
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "pending",
    },

    event_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    round_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    job_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    result_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    credit_amt: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },

    ip_address: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },

    browser: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    processing_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "casino_bets",
    timestamps: false,
    indexes: [
      {
        name: "casino_bets_pkey",
        unique: true,
        fields: ["id"],
      },
    ],
  }
);

export default CasinoBet;
