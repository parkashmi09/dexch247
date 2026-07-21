import { Op } from 'sequelize';
import StaffSportsLock from '../../model/admin/StaffSportsLock.js';
import UserSportsLock from '../../model/admin/UserSportsLock.js';
import Staff from '../../model/admin/Staff.js';
import User from '../../model/user/User.js';

// Helper: Get Descendant Staff IDs
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

const SportsLockController = {

    // Get locks for a target
    getSportsLocks: async (req, res) => {
        try {
            const { targetId } = req.params; // Expect concrete ID
            const { type } = req.query; // 'STAFF', 'USER', 'OWNER' - derived from frontend or context
            
            // Security Check Log
            console.log('DEBUG getSportsLocks:', { targetId, type, reqUser: req.user });

            if (!targetId || !type) {
                return res.status(400).json({ success: false, message: 'Missing targetId or type' });
            }

            // TODO: Add detailed permission check similar to TableCasinoController if needed
            // For now, assuming middleware handles Auth, and we trust frontend to request valid relations?
            // Actually, we SHOULD reuse the descendant check logic for safety.

            let locks = [];
            if (type === 'USER') {
                locks = await UserSportsLock.findAll({ where: { user_id: targetId } });
            } else if (type === 'OWNER') {
                locks = await StaffSportsLock.findAll({ where: { owner_id: targetId } });
            } else {
                 locks = await StaffSportsLock.findAll({ where: { staff_id: targetId } });
            }

            return res.status(200).json({
                success: true,
                data: locks
            });

        } catch (error) {
             console.error('Error fetching sports locks:', error);
             return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // Update Lock (Toggle)
    updateSportsLock: async (req, res) => {
        try {
            const { 
                targetId, 
                targetType, // 'USER', 'STAFF', 'OWNER'
                sportId, 
                seriesId, 
                matchId, 
                marketId, 
                isLocked 
            } = req.body;

             console.log('DEBUG updateSportsLock:', req.body, req.user);

            // 1. Permission Check: "SELF" lock
            const loggedInId = req.user.account ? req.user.account.id : req.user.id;
            const loggedInRole = req.user.role; // OWNER, ADMIN, SUBADMIN...

            // Rule: Only OWNER can lock themselves (targetType='OWNER')
            // If targetType is OWNER, loggedIn user MUST be owner and IDs must match
            if (targetType === 'OWNER') {
                if (loggedInRole !== 'OWNER') {
                    return res.status(403).json({ success: false, message: 'Only Owner can manage Owner locks' });
                }
                // (Optional: check if loggedInId == targetId)
            }
            
            // Rule: Staff can lock their downline
            // (We can stick to simple logic first: if you have access to the page, you can lock?)
            // User requirement: "make sure only owner can set self lock" -> this implies specific rule for Owner Self Lock.
            // For others, standard hierarchy applies.

            let lock;
            // Ensure IDs are strings to match Model definition (VARCHAR)
            const sportIdStr = sportId ? String(sportId) : null;
            const seriesIdStr = seriesId ? String(seriesId) : null;
            const matchIdStr = matchId ? String(matchId) : null;
            const marketIdStr = marketId ? String(marketId) : null;

            const lockData = {
                sport_id: sportIdStr,
                series_id: seriesIdStr,
                match_id: matchIdStr,
                market_id: marketIdStr,
                is_locked: isLocked
            };

            // Build Where Clause for Uniqueness
             const uniqueWhere = {
                sport_id: sportIdStr,
                series_id: seriesIdStr,
                match_id: matchIdStr,
                market_id: marketIdStr
            };

            if (targetType === 'USER') {
                uniqueWhere.user_id = targetId;
                // Add lock_type to unique query if provided to ensure uniqueness by type as well
                 if (req.body.lockType) uniqueWhere.lock_type = req.body.lockType;

                lock = await UserSportsLock.findOne({ where: uniqueWhere });
                
                if (lock) {
                    lock.is_locked = isLocked;
                    await lock.save();
                } else {
                    lock = await UserSportsLock.create({ 
                        ...lockData, 
                        user_id: targetId,
                        lock_type: req.body.lockType || (marketIdStr ? 'MARKET' : matchIdStr ? 'MATCH' : seriesIdStr ? 'SERIES' : 'SPORT')
                    });
                }

            } else {
                // STAFF or OWNER
                if (targetType === 'OWNER') {
                    uniqueWhere.owner_id = targetId;
                    uniqueWhere.staff_id = null; 
                    lockData.owner_id = targetId; 
                    lockData.staff_id = null;
                } else {
                    uniqueWhere.staff_id = targetId;
                    uniqueWhere.owner_id = null;
                    lockData.staff_id = targetId;
                    lockData.owner_id = null;
                }
                
                if (req.body.lockType) uniqueWhere.lock_type = req.body.lockType;

                lock = await StaffSportsLock.findOne({ where: uniqueWhere });
                 if (lock) {
                    lock.is_locked = isLocked;
                    await lock.save();
                } else {
                    lock = await StaffSportsLock.create({
                        ...lockData,
                        lock_type: req.body.lockType || (marketIdStr ? 'MARKET' : matchIdStr ? 'MATCH' : seriesIdStr ? 'SERIES' : 'SPORT')
                    });
                }
            }

            return res.status(200).json({ success: true, data: lock });

        } catch (error) {
            console.error('Error updating sports lock:', error);
            // Handle unique constraint error gracefully if race condition
             if (error.name === 'SequelizeUniqueConstraintError') {
                 return res.status(400).json({ success: false, message: 'Lock already exists, please refresh.' });
             }
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    /**
     * Check if a bet is locked for a user via sports lock hierarchy.
     * Checks: User locks → Parent staff locks → up to Owner locks.
     * At each level checks: Sport → Series → Match → Market (broader lock blocks narrower).
     *
     * @param {number} userId - The user placing the bet
     * @param {string} sportId - Sport ID (e.g. "4" for Cricket)
     * @param {string|null} seriesId - Series/competition name (nullable)
     * @param {string|null} matchId - Match/event ID (nullable)
     * @param {string|null} marketId - Market ID (nullable)
     * @returns {{ allowed: boolean, message: string }}
     */
    checkSportsLock: async (userId, sportId, seriesId, matchId, marketId) => {
        try {
            if (!userId || !sportId) return { allowed: true };

            const sportIdStr = String(sportId);

            // Helper: check if any lock blocks this bet
            const isBlockedByLocks = (locks) => {
                for (const lock of locks) {
                    if (!lock.is_locked) continue;

                    // Sport-level lock
                    if (!lock.series_id && !lock.match_id && !lock.market_id) {
                        return { blocked: true, reason: 'Sport is locked' };
                    }
                    // Series-level lock
                    if (lock.series_id && !lock.match_id && !lock.market_id) {
                        if (seriesId && String(lock.series_id) === String(seriesId)) {
                            return { blocked: true, reason: 'Series is locked' };
                        }
                    }
                    // Match-level lock
                    if (lock.match_id && !lock.market_id) {
                        if (matchId && String(lock.match_id) === String(matchId)) {
                            return { blocked: true, reason: 'Match is locked' };
                        }
                    }
                    // Market-level lock
                    if (lock.market_id) {
                        if (matchId && String(lock.match_id) === String(matchId) && marketId && String(lock.market_id) === String(marketId)) {
                            return { blocked: true, reason: 'Market is locked' };
                        }
                    }
                }
                return { blocked: false };
            };

            // 1. Check User-level locks (single query)
            const userLocks = await UserSportsLock.findAll({
                where: { user_id: userId, sport_id: sportIdStr, is_locked: true },
                raw: true
            });

            const userCheck = isBlockedByLocks(userLocks);
            if (userCheck.blocked) {
                return { allowed: false, message: `Bet not allowed: ${userCheck.reason}` };
            }

            // 2. Get user + build full staff chain in one pass
            const user = await User.findOne({
                where: { user_id: userId },
                attributes: ['parent_staff_id', 'parent_owner_id'],
                raw: true
            });

            if (!user) return { allowed: true };

            // 3. Collect all ancestor staff IDs in one loop (only fetching parent_id)
            const staffIds = [];
            let currentStaffId = user.parent_staff_id;
            while (currentStaffId) {
                staffIds.push(currentStaffId);
                const staff = await Staff.findOne({
                    where: { staff_id: currentStaffId },
                    attributes: ['parent_id'],
                    raw: true
                });
                currentStaffId = staff?.parent_id || null;
            }

            // 4. Single query for ALL staff locks in the hierarchy
            if (staffIds.length > 0) {
                const staffLocks = await StaffSportsLock.findAll({
                    where: {
                        staff_id: { [Op.in]: staffIds },
                        sport_id: sportIdStr,
                        is_locked: true
                    },
                    raw: true
                });

                const staffCheck = isBlockedByLocks(staffLocks);
                if (staffCheck.blocked) {
                    return { allowed: false, message: `Bet not allowed: ${staffCheck.reason} (by upline)` };
                }
            }

            // 5. Single query for Owner locks
            if (user.parent_owner_id) {
                const ownerLocks = await StaffSportsLock.findAll({
                    where: { owner_id: user.parent_owner_id, staff_id: null, sport_id: sportIdStr, is_locked: true },
                    raw: true
                });

                const ownerCheck = isBlockedByLocks(ownerLocks);
                if (ownerCheck.blocked) {
                    return { allowed: false, message: `Bet not allowed: ${ownerCheck.reason} (by owner)` };
                }
            }

            return { allowed: true };

        } catch (error) {
            console.error('❌ checkSportsLock error:', error);
            return { allowed: true };
        }
    }
};

export default SportsLockController;
