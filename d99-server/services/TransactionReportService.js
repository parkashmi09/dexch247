
import Transaction from '../model/admin/Transaction.js';
import CreditsLedger from '../model/user/CreditsLedger.js';
import SportsBet from '../model/user/SportsBet.js';
import Staff from '../model/admin/Staff.js';
import User from '../model/user/User.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';
import { buildUserStatement } from './statement/StatementBuilder.js';
import { getUserIdsByHierarchy } from '../controller/admin/userController.js';

const SPORT_NAMES = {
  '1': 'Football',
  '2': 'Tennis',
  '4': 'Cricket',
  '7': 'Horse Racing',
  '1477': 'Kabaddi',
};

const CASINO_GAME_NAMES = {
  'teen20c': '20-20 Teenpatti C',
  'dt20': 'Dragon Tiger 20',
  'mogambo': 'Mogambo',
  'teen20': '20-20 Teenpatti',
  'teen9': 'Teen Patti 9',
  'ab20': 'Andar Bahar 20',
  'lucky7': 'Lucky 7',
  'aaa': 'Amar Akbar Anthony',
};

const TransactionReportService = {
  /**
   * Generate account statement for a given target (User/Staff/Owner)
   * @param {Object} target - { id, type, username }
   * @param {Object} filters - { fromDate, toDate, gameName, page, limit }
   */
  getStatement: async (target, filters) => {
    const { fromDate, toDate, reportType, page = 1, limit = 25 } = filters;
    const offset = (page - 1) * limit;

    try {
      if (target.type === 'USER') {
        // Delegate to the shared StatementBuilder — same source as the user
        // panel: one net row per SETTLED bet (Credit if won, Debit if lost),
        // plus deposits/withdrawals, with a tallying running balance.
        console.log(`🔍 [TransactionReportService] Statement for User ID: ${target.id} | Filter: ${reportType}`);
        return buildUserStatement({ id: target.id, username: target.username }, filters);

      } else {
        // --- STAFF/OWNER LOGIC ---
        console.log(`🔍 [TransactionReportService] Fetching data for Staff/Owner: ${target.username} | Filter: ${reportType}`);

        const isLedgerReport = reportType === 'SPORTS' || reportType === 'CASINO' || reportType === 'THIRD-PARTY';

        if (isLedgerReport) {
          // For SPORTS/CASINO/THIRD-PARTY: fetch CreditsLedger for all descendant users
          // Staff's share = user P&L * (staff.percentage / 100). If percentage is 0/null, share is 0.
          let staffPercentage = 0;
          if (target.type !== 'OWNER') {
            const staff = await Staff.findOne({
              where: { username: target.username },
              attributes: ['percentage'],
              raw: true
            });
            staffPercentage = parseFloat(staff?.percentage || 0);
          }

          // Owner sees all users; staff sees only their direct users
          let userIds = [];
          if (target.type === 'OWNER') {
            userIds = await getUserIdsByHierarchy(target.type, target.username);
          } else {
            // Staff: only direct users (parent_staff_id = this staff's id)
            const staffRecord = await Staff.findOne({
              where: { username: target.username },
              attributes: ['staff_id'],
              raw: true
            });
            if (staffRecord) {
              const directUsers = await User.findAll({
                where: { parent_staff_id: staffRecord.staff_id },
                attributes: ['user_id'],
                raw: true
              });
              userIds = directUsers.map(u => u.user_id);
            }
          }

          if (!userIds || userIds.length === 0) {
            return { success: true, data: [], total: 0, totalPages: 0, currentPage: parseInt(page) };
          }

          const ledgerWhere = {
            user_id: { [Op.in]: userIds.map(id => String(id)) },
            category: reportType === 'THIRD-PARTY' ? 'THIRD_PARTY_CASINO' : reportType,
          };
          if (fromDate && toDate) {
            ledgerWhere.created_at = { [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')] };
          }

          const ledgers = await CreditsLedger.findAll({
            where: ledgerWhere,
            order: [['created_at', 'ASC']],
            raw: true
          });

          // Build bet lookup maps for descriptions
          let sportsBetMap = {};
          let casinoBetMap = {};
          const betIds = ledgers.map(l => l.bet_id).filter(Boolean);

          if (betIds.length > 0) {
            if (reportType === 'SPORTS') {
              const sportsBets = await SportsBet.findAll({
                where: { id: { [Op.in]: betIds } },
                attributes: ['id', 'match_title', 'selection_name', 'market_type', 'sport_id', 'game_type', 'fancy_name'],
                raw: true
              });
              sportsBets.forEach(b => { sportsBetMap[b.id] = b; });
            }

            if (reportType === 'CASINO') {
              try {
                const [bets] = await sequelize.query(
                  `SELECT id, game_name, round_id, player_name FROM casino_bets WHERE id IN (${betIds.join(',')})`,
                );
                bets.forEach(b => { casinoBetMap[b.id] = b; });
              } catch (e) { /* casino_bets table might not exist */ }
            }
          }

          let runningClosing = 0;
          const formattedLedgers = ledgers.map(l => {
            const userAmt = parseFloat(l.amount || 0);
            // Staff's share of P&L = user amount * percentage / 100
            const staffAmt = userAmt * (staffPercentage / 100);
            runningClosing += staffAmt;

            let remark = l.description || l.reason;

            const sportsBet = sportsBetMap[l.bet_id];
            if (sportsBet) {
              const sportName = SPORT_NAMES[sportsBet.sport_id] || `Sport ${sportsBet.sport_id}`;
              const matchTitle = sportsBet.match_title || '-';
              const marketType = sportsBet.market_type || sportsBet.game_type || '-';
              const selection = (sportsBet.fancy_name && sportsBet.fancy_name !== 'NULL')
                ? sportsBet.fancy_name
                : (sportsBet.selection_name || '-');
              remark = `${sportName} / ${matchTitle} / ${marketType} / ${selection}`;
            }

            const casinoBet = casinoBetMap[l.bet_id];
            if (casinoBet) {
              const gameName = CASINO_GAME_NAMES[casinoBet.game_name] || casinoBet.game_name;
              const parts = [gameName];
              if (casinoBet.round_id) parts.push(`R.No : ${casinoBet.round_id}`);
              if (casinoBet.player_name) parts.push(casinoBet.player_name);
              remark = parts.join(' / ');
            }

            let fromto = '-';
            if (l.category === 'THIRD_PARTY_CASINO') {
              const meta = l.meta || {};
              const provider = meta.provider || l.sport_id || 'Third-Party';
              const gameName = meta.game_name || '-';
              remark = `${provider} / ${gameName}`;
              fromto = gameName;
            }

            return {
              id: `lg-${l.id}`,
              date: l.created_at,
              credit: staffAmt > 0 ? parseFloat(staffAmt.toFixed(2)) : 0,
              debit: staffAmt < 0 ? parseFloat(Math.abs(staffAmt).toFixed(2)) : 0,
              closing: parseFloat(runningClosing.toFixed(2)),
              description: remark,
              fromto,
            };
          });

          const total = formattedLedgers.length;
          const paginatedData = formattedLedgers.slice(offset, offset + parseInt(limit));

          return {
            success: true,
            data: paginatedData,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
          };

        } else {
          // TRANSACTION / Deposit-Withdraw / ALL: fetch from Transaction table
          // Only show rows where this staff's wallet was affected (username = their name)
          let where = {
            username: target.username
          };

          if (fromDate && toDate) {
            where.createdAt = { [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')] };
          }

          const { count, rows } = await Transaction.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
          });

          const tableData = rows.map(row => {
            const creditTypes = ['ADD_CASH', 'ADD_CREDIT', 'CREDIT', 'CREDIT_INR'];
            const debitTypes = ['SUBTRACT_CASH', 'SUBTRACT_CREDIT', 'DEBIT', 'DEBIT_INR', 'DEBIT_FOR_CASH', 'DEBIT_FOR_CREDIT'];

            const isCredit = creditTypes.includes(row.type);
            const isDebit = debitTypes.includes(row.type);

            let friendlyRemark = row.type || 'Transaction';
            if (row.type === 'ADD_CASH' || row.type === 'ADD_CREDIT') friendlyRemark = 'Deposit';
            if (row.type === 'SUBTRACT_CASH' || row.type === 'SUBTRACT_CREDIT') friendlyRemark = 'Withdrawal';
            if (row.type === 'DEBIT_FOR_CASH') friendlyRemark = 'Cash Given';
            if (row.type === 'DEBIT_FOR_CREDIT') friendlyRemark = 'Credit Given';
            if (row.type === 'OPENING_PTS') friendlyRemark = 'Opening Pts';

            return {
              id: row.id,
              date: row.createdAt,
              credit: isCredit ? parseFloat(row.amount).toFixed(2) : '-',
              debit: isDebit ? parseFloat(row.amount).toFixed(2) : '-',
              closing: parseFloat(row.new_balance || row.balance || 0).toFixed(2),
              description: friendlyRemark,
              fromto: (row.debit && row.credit) ? `${row.debit} → ${row.credit}` : (row.debit || row.credit || row.initiated_by || '-')
            };
          });

          return {
            success: true,
            data: tableData,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
          };
        }
      }
    } catch (error) {
      console.error('❌ [TransactionReportService] Error:', error);
      throw error;
    }
  },
  /**
   * Dedicated logic for a user's self-account statement.
   * Focuses on Transaction table for Deposit/Withdrawal and CreditsLedger for Sports/Casino.
   */
  getUserStatement: async (target, filters) => {
    const { fromDate, toDate, reportType, page = 1, limit = 25 } = filters;
    const offset = (page - 1) * limit;

    try {
      console.log(`🔍 [TransactionReportService] Fetching USER Statement for: ${target.username} | Filter: ${reportType}`);

      let transactions = [];
      let ledgers = [];

      // Determine what to fetch based on reportType
      // We assume types: TRANSACTION (Deposit/Withdraw), SPORTS, CASINO, THIRD-PARTY, ALL
      const shouldFetchTransactions = !reportType || reportType === 'ALL' || reportType === 'TRANSACTION';
      const shouldFetchLedger = !reportType || reportType === 'ALL' || reportType === 'SPORTS' || reportType === 'CASINO' || reportType === 'THIRD-PARTY';

      // 1. Fetch Transactions (Deposit/Withdrawal)
      if (shouldFetchTransactions) {
        const transactionWhere = { user_id: target.id };
        if (fromDate && toDate) {
          transactionWhere.createdAt = { [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')] };
        }
        transactions = await Transaction.findAll({
          where: transactionWhere,
          order: [['createdAt', 'DESC']],
        });
      }

      // 2. Fetch Ledger (Bets/P&L)
      if (shouldFetchLedger) {
        const ledgerWhere = { user_id: target.id.toString() };
        if (reportType && reportType !== 'ALL') {
          ledgerWhere.reason = reportType;
        }
        if (fromDate && toDate) {
          ledgerWhere.created_at = { [Op.between]: [new Date(fromDate), new Date(toDate + 'T23:59:59.999Z')] };
        }
        ledgers = await CreditsLedger.findAll({
          where: ledgerWhere,
          order: [['created_at', 'DESC']],
        });
      }

      // 3. Normalize & Combine
      const formattedTransactions = transactions.map(t => {
        const isCredit = t.type === 'ADD_CASH' || t.type === 'ADD_CREDIT' || t.type === 'CREDIT' || t.type === 'CREDIT_INR';
        const isDebit = t.type === 'SUBTRACT_CASH' || t.type === 'SUBTRACT_CREDIT' || t.type === 'DEBIT' || t.type === 'DEBIT_INR' || t.type === 'DEBIT_FOR_CASH' || t.type === 'DEBIT_FOR_CREDIT';

        let friendlyRemark = t.type || 'Transaction';
        if (t.type === 'ADD_CASH' || t.type === 'ADD_CREDIT' || t.type === 'CREDIT_INR') friendlyRemark = 'deposit';
        if (t.type === 'SUBTRACT_CASH' || t.type === 'SUBTRACT_CREDIT' || t.type === 'DEBIT_INR') friendlyRemark = 'withdrawal';
        if (t.type === 'OPENING_PTS') friendlyRemark = 'Opening Pts';

        return {
          id: `tx-${t.id}`,
          date: t.createdAt,
          credit: isCredit ? t.amount : 0,
          debit: isDebit ? t.amount : 0,
          closing: t.new_balance || t.balance,
          description: friendlyRemark,
          rawDate: new Date(t.createdAt)
        };
      });

      const formattedLedgers = ledgers.map(l => {
        const isCredit = parseFloat(l.amount) > 0;
        return {
          id: `ld-${l.id}`,
          date: l.created_at,
          credit: isCredit ? l.amount : 0,
          debit: !isCredit ? Math.abs(l.amount) : 0,
          closing: l.balance,
          description: l.description || l.reason,
          rawDate: new Date(l.created_at)
        };
      });

      // Combine and Sort
      const combined = [...formattedTransactions, ...formattedLedgers].sort((a, b) => b.rawDate - a.rawDate);

      // Pagination
      const total = combined.length;
      const paginatedData = combined.slice(offset, offset + limit);

      return {
        success: true,
        data: paginatedData,
        total: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      };

    } catch (e) {
      console.error('❌ getUserStatement error:', e);
      throw e;
    }
  }
};

export default TransactionReportService;
