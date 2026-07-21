import UserActivityLog from '../../model/admin/UserActivityLog.js';

const ActivityLogService = {
  /**
   * Log a user activity
   * @param {Object} params
   * @param {Object} params.req - Express request object (to extract IP and User Agent)
   * @param {Object} params.user - User object (should contain id, username, role/user_type)
   * @param {string} params.action - Action name (e.g., 'LOGIN', 'PASSWORD_CHANGE')
   * @param {string} [params.details] - Optional details
   */
  log: async ({ req, user, action, details = null }) => {
    try {
      const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const browser_detail = req.headers['user-agent'];

      // Determine user_type based on role or explicit type
      let user_type = 'USER';
      if (user.role === 'OWNER') {
        user_type = 'OWNER';
      } else if (user.role && user.role !== 'USER') {
        user_type = 'STAFF';
      } else if (user.user_type) {
        user_type = user.user_type;
      }

      // Determine user_id, staff_id, or owner_id
      let userIdField = {};
      if (user_type === 'OWNER') {
        userIdField = { owner_id: user.id || user.owner_id };
      } else if (user_type === 'STAFF') {
        userIdField = { staff_id: user.id || user.staff_id };
      } else {
        userIdField = { user_id: user.id || user.user_id };
      }

      await UserActivityLog.create({
        username: user.username,
        ...userIdField,
        user_type,
        action,
        ip_address,
        browser_detail,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
      });

      console.log(`📝 Activity Logged: ${user.username} - ${action}`);
    } catch (error) {
      console.error('❌ Failed to log activity:', error.message);
      // Don't throw error to avoid disrupting the main flow
    }
  },

  /**
   * Get logs with filters and pagination
   */
  getLogs: async ({ startDate, endDate, logType, userId, userType, page = 1, limit = 10 }) => {
    try {
      const { Op } = await import('sequelize');
      const offset = (page - 1) * limit;
      const where = {};

      // Date Filter
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59.999Z')],
        };
      }

      // Log Type (Action) Filter
      if (logType) {
        where.action = logType;
      }

      // User Filter
      if (userId && userType) {
        where.user_type = userType;
        if (userType === 'OWNER') where.owner_id = userId;
        else if (userType === 'STAFF') where.staff_id = userId;
        else where.user_id = userId;
      }

      const { count, rows } = await UserActivityLog.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        logs: rows,
      };
    } catch (error) {
      console.error('❌ Failed to fetch logs:', error.message);
      throw error;
    }
  },
};

export default ActivityLogService;
