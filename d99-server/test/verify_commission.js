
import { Sequelize, DataTypes, Op } from 'sequelize';
import sequelize from './config/db.js';
import User from './model/user/User.js';
import Staff from './model/admin/Staff.js';
import CreditsLedger from './model/user/CreditsLedger.js';

const verifyData = async () => {
  try {
    console.log('--- Verifying Hierarchy Data ---');

    // 1. Find all Staff who are NOT Company (likely SuperMaster/Master/Agent)
    const staffMembers = await Staff.findAll({
      attributes: ['staff_id', 'username', 'role', 'parent_id'],
      raw: true
    });
    console.log(`Found ${staffMembers.length} staff members.`);
    
    // Build hierarchy map
    const staffMap = {};
    staffMembers.forEach(s => staffMap[s.staff_id] = s);

    // 2. Find users who have a parent_staff_id that is NOT the Company (assuming Company is ID 1)
    // We'll just list some users and their parents
    const users = await User.findAll({
      limit: 20,
      attributes: ['user_id', 'username', 'parent_staff_id'],
      raw: true
    });

    console.log('--- Sample Users and Parents ---');
    for (const user of users) {
      const parent = staffMap[user.parent_staff_id];
      console.log(`User: ${user.username} (ID: ${user.user_id}) -> Parent: ${parent ? `${parent.username} (${parent.role})` : 'None'} (ID: ${user.parent_staff_id})`);
      
      // Check commission for this user
      const commission = await CreditsLedger.sum('commission', {
        where: { user_id: String(user.user_id) }
      });
      console.log(`   Total Commission: ${commission || 0}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

verifyData();
