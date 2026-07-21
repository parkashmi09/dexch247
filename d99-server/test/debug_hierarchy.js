
import { Op, fn, col } from 'sequelize';
import sequelize from './config/db.js';
import User from './model/user/User.js';
import Staff from './model/admin/Staff.js';
import CreditsLedger from './model/user/CreditsLedger.js';

const debugHierarchy = async () => {
  try {
    console.log('--- Debugging Hierarchy ---');
    
    // 1. Fetch all Staff and Users
    const allStaff = await Staff.findAll({
      attributes: ['staff_id', 'username', 'role', 'parent_id', 'level'],
      raw: true
    });
    const allUsers = await User.findAll({
      attributes: ['user_id', 'username', 'parent_staff_id'],
      raw: true
    });

    console.log(`Total Staff: ${allStaff.length}`);
    console.log(`Total Users: ${allUsers.length}`);

    // Dump Staff Hierarchy
    console.log('\n--- Staff Hierarchy ---');
    allStaff.forEach(s => {
      console.log(`ID: ${s.staff_id}, User: ${s.username}, Role: ${s.role}, Parent: ${s.parent_id}`);
    });

    // Dump User Hierarchy
    console.log('\n--- User Hierarchy ---');
    allUsers.forEach(u => {
      console.log(`ID: ${u.user_id}, User: ${u.username}, Parent Staff: ${u.parent_staff_id}`);
    });

    // 2. Fetch all commissions
    const allCommissions = await CreditsLedger.findAll({
      attributes: [
        "user_id",
        [fn("COALESCE", fn("SUM", col("commission")), 0), "total_commission"],
      ],
      where: {
        commission: { [Op.ne]: null }
      },
      group: ["user_id"],
      raw: true,
    });

    console.log('\n--- Commissions ---');
    allCommissions.forEach(c => {
      console.log(`User ID: ${c.user_id}, Total Commission: ${c.total_commission}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

debugHierarchy();
