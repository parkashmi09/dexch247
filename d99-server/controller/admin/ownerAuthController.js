

import OwnerAuthService from '../../services/admin/ownerAuthService.js';

import ActivityLogService from '../../services/admin/ActivityLogService.js';

const OwnerAuthController = {
  // 🧩 Login
  login: async (req, res) => {
    try {
      const { site_email_address, email, username, password, deviceId } = req.body;

      // Allow site_email_address, email, OR username
      const identifier = site_email_address || email || username;

      if (!identifier || !password)
        return res.status(400).json({ error: 'Email/Username and password are required' });

      const result = await OwnerAuthService.login(identifier, password, deviceId);

      if (result.require2FA) {
        return res.status(200).json({
          success: true,
          require2FA: true,
          ownerId: result.ownerId,
          message: result.message
        });
      }

      // 📝 Log Activity
      await ActivityLogService.log({
        req,
        user: result.owner,
        action: 'LOGIN',
        details: 'Owner login successful',
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.token,
        first_login: result.owner.first_login,
      });
    } catch (error) {
      console.error('❌ Owner login error:', error);
      res.status(401).json({ success: false, error: error.message });
    }
  },

  // 🔐 Verify 2FA Logic
  verify2FA: async (req, res) => {
    try {
      const { ownerId, otp, deviceId } = req.body;
      if (!ownerId || !otp) return res.status(400).json({ success: false, error: 'Owner ID and OTP required' });

      const result = await OwnerAuthService.verify2FA(ownerId, otp, deviceId);

      // 📝 Log Activity
      await ActivityLogService.log({
        req,
        user: result.owner,
        action: 'LOGIN_2FA',
        details: 'Owner 2FA verified',
      });

      res.json({
        success: true,
        message: '2FA Verified',
        token: result.token,
        first_login: result.owner.first_login
      });

    } catch (error) {
      console.error('❌ Owner Verify 2FA Error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // 🚪 Logout
  logout: async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token)
        return res.status(400).json({ error: 'Token not provided' });

      await OwnerAuthService.logout(token);
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
      console.error('❌ Owner logout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 👤 Get Profile
  getProfile: async (req, res) => {
    try {
      // req.user is populated by authMiddleware
      const owner_id  = req.user.account.id;
      
      if (!owner_id) {
        return res.status(400).json({ error: 'Invalid token payload: owner_id missing' });
      }

      const profile = await OwnerAuthService.getProfile(owner_id);
      
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('❌ Owner getProfile error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  // ⚙️ Update Platform Configurations
  updatePlatformConfigurations: async (req, res) => {
    try {
      const owner_id = req.user.account?.id;
      const { platform_configurations } = req.body;

      if (!owner_id) {
        return res.status(400).json({ error: 'Invalid token payload: owner_id missing' });
      }

      if (!platform_configurations) {
        return res.status(400).json({ error: 'Platform configurations are required' });
      }

      const updatedConfig = await OwnerAuthService.updatePlatformConfigurations(owner_id, platform_configurations);

      res.status(200).json({
        success: true,
        message: 'Platform configurations updated successfully',
        data: updatedConfig,
      });
    } catch (error) {
      console.error('❌ Owner updatePlatformConfigurations error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default OwnerAuthController;
