import User from '../../model/user/User.js';
import { Op } from 'sequelize';

import PasswordService from '../../services/passwordService.js';
import sequelize from '../../config/db.js';
import WalletService from '../../services/walletService.js';
import Bank from '../../model/admin/Bank.js'; // Import the Bank model to fetch exchange rate
import BetLock from '../../model/admin/BetLock.js';

import Staff from '../../model/admin/Staff.js';

import Role from '../../model/admin/Role.js';

import Wallet from '../../model/admin/Wallet.js';
import UserNetExposure from '../../model/user/UserNetExposure.js';
import UserExposure from '../../model/user/UserExposure.js';
import CreditsLedger from "../../model/user/CreditsLedger.js";
import Owner from '../../model/admin/Owner.js';
import { body } from 'express-validator';
import ActivityLogService from '../../services/admin/ActivityLogService.js';



// helper ffunction to get user id for given role and username 

/**
 * Resolve all USER IDs under a given role + username hierarchy
 * @param {string} role
 * @param {string} username
 * @returns {number[]} user_ids
 */
export const getUserIdsByHierarchy = async (role, username) => {
  const upperRole = role.toUpperCase();

  let ownerId = null;
  let rootStaffId = null;

  /* ───────── OWNER CASE ───────── */
  if (upperRole === 'OWNER') {
    const owner = await Owner.findOne({
      where: { username },
      attributes: ['owner_id'],
      raw: true
    });

    if (!owner) return [];

    ownerId = owner.owner_id;

    // 1️⃣ All staff under this owner
    const staffRows = await Staff.findAll({
      where: { parent_owner_id: ownerId },
      attributes: ['staff_id'],
      raw: true
    });

    const staffIds = staffRows.map(s => s.staff_id);

    // 2️⃣ All users under owner OR under those staff
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { parent_owner_id: ownerId },
          staffIds.length
            ? { parent_staff_id: { [Op.in]: staffIds } }
            : null
        ].filter(Boolean)
      },
      attributes: ['user_id'],
      raw: true
    });

    return users.map(u => u.user_id);
  }

  /* ───────── STAFF ROLES CASE ───────── */
  // SUPERADMIN, ADMIN, COMPANY, SUPERMASTER, MASTER
  const staff = await Staff.findOne({
    where: { username },
    attributes: ['staff_id'],
    raw: true
  });

  if (!staff) return [];

  rootStaffId = staff.staff_id;

  // 🔁 Get all descendant staff (including self)
  const allStaffIds = [];
  let queue = [rootStaffId];

  while (queue.length) {
    const children = await Staff.findAll({
      where: { parent_id: { [Op.in]: queue } },
      attributes: ['staff_id'],
      raw: true
    });

    const childIds = children.map(c => c.staff_id);
    allStaffIds.push(...queue);
    queue = childIds;
  }

  // Include root staff
  if (!allStaffIds.includes(rootStaffId)) {
    allStaffIds.push(rootStaffId);
  }

  // 🔎 Final users under all staff
  const users = await User.findAll({
    where: {
      parent_staff_id: { [Op.in]: allStaffIds }
    },
    attributes: ['user_id'],
    raw: true
  });

  return users.map(u => u.user_id);
};

// ✅ Helper function — sum all credits from CreditsLedger for a user
const getUserTotalCredits = async (userId) => {
  try {
    // Force cast to string since credits_ledger.user_id is TEXT
    const total = await CreditsLedger.sum("amount", {
      where: { user_id: String(userId) },
    });
    return parseFloat(total || 0);
  } catch (error) {
    console.error("Error in getUserTotalCredits:", error);
    return 0;
  }
};


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




const UserController = {

  // 🔎 Live username availability check across USERS, STAFF and OWNERS.
  // A username must be globally unique so it can never collide between a
  // player and an admin/staff/owner account.
  checkUsername: async (req, res) => {
    try {
      const username = String(req.query.username || '').trim();
      if (!username) {
        return res.status(400).json({ available: false, error: 'username is required' });
      }
      // Op.iLike with no wildcards = case-insensitive exact match.
      const where = { username: { [Op.iLike]: username } };
      const [u, s, o] = await Promise.all([
        User.findOne({ where, attributes: ['user_id'], raw: true }),
        Staff.findOne({ where, attributes: ['staff_id'], raw: true }),
        Owner.findOne({ where, attributes: ['owner_id'], raw: true }),
      ]);
      const taken = !!(u || s || o);
      return res.status(200).json({ available: !taken, exists: taken });
    } catch (error) {
      console.error('❌ checkUsername error:', error.message);
      return res.status(500).json({ available: false, error: error.message });
    }
  },

  createUserUnderParent: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        username,
        email,
        password,
        phone_number,
        country,
        cash = 0,
        credit_ref = 0,
      } = req.body;


      console.log("api called: from  user controller", req?.user)



      // 🧠 Logged-in staff/owner/admin from auth middleware

      const parentRole = req.user?.role?.toUpperCase();
      const parentId = req.user.account.id; //could be ownerid or staff id defined in auth middleware from token decode

      if (!parentId || !parentRole) {
        return res.status(400).json({ message: 'parentID, parentRole are required.' });
      }




      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }

      let parent = null;

      // Validate parent existence: either owner or staff
      if (parentRole === "OWNER") {
        parent = await Owner.findByPk(parentId, { transaction });
        if (!parent) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Owner not found.' });
        }
      } else {
        parent = await Staff.findByPk(parentId, { transaction });
        if (!parent) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Staff not found.' });
        }
      }

      console.log("Parent found:", parent);

      // 🧾 Validate password strength
      const { isValid, errors } = PasswordService.validatePasswordStrength(password);
      if (!isValid) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Weak password',
          errors,
        });
      }

      // 🔐 Hash password
      const hashedPassword = await PasswordService.hashPassword(password);

      // 🎯 Get user role ID (if role table exists)
      let roleId = 7; // by default user role id
      const userRole = await Role.findOne({ where: { role: 'USER' }, transaction });
      if (userRole) roleId = userRole.role_id;

      // 🧩 Determine correct parent_id either it is from  owner or staff
      let parent_staff_id = null;
      let parent_owner_id = null
      if (parentRole === 'OWNER') { parent_owner_id = parentId; }
      else { parent_staff_id = parentId }

      // validating user already exist or not
      // 🔒 Username must be globally unique across USERS, STAFF and OWNERS
      // (case-insensitive), so a player can never reuse a staff/owner name.
      const nameWhere = { username: { [Op.iLike]: username } };
      const [userNameDup, staffNameDup, ownerNameDup] = await Promise.all([
        User.findOne({ where: nameWhere, attributes: ['user_id'], raw: true }),
        Staff.findOne({ where: nameWhere, attributes: ['staff_id'], raw: true }),
        Owner.findOne({ where: nameWhere, attributes: ['owner_id'], raw: true }),
      ]);
      if (userNameDup || staffNameDup || ownerNameDup) {
        throw new Error('Username already exists');
      }

      // Email uniqueness (within users)
      if (email) {
        const emailDup = await User.findOne({ where: { email }, attributes: ['user_id'], raw: true });
        if (emailDup) throw new Error('Email already exists');
      }

      // 🧱 Create user
      const newUser = await User.create(
        {
          username,
          email,
          password: hashedPassword,
          phone_number,
          country,
          parent_staff_id: parent_staff_id,
          parent_owner_id: parent_owner_id,
          role_id: roleId,
          role: 'USER',
          status: 'Active',
        },
        { transaction }
      );

      // 💰 Create wallet for user
      const userWallet = await WalletService.createWallet(
        newUser.user_id,
        'USER',
        transaction,
        newUser.username,
        0,
        cash
      );

      // Save credit_ref as cash_received
      if (parseFloat(credit_ref) > 0) {
        userWallet.cash_received = parseFloat(credit_ref);
        await userWallet.save({ transaction });
      }

      // 🔐 Create BetLock for user (within transaction to avoid FK constraint issues)
      await BetLock.create(
        {
          user_id: newUser.user_id,
          MatchOdds: false,
          OtherMarkets: false,
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: 'User created successfully under parent',
        data: {
          user_id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          parent_staff_id: newUser.parent_staff_id,
          parent_owner_id: newUser.parent_owner_id,
          owner_id: newUser.owner_id,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error('❌ createUserUnderParent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user under parent',
        error: error.message,
      });
    }
  },

  // Register a new user (without initial balance)
  registerUser: async (req, res) => {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
      const userData = req.body;
      const { ...userDetails } = userData;

      // Validate password strength before hashing
      if (userDetails.password) {
        const passwordValidation = PasswordService.validatePasswordStrength(userDetails.password);
        if (!passwordValidation.isValid) {
          return res.status(400).json({
            success: false,
            error: `Password validation failed: ${passwordValidation.errors.join(', ')}`
          });
        }

        // Hash the password using PasswordService
        userDetails.password = await PasswordService.hashPassword(userDetails.password);
      }

      // Create a new user
      const user = await User.create(userDetails, { transaction });

      // Create a wallet for the user
      await WalletService.createWallet(user.user_id, 'User', transaction, user.username);

      await transaction.commit(); // Commit the transaction
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      await transaction.rollback(); // Rollback the transaction on error
      console.error('Error in registerUser:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update password loged in user
  updatePassword: async (req, res) => {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
      const userId = req.user.account.id; // Assuming user ID is available in req.user
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Password fields cannot be empty' });
      }

      // Find the user
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Verify the current password using PasswordService
      const isPasswordValid = await PasswordService.comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      // Validate new password strength
      const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: `New password validation failed: ${passwordValidation.errors.join(', ')}`
        });
      }

      // Hash the new password using PasswordService
      const hashedNewPassword = await PasswordService.hashPassword(newPassword);

      // Update the user's password with hashed password
      await user.update({ password: hashedNewPassword }, { transaction });

      await transaction.commit(); // Commit the transaction
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      await transaction.rollback(); // Rollback the transaction on error
      console.error('Error in updatePassword:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update password loged in staff
  updateStaffPassword: async (req, res) => {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
      const staff_id = req.user.account.id;// Assuming user ID is available in req.user
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ success: false, error: 'Password fields cannot be empty' });
      }

      // Find the user
      const staff = await Staff.findOne({ where: { staff_id } });
      if (!staff) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }


      // Validate new password strength
      const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: `New password validation failed: ${passwordValidation.errors.join(', ')}`
        });
      }

      // Hash the new password using PasswordService
      const hashedNewPassword = await PasswordService.hashPassword(newPassword);

      // 🔐 Changing the login password also rotates the transaction password.
      // We generate a fresh 6-digit code and return it so the UI can show it.
      const newTransactionPassword = Math.floor(100000 + Math.random() * 900000).toString();
      await staff.update({ password: hashedNewPassword, transaction_password: newTransactionPassword }, { transaction });

      await transaction.commit(); // Commit the transaction
      res.status(200).json({ success: true, message: 'Password updated successfully', transactionPassword: newTransactionPassword });
    } catch (error) {
      await transaction.rollback(); // Rollback the transaction on error
      console.error('Error in updatePassword:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },




  // newly added password and status(active/true)
  updateStaffAndUser: async (req, res) => {
    console.log("req body for newly added update password=====>> ", req.body);

    const { user_type, newPassword, staff_id, user_id, active, status, betlock } = req.body;

    console.log("fetched details: update user/staff pass===>", {
      user_type,
      newPassword,
      staff_id,
      user_id,
    });

    if (!newPassword && active == null && status == null && betlock == null) {
      return res
        .status(400)
        .json({ success: false, error: "At least one field (password, status, or betlock) must be provided" });
    }

    const transaction = await sequelize.transaction();

    try {
      let updated = false;
      let message = "";
      let transactionPassword = null; // rotated + returned when a STAFF password changes

      if (user_type === "USER") {
        // Find the user
        const user = await User.findOne({ where: { user_id }, transaction });
        if (!user) {
          await transaction.rollback();
          return res.status(404).json({ success: false, error: "User not found" });
        }

        // Update password if provided
        if (newPassword != null) {
          const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
          if (!passwordValidation.isValid) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              error: `New password validation failed: ${passwordValidation.errors.join(", ")}`,
            });
          }

          const hashedNewPassword = await PasswordService.hashPassword(newPassword);
          await user.update({ password: hashedNewPassword }, { transaction });
          updated = true;
          message += "Password updated successfully. ";
        }

        // Update status if provided
        if (status != null) {
          await user.update({ status }, { transaction });
          updated = true;
          message += "Status updated successfully.";
        }
        if (betlock != null) {
          await user.update({ bet_locked: betlock }, { transaction });
          updated = true;
          message += "Betlock updated successfully.";
        }
      } else {
        // STAFF handling
        const staff = await Staff.findOne({ where: { staff_id }, transaction });
        if (!staff) {
          await transaction.rollback();
          return res.status(404).json({ success: false, error: "Staff not found" });
        }

        // Update password if provided
        if (newPassword != null) {
          const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
          if (!passwordValidation.isValid) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              error: `New password validation failed: ${passwordValidation.errors.join(", ")}`,
            });
          }

          const hashedNewPassword = await PasswordService.hashPassword(newPassword);
          // 🔐 Changing the staff's login password also rotates their
          // transaction password; it is returned so the admin can relay it.
          transactionPassword = Math.floor(100000 + Math.random() * 900000).toString();
          await staff.update({ password: hashedNewPassword, transaction_password: transactionPassword }, { transaction });
          updated = true;
          message += "Password updated successfully. ";
        }

        // Update active status if provided
        if (active != null) {
          await staff.update({ active }, { transaction });
          updated = true;
          message += "Status updated successfully.";
        }
        if (betlock != null) {
          await staff.update({ bet_locked: betlock }, { transaction });
          updated = true;
          message += "Betlock updated successfully.";
        }
      }

      // Commit only if something was updated
      if (updated) {
        await transaction.commit();

        // 📝 Log Activity
        // We log who performed the action (req.user)
        if (req.user) {
          const targetType = user_type === "USER" ? "User" : "Staff";
          const targetId = user_type === "USER" ? user_id : staff_id;
          await ActivityLogService.log({
            req,
            user: req.user,
            action: 'UPDATE_ACCOUNT',
            details: `${message.trim()} (Target: ${targetType} #${targetId})`,
          });
        }

        return res.status(200).json({ success: true, message: message.trim(), transactionPassword });
      } else {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: "No valid fields provided to update" });
      }
    } catch (error) {
      await transaction.rollback();
      console.error("Error in update staff/user:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get a user by ID (fetched from req.user)
  getUser: async (req, res) => {
    try {
      const userId = req.user.account.id; // Assuming user ID is available in req.user
      const Role = req.user.role; // Contains the role of the user who made the request

      // Find the user by ID
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Return the user details (excluding sensitive information like password)
      const userDetails = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        requestRole: Role,
      };

      res.status(200).json({ success: true, user: userDetails });
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },





  getUserAllDetails: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const exact = req.query.exact || ''; // Exact username match
      const type = req.query.type?.toUpperCase(); // Optional: USER, STAFF, or none

      const STAFF_TYPES = ['SUPERADMIN', 'ADMIN', 'SUPERMASTER', 'MASTER', 'OWNER', 'COMPANY'];

      let wallets = [];
      let totalWallets = 0;

      // 1. Determine Scope (Hierarchy Check)
      const loggedInRole = req.user?.role?.toUpperCase();
      const loggedInId = req.user.account.id;

      let allowedStaffIds = null; // null means ALL (Owner)

      if (loggedInRole !== 'OWNER') {
        // Fetch only direct children (Staff where parent_id = loggedInId)
        const directStaff = await Staff.findAll({
          where: { parent_id: loggedInId },
          attributes: ['staff_id'],
          raw: true
        });
        allowedStaffIds = directStaff.map(s => s.staff_id);
      }

      // 2. Build Base Where Clause
      let baseWhere = {};
      if (exact) {
        baseWhere.username = exact;
      } else if (search) {
        baseWhere.username = { [Op.like]: `%${search}%` };
      }

      // ────── CASE: Return ALL users (staff + bettors) → DEFAULT behavior ──────
      if (!type) {
        let allowedUserIds = [];
        if (allowedStaffIds || loggedInRole !== 'OWNER') {
          // If NOT owner, we only want direct users (parent_staff_id = loggedInId)
          // If Owner, we might want all (but usuallyOwner is at the top, so allowedStaffIds might be null)

          let userQuery = {};
          if (loggedInRole === 'OWNER') {
            // Owner sees all users belonging to their staff hierarchy
            if (allowedStaffIds) {
              userQuery = { parent_staff_id: { [Op.in]: allowedStaffIds } };
            }
          } else {
            // Non-Owner sees ONLY their direct users
            userQuery = { parent_staff_id: loggedInId };
          }

          if (Object.keys(userQuery).length > 0 || loggedInRole !== 'OWNER') {
            const usersUnderStaff = await User.findAll({
              where: userQuery,
              attributes: ['user_id'],
              raw: true
            });
            allowedUserIds = usersUnderStaff.map(u => u.user_id);
          }
        }

        // Apply Hierarchy Filter to Base Where
        if (loggedInRole !== 'OWNER') {
          // Filter wallets to: (direct staff OR direct users) AND NOT self
          baseWhere[Op.and] = [
            {
              [Op.or]: [
                { staff_id: { [Op.in]: allowedStaffIds || [] } },
                { user_id: { [Op.in]: allowedUserIds || [] } }
              ]
            },
            {
              [Op.or]: [
                { staff_id: { [Op.ne]: loggedInId } },
                { staff_id: null }
              ]
            }
          ];
        } else if (allowedStaffIds) {
          // Owner case with specific staff restriction (if any)
          baseWhere[Op.and] = [
            {
              [Op.or]: [
                { staff_id: { [Op.in]: allowedStaffIds } },
                ...(allowedUserIds.length > 0 ? [{ user_id: { [Op.in]: allowedUserIds } }] : [])
              ]
            },
            { owner_id: null }
          ];
        } else {
          // Owner case, show everything but self (exclude owner's own wallet)
          baseWhere[Op.and] = [
            { owner_id: null }
          ];
        }

        // We can still include Staff for extra details if needed, but let's keep it simple to avoid errors.
        // If we need staff details (percentage, etc), we can fetch separately or try include again for Staff only.
        // The original code included Staff. Let's keep it if it works, or remove if risk.
        // Let's remove includes for now to be safe and just return wallet data.

        const allData = await Wallet.findAll({
          where: baseWhere,
          attributes: [
            'wallet_id', 'user_id', 'staff_id', 'username', 'user_type',
            'inr_balance', 'cash', 'cash_received', 'totalCommission', 'profit_loss', 'verdict',
            'createdAt', 'updatedAt'
          ],
          include: [{
            model: Staff,
            as: 'staff',
            attributes: ['percentage', 'level', 'role', 'active', 'bet_locked'],
            required: false,
          }, {
            model: User,
            as: 'user',
            attributes: ['status', 'bet_locked'],
            required: false,
          }],
          limit,
          offset,
          order: [['wallet_id', 'ASC']],
          raw: true,
        });

        totalWallets = await Wallet.count({
          where: baseWhere,
        });

        // For staff entries: replace raw inr_balance/profit_loss with
        // TotalMasterBalance (own cash + ALL descendants' cash) so the list
        // reflects the true effective balance, not just the staff's own wallet.
        const staffEffective = {};
        for (const p of allData) {
          if (!STAFF_TYPES.includes(p.user_type) || !p.staff_id) continue;
          const sid = p.staff_id;

          // BFS to get all descendant staff IDs
          let allDescStaffIds = [];
          let bfsQueue = [sid];
          while (bfsQueue.length > 0) {
            const ch = await Staff.findAll({
              where: { parent_id: { [Op.in]: bfsQueue } },
              attributes: ['staff_id'], raw: true
            });
            const chIds = ch.map(c => c.staff_id);
            allDescStaffIds = [...allDescStaffIds, ...chIds];
            bfsQueue = chIds;
          }

          // All users under this staff and any descendant staff
          const uWhere = allDescStaffIds.length > 0
            ? { [Op.or]: [{ parent_staff_id: sid }, { parent_staff_id: { [Op.in]: allDescStaffIds } }] }
            : { parent_staff_id: sid };
          const descUsers = await User.findAll({ where: uWhere, attributes: ['user_id'], raw: true });
          const descUserIds = descUsers.map(u => u.user_id);

          // Sum all descendants' inr_balance (exclude self — own balance already in p.inr_balance)
          const obCond = [];
          if (allDescStaffIds.length > 0) obCond.push({ staff_id: { [Op.in]: allDescStaffIds } });
          if (descUserIds.length > 0) obCond.push({ user_id: { [Op.in]: descUserIds } });

          let descBalance = 0;
          if (obCond.length > 0) {
            const dw = await Wallet.findAll({ where: { [Op.or]: obCond }, attributes: ['inr_balance'], raw: true });
            descBalance = dw.reduce((s, w) => s + parseFloat(w.inr_balance || 0), 0);
          }

          const totalMaster = parseFloat(p.inr_balance || 0) + descBalance;
          const cr = parseFloat(p.cash_received || 0);
          staffEffective[sid] = {
            inr_balance: totalMaster,
            profit_loss: Math.round((totalMaster - cr) * 100) / 100,
            verdict: (totalMaster - cr) >= 0 ? 'profit' : 'loss',
          };
        }

        wallets = allData.map(item => {
          const p = item;
          const isStaff = STAFF_TYPES.includes(p.user_type);
          const eff = (isStaff && p.staff_id && staffEffective[p.staff_id]) || null;

          return {
            wallet_id: p.wallet_id,
            user_id: p.user_id,
            staff_id: p.staff_id,
            username: p.username,
            user_type: p.user_type,
            role: isStaff ? (p['staff.role'] || p.user_type) : 'USER',
            level: isStaff ? p['staff.level'] : null,
            percentage: isStaff ? (p['staff.percentage'] ? parseFloat(p['staff.percentage']) : null) : null,
            inr_balance: eff ? eff.inr_balance : parseFloat(p.inr_balance || 0),
            cash: parseFloat(p.cash || 0),
            cash_received: parseFloat(p.cash_received || 0),
            totalCommission: parseFloat(p.totalCommission || 0),
            profit_loss: eff ? eff.profit_loss : parseFloat(p.profit_loss || 0),
            verdict: eff ? eff.verdict : p.verdict,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            status: p.user_type === 'USER' ? (p['user.status'] || 'Active') : (p['staff.active'] ? 'Active' : 'InActive'),
            active: isStaff ? (p['staff.active'] === 1 || p['staff.active'] === true) : (p['user.status'] === 'Active'),
            bet_locked: isStaff ? (p['staff.bet_locked'] === 1 || p['staff.bet_locked'] === true) : (p['user.bet_locked'] === 1 || p['user.bet_locked'] === true),
          };
        });
      }

      // ────── CASE: Only STAFF ──────
      else if (type === 'STAFF') {
        baseWhere.user_type = { [Op.in]: STAFF_TYPES };

        if (allowedStaffIds) {
          baseWhere.staff_id = { [Op.in]: allowedStaffIds };
        }

        const staffData = await Wallet.findAll({
          where: baseWhere,
          attributes: ['wallet_id', 'user_id', 'staff_id', 'username', 'user_type', 'inr_balance', 'cash', 'cash_received', 'totalCommission', 'profit_loss', 'verdict', 'createdAt', 'updatedAt'],
          include: [{ model: Staff, as: 'staff', attributes: ['percentage', 'level', 'role', 'active', 'bet_locked'], required: false }],
          limit, offset, order: [['wallet_id', 'ASC']], raw: false,
        });

        totalWallets = await Wallet.count({ where: baseWhere });

        // Compute TotalMasterBalance for each staff entry (same logic as default branch)
        const staffEffectiveS = {};
        for (const item of staffData) {
          const p = item.get({ plain: true });
          if (!p.staff_id) continue;
          const sid = p.staff_id;
          let allDescStaffIds = [];
          let bfsQueue = [sid];
          while (bfsQueue.length > 0) {
            const ch = await Staff.findAll({ where: { parent_id: { [Op.in]: bfsQueue } }, attributes: ['staff_id'], raw: true });
            const chIds = ch.map(c => c.staff_id);
            allDescStaffIds = [...allDescStaffIds, ...chIds];
            bfsQueue = chIds;
          }
          const uWhere = allDescStaffIds.length > 0
            ? { [Op.or]: [{ parent_staff_id: sid }, { parent_staff_id: { [Op.in]: allDescStaffIds } }] }
            : { parent_staff_id: sid };
          const descUsers = await User.findAll({ where: uWhere, attributes: ['user_id'], raw: true });
          const descUserIds = descUsers.map(u => u.user_id);
          const obCond = [];
          if (allDescStaffIds.length > 0) obCond.push({ staff_id: { [Op.in]: allDescStaffIds } });
          if (descUserIds.length > 0) obCond.push({ user_id: { [Op.in]: descUserIds } });
          let descBalance = 0;
          if (obCond.length > 0) {
            const dw = await Wallet.findAll({ where: { [Op.or]: obCond }, attributes: ['inr_balance'], raw: true });
            descBalance = dw.reduce((s, w) => s + parseFloat(w.inr_balance || 0), 0);
          }
          const totalMaster = parseFloat(p.inr_balance || 0) + descBalance;
          const cr = parseFloat(p.cash_received || 0);
          staffEffectiveS[sid] = { inr_balance: totalMaster, profit_loss: Math.round((totalMaster - cr) * 100) / 100, verdict: (totalMaster - cr) >= 0 ? 'profit' : 'loss' };
        }

        wallets = staffData.map(item => item.get({ plain: true })).map(p => {
          const eff = p.staff_id ? (staffEffectiveS[p.staff_id] || null) : null;
          return {
            ...p,
            role: p.staff?.role || p.user_type,
            level: p.staff?.level,
            percentage: p.staff?.percentage ? parseFloat(p.staff.percentage) : null,
            inr_balance: eff ? eff.inr_balance : parseFloat(p.inr_balance || 0),
            cash: parseFloat(p.cash || 0),
            cash_received: parseFloat(p.cash_received || 0),
            totalCommission: parseFloat(p.totalCommission || 0),
            profit_loss: eff ? eff.profit_loss : parseFloat(p.profit_loss || 0),
            verdict: eff ? eff.verdict : p.verdict,
            status: p.staff?.active ? 'Active' : 'InActive',
            active: p.staff?.active,
            bet_locked: p.staff?.bet_locked === 1 || p.staff?.bet_locked === true,
          };
        });
      }

      // ────── CASE: Only BETTORS (USER) ──────
      else if (type === 'USER') {
        baseWhere.user_type = 'USER';

        let userInclude = [];
        if (allowedStaffIds) {
          // Filter by User's parent
          // We need to include User to filter by parent_id
          userInclude = [{
            model: User,
            as: 'user',
            attributes: ['status', 'bet_locked'],
            where: { parent_staff_id: { [Op.in]: allowedStaffIds } },
            required: true // Inner join to enforce filter
          }];
        }

        wallets = await Wallet.findAll({
          where: baseWhere,
          attributes: ['wallet_id', 'user_id', 'staff_id', 'username', 'user_type', 'inr_balance', 'cash', 'cash_received', 'totalCommission', 'profit_loss', 'verdict', 'createdAt', 'updatedAt'],
          include: userInclude.length > 0 ? userInclude : [{ model: User, as: 'user', attributes: ['status', 'bet_locked'] }],
          limit, offset, order: [['wallet_id', 'ASC']], raw: true,
        });

        totalWallets = await Wallet.count({
          where: baseWhere,
          include: userInclude
        });

        wallets = wallets.map(w => ({
          ...w,
          role: 'USER',
          level: null,
          percentage: null,
          inr_balance: parseFloat(w.inr_balance || 0),
          cash: parseFloat(w.cash || 0),
          cash_received: parseFloat(w.cash_received || 0),
          totalCommission: parseFloat(w.totalCommission || 0),
          profit_loss: parseFloat(w.profit_loss || 0),
          status: w['user.status'] || 'Active',
          active: w['user.status'] === 'Active',
          bet_locked: w['user.bet_locked'] === 1 || w['user.bet_locked'] === true,
        }));

      }

      const totalPages = Math.ceil(totalWallets / limit);
      if (wallets.length === 0) {
        return res.status(200).json({
          success: true,
          data: { wallets: [], pagination: { current_page: page, total_pages: totalPages, total_wallets: totalWallets, per_page: limit } },
        });
      }

      // Exposure only for bettors (user_net_exposure is synced every 1s by bgworker)
      const bettorIds = wallets.filter(w => w.user_type === 'USER' && w.user_id).map(w => w.user_id);
      const exposures = bettorIds.length > 0 ? await UserNetExposure.findAll({
        where: { user_id: bettorIds },
        attributes: ['user_id', 'net_exposure'],
        raw: true
      }) : [];

      const exposureMap = exposures.reduce((acc, curr) => {
        acc[curr.user_id] = parseFloat(curr.net_exposure);
        return acc;
      }, {});

      const finalWallets = wallets.map(w => ({
        ...w,
        exposure: w.user_type === 'USER' ? (exposureMap[w.user_id] || 0) : 0
      }));

      res.status(200).json({
        success: true,
        data: {
          wallets: finalWallets,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_wallets: totalWallets,
            per_page: limit,
          },
        },
      });

    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },









  searchUsersByUsername: async (req, res) => {
    try {
      const { username, page = 1, limit = 25 } = req.query;

      // Validation: username is required and must be at least 1 char
      if (!username || username.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Username query parameter is required for search',
        });
      }

      const searchTerm = username.trim();
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // 1. Determine Scope (Hierarchy Check)
      const loggedInRole = req.user?.role.toUpperCase();
      const loggedInId = req.user.account.id;

      let allowedStaffIds = null; // null means ALL (Owner)

      if (loggedInRole !== 'OWNER') {
        // Fetch only direct children (Staff where parent_id = loggedInId)
        const directStaff = await Staff.findAll({
          where: { parent_id: loggedInId },
          attributes: ['staff_id'],
          raw: true
        });
        allowedStaffIds = directStaff.map(s => s.staff_id);
      }

      let allowedUserIds = [];
      if (loggedInRole !== 'OWNER') {
        // Fetch only direct users
        const usersUnderStaff = await User.findAll({
          where: { parent_staff_id: loggedInId },
          attributes: ['user_id'],
          raw: true
        });
        allowedUserIds = usersUnderStaff.map(u => u.user_id);
      } else if (allowedStaffIds) {
        // Owner case with specific staff restriction
        const usersUnderStaff = await User.findAll({
          where: { parent_staff_id: { [Op.in]: allowedStaffIds } },
          attributes: ['user_id'],
          raw: true
        });
        allowedUserIds = usersUnderStaff.map(u => u.user_id);
      }

      // Build Where Clause
      let whereClause = {
        username: {
          [Op.iLike]: `%${searchTerm}%`,
        },
      };

      if (loggedInRole !== 'OWNER') {
        // Filter search to: (direct staff OR direct users) AND NOT self
        whereClause[Op.and] = [
          {
            [Op.or]: [
              { staff_id: { [Op.in]: allowedStaffIds || [] } },
              { user_id: { [Op.in]: allowedUserIds || [] } }
            ]
          },
          {
            [Op.or]: [
              { staff_id: { [Op.ne]: loggedInId } },
              { staff_id: null }
            ]
          }
        ];
      } else if (allowedStaffIds) {
        // Owner case with restriction
        whereClause[Op.and] = [
          {
            [Op.or]: [
              { staff_id: { [Op.in]: allowedStaffIds } },
              ...(allowedUserIds.length > 0 ? [{ user_id: { [Op.in]: allowedUserIds } }] : [])
            ]
          },
          {
            [Op.or]: [
              { staff_id: { [Op.ne]: loggedInId } },
              { staff_id: null }
            ]
          }
        ];
      } else {
        // Owner case, show everything but self
        whereClause[Op.and] = [
          {
            [Op.or]: [
              { staff_id: { [Op.ne]: loggedInId } },
              { staff_id: null }
            ]
          }
        ];
      }

      console.log('DEBUG SEARCH:', {
        loggedInRole,
        loggedInId,
        searchTerm,
        allowedStaffIds,
        allowedUserIdsCount: allowedUserIds.length,
        whereClause: JSON.stringify(whereClause, null, 2)
      });

      // Step 1: Search wallets with partial username match (case-insensitive)
      const wallets = await Wallet.findAll({
        where: whereClause,
        attributes: [
          'wallet_id',
          'user_id',
          'staff_id',
          'username',
          'user_type',
          'inr_balance',
          'cash',
          'cash_received',
          'totalCommission',
          'profit_loss',
          'verdict',
          'createdAt',
          'updatedAt'
        ],
        include: [{
          model: Staff,
          as: 'staff',
          attributes: ['active', 'bet_locked'],
          required: false,
        }, {
          model: User,
          as: 'user',
          attributes: ['status', 'bet_locked'],
          required: false,
        }],
        limit: limitNum,
        offset,
        order: [['username', 'ASC']],
        raw: true,
      });

      if (wallets.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            results: [],
            pagination: {
              current_page: pageNum,
              total_pages: 0,
              total_results: 0,
              per_page: limitNum,
            },
          },
        });
      }

      // Step 2: Extract user_ids for exposure lookup
      const userIds = wallets
        .map(w => w.user_id)
        .filter(id => id != null);

      // Step 3: Fetch exposures in bulk (user_net_exposure synced every 1s by bgworker)
      let exposureMap = {};
      if (userIds.length > 0) {
        const exposures = await UserNetExposure.findAll({
          where: { user_id: userIds },
          attributes: ['user_id', 'net_exposure'],
          raw: true,
        });
        exposureMap = Object.fromEntries(
          exposures.map(e => [e.user_id, parseFloat(e.net_exposure)])
        );
      }

      // Step 4: Merge exposure + status into results
      const STAFF_TYPES = ['SUPERADMIN', 'ADMIN', 'SUPERMASTER', 'MASTER', 'OWNER', 'COMPANY'];
      const results = wallets.map(w => {
        const isStaff = STAFF_TYPES.includes(w.user_type);
        return {
          ...w,
          total_exposure: w.user_id ? (exposureMap[w.user_id] ?? 0) : 0,
          status: isStaff ? (w['staff.active'] ? 'Active' : 'InActive') : (w['user.status'] || 'Active'),
          active: isStaff ? (w['staff.active'] === true || w['staff.active'] === 1) : (w['user.status'] === 'Active'),
          bet_locked: isStaff ? (w['staff.bet_locked'] === true || w['staff.bet_locked'] === 1) : (w['user.bet_locked'] === true || w['user.bet_locked'] === 1),
        };
      });

      // Step 5: Get total count for pagination
      const totalResults = await Wallet.count({
        where: whereClause,
      });

      const totalPages = Math.ceil(totalResults / limitNum);

      // Final Response
      return res.status(200).json({
        success: true,
        data: {
          results,
          pagination: {
            current_page: pageNum,
            total_pages: totalPages,
            total_results: totalResults,
            per_page: limitNum,
            search_term: searchTerm,
          },
        },
      });
    } catch (error) {
      console.error('Error in searchUsersByUsername:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },






  // staff
  getLoggedInStaffDetails: async (req, res) => {
    try {
      const userId = req.user.account.id; // from your auth middleware (staff_id)

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated',
        });
      }

      // Step 1: Fetch wallet + join with Staff table to get percentage, level, role
      const wallet = await Wallet.findOne({
        where: { staff_id: userId },
        attributes: [
          'wallet_id',
          'staff_id',
          'username',
          'user_type',
          'inr_balance',
          'cash',
          'cash_received',
          'totalCommission',
          'profit_loss',
          'verdict',
          'createdAt',
          'updatedAt'
        ],
        include: [
          {
            model: Staff,
            as: 'staff',
            attributes: ['percentage', 'level', 'role'], // ← This brings the percentage
            required: false,
          },
        ],
        raw: false, // Keep as object so include works
      });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found for this staff member',
        });
      }

      const plainWallet = wallet.get({ plain: true });

      // Step 2: Exposure (user_net_exposure synced every 1s by bgworker)
      let totalExposure = 0;
      if (plainWallet.user_type === 'USER' && plainWallet.user_id) {
        const exposureRecord = await UserNetExposure.findOne({
          where: { user_id: plainWallet.user_id },
          attributes: ['net_exposure'],
        });
        totalExposure = exposureRecord ? parseFloat(exposureRecord.net_exposure) : 0;
      }

      // Step 3: Calculate DownOb & DownPL (sum of inr_balance / profit_loss for direct children)
      // let DownOb = 0;
      // let DownCredit = 0;
      // let DownPL = 0;
      // // Direct children staff
      // const directStaff = await Staff.findAll({
      //   where: { parent_id: userId },
      //   attributes: ['staff_id'],
      //   raw: true
      // });
      // const childStaffIds = directStaff.map(s => s.staff_id);

      // // Direct children users
      // const directUsers = await User.findAll({
      //   where: { parent_staff_id: userId },
      //   attributes: ['user_id'],
      //   raw: true
      // });
      // const childUserIds = directUsers.map(u => u.user_id);

      // if (childStaffIds.length > 0 || childUserIds.length > 0) {
      //   const orConditions = [];
      //   if (childStaffIds.length > 0) orConditions.push({ staff_id: { [Op.in]: childStaffIds } });
      //   if (childUserIds.length > 0) orConditions.push({ user_id: { [Op.in]: childUserIds } });

      //   const childWallets = await Wallet.findAll({
      //     where: { [Op.or]: orConditions },
      //     attributes: ['inr_balance', 'cash_received', 'profit_loss'],
      //     raw: true
      //   });
      //   DownOb = childWallets.reduce((sum, w) => sum + (parseFloat(w.inr_balance) || 0), 0);
      //   DownCredit = childWallets.reduce((sum, w) => sum + (parseFloat(w.cash_received) || 0), 0);
      //   DownPL = childWallets.reduce((sum, w) => sum + (parseFloat(w.profit_loss) || 0), 0);
      // }
      //=================================================  replaced step 3 v2  ============
      // Step 3: Calculate DownOb & DownCredit
      //
      // Rule (peer-to-peer borrow model):
      //   DownOb     = ALL descendants' inr_balance  (total money alive in subtree)
      //   DownCredit = DIRECT children's cash_received ONLY
      //                (what this node personally gave out; sub-distributions are
      //                 already inside the direct child's own balance — counting
      //                 them again would double-count and inflate DownCredit)
      let DownOb = 0;
      let DownCredit = 0;

      // --- DownOb: sum inr_balance of ALL descendant staff + users ---
      const allDescendantStaffIds = await getAllDescendantStaffIds(userId);
      const childStaffIds = allDescendantStaffIds.filter(id => id !== userId);

      const allUsers = await User.findAll({
        where: { parent_staff_id: { [Op.in]: childStaffIds.length > 0 ? childStaffIds : [userId] } },
        attributes: ['user_id'],
        raw: true
      });
      const directUsersForOb = await User.findAll({
        where: { parent_staff_id: userId },
        attributes: ['user_id'],
        raw: true
      });
      const allUserIds = [...new Set([...allUsers.map(u => u.user_id), ...directUsersForOb.map(u => u.user_id)])];

      const obConditions = [];
      if (childStaffIds.length > 0) obConditions.push({ staff_id: { [Op.in]: childStaffIds } });
      if (allUserIds.length > 0) obConditions.push({ user_id: { [Op.in]: allUserIds } });

      if (obConditions.length > 0) {
        const allDescWallets = await Wallet.findAll({
          where: { [Op.or]: obConditions },
          attributes: ['inr_balance'],
          raw: true
        });
        DownOb = allDescWallets.reduce((sum, w) => sum + (parseFloat(w.inr_balance) || 0), 0);
      }

      // --- DownCredit: sum cash_received of DIRECT children only ---
      const directChildStaff = await Staff.findAll({
        where: { parent_id: userId },
        attributes: ['staff_id'],
        raw: true
      });
      const directChildStaffIds = directChildStaff.map(s => s.staff_id);

      const directChildUsers = await User.findAll({
        where: { parent_staff_id: userId },
        attributes: ['user_id'],
        raw: true
      });
      const directChildUserIds = directChildUsers.map(u => u.user_id);

      const creditConditions = [];
      if (directChildStaffIds.length > 0) creditConditions.push({ staff_id: { [Op.in]: directChildStaffIds } });
      if (directChildUserIds.length > 0) creditConditions.push({ user_id: { [Op.in]: directChildUserIds } });

      if (creditConditions.length > 0) {
        const directWallets = await Wallet.findAll({
          where: { [Op.or]: creditConditions },
          attributes: ['cash_received'],
          raw: true
        });
        DownCredit = directWallets.reduce((sum, w) => sum + (parseFloat(w.cash_received) || 0), 0);
      }

      const DownPL = DownOb - DownCredit;

      //===============================================================================

      // Step 4: Final merged response with percentage
      const cash = parseFloat(plainWallet.cash || 0);
      const cashReceived = parseFloat(plainWallet.cash_received || 0);

      const userDetails = {
        wallet_id: plainWallet.wallet_id,
        staff_id: plainWallet.staff_id,
        username: plainWallet.username,
        user_type: plainWallet.user_type,
        role: plainWallet.staff?.role || plainWallet.user_type,
        level: plainWallet.staff?.level || null,
        percentage: plainWallet.staff?.percentage ? parseFloat(plainWallet.staff.percentage) : null,
        inr_balance: parseFloat(plainWallet.inr_balance || 0),
        cash: cash,
        cash_received: cashReceived,
        totalCommission: parseFloat(plainWallet.totalCommission || 0),
        profit_loss: parseFloat(plainWallet.profit_loss || 0),
        verdict: plainWallet.verdict,
        total_exposure: totalExposure,
        DownOb,
        DownPL,
        DownCredit,
        createdAt: plainWallet.createdAt,
        updatedAt: plainWallet.updatedAt,

        // Exact explicit keys for frontend Users2 UI
        UpperLevelCreditReference: cashReceived,
        TotalMasterBalance: cash + DownOb,
        UpperLevel: cashReceived - (cash + DownOb),
        DownLevelOccupyBalance: DownOb,
        DownLevelCreditReference: DownCredit,
        DownLevelProfitLoss: DownOb - DownCredit,
        AvailableBalance: cash,
        AvailableBalanceWithProfitLoss: cash,
        MyProfitLoss: 0
      };

      return res.status(200).json({
        success: true,
        data: {
          user: userDetails,
        },
      });

    } catch (error) {
      console.error('Error in getLoggedInStaffDetails:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // user
  getLoggedInUserDetails: async (req, res) => {

    console.log("logged in user profile", req.body,)
    try {
      const userId = req.user.account.id; // Ensure auth middleware sets req.user
      console.log("logged in user id", userId)

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated',
        });
      }

      // Step 1: Fetch wallet for the logged-in user
      const wallet = await Wallet.findOne({
        where: { user_id: userId },
        attributes: [
          'wallet_id',
          'user_id',
          'username',
          'user_type',
          'inr_balance',
          'cash',
          'cash_received',
          'totalCommission',
          'profit_loss',
          'verdict',
          'createdAt',
          'updatedAt'
        ],
        raw: true,
      });

      if (!wallet) {
        // Auto-create missing wallet for this user
        try {
          const userRecord2 = await User.findByPk(userId, { attributes: ['username'], raw: true });
          await WalletService.createWallet(userId, 'User', null, userRecord2?.username || `user_${userId}`);
          wallet = await Wallet.findOne({
            where: { user_id: userId },
            attributes: ['wallet_id', 'user_id', 'username', 'user_type', 'inr_balance', 'cash', 'profit_loss', 'verdict', 'createdAt', 'updatedAt'],
            raw: true,
          });
        } catch (walletErr) {
          console.error('Failed to auto-create wallet:', walletErr.message);
          return res.status(404).json({ success: false, error: 'Wallet not found and could not be created' });
        }
      }

      // Step 2: Fetch total exposure from user_net_exposure (synced every 1s by bgworker - most reliable)
      const exposureRecord = await UserNetExposure.findOne({
        where: { user_id: userId },
        attributes: ['net_exposure'],
        raw: true,
      });

      const totalExposure = exposureRecord
        ? parseFloat(exposureRecord.net_exposure)
        : 0;

      // Step 2.5: Fetch User details for 2FA status
      const userRecord = await User.findOne({
        where: { user_id: userId },
        attributes: ['telegram2FAEnabled', 'telegramChatId'],
        raw: true
      });

      // Step 3: Merge wallet + exposure + user details
      const userDetails = {
        ...wallet,
        total_exposure: totalExposure,
        telegram2FAEnabled: userRecord?.telegram2FAEnabled || false,
        telegramChatId: userRecord?.telegramChatId || null
      };

      // ✅ Final Response
      return res.status(200).json({
        success: true,
        data: {
          user: userDetails,
        },
      });
    } catch (error) {
      console.error('Error in getLoggedInUserDetails:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  getLoggedInOwnerDetails: async (req, res) => {
    try {
      const ownerId = req.user.account.id; // Your auth middleware should set req.user.id = owner_id

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Owner not authenticated',
        });
      }

      // Step 1: Fetch Owner details directly from Owner table
      const owner = await Owner.findOne({
        where: { owner_id: ownerId },
        attributes: [
          'owner_id',
          'username',
          'website_name',
          'domain_name',
          'website_ui',
          'country',
          'logo',
          'favicon',
          'subscription_plan',
          'platform_name',
          'site_email_address',
          'account_status',
          'createdAt',
          'updatedAt'
        ],
        // No need for include — everything is in Owner table
        raw: false,
      });

      if (!owner) {
        return res.status(404).json({
          success: false,
          error: 'Owner account not found',
        });
      }

      const plainOwner = owner.get({ plain: true });

      // Step 2: Fetch owner's wallet
      const ownerWallet = await Wallet.findOne({
        where: { user_type: 'OWNER' },
        attributes: ['inr_balance', 'cash', 'cash_received', 'totalCommission', 'profit_loss', 'verdict'],
        raw: true,
      });

      const cash = ownerWallet ? parseFloat(ownerWallet.cash || 0) : 0;
      const cashReceived = ownerWallet ? parseFloat(ownerWallet.cash_received || 0) : 0;

      // Step 3: Calculate aggregated details for Owner (direct staff where parent_owner_id = ownerId AND parent_id is null)
      const directStaffWallets = await Wallet.findAll({
        include: [{
          model: Staff,
          as: 'staff',
          where: { parent_owner_id: ownerId, parent_id: null },
          required: true,
          attributes: []
        }],
        attributes: ['inr_balance', 'cash_received', 'profit_loss'],
        raw: true
      });

      const DownOb = directStaffWallets.reduce((sum, w) => sum + (parseFloat(w.inr_balance) || 0), 0);
      const DownCredit = directStaffWallets.reduce((sum, w) => sum + (parseFloat(w.cash_received) || 0), 0);
      const DownPL = directStaffWallets.reduce((sum, w) => sum + (parseFloat(w.profit_loss) || 0), 0);

      // Step 4: Final response — clean & consistent with staff endpoint
      const ownerDetails = {
        owner_id: plainOwner.owner_id,
        username: plainOwner.username,
        website_name: plainOwner.website_name,
        domain_name: plainOwner.domain_name,
        website_ui: plainOwner.website_ui,
        country: plainOwner.country,
        logo: plainOwner.logo,
        favicon: plainOwner.favicon,
        subscription_plan: plainOwner.subscription_plan,
        platform_name: plainOwner.platform_name,
        site_email_address: plainOwner.site_email_address,
        account_status: plainOwner.account_status,
        role: 'OWNER',
        level: null,
        percentage: null, // Owners don't have downline percentage
        inr_balance: ownerWallet ? parseFloat(ownerWallet.inr_balance || 0) : 0,
        cash: cash,
        cash_received: cashReceived,
        totalCommission: ownerWallet ? parseFloat(ownerWallet.totalCommission || 0) : 0,
        profit_loss: ownerWallet ? parseFloat(ownerWallet.profit_loss || 0) : 0,
        verdict: ownerWallet ? (ownerWallet.verdict || 'profit') : 'profit',
        total_exposure: 0,
        DownOb,
        DownCredit,
        DownPL,
        createdAt: plainOwner.createdAt,
        updatedAt: plainOwner.updatedAt,

        // Exact explicit keys for frontend Users2 UI
        UpperLevelCreditReference: cashReceived,
        TotalMasterBalance: cash + DownOb,
        UpperLevel: cashReceived - (cash + DownOb),
        DownLevelOccupyBalance: DownOb,
        DownLevelCreditReference: DownCredit,
        DownLevelProfitLoss: DownOb - DownCredit,
        AvailableBalance: cash,
        AvailableBalanceWithProfitLoss: cash,
        MyProfitLoss: 0
      };

      return res.status(200).json({
        success: true,
        data: {
          user: ownerDetails,
        },
      });

    } catch (error) {
      console.error('Error in getLoggedInOwnerDetails:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  getUserExposures: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.account.id;

      const exposures = await UserExposure.findAll({
        where: { user_id: userId },
        raw: true
      });

      const formattedExposures = {};

      exposures.forEach(exp => {
        if (!formattedExposures[exp.match_id]) {
          formattedExposures[exp.match_id] = {
            match_title: exp.match_title,
            teams: {},
            markets: {}
          };
        }
        // Flat teams (backward compat)
        formattedExposures[exp.match_id].teams[exp.team_name] = parseFloat(exp.exposure_amount);
        // Grouped by game_type
        const marketName = exp.game_type || 'MATCH_ODDS';
        if (!formattedExposures[exp.match_id].markets[marketName]) {
          formattedExposures[exp.match_id].markets[marketName] = {};
        }
        formattedExposures[exp.match_id].markets[marketName][exp.team_name] = parseFloat(exp.exposure_amount);
      });

      return res.json({
        success: true,
        exposures: formattedExposures
      });

    } catch (error) {
      console.error('Error in getUserExposures:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  getNetExposures: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.account?.id || req.user.user_id;

      // Read from user_net_exposure — synced every 1s by the background worker (most reliable)
      const record = await UserNetExposure.findOne({
        where: { user_id: userId },
        raw: true
      });

      return res.json({
        success: true,
        exposures: record ? parseFloat(record.net_exposure) : 0
      });

    } catch (error) {
      console.error('Error in getNetExposures:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },


  getUserExposuresByHierarchyAndMatch: async (req, res) => {
    try {
      console.log("📥 getUserExposuresByHierarchyAndMatch req.body:", req.body);

      const { role, username, matchId } = req.body;

      // 🔎 Validation
      if (!role || !username || !matchId) {
        return res.status(400).json({
          success: false,
          message: 'role, username, and matchId are required',
        });
      }

      // 1️⃣ Resolve all user_ids under hierarchy
      const userIds = await getUserIdsByHierarchy(role, username);
      console.log(`🔍 Resolved ${userIds.length} user IDs under hierarchy for role=${role}, username=${username}`);

      if (!userIds || userIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No users found under given hierarchy',
        });
      }

      // 2️⃣ Fetch exposures for those users & match
      const exposures = await UserExposure.findAll({
        where: {
          user_id: { [Op.in]: userIds },
          match_id: matchId,
        },
        attributes: [
          'id',
          'user_id',
          'match_id',
          'team_name',
          'exposure_amount',
          'match_title',
          'game_type',
          'created_at',
          'updated_at',
        ],
        order: [['user_id', 'ASC']],
        raw: true,
      });

      // ✅ Success response
      return res.status(200).json({
        success: true,
        data: exposures,
        meta: {
          role,
          username,
          match_id: matchId,
          total_users: userIds.length,
          total_records: exposures.length,
        },
      });

    } catch (error) {
      console.error('❌ Error in getUserExposuresByHierarchyAndMatch:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user exposures',
        error: error.message,
      });
    }
  },

};

export default UserController;


