

// Global error handlers
process.on('uncaughtException', err => {
  console.error('[Settlement] Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', err => {
  console.error('[Settlement] Unhandled Rejection:', err);
  process.exit(1);
});




import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import http from 'http';
import https from 'https';
import axios from 'axios';
import { Op } from 'sequelize';
import SportsSettlementReport from '../../model/user/SportsSettlementReport.js';
import SportsEventResultScan from '../../model/user/SportsEventResultScan.js';
import SportsEventResultSummary from '../../model/user/SportsEventResultSummary.js';
import Wallet from '../../model/admin/Wallet.js';
import CreditsLedger from '../../model/user/CreditsLedger.js';
import UserExposure from '../../model/user/UserExposure.js';
import SportsBet from '../../model/user/SportsBet.js';
import MarketWin from '../../model/user/MarketWin.js';
import FanWin from '../../model/user/FanWin.js';
import SportsEventSettlementJob from '../../model/user/SportsEventSettlementJobs.js';
// import * as UplineService from '../../services/UplineService.js';
import User from '../../model/user/User.js';
import UserNetExposure from '../../model/user/UserNetExposure.js';
import { syncTotalExposure } from '../../helper/netExposureHelper.js';
import { emitBalanceUpdate } from '../../utils/socketUtils.js';

console.log('[Settlement] Process started');

// ==== Config ====
const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true';
const BATCH_LIMIT = +(process.env.SETTLE_BATCH_LIMIT || 10);
const RESULTS_API_BASE = process.env.RESULTS_API_BASE;
const API_TIMEOUT_MS = +(process.env.API_TIMEOUT_MS || 30000);
const LEDGER_ZERO_ROWS = process.env.LEDGER_ZERO_ROWS === '1' || process.env.LEDGER_ZERO_ROWS === 'true';
const LOG_DIR = process.env.SETTLEMENT_LOG_DIR || path.join(process.cwd(), 'sportsbet/betresult/logs');
const LOG_BASENAME = 'settlement-worker-v2_3_2';
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/2 * * * *';
const CRON_TZ = process.env.CRON_TZ || 'UTC';
const CRON_IMMEDIATE = process.env.CRON_IMMEDIATE === '1' || process.env.CRON_IMMEDIATE === 'true';
const MAX_CONCURRENT_API = +(process.env.MAX_CONCURRENT_API || 3);
const RESULTS_RATE_LIMIT_MS = +(process.env.RESULTS_RATE_LIMIT_MS || 250);
const RESULTS_MAX_FETCH_RETRIES = +(process.env.RESULTS_MAX_FETCH_RETRIES || 6);
const RESULTS_RETRY_BASE_MS = +(process.env.RESULTS_RETRY_BASE_MS || 500);
const RESULTS_FORCE_IPV4 = process.env.RESULTS_FORCE_IPV4 === '1' || process.env.RESULTS_FORCE_IPV4 === 'true';
const RESULTS_DISABLE_KEEPALIVE = process.env.RESULTS_DISABLE_KEEPALIVE === '1' || process.env.RESULTS_DISABLE_KEEPALIVE === 'true';
const USER_AGENT = process.env.USER_AGENT || `settlement-worker/2.3.2 (+node ${process.version})`;

const marketsfornonfancy = [
  'Game Winner 1/2',
  'OVER_UNDER_35',
  'OVER_UNDER_25',
  'OVER_UNDER_15',
  'OVER_UNDER_05',
  'Under/Over 5.5',
  'Under/Over 0.5',
  'Under/Over 1.5',
  'Under/Over 2.5',
  'Under/Over 3.5',
  'Under/Over 4.5',
  'Under/Over 6.5',
  '2nd Period Winner',
  '1st Period Winner',
  '3rd Period Winner',
  'Next Goal 1.0',
  'Next Goal 2.0',
  'Next Goal 3.0',
  'Next Goal 4.0',
  'Next Goal 5.0',
  'Next Goal 6.0',
  'Next Goal 7.0',
  'Next Goal 8.0',
  'Next Goal 9.0',
  'Next Goal 10.0',
  'HALF_TIME',
  'Match Time Result 70:00',
  'Match Time Result 10:00',
  'Match Time Result 30:00',
  'Match Time Result 20:00',
  'Match Time Result 40:00',
  'Match Time Result 60:00',
  'Match Time Result 50:00',
  'Match Time Result 70:00',
  'Match Time Result 80:00',
  'Match Time Result 90:00',
  'Game Winner 1/1',
  'Game Winner 1/2',
  'Game Winner 1/3',
  'Game Winner 1/4',
  'Game Winner 2/2',
  'Game Winner 2/3',
  'Game Winner 2/4',
  'Game Winner 3/3',
  'Game Winner 3/4',
  'Game Winner 4/4',
  'Game Winner 2/7',
  'Game Winner 3/7',
  'Game Winner 4/7',
  'Game Winner 5/7',
  'Game Winner 6/7',
  'Game Winner 7/7',
  '1st Set Winner Home/Away',
  '2nd Set Winner Home/Away',
  '3rd Set Winner Home/Away',
  '4th Set Winner Home/Away',
  '5th Set Winner Home/Away',
  '1st Set Race To 4.0',
  '2nd Set Race To 4.0',
  '3rd Set Race To 4.0',
  '4th Set Race To 4.0',
  '5th Set Race To 4.0',
  'Point Winner 1/3/1',
  'Point Winner 1/3/2',
  'Point Winner 1/3/3',
  'Point Winner 1/2/1',
  'Point Winner 1/1/1',
  'Point Winner 2/3/1',
  'Point Winner 2/3/2',
  'Point Winner 2/3/3',
  'Point Winner 2/2/1',
  'Point Winner 2/2/2',
  'Point Winner 2/1/1',
  'Point Winner 3/3/1',
  'Point Winner 3/3/2',
  'Point Winner 3/3/3',
  'Point Winner 3/2/1',
  'Point Winner 3/2/2',
  'Point Winner 3/2/3',
  'Point Winner 3/1/1',
  'Point Winner 3/1/2',
  'Point Winner 3/1/3',
  'Point Winner 4/4/1',
  'Point Winner 4/4/2',
  'Point Winner 4/4/3',
  'Point Winner 4/4/4',
  'Point Winner 4/3/1',
  'Point Winner 4/3/2',
  'Point Winner 4/3/3',
  'Point Winner 4/3/4',
  'Point Winner 4/2/1',
  'Point Winner 4/2/2',
  'Point Winner 4/2/3',
  'Point Winner 4/2/4',
  'Point Winner 4/1/1',
  'Point Winner 4/1/2',
  'Point Winner 4/1/3',
  'Point Winner 4/1/4',
];

const marketsfor01fancy = [
  'TIED_MATCH',
  'Tied Match',
  'Game To Deuce 1/1',
  'Game To Deuce 1/2',
  'Game To Deuce 1/3',
  'Game To Deuce 1/4',
  'Game To Deuce 2/1',
  'Game To Deuce 2/2',
  'Game To Deuce 2/3',
  'Game To Deuce 2/4',
  'Game To Deuce 3/1',
  'Game To Deuce 3/2',
  'Game To Deuce 3/3',
  'Game To Deuce 3/4',
  'Game To Deuce 4/1',
  'Game To Deuce 4/2',
  'Game To Deuce 4/3',
  'Game To Deuce 4/4',
  'Both Teams To Score',
  'Match Result/Both Teams to score'

];

// ==== Logging ====
function ensureLogDir() {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log('[Settlement] Log directory ensured:', LOG_DIR);
  } catch (e) {
    console.error('[Settlement] Failed to create log directory:', e.message);
  }
}
ensureLogDir();
function currentLogPath() {
  const d = new Date(), yyyy = d.getFullYear(), mm = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
  return path.join(LOG_DIR, `${LOG_BASENAME}-${yyyy}-${mm}-${dd}.log`);
}
function writeLog(level, msg, ctx = {}) {
  const ctxStr = Object.keys(ctx).length ? ' ' + JSON.stringify(ctx) : '';
  const line = `[${new Date().toISOString()}] [${level}] ${msg}${ctxStr}\n`;
  if (level === 'ERROR') console.error(msg, ctx); else console.log(msg, ctx);
  try {
    fs.appendFileSync(currentLogPath(), line, 'utf8');
  } catch (e) {
    console.error('[Settlement] Log write failed:', e.message);
  }
}
const log = {
  info: (m, c = {}) => writeLog('INFO', m, c),
  error: (m, c = {}) => writeLog('ERROR', m, c),
  debug: (m, c = {}) => { if (DEBUG) writeLog('DEBUG', m, c); },
};

// ==== Utils ====
const nowIso = () => new Date().toISOString();
const lower = (s) => (s || '').toString().trim().toLowerCase();
const norm = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();
const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : 0; };
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function jitter(ms) { return Math.round(ms * (1 + Math.random() * 0.25)); }
function peekBody(data, max = 200) {
  try {
    const s = typeof data === 'string' ? data : JSON.stringify(data);
    return s.slice(0, max);
  } catch { return ''; }
}
function parseRetryAfter(h) {
  if (!h) return null;
  const n = Number(h);
  if (!Number.isNaN(n)) return Math.max(0, Math.round(n * 1000));
  const d = Date.parse(h);
  return Number.isNaN(d) ? null : Math.max(0, d - Date.now());
}
function formatName(name) {
  return (name || '').replace(/\s+/g, '').toLowerCase();
}

// ==== API Setup ====
const httpAgent = new http.Agent({ keepAlive: !RESULTS_DISABLE_KEEPALIVE, family: RESULTS_FORCE_IPV4 ? 4 : undefined });
const httpsAgent = new https.Agent({ keepAlive: !RESULTS_DISABLE_KEEPALIVE, family: RESULTS_FORCE_IPV4 ? 4 : undefined });
const ax = axios.create({
  timeout: API_TIMEOUT_MS,
  httpAgent, httpsAgent,
  validateStatus: () => true,
  headers: {
    'Accept': 'application/json',
    'User-Agent': USER_AGENT
  }
});
let lastApiCallAt = 0;
async function globalRateLimit() {
  const gap = RESULTS_RATE_LIMIT_MS > 0 ? RESULTS_RATE_LIMIT_MS : 0;
  const now = Date.now();
  const wait = Math.max(0, lastApiCallAt + gap - now);
  if (wait) await sleep(wait);
  lastApiCallAt = Date.now();
}
class AsyncQueue {
  constructor(max) { this.max = max; this.running = 0; this.q = []; }
  push(task) { return new Promise((res, rej) => { this.q.push({ task, res, rej }); this._next(); }); }
  _next() {
    if (this.running >= this.max) return;
    const n = this.q.shift(); if (!n) return;
    this.running++;
    n.task().then(n.res, n.rej).finally(() => { this.running--; this._next(); });
  }
}


const apiQueue = new AsyncQueue(MAX_CONCURRENT_API);
function buildPerAttemptConfig(attempt) {
  if (attempt >= 3) {
    return {
      httpAgent: new http.Agent({ keepAlive: false, family: 4 }),
      httpsAgent: new https.Agent({ keepAlive: false, family: 4 }),
      headers: { 'Connection': 'close' }
    };
  }
  return {};
}

// ==== API Layer ====
async function fetchResultForEvent(eventid, eventName, marketId, marketName, selection_name) {
  log.debug('[Settlement] fetchResultForEvent start', { eventid, eventName, marketId, marketName, selection_name });
  const maxAttempts = RESULTS_MAX_FETCH_RETRIES || 6;
  const url = `${RESULTS_API_BASE}/result/get-result`;
  if (selection_name === '' || selection_name === undefined) {
    selection_name = marketName;
  };
  return apiQueue.push(async () => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await globalRateLimit();
        const res = await ax.post(
          url,
          { event_id: eventid, event_name: eventName, market_id: marketId, market_name: selection_name },
          buildPerAttemptConfig(attempt)
        );
        log.debug('[Settlement] fetchResultForEvent response', {
          eventid, attempt, status: res.status, declared: res?.data?.is_declared === true, peek: peekBody(res?.data)
        });
        log.debug('[Settlement] fetchResultForEvent response final_result: ', {
          eventid, attempt, status: res.status, declared: res?.data?.is_declared === true, peek: peekBody(res?.data?.final_result)
        });
        let final_result = res?.data?.final_result;
        if (res.status === 200) {
          const data = typeof res?.data === 'string' ? JSON.parse(res.data) : res.data;
          const declared = data?.is_declared === true;
          return { declared, items: data?.items || [], meta: data || {}, final_result };
        }
        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          const ra = parseRetryAfter(res.headers?.['retry-after']);
          const wait = ra != null ? ra : jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
          log.debug('[Settlement] fetchResultForEvent retry backoff', { eventid, attempt, status: res.status, waitMs: wait });
          await sleep(wait);
          continue;
        }
        log.error('[Settlement] fetchResultForEvent failed', { eventid, attempt, status: res.status });
        return { declared: false, items: [] };
      } catch (e) {
        const wait = jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
        log.error('[Settlement] fetchResultForEvent error', { eventid, attempt, error: e.message, nextWaitMs: wait });
        await sleep(wait);
      }
    }
    log.error('[Settlement] fetchResultForEvent exhausted', { eventid });
    return { declared: false, items: [] };
  });
}

// ==== DB Helpers ====
async function insertScanRow({ user_id, eventid, declared, final_result, counts }) {
  try {
    await SportsEventResultScan.upsert({
      user_id: String(user_id),
      eventid: String(eventid),
      declared: !!declared,
      winner: final_result || null,
      counts: counts || {},
      checked_at: new Date()
    }, { conflictFields: ['user_id', 'eventid'] });
    log.debug('[Settlement] scan upserted', { user_id, eventid, declared });
  } catch (e) {
    log.error('[Settlement] scan insert failed', { user_id, eventid, error: e.message });
  }
}
async function insertSummaryRow({ user_id, eventid, declared, counts, result_meta, sections, final_result }) {
  try {
    await SportsEventResultSummary.create({
      user_id: String(user_id),
      eventid: String(eventid),
      declared: !!declared,
      counts: counts || {},
      result_meta,
      sections,
      recorded_at: new Date()
    });
    log.debug('[Settlement] summary inserted', { user_id, eventid });
  } catch (e) {
    log.error('[Settlement] summary insert failed', { user_id, eventid, error: e.message });
  }
}



async function getMatchExposures(user_id, match_id, market_type) {
  try {
    const exposures = await UserExposure.findAll({
      where: { user_id: String(user_id), match_id: String(match_id), game_type: market_type },
      attributes: ['team_name', 'exposure_amount']
    });
    const map = {};
    for (const r of exposures) {
      map[(r.team_name || '').toString()] = Number(r.exposure_amount || 0);
    }
    return map;
  } catch (e) {
    log.error('[Settlement] getMatchExposures failed', { user_id, match_id, error: e.message });
    return {};
  }
}
async function clearExposuresForMatch(user_id, match_id, market_type) {
  try {
    await UserExposure.destroy({
      where: { user_id: String(user_id), match_id: String(match_id), game_type: market_type }
    });
    log.debug('[Settlement] Exposures cleared', { user_id, match_id, market_type });
  } catch (e) {
    log.error('[Settlement] clearExposuresForMatch failed', { user_id, match_id, error: e.message });
  }
}

/**
 * After settlement, recalculate and persist TotalExposure,
 * then emit a real-time balance update to the user's browser.
 */
async function recalculateAndEmitExposure(user_id) {
  try {
    // Use the SHARED calculation (syncTotalExposure -> calculateUserNetExposure),
    // exactly like placeBet does. The inline query that used to live here both
    // dropped whole market families (it only counted MATCH_ODDS/MO + independent
    // markets) and wrapped the sum in ABS(), so it pushed a POSITIVE number while
    // the header renders exposure as a negative liability. The value shown after a
    // socket push therefore disagreed with the value shown after a refresh.
    const totalExposure = await syncTotalExposure(user_id);

    // Keep user_net_exposure immediately consistent (the bg worker also syncs
    // every ~1s) so a refresh right after settlement shows the same value.
    await UserNetExposure.upsert({ user_id: Number(user_id), net_exposure: totalExposure });
    log.info('[Settlement] TotalExposure updated after settlement', { user_id, totalExposure });

    // Fetch current wallet for the balance emit
    const wallet = await Wallet.findOne({ where: { user_id: String(user_id) }, raw: true });
    if (wallet) {
      await emitBalanceUpdate(user_id, {
        inr_balance: wallet.inr_balance,
        cash: wallet.cash,
        exposure: totalExposure
      });
    }
  } catch (e) {
    log.error('[Settlement] recalculateAndEmitExposure failed', { user_id, error: e.message });
  }
}
async function closeBetsForMatch(user_id, match_id, onlyLine = false, resultStatus, job_id) {
  try {
    const whereClause = {
      user_id: String(user_id),
      match_id: String(match_id),
      job_id: String(job_id),
      status: { [Op.in]: ['open', 'manual'] }
    };
    if (onlyLine) {
      whereClause.bet_type = { [Op.in]: ['yes', 'no'] };
    }
    await SportsBet.update(
      { status: 'closed', result_status: resultStatus, updated_at: new Date() },
      { where: whereClause }
    );
    log.debug('[Settlement] Bets closed', { user_id, match_id, onlyLine, resultStatus });
  } catch (e) {
    log.error('[Settlement] closeBetsForMatch failed', { user_id, match_id, error: e.message });
  }
}


function normalize(str) {
  return (str || '').toString().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();
}

function resolveMobmWinner({ result, team_one, team_two, final_result }) {
  console.log("inside resolveMobmWinner", result, team_one, team_two, final_result);
  const items = result?.items || [];
  if (!items.length && !final_result) {
    log.debug('[Settlement] resolveMobmWinner: no result items or final_result');
    return { winnerName: '', reason: 'no result items or final_result' };
  }

  // Use final_result parameter directly if provided, otherwise fall back to item
  const item = items[0];
  const resultStr = final_result || item?.final_result || '';
  const finalResult = normalize(resultStr);

  // Normalize team names
  const teamOneNorm = normalize(team_one);
  const teamTwoNorm = normalize(team_two);

  // 1. Check for SUSPENDED or CANCELLED
  if (['suspended', 'cancelled'].includes(finalResult)) {
    log.debug('[Settlement] resolveMobmWinner: result is SUSPENDED or CANCELLED', { finalResult, resultStr });
    return { winnerName: 'SUSPENDED', reason: `final_result is ${finalResult.toUpperCase()}` };
  }

  // 2. Check for draw/tie/abandoned/no result
  if (['draw', 'tie', 'abandoned', 'no result'].some(term => finalResult.includes(term))) {
    log.debug('[Settlement] resolveMobmWinner: draw or no result', { finalResult, team_one, team_two });
    return { winnerName: 'The Draw', reason: 'final_result indicates draw/tie/abandoned/no result' };
  }

  // 3. String matching for winner
  if (finalResult) {
    // Exact match
    if (finalResult === teamOneNorm) {
      return { winnerName: team_one, reason: 'exact match to team_one' };
    }
    if (finalResult === teamTwoNorm) {
      return { winnerName: team_two, reason: 'exact match to team_two' };
    }

    // Starts with (e.g., "Australia won by...")
    if (finalResult.startsWith(teamOneNorm)) {
      return { winnerName: team_one, reason: 'startsWith team_one' };
    }
    if (finalResult.startsWith(teamTwoNorm)) {
      return { winnerName: team_two, reason: 'startsWith team_two' };
    }

    // Contains (e.g., "defeated Australia")
    if (finalResult.includes(teamOneNorm)) {
      return { winnerName: team_one, reason: 'contains team_one' };
    }
    if (finalResult.includes(teamTwoNorm)) {
      return { winnerName: team_two, reason: 'contains team_two' };
    }

    // First 3 characters (legacy fallback)
    if (finalResult.substring(0, 3) === teamOneNorm.substring(0, 3)) {
      return { winnerName: team_one, reason: 'first 3 letters match team_one' };
    }
    if (finalResult.substring(0, 3) === teamTwoNorm.substring(0, 3)) {
      return { winnerName: team_two, reason: 'first 3 letters match team_two' };
    }

    log.debug('[Settlement] resolveMobmWinner: no string match', { finalResult, team_one, team_two, resultStr });
  }

  // 4. WinnerId fallback
  // const winnerId = item?.payload?.marketResultSummary?.winnerId ?? item?.winnerId;
  // if (winnerId != null && Number.isFinite(Number(winnerId))) {
  //   if (Number(winnerId) === 1) return { winnerName: team_one, reason: 'winnerId=1 maps to team_one' };
  //   if (Number(winnerId) === 2) return { winnerName: team_two, reason: 'winnerId=2 maps to team_two' };
  //   if (Number(winnerId) === 0) return { winnerName: 'The Draw', reason: 'winnerId=0 maps to draw' };
  // }

  // 5. Fallback to team_one
  log.debug('[Settlement] resolveMobmWinner: ambiguous result', { finalResult, team_one, team_two });
  return { winnerName: "SUSPENDED" || '', reason: 'ambiguous; fallback SUSPENDED' };
}




function resolveFancyWinner({ result, fancy_name, final_result, selection_name, team_one, team_two, bet_type, market_type, odds }) {

  console.log("market_type", market_type);
  console.log("final_result", final_result);
  console.log("odds", odds);
  console.log("selection_name", selection_name);
  console.log("team_one", team_one);
  console.log("team_two", team_two);
  console.log("bet_type", bet_type);

  if (['suspended', 'cancelled', 'your_request_is_invalid'].includes(lower(final_result))) {
    log.debug('[Settlement] resolveFancyWinner: result is SUSPENDED or CANCELLED or request_is_invalid', { final_result });
    return { type: 'suspended', reason: `final_result is ${final_result.toUpperCase()}` };
  }
  let winnerName = '';
  const lowerMarket = lower(fancy_name);
  team_one = lower(team_one);
  team_two = lower(team_two);
  const finalwinningdata = normalize(final_result || '');

  // cricket 
  if (market_type === 'COMPLETED_MATCH') {
    console.log("hello");

  }

  else if (market_type === 'TIED_MATCH') {
    if (final_result === '0' && selection_name === 'No') {
      winnerName = 'won';
    }
    else if (final_result === '1' && selection_name === 'Yes') {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };


  }
  else if (market_type === 'Tied Match') {
    if (final_result === '0' && selection_name === 'No' || selection_name === "NO") {
      winnerName = 'won';
    }
    else if (final_result === '1' && selection_name === 'Yes' || selection_name === "YES") {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };


  }

  else if (market_type === 'COMPLETED_MATCH') {

  }
  else if (market_type === '2nd Period Winner' || market_type === '1st Period Winner' || market_type === '3rd Period Winner') {
    if (bet_type === 'yes' && final_result === selection_name) {
      winnerName = 'won';
    }
    else if (bet_type === 'no' && final_result !== selection_name) {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };


  }

  else if (
    market_type === '1st Innings 6 Overs Line' || market_type === '2nd Innings 6 Overs Line' || market_type === '3rd Innings 6 Overs Line'
    || market_type === '1st Innings 10 Overs Line' || market_type === '2nd Innings 10 Overs Line' || market_type === '3rd Innings 10 Overs Line'
    || market_type === '1st Innings 15 Overs Line' || market_type === '2nd Innings 15 Overs Line' || market_type === '3rd Innings 15 Overs Line'
    || market_type === '1st Innings 20 Overs Line' || market_type === '2nd Innings 20 Overs Line' || market_type === '3rd Innings 20 Overs Line'
    || market_type === '1st Innings 25 Overs Line' || market_type === '2nd Innings 25 Overs Line' || market_type === '3rd Innings 25 Overs Line'
    || market_type === '1st Innings 30 Overs Line' || market_type === '2nd Innings 30 Overs Line' || market_type === '3rd Innings 30 Overs Line'
    || market_type === '1st Innings 35 Overs Line' || market_type === '2nd Innings 35 Overs Line' || market_type === '3rd Innings 35 Overs Line'
    || market_type === '1st Innings 40 Overs Line' || market_type === '2nd Innings 40 Overs Line' || market_type === '3rd Innings 40 Overs Line'
    || market_type === '1st Innings 45 Overs Line' || market_type === '2nd Innings 45 Overs Line' || market_type === '3rd Innings 45 Overs Line'
    || market_type === '1st Innings 50 Overs Line' || market_type === '2nd Innings 50 Overs Line' || market_type === '3rd Innings 50 Overs Line'
    || market_type === 'Over By Over' || market_type === 'Normal' || market_type === 'Ball By Ball' || market_type === 'khado' || market_type === 'meters'
  ) {
    if (bet_type === 'yes') {
      if (final_result >= odds) {
        winnerName = 'won';
      }
      else {
        winnerName = 'loss';
      }
      return { type: 'string', winnerName, reason: 'determined from final_result string for 1st innings 6 overs line' };
    }
    else if (bet_type === 'no') {
      if (final_result < odds) {
        winnerName = 'won';
      }
      else {
        winnerName = 'loss';
      }
      return { type: 'string', winnerName, reason: 'determined from final_result string for 1st innings 6 overs line' };
    }
  }
  //// football need to go till 55
  else if (market_type === 'OVER_UNDER_35' || market_type === 'OVER_UNDER_25' || market_type === 'OVER_UNDER_15' || market_type === 'OVER_UNDER_05') {

    const isUnderSelection = selection_name.includes('Under');
    const isOverSelection = selection_name.includes('Over');

    const isUnderResult = final_result === 'Under';
    const isOverResult = final_result === 'Over';

    let isWin = false;

    if (bet_type === 'yes') {
      isWin = (isUnderSelection && isUnderResult) ||
        (isOverSelection && isOverResult);
    } else if (bet_type === 'no') {
      isWin = (isUnderSelection && isOverResult) ||
        (isOverSelection && isUnderResult);
    }

    winnerName = isWin ? 'won' : 'loss';

    console.log("winnerName", winnerName);
    console.log("market_type", market_type);
    console.log("final_result", final_result);
    console.log("selection_name", selection_name);
    console.log("bet_type", bet_type);

    return {
      type: 'string',
      winnerName,
      reason: 'derived using over/under + yes/no logic'
    };
  }
  else if (market_type === 'Next Goal 1.0' || market_type === 'Next Goal 2.0' || market_type === 'Next Goal 3.0' || market_type === 'Next Goal 4.0' || market_type === 'Next Goal 5.0' || market_type === 'Next Goal 6.0' || market_type === 'Next Goal 7.0' || market_type === 'Next Goal 8.0' || market_type === 'Next Goal 9.0' || market_type === 'Next Goal 10.0') {
    if (final_result === selection_name && bet_type === 'yes') {
      winnerName = 'won';
    }
    else if (final_result !== selection_name && bet_type === 'no') {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };
  }
  else if (market_type === '1st Innings 50 Overs Line' || market_type === '2nd Innings 50 Overs Line') {
    if (bet_type === 'yes') {
      if (final_result >= odds) {
        winnerName = 'won';
      }
      else {
        winnerName = 'loss';
      }
      return { type: 'string', winnerName, reason: 'determined from final_result string for innings 50 overs line' };
    }
    else if (bet_type === 'no') {
      if (final_result < odds) {
        winnerName = 'won';
      }
      else {
        winnerName = 'loss';
      }
      return { type: 'string', winnerName, reason: 'determined from final_result string for  innings 50 overs line' };
    }

  }
  else if (market_type === 'Game To Deuce 1/1' || market_type === 'Game To Deuce 1/2' || market_type === 'Game To Deuce 1/3' || market_type === 'Game To Deuce 1/4' || market_type === 'Game To Deuce 2/1' || market_type === 'Game To Deuce 2/2' || market_type === 'Game To Deuce 2/3' || market_type === 'Game To Deuce 2/4' || market_type === 'Game To Deuce 3/1' || market_type === 'Game To Deuce 3/2' || market_type === 'Game To Deuce 3/3' || market_type === 'Game To Deuce 3/4') {
    if (final_result === '0' && selection_name === 'No' || selection_name === "NO") {
      winnerName = 'won';
    }
    else if (final_result === '1' && selection_name === 'Yes' || selection_name === "YES") {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for game deuce' };
  }
  else if (market_type === 'HALF_TIME' || market_type === 'Match Time Result 70:00' || market_type === 'Match Time Result 10:00' || market_type === 'Match Time Result 20:00' || market_type === 'Match Time Result 30:00' || market_type === 'Match Time Result 40:00' || market_type === 'Match Time Result 50:00' || market_type === 'Match Time Result 60:00' || market_type === 'Match Time Result 80:00' || market_type === 'Match Time Result 90:00') {
    if (final_result === selection_name && bet_type === 'yes') {
      winnerName = 'won';
    }
    else if (final_result !== selection_name && bet_type === 'no') {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for half time' };
  }
  else if (market_type === 'Both Teams To Score') {
    if (final_result === 0 && selection_name === 'No' || selection_name === "NO") {
      winnerName = 'won';
    }
    else if (final_result > 0 && selection_name === 'Yes' || selection_name === "YES") {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for both teams to score' };
  }

  /// tenis
  else if (market_type === 'Game Winner 1/2' || market_type === 'Game Winner 1/3' || market_type === 'Game Winner 1/4' || market_type === 'Game Winner 2/2' || market_type === 'Game Winner 2/3' || market_type === 'Game Winner 2/4' || market_type === 'Game Winner 3/2' || market_type === 'Game Winner 3/3' || market_type === 'Game Winner 3/4' || market_type === 'Game Winner 2/7') {
    if (final_result === selection_name && bet_type === 'yes') {
      winnerName = 'won';
    }
    else if (final_result !== selection_name && bet_type === 'no') {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };

  }
  else if (market_type === '1st Set Winner Home/Away' || market_type === '2nd Set Winner Home/Away' || market_type === '3rd Set Winner Home/Away' || market_type === '1st Set Race To 4.0' || market_type === '2nd Set Race To 4.0' || market_type === '3rd Set Race To 4.0') {
    if (final_result === selection_name && bet_type === 'yes') {
      winnerName = 'won';
    }
    else if (final_result !== selection_name && bet_type === 'no') {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };

  }
  else if (market_type === 'Correct Score' || market_type === "Correct Score 1st Set" || market_type === 'Correct Score 2nd Set' || market_type === 'Coreect Score 3rd Set') {
    if (bet_type === 'yes' && final_result === 1) {
      winnerName = 'won';
    }
    else if (bet_type === 'no' && final_result === 0) {
      winnerName = 'won';
    }

    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };
  }
  else if (market_type === 'Point Winner 1/3/1' || market_type === 'Point Winner 1/2/1' || market_type === 'Point Winner 1/1/1' || market_type === 'Point Winner 2/3/1' || market_type === 'Point Winner 2/2/1' || market_type === 'Point Winner 2/1/1' || market_type === 'Point Winner 3/3/1' || market_type === 'Point Winner 3/2/1' || market_type === 'Point Winner 3/1/1' || market_type === 'Point Winner 1/2/1') {
    if (final_result === selection_name && bet_type === 'yes') {
      winnerName = 'won';
    }
    else if (final_result !== selection_name && bet_type === 'no') {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };
  }
  else if (market_type === 'Match Result/Both Teams to score') {
    if (final_result === 0 && selection_name === 'No' || selection_name === "NO") {
      winnerName = 'won';
    }
    else if (final_result > 0 && selection_name === 'Yes' || selection_name === "YES") {
      winnerName = 'won';
    }
    else {
      winnerName = 'loss';
    }
    return { type: 'string', winnerName, reason: 'determined from final_result string for tied match' };
  }

}



// Refund function to handle SUSPENDED bets

async function initiateRefund({ job_id, user_id, eventid, match_id, bet, market_type }) {
  const { id: bet_id, stake_amount } = bet;
  const stake = num(stake_amount); // Ensure stake is a valid number
  const desc = `Refund for SUSPENDED MO/BM bet; bet_id=${bet_id}; stake=${stake}`;
  const meta = { api: { type: 'result', eventid, match_id, status: 'suspended' }, bet_id };

  try {
    // Find the user's wallet and update inr_balance
    const wallet = await Wallet.findOne({ where: { user_id } });
    if (!wallet) {
      log.error('[Settlement] No wallet found for user', { bet_id, user_id });
      throw new Error(`No wallet found for user_id=${user_id}`);
    }

    // Refund stake back to cash
    const newBalance = (wallet.cash || 0) + stake;
    await wallet.update({ cash: newBalance });

    // Log the credit to CreditsLedger
    await CreditsLedger.create({
      user_id: String(user_id),
      currency: 'INR',
      amount: stake,
      reason: 'refund',
      description: desc,
      eventid: String(eventid),
      job_id: String(job_id || ''),
      match_id: match_id ? String(match_id) : null,
      meta: meta || {},
      market_type,
      category: 'SPORTS'
    });

    log.info(`[Settlement] Refund credited`, { bet_id, user_id, credit: stake, balance: newBalance });

    // Update SportsBet table to mark as closed with refund status
    await SportsBet.update(
      { status: 'closed', result_status: 'refund', updated_at: new Date() },
      { where: { id: bet_id, job_id: String(job_id), status: { [Op.in]: ['open', 'manual'] } } }
    );
    log.debug('[Settlement] Bet marked as refunded', { bet_id, user_id });

    // Write report for the refund
    await writeReport({
      job_id,
      bet_id,
      user_id,
      eventid,
      match_id,
      game_type: String(bet.game_type || 'MO').toUpperCase(),
      market_type,
      selection_name: bet.selection_name,
      resolved_winner: null,
      resolved_team: null,
      credit_amount: stake,
      exposures_map: {},
      api_snapshot: { status: 'refund due to SUSPENDED' }, bet_id, user_id, eventid, match_id,
      decision_path: ['refund due to SUSPENDED status', desc]
    });
  } catch (e) {
    log.error('[Settlement] Refund failed', { bet_id, user_id, error: e.message });
    await writeReport({
      job_id,
      bet_id,
      user_id,
      eventid,
      match_id,
      game_type: String(bet.game_type || 'MO').toUpperCase(),
      market_type,
      selection_name: bet.selection_name,
      resolved_winner: null,
      resolved_team: null,
      credit_amount: stake,
      exposures_map: {},
      api_snapshot: { status: 'refund failed SUSPENDED', bet_id, user_id, eventid, match_id },
      decision_path: ['[Settlement] Refund failed', { bet_id, user_id, error: e.message }]
    });
    throw e; // Re-throw to ensure the error is logged and job is marked as failed if needed
  }
}






// ==== Commission & Credit Logic ====
const PLATFORM_COMMISSION_PERCENT = 2; // 2% platform commission on winning amount default value if percentage not set

// function calculateCommission(winningAmount, percentage) {
//   const commPercent = percentage !== undefined && percentage !== null ? Number(percentage) : 2;
//   const commission = winningAmount * (commPercent / 100);
//   const finalAmount = winningAmount - commission;
//   return {
//     winningAmount: Math.floor(winningAmount * 100) / 100,
//     commission: Math.floor(commission * 100) / 100,
//     finalAmount: Math.floor(finalAmount * 100) / 100
//   };
// }

function normalizeOdds(odds) {
  let newodds;
  if (odds > 100) {
    newodds = (odds / 100) + 1;
  } else if (odds < 100) {
    newodds = 1 + (odds / 100);
  } else {
    newodds = 2.0;
  }
  return Math.floor(newodds * 100) / 100;
}
function getOdds(b) {
  const raw = b.odds ?? b.price ?? b.rate ?? b.odd ?? 0;
  const o = Number(raw);
  const gameType = String(b.game_type || '').toUpperCase();
  if (gameType === 'BM') return normalizeOdds(o);
  return Number.isFinite(o) ? o : 0;
}
function getStake(b) { return num(b.stake_amount ?? b.stake ?? b.amount ?? b.stakeValue ?? b.size); }
function isBack(b) { return lower(b.bet_type) === 'back'; }
function isLay(b) { return lower(b.bet_type) === 'lay'; }

function moBmBetWinCredit(bet, winnerName) {
  const sel = bet.selection_name || '';
  const selIsWinner = norm(sel) === norm(winnerName);
  const stake = getStake(bet);
  const odds = getOdds(bet);
  if (isBack(bet)) return selIsWinner ? Math.max(0, (odds - 1) * stake) : 0;
  if (isLay(bet)) return selIsWinner ? 0 : Math.max(0, (odds - 1) * stake);
  return 0;
}
function normalizeExposure(value) {
  return Math.abs(value);
}

// ==== Report Writer ====
async function writeReport(r) {
  try {
    const [report, created] = await SportsSettlementReport.findOrCreate({
      where: { bet_id: r.bet_id },
      defaults: {
        job_id: r.job_id,
        bet_id: r.bet_id,
        user_id: r.user_id,
        eventid: r.eventid,
        match_id: r.match_id,
        game_type: r.game_type,
        market_type: r.market_type,
        fancy_name: r.fancy_name || null,
        selection_name: r.selection_name || null,
        user_selection_yn: r.user_selection_yn || null,
        resolved_winner: r.resolved_winner || null,
        resolved_team: r.resolved_team || null,
        actual_numeric: r.actual_numeric != null ? r.actual_numeric : null,
        rule_op: r.rule_op || null,
        rule_threshold: r.rule_threshold != null ? r.rule_threshold : null,
        credit_amount: Number(r.credit_amount || 0),
        exposures_map: r.exposures_map || {},
        api_snapshot: r.api_snapshot || {},
        decision_path: r.decision_path || [],
        created_at: new Date()
      }
    });
    if (!created) {
      log.debug('[Settlement] Report already exists, skipping', { bet_id: r.bet_id });
    }
  } catch (e) {
    log.error('[Settlement] writeReport failed', { bet_id: r.bet_id, error: e.message });
  }
}







async function processMobmGroup({ job_id, user_id, eventid, match_id, bets, eventName, marketId, marketName, market_type, game_type, team_one, team_two }) {
  log.info('[Settlement] Processing MO/BM group', { user_id, eventid, match_id, bets: bets.length });
  const result = await fetchResultForEvent(eventid, eventName, marketId, marketName);

  await insertScanRow({ user_id, eventid, declared: result.declared, final_result: result.final_result, counts: { total: bets.length } });
  await insertSummaryRow({
    user_id, eventid, declared: result.declared, counts: { total: bets.length }, final_result: result.final_result,
    result_meta: result.meta, sections: { bet_ids: bets.map(b => b.id) }
  });

  if (!result.declared) {
    log.info('[Settlement] MO/BM group not declared, requeue', { user_id, match_id, eventid });
    return { settled: false, requeue: true };
  }

  // // Extract team names from eventName
  // let team_one = '', team_two = '';
  // if (!eventName) {
  //   log.info('[Settlement] Event name is empty', { user_id, eventid, match_id });
  // }

  // // Split event name by " v " or " vs "
  // [team_one, team_two] = eventName.split(/\s+v(?:s)?\s+/i);
  // team_one = team_one?.trim();
  // team_two = team_two?.trim();

  const any = bets[0] || {};
  const { winnerName, reason } = resolveMobmWinner({ result, team_one, team_two, final_result: result.final_result });

  log.info(`[Settlement] MO/BM WINNER NAME or STATUS="${winnerName}" (${reason})`, { match_id, eventid, bets: bets.length });

  console.log("step donw 22");

  // Check if winner is SUSPENDED
  if (winnerName.toUpperCase() === 'SUSPENDED') {
    log.info('[Settlement] MO/BM group SUSPENDED, initiating refunds', { user_id, match_id, eventid });
    // const market_type = (String(any.game_type || 'MO').toUpperCase() === 'BM' ? 'bookmaker' : 'odds');

    for (const bet of bets) {
      await initiateRefund({ job_id, user_id, eventid, match_id, bet, game_type });
    }

    // Clear exposures and mark job as done
    await clearExposuresForMatch(user_id, match_id, market_type);
    return { settled: true, requeue: false };
  }

  let totalCredit = 0;
  console.log("step donw exposure");
  console.log("market_type", market_type);
  const exposuresMap = await getMatchExposures(user_id, match_id, market_type);
  console.log("exposuresMap", exposuresMap);

  // Fetch User to get percentage
  const user = await User.findByPk(user_id);
  const userPercentage = user ? user.percentage : 2;

  for (const bet of bets) {

    let credit = moBmBetWinCredit(bet, winnerName);
    const stake = getStake(bet);
    const selIsWinner = norm(bet.selection_name) === norm(winnerName);
    const oldExposures = await getMatchExposures(user_id, match_id, market_type);
    const team1 = oldExposures[bet.team_one] || 0;
    const team2 = oldExposures[bet.team_two] || 0;
    const draw = oldExposures['The Draw'] || 0;
    const negExposures = Object.values(oldExposures).filter(x => x < 0);
    const mostNeg = negExposures.length > 0 ? Math.min(...negExposures) : 0;

    let finalcredit = 0;
    if (bet.counts == 2) {
      if (bet.team_one === winnerName) {
        if (team1 > 0 && team2 > 0) {
          finalcredit = team1;
          console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE <0:', finalcredit);
        }
        else if (team1 < 0) {
          finalcredit = 0;
          console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE <0:', finalcredit);
        }
        else {
          finalcredit = normalizeExposure(team1) + normalizeExposure(team2);
          console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE >0:', finalcredit);
        }

      }
      else if (bet.team_two === winnerName) {

        if (team1 > 0 && team2 > 0) {
          finalcredit = team2;
          console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE <0:', finalcredit);
        }
        else if (team2 < 0) {
          finalcredit = 0;
          console.log('FINAL CREDIT IF TEAM 2 WIN AND EXPOSURE <0:', finalcredit);
        }
        else {
          finalcredit = normalizeExposure(team1) + normalizeExposure(team2);
          console.log('FINAL CREDIT IF TEAM 2 WIN AND EXPOSURE >0:', finalcredit);
        }

      }
      else if (winnerName === 'refund') {
        finalcredit = normalizeExposure(mostNeg);
        console.log('FINAL CREDIT IF REFUND :', finalcredit);
      }
    }
    else {
      if (bet.team_one === winnerName) {
        if (team1 > 0 && team2 > 0 && draw > 0) {
          finalcredit = team1;

        }
        else if (team1 < 0) {
          finalcredit = normalizeExposure(mostNeg) - normalizeExposure(team1);
        }
        else {
          finalcredit = normalizeExposure(mostNeg) + normalizeExposure(team1);
        }
      }
      else if (bet.team_two === winnerName) {

        if (team1 > 0 && team2 > 0 && draw > 0) {
          finalcredit = team2;

        }
        else if (team2 < 0) {
          finalcredit = normalizeExposure(mostNeg) - normalizeExposure(team2);
        }
        else {
          finalcredit = normalizeExposure(mostNeg) + normalizeExposure(team2);
        }
      }
      else if (winnerName === 'refund') {
        finalcredit = normalizeExposure(mostNeg);
        console.log('FINAL CREDIT IF REFUND :', finalcredit);
      }
      else {
        if (team1 > 0 && team2 > 0 && draw > 0) {
          finalcredit = draw;

        }
        else if (draw < 0) {
          finalcredit = normalizeExposure(mostNeg) - normalizeExposure(draw);
        }
        else {
          finalcredit = normalizeExposure(mostNeg) + normalizeExposure(draw);
        }
      }
    }

    // if (selIsWinner && isBack(bet)) {
    //   credit += stake;
    // }
    totalCredit += credit;

    // Get odds information
    const rawOdds = getOdds(bet);
    const normalizedOddsValue = normalizeOdds(rawOdds);

    const desc = `MO/BM per-bet; winner="${winnerName}"; bet_type=${bet.bet_type}; selection="${bet.selection_name}"; odds=${rawOdds}; normalized_odds=${normalizedOddsValue}; stake=${stake}; credit=${finalcredit}`;
    const meta = { api: { type: 'result', eventid, marketId, marketName, status: result.declared }, winnerName, reason, bet_id: bet.id, odds: rawOdds, normalized_odds: normalizedOddsValue };

    if (bet.fixed == 0) {
      let totalbets = await SportsBet.count({ where: { eventid, match_id, game_type: 'MO', user_id } });
      let drawex = bet.counts == 3 ? draw : 0;
      await MarketWin.create({
        totalbets, matchid: match_id, eventid, team1ex: team1, team2ex: team2, drawex,
        winteam: winnerName, matchname: `${bet.team_one} vs ${bet.team_two}`, payout: finalcredit, user_id, created_at: new Date()
      });
    }

    if (bet.fixed == 1) {
      finalcredit = 0;
    }

    // Calculate cost (liability/stake) for stats
    let cost = 0;
    if (isBack(bet) || bet.bet_type === "Yes" || bet.bet_type === "yes") {
      cost = stake;
    } else if (isLay(bet) || bet.bet_type === "No" || bet.bet_type === "no") {
      cost = (rawOdds - 1) * stake;
    }
    cost = cost > 0 ? cost : 0;

    if (finalcredit !== 0 || LEDGER_ZERO_ROWS) {
      // Apply dynamic platform commission on winning amount
      const creditAmount = finalcredit
      const amt = num(creditAmount);
      // if (amt === 0 && !LEDGER_ZERO_ROWS) return { credited: 0 };
      try {
        const creditRecord = await Wallet.findOne({ where: { user_id: String(user_id) } });
        const user = await User.findByPk(String(user_id));
        let newBal = null;
        if (creditRecord) {
          newBal = (creditRecord.credit || 0) + amt;
          await creditRecord.update({ credit: newBal });
          console.log('newBal', newBal);
        } else {
          log.error('[Settlement] No credit record for user', { user_id });
        }
      } catch (err) {
        log.error('[Settlement] Error updating credit record', { user_id, error: err.message });
      }

    }
    let profit = 0;
    let loss = 0;
    let netamount = 0;

    if (totalCredit > 0) {
      profit = totalCredit;
      netamount = totalCredit;
    } else {
      if (isBack(bet) || bet.bet_type === "Yes" || bet.bet_type === "yes") {
        loss = -stake;
        netamount = -stake;
      } else if (isLay(bet) || bet.bet_type === "No" || bet.bet_type === "no") {
        loss = - bet.liability;
        netamount = - bet.liability;
      }
    }
    console.log("netamount", netamount);
    console.log("profit", profit);
    console.log("loss", loss);

    // await Credit.create({
    //   user_id, match_id, eventid, game_type, market_type, selection_name, bet_type, stake, credit, profit, loss, netamount
    // });
    await User.increment(
      {
        net_win: profit,     // can be +10, 0, +40
        net_loss: loss,      // can be -30, 0, -40
        profit: netamount    // can be -10, +40, +30, -100
      },
      {
        where: { user_id }
      }
    );
    const Usersdata = await User.findOne({ where: { user_id } });
    let closing = Usersdata.profit;

    await CreditsLedger.create({
      user_id,
      currency: "INR",

      amount: totalCredit,        // REQUIRED (raw +win / -loss)
      reason: "test",        // REQUIRED (ex: BET_WIN, BET_LOSS)

      description: desc || null,

      eventid: eventid || null,
      match_id: match_id || null,
      job_id: job_id || null,

      market_type: market_type || null,
      sport_id: bet.sport_id || null,

      meta: meta || null,

      commission: null,
      netamount: netamount || null,

      profit: profit || 0,
      loss: loss || null,
      bet_id: bet.id || null,
      closing: closing || null,
      category: 'SPORTS'
    });





    await writeReport({
      job_id, bet_id: bet.id, user_id, eventid, match_id,
      game_type: String(bet.game_type || 'MO').toUpperCase(),
      market_type, selection_name: bet.selection_name,
      resolved_winner: winnerName || null, resolved_team: winnerName || null,
      credit_amount: finalcredit, exposures_map: exposuresMap,
      api_snapshot: result.meta, decision_path: [reason, desc]
    });
  }

  const resultStatus = totalCredit > 0 ? 'won' : 'loss';
  await SportsBet.update({ fixed: 1, updated_at: new Date() }, { where: { match_id, user_id, game_type, market_type } });
  await closeBetsForMatch(user_id, match_id, false, resultStatus, job_id);
  await clearExposuresForMatch(user_id, match_id, market_type);
  return { settled: true, requeue: false };
}

async function processnonfancy({ job_id, user_id, eventid, match_id, bet, eventName, marketId, marketName, market_type, game_type, team_one, team_two, result }) {
  console.log("result", result);
  console.log("entered nonfancysettlement");




  const { winnerName, reason } = resolveMobmWinner({ result, team_one, team_two, final_result: result.final_result });

  log.info(`[Settlement] FAN/non-FAN WINNER NAME or STATUS="${winnerName}" (${reason})`, { match_id, eventid, marketId, marketName });

  console.log("step donw fan -non fan 22");

  // Check if winner is SUSPENDED
  if (winnerName.toUpperCase() === 'SUSPENDED') {
    log.info('[Settlement] MO/BM group SUSPENDED, initiating refunds', { user_id, match_id, eventid });
    // const market_type = (String(any.game_type || 'MO').toUpperCase() === 'BM' ? 'bookmaker' : 'odds');


    await initiateRefund({ job_id, user_id, eventid, match_id, bet, game_type });


    // Clear exposures and mark job as done
    await clearExposuresForMatch(user_id, match_id, market_type);
    return { settled: true, requeue: false };
  }

  let totalCredit = 0;
  console.log("step donw exposure");
  console.log("market_type", market_type);
  const exposuresMap = await getMatchExposures(user_id, match_id, market_type);
  console.log("exposuresMap", exposuresMap);

  // Fetch User to get percentage
  const user = await User.findByPk(user_id);
  const userPercentage = user ? user.percentage : 2;



  let credit = moBmBetWinCredit(bet, winnerName);
  const stake = getStake(bet);
  const selIsWinner = norm(bet.selection_name) === norm(winnerName);
  const oldExposures = await getMatchExposures(user_id, match_id, market_type);
  const team1 = oldExposures[bet.team_one] || 0;
  const team2 = oldExposures[bet.team_two] || 0;
  const draw = oldExposures['The Draw'] || 0;
  const negExposures = Object.values(oldExposures).filter(x => x < 0);
  const mostNeg = negExposures.length > 0 ? Math.min(...negExposures) : 0;

  let finalcredit = 0;
  if (bet.counts == 2) {
    if (bet.team_one === winnerName) {
      if (team1 > 0 && team2 > 0) {
        finalcredit = team1;
        console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE <0:', finalcredit);
      }
      else if (team1 < 0) {
        finalcredit = 0;
        console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE <0:', finalcredit);
      }
      else {
        finalcredit = normalizeExposure(team1) + normalizeExposure(team2);
        console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE >0:', finalcredit);
      }

    }
    else if (bet.team_two === winnerName) {

      if (team1 > 0 && team2 > 0) {
        finalcredit = team2;
        console.log('FINAL CREDIT IF TEAM 1 WIN AND EXPOSURE <0:', finalcredit);
      }
      else if (team2 < 0) {
        finalcredit = 0;
        console.log('FINAL CREDIT IF TEAM 2 WIN AND EXPOSURE <0:', finalcredit);
      }
      else {
        finalcredit = normalizeExposure(team1) + normalizeExposure(team2);
        console.log('FINAL CREDIT IF TEAM 2 WIN AND EXPOSURE >0:', finalcredit);
      }

    }
    else if (winnerName === 'refund') {
      finalcredit = normalizeExposure(mostNeg);
      console.log('FINAL CREDIT IF REFUND :', finalcredit);
    }
  }
  else {
    if (bet.team_one === winnerName) {
      if (team1 > 0 && team2 > 0 && draw > 0) {
        finalcredit = team1;

      }
      else if (team1 < 0) {
        finalcredit = normalizeExposure(mostNeg) - normalizeExposure(team1);
      }
      else {
        finalcredit = normalizeExposure(mostNeg) + normalizeExposure(team1);
      }
    }
    else if (bet.team_two === winnerName) {

      if (team1 > 0 && team2 > 0 && draw > 0) {
        finalcredit = team2;

      }
      else if (team2 < 0) {
        finalcredit = normalizeExposure(mostNeg) - normalizeExposure(team2);
      }
      else {
        finalcredit = normalizeExposure(mostNeg) + normalizeExposure(team2);
      }
    }
    else if (winnerName === 'refund') {
      finalcredit = normalizeExposure(mostNeg);
      console.log('FINAL CREDIT IF REFUND :', finalcredit);
    }
    else {
      if (team1 > 0 && team2 > 0 && draw > 0) {
        finalcredit = draw;

      }
      else if (draw < 0) {
        finalcredit = normalizeExposure(mostNeg) - normalizeExposure(draw);
      }
      else {
        finalcredit = normalizeExposure(mostNeg) + normalizeExposure(draw);
      }
    }
  }

  // if (selIsWinner && isBack(bet)) {
  //   credit += stake;
  // }
  totalCredit += credit;

  // Get odds information
  const rawOdds = getOdds(bet);
  const normalizedOddsValue = normalizeOdds(rawOdds);

  const desc = `FAN per-bet; winner="${winnerName}"; bet_type=${bet.bet_type}; selection="${bet.selection_name}"; odds=${rawOdds}; normalized_odds=${normalizedOddsValue}; stake=${stake}; credit=${finalcredit}`;
  const meta = { api: { type: 'result', eventid, marketId, marketName, status: result.declared }, winnerName, reason, bet_id: bet.id, odds: rawOdds, normalized_odds: normalizedOddsValue };

  if (bet.fixed == 0) {
    let totalbets = await SportsBet.count({ where: { eventid, match_id, game_type: 'MO', user_id } });
    let drawex = bet.counts == 3 ? draw : 0;
    await MarketWin.create({
      totalbets, matchid: match_id, eventid, team1ex: team1, team2ex: team2, drawex,
      winteam: winnerName, matchname: `${bet.team_one} vs ${bet.team_two}`, payout: finalcredit, user_id, created_at: new Date()
    });
  }

  if (bet.fixed == 1) {
    finalcredit = 0;
  }

  // Calculate cost (liability/stake) for stats
  let cost = 0;
  if (isBack(bet)) {
    cost = stake;
  } else if (isLay(bet)) {
    cost = (rawOdds - 1) * stake;
  }
  cost = cost > 0 ? cost : 0;

  if (finalcredit !== 0 || LEDGER_ZERO_ROWS) {
    // Apply dynamic platform commission on winning amount
    const creditAmount = finalcredit
    const amt = num(creditAmount);
    // if (amt === 0 && !LEDGER_ZERO_ROWS) return { credited: 0 };
    try {
      const creditRecord = await Wallet.findOne({ where: { user_id: String(user_id) } });
      const user = await User.findByPk(String(user_id));
      let newBal = null;
      if (creditRecord) {
        newBal = (creditRecord.credit || 0) + amt;
        await creditRecord.update({ credit: newBal });
        console.log('newBal', newBal);
      } else {
        log.error('[Settlement] No credit record for user', { user_id });
      }
    } catch (err) {
      log.error('[Settlement] Error updating credit record', { user_id, error: err.message });
    }

  }
  let profit = 0;
  let loss = 0;
  let netamount = 0;

  if (totalCredit > 0) {
    profit = totalCredit;
    netamount = totalCredit;
  } else {
    if (isBack(bet) || bet.bet_type === "Yes" || bet.bet_type === "yes") {
      loss = -stake;
      netamount = -stake;
    } else if (isLay(bet) || bet.bet_type === "No" || bet.bet_type === "no") {
      loss = - bet.liability;
      netamount = - bet.liability;
    }
  }
  console.log("netamount", netamount);
  console.log("profit", profit);
  console.log("loss", loss);

  // await Credit.create({
  //   user_id, match_id, eventid, game_type, market_type, selection_name, bet_type, stake, credit, profit, loss, netamount
  // });
  await User.increment(
    {
      net_win: profit,     // can be +10, 0, +40
      net_loss: loss,      // can be -30, 0, -40
      profit: netamount    // can be -10, +40, +30, -100
    },
    {
      where: { user_id }
    }
  );
  const Usersdata = await User.findOne({ where: { user_id } });
  let closing = Usersdata.profit;

  await CreditsLedger.create({
    user_id,
    currency: "INR",

    amount: totalCredit,        // REQUIRED (raw +win / -loss)
    reason: "test",        // REQUIRED (ex: BET_WIN, BET_LOSS)

    description: desc || null,

    eventid: eventid || null,
    match_id: match_id || null,
    job_id: job_id || null,

    market_type: market_type || null,
    sport_id: bet.sport_id || null,

    meta: meta || null,

    commission: null,
    netamount: netamount || null,

    profit: profit || 0,
    loss: loss || null,
    category: 'SPORTS',
    bet_id: bet.id || null,
    closing: closing || null,
  });





  await writeReport({
    job_id, bet_id: bet.id, user_id, eventid, match_id,
    game_type: String(bet.game_type || 'MO').toUpperCase(),
    market_type, selection_name: bet.selection_name,
    resolved_winner: winnerName || null, resolved_team: winnerName || null,
    credit_amount: finalcredit, exposures_map: exposuresMap,
    api_snapshot: result.meta, decision_path: [reason, desc]
  });


  const resultStatus = totalCredit > 0 ? 'won' : 'loss';
  await SportsBet.update({ fixed: 1, updated_at: new Date() }, { where: { match_id, user_id, game_type, market_type } });
  await closeBetsForMatch(user_id, match_id, false, resultStatus, job_id);
  await clearExposuresForMatch(user_id, match_id, market_type);
  return { settled: true, requeue: false };
}





async function processFanBet({ job_id, bet, eventName, marketId, marketName }) {
  const { id: bet_id, user_id, eventid, match_id, fancy_name, selection_name, bet_type, game_type, odds, stake_amount, market_type, team_one, team_two, runners, size } = bet;
  log.info('[Settlement] Processing FAN bet', { bet_id, user_id, eventid, fancy_name, match_id, bet_type });
  const result = await fetchResultForEvent(eventid, eventName, marketId, marketName, selection_name);
  log.debug('[Settlement] FAN result', { bet_id, eventid, declared: result.declared });

  // Fetch User
  const user = await User.findByPk(user_id);
  const userPercentage = user ? user.percentage : 2;

  const exposuresMap = await getMatchExposures(user_id, match_id, market_type);

  await insertScanRow({ user_id, eventid, declared: result.declared, final_result: result.final_result, counts: { total: 1 } });
  await insertSummaryRow({
    user_id, eventid, declared: result.declared, counts: { total: 1 },
    result_meta: result.meta, sections: { bet_ids: [bet_id] }
  });

  if (!result.declared) {
    log.info('[Settlement] FAN bet not declared, requeue', { bet_id, user_id, eventid });
    return { settled: false, requeue: true };
  }
  console.log("done1");
  // what team one and team two
  console.log("team_one", team_one);
  console.log("team_two", team_two);
  log.info('[Settlement] calling resolveFancyWinner with data : ', { result, fancy_name, final_result: result.final_result, selection_name, team_one, team_two, bet_type });

  if (marketsfornonfancy.includes(market_type)) {
    processnonfancy({ job_id, user_id, eventid, match_id, bet, eventName, marketId, marketName, market_type, game_type, team_one, team_two, result })
  }
  else {


    const resolve = resolveFancyWinner({ result, fancy_name, final_result: result.final_result, selection_name, team_one, team_two, bet_type, market_type, odds });
    let credit = 0;
    let winner = false;
    let netamount = 0;
    let resolved_winner = null;
    // const market_type = 'Fancy';
    const decision_path = [resolve.reason];

    console.log("step after resolver ")
    console.log(resolve);
    console.log("step after resolver ")

    if (resolve.type === 'suspended') {
      await initiateRefund({ job_id, user_id, eventid, match_id, bet, market_type });
      await clearExposuresForMatch(user_id, match_id, market_type);
      return { settled: true, requeue: false };
    } else if (resolve.type === 'string') {
      winner = resolve.winnerName === 'won';
      if (market_type === 'TIED_MATCH' || market_type === 'OVER_UNDER_35' || market_type === 'OVER_UNDER_25' || market_type === 'OVER_UNDER_15' || market_type === 'OVER_UNDER_05' || market_type === 'Tied Match'
        || market_type === 'Game Winner 1/2' || market_type === 'Game Winner 1/3' || market_type === '1st Set Winner Home/Away' || market_type === '2nd Set Winner Home/Away' || market_type === '3rd Set Winner Home/Away'
        || market_type === 'Next Goal 1.0' || market_type === 'Next Goal 2.0' || market_type === 'Next Goal 3.0' || market_type === 'Next Goal 4.0' || market_type === 'Next Goal 5.0' || market_type === 'Next Goal 6.0'
        || market_type === 'Game Winner 2/2' || market_type === 'Game Winner 2/3' || market_type === 'Game Winner 2/4' || market_type === 'Game Winner 3/2' || market_type === 'Game Winner 3/3' || market_type === 'Game Winner 3/4' || market_type === 'Game Winner 2/7' || market_type === 'Game Winner 4/3' || market_type === 'Game Winner 4/4'
        || market_type === '1st Period Winner' || market_type === '2nd Period Winner' || market_type === '3rd Period Winner' || market_type === 'Game To Deuce 1/1' || market_type === 'Game To Deuce 1/2' || market_type === 'Game To Deuce 1/3' || market_type === 'Game To Deuce 1/4' || market_type === 'Game To Deuce 2/1' || market_type === 'Game To Deuce 2/2' || market_type === 'Game To Deuce 2/3' || market_type === 'Game To Deuce 2/4' || market_type === 'Game To Deuce 3/1' || market_type === 'Game To Deuce 3/2' || market_type === 'Game To Deuce 3/3' || market_type === 'Game To Deuce 3/4'
        || market_type === 'Correct Score' || market_type === 'Correct Score1' || market_type === 'Correct Score 1st Set' || market_type === 'Correct Score 2nd Set' || market_type === 'Correct Score 3rd Set'
        || market_type === '1st Set Race To 4.0' || market_type === '2nd Set Race To 4.0' || market_type === '3rd Set Race To 4.0' || market_type === 'Point Winner 1/3/1' || market_type === 'Point Winner 1/2/1' || market_type === 'Point Winner 1/1/1' || market_type === 'Point Winner 2/3/1' || market_type === 'Point Winner 2/2/1' || market_type === 'Point Winner 2/1/1' || market_type === 'Point Winner 3/3/1' || market_type === 'Point Winner 3/2/1' || market_type === 'Point Winner 3/1/1'
        || market_type === 'Point Winner 1/3/2' || market_type === 'Point Winner 1/2/2' || market_type === 'Point Winner 1/1/2' || market_type === 'Point Winner 2/3/2' || market_type === 'Point Winner 2/2/2' || market_type === 'Point Winner 2/1/2' || market_type === 'Point Winner 3/3/2' || market_type === 'Point Winner 3/2/2' || market_type === 'Point Winner 3/1/2' || market_type === 'Point Winner 1/2/1' || market_type === 'HALF_TIME'
        || market_type === 'Match Result/Both Teams to score' || market_type === 'Both Teams To Score' || market_type === 'Match Time Result 70:00' || market_type === 'Match Time Result 10:00' || market_type === 'Match Time Result 20:00' || market_type === 'Match Time Result 30:00' || market_type === 'Match Time Result 40:00' || market_type === 'Match Time Result 50:00' || market_type === 'Match Time Result 60:00' || market_type === 'Match Time Result 80:00' || market_type === 'Match Time Result 90:00'
      ) {
        credit = winner ? stake_amount * odds : 0;
        netamount = winner ? credit - stake_amount : -stake_amount;
      } else {
        console.log("size", bet.size);
        if (winner) {
          credit = bet_type === 'yes' || bet_type === 'YES' ? stake_amount * (bet.size / 100) : stake_amount;
          netamount = bet_type === 'yes' || bet_type === 'YES' ? stake_amount * (bet.size / 100) : stake_amount;
        }
        else {
          credit = 0;
          netamount = bet_type === 'yes' || bet_type === 'YES' ? - stake_amount * (bet.size / 100) : -stake_amount;
        }
      }
      resolved_winner = winner ? selection_name : null;
      decision_path.push(`string match: selection=${selection_name} winnerName=${resolve.winnerName}`);
    } else {
      log.info('[Settlement] Unknown resolve type for FAN bet, requeue', { bet_id, type: resolve.type });
      return { settled: false, requeue: true };
    }
    console.log("step after credit or reffund ")
    console.log("amount ", credit);
    console.log("winner ", winner);
    console.log("netamount ", netamount);


    const desc = `FAN per-bet; fancy="${fancy_name}" selection=${selection_name}; iswinner="${winner}"; stake=${getStake(bet)}; credit=${credit}`;
    const meta = { api: { type: 'result', eventid, marketName: fancy_name, bettingType: bet_type }, bet_id };

    await FanWin.create({
      user_id, fancyname: fancy_name, selection: selection_name, runsodds: odds, payout: credit,
      eventid, matchid: match_id, created_at: new Date()
    });

    if (credit !== 0 || LEDGER_ZERO_ROWS) {
      // Apply dynamic platform commission on winning amount
      // const commissionData = calculateCommission(credit, userPercentage);

      const creditAmount = credit
      const amt = num(creditAmount);
      // if (amt === 0 && !LEDGER_ZERO_ROWS) return { credited: 0 };
      try {
        const creditRecord = await Wallet.findOne({ where: { user_id: String(user_id) } });
        const user = await User.findByPk(String(user_id));
        let newBal = null;
        if (creditRecord) {
          newBal = (creditRecord.credit || 0) + amt;
          await creditRecord.update({ credit: newBal });
          console.log('newBal', newBal);
        } else {
          log.error('[Settlement] No credit record for user', { user_id });
        }
      } catch (err) {
        log.error('[Settlement] Error updating credit record', { user_id, error: err.message });
      }
      // UPDATE USER STATS (WIN)
      // if (user) {
      //   // stake for fan is simple
      //   const stake = getStake(bet);
      //   await user.increment('net_win', { by: commissionData.finalAmount - stake });
      //   await user.increment('profit', { by: commissionData.finalAmount - stake });
      // }

    }
    await user.increment('net_win', { by: winner ? netamount : 0 });
    await user.increment('profit', { by: netamount });
    await user.increment('net_loss', { by: winner ? 0 : netamount });

    const Usersdata = await User.findOne({ where: { user_id } });
    let closing = Usersdata.profit;

    await CreditsLedger.create({
      user_id,
      currency: "INR",

      amount: credit,        // REQUIRED (raw +win / -loss)
      reason: "test",        // REQUIRED (ex: BET_WIN, BET_LOSS)

      description: desc || null,

      eventid: eventid || null,
      match_id: match_id || null,
      job_id: job_id || null,

      market_type: market_type || null,
      sport_id: bet.sport_id || null,

      meta: meta || null,

      commission: null,
      netamount: netamount || null,

      profit: winner ? netamount : null,
      loss: winner ? null : netamount,
      category: 'SPORTS',
      bet_id: bet.id || null,
      closing: closing || null
    });


    const fanStake = getStake(bet);
    const fanNetPL = credit - fanStake;

    // not sure diamond upline downline -----------------------------------------------

    // if (fanNetPL !== 0) {  
    //   try {
    //     await UplineService.processUplineDistribution(user_id, fanNetPL, {
    //       match_id,
    //       market_id: marketId, // fan bets might not have standard marketId?
    //       bet_id: bet_id
    //     });
    //   } catch (err) {
    //     log.error(`[Settlement] Upline FAN distribution failed`, { bet_id, error: err.message });
    //   }
    // }

    await writeReport({
      job_id, bet_id, user_id, eventid, match_id,
      game_type: String(game_type || 'FAN').toUpperCase(),
      market_type, fancy_name, selection_name,
      user_selection_yn: lower(bet_type || '') || null,
      resolved_winner,
      actual_numeric: null,
      rule_op: null,
      rule_threshold: null,
      credit_amount: credit,
      exposures_map: exposuresMap,
      api_snapshot: result.meta,
      decision_path
    });

    const resultStatus = winner ? 'won' : 'loss';
    await clearExposuresForMatch(user_id, match_id, market_type);
    await SportsBet.update(
      { status: 'closed', result_status: resultStatus, updated_at: new Date() },
      { where: { id: bet_id, job_id: String(job_id), status: { [Op.in]: ['open', 'manual'] } } }
    );
  }

  return { settled: true, requeue: false };
}



// ==== Job Processor ====
async function processJob(job) {
  const { job_id, user_id, eventid } = job;
  log.info(`[Settlement] Processing job job_id=${job_id} user=${user_id} event=${eventid}`, { job_id });
  const bets = await SportsBet.findAll({
    where: { job_id: String(job_id), status: { [Op.in]: ['open', 'manual'] } },
    order: [['created_at', 'ASC']]
  });
  if (!bets.length) {
    log.info(`[Settlement] No open bets for job_id=${job_id}; marking done`, { job_id });
    await SportsEventSettlementJob.update(
      { status: 'done', updated_at: new Date(), error_msg: null },
      { where: { job_id: String(job_id) } }
    );
    return;
  }
  log.debug('[Settlement] Found bets', { job_id, bet_count: bets.length });
  const moBmByMatch = new Map();
  const fanBets = [];
  for (const b of bets) {
    const gt = (b?.game_type).toUpperCase();
    if (gt === 'MO' || gt === 'BM' || gt === 'BO') {
      const k = `${b.user_id}::${b.match_id}`;
      if (!moBmByMatch.has(k)) moBmByMatch.set(k, []);
      moBmByMatch.get(k).push(b);
    } else if (gt === 'FAN') {
      fanBets.push(b);
    } else {
      log.error(`[Settlement] Unknown game_type="${b.game_type}"`, { bet_id: b.id });
    }
  }
  let anyRequeue = false;
  for (const [, group] of moBmByMatch.entries()) {
    const any = group[0];
    try {
      const res = await processMobmGroup({
        job_id, user_id: any.user_id, eventid: any.eventid, match_id: any.match_id, bets: group,
        eventName: any.match_title || '', marketId: any.match_id, marketName: any.selection_name || '', market_type: any.market_type, game_type: any.game_type, team_one: any.team_one, team_two: any.team_two
      });
      if (res.requeue) anyRequeue = true;
    } catch (e) {
      anyRequeue = true;
      log.error(`[Settlement] MO/BM group failed`, { match_id: any.match_id, error: e.message });
    }
  }
  for (const b of fanBets) {
    try {
      const res = await processFanBet({
        job_id, bet: b, eventName: b.match_title || '', marketId: b.match_id, marketName: b.fancy_name || ''
      });
      if (res.requeue) anyRequeue = true;
    } catch (e) {
      anyRequeue = true;
      log.error(`[Settlement] FAN bet failed`, { bet_id: b.id, error: e.message });
    }
  }
  if (anyRequeue) {
    await SportsEventSettlementJob.update(
      { status: 'queued', updated_at: new Date(), error_msg: null },
      { where: { job_id: String(job_id) } }
    );
    log.info(`[Settlement] job_id=${job_id} kept queued for next tick`, { job_id });
  } else {
    await SportsEventSettlementJob.update(
      { status: 'done', updated_at: new Date(), error_msg: null },
      { where: { job_id: String(job_id) } }
    );
    log.info(`[Settlement] job_id=${job_id} DONE`, { job_id });
  }
}
//=================================================================================================================================
// ==== Poll Once ============================================================================================================
//=================================================================================================================================
async function pollOnce() {
  log.info(`[Settlement] ===== Poll start ${nowIso()} =====`);
  try {
    const rows = await SportsEventSettlementJob.findAll({
      where: { status: 'queued' },
      order: [['created_at', 'ASC']],
      limit: BATCH_LIMIT,
      attributes: ['job_id', 'user_id', 'eventid', 'payload']
    });
    log.info(`[Settlement] Picked ${rows.length} queued job(s)`, { job_count: rows.length });
    for (const job of rows) {
      try {
        const updatedCount = await SportsEventSettlementJob.update(
          { status: 'processing', updated_at: new Date() },
          { where: { job_id: job.job_id, status: 'queued' } }
        );
        if (updatedCount[0] === 0) {
          log.debug('[Settlement] Job already taken', { job_id: job.job_id });
          continue;
        }
        let user_id = job?.user_id;
        let eventid = job?.eventid;
        if (!user_id || !eventid) {
          log.error('[Settlement] Job missing userId/eventId', { job_id: job.job_id });
          await SportsEventSettlementJob.update(
            { status: 'failed', error_msg: 'Missing userId/eventId', updated_at: new Date() },
            { where: { job_id: job.job_id } }
          );
          continue;
        }
        await processJob(job);
      } catch (e) {
        log.error(`[Settlement] Job failed`, { job_id: job.job_id, user_id, error: e.message });
        await SportsEventSettlementJob.update(
          { status: 'failed', error_msg: e.message, updated_at: new Date() },
          { where: { job_id: job.job_id } }
        );
      }
    }
    const queued = await SportsEventSettlementJob.count({ where: { status: 'queued' } });
    const processing = await SportsEventSettlementJob.count({ where: { status: 'processing' } });
    const done = await SportsEventSettlementJob.count({ where: { status: 'done' } });
    const failed = await SportsEventSettlementJob.count({ where: { status: 'failed' } });
    log.info(`[Settlement] queue stats => queued:${queued || 0} processing:${processing || 0} done:${done || 0} failed:${failed || 0}`);
  } catch (e) {
    log.error('[Settlement] pollOnce failed', { error: e.message });
  } finally {
    log.info(`[Settlement] ===== Poll end ${nowIso()} =====`);
  }
}

// ==== Scheduler ====
let running = false;
function startScheduler() {
  log.info(`[Settlement] Scheduler starting (cron="${CRON_SCHEDULE}", tz="${CRON_TZ}")`);
  cron.schedule(CRON_SCHEDULE, async () => {
    if (running) {
      log.info('[Settlement] tick skipped (previous run still executing)');
      return;
    }
    running = true;
    try {
      await pollOnce();
    } catch (e) {
      log.error('[Settlement] tick error', { error: e.message });
    } finally {
      running = false;
    }
  }, { timezone: CRON_TZ });
  if (CRON_IMMEDIATE) {
    log.info('[Settlement] Running immediate poll');
    (async () => {
      if (running) return;
      running = true;
      try {
        await pollOnce();
      } catch (e) {
        log.error('[Settlement] immediate run error', { error: e.message });
      } finally {
        running = false;
      }
    })();
  }
}

// ==== Entry ====
async function start() {
  try {
    log.info('[Settlement] Worker v2.3.2 starting...');
    // Test database connection
    await SportsEventSettlementJob.count();
    log.info('[Settlement] Database connection verified');
    startScheduler();
  } catch (e) {
    log.error('[Settlement] Startup failed', { error: e.message });
    process.exit(1);
  }
}

// Run immediately for testing
start().catch(e => {
  log.error('[Settlement] Fatal', { error: e.message });
  process.exit(1);
});

export { start, pollOnce };


