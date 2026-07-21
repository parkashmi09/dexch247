// models/SportsEventSettlementJob.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; 

const SportsEventSettlementJob = sequelize.define(
  "SportsEventSettlementJob",
  {
    job_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    eventid: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "queued",
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    run_after: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    error_msg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    bet_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bet_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "sports_event_settlement_jobs",
    timestamps: false,
    indexes: [
      {
        // this MUST match your conflictFields and be unique
        unique: true,
        fields: ["user_id", "eventid", "bet_id"],
        name: "uniq_user_event_bet",
      },
      {
        fields: ["status"],
      },
    ],
  }
);


export default SportsEventSettlementJob;
