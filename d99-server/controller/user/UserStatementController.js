import UserStatementService from '../../services/user/UserStatementService.js';

const UserStatementController = {
  /**
   * Get account statement for the logged-in user.
   */
  getAccountStatement: async (req, res) => {
    try {
      console.log('📝 [UserStatementController] getAccountStatement request:', req.body);
      
      const user = {
        id: req.user.user_id || req?.user?.account?.id,
        username: req.user.username,
        role: req.user.role
      };

      if (!user.id) {
        return res.status(401).json({ success: false, message: 'User not authenticated or ID missing' });
      }

      const result = await UserStatementService.getAccountStatement(user, req.body);
      return res.status(200).json(result);

    } catch (error) {
      console.error('❌ [UserStatementController] Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

export default UserStatementController;
