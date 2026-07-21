
import { Op } from 'sequelize';
import DailyProfitLoss from '../../model/admin/DailyProfitLoss.js';
import Wallet from '../../model/admin/Wallet.js';
import User from '../../model/user/User.js';
import Staff from '../../model/admin/Staff.js';
import CreditsLedger from '../../model/user/CreditsLedger.js';
import sequelize from '../../config/db.js'
// import { format } from 'date-fns';

// Helper: Validate date format
const isValidDate = (dateStr) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
};

// Helper: Build where clause
const buildDateWhere = (start, end) => {
  const where = {};
  if (start && isValidDate(start)) {
    where.date = { [Op.gte]: start };
  }
  if (end && isValidDate(end)) {
    where.date = where.date ? { ...where.date, [Op.lte]: end } : { [Op.lte]: end };
  }
  return where;
};

// === 1. ALL USERS P&L FROM CREDITS LEDGER ===
export const getAllUsersPL = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const role = req.user?.role?.toUpperCase();
    const username = req.user?.username;

    if (!username) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get all user IDs under hierarchy (same as user-win-loss)
    const { getUserIdsByHierarchy } = await import('./userController.js');
    const userIds = await getUserIdsByHierarchy(role, username);

    if (!userIds || userIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Aggregate from credits_ledger grouped by user_id + category
    // Use profit/loss columns instead of amount (amount includes stake returned)
    const ledgerData = await CreditsLedger.findAll({
      where: {
        user_id: { [Op.in]: userIds.map(id => String(id)) }
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

    // Build user map: net P/L = profit + loss (loss is already negative)
    const userMap = {};
    for (const row of ledgerData) {
      if (!userMap[row.user_id]) {
        userMap[row.user_id] = { SPORTS: 0, CASINO: 0, 'THIRD-PARTY': 0 };
      }
      const cat = row.category || 'SPORTS';
      const profit = parseFloat(row.total_profit) || 0;
      const loss = parseFloat(row.total_loss) || 0;
      userMap[row.user_id][cat] = profit + loss;
    }

    const userIdsWithData = Object.keys(userMap).map(Number);
    if (userIdsWithData.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get usernames
    const users = await User.findAll({
      where: { user_id: { [Op.in]: userIdsWithData } },
      attributes: ['user_id', 'username'],
      raw: true
    });
    const usernameMap = {};
    users.forEach(u => { usernameMap[u.user_id] = u.username; });

    // Build response
    let data = userIdsWithData.map(uid => {
      const cats = userMap[uid];
      const sport = cats.SPORTS || 0;
      const casino = cats.CASINO || 0;
      const thirdParty = cats['THIRD-PARTY'] || 0;
      return {
        user_id: uid,
        username: usernameMap[uid] || `User ${uid}`,
        level: 'User',
        casino_pts: parseFloat(casino.toFixed(2)),
        sport_pts: parseFloat(sport.toFixed(2)),
        third_party_pts: parseFloat(thirdParty.toFixed(2)),
        profit_loss: parseFloat((sport + casino + thirdParty).toFixed(2))
      };
    });

    // Apply search filter
    if (search) {
      const term = search.toLowerCase();
      data = data.filter(d => d.username.toLowerCase().includes(term));
    }

    data.sort((a, b) => b.profit_loss - a.profit_loss);

    res.json({ success: true, data });

  } catch (error) {
    console.error('getAllUsersPL error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// === 2. SINGLE USER - FULL HISTORY OR RANGE ===
export const getUserPL = async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const { start, end, summary, page = 1, limit = 30, format } = req.query;
    const offset = (page - 1) * limit;

    const where = { wallet_id };
    Object.assign(where, buildDateWhere(start, end));

    const includeSummary = summary === 'true';

    let attributes = ['date', 'profit_loss', 'verdict'];
    if (includeSummary) {
      attributes = [
        [sequelize.fn('SUM', sequelize.col('profit_loss')), 'total_pl'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN profit_loss >= 0 THEN 1 END")), 'profit_days'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN profit_loss < 0 THEN 1 END")), 'loss_days'],
      ];
    }

    const { count, rows } = await DailyProfitLoss.findAndCountAll({
      attributes,
      where,
      group: includeSummary ? [] : ['date'],
      order: includeSummary ? [] : [['date', 'DESC']],
      offset: parseInt(offset),
      limit: includeSummary ? undefined : parseInt(limit),
      raw: true,
    });

    let data = rows;

    if (includeSummary && data[0]) {
      data = [{
        total_pl: parseFloat(data[0].total_pl || 0).toFixed(2),
        profit_days: parseInt(data[0].profit_days || 0),
        loss_days: parseInt(data[0].loss_days || 0),
        net_verdict: parseFloat(data[0].total_pl) >= 0 ? 'profit' : 'loss',
      }];
    }

    if (format === 'csv') {
      const fields = includeSummary
        ? ['total_pl', 'profit_days', 'loss_days', 'net_verdict']
        : ['date', 'profit_loss', 'verdict'];
      const csv = [fields.join(','), ...data.map(r => fields.map(f => r[f]).join(','))].join('\n');
      res.header('Content-Type', 'text/csv');
      res.attachment(`user-${wallet_id}-pl.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      wallet_id,
      data,
      summary: includeSummary ? data[0] : null,
      pagination: includeSummary ? null : {
        page: parseInt(page),
        total_pages: Math.ceil(count.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// === 3. LOGGED-IN USER P&L ===
export const getMyPL = async (req, res) => {
  try {
    const user = req.user.account.id; // from auth middleware
    if (!user?.wallet_id) {
      return res.status(401).json({ success: false, message: 'User not linked to wallet' });
    }

    req.params.wallet_id = user.wallet_id;
    return getUserPL(req, res); // Reuse logic
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};