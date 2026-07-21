import Staff from '../../model/admin/Staff.js';
import Role from '../../model/admin/Role.js';
import WalletService from '../../services/walletService.js';
import PasswordService from '../../services/passwordService.js';
import sequelize from '../../config/db.js';
import Wallet from '../../model/admin/Wallet.js';
import User from '../../model/user/User.js';
import { Op } from 'sequelize';

// Helper: Validate role exists
const getRoleOrFail = async (roleName) => {
  const role = await Role.findOne({ where: { role: roleName } });
  if (!role) throw new Error(`Role '${roleName}' not found`);
  return role;
};

// CREATE STAFF
// export const createStaff = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { username, email, password, role, parent_id, percentage, credit = 0, cash = 0 } = req.body;

//     if (!username || !email || !password || !role) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // Validate password strength
//     const { isValid, errors } = PasswordService.validatePasswordStrength(password);
//     if (!isValid) {
//       return res.status(400).json({ message: 'Password too weak', errors });
//     }

//     const roleRecord = await getRoleOrFail(role);

//     // Validate parent exists
//     let parent = null;

//     if (role != "COMPANY") {
//       parent = await Staff.findByPk(parent_id, { transaction: t });
//       if (!parent) return res.status(400).json({ message: 'Parent staff not found' });
//     }

// // validation: parent level must be higher than new staff level
//       if (parent_id) {
//     const parent = await Staff.findByPk(parent_id);
//     const parentLevel = parseInt(parent.level.slice(1));
//     const myLevel = parseInt(roleRecord.level.slice(1));

//     if (myLevel <= parentLevel) {
//         return res.status(400).json({
//             message: `Cannot create ${role} under ${parent.role}. Parent must be higher level.`
//         });
//     }
// }



//     // Hash password via service
//     const hashedPassword = await PasswordService.hashPassword(password);

//     // Create staff
//     const staff = await Staff.create({
//       username,
//       email,
//       password: hashedPassword,
//       role_id: roleRecord.role_id,
//       role: roleRecord.role,
//       level: roleRecord.level,
//       parent_id: parent_id || null,
//       percentage: percentage || null,
//     }, { transaction: t });

//     // Create wallet with opening balance : cash/credit
//     const wallet = await WalletService.createWallet(
//       staff.staff_id,
//       roleRecord.role, // use role as userType
//       t,
//       username,
//       credit,
//       cash
//     );

//     // If opening_balance > 0, credit it
//     if (parseFloat(opening_balance) > 0) {
//       await WalletService.creditBalance(
//         staff.staff_id,
//         opening_balance,
//         roleRecord.role,
//         t,
//         req.user?.username || 'system' // logged in user
//       );
//     }

//     await t.commit();

//     const { password: _, ...safeStaff } = staff.toJSON();
//     res.status(201).json({ staff: safeStaff, wallet });
//   } catch (err) {
//     await t.rollback();
//     res.status(400).json({ message: err.message });
//   }
// };

// CREATE STAFF
export const createStaff = async (req, res) => {
  const t = await sequelize.transaction();
  try {
   let {
      username,
      email,
      password,
      role,
      parent_id,
      parent_owner_id,
      percentage,
      cash = 0,
      credit_ref = 0
    } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Validate password
    const { isValid, errors } = PasswordService.validatePasswordStrength(password);
    if (!isValid) {
      return res.status(400).json({ message: 'Password too weak', errors });
    }

    // 🔒 Username must be globally unique across USERS, STAFF and OWNERS
    // (case-insensitive). Pre-check so we return a clean message and never
    // create a staff name that collides with a player/owner.
    const nameWhere = { username: { [Op.iLike]: username } };
    const [userNameDup, staffNameDup, ownerNameDup] = await Promise.all([
      User.findOne({ where: nameWhere, attributes: ['user_id'], raw: true }),
      Staff.findOne({ where: nameWhere, attributes: ['staff_id'], raw: true }),
      Owner.findOne({ where: nameWhere, attributes: ['owner_id'], raw: true }),
    ]);
    if (userNameDup || staffNameDup || ownerNameDup) {
      await t.rollback();
      return res.status(409).json({ message: 'Username already exists' });
    }

    // ✅ Get role details
    const roleRecord = await getRoleOrFail(role);

    // Parent verification is now handled by validateParent middleware
    // It ensures parent exists (if not OWNER) and sets parent_id correctly
    
    // ✅ Validate if parent is not owner (Hierarchy check handled by validateHierarchy middleware)
    // We can skip the manual level checks here as validateHierarchy does it more robustly

   

    // ✅ Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // ✅ Create staff record
    const staff = await Staff.create(
      {
        username,
        email,
        password: hashedPassword,
        role_id: roleRecord.role_id,
        role: roleRecord.role,
        level: roleRecord.level,
        parent_id: parent_id || null,
        parent_owner_id: parent_owner_id || null, // ✅ Save parent_owner_id
        percentage: percentage || null,
      },
      { transaction: t }
    );

    // ✅ Create wallet for the staff
    const wallet = await WalletService.createWallet(
      staff.staff_id,
      roleRecord.role,
      t,
      username,
      0,
      cash
    );

    // Save credit_ref as cash_received
    if (parseFloat(credit_ref) > 0) {
      wallet.cash_received = parseFloat(credit_ref);
      await wallet.save({ transaction: t });
    }


    const loggedInUser = req.user?.username || "system";
    const senderUserId = parent_id || null;
    const senderUserType = req.parentStaff ? req.parentStaff.role : null;

    // no need as we are initializing balance during wallet creation
  
    // ✅ Handle wallet initialization using addCash / addCredit services
    // if (parseFloat(cash) > 0) {
    //   await WalletService.addCash(
    //     staff.staff_id,           // receiver ID
    //     cash,                     // amount
    //     t,                        // transaction
    //     loggedInUser,             // initiatedBy
    //     senderUserId,             // sender (parent)
    //     senderUserType            // sender type
    //   );
    // }

    // if (parseFloat(credit) > 0) {
    //   await WalletService.addCredit(
    //     staff.staff_id,           // receiver ID
    //     credit,                   // amount
    //     t,                        // transaction
    //     loggedInUser,             // initiatedBy
    //     senderUserId,             // sender (parent)
    //     senderUserType            // sender type
    //   );
    // }

    await t.commit();

    const { password: _, ...safeStaff } = staff.toJSON();
    // const userWallet = await WalletService.getUserWallet(staff.staff_id, role);

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      staff: safeStaff,
      wallet: wallet,
    });

  } catch (err) {
    await t.rollback();
    console.error("❌ createStaff error:", err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors?.[0]?.path || 'field';
      return res.status(409).json({ message: `${field} already exists` });
    }

    res.status(400).json({ message: err.message });
  }
};


// GET ALL STAFF
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'roleDetails', attributes: ['role', 'level', 'power'] },
        { model: Staff, as: 'parent', attributes: ['staff_id', 'username'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE STAFF
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'roleDetails', attributes: ['role', 'level', 'power'] },
        { model: Staff, as: 'parent', attributes: ['staff_id', 'username'] },
        { model: Staff, as: 'children', attributes: ['staff_id', 'username', 'role'] },
      ],
    });

    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE STAFF
export const updateStaff = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const updates = req.body;

    const staff = await Staff.findByPk(id, { transaction: t });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Role change
    if (updates.role) {
      const roleRecord = await getRoleOrFail(updates.role);
      updates.role_id = roleRecord.role_id;
      updates.level = roleRecord.level;
    }

    // Password change
    if (updates.password) {
      const { isValid, errors } = PasswordService.validatePasswordStrength(updates.password);
      if (!isValid) return res.status(400).json({ message: 'Password too weak', errors });
      updates.password = await PasswordService.hashPassword(updates.password);
    }

    // Percentage
    if (updates.percentage !== undefined) {
      updates.percentage = updates.percentage === null ? null : parseFloat(updates.percentage);
    }

    await staff.update(updates, { transaction: t });
    await t.commit();

    const { password: _, ...safeStaff } = staff.toJSON();
    res.json(safeStaff);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
};

// GET STAFF BY ROLE
export const getStaffByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const staff = await Staff.findAll({
      where: { role },
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'roleDetails', attributes: ['power'] },
        { model: Staff, as: 'parent', attributes: ['username'] },
      ],
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET STAFF UNDER PARENT
export const getStaffUnderParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const staff = await Staff.findAll({
      where: { parent_id: parentId },
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'roleDetails', attributes: ['role', 'level'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE STAFF (with hierarchy fix)
export const deleteStaff = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id, { transaction: t });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const parentOfDeleted = staff.parent_id;

    // Update children: set their parent_id = deleted.parent_id
    await Staff.update(
      { parent_id: parentOfDeleted },
      { where: { parent_id: id }, transaction: t }
    );

    // Soft delete the staff
    await staff.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'Staff deleted and hierarchy updated' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// ===================================================================
// UPDATE STAFF/OWNER PASSWORD
// ===================================================================
import Owner from '../../model/admin/Owner.js';

export const updateStaffPassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // req.user is set by authMiddleware
    // It usually contains { user_id, role, ... }
    const userId = req.user.account.id|| req.user.staff_id || req.user.owner_id;
    const userRole = req.user.role; // 'OWNER', 'admin', 'master', etc.

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
    }

    let user;
    let isOwner = false;

    // Determine if user is Owner or Staff
    if (userRole === 'OWNER' || userRole === 'Owner') {
      isOwner = true;
      user = await Owner.findOne({ where: { owner_id: userId } });
    } else {
      user = await Staff.findByPk(userId);
    }

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify old password
    const isValid = await PasswordService.comparePassword(oldPassword, user.password);
    if (!isValid) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    }

    // Validate new password strength
    const validation = PasswordService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `New password too weak: ${validation.errors.join(', ')}`,
      });
    }

    // Hash new password
    const hashedPassword = await PasswordService.hashPassword(newPassword);

    let transactionPassword = null;
    // Check if this is the first login reset
    if (!user.first_login) {
        // Generate 6-digit random number
        transactionPassword = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Update user with new password, set first_login to true, and save transaction password
        await user.update({ 
            password: hashedPassword, 
            first_login: true,
            transaction_password: transactionPassword 
        }, { transaction });
    } else {
        // Normal password update
        await user.update({ password: hashedPassword }, { transaction });
    }

    await transaction.commit();
    
    const response = { success: true, message: 'Password updated successfully' };
    if (transactionPassword) {
        response.transactionPassword = transactionPassword;
    }
    
    res.status(200).json(response);

  } catch (error) {
    await transaction.rollback();
    console.error('Error in updateStaffPassword:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};