import { Op } from 'sequelize';
import sequelize from '../../config/db.js';


import Staff from '../../model/admin/Staff.js';
import CasinoBet from '../../model/user/casino.js';

/* -------------------------------------------------------------
   Helper – safe integer 
   ------------------------------------------------------------- */
const safeInt = (val, fallback = 1) => {
    if (val == null || val === '') return fallback;
    const n = parseInt(val, 10);
    return isNaN(n) ? fallback : Math.max(1, n);
};

// Helper: Get all descendant staff IDs recursively
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
export const getBetList = async (req, res) => {
    try {
        const { type, from, to, status, page, limit, search, betType } = req.query;

        const userRole = req.user.role;
        let userIdFilter = null;

        // specialized logic: if regular user, restrict to self. If admin/staff, allow all.
        if (userRole === 'user') {
            userIdFilter = req.user.id;
        }
        // If admin is searching by specific user (username), we handle that in the include or search logic.

        // Actually, the UI has "Search by user". 
        // If I want to filter by user in the main query, I need to join with User table or resolve username to id first.
        // Efficient way: Include User model and filter there if needed, OR if just display, just include.

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const offset = (pageNum - 1) * limitNum;

        let data = [];
        let totalCount = 0;




        if (type === 'current') {
            // Base Filters
            let sportsWhere = "WHERE sb.status IN ('OPEN', 'PENDING', 'open', 'matched', 'Match') AND sb.result_status = 'pending'";
            let casinoWhere = "WHERE cb.status IN ('pending', 'OPEN', 'open') AND cb.result_status IS NULL";
            // check casino status logic: typically 'pending' in table definition.

            // Date Filter - IGNORED for Current Bets
            // if (from && to) { ... }

            // User ID Filter
            if (userIdFilter) {
                sportsWhere += ` AND sb.user_id = ${userIdFilter}`;
                casinoWhere += ` AND cb.user_id = ${userIdFilter}`;
            }

            // Downline Filter for Admins (excluding OWNER)
            if (userRole !== 'user' && userRole !== 'OWNER' && userRole !== 'owner') {
                // Assuming userRole is already normalized or check appropriately. 
                // req.user.role is likely lowercase 'admin', 'superadmin' etc based on typical express apps, 
                // but let's check exact value or use safe approach.
                // If we rely on existing variable `userRole`.

                const loggedInId = req.user.account?.id || req.user.id;
                console.log('staff details====>> ', req.user);
                console.log('loggedInId for downline filter:', loggedInId);
                // We need to fetch descendant staff IDs
                const allowedStaffIds = await getAllDescendantStaffIds(loggedInId);
                console.log('allowedStaffIds:', allowedStaffIds);

                // If no staff found (should essentially contain self at least), handle gracefully
                if (allowedStaffIds.length > 0) {
                    const staffIdsStr = allowedStaffIds.join(',');
                    // Check both parent_staff_id (users created by staff) and parent_owner_id (users created by owner but assigned to staff)
                    sportsWhere += ` AND (u.parent_staff_id IN (${staffIdsStr}) OR u.parent_owner_id IN (${staffIdsStr}))`;
                    casinoWhere += ` AND (u.parent_staff_id IN (${staffIdsStr}) OR u.parent_owner_id IN (${staffIdsStr}))`;
                } else {
                    // Should not happen if self is included, but if it does -> no results
                    sportsWhere += ` AND 1=0`;
                    casinoWhere += ` AND 1=0`;
                }
            }

            // Username Search
            if (req.query.username) {
                // This requires joining user table in the subquery or outer query.
                // Easier to do in outer query or ensuring join.
                // Let's filter by user_id if we resolve it first, OR join users in the UNION.
                // For now, let's assume we filter by text search on matched username later or ignore deep user search for raw query simplicity unless critical.
                // User asked for "integrated casino... combined open bets".
            }

            // Sport/Game Filter
            const sportFilter = req.query.sport;
            const categoryFilter = req.query.category; // 'sport' or 'casino'
            const matchIdFilter = req.query.matchId;
            const eventIdFilter = req.query.eventId;

            // -- Logic to build Sports Subquery --
            let includeSports = true;
            let includeCasino = true;

            if (categoryFilter === 'sport') includeCasino = false;
            if (categoryFilter === 'casino') includeSports = false;

            // Specific Match/Event Filter
            if (matchIdFilter) {
                sportsWhere += ` AND sb.match_id = '${matchIdFilter}'`;
                includeCasino = false; // Usually sports-only
            }
            if (eventIdFilter) {
                sportsWhere += ` AND sb.eventid = '${eventIdFilter}'`;
                includeCasino = false;
            }

            // Specific Game Filter
            if (sportFilter && sportFilter !== 'All') {
                // Check if it looks like a sport ID (numeric)
                const isNumeric = /^\d+$/.test(sportFilter);
                if (isNumeric) {
                    // It's a sport (Cricket=4, etc)
                    sportsWhere += ` AND sb.sport_id = '${sportFilter}'`;
                    // Only exclude casino if category wasn't explicitly set to 'casino'
                    if (categoryFilter !== 'casino') {
                        includeCasino = false;
                    }
                } else {
                    // It's a string (e.g. 'teen', 'teen20c')
                    // Could be Casino Game OR a Sport with string name (unlikely for main sports).
                    // Apply to Casino
                    casinoWhere += ` AND (cb.game_name ILIKE '%${sportFilter}%' OR cb.type ILIKE '%${sportFilter}%' OR cb.mtype ILIKE '%${sportFilter}%')`;

                    // Apply to Sports just in case (e.g. searching for 'Cricket' text)
                    sportsWhere += ` AND (sb.game_type ILIKE '%${sportFilter}%' OR sb.match_title ILIKE '%${sportFilter}%')`;
                }
            }

            // Construct Queries
            const sportsQuery = `
          SELECT 
              sb.id::text as id, 
              sb.user_id, 
              u.username,
              sb.created_at, 
              COALESCE(sb.match_title, sb.game_type) as description, 
              sb.selection_name as selection,
              sb.game_type as game_type,
              sb.odds, 
              sb.stake_amount as amount, 
              sb.status, 
              'sport' as source 
          FROM "SportsBet" sb
          LEFT JOIN "users" u ON sb.user_id = u.user_id
          ${sportsWhere}
      `;

            const casinoQuery = `
          SELECT 
              cb.id::text as id, 
              cb.user_id, 
              u.username,
              cb.created_at, 
              cb.game_name as description, 
              cb.selection as selection,
              cb.type as game_type,
              cb.odds, 
              cb.stake as amount, 
              cb.status, 
              'casino' as source
          FROM "casino_bets" cb
          LEFT JOIN "users" u ON cb.user_id = u.user_id
          ${casinoWhere}
      `;

            let finalQueryParts = [];
            if (includeSports) finalQueryParts.push(sportsQuery);
            if (includeCasino) finalQueryParts.push(casinoQuery);

            if (finalQueryParts.length === 0) {
                // Fallback if everything disabled (shouldn't happen)
                finalQueryParts.push(sportsQuery);
            }

            const unionQuery = finalQueryParts.join(" UNION ALL ");

            const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) as combined_count`;
            const dataQuery = `SELECT * FROM (${unionQuery}) as combined_data ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

            console.log('=== BET LIST DEBUG ===');
            console.log('includeSports:', includeSports);
            console.log('includeCasino:', includeCasino);
            console.log('categoryFilter:', categoryFilter);
            console.log('sportFilter:', sportFilter);
            console.log('COUNT QUERY:', countQuery);
            console.log('DATA QUERY:', dataQuery);

            const totalResult = await sequelize.query(countQuery, { type: sequelize.QueryTypes.SELECT });
            const rows = await sequelize.query(dataQuery, { type: sequelize.QueryTypes.SELECT });

            console.log('Total results:', totalResult[0]?.total);
            console.log('Rows returned:', rows.length);

            data = rows;
            totalCount = parseInt(totalResult[0].total);

        } else if (type === 'past') {

            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 50;
            const offset = (pageNum - 1) * limitNum;

            // --- FILTERS ---
            // Base Conditions
            let sportsWhere = `WHERE sb.result_status != 'pending' AND sb.status NOT IN ('open', 'OPEN', 'pending', 'PENDING', 'matched', 'Match', 'MATCHED')`;
            let casinoWhere = `WHERE cb.status = 'closed'`;

            // Date Filter
            if (from && to) {
                const fromStr = new Date(from).toISOString();
                const toStr = new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString();
                sportsWhere += ` AND sb.created_at BETWEEN '${fromStr}' AND '${toStr}'`;
                casinoWhere += ` AND cb.created_at BETWEEN '${fromStr}' AND '${toStr}'`;
            }

            // User Filter
            if (userIdFilter) {
                sportsWhere += ` AND sb.user_id = ${userIdFilter}`;
                casinoWhere += ` AND cb.user_id = ${userIdFilter}`;
            }

            // Search Filter (Applies to both)
            if (search) {
                sportsWhere += ` AND (sb.match_title ILIKE '%${search}%' OR sb.market_type ILIKE '%${search}%' OR sb.selection_name ILIKE '%${search}%')`;
                casinoWhere += ` AND (cb.game_name ILIKE '%${search}%' OR cb.selection ILIKE '%${search}%')`;
            }

            // Downline Filter for Admins (excluding OWNER) - PAST
            if (userRole !== 'user' && userRole !== 'OWNER' && userRole !== 'owner') {
                const loggedInId = req.user.account?.id || req.user.id;
                const allowedStaffIds = await getAllDescendantStaffIds(loggedInId);

                if (allowedStaffIds.length > 0) {
                    const staffIdsStr = allowedStaffIds.join(',');
                    // Check both parent_staff_id and parent_owner_id
                    sportsWhere += ` AND (u.parent_staff_id IN (${staffIdsStr}) OR u.parent_owner_id IN (${staffIdsStr}))`;
                    casinoWhere += ` AND (u.parent_staff_id IN (${staffIdsStr}) OR u.parent_owner_id IN (${staffIdsStr}))`;
                } else {
                    sportsWhere += ` AND 1=0`;
                    casinoWhere += ` AND 1=0`;
                }
            }

            // Sport/Category Filter
            const sportFilter = req.query.sport;
            const categoryFilter = req.query.category; // 'sport' or 'casino'

            let includeSports = true;
            let includeCasino = true;

            if (categoryFilter === 'sport') includeCasino = false;
            if (categoryFilter === 'casino') includeSports = false;

            // Specific Game Filter for Past
            if (sportFilter && sportFilter !== 'All') {
                const isNumeric = /^\d+$/.test(sportFilter);
                if (isNumeric) {
                    sportsWhere += ` AND sb.sport_id = '${sportFilter}'`;
                    // Only exclude casino if category wasn't explicitly set to 'casino'
                    if (categoryFilter !== 'casino') {
                        includeCasino = false;
                    }
                } else {
                    // String filter -> Casino or specific sport text
                    casinoWhere += ` AND (cb.game_name ILIKE '%${sportFilter}%' OR cb.type ILIKE '%${sportFilter}%' OR cb.mtype ILIKE '%${sportFilter}%')`;
                    // Also apply to sports text fields just in case
                    sportsWhere += ` AND (sb.game_type ILIKE '%${sportFilter}%' OR sb.match_title ILIKE '%${sportFilter}%')`;
                }
            }

            // --- QUERIES ---

            const sportsQuery = `
          SELECT 
              sb.id::text, 
              sb.user_id, 
              u.username,
              sb.created_at, 
              COALESCE(sb.match_title, sb.game_type) as description, 
              sb.selection_name as selection, 
              sb.game_type, 
              sb.bet_type,
              sb.odds, 
              sb.stake_amount as amount, 
              CASE 
                  WHEN COALESCE(cl.win_total, 0) > 0 THEN 'WIN' 
                  ELSE 'LOSS' 
              END as result_status,
              sb.status,
              'sport' as source
          FROM "SportsBet" sb
          LEFT JOIN "users" u ON sb.user_id = u.user_id
          LEFT JOIN (
              SELECT meta->>'bet_id' as bet_id, SUM(amount) as win_total 
              FROM "credits_ledger" 
              WHERE amount > 0 
              GROUP BY meta->>'bet_id'
          ) cl ON sb.id::text = cl.bet_id
          ${sportsWhere}
      `;

            const casinoQuery = `
          SELECT 
              cb.id::text, 
              cb.user_id, 
              u.username,
              cb.created_at, 
              cb.game_name as description, 
              cb.selection as selection,
              cb.type as game_type, 
              NULL as bet_type,
              cb.odds, 
              cb.stake as amount, 
              CASE 
                  WHEN cb.result_status = 'won' THEN 'WIN'
                  WHEN cb.result_status = 'lost' THEN 'LOSS'
                  ELSE cb.result_status 
              END as result_status,
              cb.status,
              'casino' as source
          FROM "casino_bets" cb
          LEFT JOIN "users" u ON cb.user_id = u.user_id
          ${casinoWhere}
      `;

            let finalQueryParts = [];
            if (includeSports) finalQueryParts.push(sportsQuery);
            if (includeCasino) finalQueryParts.push(casinoQuery);

            if (finalQueryParts.length === 0) {
                finalQueryParts.push(sportsQuery); // Fallback
            }

            const unionQuery = finalQueryParts.join(" UNION ALL ");

            const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) as combined_count`;
            const dataQuery = `SELECT * FROM (${unionQuery}) as combined_data ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

            const totalResult = await sequelize.query(countQuery, { type: sequelize.QueryTypes.SELECT });
            const rows = await sequelize.query(dataQuery, { type: sequelize.QueryTypes.SELECT });

            data = rows;
            totalCount = parseInt(totalResult[0]?.total || 0);
        } else {
            return res.status(400).json({ success: false, message: "Invalid type. Must be 'current' or 'past'." });
        }

        return res.status(200).json({
            success: true,
            data: data,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        });

    } catch (error) {
        console.error('Error in getBetList:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getCasinoOpenBetsDownline = async (req, res) => {
    try {
        const { gameName } = req.query; // Optional filter by game name if needed
        const loggedInRole = req.user?.role?.toUpperCase();
        const loggedInId = req.user?.account?.id || req.user?.id;

        if (!loggedInId || loggedInRole === 'USER') { // Basic check, though authMiddleware handles role
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }



        console.log(`[CasinoOpen] User: ${loggedInId} Role: ${loggedInRole} Game: ${gameName}`);

        let staffFilterClause = "";
        if (loggedInRole !== 'OWNER') {
            const allowedStaffIds = await getAllDescendantStaffIds(loggedInId);
            if (allowedStaffIds.length === 0) {
                return res.status(200).json({ success: true, data: [] });
            }
            staffFilterClause = `AND u.parent_staff_id IN (${allowedStaffIds.join(',')})`;
        }

        let gameNameFilter = "";
        if (gameName) {
            gameNameFilter = `AND (cb.game_name ILIKE '%${gameName}%' OR cb.type ILIKE '%${gameName}%')`;
        }

        console.log(`[CasinoOpen] Query filters - Staff: ${!!staffFilterClause}, Game: ${gameName}`);

        // Query
        const query = `
          SELECT 
              cb.id,
              cb.user_id,
              u.username,
              u.parent_staff_id,
              cb.created_at,
              cb.game_name as description,
              cb.selection,
              cb.type as game_type,
              cb.odds,
              cb.stake as amount,
              cb.status,
              'casino' as source
          FROM "casino_bets" cb
          LEFT JOIN "users" u ON cb.user_id = u.user_id
          WHERE cb.status IN ('pending', 'OPEN', 'open', 'processing') 
            AND (cb.result_status IS NULL OR cb.result_status = 'pending')
            ${staffFilterClause}
            ${gameNameFilter}
          ORDER BY cb.created_at DESC
        `;

        const rows = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        console.log(`[CasinoOpen] Rows returned: ${rows.length}`);

        return res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('Error in getCasinoOpenBetsDownline:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getCasinoAllBetsDownline = async (req, res) => {
    try {
        const { gameName } = req.query;
        const loggedInRole = req.user?.role?.toUpperCase();
        const loggedInId = req.user?.account?.id || req.user?.id;

        if (!loggedInId) return res.status(403).json({ success: false, message: 'Unauthorized' });

        let staffFilterClause = "";
        if (loggedInRole !== 'OWNER') {
            const allowedStaffIds = await getAllDescendantStaffIds(loggedInId);
            if (allowedStaffIds.length === 0) {
                return res.status(200).json({ success: true, data: [] });
            }
            staffFilterClause = `AND u.parent_staff_id IN (${allowedStaffIds.join(',')})`;
        }

        let gameNameFilter = "";
        if (gameName) {
            gameNameFilter = `AND (cb.game_name ILIKE '%${gameName}%' OR cb.type ILIKE '%${gameName}%')`;
        }

        const query = `
          SELECT 
              cb.id,
              cb.user_id,
              u.username,
              cb.created_at,
              cb.game_name as description,
              cb.selection,
              cb.type as game_type,
              cb.odds,
              cb.stake as amount,
              cb.status,
              cb.result_status,
              'casino' as source
          FROM "casino_bets" cb
          LEFT JOIN "users" u ON cb.user_id = u.user_id
          WHERE 1=1
            ${staffFilterClause}
            ${gameNameFilter}
          ORDER BY cb.created_at DESC
          LIMIT 100
        `;
        // LIMIT 100 to prevent overload in "All" view if not paginated

        const rows = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

        return res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('Error in getCasinoAllBetsDownline:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getBetTicker = async (req, res) => {
    try {
        const { sport, category } = req.query;
        const userRole = req.user.role;

        // --- Downline Filter Logic (Same as getBetList) ---
        let downlineWhere = "";
        if (userRole !== 'user' && userRole !== 'OWNER' && userRole !== 'owner') {
            const loggedInId = req.user.account?.id || req.user.id;
            const allowedStaffIds = await getAllDescendantStaffIds(loggedInId);

            if (allowedStaffIds.length > 0) {
                const staffIdsStr = allowedStaffIds.join(',');
                downlineWhere = ` AND (u.parent_staff_id IN (${staffIdsStr}) OR u.parent_owner_id IN (${staffIdsStr}))`;
            } else {
                downlineWhere = ` AND 1=0`;
            }
        }

        // --- Category/Sport Filters ---
        let sportsWhere = "WHERE sb.status IN ('OPEN', 'PENDING', 'open', 'matched', 'Match') AND sb.result_status = 'pending'";
        let casinoWhere = "WHERE cb.status IN ('pending', 'OPEN', 'open') AND cb.result_status IS NULL";

        // Filter by Sport ID or Name
        if (sport && sport !== 'All') {
            const isNumeric = /^\d+$/.test(sport);
            if (isNumeric) {
                sportsWhere += ` AND sb.sport_id = '${sport}'`;
                if (category !== 'casino') {
                    // If looking for specific sport ID, usually exclude casino unless forced
                    // But user might want 'All' categories with sport ID filter? Unlikely.
                    // Generally if sport=4 (Cricket), casino is excluded.
                    casinoWhere += ` AND 1=0`;
                }
            } else {
                // String search (e.g. 'teen')
                casinoWhere += ` AND (cb.game_name ILIKE '%${sport}%' OR cb.type ILIKE '%${sport}%' OR cb.mtype ILIKE '%${sport}%')`;
                sportsWhere += ` AND (sb.game_type ILIKE '%${sport}%' OR sb.match_title ILIKE '%${sport}%')`;
            }
        }

        // Filter by Category
        if (category === 'sport') casinoWhere += ` AND 1=0`;
        if (category === 'casino') sportsWhere += ` AND 1=0`;

        // Apply Downline Filter
        sportsWhere += downlineWhere;
        casinoWhere += downlineWhere;

        // --- Construct Query with Liability ---
        const query = `
            SELECT 
                sb.id::text as id, 
                sb.user_id, 
                u.username,
                sb.created_at, 
                COALESCE(sb.match_title, sb.game_type) as description, 
                sb.selection_name as selection,
                sb.game_type as game_type,
                sb.odds, 
                sb.stake_amount as amount, 
                sb.status, 
                sb.bet_type,
                'sport' as source,
                -sb.liability as liability
            FROM "SportsBet" sb
            LEFT JOIN "users" u ON sb.user_id = u.user_id
            ${sportsWhere}

            UNION ALL 

            SELECT 
                cb.id::text as id, 
                cb.user_id, 
                u.username,
                cb.created_at, 
                cb.game_name as description, 
                cb.selection as selection,
                cb.type as game_type,
                cb.odds, 
                cb.stake as amount, 
                cb.status, 
                NULL as bet_type,
                'casino' as source,
                -cb.stake as liability
            FROM "casino_bets" cb
            LEFT JOIN "users" u ON cb.user_id = u.user_id
            ${casinoWhere}

            ORDER BY created_at DESC
            LIMIT 100
        `;

        const rows = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

        return res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('Error in getBetTicker:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
