// Shared helper to derive correct cash flow values from a SportsBet row.
//
// Why this exists:
//   The settlement code (settlementv2.js / settlementnew.js) updates the
//   user wallet TWICE for a winning bet — once for stake refund (exposure
//   release) and once for profit (netamount) — but only writes ONE
//   CreditsLedger row whose `amount` column carries the netamount portion.
//   So summing `amount` understates the actual wallet credit (e.g. a +47500
//   wallet credit shows as +22500). The closing column is correct.
//
//   Account-statement displays (admin + user) and per-bet history all need
//   to show the *real* cash flow. They derive credit/debit/refund from the
//   raw bet outcome instead of trusting the ledger amount column.
//
// Conventions used here mirror settlementv2.js wallet update math:
//   • back/yes wins:  stake placed back; on win → stake refund + profit
//   • lay/no  wins:  liability locked;  on win → liability + matched stake
//   • losses:        nothing returned (placed amount stays gone)
//   • void/refund:   placed amount returned, no P/L

const isLikeBack = (t) => t === 'back' || t === 'yes';
const isLikeFancy = (t) => t === 'yes' || t === 'no';

/**
 * Profit on a winning bet (amount on top of the stake refund).
 */
export const computeBetProfit = (bet) => {
  const stake = parseFloat(bet.stake_amount) || 0;
  const odds  = parseFloat(bet.odds) || 0;
  const size  = parseFloat(bet.size) || 0;
  const t     = (bet.bet_type || '').toLowerCase();
  const gt    = (bet.game_type || '').toUpperCase();
  const mt    = (bet.market_type || '');

  // Lay/No on win: pays out the matched back's stake. No odds math.
  if (!isLikeBack(t)) return stake;

  // ── Three mutually-exclusive cases, matching settlementv2.js wallet math ──
  //
  // CASE 1 — Bookmaker (BM): odds stored as bps. e.g. odds=42 means 1.42x.
  //          profit = stake × (odds / 100)
  //
  // CASE 2 — NON-DECIMAL / SESSION RATE (fancy "Normal" run-line markets):
  //          `odds` field isn't a decimal — `size` is the rate in bps.
  //          e.g. stake=12000, size=175 → profit = 12000 × 175/100 = 21000
  //          profit = stake × (size / 100)
  //
  // CASE 3 — DECIMAL odds (everything else: MO, fancy1, TIED_MATCH, etc.):
  //          odds field is a true decimal (e.g. 1.96). size may be present
  //          as a max-stake cap (fancy1) but MUST NOT be used as a rate.
  //          profit = stake × (odds - 1)

  // CASE 1
  if (gt === 'BM' || /bookmaker/i.test(mt)) {
    return stake * (odds / 100);
  }

  // CASE 2 — fancy session (Normal run-line). fancy1 is explicitly NOT
  // session: its odds are decimal even though bet_type is yes/no.
  if (isLikeFancy(t) && mt !== 'fancy1' && size > 0) {
    return stake * (size / 100);
  }

  // CASE 3 — decimal odds (default)
  return stake * (odds - 1);
};

/**
 * Derive { debit, credit, refund, profit_loss } for a single bet from its
 * raw fields (stake/liability/odds/size/bet_type/result_status).
 *
 *   • debit  = what the wallet locked at placement
 *   • credit = what the wallet received back at settlement (only > 0 on wins)
 *   • refund = placed amount returned on void/cancel/refund
 */
export const computeBetFinancials = (bet) => {
  const stake     = parseFloat(bet.stake_amount) || 0;
  const liability = parseFloat(bet.liability) || 0;
  const t         = (bet.bet_type || '').toLowerCase();
  const status    = (bet.result_status || '').toLowerCase();
  const isBack    = isLikeBack(t);

  // Debit at placement = wallet lock for THIS bet:
  //   back/yes → full stake; lay/no → liability
  const debit = isBack ? stake : (liability || stake);

  let credit = 0;
  let refund = 0;
  let profit_loss = 0;

  if (status === 'won' || status === 'win') {
    const profit = computeBetProfit(bet);
    credit = debit + profit;
    profit_loss = profit;
  } else if (['loss', 'lost', 'lose'].includes(status)) {
    profit_loss = -debit;
  } else if (['refund', 'refunded', 'void', 'cancelled'].includes(status)) {
    refund = debit;
  }

  return { debit, credit, refund, profit_loss };
};
