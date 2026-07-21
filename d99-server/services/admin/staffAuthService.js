

import Staff from '../../model/admin/Staff.js';
import TokenBlacklist from '../../model/admin/TokenBlacklist.js';
import PasswordService from '../passwordService.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const StaffAuthService = {
  // 🧩 Secure Staff Login
  login: async (identifier, password, deviceId) => {
    try {
      // 1️⃣ Input validation
      if (!identifier || !password) {
        throw new Error('Email/Username and password are required');
      }

      // 2️⃣ Find staff by email OR username
      const { Op } = (await import('sequelize')); // Dynamic import if not available globally

      const staff = await Staff.findOne({
        where: {
          [Op.or]: [
            { email: { [Op.iLike]: identifier } },
            { username: { [Op.iLike]: identifier } }
          ]
        }
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      // Check active status (skip for OWNER)
      const role = staff.role?.toUpperCase();
      if (role !== 'OWNER' && !staff.active) {
        throw new Error('Account is inactive. Please contact support.');
      }

      // 3️⃣ Validate password
      const isMatch = await PasswordService.comparePassword(password, staff.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // 3.5️⃣ Check 2FA
      if (staff.telegram2FAEnabled && staff.telegramChatId) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        global.otpCache = global.otpCache || {};
        global.otpCache[`staff_${staff.staff_id}`] = { otp, expires: Date.now() + 5 * 60 * 1000 };

        const TelegramBotService = (await import('../user/TelegramBotService.js')).default;
        await TelegramBotService.sendMessage(staff.telegramChatId, `🔐 *Staff Login OTP*\nYour Code: <b>${otp}</b>\nValid for 5 minutes.`);

        return {
          require2FA: true,
          staffId: staff.staff_id,
          message: '2FA OTP sent to your linked Telegram'
        };
      }

      console.log('✅ Staff login:', {
        staff_id: staff.staff_id,
        role: staff.role,
        username: staff.username,
      });

      // 4️⃣ Establish the active session id (single-session enforcement).
      //    Same browser reuses its deviceId (not logged out); a different
      //    device overwrites login_id and invalidates the previous token.
      const sessionId = deviceId || crypto.randomUUID();
      staff.login_id = sessionId;
      await staff.save();

      // 5️⃣ Build JWT payload
      const payload = {
        actor: {
          type: "STAFF",
          id: staff.staff_id
        },
        account: {
          type: "STAFF",
          id: staff.staff_id
        },
        role: staff.role?.toUpperCase() || 'STAFF',
        level: staff.level || null,
        username: staff.username,
        permissions: null,
        sid: sessionId
      };


      // 6️⃣ Sign JWT safely
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || '1d',
      });

      return {
        token,
        staff: {
          id: staff.staff_id,
          username: staff.username,
          role: staff.role,
          first_login: staff.first_login,
        }
      };
    } catch (error) {
      console.error('❌ StaffAuthService.login error:', error.message);
      throw new Error(error.message || 'Failed to login staff');
    }
  },

  // 🔐 Verify 2FA
  verify2FA: async (staffId, otp, deviceId) => {
    try {
      const cacheKey = `staff_${staffId}`;
      const record = global.otpCache && global.otpCache[cacheKey];

      if (!record) throw new Error('OTP expired or not requested');
      if (record.otp !== otp) throw new Error('Invalid OTP');
      if (Date.now() > record.expires) {
        delete global.otpCache[cacheKey];
        throw new Error('OTP expired');
      }

      delete global.otpCache[cacheKey];

      const staff = await Staff.findByPk(staffId);
      if (!staff) throw new Error('Staff not found');

      console.log('✅ 2FA Verified:', staff.username);

      // Establish the active session id (single-session enforcement)
      const sessionId = deviceId || crypto.randomUUID();
      staff.login_id = sessionId;
      await staff.save();

      // 4️⃣ Build JWT payload
      const payload = {
        actor: {
          type: "STAFF",
          id: staff.staff_id
        },
        account: {
          type: "STAFF",
          id: staff.staff_id
        },
        role: staff.role?.toUpperCase() || 'STAFF',
        level: staff.level || null,
        username: staff.username,
        permissions: null,
        sid: sessionId
      };


      // 5️⃣ Sign JWT safely
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || '1d',
      });

      return {
        token,
        staff: {
          id: staff.staff_id,
          username: staff.username,
          role: staff.role,
          first_login: staff.first_login,
        }
      };

    } catch (error) {
      throw new Error(error.message || '2FA Verification failed');
    }
  },

  // 👤 Get Staff Profile
  getProfile: async (staff_id) => {
    try {
      const staff = await Staff.findByPk(staff_id, {
        attributes: { exclude: ['password'] },
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      // Import Wallet and User dynamically to avoid circular dependencies if any
      const { default: Wallet } = await import('../../model/admin/Wallet.js');
      const { default: User } = await import('../../model/user/User.js');
      
      const wallet = await Wallet.findOne({ where: { staff_id } });

      // Rule (peer-to-peer borrow model):
      //   DownOb     = ALL descendants' inr_balance  (total money alive in subtree)
      //   DownCredit = DIRECT children's cash_received ONLY (no double-counting)

      const { Op } = await import('sequelize');

      // --- DIRECT children (for DownCredit) ---
      const directStaff = await Staff.findAll({
        where: { parent_id: staff_id },
        attributes: ['staff_id'],
        raw: true
      });
      const directStaffIds = directStaff.map(s => s.staff_id);

      const directUsers = await User.findAll({
        where: { parent_staff_id: staff_id },
        attributes: ['user_id'],
        raw: true
      });
      const directUserIds = directUsers.map(u => u.user_id);

      // --- ALL descendant staff IDs (recursive BFS, for DownOb) ---
      let allDescStaffIds = [...directStaffIds];
      let queue = [...directStaffIds];
      while (queue.length > 0) {
        const children = await Staff.findAll({
          where: { parent_id: { [Op.in]: queue } },
          attributes: ['staff_id'],
          raw: true
        });
        const childIds = children.map(c => c.staff_id);
        allDescStaffIds = [...allDescStaffIds, ...childIds];
        queue = childIds;
      }

      // ALL users under any descendant staff
      const allDescUsers = allDescStaffIds.length > 0
        ? await User.findAll({
            where: { parent_staff_id: { [Op.in]: allDescStaffIds } },
            attributes: ['user_id'],
            raw: true
          })
        : [];
      const allDescUserIds = [...new Set([...directUserIds, ...allDescUsers.map(u => u.user_id)])];

      // --- DownOb: ALL descendants' inr_balance ---
      let DownOb = 0;
      const obConditions = [];
      if (allDescStaffIds.length > 0) obConditions.push({ staff_id: { [Op.in]: allDescStaffIds } });
      if (allDescUserIds.length > 0)  obConditions.push({ user_id:  { [Op.in]: allDescUserIds  } });
      if (obConditions.length > 0) {
        const obWallets = await Wallet.findAll({
          where: { [Op.or]: obConditions },
          attributes: ['inr_balance'],
          raw: true
        });
        DownOb = obWallets.reduce((sum, w) => sum + (parseFloat(w.inr_balance) || 0), 0);
      }

      // --- DownCredit: DIRECT children's cash_received only ---
      let DownCredit = 0;
      const creditConditions = [];
      if (directStaffIds.length > 0) creditConditions.push({ staff_id: { [Op.in]: directStaffIds } });
      if (directUserIds.length > 0)  creditConditions.push({ user_id:  { [Op.in]: directUserIds  } });
      if (creditConditions.length > 0) {
        const creditWallets = await Wallet.findAll({
          where: { [Op.or]: creditConditions },
          attributes: ['cash_received'],
          raw: true
        });
        DownCredit = creditWallets.reduce((sum, w) => sum + (parseFloat(w.cash_received) || 0), 0);
      }

      const DownPL = DownOb - DownCredit;

      const profileData = {
        ...staff.toJSON(),
        DownOb,
        DownCredit,
        DownPL
      };

      if (wallet) {
        const walletData = wallet.toJSON();
        // Merge wallet fields into root to match expected flat structure
        Object.assign(profileData, walletData);
      }

      // Pre-calculate exact frontend keys
      const cash = parseFloat(profileData.cash || 0);
      const cashReceived = parseFloat(profileData.cash_received || 0);

      profileData.UpperLevelCreditReference = cashReceived;
      profileData.TotalMasterBalance = cash + DownOb;
      profileData.UpperLevel = cashReceived - (cash + DownOb);
      profileData.DownLevelOccupyBalance = DownOb;
      profileData.DownLevelCreditReference = DownCredit;
      profileData.DownLevelProfitLoss = DownOb - DownCredit;
      profileData.AvailableBalance = cash;
      profileData.AvailableBalanceWithProfitLoss = cash;
      profileData.MyProfitLoss = 0;

      console.log('🌟 DEBUG PROFILE PAYLOAD:', JSON.stringify(profileData, null, 2));

      return profileData;
    } catch (error) {
      console.error('❌ StaffAuthService.getProfile error:', error.message);
      throw new Error('Failed to fetch staff profile');
    }
  },

  // 🚪 Staff Logout
  logout: async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await TokenBlacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),
      });
      console.log(`🗑️ Token blacklisted for staff_id: ${decoded.staff_id}`);
    } catch (error) {
      console.error('❌ StaffAuthService.logout error:', error.message);
      throw new Error('Failed to logout staff');
    }
  },
};

export default StaffAuthService;

