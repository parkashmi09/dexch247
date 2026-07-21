import Staff from '../../model/admin/Staff.js';
import Owner from '../../model/admin/Owner.js';
import sequelize from '../../config/db.js';

const TransactionPasswordController = {
  // 🔐 Verify Transaction Password
  verifyTransactionPassword: async (req, res) => {
    try {
      const { transactionPassword } = req.body;
      const userId = req.user.account.id || req.user.staff_id || req.user.owner_id;
      const userRole = req.user.role;

      if (!transactionPassword) {
        return res.status(400).json({ success: false, message: 'Transaction password is required' });
      }

      let user;
      if (userRole === 'OWNER' || userRole === 'Owner') {
        user = await Owner.findOne({ where: { owner_id: userId } });
      } else {
        user = await Staff.findByPk(userId);
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.transaction_password === transactionPassword) {
        return res.status(200).json({ success: true, message: 'Transaction password verified' });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid transaction password' });
      }
    } catch (error) {
      console.error('❌ Verify transaction password error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 🔄 Regenerate Transaction Password (Owner Only)
  regenerateTransactionPassword: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { userId, userType } = req.body; // userType: 'STAFF' or 'OWNER' (optional if implied)
      
      // Ensure requester is an OWNER
      if (req.user.role !== 'OWNER' && req.user.role !== 'Owner') {
        await t.rollback();
        return res.status(403).json({ success: false, message: 'Access denied. Only Owners can regenerate transaction passwords.' });
      }

      if (!userId) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      let targetUser;
      // Determine target user model. Default to Staff if not specified or check both?
      // Assuming explicit type or try finding in both. Let's rely on userType or try Staff first then Owner.
      // Since Owner regenerates for "himself or downline staff", we need to handle both.
      
      if (userType === 'OWNER' || (!userType && userId === req.user.owner_id)) {
          targetUser = await Owner.findByPk(userId, { transaction: t });
      } else {
          targetUser = await Staff.findByPk(userId, { transaction: t });
      }

      if (!targetUser) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Target user not found' });
      }

      // Generate new 6-digit random number
      const newTransactionPassword = Math.floor(100000 + Math.random() * 900000).toString();

      // Update user
      await targetUser.update({ transaction_password: newTransactionPassword }, { transaction: t });

      await t.commit();

      res.status(200).json({
        success: true,
        message: 'Transaction password regenerated successfully',
        transactionPassword: newTransactionPassword,
      });

    } catch (error) {
      await t.rollback();
      console.error('❌ Regenerate transaction password error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

export default TransactionPasswordController;
