import Transaction from '../../model/admin/Transaction.js';
import User from '../../model/user/User.js';
import Staff from '../../model/admin/Staff.js';
import CreditsLedger from '../../model/user/CreditsLedger.js';
import TransactionReportService from '../../services/TransactionReportService.js';
import { Op } from 'sequelize';

import sequelize from '../../config/db.js';
import { getUserIdsByHierarchy } from './userController.js';
import SportsBet from '../../model/user/SportsBet.js';
import UserExposure from '../../model/user/UserExposure.js';
import { isBookmakerMarket, backProfit } from '../../helper/marketClassify.js';



const ReportsController = {
  getUserWinLoss: async (req, res) => {
    try {
      const { clientName, fromDate, toDate } = req.body;
      const role = req.user?.role?.toUpperCase();
      const username = req.user?.username;

      // Get all user IDs under hierarchy
      const userIds = await getUserIdsByHierarchy(role, username);

      if (!userIds || userIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      // If a specific client is selected, filter to that user only
      let filteredUserIds = userIds;
      if (clientName && clientName !== 'all') {
        const user = await User.findOne({
          where: { username: { [Op.iLike]: clientName } },
          attributes: ['user_id'],
          raw: true
        });
        if (!user || !userIds.includes(user.user_id)) {
          return res.status(200).json({ success: true, data: [] });
        }
        filteredUserIds = [user.user_id];
      }

      // Build date filter
      const dateFilter = {};
      if (fromDate && toDate) {
        dateFilter.created_at = {
          [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')]
        };
      }

      const userMap = {};
      const ensure = (uid) => {
        if (!userMap[uid]) userMap[uid] = { SPORTS: 0, CASINO: 0, THIRD_PARTY_CASINO: 0 };
        return userMap[uid];
      };

      // ── SPORTS P/L ──
      // Derived directly from SportsBet table rather than CreditsLedger
      // profit/loss columns. Pre-fix settlement (commit 814e717) wrote
      // only ONE market-level ledger row per market using `winnerExposure`
      // from UserExposure — for mixed back+lay positions this lost the
      // offsetting legs, over/under-reporting P/L. SportsBet has every
      // settled bet with stake/odds/liability/result, so the per-bet
      // formula below mirrors settlement math and gives accurate totals
      // for both historical and future data.
      const sportsBetWhere = {
        user_id: { [Op.in]: filteredUserIds },
        fixed: 1,
        result_status: { [Op.in]: ['won', 'loss'] },
      };
      // Date filter uses placement time (created_at). updated_at is
      // unreliable because the 2026-04-22 `fixed=1` backfill commit
      // touched every historical row, pulling bets months old into
      // any recent window.
      if (fromDate && toDate) {
        sportsBetWhere.created_at = {
          [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')]
        };
      }
      const sportsBets = await SportsBet.findAll({
        where: sportsBetWhere,
        attributes: ['user_id','stake_amount','liability','odds','size','bet_type','game_type','market_type','result_status'],
        raw: true,
      });
      for (const b of sportsBets) {
        const stake = parseFloat(b.stake_amount) || 0;
        const liab  = parseFloat(b.liability)   || 0;
        const odds  = parseFloat(b.odds)        || 0;
        const size  = parseFloat(b.size)        || 0;
        const bt    = String(b.bet_type || '').toLowerCase();
        const gt    = String(b.game_type || '').toUpperCase();
        const mt    = String(b.market_type || '').toLowerCase();
        const res   = String(b.result_status || '').toLowerCase();
        const isBack = bt === 'back' || bt === 'yes';
        const isLay  = bt === 'lay'  || bt === 'no';

        let pl = 0;
        if (res === 'won') {
          if (isBack) {
            // Detect bookmaker off the MARKET, not just game_type: pre-fix rows
            // are tagged 'MO' but carry percentage odds, and the decimal branch
            // would report a ~100x inflated profit.
            if (gt === 'BM' || isBookmakerMarket(b))
                                             pl = backProfit(stake, b);
            else if (mt === 'tied match')    pl = stake * (odds / 100);
            else if (gt === 'FAN') {
              // fancy1/oddeven are priced in DECIMAL odds, and their `size`
              // column holds market VOLUME (e.g. 1000000), not a bhav — the
              // size/100 branch would book a ~10,000x credit. Mirrors
              // settlementv2.processFanBet: a yes win pays stake * (odds - 1).
              if (mt === 'fancy1' || mt === 'oddeven')
                                             pl = stake * (odds - 1);
              else pl = size > 0 ? stake * (size / 100) : stake * (odds / 100);
            }
            else                             pl = stake * (odds - 1);
          } else if (isLay) {
            pl = stake;
          }
        } else if (res === 'loss') {
          if (isBack)      pl = -stake;
          else if (isLay)  pl = -liab;
        }
        ensure(b.user_id).SPORTS += pl;
      }

      // ── CASINO + THIRD_PARTY_CASINO P/L ──
      // Both write per-bet/session CreditsLedger rows correctly, so the
      // profit/loss column aggregation is accurate for these categories.
      const ledgerData = await CreditsLedger.findAll({
        where: {
          user_id: { [Op.in]: filteredUserIds.map(id => String(id)) },
          category: { [Op.in]: ['CASINO', 'THIRD_PARTY_CASINO'] },
          ...dateFilter
        },
        attributes: [
          'user_id',
          'category',
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('profit')), 0), 'total_profit'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('loss')), 0), 'total_loss']
        ],
        group: ['user_id', 'category'],
        raw: true
      });
      for (const row of ledgerData) {
        const cat = row.category;
        if (cat !== 'CASINO' && cat !== 'THIRD_PARTY_CASINO') continue;
        const profit = parseFloat(row.total_profit) || 0;
        const loss = Math.abs(parseFloat(row.total_loss) || 0);
        ensure(Number(row.user_id))[cat] = profit - loss;
      }

      // Get usernames for all user_ids that have data
      const userIdsWithData = Object.keys(userMap).map(Number);
      if (userIdsWithData.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      const users = await User.findAll({
        where: { user_id: { [Op.in]: userIdsWithData } },
        attributes: ['user_id', 'username'],
        raw: true
      });

      const usernameMap = {};
      users.forEach(u => { usernameMap[u.user_id] = u.username; });

      // Build response data
      const data = userIdsWithData.map(uid => {
        const cats = userMap[uid];
        const sport = cats.SPORTS || 0;
        const casino = cats.CASINO || 0;
        const thirdParty = cats.THIRD_PARTY_CASINO || 0;
        return {
          user_id: uid,
          username: usernameMap[uid] || `User ${uid}`,
          sport: parseFloat(sport.toFixed(2)),
          casino: parseFloat(casino.toFixed(2)),
          third_party: parseFloat(thirdParty.toFixed(2)),
          profit_loss: parseFloat((sport + casino + thirdParty).toFixed(2))
        };
      });

      // Sort by profit_loss descending
      data.sort((a, b) => b.profit_loss - a.profit_loss);

      return res.status(200).json({ success: true, data });

    } catch (error) {
      console.error('❌ Get User Win Loss Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getAccountStatement: async (req, res) => {
    try {
      console.log('📝 [ReportsController] getAccountStatement request:', req.body);
      const { clientName } = req.body;

      let target = null;

      if (clientName) {
        // Case-insensitive search for User
        const user = await User.findOne({
          where: { username: { [Op.iLike]: clientName } }
        });

        if (user) {
          target = { id: user.user_id, type: 'USER', username: user.username };
        } else {
          // If not found in User, try Staff
          const staff = await Staff.findOne({
            where: { username: { [Op.iLike]: clientName } }
          });
          if (staff) {
            target = { id: staff.staff_id, type: 'STAFF', username: staff.username };
          }
        }
      } else if (req.user) {
        // Self-Report
        if (req.user.role === 'USER') {
          target = { id: req.user.user_id || req?.user?.account?.id, type: 'USER', username: req.user.username };
        } else {
          // Staff or Owner
          const id = req.user.staff_id || req.user.owner_id;
          target = { id: id, type: req.user.role, username: req.user.username };
        }
      }

      if (!target) {
        return res.status(200).json({
          success: true,
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: 1,
          message: clientName ? "User not found" : "Please enter a valid Client Name"
        });
      }

      // Delegate to Service
      const result = await TransactionReportService.getStatement(target, req.body);
      return res.status(200).json(result);

    } catch (error) {
      console.error('❌ Get Account Statement Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCurrentBets: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        sport,
        gameType,
        betType,
        minAmount,
        maxAmount,
        eventId,
        matchId
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {
        status: { [Op.in]: ['OPEN', 'PENDING', 'open', 'pending', 'matched', 'Match', 'MATCHED'] },
        result_status: 'pending'
      };

      // 1. Hierarchy Check
      const loggedInRole = req.user?.role?.toUpperCase();
      const loggedInId = req.user.account.id; // owner_id or staff_id

      if (loggedInRole !== 'OWNER') {
        // Helper to get all descendant staff IDs
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

        const allowedStaffIds = await getAllDescendantStaffIds(loggedInId);

        // Find all users belonging to these staff members
        const usersUnderStaff = await User.findAll({
          where: { parent_staff_id: { [Op.in]: allowedStaffIds } },
          attributes: ['user_id'],
          raw: true
        });

        const allowedUserIds = usersUnderStaff.map(u => u.user_id);

        // Add to where clause
        where.user_id = { [Op.in]: allowedUserIds };
      }

      // 2. Apply Filters
      if (search) {
        where[Op.or] = [
          { match_title: { [Op.iLike]: `%${search}%` } },
          { selection_name: { [Op.iLike]: `%${search}%` } },
          { market_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (sport) {
        where.sport_id = sport;
      }

      if (gameType) {
        if (gameType === 'sports') {
          // Assuming sports have numeric IDs or specific types.
          // If 'casino' is a game_type, then sports are everything else?
          // Or maybe we just don't filter if it's sports, relying on sport_id?
          // Let's assume for now we filter by exclusion of casino if needed,
          // or just pass the specific game_type if known.
          // Actually, the frontend tabs are 'sports' and 'casino'.
          // Let's check what values are in DB.
          // For now, I'll allow direct filtering if gameType is passed.
          // If gameType is 'casino', we might filter game_type = 'casino'.
          // If gameType is 'sports', we might filter game_type != 'casino'.
          where.game_type = { [Op.ne]: 'casino' };
        } else if (gameType === 'casino') {
          where.game_type = 'casino';
        } else {
          where.game_type = gameType;
        }
      }

      if (betType) {
        where.bet_type = betType;
      }

      if (minAmount || maxAmount) {
        where.stake_amount = {};
        if (minAmount) where.stake_amount[Op.gte] = minAmount;
        if (maxAmount) where.stake_amount[Op.lte] = maxAmount;
      }

      if (eventId) {
        where.eventid = eventId;
      }

      if (matchId) {
        where.match_id = matchId;
      }

      // 3. Fetch Bets
      const { count, rows } = await import('../../model/user/SportsBet.js').then(m => m.default.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['username'],
          required: true
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      }));

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('❌ Get Current Bets Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getCasinoReport: async (req, res) => {
    try {
      console.log('📥 casinoReports req.body:', req.body);

      const { role, username, type, vendor } = req.body;

      // 🔎 Validation
      if (!role || !username || !type || !vendor) {
        return res.status(400).json({
          success: false,
          message: 'role, username, type, and vendor are required',
        });
      }

      if (!['SETTLEBET', 'UNSETTLEBET'].includes(type.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'type must be SettleBet or UnsettleBet',
        });
      }

      // 1️⃣ Resolve users under hierarchy
      const userIds = await getUserIdsByHierarchy(role, username);

      if (!userIds.length) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No users found under given hierarchy',
        });
      }

      // 2️⃣ Transaction status condition
      let transactionStatusCondition = {};
      if (type.toUpperCase() === 'SETTLEBET') {
        transactionStatusCondition = { transaction_status: 'processed' };
      } else {
        transactionStatusCondition = {
          transaction_status: { [Op.ne]: 'processed' },
        };
      }

      // 3️⃣ Fetch casino transactions + game details
      const reports = await sequelize.query(
        `
        SELECT
          t.id,
          t.user_id,
          t.game_uid,
          t.transaction_type,
          t.amount,
          t.currency,
          t.transaction_status,
          t.external_transaction_id,
          t.serial_number,
          t.timestamp,

          g.game_name,
          g.game_type,
          g.game_icon,
          g.vendor

        FROM js_game_transactions t
        INNER JOIN js_games g
          ON g.game_uid = t.game_uid

        WHERE
          t.user_id IN (:userIds)
          AND ${type.toUpperCase() === 'SETTLEBET'
          ? `t.transaction_status = 'processed'`
          : `t.transaction_status <> 'processed'`}
          AND g.vendor = :vendor

        ORDER BY t.timestamp DESC
        `,
        {
          replacements: {
            userIds,
            vendor,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      // ✅ Final response
      return res.status(200).json({
        success: true,
        data: reports,
        meta: {
          role,
          username,
          vendor,
          type,
          total_users: userIds.length,
          total_records: reports.length,
        },
      });

    } catch (error) {
      console.error('❌ Error in casinoReports:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch casino reports',
        error: error.message,
      });
    }
  },
  getMarketAnalysis: async (req, res) => {
    try {
      const username = req.user.username;
      const role = req.user.role;

      const userIds = await getUserIdsByHierarchy(role, username);

      if (!userIds || userIds.length === 0) {
        return res.json({ success: true, count: 0, data: [] });
      }

      const exposures = await UserExposure.findAll({
        where: {
          user_id: { [Op.in]: userIds.map(id => Number(id)) },
        },
        raw: true,
        order: [['updated_at', 'DESC']],
      });

      // Group by match_id -> game_type -> team_name (sum across all users)
      const grouped = {};

      for (const exp of exposures) {
        const matchId = exp.match_id;

        if (!grouped[matchId]) {
          grouped[matchId] = {
            match_id: matchId,
            event_id: exp.event_id,
            match_title: exp.match_title,
            markets: {},
          };
        }

        const gameType = exp.game_type || 'MATCH_ODDS';
        if (!grouped[matchId].markets[gameType]) {
          grouped[matchId].markets[gameType] = {};
        }

        const teamName = exp.team_name;
        if (!grouped[matchId].markets[gameType][teamName]) {
          grouped[matchId].markets[gameType][teamName] = 0;
        }
        grouped[matchId].markets[gameType][teamName] += parseFloat(exp.exposure_amount || 0);
      }

      // Fetch sport_id mapping from SportsBet for all event_ids
      const eventIds = [...new Set(Object.values(grouped).map(m => m.event_id).filter(Boolean))];
      const sportIdMap = {};
      if (eventIds.length > 0) {
        const sportRows = await SportsBet.findAll({
          where: { eventid: { [Op.in]: eventIds } },
          attributes: ['eventid', 'sport_id'],
          group: ['eventid', 'sport_id'],
          raw: true,
        });
        for (const row of sportRows) {
          sportIdMap[row.eventid] = row.sport_id;
        }
      }

      const data = Object.values(grouped).map(match => ({
        match_title: match.match_title || `Match ${match.match_id}`,
        eventid: match.event_id || match.match_id,
        sport_id: sportIdMap[match.event_id] || null,
        event_date: null,
        markets: Object.entries(match.markets).map(([name, teams]) => ({
          name,
          rows: Object.entries(teams).map(([label, value]) => ({
            label,
            value: parseFloat(value).toFixed(2),
          })),
        })),
      }));

      return res.json({ success: true, count: data.length, data });

    } catch (error) {
      console.error('getMarketAnalysis error:', error);
      return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
  },

  getTotalProfitLoss: async (req, res) => {
    try {
      const username = req.user.username;
      const role = req.user.role;
      const { clientName, fromDate, toDate, type } = req.body;

      // Get all user IDs under logged-in user's hierarchy
      const userIds = await getUserIdsByHierarchy(role, username);

      if (!userIds || userIds.length === 0) {
        return res.json({ success: true, sports: [], casino: [], thirdParty: [] });
      }

      // If a specific client is selected, filter to that user only
      let filteredUserIds = userIds;
      if (clientName && clientName !== '' && clientName !== 'all') {
        const user = await User.findOne({
          where: { username: { [Op.iLike]: clientName } },
          attributes: ['user_id'],
          raw: true
        });
        if (!user || !userIds.includes(user.user_id)) {
          return res.json({ success: true, sports: [], casino: [], thirdParty: [] });
        }
        filteredUserIds = [user.user_id];
      }

      // Build where clause
      const where = {
        user_id: { [Op.in]: filteredUserIds.map(id => String(id)) },
      };

      if (fromDate && toDate) {
        where.created_at = {
          [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')]
        };
      } else if (fromDate) {
        where.created_at = { [Op.gte]: new Date(fromDate) };
      } else if (toDate) {
        where.created_at = { [Op.lte]: new Date(toDate + 'T23:59:59.999Z') };
      }

      // Filter by category type if specified
      const categoryFilter = [];
      if (!type || type === '0') {
        // All
      } else if (type === '2') {
        categoryFilter.push('SPORTS');
      } else if (type === '3') {
        categoryFilter.push('CASINO');
      } else if (type === '4') {
        categoryFilter.push('THIRD_PARTY_CASINO');
      }
      if (categoryFilter.length > 0) {
        where.category = { [Op.in]: categoryFilter };
      }

      // Fetch all matching ledger entries
      const ledgerRows = await CreditsLedger.findAll({
        where,
        attributes: ['eventid', 'match_id', 'category', 'market_type', 'profit', 'loss', 'sport_id', 'meta'],
        raw: true,
      });

      // Group by category
      const sportsMap = {};
      const casinoMap = {};
      const thirdPartyMap = {};

      for (const row of ledgerRows) {
        const profitAmt = parseFloat(row.profit) || 0;
        const lossAmt = Math.abs(parseFloat(row.loss) || 0);
        const cat = (row.category || 'SPORTS').toUpperCase();

        if (cat === 'SPORTS') {
          const key = `${row.eventid || 'unknown'}__${row.market_type || 'Other'}`;
          if (!sportsMap[key]) {
            sportsMap[key] = { eventid: row.eventid, market_type: row.market_type || 'Other', totalProfit: 0, totalLoss: 0 };
          }
          sportsMap[key].totalProfit += profitAmt;
          sportsMap[key].totalLoss += lossAmt;
        } else if (cat === 'CASINO') {
          const gameName = row.match_id || 'Casino';
          if (!casinoMap[gameName]) {
            casinoMap[gameName] = { name: gameName, totalProfit: 0, totalLoss: 0 };
          }
          casinoMap[gameName].totalProfit += profitAmt;
          casinoMap[gameName].totalLoss += lossAmt;
        } else if (cat === 'THIRD_PARTY_CASINO') {
          // jsgamesv2: match_id is null; game name lives in meta.game_name.
          // Group by "provider / game" so multiple providers with the same game
          // name don't collide.
          const meta = row.meta || {};
          const provider = meta.provider || row.sport_id || 'Third Party';
          const gameName = meta.game_name || row.match_id || 'Unknown Game';
          const key = `${provider} / ${gameName}`;
          if (!thirdPartyMap[key]) {
            thirdPartyMap[key] = { name: key, totalProfit: 0, totalLoss: 0 };
          }
          thirdPartyMap[key].totalProfit += profitAmt;
          thirdPartyMap[key].totalLoss += lossAmt;
        }
      }

      // Resolve event names for sports from SportsBet
      const eventIds = [...new Set(Object.values(sportsMap).map(s => s.eventid).filter(Boolean))];
      const eventNameMap = {};
      if (eventIds.length > 0) {
        const events = await SportsBet.findAll({
          where: { eventid: { [Op.in]: eventIds } },
          attributes: ['eventid', 'match_title'],
          group: ['eventid', 'match_title'],
          raw: true,
        });
        for (const e of events) {
          eventNameMap[e.eventid] = e.match_title;
        }
      }

      const buildRow = (s) => ({
        opening: parseFloat(s.totalLoss.toFixed(2)),
        closing: parseFloat(s.totalProfit.toFixed(2)),
        profit_loss: parseFloat((s.totalProfit - s.totalLoss).toFixed(2)),
      });

      const sports = Object.values(sportsMap).map(s => ({
        event_name: eventNameMap[s.eventid] || `Event ${s.eventid || 'Unknown'}`,
        game_type: s.market_type,
        ...buildRow(s),
      }));

      const casino = Object.values(casinoMap).map(c => ({
        casino_name: c.name,
        ...buildRow(c),
      }));

      const thirdParty = Object.values(thirdPartyMap).map(t => ({
        third_party_name: t.name,
        ...buildRow(t),
      }));

      return res.json({ success: true, sports, casino, thirdParty });

    } catch (error) {
      console.error('getTotalProfitLoss error:', error);
      return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
  },

  // 🔐 Get all OPEN/pending bets for a specific match (event) — used by the
  //    game-details page (main "My Bets" section + any per-match panels).
  //    Strict hierarchy filter using the shared getUserIdsByHierarchy helper:
  //      OWNER  → sees every user under their tree
  //      STAFF  → sees only users in their descendant chain
  //    This is intentionally a separate endpoint from getCurrentBets so it
  //    cannot affect the Current Bets report behavior.
  getMatchDownlineBets: async (req, res) => {
    try {
      const {
        eventId,
        matchId,
        page = 1,
        limit = 100,
        betType,
      } = req.query;

      if (!eventId && !matchId) {
        return res.status(400).json({
          success: false,
          message: 'eventId or matchId is required',
        });
      }

      const loggedInRole = req.user?.role;
      const loggedInUsername = req.user?.username;

      // Hierarchy guard — only downline users (owner sees full tree)
      const allowedUserIds = await getUserIdsByHierarchy(loggedInRole, loggedInUsername);
      if (!allowedUserIds || allowedUserIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 },
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {
        user_id: { [Op.in]: allowedUserIds },
        status: { [Op.in]: ['OPEN', 'PENDING', 'open', 'pending', 'matched', 'Match', 'MATCHED'] },
        result_status: 'pending',
      };

      if (eventId) where.eventid = eventId;
      if (matchId) where.match_id = matchId;
      if (betType && betType !== 'all') where.bet_type = betType;

      const { count, rows } = await SportsBet.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['username'],
          required: true,
        }],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('❌ getMatchDownlineBets error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // 🔐 Get bet history for a particular downline user from the SportsBet table.
  // Requires `username` query param. The user MUST be in the requesting
  // admin's downline hierarchy, otherwise an empty result is returned.
  getUserBetHistory: async (req, res) => {
    try {
      const loggedInUsername = req.user?.username;
      const loggedInRole = req.user?.role;
      const {
        username,
        page = 1,
        limit = 25,
        fromDate,
        toDate,
        betType,
        status,
      } = req.query;

      if (!username || !username.trim()) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 },
          message: 'Please select a user',
        });
      }

      // 1️⃣ Get downline user ids of the logged-in admin
      const downlineUserIds = await getUserIdsByHierarchy(loggedInRole, loggedInUsername);
      if (!downlineUserIds || downlineUserIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 },
        });
      }

      // 2️⃣ Resolve username -> user_id
      const targetUser = await User.findOne({
        where: { username: { [Op.iLike]: username.trim() } },
        attributes: ['user_id', 'username'],
        raw: true,
      });

      if (!targetUser) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 },
          message: 'User not found',
        });
      }

      // 3️⃣ Hierarchy guard — must be in downline
      const downlineSet = new Set(downlineUserIds.map(id => Number(id)));
      if (!downlineSet.has(Number(targetUser.user_id))) {
        return res.status(403).json({
          success: false,
          message: 'User is not in your downline',
        });
      }

      // 4️⃣ Build SportsBet query
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = { user_id: targetUser.user_id };

      if (fromDate && toDate) {
        where.created_at = {
          [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')],
        };
      } else if (fromDate) {
        where.created_at = { [Op.gte]: new Date(fromDate) };
      } else if (toDate) {
        where.created_at = { [Op.lte]: new Date(toDate + 'T23:59:59.999Z') };
      }

      if (betType && betType !== 'all') {
        where.bet_type = betType;
      }
      if (status && status !== 'all') {
        where.result_status = status;
      }

      const { count, rows } = await SportsBet.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
      });

      // 5️⃣ Enrich each bet with derived debit / credit / refund / P/L.
      //
      //    Approach (after verifying that ledger entries can't be trusted for
      //    cosmetic display — see note below):
      //
      //    • debit, credit, refund, profit_loss → derived from the raw
      //      SportsBet row (stake / liability / odds / size / bet_type /
      //      result_status). This is the SAME source of truth that the user
      //      panel and user account-statement use, so the admin display can
      //      never disagree with what the user sees.
      //
      //    • closing_balance → pulled from the FIRST CreditsLedger entry
      //      per bet (placement-time snapshot). We deliberately do NOT use
      //      the latest entry, because that would be the post-settlement
      //      wallet for settled bets — and since settlements often happen
      //      later in time (or in batches), it produces non-monotonic
      //      closings when the rows are sorted by placement time.
      //      Placement closing is consistent with the placement-time DESC
      //      order the API returns.
      //
      //    Why we don't sum ledger amounts:
      //    The settlement code performs TWO wallet updates per FAN bet (one
      //    for exposure release / stake refund, one for netamount profit) but
      //    only writes ONE CreditsLedger row whose `amount` column carries the
      //    netamount portion only. Summing `amount` therefore under-reports
      //    actual wallet credit (e.g. a +200 wallet credit shows as 100). The
      //    raw bet outcome formula matches the real wallet movement.
      //
      //    Hedging bets create a 0-amount bet_placed row plus an
      //    exposure_release row, both with the same `closing`. The first
      //    row's stale closing also breaks any "opening balance" derived
      //    from `firstClosing - firstAmount`, so we no longer expose
      //    opening_balance at all.

      // Pull per-bet ledger data:
      //   • placementCashByBetId → signed sum of amounts from placement-time
      //     entries (bet_placed + exposure_release). This is the REAL cash
      //     impact at placement, which captures hedging releases (e.g. a
      //     LAY bet that frees up cash from a previously locked BACK).
      //     Negative = cash deducted (debit), positive = cash returned (credit).
      //   • closingByBetId → closing column from the FIRST ledger entry per
      //     bet (placement-time wallet snapshot). Used as the row's
      //     "closing balance" so the trail stays consistent with the
      //     placement-time DESC sort.
      const betIds = rows.map(r => r.id).filter(Boolean);
      const closingByBetId = {};
      const placementCashByBetId = {};
      if (betIds.length > 0) {
        const ledgerRows = await CreditsLedger.findAll({
          where: {
            bet_id: { [Op.in]: betIds },
            user_id: String(targetUser.user_id),
          },
          attributes: ['bet_id', 'closing', 'balance', 'amount', 'reason', 'created_at'],
          order: [['bet_id', 'ASC'], ['created_at', 'ASC'], ['id', 'ASC']],
          raw: true,
        });
        for (const lr of ledgerRows) {
          const bid = String(lr.bet_id);

          // First entry per bet → placement closing snapshot
          if (!(bid in closingByBetId)) {
            const closing = lr.closing != null
              ? parseFloat(lr.closing)
              : (lr.balance != null ? parseFloat(lr.balance) : null);
            if (closing != null) closingByBetId[bid] = closing;
          }

          // Sum placement-time amounts (bet_placed + exposure_release).
          // These are the only ledger reasons that can fire at placement
          // time and they carry the true cash delta (hedge releases too).
          const reason = (lr.reason || '').toLowerCase();
          if (reason === 'bet_placed' || reason === 'exposure_release') {
            placementCashByBetId[bid] = (placementCashByBetId[bid] || 0)
              + (parseFloat(lr.amount) || 0);
          }
        }
      }

      // Outcome → debit / credit / refund derivation. Mirrors the same
      // formulas the settlement code uses to compute wallet impact:
      //   • back/yes wins:  stake placed back, gets stake + profit
      //   • lay/no  wins:  liability placed back, gets liability + matched stake
      //   • losses:        nothing returned
      //   • void/refund:   placed amount returned (no profit/loss)
      const isLikeBack = (t) => t === 'back' || t === 'yes';
      const isLikeFancy = (t) => t === 'yes' || t === 'no';

      // Profit on a winning bet — handles all three odds conventions
      // present in this codebase:
      //   1. Bookmaker (BM): odds stored as bps (42 means decimal 1.42),
      //      profit = stake × (odds / 100)
      //   2. Fancy session (FAN with size > 0, e.g. "Normal" run-line
      //      markets): profit = stake × (size / 100)
      //   3. Everything else (MO MATCH_ODDS, fancy1, fancy special markets
      //      like Game Winner / Under-Over / TIED_MATCH): decimal odds,
      //      profit = stake × (odds - 1)
      // Lay/No on win pays the matched back stake regardless of convention.
      const computeProfit = (bet) => {
        const stake = parseFloat(bet.stake_amount) || 0;
        const odds = parseFloat(bet.odds) || 0;
        const size = parseFloat(bet.size) || 0;
        const t = (bet.bet_type || '').toLowerCase();
        const gt = (bet.game_type || '').toUpperCase();
        const mt = (bet.market_type || '');
        const isBack = isLikeBack(t);
        const isFancy = isLikeFancy(t);

        if (!isBack) return stake; // lay/no win → matched back stake

        // ── Three mutually-exclusive cases (mirrors settlementv2.js) ──
        //
        // CASE 1 — Bookmaker (BM): odds are bps (e.g. 42 means 1.42).
        //          profit = stake × (odds / 100)
        //
        // CASE 2 — NON-DECIMAL / SESSION RATE (fancy "Normal" run-line):
        //          `size` is the rate in bps; `odds` is NOT a decimal.
        //          e.g. stake=12000 size=175 → profit = 12000×175/100 = 21000
        //          profit = stake × (size / 100)
        //
        // CASE 3 — DECIMAL odds (MO, fancy1, TIED_MATCH, etc.):
        //          odds is a true decimal (e.g. 1.96). size may be present
        //          on fancy1 as a max-stake cap but is NOT a rate.
        //          profit = stake × (odds - 1)

        // CASE 1 — shared helper, so this agrees to the paisa with placement,
        // settlement and the account statement.
        if (gt === 'BM' || isBookmakerMarket(bet)) {
          return backProfit(stake, bet);
        }
        // CASE 2 — fancy session (Normal). fancy1 is explicitly excluded:
        // its odds are decimal even though bet_type is yes/no.
        if (isFancy && mt !== 'fancy1' && size > 0) {
          return stake * (size / 100);
        }
        // CASE 3 — decimal (default)
        return stake * (odds - 1);
      };

      const computeBetFinancials = (bet, placementCash) => {
        const stake = parseFloat(bet.stake_amount) || 0;
        const liability = parseFloat(bet.liability) || 0;
        const t = (bet.bet_type || '').toLowerCase();
        const status = (bet.result_status || '').toLowerCase();
        const isBack = isLikeBack(t);

        // standaloneLock = the bet's individual risk amount (what would be
        // locked in the wallet if this were the only bet on the market).
        //   • back/yes → full stake
        //   • lay/no   → liability (stake × (odds-1) for decimal,
        //                stake × (odds/100) for BM bps,
        //                stake × (size/100) for fancy session)
        // We always use this for `debit` so that the row math
        // `credit - debit` produces the correct P/L for settled bets,
        // regardless of whether the actual wallet was locked or released
        // at placement (the hedging effect is shown separately in
        // `released`).
        const standaloneLock = isBack ? stake : (liability || stake);

        // Placement-time hedge release. Only fires when the bet's market
        // already had exposure that this bet hedged out, freeing cash.
        let placementRelease = 0;
        if (typeof placementCash === 'number' && placementCash > 0) {
          placementRelease = placementCash;
        }

        // Settlement-time credit / refund / P/L (derived from bet outcome).
        let settlementCredit = 0;
        let voidRefund = 0;
        let profit_loss = 0;

        if (status === 'won' || status === 'win') {
          const profit = computeProfit(bet);
          settlementCredit = standaloneLock + profit; // stake refund + profit
          profit_loss = profit;
        } else if (['loss', 'lost', 'lose'].includes(status)) {
          settlementCredit = 0;
          profit_loss = -standaloneLock;
        } else if (['refund', 'refunded', 'void', 'cancelled'].includes(status)) {
          voidRefund = standaloneLock;
          profit_loss = 0;
        }

        return {
          debit: standaloneLock,
          credit: settlementCredit, // settlement-time win return only
          // `refund` field carries any cash returned that is NOT a win:
          //   • placementRelease (hedge release at placement)
          //   • voidRefund (stake refund on void/cancel)
          // Frontend labels this column "Released".
          refund: placementRelease + voidRefund,
          profit_loss,
        };
      };

      // Round to 2 decimals to avoid JS float precision noise
      // (e.g. 40.99999999999999 → 41.00) on amounts the UI surfaces.
      const r2 = (v) => v == null ? v : Math.round(v * 100) / 100;

      const enriched = rows.map(b => {
        const plain = b.toJSON ? b.toJSON() : b;
        const placementCash = placementCashByBetId[String(plain.id)];
        const fin = computeBetFinancials(plain, placementCash);
        plain.debit = r2(fin.debit);
        plain.credit = r2(fin.credit);
        plain.refund = r2(fin.refund);
        plain.profit_loss = r2(fin.profit_loss);
        plain.closing_balance = closingByBetId[String(plain.id)] ?? null;

        // exposure_held = REAL wallet exposure this bet locked at placement.
        // For normal bets it's the cash that was deducted. For hedge bets
        // (placementCash > 0, i.e. cash was actually released back to the
        // wallet because the new bet reduced max liability), exposure_held
        // is 0 — the bet did not hold any exposure, it freed it. The
        // user-facing distinction matters: showing exposure_held=360 next
        // to released=1000 for the same bet is contradictory.
        if (typeof placementCash === 'number') {
          plain.exposure_held = r2(placementCash < 0 ? Math.abs(placementCash) : 0);
        } else {
          // Legacy bets without placement entries → fallback to raw liability
          plain.exposure_held = plain.liability != null ? r2(parseFloat(plain.liability)) : null;
        }
        return plain;
      });

      // === EVENT-WISE SUMMARY ===
      // Group enriched bets by (match_id + game_type + market_type) so the
      // admin can see at-a-glance how the user did on each event/market.
      // We need ALL of the user's bets in the date range for an accurate
      // summary, not just the current page — re-query without limit/offset.
      const allRowsForSummary = await SportsBet.findAll({
        where, // same date/status/betType filters as the paged query
        order: [['created_at', 'ASC']],
        raw: true,
      });
      const enrichedAll = allRowsForSummary.map(b => {
        const placementCash = placementCashByBetId[String(b.id)];
        const fin = computeBetFinancials(b, placementCash);
        return {
          id: b.id,
          match_id: b.match_id,
          eventid: b.eventid,
          match_title: b.match_title,
          game_type: b.game_type,
          market_type: b.market_type,
          sport_id: b.sport_id,
          result_status: b.result_status,
          stake: parseFloat(b.stake_amount) || 0,
          debit: r2(fin.debit),
          credit: r2(fin.credit),
          refund: r2(fin.refund),
          profit_loss: r2(fin.profit_loss),
        };
      });

      const groupKey = (b) =>
        `${b.eventid || b.match_id || '-'}|${b.game_type || '-'}|${b.market_type || '-'}`;
      // Event-level key (no market breakdown)
      const eventKey = (b) => `${b.eventid || b.match_id || '-'}`;
      const groups = new Map();
      const eventGroups = new Map();
      for (const b of enrichedAll) {
        const key = groupKey(b);
        if (!groups.has(key)) {
          groups.set(key, {
            match_id: b.match_id,
            match_title: b.match_title,
            game_type: b.game_type,
            market_type: b.market_type,
            sport_id: b.sport_id,
            bet_count: 0,
            won_count: 0,
            loss_count: 0,
            pending_count: 0,
            refund_count: 0,
            total_stake: 0,
            total_debit: 0,
            total_credit: 0,
            total_released: 0,
            total_pl: 0,
            net_wallet_impact: 0,
            bet_ids: [],
            first_bet_at: null,
          });
        }
        const g = groups.get(key);
        g.bet_count += 1;
        const status = (b.result_status || '').toLowerCase();
        if (status === 'won' || status === 'win') g.won_count += 1;
        else if (['loss', 'lost', 'lose'].includes(status)) g.loss_count += 1;
        else if (['refund', 'refunded', 'void', 'cancelled'].includes(status)) g.refund_count += 1;
        else g.pending_count += 1;
        g.total_stake += b.stake;
        g.total_debit += b.debit || 0;
        g.total_credit += b.credit || 0;
        g.total_released += b.refund || 0;
        g.total_pl += b.profit_loss || 0;
        g.bet_ids.push(b.id);

        // Also accumulate into event-level groups (no market breakdown)
        const ekey = eventKey(b);
        if (!eventGroups.has(ekey)) {
          eventGroups.set(ekey, {
            match_id: b.match_id,
            match_title: b.match_title,
            sport_id: b.sport_id,
            market_count: new Set(),
            bet_count: 0,
            won_count: 0,
            loss_count: 0,
            pending_count: 0,
            refund_count: 0,
            total_stake: 0,
            total_released: 0,
            total_pl: 0,
            net_wallet_impact: 0,
            bet_ids: [],
          });
        }
        const eg = eventGroups.get(ekey);
        eg.bet_count += 1;
        if (status === 'won' || status === 'win') eg.won_count += 1;
        else if (['loss', 'lost', 'lose'].includes(status)) eg.loss_count += 1;
        else if (['refund', 'refunded', 'void', 'cancelled'].includes(status)) eg.refund_count += 1;
        else eg.pending_count += 1;
        eg.total_stake += b.stake;
        eg.total_released += b.refund || 0;
        eg.total_pl += b.profit_loss || 0;
        eg.market_count.add(b.market_type || b.game_type || '-');
        eg.bet_ids.push(b.id);
      }

      // For pending bets we need to know currently-locked amount per group.
      // Walk enrichedAll again and split bets by status.
      const lockedByGroup = new Map();
      const lockedByEvent = new Map();
      for (const b of enrichedAll) {
        const key = groupKey(b);
        const ekey = eventKey(b);
        const status = (b.result_status || '').toLowerCase();
        const isPending = !['won', 'win', 'loss', 'lost', 'lose', 'refund', 'refunded', 'void', 'cancelled'].includes(status);
        if (isPending) {
          lockedByGroup.set(key, (lockedByGroup.get(key) || 0) + (b.debit || 0));
          lockedByEvent.set(ekey, (lockedByEvent.get(ekey) || 0) + (b.debit || 0));
        }
      }

      const by_event = [];
      const totals = {
        bet_count: 0,
        won_count: 0,
        loss_count: 0,
        pending_count: 0,
        refund_count: 0,
        total_stake: 0,
        total_pl: 0,
        total_released: 0,
        total_locked: 0,
        net_wallet_impact: 0,
      };
      for (const [key, g] of groups) {
        // Net wallet impact for the group:
        //   = sum of realized P/Ls (settled bets)
        //     + sum of currently-locked amounts (pending bets, NEGATIVE)
        //
        // We DELIBERATELY do NOT add `released` here. A hedge release
        // (e.g. +1000 on bet 95) is the offset of the EARLIER bet's lock
        // (-1000 on bet 94 in the same market) — including released would
        // double-count that offset against the bets' own P/L. Sum of
        // individual bet P/Ls already equals the correct market net.
        // `released` is shown separately for transparency only.
        const locked = lockedByGroup.get(key) || 0;
        g.total_locked = r2(-locked); // negative = locked away from wallet
        g.net_wallet_impact = r2(g.total_pl + g.total_locked);

        g.total_stake = r2(g.total_stake);
        g.total_debit = r2(g.total_debit);
        g.total_credit = r2(g.total_credit);
        g.total_released = r2(g.total_released);
        g.total_pl = r2(g.total_pl);
        by_event.push(g);

        totals.bet_count += g.bet_count;
        totals.won_count += g.won_count;
        totals.loss_count += g.loss_count;
        totals.pending_count += g.pending_count;
        totals.refund_count += g.refund_count;
        totals.total_stake += g.total_stake;
        totals.total_pl += g.total_pl;
        totals.total_released += g.total_released;
        totals.total_locked += g.total_locked;
        totals.net_wallet_impact += g.net_wallet_impact;
      }
      // Newest event first (sort by max bet id within the group)
      by_event.sort((a, b) => Math.max(...b.bet_ids) - Math.max(...a.bet_ids));
      totals.total_stake = r2(totals.total_stake);
      totals.total_pl = r2(totals.total_pl);
      totals.total_released = r2(totals.total_released);
      totals.total_locked = r2(totals.total_locked);
      totals.net_wallet_impact = r2(totals.net_wallet_impact);

      // === EVENT-ONLY SUMMARY (by_match) ===
      // Aggregates all markets for the same match into a single row.
      const by_match = [];
      const matchTotals = {
        bet_count: 0, won_count: 0, loss_count: 0,
        pending_count: 0, refund_count: 0,
        total_stake: 0, total_pl: 0, total_released: 0,
        total_locked: 0, net_wallet_impact: 0,
      };
      for (const [ekey, eg] of eventGroups) {
        const locked = lockedByEvent.get(ekey) || 0;
        eg.total_locked = r2(-locked);
        eg.net_wallet_impact = r2(eg.total_pl + eg.total_locked);
        eg.total_stake = r2(eg.total_stake);
        eg.total_released = r2(eg.total_released);
        eg.total_pl = r2(eg.total_pl);
        eg.market_count = eg.market_count.size; // convert Set → count
        by_match.push(eg);

        matchTotals.bet_count += eg.bet_count;
        matchTotals.won_count += eg.won_count;
        matchTotals.loss_count += eg.loss_count;
        matchTotals.pending_count += eg.pending_count;
        matchTotals.refund_count += eg.refund_count;
        matchTotals.total_stake += eg.total_stake;
        matchTotals.total_pl += eg.total_pl;
        matchTotals.total_released += eg.total_released;
        matchTotals.total_locked += eg.total_locked;
        matchTotals.net_wallet_impact += eg.net_wallet_impact;
      }
      by_match.sort((a, b) => Math.max(...b.bet_ids) - Math.max(...a.bet_ids));
      matchTotals.total_stake = r2(matchTotals.total_stake);
      matchTotals.total_pl = r2(matchTotals.total_pl);
      matchTotals.total_released = r2(matchTotals.total_released);
      matchTotals.total_locked = r2(matchTotals.total_locked);
      matchTotals.net_wallet_impact = r2(matchTotals.net_wallet_impact);

      return res.status(200).json({
        success: true,
        data: enriched,
        summary: { by_event, totals, by_match, match_totals: matchTotals },
        user: { user_id: targetUser.user_id, username: targetUser.username },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('❌ getUserBetHistory error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default ReportsController;