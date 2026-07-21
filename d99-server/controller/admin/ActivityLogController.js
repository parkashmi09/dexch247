import ActivityLogService from '../../services/admin/ActivityLogService.js';

const ActivityLogController = {
  getLogs: async (req, res) => {
    try {
      const { startDate, endDate, logType, userId, userType, page, limit } = req.query;

      // If fetching for a specific user (e.g. from user profile), ensure permissions
      // For now, assuming Admin/Staff with permission can view any logs
      
      const result = await ActivityLogService.getLogs({
        startDate,
        endDate,
        logType,
        userId,
        userType,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ Error fetching activity logs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getMyLogs: async (req, res) => {
    try {
      const { startDate, endDate, logType, page, limit } = req.query;
      const userId = req.user.account.id;
      const userType = 'USER'; // Assuming this endpoint is for USER role

      const result = await ActivityLogService.getLogs({
        startDate,
        endDate,
        logType,
        userId,
        userType,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('❌ Error fetching user activity logs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default ActivityLogController;
