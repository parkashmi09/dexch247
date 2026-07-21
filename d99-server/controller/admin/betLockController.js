import BetLock from "../../model/admin/BetLock.js";
import UserMatchLocks from "../../model/admin/UserMatchLocks.js";
import UserEventMarketLocks from "../../model/admin/UserEventMarketLocks.js";
import User from "../../model/user/User.js";

// Helper: Convert to boolean safely
const toBool = (value) => {
  return value === true || value === 'true' || value === 1 || value === '1';
};

// Helper: Standardized success response
const successResponse = (res, message, data = null, count = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (count !== null) response.count = count;
  return res.status(200).json(response);
};

// Helper: Standardized error response
const errorResponse = (res, message, status = 500) => {
  return res.status(status).json({ success: false, error: message });
};

// ✅ Get single user's lock status with username
export const getBetLock = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return errorResponse(res, "user_id is required in URL params", 400);
    }

    const betLock = await BetLock.findOne({ where: { user_id } });
    const user = await User.findOne({ where: { user_id }, attributes: ['username'] });

    if (!betLock) {
      return successResponse(res, "No record found. Default lock = false", {
        user_id,
        username: user?.username || null,
        MatchOdds: false,
        OtherMarkets: false,
      });
    }

    const lockData = betLock.toJSON();
    lockData.username = user?.username || null;

    return successResponse(res, "Bet lock status retrieved", lockData);
  } catch (error) {
    console.error("getBetLock error:", error);
    return errorResponse(res, "Failed to fetch bet lock status");
  }
};

import { Op } from 'sequelize';
import Staff from "../../model/admin/Staff.js";

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

// ✅ Get all users' lock status with usernames
export const getAllBetLocks = async (req, res) => {
  try {
    // Hierarchy Check
    const loggedInRole = req.user?.role?.toUpperCase();
    const loggedInId = req.user.account.id;
    
    let whereClause = {};

    if (loggedInRole && loggedInRole !== 'OWNER') {
        const allowedStaffIds = await getAllDescendantStaffIds(loggedInId);
        
        // Find users belonging to these staff
        const usersUnderStaff = await User.findAll({
            where: { parent_staff_id: { [Op.in]: allowedStaffIds } },
            attributes: ['user_id'],
            raw: true
        });
        const allowedUserIds = usersUnderStaff.map(u => u.user_id);
        
        whereClause = { user_id: { [Op.in]: allowedUserIds } };
    }

    const data = await BetLock.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
          required: true, // Ensure we only get valid users
        },
      ],
    });

    // Format response to include username
    const formattedData = data.map((lock) => {
      const lockJson = lock.toJSON();
      return {
        ...lockJson,
        username: lock.user?.username || null,
      };
    });

    return successResponse(res, "All bet locks retrieved", formattedData, formattedData.length);
  } catch (error) {
    console.error("getAllBetLocks error:", error);
    return errorResponse(res, "Failed to fetch all bet locks");
  }
};

// ✅ Lock or update single user (UPDATE ONLY - no creation)
export const lockBet = async (req, res) => {
  try {
    const { user_id, match_odds, other_markets } = req.body;

    if (!user_id) {
      return errorResponse(res, "user_id is required", 400);
    }

    // First, check if user exists in BetLock table
    let betLock = await BetLock.findOne({ where: { user_id } });

    if (!betLock) {
      // If user doesn't exist, create the record with initial values
      betLock = await BetLock.create({
        user_id,
        MatchOdds: match_odds !== undefined ? toBool(match_odds) : false,
        OtherMarkets: other_markets !== undefined ? toBool(other_markets) : false,
      });
    } else {
      // If exists, update only the provided fields
      await betLock.update({
        MatchOdds: match_odds !== undefined ? toBool(match_odds) : betLock.MatchOdds,
        OtherMarkets: other_markets !== undefined ? toBool(other_markets) : betLock.OtherMarkets,
      });
    }

    return successResponse(res, "Bet locked/updated successfully", betLock);
  } catch (error) {
    console.error("lockBet error:", error);
    return errorResponse(res, "Failed to lock/update bet");
  }
};

// ✅ Unlock a single user's bets (idempotent)
export const unlockBet = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return errorResponse(res, "user_id is required", 400);
    }

    const [updatedCount] = await BetLock.update(
      { MatchOdds: false, OtherMarkets: false },
      { where: { user_id } }
    );

    if (updatedCount === 0) {
      const [betLock] = await BetLock.findOrCreate({
        where: { user_id },
        defaults: { MatchOdds: false, OtherMarkets: false },
      });
      return successResponse(res, "User was not locked. Default state applied.", betLock);
    }

    const betLock = await BetLock.findOne({ where: { user_id } });
    return successResponse(res, "Bet unlocked successfully", betLock);
  } catch (error) {
    console.error("unlockBet error:", error);
    return errorResponse(res, "Failed to unlock bet");
  }
};

// ✅ Lock multiple users (UPDATE ONLY - no creation)
export const lockMultipleBets = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return errorResponse(res, "users array is required and cannot be empty", 400);
    }

    const results = [];
    const errors = [];

    for (const [index, user] of users.entries()) {
      const { user_id, match_odds, other_markets } = user || {};

      if (!user_id) {
        errors.push({ index, error: "user_id is required" });
        results.push(null);
        continue;
      }

      try {
        // Check if user exists in BetLock table
        let betLock = await BetLock.findOne({ where: { user_id } });

        if (!betLock) {
          // If user doesn't exist, create the record with initial values
          betLock = await BetLock.create({
            user_id,
            MatchOdds: match_odds !== undefined ? toBool(match_odds) : false,
            OtherMarkets: other_markets !== undefined ? toBool(other_markets) : false,
          });
        } else {
          // If exists, update only the provided fields
          await betLock.update({
            MatchOdds: match_odds !== undefined ? toBool(match_odds) : betLock.MatchOdds,
            OtherMarkets: other_markets !== undefined ? toBool(other_markets) : betLock.OtherMarkets,
          });
        }
        results.push(betLock);
      } catch (err) {
        errors.push({ index, user_id, error: err.message });
        results.push(null);
      }
    }

    const successCount = results.filter(r => r !== null).length;

    return res.status(200).json({
      success: true,
      message: `${successCount} users processed`,
      count: successCount,
      data: results.filter(r => r !== null),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("lockMultipleBets error:", error);
    return errorResponse(res, "Failed to lock multiple users");
  }
};

// ✅ Unlock multiple users
export const unlockMultipleBets = async (req, res) => {
  try {
    const { user_ids } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return errorResponse(res, "user_ids array is required and cannot be empty", 400);
    }

    const [updatedCount] = await BetLock.update(
      { MatchOdds: false, OtherMarkets: false },
      { where: { user_id: user_ids } }
    );

    return successResponse(
      res,
      "Selected users unlocked successfully",
      null,
      updatedCount
    );
  } catch (error) {
    console.error("unlockMultipleBets error:", error);
    return errorResponse(res, "Failed to unlock multiple users");
  }
};

// ✅ Lock all users' MatchOdds
export const lockAllMatchOdds = async (req, res) => {
  try {
    const [updatedCount] = await BetLock.update(
      { MatchOdds: true },
      { where: {} }
    );

    return successResponse(
      res,
      "All users' MatchOdds locked successfully",
      null,
      updatedCount
    );
  } catch (error) {
    console.error("lockAllMatchOdds error:", error);
    return errorResponse(res, "Failed to lock all MatchOdds");
  }
};

// ✅ Lock all users' OtherMarkets
export const lockAllOtherMarkets = async (req, res) => {
  try {
    const [updatedCount] = await BetLock.update(
      { OtherMarkets: true },
      { where: {} }
    );

    return successResponse(
      res,
      "All users' OtherMarkets locked successfully",
      null,
      updatedCount
    );
  } catch (error) {
    console.error("lockAllOtherMarkets error:", error);
    return errorResponse(res, "Failed to lock all OtherMarkets");
  }
};

// ✅ Unlock all users (both markets)
export const unlockAllBets = async (req, res) => {
  try {
    const [updatedCount] = await BetLock.update(
      { MatchOdds: false, OtherMarkets: false },
      { where: {} }
    );

    return successResponse(
      res,
      "All users unlocked successfully",
      null,
      updatedCount
    );
  } catch (error) {
    console.error("unlockAllBets error:", error);
    return errorResponse(res, "Failed to unlock all users");
  }
};

// ✅ Lock specific match for user
export const lockMatchForUser = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return errorResponse(res, "user_id and event_id are required", 400);
    }

    const [matchLock, created] = await UserMatchLocks.findOrCreate({
      where: { user_id, event_id: String(event_id) },
      defaults: { is_locked: true }
    });

    if (!created && !matchLock.is_locked) {
      matchLock.is_locked = true;
      await matchLock.save();
    }

    return successResponse(res, "Match locked for user successfully", matchLock);
  } catch (error) {
    console.error("lockMatchForUser error:", error);
    return errorResponse(res, "Failed to lock match for user");
  }
};

// ✅ Unlock specific match for user
export const unlockMatchForUser = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return errorResponse(res, "user_id and event_id are required", 400);
    }

    await UserMatchLocks.destroy({
      where: { user_id, event_id: String(event_id) }
    });

    return successResponse(res, "Match unlocked for user successfully");
  } catch (error) {
    console.error("unlockMatchForUser error:", error);
    return errorResponse(res, "Failed to unlock match for user");
  }
};

// Helper: build where clause using market_id (primary) or market_name (fallback)
const buildMarketWhere = (event_id, market_id, market_name) => {
  const where = { event_id: String(event_id) };
  if (market_id) {
    where.market_id = String(market_id);
  } else if (market_name) {
    where.market_name = market_name;
  }
  return where;
};

// ✅ Get direct children with market lock status for a specific event + market
export const getMarketLockChildren = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { market_id, market_name } = req.query;
    const loggedInRole = req.user?.role?.toUpperCase();
    const loggedInId = req.user?.account?.id;

    console.log('[BetLock] getMarketLockChildren:', { event_id, market_id, market_name, loggedInRole, loggedInId });

    if (!event_id) {
      return errorResponse(res, "event_id is required", 400);
    }
    if (!market_id && !market_name) {
      return errorResponse(res, "market_id or market_name is required", 400);
    }

    let children = [];

    if (loggedInRole === 'OWNER') {
      const staffChildren = await Staff.findAll({
        where: { parent_owner_id: loggedInId },
        attributes: ['staff_id', 'username', 'role', 'level'],
        raw: true
      });
      const userChildren = await User.findAll({
        where: { parent_owner_id: loggedInId },
        attributes: ['user_id', 'username'],
        raw: true
      });
      children = [
        ...staffChildren.map(s => ({ id: s.staff_id, username: s.username, type: 'staff', role: s.role, level: s.level })),
        ...userChildren.map(u => ({ id: u.user_id, username: u.username, type: 'user', role: 'USER' }))
      ];
    } else {
      const staffChildren = await Staff.findAll({
        where: { parent_id: loggedInId },
        attributes: ['staff_id', 'username', 'role', 'level'],
        raw: true
      });
      const userChildren = await User.findAll({
        where: { parent_staff_id: loggedInId },
        attributes: ['user_id', 'username'],
        raw: true
      });
      children = [
        ...staffChildren.map(s => ({ id: s.staff_id, username: s.username, type: 'staff', role: s.role, level: s.level })),
        ...userChildren.map(u => ({ id: u.user_id, username: u.username, type: 'user', role: 'USER' }))
      ];
    }

    // Fetch existing locks
    const accountIds = children.map(c => c.id);
    if (accountIds.length === 0) {
      return successResponse(res, "No children found", [], 0);
    }

    const lockWhere = {
      account_id: { [Op.in]: accountIds },
      ...buildMarketWhere(event_id, market_id, market_name),
      is_locked: true
    };

    const existingLocks = await UserEventMarketLocks.findAll({
      where: lockWhere,
      attributes: ['account_id', 'account_type'],
      raw: true
    });

    const lockedSet = new Set(existingLocks.map(l => `${l.account_type}_${l.account_id}`));

    const result = children.map(c => ({
      ...c,
      is_locked: lockedSet.has(`${c.type}_${c.id}`)
    }));

    return successResponse(res, "Market lock children retrieved", result, result.length);
  } catch (error) {
    console.error("getMarketLockChildren error:", error);
    return errorResponse(res, "Failed to fetch market lock children");
  }
};

// ✅ Toggle market lock for a child (staff or user) on event + market
export const toggleMarketLock = async (req, res) => {
  try {
    const { account_id, account_type, event_id, market_id, market_name, is_locked } = req.body;
    const loggedInId = req.user?.account?.id;

    if (!account_id || !account_type || !event_id) {
      return errorResponse(res, "account_id, account_type, and event_id are required", 400);
    }
    if (!market_id && !market_name) {
      return errorResponse(res, "market_id or market_name is required", 400);
    }
    if (!['staff', 'user'].includes(account_type)) {
      return errorResponse(res, "account_type must be 'staff' or 'user'", 400);
    }

    const lock = toBool(is_locked);
    const findWhere = {
      account_id,
      account_type,
      event_id: String(event_id),
      ...(market_id ? { market_id: String(market_id) } : { market_name })
    };

    if (lock) {
      const [record, created] = await UserEventMarketLocks.findOrCreate({
        where: findWhere,
        defaults: {
          is_locked: true,
          locked_by: loggedInId,
          market_id: market_id ? String(market_id) : null,
          market_name: market_name || null
        }
      });
      if (!created) {
        await record.update({ is_locked: true, locked_by: loggedInId });
      }
      return successResponse(res, "Market locked successfully", record);
    } else {
      await UserEventMarketLocks.destroy({ where: findWhere });
      return successResponse(res, "Market unlocked successfully");
    }
  } catch (error) {
    console.error("toggleMarketLock error:", error);
    return errorResponse(res, "Failed to toggle market lock");
  }
};

// ✅ Bulk toggle market locks (for select all)
export const bulkToggleMarketLock = async (req, res) => {
  try {
    const { accounts, event_id, market_id, market_name, is_locked } = req.body;
    const loggedInId = req.user?.account?.id;

    console.log('[BetLock] bulkToggleMarketLock:', { accounts_count: accounts?.length, event_id, market_id, market_name, is_locked, loggedInId });

    if (!Array.isArray(accounts) || accounts.length === 0 || !event_id) {
      return errorResponse(res, "accounts array and event_id are required", 400);
    }
    if (!market_id && !market_name) {
      return errorResponse(res, "market_id or market_name is required", 400);
    }

    const lock = toBool(is_locked);
    let processed = 0;

    for (const acc of accounts) {
      const { account_id, account_type } = acc;
      if (!account_id || !account_type) continue;

      const findWhere = {
        account_id,
        account_type,
        event_id: String(event_id),
        ...(market_id ? { market_id: String(market_id) } : { market_name })
      };

      if (lock) {
        const [record, created] = await UserEventMarketLocks.findOrCreate({
          where: findWhere,
          defaults: {
            is_locked: true,
            locked_by: loggedInId,
            market_id: market_id ? String(market_id) : null,
            market_name: market_name || null
          }
        });
        if (!created) {
          await record.update({ is_locked: true, locked_by: loggedInId });
        }
      } else {
        await UserEventMarketLocks.destroy({ where: findWhere });
      }
      processed++;
    }

    return successResponse(res, `${processed} accounts ${lock ? 'locked' : 'unlocked'} successfully`, null, processed);
  } catch (error) {
    console.error("bulkToggleMarketLock error:", error);
    return errorResponse(res, "Failed to bulk toggle market locks");
  }
};

// ✅ Get all locks for a specific match
export const getMatchLocks = async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return errorResponse(res, "event_id is required", 400);
    }

    const locks = await UserMatchLocks.findAll({
      where: { event_id: String(event_id), is_locked: true },
      attributes: ['user_id']
    });

    return successResponse(res, "Match locks retrieved", locks);
  } catch (error) {
    console.error("getMatchLocks error:", error);
    return errorResponse(res, "Failed to fetch match locks");
  }
}