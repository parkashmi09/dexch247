/**
 * casinoRule.js — pure CASINO settlement rulebook (no DB).
 *
 * Source of truth: the live casino engine + credits_ledger. Calibrated against real
 * settled bets (0 mismatches): a casino bet is always a single BACK stake — you risk
 * the stake to win stake×(odds−1). So:
 *   • WIN  → ledger BET_WIN, amount = stake × odds (full payout), profit = stake × (odds−1)
 *   • LOSS → ledger BET_LOSS, loss  = −stake (the whole stake is forfeited)
 *   • exposure (open bet) = the stake locked (exposer = −stake); all bets independent
 *     (no hedging/MIN like sports team markets) → net casino exposure = −Σ stake.
 *
 * Mirrors sportsRule.js: pure formulas + a checkBet() that returns concept violations.
 */

const TOL = 0.01;
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const lc = (s) => String(s == null ? '' : s).toLowerCase();
const r2 = (v) => Number(num(v).toFixed(2));

export const LEDGER = { WIN: 'BET_WIN', LOSS: 'BET_LOSS', REFUND: 'refund' };
export const OPEN_STATUSES = ['open', 'processing'];
export const VOID_RESULT_STATUSES = ['void', 'refund', 'cancelled', 'cancel'];

export function isVoid(b) { return VOID_RESULT_STATUSES.includes(lc(b.result_status)); }
export function isOpen(b) { return OPEN_STATUSES.includes(lc(b.status)); }
export function isSettled(b) { return lc(b.status) === 'closed' || ['won', 'lost', 'loss', 'void'].includes(lc(b.result_status)); }
export function betWon(b) { return lc(b.result_status) === 'won'; }
export function betLost(b) { return ['lost', 'loss'].includes(lc(b.result_status)); }

// money concepts (calibrated)
export function winPayout(stake, odds) { return num(stake) * num(odds); }        // total returned on win
export function winProfit(stake, odds) { return num(stake) * (num(odds) - 1); }  // net profit on win
export function lossAmount(stake) { return num(stake); }                          // forfeited on loss
// Cash this bet locked (exposer is stored negative). SIGNED, not absolute: book-managed
// markets (aaa, dum10) lock the marginal worst case, so a hedge stores a positive exposer
// meaning it RELEASED cash — abs() would count that release as a second lock.
export function exposureOf(b) { return -num(b.exposer != null ? b.exposer : -num(b.stake)); }
// net casino exposure = −Σ(open stake); independent bets, no hedging
export function computeExposure(openBets) { return -(openBets || []).reduce((s, b) => s + exposureOf(b), 0); }

export const RULES = [
  { key: 'settleRecord',  label: 'Every settled bet has a win/loss record',     severity: 'high' },
  { key: 'noDoubleSettle', label: 'No bet is settled twice (no double payout)', severity: 'high' },
  { key: 'winPayout',     label: 'Winning payout = stake × odds (review)',      severity: 'review' },
  { key: 'lossAmount',    label: 'A losing bet forfeits exactly the stake',     severity: 'high' },
  { key: 'voidRefund',    label: 'A voided bet is refunded (no win/loss)',      severity: 'high' },
];

const within = (a, b) => Math.abs(num(a) - num(b)) <= Math.max(TOL, Math.abs(num(b)) * 0.001);

// Check ONE settled bet against its CASINO ledger rows → [{key,label,severity,detail}].
export function checkBet(bet, ledgerRows = []) {
  const out = [];
  const rule = (k) => RULES.find((r) => r.key === k) || { key: k, label: k, severity: 'high' };
  const flag = (k, detail) => { const r = rule(k); out.push({ key: k, label: r.label, severity: r.severity, detail }); };
  if (!isSettled(bet)) return out; // only settled bets are checked

  const win = ledgerRows.filter((r) => /BET_WIN/i.test(r.reason));
  const loss = ledgerRows.filter((r) => /BET_LOSS/i.test(r.reason));
  const stake = num(bet.stake), odds = num(bet.odds);

  if (isVoid(bet)) {
    if (win.length || loss.length) flag('voidRefund', `voided but has ${win.length} win / ${loss.length} loss record(s)`);
    return out;
  }
  if (betWon(bet)) {
    if (win.length === 0) { flag('settleRecord', 'won but no BET_WIN record'); return out; }
    if (win.length > 1) flag('noDoubleSettle', `${win.length} BET_WIN records (double payout)`);
    const amt = num(win[0].amount);
    const payout = winPayout(stake, odds), profit = winProfit(stake, odds);
    // Verify the PAYOUT AMOUNT only (= stake×odds, or just the profit leg). The ledger's
    // `profit` field is game-specific (some games book net differently) and reconciles
    // with users.profit, so it is NOT cross-checked here — only the money the player
    // actually received matters, and that is the payout amount.
    // Cash credited on a win = the lock that was taken + the profit. For independent
    // bets the lock is the stake, so that collapses to stake×odds; on a book-managed
    // market (aaa, dum10) the lock is marginal and the credit is smaller by the hedge.
    const lockedCredit = exposureOf(bet) + profit;
    const okAmount = within(amt, payout) || within(amt, profit) || within(amt, lockedCredit);
    if (!okAmount) flag('winPayout', `paid ${r2(amt)}; expected payout ${r2(payout)} (profit ${r2(profit)}) for stake ${r2(stake)} @ ${odds}`);
  } else if (betLost(bet)) {
    if (loss.length === 0) { flag('settleRecord', 'lost but no BET_LOSS record'); return out; }
    if (loss.length > 1) flag('noDoubleSettle', `${loss.length} BET_LOSS records`);
    const lost = Math.abs(num(loss[0].loss != null ? loss[0].loss : loss[0].amount));
    if (!within(lost, lossAmount(stake))) flag('lossAmount', `forfeited ${r2(lost)} but stake was ${r2(stake)}`);
  }
  return out;
}

export default {
  LEDGER, RULES, OPEN_STATUSES, VOID_RESULT_STATUSES,
  isVoid, isOpen, isSettled, betWon, betLost,
  winPayout, winProfit, lossAmount, exposureOf, computeExposure, checkBet,
};
