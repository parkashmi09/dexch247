import * as lordsAuthService from '../services/authService.js';

export const updateLordsPassword = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const userId = req.user.account ? req.user.account.id : (req.user.user_id || req.user.staff_id || req.user.owner_id);
    const userRole = req.user.role;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
    }

    const result = await lordsAuthService.updatePassword(userId, userRole, oldPassword, newPassword);

    return res.status(result.status || 200).json({
      success: result.success,
      message: result.message
    });

  } catch (error) {
    console.error('Error in updateLordsPassword:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
