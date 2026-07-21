// model/associations.js

import User from "./user/User.js";
import BetLock from "./admin/BetLock.js";
import Wallet from "./admin/Wallet.js";

// -----------------------------
// User → BetLock (1:1 Relationship)
// -----------------------------

User.hasOne(BetLock, {
  foreignKey: "user_id",
  as: "betlock",
  onDelete: "CASCADE",
});

BetLock.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Wallet.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  constraints: false,
});

import SportsBet from "./user/SportsBet.js";

SportsBet.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

import StaffTableLock from "./admin/StaffTableLock.js";
import TableCasino from "./admin/TableCasino.js";
import Staff from "./admin/Staff.js";

// Staff Table Locks
Staff.hasMany(StaffTableLock, { foreignKey: 'staff_id', as: 'tableLocks' });
StaffTableLock.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

TableCasino.hasMany(StaffTableLock, { foreignKey: 'table_casino_id', as: 'staffLocks' });
StaffTableLock.belongsTo(TableCasino, { foreignKey: 'table_casino_id', as: 'tableCasino' });

import Owner from "./admin/Owner.js";
Owner.hasMany(StaffTableLock, { foreignKey: 'owner_id', as: 'tableLocks' });
StaffTableLock.belongsTo(Owner, { foreignKey: 'owner_id', as: 'owner' });

import UserTableLock from "./admin/UserTableLock.js";
// User Table Locks
User.hasMany(UserTableLock, { foreignKey: 'user_id', as: 'tableLocks' });
UserTableLock.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

TableCasino.hasMany(UserTableLock, { foreignKey: 'table_casino_id', as: 'userLocks' });
UserTableLock.belongsTo(TableCasino, { foreignKey: 'table_casino_id', as: 'tableCasino' });

// ⚠️ IMPORTANT: Do NOT use afterCreate hook here
// The hook causes FK constraint violations because it runs OUTSIDE the transaction
// Instead, create BetLock explicitly within transactions in controllers

export default function setupAssociations() {
  console.log('✅ Associations setup complete');
  return true;
}
