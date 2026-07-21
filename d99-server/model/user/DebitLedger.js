
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const DebitLedger = sequelize.define(
  "DebitLedger",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.TEXT, allowNull: false },
    currency: { type: DataTypes.TEXT, allowNull: true, defaultValue: "INR" },
    amount: { type: DataTypes.DECIMAL, allowNull: false },          // raw win amount
    reason: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    event_id: { type: DataTypes.TEXT, allowNull: true },
    job_id: { type: DataTypes.UUID, allowNull: true },
    match_id: { type: DataTypes.TEXT, allowNull: true },
    meta: { type: DataTypes.JSONB, allowNull: true },
    balance: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    market_type: { type: DataTypes.TEXT, allowNull: true },
    sport_id: { type: DataTypes.TEXT, allowNull: true },


    commission: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: '2% platform fee deducted from the winning amount (null for losses / non-win entries)',
    },
    finalAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: 'amount credited to user after commission (amount - commission). Null for non-winning rows.',
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "debit_ledger",
    timestamps: false,
    indexes: [
      { name: "debit_ledger_user_id_idx", fields: ["user_id"] },
      { name: "debit_ledger_event_id_idx", fields: ["event_id"] },
      { name: "debit_ledger_created_at_idx", fields: ["created_at"] },
    ],
  }
);

export default DebitLedger;
