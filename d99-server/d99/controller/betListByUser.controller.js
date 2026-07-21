import { Op } from 'sequelize';
import sequelize from '../../config/db.js';
import User from '../../model/user/User.js';
import Staff from '../../model/admin/Staff.js';

// Helper to get all descendant staff IDs recursively
const getAllDescendantStaffIds = async (staffId) => {
  let allIds = [parseInt(staffId)];
  let currentIds = [parseInt(staffId)];

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

export const getBetListByUser = async (req, res) => {
  try {
    const { type, from, to, status, page, limit, search, userId, staffId, sport, category } = req.query; 
    
    // Authorization Check to ensure requester has permission? 
    // Assuming backend structure handles auth earlier, but checking here if requester is admin/staff is good practice.
    // Assuming req.user is populated.
    
    console.log('[getBetListByUser] Query Params:', req.query);

    let userIdFilter = null;

    if (userId) {
        userIdFilter = userId;
    } 
    else if (staffId) {
        // Logic to get all users under this staff
        const allStaffIds = await getAllDescendantStaffIds(staffId);
        
        const users = await User.findAll({
            where: { parent_staff_id: { [Op.in]: allStaffIds } },
            attributes: ['user_id'],
            raw: true
        });
        
        const userIds = users.map(u => u.user_id);
        if (userIds.length > 0) {
             userIdFilter = userIds.join(','); 
        } else {
             userIdFilter = '0'; // No users found
        }
    } else {
        // Fallback or error?
    }

    console.log('[getBetListByUser] userIdFilter:', userIdFilter);

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    let data = [];
    let totalCount = 0;

    if (type === 'current') {
      let sportsWhere = "WHERE sb.status IN ('OPEN', 'PENDING', 'open', 'matched', 'Match') AND sb.result_status = 'pending'";
      let casinoWhere = "WHERE cb.status IN ('pending', 'OPEN', 'open') AND cb.result_status IS NULL";  

      console.log('[getBetListByUser] Initial sportsWhere:', sportsWhere);

      if (from && to) {
        // ... dates
        const fromStr = new Date(from).toISOString();
        const toStr = new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString();
        sportsWhere += ` AND sb.created_at BETWEEN '${fromStr}' AND '${toStr}'`;
        casinoWhere += ` AND cb.created_at BETWEEN '${fromStr}' AND '${toStr}'`;
      }

      if (userIdFilter) {
          if (String(userIdFilter).includes(',')) {
              sportsWhere += ` AND sb.user_id IN (${userIdFilter})`;
              casinoWhere += ` AND cb.user_id IN (${userIdFilter})`;
          } else {
              sportsWhere += ` AND sb.user_id = ${userIdFilter}`;
              casinoWhere += ` AND cb.user_id = ${userIdFilter}`;
          }
      } else if (!userId && !staffId) {
           // If intentionally undefined, maybe show nothing/error? 
           // If we want to support "view all bets in system" this is fine.
      }
      
      // Sport/Game Filter logic (Replicated)
      const sportFilter = sport;
      const categoryFilter = category;
      let includeSports = true;
      let includeCasino = true;

      if (categoryFilter === 'sport') includeCasino = false;
      if (categoryFilter === 'casino') includeSports = false;

      if (sportFilter && sportFilter !== 'All') {
          const isNumeric = /^\d+$/.test(sportFilter);
          if (isNumeric) {
              sportsWhere += ` AND sb.sport_id = '${sportFilter}'`;
              includeCasino = false; 
          } else {
             casinoWhere += ` AND (cb.game_name ILIKE '%${sportFilter}%' OR cb.type ILIKE '%${sportFilter}%' OR cb.mtype ILIKE '%${sportFilter}%')`;
             sportsWhere += ` AND (sb.game_type ILIKE '%${sportFilter}%' OR sb.match_title ILIKE '%${sportFilter}%')`;
          }
      }

      // Query Building
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
      if (finalQueryParts.length === 0) finalQueryParts.push(sportsQuery);

      const unionQuery = finalQueryParts.join(" UNION ALL ");
      
      const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) as combined_count`;
      const dataQuery = `SELECT * FROM (${unionQuery}) as combined_data ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

      const totalResult = await sequelize.query(countQuery, { type: sequelize.QueryTypes.SELECT });
      const rows = await sequelize.query(dataQuery, { type: sequelize.QueryTypes.SELECT });

      data = rows;
      totalCount = parseInt(totalResult[0].total);

    } else if (type === 'past') {
      
      let sportsWhere = `WHERE sb.result_status != 'pending' AND sb.status NOT IN ('open', 'OPEN', 'pending', 'PENDING', 'matched', 'Match', 'MATCHED')`;
      let casinoWhere = `WHERE cb.status = 'closed'`; 

      if (from && to) {
        const fromStr = new Date(from).toISOString();
        const toStr = new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString();
        sportsWhere += ` AND sb.created_at BETWEEN '${fromStr}' AND '${toStr}'`;
        casinoWhere += ` AND cb.created_at BETWEEN '${fromStr}' AND '${toStr}'`;
      }

      if (userIdFilter) {
           if (String(userIdFilter).includes(',')) {
              sportsWhere += ` AND sb.user_id IN (${userIdFilter})`;
              casinoWhere += ` AND cb.user_id IN (${userIdFilter})`;
          } else {
              sportsWhere += ` AND sb.user_id = ${userIdFilter}`;
              casinoWhere += ` AND cb.user_id = ${userIdFilter}`;
          }
      }

      if (search) {
          sportsWhere += ` AND (sb.match_title ILIKE '%${search}%' OR sb.market_type ILIKE '%${search}%' OR sb.selection_name ILIKE '%${search}%')`;
          casinoWhere += ` AND (cb.game_name ILIKE '%${search}%' OR cb.selection ILIKE '%${search}%')`;
      }
      
      const sportFilter = sport;
      const categoryFilter = category;
      let includeSports = true;
      let includeCasino = true;

      if (categoryFilter === 'sport') includeCasino = false;
      if (categoryFilter === 'casino') includeSports = false;

      if (sportFilter && sportFilter !== 'All') {
          const isNumeric = /^\d+$/.test(sportFilter);
          if (isNumeric) {
              sportsWhere += ` AND sb.sport_id = '${sportFilter}'`;
              includeCasino = false; 
          } else {
               casinoWhere += ` AND (cb.game_name ILIKE '%${sportFilter}%' OR cb.type ILIKE '%${sportFilter}%' OR cb.mtype ILIKE '%${sportFilter}%')`;
               sportsWhere += ` AND (sb.game_type ILIKE '%${sportFilter}%' OR sb.match_title ILIKE '%${sportFilter}%')`; 
          }
      }

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
      if (finalQueryParts.length === 0) finalQueryParts.push(sportsQuery);

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
    console.error('Error in getBetListByUser:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
