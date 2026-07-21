// Shared account-statement builder — single source of truth for BOTH the
// user panel (UserStatementService) and the admin panel
// (TransactionReportService). Guarantees identical, tallying numbers.
//
// Core rule (per product spec):
//   • ONE row per SETTLED bet — Credit if won (winning amount),
//     Debit if lost (lost amount). No separate placement-debit row.
//   • Deposits / withdrawals from the Transaction table (full passbook).
//   • Running balance: Opening + Σ Credit − Σ Debit = Closing (tallies).
//
// Sports rows are derived per-bet from SportsBet using the SAME formula as
// reportsController.getUserWinLoss, so the statement agrees with the P/L
// report. Casino / third-party rows come from the per-bet CreditsLedger
// BET_WIN / BET_LOSS entries (BET_PLACED is intentionally excluded).

import Transaction from '../../model/admin/Transaction.js';
import CreditsLedger from '../../model/user/CreditsLedger.js';
import SportsBet from '../../model/user/SportsBet.js';
import { Op } from 'sequelize';
import sequelize from '../../config/db.js';
import { isBookmakerMarket, backProfit } from '../../helper/marketClassify.js';

const SPORT_NAMES = {
  '1': 'Football', '2': 'Tennis', '4': 'Cricket', '7': 'Horse Racing', '1477': 'Kabaddi',
};
const CASINO_GAME_NAMES = {
  'teen20c': '20-20 Teenpatti C', 'dt20': 'Dragon Tiger 20', 'mogambo': 'Mogambo',
  'teen20': '20-20 Teenpatti', 'teen9': 'Teen Patti 9', 'ab20': 'Andar Bahar 20',
  'lucky7': 'Lucky 7', 'aaa': 'Amar Akbar Anthony',
};

// Transaction types that represent real user-facing cash movements.
const TX_CREDIT = ['ADD_CASH', 'ADD_CREDIT', 'CREDIT', 'CREDIT_INR', 'OPENING_PTS'];
const TX_DEBIT = ['SUBTRACT_CASH', 'SUBTRACT_CREDIT', 'DEBIT', 'DEBIT_INR'];

const r2 = (n) => Math.round((parseFloat(n) || 0) * 100) / 100;

// Per-bet net P/L for a settled sports bet. EXACT mirror of
// reportsController.getUserWinLoss so totals stay consistent.
function sportsNet(b) {
  const stake = parseFloat(b.stake_amount) || 0;
  const liab = parseFloat(b.liability) || 0;
  const odds = parseFloat(b.odds) || 0;
  const size = parseFloat(b.size) || 0;
  const bt = String(b.bet_type || '').toLowerCase();
  const gt = String(b.game_type || '').toUpperCase();
  const mt = String(b.market_type || '').toLowerCase();
  const res = String(b.result_status || '').toLowerCase();
  const isBack = bt === 'back' || bt === 'yes';
  const isLay = bt === 'lay' || bt === 'no';

  let pl = 0;
  if (res === 'won') {
    if (isBack) {
      // Detect bookmaker off the MARKET, not just game_type: bets placed before
      // the classification fix are tagged 'MO' but carry percentage odds, and
      // the decimal branch below would report a ~100x inflated profit.
      if (gt === 'BM' || isBookmakerMarket(b)) pl = backProfit(stake, b);
      else if (mt === 'tied match') pl = stake * (odds / 100);
      else if (gt === 'FAN') {
        // fancy1/oddeven are priced in DECIMAL odds, and their `size` column
        // holds market VOLUME (e.g. 1000000), not a bhav — running them through
        // the size/100 branch books a ~10,000x credit. Payout mirrors
        // settlementv2.processFanBet: a yes win pays stake * (odds - 1).
        if (mt === 'fancy1' || mt === 'oddeven') pl = stake * (odds - 1);
        else pl = size > 0 ? stake * (size / 100) : stake * (odds / 100);
      } else pl = stake * (odds - 1);
    } else if (isLay) {
      pl = stake;
    }
  } else if (res === 'loss') {
    if (isBack) pl = -stake;
    else if (isLay) pl = -liab;
  }
  return pl;
}

// Which categories the requested reportType wants. Accepts the variants
// used by both panels. Empty / 'ALL' => everything (full passbook).
function resolveScope(reportType) {
  const rt = String(reportType || '').toUpperCase().trim();
  if (!rt || rt === 'ALL') return { tx: true, sports: true, casino: true, thirdParty: true };
  if (rt === 'TRANSACTION' || rt === 'DEPOSIT/WITHDRAW') return { tx: true };
  if (rt === 'SPORTS' || rt === 'SPORT') return { sports: true };
  if (rt === 'CASINO') return { casino: true };
  if (rt === 'THIRD-PARTY' || rt === 'THIRD-PARTY-CASINO' || rt === 'THIRD_PARTY_CASINO')
    return { thirdParty: true };
  // Unknown -> full passbook, safest for tally.
  return { tx: true, sports: true, casino: true, thirdParty: true };
}

/**
 * Build a tallying, per-bet account statement for one user.
 * @param {{id:(number|string), username?:string}} user
 * @param {{fromDate?:string, toDate?:string, reportType?:string, page?:number, limit?:number}} filters
 */
export async function buildUserStatement(user, filters = {}) {
  const { fromDate, toDate, reportType, page = 1, limit = 25 } = filters;
  const scope = resolveScope(reportType);
  const uid = user.id;

  // Collect normalized rows: { rawDate, credit, debit, description, fromto, sortId }
  const rows = [];

  // ── 1. Transactions (deposits / withdrawals / transfers) ──
  if (scope.tx) {
    const txs = await Transaction.findAll({
      where: { user_id: uid, type: { [Op.in]: [...TX_CREDIT, ...TX_DEBIT] } },
      order: [['createdAt', 'ASC']],
      raw: true,
    });
    const firstOpening = txs.find(t => t.type === 'ADD_CASH' || t.type === 'ADD_CREDIT' || t.type === 'OPENING_PTS');
    const openingId = firstOpening ? firstOpening.id : null;
    for (const t of txs) {
      const isCredit = TX_CREDIT.includes(t.type);
      const amt = parseFloat(t.amount) || 0;
      let desc = 'Transaction';
      if (isCredit) desc = (t.id === openingId) ? 'Opening Pts' : 'Deposit';
      else desc = 'Withdrawal';
      rows.push({
        rawDate: new Date(t.createdAt),
        credit: isCredit ? amt : 0,
        debit: isCredit ? 0 : amt,
        description: desc,
        fromto: t.initiated_by || '-',
        sortId: `tx-${t.id}`,
      });
    }
  }

  // ── 2. Settled sports bets -> one net row each ──
  if (scope.sports) {
    const bets = await SportsBet.findAll({
      where: { user_id: uid, fixed: 1, result_status: { [Op.in]: ['won', 'loss'] } },
      attributes: ['id', 'created_at', 'stake_amount', 'liability', 'odds', 'size',
        'bet_type', 'game_type', 'market_type', 'result_status',
        'sport_id', 'match_title', 'selection_name', 'fancy_name'],
      raw: true,
    });
    for (const b of bets) {
      const pl = sportsNet(b);
      if (r2(pl) === 0) continue; // void / no-impact
      const sport = SPORT_NAMES[b.sport_id] || (b.sport_id ? `Sport ${b.sport_id}` : 'Sports');
      const market = b.market_type || b.game_type || '-';
      const sel = (b.fancy_name && b.fancy_name !== 'NULL') ? b.fancy_name : (b.selection_name || '-');
      rows.push({
        rawDate: new Date(b.created_at),
        credit: pl > 0 ? r2(pl) : 0,
        debit: pl < 0 ? r2(Math.abs(pl)) : 0,
        description: `${sport} / ${b.match_title || '-'} / ${market} / ${sel}`,
        fromto: market,
        sortId: `sb-${b.id}`,
      });
    }
  }

  // ── 3. Settled casino / third-party bets -> per-bet ledger rows ──
  if (scope.casino || scope.thirdParty) {
    const cats = [];
    if (scope.casino) cats.push('CASINO');
    if (scope.thirdParty) cats.push('THIRD_PARTY_CASINO');
    const led = await CreditsLedger.findAll({
      where: {
        user_id: String(uid),
        category: { [Op.in]: cats },
        reason: { [Op.in]: ['BET_WIN', 'BET_LOSS'] }, // exclude BET_PLACED
      },
      raw: true,
    });

    // Resolve casino game names for nicer remarks.
    const casinoBetIds = led.filter(l => l.category === 'CASINO' && l.bet_id).map(l => l.bet_id);
    const casinoBetMap = {};
    if (casinoBetIds.length > 0) {
      const [cb] = await sequelize.query(
        `SELECT id, game_name, round_id FROM casino_bets WHERE id IN (${casinoBetIds.join(',')})`
      );
      cb.forEach(b => { casinoBetMap[b.id] = b; });
    }

    for (const l of led) {
      const reason = String(l.reason || '').toUpperCase();
      const profit = Math.abs(parseFloat(l.profit) || 0);
      const loss = Math.abs(parseFloat(l.loss) || 0);
      const net = parseFloat(l.netamount) || 0;
      let credit = 0, debit = 0;
      if (reason === 'BET_WIN') credit = profit || Math.abs(net);
      else debit = loss || Math.abs(net);
      if (r2(credit) === 0 && r2(debit) === 0) continue;

      let remark;
      const meta = l.meta || {};
      if (l.category === 'THIRD_PARTY_CASINO') {
        remark = meta.game_name || l.description || 'Third-Party Casino';
      } else {
        const cb = casinoBetMap[l.bet_id];
        const gameName = cb ? (CASINO_GAME_NAMES[cb.game_name] || cb.game_name) : (l.market_type || 'Casino');
        remark = cb && cb.round_id ? `${gameName} / R.No : ${cb.round_id}` : gameName;
      }
      rows.push({
        rawDate: new Date(l.created_at),
        credit: r2(credit),
        debit: r2(debit),
        description: remark,
        fromto: l.category === 'THIRD_PARTY_CASINO' ? (meta.game_name || '-') : (l.market_type || '-'),
        sortId: `ld-${l.id}`,
      });
    }
  }

  // ── 4. Chronological sort (all-time), then running balance ──
  rows.sort((a, b) => {
    const d = a.rawDate - b.rawDate;
    if (d !== 0) return d;
    const an = parseInt(String(a.sortId).replace(/\D/g, ''), 10) || 0;
    const bn = parseInt(String(b.sortId).replace(/\D/g, ''), 10) || 0;
    return an - bn;
  });

  let bal = 0; // clean-start opening = 0
  for (const row of rows) {
    bal = r2(bal + row.credit - row.debit);
    row.closing = bal;
  }

  // ── 5. Date-window filter for display (keep computed running balance) ──
  let windowRows = rows;
  if (fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate + 'T23:59:59.999Z');
    windowRows = rows.filter(r => r.rawDate >= from && r.rawDate <= to);
  }

  // Opening balance carried into the window = balance just before first row.
  const openingBalance = windowRows.length
    ? r2(windowRows[0].closing - windowRows[0].credit + windowRows[0].debit)
    : (rows.length ? rows[rows.length - 1].closing : 0);

  const totalCredit = r2(windowRows.reduce((s, r) => s + r.credit, 0));
  const totalDebit = r2(windowRows.reduce((s, r) => s + r.debit, 0));
  const closing = windowRows.length ? windowRows[windowRows.length - 1].closing : openingBalance;

  // ── 6. Paginate & shape ──
  const total = windowRows.length;
  const offset = (page - 1) * limit;
  const data = windowRows.slice(offset, offset + parseInt(limit)).map(r => ({
    id: r.sortId,
    date: r.rawDate,
    credit: r.credit,
    debit: r.debit,
    closing: r.closing,
    description: r.description,
    fromto: r.fromto,
  }));

  return {
    success: true,
    data,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: parseInt(page),
    totals: {
      opening: openingBalance,
      totalCredit,
      totalDebit,
      closing: r2(closing),
      netPL: r2(totalCredit - totalDebit),
    },
  };
}

export default { buildUserStatement };
