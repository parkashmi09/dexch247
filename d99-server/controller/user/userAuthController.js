

import UserAuthService from '../../services/user/userAuthService.js';

import ActivityLogService from '../../services/admin/ActivityLogService.js';

const UserAuthController = {
  // 🧩 Login
  login: async (req, res) => {
    try {
      const { email, username, password, deviceId } = req.body;
      const identifier = email || username;

      if (!identifier || !password)
        return res.status(400).json({ success: false, error: 'Email/Username and password are required' });

      const result = await UserAuthService.login(identifier, password, deviceId);

      if (result.require2FA) {
          return res.status(200).json({
              success: true,
              require2FA: true,
              userId: result.userId,
              message: result.message
          });
      }

      const { token, user } = result;

      // 📝 Log Activity
      await ActivityLogService.log({
        req,
        user,
        action: 'LOGIN',
        details: 'User login successful',
      });
      

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        passwordChanged: user.passwordChanged,
      });
    } catch (error) {
      console.error('❌ User login error:', error);
      res.status(401).json({ success: false, error: error.message });
    }
  },

  // 🔐 Verify 2FA
  verify2FA: async (req, res) => {
      try {
          const { userId, otp, deviceId } = req.body;
          if (!userId || !otp) return res.status(400).json({ success: false, error: 'Missing userId or OTP' });

          const { token, user } = await UserAuthService.verify2FA(userId, otp, deviceId);

           // 📝 Log Activity
            await ActivityLogService.log({
                req,
                user,
                action: 'LOGIN_2FA',
                details: 'User 2FA verified',
            });

          res.status(200).json({
              success: true, 
              message: '2FA Verified', 
              token, 
              passwordChanged: user.passwordChanged 
          });
      } catch (error) {
          console.error('❌ Verify 2FA Error:', error);
          res.status(401).json({ success: false, error: error.message });
      }
  },

  // 🔄 Resend 2FA OTP
  resend2FA: async (req, res) => {
      try {
          const { userId } = req.body;
          if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });

          await UserAuthService.resend2FA(userId);
          res.status(200).json({ success: true, message: 'OTP Resent successfully' });
      } catch (error) {
          console.error('❌ Resend 2FA Error:', error);
          res.status(400).json({ success: false, error: error.message });
      }
  },

  // 🚪 Logout
  logout: async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token)
        return res.status(400).json({ success: false, error: 'Token not provided' });

      await UserAuthService.logout(token);
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
      console.error('❌ User logout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },


  // 🔐 Change Password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.account.id; // From authMiddleware

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
      }

      await UserAuthService.changePassword(userId, currentPassword, newPassword);

      // 📝 Log Activity
      await ActivityLogService.log({
        req,
        user: req.user,
        action: 'UPDATE_ACCOUNT',
        details: 'User changed their own password',
      });

      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('❌ Change password error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

export default UserAuthController;
