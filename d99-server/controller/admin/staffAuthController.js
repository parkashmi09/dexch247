import StaffAuthService from '../../services/admin/staffAuthService.js';

import ActivityLogService from '../../services/admin/ActivityLogService.js';

const StaffAuthController = {
  // 🧩 Login handler
  login: async (req, res) => {
    try {
      const { email, username, password, deviceId } = req.body;

      // Allow either email OR username
      const identifier = email || username;

      if (!identifier || !password)
        return res.status(400).json({ error: 'Email/Username and password are required' });

      const result = await StaffAuthService.login(identifier, password, deviceId);

      if (result.require2FA) {
        return res.status(200).json({
          success: true,
          require2FA: true,
          staffId: result.staffId,
          message: result.message
        });
      }

      // 📝 Log Activity
      await ActivityLogService.log({
        req,
        user: result.staff,
        action: 'LOGIN',
        details: 'Staff login successful',
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.token,
        first_login: result.staff.first_login,
      });
    } catch (error) {
      console.error('❌ Staff login error:', error);
      res.status(401).json({ success: false, error: error.message });
    }
  },

  // 🔐 Verify 2FA Logic
  verify2FA: async (req, res) => {
    try {
      const { staffId, otp, deviceId } = req.body;
      if (!staffId || !otp) return res.status(400).json({ success: false, error: 'Staff ID and OTP required' });

      const result = await StaffAuthService.verify2FA(staffId, otp, deviceId);

      // 📝 Log Activity
      await ActivityLogService.log({
        req,
        user: result.staff,
        action: 'LOGIN_2FA',
        details: 'Staff 2FA verified',
      });

      res.json({
        success: true,
        message: '2FA Verified',
        token: result.token,
        first_login: result.staff.first_login
      });

    } catch (error) {
      console.error('❌ Staff Verify 2FA Error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // 🚪 Logout handler
  logout: async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token)
        return res.status(400).json({ error: 'Token not provided' });

      await StaffAuthService.logout(token);
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
      console.error('❌ Staff logout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  // 👤 Get Profile handler
  getProfile: async (req, res) => {
    try {
      // req.user is populated by authMiddleware
      const  staff_id  = req.user.account.id;
      
      if (!staff_id) {
        return res.status(400).json({ error: 'Invalid token payload: staff_id missing' });
      }

      const data = await StaffAuthService.getProfile(staff_id);
      res.status(200).json({
        success: true,
        data: { user: data }, // Wrap in user object to match frontend expectation
      });
    } catch (error) {
      console.error('❌ Staff getProfile error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default StaffAuthController;
