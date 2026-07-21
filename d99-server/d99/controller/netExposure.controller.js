import { Op } from 'sequelize';
import sequelize from '../../config/db.js';
import UserExposure from '../../model/user/UserExposure.js';
import User from '../../model/user/User.js';
import Staff from '../../model/admin/Staff.js';
import Owner from '../../model/admin/Owner.js';

/**
 * Get all descendant staff IDs recursively (including self)
 */
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

/**
 * Get all user IDs under a hierarchy (owner or staff)
 */
const getDownlineUserIds = async (role, accountId) => {
  const upperRole = role.toUpperCase();

  // OWNER case - get all users under this owner
  if (upperRole === 'OWNER') {
    // Get all staff under this owner
    const staffRows = await Staff.findAll({
      where: { parent_owner_id: accountId },
      attributes: ['staff_id'],
      raw: true
    });

    const staffIds = staffRows.map(s => s.staff_id);

    // Get all users under owner OR under those staff
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { parent_owner_id: accountId },
          staffIds.length ? { parent_staff_id: { [Op.in]: staffIds } } : null
        ].filter(Boolean)
      },
      attributes: ['user_id'],
      raw: true
    });

    return users.map(u => u.user_id);
  }

  // STAFF case - get all users under this staff and descendant staff
  const allStaffIds = await getAllDescendantStaffIds(accountId);

  const users = await User.findAll({
    where: {
      parent_staff_id: { [Op.in]: allStaffIds }
    },
    attributes: ['user_id'],
    raw: true
  });

  return users.map(u => u.user_id);
};

/**
 * GET /api/lords/net-exposure
 * 
 * Returns aggregated exposure data for all downline users, grouped by event/match
 */
export const getNetExposureSports = async (req, res) => {
  try {
    const userRole = req.user.role;
    const accountId = req.user.account.id;

    console.log(`📊 getNetExposureSports called by role=${userRole}, accountId=${accountId}`);

    // Step 1: Get all downline user IDs
    const userIds = await getDownlineUserIds(userRole, accountId);

    console.log(`🔍 Found ${userIds.length} users in downline`);

    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        meta: {
          totalEvents: 0,
          totalExposure: 0
        }
      });
    }

    const matchIdFilter = req.query.matchId;

    // Step 2: Fetch all exposures for these users
    const whereClause = {
      user_id: { [Op.in]: userIds },
      category: 'sports' // ✅ STRICTLY FILTER BY SPORTS
    };
    if (matchIdFilter) {
      whereClause.event_id = matchIdFilter;
    }

    const exposures = await UserExposure.findAll({
      where: whereClause,
      attributes: [
        'id',
        'user_id',
        'match_id',
        'event_id',
        'team_name',
        'exposure_amount',
        'match_title',
        'game_type',
        'category',
        'created_at'
      ],
      order: [['created_at', 'DESC']],
      raw: true
    });

    console.log(`📈 Found ${exposures.length} sports exposure records`);

    // Step 3: Aggregate exposures by event (event_id)
    const eventsMap = new Map();

    for (const exp of exposures) {
      const eventId = exp.event_id || exp.match_id; // Fallback if event_id missing
      const matchId = exp.match_id;
      const gameType = exp.game_type || 'match_odds';
      const teamName = exp.team_name;
      const amount = parseFloat(exp.exposure_amount) || 0;

      if (!eventsMap.has(eventId)) {
        eventsMap.set(eventId, {
          eventId: eventId,
          eventName: exp.match_title || `Match ${matchId}`,
          eventDate: exp.created_at,
          category: 'sports',
          markets: new Map()
        });
      }

      const event = eventsMap.get(eventId);

      // Create a unique key for market (gameType + matchId combo)
      const marketKey = `${matchId}_${gameType}`;

      if (!event.markets.has(marketKey)) {
        event.markets.set(marketKey, {
          id: marketKey,
          marketName: exp.match_title || `Market`,
          matchId: matchId, // This is the Market ID
          gameType: gameType,
          selections: {},
          runners: new Set(), // Track unique runners for ordering
          totalStake: 0,
          totalPL: 0
        });
      }

      const market = event.markets.get(marketKey);

      // Add to selections
      if (!market.selections[teamName]) {
        market.selections[teamName] = 0;
        market.runners.add(teamName); // Add to runners set
      }
      market.selections[teamName] += amount;

      // Calculate stake (absolute sum of negative exposures)
      if (amount < 0) {
        market.totalStake += Math.abs(amount);
      }

      // Calculate P/L (sum of positive exposures)
      if (amount > 0) {
        market.totalPL += amount;
      }
    }

    // Step 4: Format response
    const data = [];
    let totalExposure = 0;

    for (const [eventId, event] of eventsMap) {
      const marketsArray = [];

      for (const [marketKey, market] of event.markets) {
        marketsArray.push({
          id: market.id,
          marketName: market.marketName,
          matchId: market.matchId,
          gameType: market.gameType,
          selections: market.selections,
          runners: Array.from(market.runners), // Convert Set to Array
          stake: Math.abs(market.totalStake),
          pl: market.totalPL
        });

        totalExposure += Math.abs(market.totalStake);
      }
      
      data.push({
        id: eventId,
        eventId: eventId,
        eventName: event.eventName,
        eventDate: event.eventDate,
        category: 'sports',
        markets: marketsArray // Return all markets for this event
      });
    }

    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        totalEvents: eventsMap.size,
        totalExposure: parseFloat(totalExposure.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Error in getNetExposureSports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sports net exposure data',
      error: error.message
    });
  }
};

/**
 * GET /api/lords/net-exposure/casino
 * 
 * Returns aggregated exposure data for CASINO only
 */
export const getNetExposureCasino = async (req, res) => {
  try {
    const userRole = req.user.role;
    const accountId = req.user.account.id;

    console.log(`📊 getNetExposureCasino called by role=${userRole}, accountId=${accountId}`);

    // Step 1: Get all downline user IDs
    const userIds = await getDownlineUserIds(userRole, accountId);

    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        meta: {
          totalEvents: 0,
          totalExposure: 0
        }
      });
    }

     // Step 2: Fetch all CASINO exposures
    const whereClause = {
      user_id: { [Op.in]: userIds },
      category: 'casino' // ✅ STRICTLY FILTER BY CASINO
    };

    const exposures = await UserExposure.findAll({
      where: whereClause,
      attributes: [
        'id', 'user_id', 'match_id', 'event_id', 'team_name',
        'exposure_amount', 'match_title', 'game_type', 'category', 'created_at'
      ],
      order: [['created_at', 'DESC']],
      raw: true
    });

    console.log(`🎰 Found ${exposures.length} casino exposure records`);

    // Group by Round/Event
    const roundsMap = new Map();

    for (const exp of exposures) {
        // ✅ Correction: roundId matches match_id, gameName matches match_title
        const roundId = exp.match_id || exp.event_id; 
        const gameName = exp.match_title || 'Casino Game';
        const teamName = exp.team_name;
        const amount = parseFloat(exp.exposure_amount) || 0;

        if (!roundsMap.has(roundId)) {
            roundsMap.set(roundId, {
                id: roundId,
                eventId: roundId,
                eventName: gameName,
                eventDate: exp.created_at,
                category: 'casino',
                selections: {},
                marketWorst: {},   // game_type -> worst runner in that book market
                totalStake: 0,
                totalPL: 0
            });
        }

        const round = roundsMap.get(roundId);

         // Add to selections
         if (!round.selections[teamName]) {
            round.selections[teamName] = 0;
          }
          round.selections[teamName] += amount;
    
          // Liability. Rows tagged with a game_type are a per-runner BOOK of one
          // market (see helper/casinoMarketBook.js) — the market can only lose the
          // WORST runner, so summing its negative rows would double-count. Legacy
          // untagged rows are one-liability-per-bet and stay additive.
          if (exp.game_type) {
            round.marketWorst[exp.game_type] = Math.min(
              round.marketWorst[exp.game_type] ?? 0,
              amount
            );
          } else if (amount < 0) {
            round.totalStake += Math.abs(amount);
          }

          // Calculate P/L (sum of positive exposures)
          if (amount > 0) {
            round.totalPL += amount;
          }
    }

    // Fold each book market's worst case into the round's liability.
    for (const round of roundsMap.values()) {
        for (const worst of Object.values(round.marketWorst)) {
            round.totalStake += Math.abs(worst);
        }
    }

    const data = [];
    let totalExposure = 0;

    for (const [roundId, round] of roundsMap) {
        data.push({
            id: round.id, // Using roundId/match_id as ID
            eventId: round.eventId,
            eventName: round.eventName,
            eventDate: round.eventDate,
            category: 'casino',
            markets: [{ // Simplified market structure for casino
                id: roundId, 
                marketName: round.eventName,
                selections: round.selections,
                stake: Math.abs(round.totalStake),
                pl: round.totalPL
            }]
        });
        totalExposure += Math.abs(round.totalStake);
    }

    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        totalEvents: roundsMap.size,
        totalExposure: parseFloat(totalExposure.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Error in getNetExposureCasino:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch casino exposure data',
      error: error.message
    });
  }
};

// ... existing code ...

// ⚠️ DEPRECATED: Renamed to generic handler if needed, but for now delegating to sports as default
/*
export const getNetExposure = async (req, res) => {
    // If you want to keep the old route working, you can alias it to getNetExposureSports
    return getNetExposureSports(req, res);
};
*/


/**
 * GET /api/lords/net-exposure/market-book/:matchId
 * Query: ?marketType=match_odds (or bookmaker, etc)
 */
export const getMarketUserBook = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { marketType } = req.query; // 'match_odds', 'bookmaker', 'fancy'
    const userRole = req.user.role;
    const accountId = req.user.account.id;

    if (!matchId) return res.status(400).json({ success: false, message: 'Missing matchId' });

    // 1. Get Downline
    const userIds = await getDownlineUserIds(userRole, accountId);
    if (userIds.length === 0) {
        return res.json({ success: true, data: [] });
    }

    // 2. Fetch User Details for names
    const users = await User.findAll({
        where: { user_id: { [Op.in]: userIds } },
        attributes: ['user_id', 'username'],
        raw: true
    });
    const userMap = new Map(users.map(u => [Number(u.user_id), u]));

    // 3. Fetch Exposures — matchId param is the event_id, try both
    const whereClause = {
        user_id: { [Op.in]: userIds },
        [Op.or]: [
            { event_id: matchId },
            { match_id: matchId }
        ]
    };
    if (marketType) {
        // Case-insensitive match: DB stores MATCH_ODDS, frontend sends match_odds
        whereClause.game_type = { [Op.iLike]: marketType };
    }

    console.log('[UserBook] getMarketUserBook:', { matchId, marketType, userIds, whereClause: JSON.stringify(whereClause) });

    const exposures = await UserExposure.findAll({
        where: whereClause,
        attributes: ['user_id', 'team_name', 'exposure_amount', 'game_type'],
        raw: true,
        logging: (sql) => console.log('[UserBook] SQL:', sql)
    });
    console.log('[UserBook] exposures found:', exposures.length, exposures);

    // 4. Pivot Data
    // Structure: { userId: { username, runners: { [runnerName]: amount } } }
    const bookMap = new Map();

    // Initialize with all users
    userMap.forEach(u => {
        bookMap.set(u.user_id, {
            userId: u.user_id,
            username: u.username,
            runners: {}
        });
    });

    exposures.forEach(exp => {
        const uid = Number(exp.user_id);
        const runner = exp.team_name;
        const amount = parseFloat(exp.exposure_amount || 0);

        if (bookMap.has(uid)) {
            const entry = bookMap.get(uid);
            if (!entry.runners[runner]) {
                entry.runners[runner] = 0;
            }
            entry.runners[runner] += amount;
        }
    });

    // Convert to array
    const result = Array.from(bookMap.values());

    return res.json({ success: true, data: result });

  } catch (error) {
    console.error('Error in getMarketUserBook:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getNetExposureSports, getNetExposureCasino, getMarketUserBook };
