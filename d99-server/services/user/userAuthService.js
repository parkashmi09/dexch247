


import User from '../../model/user/User.js';
import { Op } from 'sequelize';
import TokenBlacklist from '../../model/admin/TokenBlacklist.js'; // shared blacklist
import PasswordService from '../passwordService.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const UserAuthService = {
  // 🧩 Secure User Login
  login: async (identifier, password, deviceId) => {
    try {
      // 1️⃣ Validate input
      if (!identifier || !password) {
        throw new Error('Email/Username and password are required');
      }

      // 2️⃣ Find user
      const user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email: { [Op.iLike]: identifier } },
            { username: { [Op.iLike]: identifier } }
          ]
        } 
      });
      if (!user) {
        throw new Error('User not found');
      }

      // Check status
      if (user.status !== 'Active') {
        throw new Error('Account is inactive. Please contact support.');
      }

      // 3️⃣ Compare password securely
      const isMatch = await PasswordService.comparePassword(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // 3.5️⃣ Check 2FA
      if (user.telegram2FAEnabled && user.telegramChatId) {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Store OTP in simple in-memory cache (Production should use Redis)
          // We attach it to the service for now, or a global object.
          // Since this is a module, we can use a module-level variable but it won't scale.
          // For now, let's use a simple global object for demonstration/MVP.
          global.otpCache = global.otpCache || {};
          global.otpCache[user.user_id] = { otp, expires: Date.now() + 5 * 60 * 1000 };

          const TelegramBotService = (await import('./TelegramBotService.js')).default;
          await TelegramBotService.sendMessage(user.telegramChatId, `🔐 Your Login OTP is: <b>${otp}</b>\nValid for 5 minutes.`);

          // Generate a temporary restricted token or just return a flag
          // Returning a flag is safer.
          return {
              require2FA: true,
              userId: user.user_id,
              message: '2FA OTP sent to your Telegram'
          };
      }

      console.log('✅ User login:', {
        user_id: user.user_id,
        username: user.username,
        parent_staff_id: user.parent_staff_id,
        owner_id: user.owner_id,
      });

      // 4️⃣ Establish the active session id and persist it.
      //    We key the session on the browser's stable deviceId: logging in
      //    again from the SAME browser reuses the same id (current browser is
      //    NOT logged out), while a login from a DIFFERENT device overwrites
      //    login_id, so the previous device's token stops matching and gets
      //    rejected by authMiddleware. Fall back to a random id when no
      //    deviceId is supplied (e.g. API clients), which kicks all others.
      const sessionId = deviceId || crypto.randomUUID();
      user.login_id = sessionId;
      await user.save();

      // 5️⃣ Create JWT payload
      const payload = {
        user_id: user.user_id,
        role: user.role || 'USER',
        username: user.username,
        level: 'L4', // for hierarchy rule system
        parent_staff_id: user.parent_staff_id || null,
        owner_id: user.owner_id || null,
        sid: sessionId, // single-session enforcement
      };

      // 6️⃣ Sign JWT Token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || '1d',
      });

      return {
        token,
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role || 'USER',
          passwordChanged: user.passwordChanged,
        }
      };
    } catch (error) {
      console.error('❌ UserAuthService.login error:', error.message);
      // Always rethrow with a clean message so the controller can handle it
      throw new Error(error.message || 'Failed to login user');
    }
  },

  // 🔐 Verify 2FA OTP
  verify2FA: async (userId, otp, deviceId) => {
      try {
          const record = global.otpCache && global.otpCache[userId];
          if (!record) throw new Error('OTP expired or not requested');
          if (record.otp !== otp) throw new Error('Invalid OTP');
          if (Date.now() > record.expires) {
              delete global.otpCache[userId];
              throw new Error('OTP expired');
          }

          // Cleanup
          delete global.otpCache[userId];

          // Proceed to login (Generate Token)
          const user = await User.findByPk(userId);
          if (!user) throw new Error('User not found');

          console.log('✅ 2FA Verified:', user.username);

          // Session id keyed on the browser's stable deviceId (same browser
          // keeps its session; a different device overwrites and kicks it).
          const sessionId = deviceId || crypto.randomUUID();
          user.login_id = sessionId;
          await user.save();

          const payload = {
              user_id: user.user_id,
              role: user.role || 'USER',
              username: user.username,
              level: 'L4',
              parent_staff_id: user.parent_staff_id || null,
              owner_id: user.owner_id || null,
              sid: sessionId, // single-session enforcement
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: process.env.JWT_EXPIRATION || '1d',
          });

          return {
              token,
              user: {
                  id: user.user_id,
                  username: user.username,
                  role: user.role || 'USER',
                  passwordChanged: user.passwordChanged,
              }
          };

      } catch (error) {
          throw new Error(error.message || '2FA Verification failed');
      }
  },

  // 🚪 Logout User (with safety)
  logout: async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await TokenBlacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),
      });
      console.log(`🗑️ Token blacklisted for user_id: ${decoded.user_id}`);
    } catch (error) {
      console.error('❌ UserAuthService.logout error:', error.message);
      throw new Error('Failed to logout user');
    }
  },

  // 🔄 Resend 2FA OTP
  resend2FA: async (userId) => {
      try {
          const user = await User.findByPk(userId);
          if (!user) throw new Error('User not found');
          if (!user.telegramChatId || !user.telegram2FAEnabled) throw new Error('2FA not enabled');

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          global.otpCache = global.otpCache || {};
          global.otpCache[user.user_id] = { otp, expires: Date.now() + 5 * 60 * 1000 };

          const TelegramBotService = (await import('./TelegramBotService.js')).default;
          await TelegramBotService.sendMessage(user.telegramChatId, `🔐 *Resent OTP*\nYour Login OTP is: <b>${otp}</b>\nValid for 5 minutes.`);

          return true;
      } catch (error) {
           console.error('❌ Resend 2FA Error:', error.message);
           throw new Error('Failed to resend OTP');
      }
  },

  // 🔐 Change Password
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      // 1️⃣ Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 2️⃣ Verify current password
      const isMatch = await PasswordService.comparePassword(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Incorrect current password');
      }

      // 3️⃣ Hash new password
      const hashedPassword = await PasswordService.hashPassword(newPassword);

      // 4️⃣ Update password
      user.password = hashedPassword;
      user.passwordChanged = true;
      await user.save();

      console.log(`✅ Password changed for user_id: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ UserAuthService.changePassword error:', error.message);
      throw new Error(error.message || 'Failed to change password');
    }
  },
};

export default UserAuthService;

