import Staff from '../model/admin/Staff.js';
import Owner from '../model/admin/Owner.js';

const verifyTransactionPassword = async (req, res, next) => {
  try {
    // Expect transaction password in request body
    const { transactionPassword } = req.body;
    
    // User should be authenticated via authMiddleware before this
    const userId = req.user.account ? req.user.account.id : (req.user.user_id || req.user.staff_id || req.user.owner_id);
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

    // Direct comparison since it's stored as plain text
    if (user.transaction_password !== transactionPassword) {
      return res.status(400).json({ success: false, message: 'Transaction password invalid' });
    }

    // Valid
    next();
  } catch (error) {
    console.error('❌ Transaction password verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during verification' });
  }
};

export default verifyTransactionPassword;
