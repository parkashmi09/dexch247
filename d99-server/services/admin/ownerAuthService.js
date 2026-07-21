import Owner from '../../model/admin/Owner.js';
import Staff from '../../model/admin/Staff.js';
import Wallet from '../../model/admin/Wallet.js';
import TokenBlacklist from '../../model/admin/TokenBlacklist.js';
import PasswordService from '../passwordService.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import crypto from 'crypto';

const OwnerAuthService = {
  // 🧩 Secure Owner Login
  login: async (identifier, password, deviceId) => {
    try {
      // 1️⃣ Input validation
      if (!identifier || !password) {
        throw new Error('Email/Username and password are required');
      }

      // 2️⃣ Find owner record by email OR username
      const owner = await Owner.findOne({
        where: {
          [Op.or]: [
            { site_email_address: { [Op.iLike]: identifier } },
            { username: { [Op.iLike]: identifier } }
          ]
        }
      });

      if (!owner) {
        throw new Error('Owner not found');
      }

      // 3️⃣ Compare password using PasswordService
      const isMatch = await PasswordService.comparePassword(password, owner.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // 3.5️⃣ Check 2FA
      if (owner.telegram2FAEnabled && owner.telegramChatId) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        global.otpCache = global.otpCache || {};
        global.otpCache[`owner_${owner.owner_id}`] = { otp, expires: Date.now() + 5 * 60 * 1000 };

        const TelegramBotService = (await import('../user/TelegramBotService.js')).default;
        await TelegramBotService.sendMessage(owner.telegramChatId, `🔐 *Owner Login OTP*\nYour Code: <b>${otp}</b>\nValid for 5 minutes.`);

        return {
          require2FA: true,
          ownerId: owner.owner_id,
          message: '2FA OTP sent to your linked Telegram'
        };
      }

      console.log('✅ Owner login:', {
        owner_id: owner.owner_id,
        website_name: owner.website_name,
        role: owner.role,
      });

      // Establish the active session id (single-session enforcement).
      // Same browser reuses its deviceId; a different device overwrites it
      // and invalidates the previous device's token.
      const sessionId = deviceId || crypto.randomUUID();
      owner.login_id = sessionId;
      await owner.save();

      // 4️⃣ Build secure JWT payload
      const payload = {
        actor: {
          type: "OWNER",
          id: owner.owner_id
        },
        account: {
          type: "OWNER",
          id: owner.owner_id
        },
        role: owner.role?.toUpperCase() || "OWNER",
        level: 1,
        username: owner.username || owner.website_name || owner.client_name,
        permissions: null,
        sid: sessionId
      };


      console.log('🎯 Owner JWT Payload:', payload);

      // 5️⃣ Safely sign JWT
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || '1d',
      });

      return {
        token,
        owner: {
          id: owner.owner_id,
          username: owner.username || owner.website_name,
          role: owner.role?.toUpperCase() || 'OWNER',
          first_login: owner.first_login,
        }
      };
    } catch (error) {
      console.error('❌ OwnerAuthService.login error:', error.message);
      // Cleanly rethrow for controller handling
      throw new Error(error.message || 'Failed to login owner');
    }
  },

  // 🔐 Verify 2FA
  verify2FA: async (ownerId, otp, deviceId) => {
    try {
      const cacheKey = `owner_${ownerId}`;
      const record = global.otpCache && global.otpCache[cacheKey];

      if (!record) throw new Error('OTP expired or not requested');
      if (record.otp !== otp) throw new Error('Invalid OTP');
      if (Date.now() > record.expires) {
        delete global.otpCache[cacheKey];
        throw new Error('OTP expired');
      }

      delete global.otpCache[cacheKey];

      const owner = await Owner.findByPk(ownerId);
      if (!owner) throw new Error('Owner not found');

      console.log('✅ Owner 2FA Verified:', owner.username);

      // Establish the active session id (single-session enforcement)
      const sessionId = deviceId || crypto.randomUUID();
      owner.login_id = sessionId;
      await owner.save();

      // 4️⃣ Build secure JWT payload
      const payload = {
        actor: {
          type: "OWNER",
          id: owner.owner_id
        },
        account: {
          type: "OWNER",
          id: owner.owner_id
        },
        role: owner.role?.toUpperCase() || "OWNER",
        level: 1,
        username: owner.username || owner.website_name || owner.client_name,
        permissions: null,
        sid: sessionId
      };


      // 5️⃣ Safely sign JWT
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || '1d',
      });

      return {
        token,
        owner: {
          id: owner.owner_id,
          username: owner.username || owner.website_name,
          role: owner.role?.toUpperCase() || 'OWNER',
          first_login: owner.first_login,
        }
      };

    } catch (error) {
      throw new Error(error.message || '2FA Verification failed');
    }
  },

  // 🚪 Owner Logout
  logout: async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      await TokenBlacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),
      });

      console.log(`🗑️ Token blacklisted for owner_id: ${decoded.owner_id}`);
    } catch (error) {
      console.error('❌ OwnerAuthService.logout error:', error.message);
      throw new Error('Failed to logout owner');
    }
  },

  // 👤 Get Owner Profile
  getProfile: async (owner_id) => {
    try {
      const owner = await Owner.findByPk(owner_id, {
        attributes: { exclude: ['password'] }, // Exclude sensitive data
      });

      if (!owner) {
        throw new Error('Owner not found');
      }

      // Fetch wallet manually to ensure it's included
      const wallet = await Wallet.findOne({ where: { owner_id } });

      // Rule (peer-to-peer borrow model):
      //   DownOb     = ALL descendants' inr_balance  (total money alive in subtree)
      //   DownCredit = DIRECT children's cash_received ONLY (no double-counting)

      // --- DIRECT children of owner: top-level staff (parent_id IS NULL) ---
      const directStaff = await Staff.findAll({
        where: { parent_owner_id: owner_id, parent_id: null },
        attributes: ['staff_id'],
        raw: true
      });
      const directStaffIds = directStaff.map(s => s.staff_id);

      // --- ALL descendant staff IDs recursively (for DownOb) ---
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

      // ALL users under owner directly or under any descendant staff
      const { default: User } = await import('../../model/user/User.js');
      const allDescUsers = await User.findAll({
        where: allDescStaffIds.length > 0
          ? { [Op.or]: [
              { parent_owner_id: owner_id },
              { parent_staff_id: { [Op.in]: allDescStaffIds } }
            ]}
          : { parent_owner_id: owner_id },
        attributes: ['user_id'],
        raw: true
      });
      const allDescUserIds = allDescUsers.map(u => u.user_id);

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
      if (directStaffIds.length > 0) {
        const creditWallets = await Wallet.findAll({
          where: { staff_id: { [Op.in]: directStaffIds } },
          attributes: ['cash_received'],
          raw: true
        });
        DownCredit = creditWallets.reduce((sum, w) => sum + (parseFloat(w.cash_received) || 0), 0);
      }

      const DownPL = DownOb - DownCredit;
 
      const profileData = {
        ...owner.toJSON(),
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

      return profileData;
    } catch (error) {
      console.error('❌ OwnerAuthService.getProfile error:', error.message);
      throw new Error('Failed to fetch owner profile');
    }
  },
  // ⚙️ Update Platform Configurations
  updatePlatformConfigurations: async (owner_id, config) => {
    try {
      const owner = await Owner.findByPk(owner_id);
      if (!owner) {
        throw new Error('Owner not found');
      }

      // Convert object to string if model expects string, or keep as object if JSON type
      // Sequelize usually handles JSON fields automatically if defined as DataTypes.JSON
      // But verify just in case. Assuming it handles object directly if defined as JSON.

      // Update field
      owner.platform_configurations = config;

      await owner.save();

      return owner.platform_configurations;
    } catch (error) {
      console.error('❌ OwnerAuthService.updatePlatformConfigurations error:', error.message);
      throw new Error('Failed to update platform configurations');
    }
  },
};

export default OwnerAuthService;
