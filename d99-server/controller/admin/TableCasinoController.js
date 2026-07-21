import { Op } from 'sequelize';
import TableCasino from '../../model/admin/TableCasino.js';
import StaffTableLock from '../../model/admin/StaffTableLock.js';
import Staff from '../../model/admin/Staff.js';
import Owner from '../../model/admin/Owner.js';
import User from '../../model/user/User.js';
import UserTableLock from '../../model/admin/UserTableLock.js';
import CasinoBet from '../../model/user/casino.js';
import CasinoResult from '../../model/admin/CasinoResult.js';


// Helper to get all descendant staff IDs recursively
const getAllDescendantStaffIds = async (staffId) => {
  let allIds = [staffId];
  let currentIds = [staffId];

  while (currentIds.length > 0) {
    const children = await Staff.findAll({
      where: { parent_id: { [Op.in]: currentIds } },
      attributes: ['staff_id'],
      raw: true
    });

    if (children.length === 0) break;

    const childIds = children.map(c => c.staff_id);
    allIds = [...allIds, ...childIds];
    currentIds = childIds;
  }
  return allIds;
};

const TableCasinoController = {
  // Get all casinos
  getCasinoList: async (req, res) => {
    try {
      const casinos = await TableCasino.findAll({
        attributes: ['id', 'tablename']
      });
      return res.status(200).json({
        success: true,
        data: casinos
      });
    } catch (error) {
      console.error('Error fetching casino list:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get locks for a specific staff member or owner
  getStaffLocks: async (req, res) => {
    try {
      const { staffId } = req.params;
      const { type } = req.query; // 'SELF' or 'OTHER'
      
      console.log('DEBUG getStaffLocks:', { params: req.params, query: req.query, user: req.user });

      let targetId = staffId;
      let targetType = 'STAFF'; // Default to STAFF

      // 1. Handle "SELF" - Use logged-in user's details from token
      if (type === 'SELF') {
        const { role } = req.user;
        const id = req.user.account ? req.user.account.id : req.user.id; // Fallback just in case
        
        targetId = id;
        
        if (role === 'OWNER' || role === 'COMPANY') {
            targetType = 'OWNER';
        } else {
            targetType = 'STAFF';
        }
      } 
      // 2. Handle "OTHER" (Search/Downline)
      else {
        // Security Check: Ensure target is downline if logged-in user is not Owner/Company
        const loggedInRole = req.user.role;
        const loggedInId = req.user.account ? req.user.account.id : req.user.id;

        if (loggedInRole !== 'OWNER' && loggedInRole !== 'COMPANY') {
             const allowedIds = await getAllDescendantStaffIds(loggedInId);
             
             if (type === 'USER') {
                 // For USER, check if their parent staff is in the allowed list
                 const user = await User.findByPk(staffId);
                 if (!user || !allowedIds.includes(user.parent_staff_id)) {
                     return res.status(403).json({
                         success: false,
                         message: 'Access denied: Target user is not in your downline'
                     });
                 }
                 targetType = 'USER';
             } else {
                 // For STAFF
                 if (!allowedIds.includes(parseInt(staffId))) {
                     return res.status(403).json({
                         success: false,
                         message: 'Access denied: Target user is not in your downline'
                     });
                 }
                 targetType = 'STAFF';
             }
        } else {
            // If Owner/Company, just set type based on request
            if (type === 'USER') targetType = 'USER';
            else targetType = 'STAFF';
        }
      }

      let locks = [];
      if (targetType === 'USER') {
          locks = await UserTableLock.findAll({
            where: { user_id: targetId },
            include: [{
              model: TableCasino,
              as: 'tableCasino',
              attributes: ['id', 'tablename']
            }]
          });
      } else {
          const whereClause = targetType === 'STAFF' ? { staff_id: targetId } : { owner_id: targetId };
          locks = await StaffTableLock.findAll({
            where: whereClause,
            include: [{
              model: TableCasino,
              as: 'tableCasino',
              attributes: ['id', 'tablename']
            }]
          });
      }

      return res.status(200).json({
        success: true,
        data: locks,
        targetType,
        targetId
      });
    } catch (error) {
      console.error('Error fetching staff locks:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

 casinoOpenBets: async (req, res) => {
  try {
    const { game_name } = req.body;

    if (!game_name) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: game_name",
      });
    }

    const openBets = await CasinoBet.findAll({
      where: {
        game_name,
        status: {
          [Op.in]: ["open", "processing"],
        },
      },
      order: [["created_at", "DESC"]],
    });

    if (!openBets.length) {
      return res.status(404).json({
        success: false,
        message: "No open bets found for this game",
      });
    }

    return res.status(200).json({
      success: true,
      count: openBets.length,
      data: openBets,
    });
  } catch (error) {
    console.error("Error fetching casino open bets:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
},

  // Toggle lock for a specific table and staff/owner
  updateStaffLock: async (req, res) => {
    try {
      const { staffId, userId, tableCasinoId, isLocked, type } = req.body; // type: 'SELF', 'USER', 'OTHER'

      if (!tableCasinoId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: tableCasinoId'
        });
      }

      let targetId;
      let targetType;

      // 1. Handle "SELF" (Logged-in User)
      if (!type || type === 'SELF') {
        targetId = req.user.account ? req.user.account.id : req.user.id;
        // Determine if logged-in user is STAFF or OWNER
        // req.user.role is standardized by authMiddleware
        if (req.user.role === 'OWNER' || req.user.role === 'COMPANY') {
            targetType = 'OWNER';
        } else {
            targetType = 'STAFF';
        }
      }
      // 2. Handle "USER" (End User / Bettor)
      else if (type === 'USER') {
        if (!userId) {
             return res.status(400).json({ success: false, message: 'User ID required for USER type' });
        }

        // Security Check
        const loggedInRole = req.user.role;
        const loggedInId = req.user.account ? req.user.account.id : req.user.id;

        if (loggedInRole !== 'OWNER' && loggedInRole !== 'COMPANY') {
             const allowedIds = await getAllDescendantStaffIds(loggedInId);
             const user = await User.findByPk(userId);
             
             if (!user || !allowedIds.includes(user.parent_staff_id)) {
                 return res.status(403).json({
                     success: false,
                     message: 'Access denied: Target user is not in your downline'
                 });
             }
        }
        targetType = 'USER';
        targetId = userId;
      }
      // 3. Handle "OTHER" (Downline Staff)
      else {
        if (!staffId) {
             return res.status(400).json({ success: false, message: 'Staff ID required for OTHER type' });
        }

        // Security Check
        const loggedInRole = req.user.role;
        const loggedInId = req.user.account ? req.user.account.id : req.user.id;

        if (loggedInRole !== 'OWNER' && loggedInRole !== 'COMPANY') {
             const allowedIds = await getAllDescendantStaffIds(loggedInId);
             if (!allowedIds.includes(parseInt(staffId))) {
                 return res.status(403).json({
                     success: false,
                     message: 'Access denied: Target staff is not in your downline'
                 });
             }
        }
        targetType = 'STAFF';
        targetId = staffId;
      }

      let lock;
      if (targetType === 'USER') {
          lock = await UserTableLock.findOne({
              where: { user_id: targetId, table_casino_id: tableCasinoId }
          });

          if (lock) {
              lock.is_locked = isLocked;
              await lock.save();
          } else {
              lock = await UserTableLock.create({
                  user_id: targetId,
                  table_casino_id: tableCasinoId,
                  is_locked: isLocked
              });
          }
      } else {
          const whereClause = targetType === 'STAFF' 
            ? { staff_id: targetId, table_casino_id: tableCasinoId }
            : { owner_id: targetId, table_casino_id: tableCasinoId };

          // Find or create the lock record
          console.log('DEBUG updateStaffLock:', { 
              staffId, userId, tableCasinoId, isLocked, type, 
              targetId, targetType, 
              whereClause 
          });

          lock = await StaffTableLock.findOne({
            where: whereClause
          });

          if (lock) {
            console.log('Lock found, updating...');
            lock.is_locked = isLocked;
            await lock.save();
          } else {
            console.log('Lock not found, creating...');
            const createPayload = {
                table_casino_id: tableCasinoId,
                is_locked: isLocked
            };
            if (targetType === 'STAFF') {
                createPayload.staff_id = targetId;
            } else {
                createPayload.owner_id = targetId;
                createPayload.staff_id = null; // Explicitly set to null to avoid empty string issues
            }
            
            console.log('Create Payload:', createPayload);

            lock = await StaffTableLock.create(createPayload);
          }
      }

      return res.status(200).json({
        success: true,
        message: 'Lock updated successfully',
        data: lock,
        targetType
      });
    } catch (error) {
      console.error('Error updating staff lock:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  getCasinoResults: async (req, res) => {
    try {
      const { game_name ,date} = req.body;
      
      const whereClause = {}; 
      if (game_name) {
        whereClause.gamename = game_name;
      }
      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const results = await CasinoResult.findAll({
        where: whereClause,
        order: [['date', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error fetching casino results:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    } 
    
  },
};

export default TableCasinoController;
