
import { Sequelize, DataTypes, Op, fn, col } from 'sequelize';
import sequelize from './config/db.js';
import User from './model/user/User.js';
import Staff from './model/admin/Staff.js';
import CreditsLedger from './model/user/CreditsLedger.js';

// Helper to get all descendant staff IDs recursively
const getAllDescendantStaffIds = async (staffId) => {
  let allIds = [staffId];
  let currentIds = [staffId];

  while (currentIds.length > 0) {
    const children = await Staff.findAll({
      where: { parent_id: { [Op.in]: currentIds } },
      attributes: ['staff_id'],
      raw: true
    });

    if (children.length === 0) break;

    const childIds = children.map(c => c.staff_id);
    allIds = [...allIds, ...childIds];
    currentIds = childIds;
  }
  return allIds;
};

const verifyReport = async () => {
  try {
    console.log('--- Verifying Hierarchy Report Logic (Company Simulation - Flat List) ---');
    
    // Simulate logged-in admin as Company (ID 1)
    const loggedInAdminId = 1; 
    const loggedInRole = 'COMPANY';
    console.log(`Simulating Logged-in Admin ID: ${loggedInAdminId} (${loggedInRole})`);

    // 1. Determine Allowed Users (Downline Filtering)
    let allowedUserIds = [];
    let isOwner = loggedInRole === 'OWNER';

    if (isOwner) {
      // Owner sees everyone
    } else {
      const allowedStaffIds = await getAllDescendantStaffIds(loggedInAdminId);
      
      const usersUnderStaff = await User.findAll({
          where: { parent_staff_id: { [Op.in]: allowedStaffIds } },
          attributes: ['user_id'],
          raw: true
      });
      allowedUserIds = usersUnderStaff.map(u => String(u.user_id));
    }

    // 2. Fetch commissions (Filtered)
    const commissionWhere = {
      commission: { [Op.ne]: null }
    };
    
    if (!isOwner) {
      commissionWhere.user_id = { [Op.in]: allowedUserIds };
    }

    const allCommissions = await CreditsLedger.findAll({
      attributes: [
        "user_id",
        [fn("COALESCE", fn("SUM", col("commission")), 0), "total_commission"],
      ],
      where: commissionWhere,
      group: ["user_id"],
      raw: true,
    });

    console.log(`Found ${allCommissions.length} users with commission (after filtering).`);

    // 3. Fetch User Details
    const userIdsWithCommission = allCommissions.map(c => c.user_id);
    const usersDetails = await User.findAll({
      where: { user_id: { [Op.in]: userIdsWithCommission } },
      attributes: ['user_id', 'username'],
      raw: true
    });

    const userMap = {};
    usersDetails.forEach(u => userMap[u.user_id] = u);

    // 4. Format Result (Flat List)
    const resultData = allCommissions.map(comm => {
      const user = userMap[comm.user_id];
      return {
        user_id: comm.user_id,
        username: user ? user.username : `User ${comm.user_id}`,
        total_commission: parseFloat(comm.total_commission || 0).toFixed(2)
      };
    });

    resultData.sort((a, b) => parseFloat(b.total_commission) - parseFloat(a.total_commission));

    console.log('--- Flat Report ---');
    console.table(resultData);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

verifyReport();
