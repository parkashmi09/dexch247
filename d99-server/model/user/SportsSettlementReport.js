// model/admin/SportsSettlementReport.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; // your Sequelize instance

const SportsSettlementReport = sequelize.define(
  "SportsSettlementReport",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true, // uses nextval('sports_settlement_report_id_seq') in Postgres
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    bet_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true, // UNIQUE constraint
    },
    user_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    eventid: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    match_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    game_type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    market_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fancy_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    selection_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_selection_yn: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolved_winner: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolved_team: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actual_numeric: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    rule_op: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rule_threshold: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    credit_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    exposures_map: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    api_snapshot: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    decision_path: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sports_settlement_report",
    timestamps: false, // created_at handled manually
  }
);

export default SportsSettlementReport;
