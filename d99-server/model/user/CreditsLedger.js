import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const CreditsLedger = sequelize.define(
  "CreditsLedger",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bet_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "Related bet ID for this ledger entry",
    },

    currency: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "INR",
    },

    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: "Raw transaction amount (+win / -loss)",
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    eventid: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    job_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    match_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    market_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sport_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    commission: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment:
        "2% platform fee deducted from winning amount (NULL for losses / non-win)",
    },

    netamount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment:
        "Amount credited after commission (amount - commission). NULL for non-win",
    },

    profit: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: "Winning amount (only for wins)",
    },

    loss: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: "Loss amount (only for losses)",
    },
    closing: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      comment: "Closing amount (only for current user proffit ratio)",
    },
    category: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "SPORTS or CASINO - identifies settlement source",
    },
    balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "User wallet balance after this ledger entry",
    },


    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "credits_ledger",
    timestamps: false,
    indexes: [
      { name: "credits_ledger_user_id_idx", fields: ["user_id"] },
      { name: "credits_ledger_eventid_idx", fields: ["eventid"] },
      { name: "credits_ledger_created_at_idx", fields: ["created_at"] },
    ],
  }
);

export default CreditsLedger;
