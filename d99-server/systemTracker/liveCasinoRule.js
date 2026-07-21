/**
 * liveCasinoRule.js — pure LIVE CASINO (third-party JS games) rulebook.
 *
 * Distinct from the in-house TABLE casino (casinoRule.js / casino_bets):
 *   • integration: jsgamesv2/gameController.js → /api/jsGamesv2 callbacks.
 *   • money model: each callback moves cash AND inr_balance together by (win − bet);
 *     there is NO exposure lock (unlike table casino's exposer). So a round = a `bet`
 *     debit and/or a `win` credit; net P/L = Σ win − Σ bet = exit_balance − entry_balance.
 *   • idempotency: provider callbacks carry an external_transaction_id; a replayed id
 *     for the same type would double-credit/debit — that is the key integrity risk.
 *
 * Pure: no DB. Mirrors sportsRule/casinoRule (RULES + helpers).
 */

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

export const COMPLETED_STATUSES = ['completed', 'success', 'settled', 'done', 'ok'];

export function isWin(t) { return /win/i.test(t.transaction_type || ''); }
export function isBet(t) { return /bet/i.test(t.transaction_type || '') && !/result/i.test(t.transaction_type || ''); }
export function isCompleted(t) {
  const s = String(t.transaction_status || '');
  return s === '' || COMPLETED_STATUSES.some((c) => new RegExp(c, 'i').test(s));
}

// effect of one transaction on the wallet (win credits, bet debits)
export function txnDelta(t) {
  if (isWin(t)) return Math.abs(num(t.amount));
  if (isBet(t)) return -Math.abs(num(t.amount));
  return num(t.amount); // negative_result / debit carry their own sign
}
export function netPL(txns = []) {
  return txns.reduce((s, t) => s + (isWin(t) ? Math.abs(num(t.amount)) : 0) - (isBet(t) ? Math.abs(num(t.amount)) : 0), 0);
}
export function sessionPL(s) { return num(s.exit_balance) - num(s.entry_balance); }

export const RULES = [
  { key: 'noDuplicate', label: 'No duplicate game callback (no double credit)',        severity: 'high' },
  { key: 'allCompleted', label: 'Every transaction is completed (none stuck/failed)',  severity: 'high' },
];

// id replayed for the SAME type ⇒ double credit/debit
export function duplicateGroups(txns = []) {
  const g = {};
  for (const t of txns) {
    if (!t.external_transaction_id) continue;
    const k = `${t.external_transaction_id}::${t.transaction_type}`;
    (g[k] ||= []).push(t);
  }
  return Object.entries(g).filter(([, arr]) => arr.length > 1).map(([k, arr]) => ({ key: k, txns: arr }));
}
export function stuckTxns(txns = []) { return txns.filter((t) => !isCompleted(t)); }

export default { RULES, COMPLETED_STATUSES, isWin, isBet, isCompleted, txnDelta, netPL, sessionPL, duplicateGroups, stuckTxns };
