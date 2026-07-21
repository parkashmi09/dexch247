

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
import { syncTotalExposure } from '../../helper/netExposureHelper.js';
import { isBookmakerMarket, backProfit } from '../../helper/marketClassify.js';
import SportsBet from '../../model/user/SportsBet.js';
import MarketWin from '../../model/user/MarketWin.js';
import FanWin from '../../model/user/FanWin.js';
import SportsEventSettlementJob from '../../model/user/SportsEventSettlementJobs.js';
// import * as UplineService from '../../services/UplineService.js';
import User from '../../model/user/User.js';
import sequelize from '../../config/db.js';
import MannualResult from '../../model/admin/manualresult.js';
import { resolveH2HBookmakerFallback } from './customMarketResolvers.js';
// cash_received is never touched during settlement

console.log('[Settlement] Process started');

// ==== Config ====
const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true';
const BATCH_LIMIT = +(process.env.SETTLE_BATCH_LIMIT || 10);
const RESULTS_API_BASE = process.env.RESULTS_API_BASE || 'https://apilords.codefactory.games/api';
const AVRKHUB_BASE_URL = process.env.AVRKHUB_BASE_URL || 'https://diamond-result-v2.avrkhub.in';
const API_TIMEOUT_MS = +(process.env.API_TIMEOUT_MS || 30000);
const LEDGER_ZERO_ROWS = process.env.LEDGER_ZERO_ROWS === '1' || process.env.LEDGER_ZERO_ROWS === 'true';
const LOG_DIR = process.env.SETTLEMENT_LOG_DIR || path.join(process.cwd(), 'sportsbet/betresult/logs');
const LOG_BASENAME = 'settlement-worker-v3-avrkhub';
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/1 * * * *';
const CRON_TZ = process.env.CRON_TZ || 'UTC';
const CRON_IMMEDIATE = process.env.CRON_IMMEDIATE === '1' || process.env.CRON_IMMEDIATE === 'true';
const MAX_CONCURRENT_API = +(process.env.MAX_CONCURRENT_API || 3);
const RESULTS_RATE_LIMIT_MS = +(process.env.RESULTS_RATE_LIMIT_MS || 250);
const RESULTS_MAX_FETCH_RETRIES = +(process.env.RESULTS_MAX_FETCH_RETRIES || 6);
const RESULTS_RETRY_BASE_MS = +(process.env.RESULTS_RETRY_BASE_MS || 500);
const RESULTS_FORCE_IPV4 = process.env.RESULTS_FORCE_IPV4 === '1' || process.env.RESULTS_FORCE_IPV4 === 'true';
const RESULTS_DISABLE_KEEPALIVE = process.env.RESULTS_DISABLE_KEEPALIVE === '1' || process.env.RESULTS_DISABLE_KEEPALIVE === 'true';
const USER_AGENT = process.env.USER_AGENT || `settlement-worker/3.0.0-avrkhub (+node ${process.version})`;

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

function isNonFancyMarket(market_type) {

    // 1️⃣ fixed names
    if (fixedNonFancyMarkets.includes(market_type)) {
        return true;
    }

    // 2️⃣ Game Winner X/Y
    if (/^Game Winner\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
    }

    // 3️⃣ Match Time Result 10:00, 70:00, etc
    if (/^Match Time Result\s+\d{2}:\d{2}$/.test(market_type)) {
        return true;
    }

    // 4️⃣ Set Race To 1.0 – 15.0 (all sets)
    if (/^\d+(?:st|nd|rd|th)\s+Set Race To\s+(?:[1-9]|1[0-5])\.0$/.test(market_type)) {
        return true;
    }

    // 5️⃣ Under/Over 0.5 , 1.5 , 180s etc
    if (/^Under\/Over(?: 180s)?\s+\d+(\.\d)?$/.test(market_type)) {
        return true;
    }

    // 6️⃣ Total Tie Break in the Match X.X
    if (/^Total Tie Break in the Match\s+\d+(\.\d)?$/.test(market_type)) {
        return true;
    }

    if (/^Correct Score\s+\d+(?:st|nd|rd|th)\s+Set$/.test(market_type)) {
        return true;
    }

    // 7️⃣ Point Winner A/B/C
    if (/^Point Winner\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
    }

    // 8️⃣ Game To Deuce A/B   (your current list)
    if (/^Game To Deuce\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
    }

    // 9️⃣ Game To Deuce A/B/C (future support – as you mentioned before)
    if (/^Game To Deuce\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
    }

    // 🔟 Soccer/tennis (ported from reference v2.3.2):
    //    Next Goal X.0, BM Nth Set Winner, TEAM_<SIDE>_<N>
    if (/^Next Goal\s+\d+(\.\d)?$/.test(market_type)) {
        return true;
    }
    if (/^BM\s+\d+(?:st|nd|rd|th)\s+Set\s+Winner$/.test(market_type)) {
        return true;
    }
    if (/^TEAM_[A-Z]+_\d+$/.test(market_type)) {
        return true;
    }

    return false;
}

const fixedNonFancyMarkets = [
    'OVER_UNDER_55',
    'OVER_UNDER_45',
    'OVER_UNDER_35',
    'OVER_UNDER_25',
    'OVER_UNDER_15',
    'OVER_UNDER_05',
    'OVER_UNDER_10',

    // soccer markets ported from reference v2.3.2
    'Match Result/Both Teams to score',
    'HT/FT',
    '1X2 Corners',
    'CORRECT_SCORE',
    'BOTH_TEAMS_TO_SCORE',

    '2nd Period Winner',
    '1st Period Winner',
    '3rd Period Winner',

    'Both Teams To Score',

    'DRAW_NO_BET',
    'Draw No Bet',

    'HALF_TIME',
    'Correct Score 1st Set',
    'Correct Score 2nd Set',
    'Correct Score 3rd Set',
    'Correct Score 4th Set',
    'Correct Score 5th Set',

    '1st Set Winner Home/Away',
    '2nd Set Winner Home/Away',
    '3rd Set Winner Home/Away',
    '4th Set Winner Home/Away',
    '5th Set Winner Home/Away',

    '1st Set Winner',
    '2nd Set Winner',
    '3rd Set Winner',
    '4th Set Winner',
    '5th Set Winner',
    '6th Set Winner',

    '1st Half Winner',
    '2nd Half Winner',
    '3rd Half Winner',
    '4th Half Winner',
    '5th Half Winner',
    '6th Half Winner',

    '1st Quarter Winner',
    '2nd Quarter Winner',
    '3rd Quarter Winner',
    '4th Quarter Winner',
    '5th Quarter Winner',
    '6th Quarter Winner',

    'Tied Match',
    'TIED_MATCH'
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

// helper 

function normalizeText(v) {
    if (!v) return '';
    return String(v)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');
}
function normalizeMarketType(v) {
    if (!v) return '';
    return String(v).trim().toUpperCase();
}

// ==== API Layer (AVRKHUB) ====
// AVRKHUB uses GET /get_result?gmid=EVENT_ID&sid=SID
// Key differences from old Diamond API:
//   - m.ename = event/match title (old API used m.marketName for this)
//   - m.marketName = uppercase fancy label (e.g. "6 OVER RUNS KKR(KKR VS SRH)ADV")
//   - m.mname = market type key (MATCH_ODDS, BOOKMAKER, NORMAL, ODDEVEN, FANCY1, etc.)
//   - m.gtype = game type (MATCH, MATCH1, FANCY, FANCY1, ODDEVEN)
//   - m.winnerId = numeric result (runs/score) for fancy, null for MO/BM
//   - m.winnerName = team name for MO/BM, YES/NO for fancy1/tied, null for numeric fancy
//   - m.status = SETTLE | VOID (VOID = refund)
async function fetchResultForEvent(eventid, eventName, marketId, marketName, sport_id, market_type, gameType, team_one, team_two) {
    log.debug('[SettlementV2] fetchResultForEvent start', { eventid, eventName, marketId, marketName, market_type, gameType });
    const maxAttempts = RESULTS_MAX_FETCH_RETRIES || 6;
    const url = `${AVRKHUB_BASE_URL}/get_result`;

    return apiQueue.push(async () => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await globalRateLimit();

                const res = await ax.get(url, {
                    params: { gmid: eventid, sid: sport_id || '4' },
                    ...buildPerAttemptConfig(attempt)
                });

                log.debug('[SettlementV2] fetchResultForEvent response', { eventid, attempt, status: res.status });

                if (res.status === 200) {
                    const data = typeof res?.data === 'string' ? JSON.parse(res.data) : res.data;
                    const markets = Array.isArray(data?.markets) ? data.markets : [];

                    let matchedMarket;
                    const inputEventName = normalizeText(eventName);
                    const inputMname = normalizeMarketType(market_type);

                    // Primary: AVRKHUB ename is "TeamA v TeamB" (no draw).
                    // Build same shape from bet's team_one/team_two so 3-way
                    // match titles like "A vs B vs The Draw" still match.
                    const teamEventName = team_one && team_two
                        ? normalizeText(`${team_one} v ${team_two}`)
                        : '';
                    if (teamEventName) {
                        matchedMarket = markets.find(m =>
                            normalizeText(m?.ename) === teamEventName &&
                            normalizeMarketType(m?.mname) === inputMname
                        );
                    }

                    // Fallback: match by ename against raw event name
                    if (!matchedMarket) {
                        matchedMarket = markets.find(m =>
                            normalizeText(m?.ename) === inputEventName &&
                            normalizeMarketType(m?.mname) === inputMname
                        );
                    }

                    // Fallback: try matching via marketName (uppercase match title) + mname
                    if (!matchedMarket) {
                        matchedMarket = markets.find(m =>
                            normalizeText(m?.marketName) === inputEventName &&
                            normalizeMarketType(m?.mname) === inputMname
                        );
                    }

                    // VOID = refund (treat like SUSPENDED)
                    const declared = matchedMarket?.status === 'SETTLE';
                    const isVoid = matchedMarket?.status === 'VOID';

                    // For VOID, mark as declared but set winnerName to SUSPENDED for refund
                    if (isVoid && matchedMarket) {
                        matchedMarket = { ...matchedMarket, winnerName: 'SUSPENDED', winnerId: null };
                    }

                    return {
                        declared: declared || isVoid,
                        items: matchedMarket ? [matchedMarket] : [],
                        meta: { success: data?.success, source: 'avrkhub', gmid: data?.gmid }
                    };
                }

                if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
                    const ra = parseRetryAfter(res.headers?.['retry-after']);
                    const wait = ra != null ? ra : jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
                    log.debug('[SettlementV2] retry backoff', { eventid, attempt, status: res.status, waitMs: wait });
                    await sleep(wait);
                    continue;
                }

                return { declared: false, items: [] };
            } catch (e) {
                const wait = jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
                log.error('[SettlementV2] fetchResultForEvent error', { eventid, attempt, error: e.message, nextWaitMs: wait });
                await sleep(wait);
            }
        }

        log.debug('[SettlementV2] fetchResultForEvent exhausted', { eventid });
        return { declared: false, items: [] };
    });
}

// AVRKHUB fancy fetch — matches via m.marketName (fancy label) + m.mname
async function fetchResultForEventFancy(eventid, eventName, marketId, selection_name, sport_id, market_type) {
    log.debug('[SettlementV2] fetchResultForEventFancy start', { eventid, eventName, marketId, selection_name, market_type });
    const maxAttempts = RESULTS_MAX_FETCH_RETRIES || 6;
    const url = `${AVRKHUB_BASE_URL}/get_result`;

    return apiQueue.push(async () => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await globalRateLimit();

                const res = await ax.get(url, {
                    params: { gmid: eventid, sid: sport_id || '4' },
                    ...buildPerAttemptConfig(attempt)
                });

                log.debug('[SettlementV2] fetchResultForEventFancy response', { eventid, attempt, status: res.status });

                if (res.status === 200) {
                    const data = typeof res?.data === 'string' ? JSON.parse(res.data) : res.data;
                    const markets = Array.isArray(data?.markets) ? data.markets : [];

                    let matchedMarket;
                    const inputMarketName = normalizeText(selection_name);
                    const inputMarketType = normalizeMarketType(market_type);

                    if (market_type === 'TIED_MATCH' || market_type === 'Tied Match') {
                        matchedMarket = markets.find(m =>
                            normalizeMarketType(m?.mname) === inputMarketType
                        );
                    } else if (Number(sport_id) === 1 || Number(sport_id) === 2) {
                        // Soccer/tennis FAN markets: upstream marketName holds the "PLAYER VS PLAYER"
                        // (or "YES VS NO") runner string, NOT the selection, so marketName===selection
                        // never fires. The feed is already scoped to this event by gmid, so match on
                        // event (ename) + mname; the upstream ename is often abbreviated and may not
                        // equal the stored title, so fall back to a UNIQUE mname match.
                        const inputEventName = normalizeText(eventName);
                        matchedMarket = markets.find(m =>
                            normalizeText(m?.ename) === inputEventName &&
                            normalizeMarketType(m?.mname) === inputMarketType
                        );
                        if (!matchedMarket) {
                            const cands = markets.filter(m => normalizeMarketType(m?.mname) === inputMarketType);
                            if (cands.length === 1) matchedMarket = cands[0];
                        }
                    } else {
                        // For fancy: m.marketName is the fancy label (e.g. "6 OVER RUNS KKR(KKR VS SRH)ADV")
                        matchedMarket = markets.find(m =>
                            normalizeText(m?.marketName) === inputMarketName &&
                            normalizeMarketType(m?.mname) === inputMarketType
                        );
                        if (!matchedMarket) {
                            // CRICKETCASINO session markets ("X Number"): the upstream marketName is
                            // the session TITLE (== mname), not the selection, and the outcome is in
                            // winnerName. The bet's market_type IS that title, so match by mname +
                            // event. Gated to gtype CRICKETCASINO and to a UNIQUE candidate, so generic
                            // fancy mnames (NORMAL, ODDEVEN, …) can never be mis-matched here.
                            const inputEventName = normalizeText(eventName);
                            const sessionCands = markets.filter(m =>
                                String(m?.gtype || '').toUpperCase() === 'CRICKETCASINO' &&
                                normalizeMarketType(m?.mname) === inputMarketType &&
                                normalizeText(m?.ename) === inputEventName
                            );
                            if (sessionCands.length === 1) matchedMarket = sessionCands[0];
                        }
                    }

                    // Handle VOID status
                    const declared = matchedMarket?.status === 'SETTLE';
                    const isVoid = matchedMarket?.status === 'VOID';

                    if (isVoid && matchedMarket) {
                        matchedMarket = { ...matchedMarket, winnerName: 'SUSPENDED', winnerId: 'SUSPENDED' };
                    }

                    return {
                        declared: declared || isVoid,
                        items: matchedMarket ? [matchedMarket] : [],
                        meta: { success: data?.success, source: 'avrkhub', gmid: data?.gmid }
                    };
                }

                if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
                    const ra = parseRetryAfter(res.headers?.['retry-after']);
                    const wait = ra != null ? ra : jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
                    log.debug('[SettlementV2] fancy retry backoff', { eventid, attempt, status: res.status, waitMs: wait });
                    await sleep(wait);
                    continue;
                }

                return { declared: false, items: [] };
            } catch (e) {
                const wait = jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
                log.error('[SettlementV2] fetchResultForEventFancy error', { eventid, attempt, error: e.message });
                await sleep(wait);
            }
        }

        log.debug('[SettlementV2] fetchResultForEventFancy exhausted', { eventid });
        return { declared: false, items: [] };
    });
}

// Helper to fetch manual result from DB
async function fetchManualResult(eventid, match_id, game_type, market_type, selection_name) {
    log.debug('[Settlement] fetchManualResult start', { eventid, match_id, game_type, market_type, selection_name });
    try {
        const whereClause = {
            eventid: String(eventid),
            match_id: String(match_id),
            game_type: String(game_type),
            market_type: String(market_type)
        };

        const marketsforfancyCheck = [
            '1st Innings 6 Overs Line',
            '2nd Innings 6 Overs Line',
            '3rd Innings 6 Overs Line',
            '1st Innings 50 Overs Line',
            '2nd Innings 50 Overs Line',
            '3rd Innings 50 Overs Line',
            '1st Innings 40 Overs Line',
            '2nd Innings 40 Overs Line',
            '3rd Innings 40 Overs Line',
            '1st Innings 30 Overs Line',
            '2nd Innings 30 Overs Line',
            '3rd Innings 30 Overs Line',
            '1st Innings 20 Overs Line',
            '2nd Innings 20 Overs Line',
            '3rd Innings 20 Overs Line',
            '1st Innings 10 Overs Line',
            '2nd Innings 10 Overs Line',
            '3rd Innings 10 Overs Line',
            'Over By Over',
            'Ball By Ball',
            'Normal',
            'khado',
            'meter',
            'fancy1',
            'oddeven'
        ];


        if (game_type === 'FAN') {
            // We need to match fancyName. 
            // In processFanBet, `fancy_name` is available. We should pass it to this function.
            if (marketsforfancyCheck.includes(market_type) && selection_name) {
                whereClause.fancyName = selection_name; // Assuming selection_name passed here is the fancy name
            }
        }

        // We will fetch all results for this match/market/game first, then filter if needed, 
        // or just strict match if we are sure. 
        // User said: "search eventid and matchid game_type"

        // Let's look at the MannualResult table example again:
        // id	match_title	eventid	match_id	market_type	game_type	winnerId	winnerName	fancyName

        // For 'MO'/'BM': market_type is 'MATCH_ODDS' or 'BookMaker' etc.
        // For 'FAN': market_type is 'fancy1', 'Normal', etc. fancyName is the specific question.

        const manualRes = await MannualResult.findOne({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });

        if (!manualRes) {
            log.info('[Settlement] Manual result not found', whereClause);
            return { declared: false, items: [] };
        }

        log.debug('[Settlement] Manual result found', { id: manualRes.id, winnerName: manualRes.winnerName, winnerId: manualRes.winnerId });

        // Construct a result object compatible with resolveMobmWinner / resolveFancyWinner

        // For MO/BM: items[0] should have { winnerName, winnerId, final_result }
        // For FAN: items[0] should have { winnerName, winnerId }

        const item = {
            winnerName: manualRes.winnerName,
            winnerId: manualRes.winnerId,
            final_result: manualRes.winnerName // For MO/BM resolveMobmWinner uses final_result
        };

        return {
            declared: true,
            items: [item],
            meta: { source: 'manual', manual_result_id: manualRes.id }
        };

    } catch (e) {
        log.error('[Settlement] fetchManualResult error', { eventid, error: e.message });
        return { declared: false, items: [] };
    }
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
        // total_exposures is written at placement (placeBet STEP 10) but was never
        // recomputed here, so a settled user kept a stale liability forever (it is
        // read back by ExposureService and pushed over the balance socket).
        // Recompute from the now-updated user_exposures. Non-fatal: a failure here
        // must not roll back a completed settlement.
        try {
            const total = await syncTotalExposure(user_id);
            log.debug('[Settlement] TotalExposure resynced', { user_id, total });
        } catch (te) {
            log.error('[Settlement] syncTotalExposure failed', { user_id, error: te.message });
        }
    } catch (e) {
        log.error('[Settlement] clearExposuresForMatch failed', { user_id, match_id, error: e.message });
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
            { status: 'closed', result_status: resultStatus, fixed: 1, updated_at: new Date() },
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

function resolveMobmWinner({ result, team_one, team_two }) {
    console.log("inside resolveMobmWinner", result, team_one, team_two, result);
    let final_result = result.items[0].winnerName;
    console.log("final_result", final_result);
    const items = result?.items || [];
    // if (!items.length && !final_result) {
    //     log.debug('[Settlement] resolveMobmWinner: no result items or final_result');
    //     return { winnerName: '', reason: 'no result items or final_result' };
    // }

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




function resolveFancyWinner({ result, fancy_name, selection_name, team_one, team_two, bet_type, market_type, odds }) {

    console.log("result", result);
    // Use winnerId when the upstream provides a numeric/id result (oddeven, fancy1,
    // run/over lines); fall back to winnerName for label results (e.g. cricketcasino
    // "5 Number", team/runner names). Ported from reference settlement v2.3.2.
    let final_result = result.winnerId || result.winnerName;
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
    if (market_type === 'oddeven') {

        if (bet_type === 'yes' && final_result % 2 === 0) {
            winnerName = 'won';
        }
        else if (bet_type === 'no' && final_result % 2 !== 0) {
            winnerName = 'won';
        }
        else {
            winnerName = 'loss';
        }
        return { type: 'string', winnerName, reason: 'determined from final_result string for oddeven' };

    }
    // Cricketcasino / "X Number" session markets: matched by their UNIQUE session-title
    // mname (see the session-title fallback in fetchResultForEventFancy). The winning
    // number arrives in winnerName ("5 Number"); the bettor backs a specific number, so
    // a back/yes wins when the selection equals the winner, lay/no wins otherwise.
    else if (/\bnumber\b/i.test(String(selection_name)) && /\bnumber\b/i.test(String(final_result))) {
        const hit = norm(selection_name) === norm(final_result);
        if (bet_type === 'yes' && hit) winnerName = 'won';
        else if (bet_type === 'no' && !hit) winnerName = 'won';
        else winnerName = 'loss';
        return { type: 'string', winnerName, reason: 'cricketcasino number market: selection vs winnerName' };
    }
    else if (market_type === 'fancy1') {
        // special condition — upstream provides the result in winnerId (1 = this
        // selection's question resolved YES, otherwise NO); winnerName is null.
        // Ported from reference settlement v2.3.2 (old string-on-winnerName logic
        // always fell through to 'loss' because winnerName is null for fancy1).
        const bet = bet_type?.toLowerCase();
        if (bet === 'yes' && Number(final_result) === 1) {
            winnerName = 'won';
        } else if (bet === 'no' && Number(final_result) !== 1) {
            winnerName = 'won';
        } else {
            winnerName = 'loss';
        }
        return { type: 'string', winnerName, reason: 'determined from final_result string for fancy1' };
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

    else if (market_type === 'Over By Over') {
        if (bet_type === 'yes') {
            if (final_result >= odds) {
                winnerName = 'won';
            }
            else {
                winnerName = 'loss';
            }
            return { type: 'string', winnerName, reason: 'determined from final_result string for over by over' };
        }
        else if (bet_type === 'no') {
            if (final_result < odds) {
                winnerName = 'won';
            }
            else {
                winnerName = 'loss';
            }
            return { type: 'string', winnerName, reason: 'determined from final_result string for over by over' };
        }

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
        || market_type === 'Over By Over' || market_type === 'Normal' || market_type === 'Ball By Ball' || market_type === 'khado' || market_type === 'meter' || market_type === 'meters'
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
    const meta = { api: { type: 'result', eventid, match_id, status: 'suspended' }, bet_id };

    try {
        // Find the user's wallet and update inr_balance
        const wallet = await Wallet.findOne({ where: { user_id } });
        if (!wallet) {
            log.error('[Settlement] No wallet found for user', { bet_id, user_id });
            throw new Error(`No wallet found for user_id=${user_id}`);
        }

        // === EXPOSURE-AWARE REFUND CALCULATION ============================
        // Old behavior unconditionally credited `stake` back to the wallet,
        // which double-credits hedging/profit-booking bets — those bets had
        // already RELEASED cash at placement time (balanceChange < 0), so
        // refunding the stake again gives the user free money.
        //
        // Correct behavior: refund must EXACTLY REVERSE the wallet delta the
        // bet caused at placement time. We do that by summing the linked
        // CreditsLedger entries with reasons in (bet_placed, exposure_release)
        // and negating the sum.
        //
        // Examples:
        //   • Normal bet placed (-100 debit)        → placementSum=-100, refund=+100
        //   • Profit-booking bet (cash released +400) → placementSum=+400, refund=-400
        //   • Hedging partial (-30)                  → placementSum=-30,  refund=+30
        //
        // For legacy bets that have no placement entries (pre-walletUpdate
        // fix), fall back to crediting `stake` and emit a warning so the
        // gap is observable in logs.
        const placementEntries = await CreditsLedger.findAll({
            where: {
                bet_id,
                user_id: String(user_id),
                reason: { [Op.in]: ['bet_placed', 'exposure_release'] },
            },
            attributes: ['amount', 'reason'],
            raw: true,
        });

        let refundAmount;
        let refundSource;
        if (placementEntries.length > 0) {
            const placementSum = placementEntries.reduce(
                (s, e) => s + (parseFloat(e.amount) || 0), 0
            );
            refundAmount = -placementSum;
            refundSource = `placement_sum=${placementSum.toFixed(2)} (entries=${placementEntries.length})`;
        } else {
            log.warn('[Settlement] Refund: no placement entries for bet — falling back to stake', { bet_id, user_id, stake });
            refundAmount = stake;
            refundSource = `legacy_fallback_stake=${stake}`;
        }

        const desc = `Refund for SUSPENDED MO/BM bet; bet_id=${bet_id}; stake=${stake}; refund=${refundAmount}; ${refundSource}`;

        // Apply refund to wallet (refundAmount may be negative for hedging reversal)
        const newBalance = (Number(wallet.cash) || 0) + refundAmount;
        await wallet.update({ cash: newBalance });

        // Log to CreditsLedger
        await CreditsLedger.create({
            user_id: String(user_id),
            currency: 'INR',
            amount: refundAmount,
            reason: 'refund',
            description: desc,
            eventid: String(eventid),
            job_id: String(job_id || ''),
            match_id: match_id ? String(match_id) : null,
            meta: { ...(meta || {}), refund_source: refundSource, placement_entries: placementEntries.length },
            market_type,
            bet_id,
            closing: newBalance,
            netamount: refundAmount,
            category: 'SPORTS'
        });

        log.info(`[Settlement] Refund applied`, { bet_id, user_id, refundAmount, balance: newBalance, refundSource });

        // Update SportsBet table to mark as closed with refund status
        await SportsBet.update(
            { status: 'closed', result_status: 'refund', fixed: 1, updated_at: new Date() },
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
    if (!Number.isFinite(o)) return 0;
    // Detect bookmaker off the MARKET, not just game_type: bets placed before the
    // classification fix are stored as 'MO' despite carrying percentage odds, and
    // reading those as decimal overpays a won back by ~100x.
    const gameType = String(b.game_type || '').toUpperCase();
    if (gameType === 'BM' || isBookmakerMarket(b)) return normalizeOdds(o);
    return o;
}
function getStake(b) { return num(b.stake_amount ?? b.stake ?? b.amount ?? b.stakeValue ?? b.size); }
function isBack(b) { return lower(b.bet_type) === 'back'; }
function isLay(b) { return lower(b.bet_type) === 'lay'; }

function moBmBetWinCredit(bet, winnerName) {
    const sel = bet.selection_name || '';
    const selIsWinner = norm(sel) === norm(winnerName);
    const stake = getStake(bet);
    // backProfit reads the RAW odds and picks the right rate (bookmaker odds/100
    // vs decimal odds-1), so this matches placement exposure/liability and the
    // statement exactly instead of drifting via normalized-decimal arithmetic.
    if (isBack(bet)) return selIsWinner ? Math.max(0, backProfit(stake, bet)) : 0;
    // Lay won (selection lost): profit = backer's stake, NOT liability
    if (isLay(bet)) return selIsWinner ? 0 : Math.max(0, stake);
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







async function processMobmGroup({ job_id, user_id, eventid, match_id, bets, eventName, marketId, marketName, market_type, game_type, team_one, team_two, sport_id }) {
    log.info('[Settlement] Processing MO/BM group', { user_id, eventid, match_id, bets: bets.length });

    let result;
    const any = bets[0] || {};

    if (any.status === 'manual') {
        result = await fetchManualResult(eventid, match_id, game_type, market_type);
    } else {
        result = await fetchResultForEvent(eventid, eventName, marketId, marketName, sport_id, market_type, game_type, team_one, team_two);
    }

    // Custom h2h bookmaker fallback — see customMarketResolvers.js.
    // Triggers ONLY when the standard upstream match returned nothing,
    // and only for custom over-based bookmaker markets like
    // "6 Over Bookmaker ( RR VS RCB )" that the upstream feed doesn't
    // publish directly. Normal MO/BM markets are unaffected.
    if (!result.declared) {
        const fallback = await resolveH2HBookmakerFallback({
            eventid,
            sport_id: any.sport_id || sport_id,
            market_type,
            team_one,
            team_two,
            logger: log,
        });
        if (fallback?.declared) {
            log.info('[Settlement] H2H bookmaker fallback applied', {
                user_id, match_id, eventid, ...fallback.meta,
            });
            result = fallback;
        }
    }

    if (!result.declared) {
        log.info('[Settlement] MO/BM group not declared, requeue', { user_id, match_id, eventid });
        return { settled: false, requeue: true };
    }




    const { winnerName, reason } = resolveMobmWinner({ result, team_one, team_two, result: result });

    log.info(`[Settlement] MO/BM WINNER NAME or STATUS="${winnerName}" (${reason})`, { match_id, eventid, bets: bets.length });

    console.log("step donw 22");

    // Check if winner is SUSPENDED
    if (winnerName.toUpperCase() === 'SUSPENDED') {
        log.info('[Settlement] MO/BM group SUSPENDED, initiating refunds', { user_id, match_id, eventid });
        // const market_type = (String(any.game_type || 'MO').toUpperCase() === 'BM' ? 'bookmaker' : 'odds');

        for (const bet of bets) {
            await initiateRefund({ job_id, user_id, eventid, match_id, bet, market_type });
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

    // ── MARKET-LEVEL: compute finalcredit (cash return) & netamount (inr change) ONCE ──
    const firstBet = bets[0] || {};
    const rawExposures = await getMatchExposures(user_id, match_id, market_type);
    // Normalize exposure keys (trim whitespace) for reliable lookup
    const marketExposures = {};
    for (const [k, v] of Object.entries(rawExposures)) { marketExposures[k.trim()] = v; }

    const t1 = (firstBet.team_one || '').trim();
    const t2 = (firstBet.team_two || '').trim();
    const mTeam1 = marketExposures[t1] || 0;
    const mTeam2 = marketExposures[t2] || 0;
    const mDraw = marketExposures['The Draw'] || marketExposures['Draw'] || 0;
    const mNegExposures = Object.values(marketExposures).filter(x => x < 0);
    const mMostNeg = mNegExposures.length > 0 ? Math.min(...mNegExposures) : 0;

    // Determine winner's exposure value (trim winner name too)
    const winTrimmed = (winnerName || '').trim();
    let winnerExposure = 0;
    if (t1 === winTrimmed) winnerExposure = mTeam1;
    else if (t2 === winTrimmed) winnerExposure = mTeam2;
    else if (winTrimmed === 'The Draw' || winTrimmed === 'Draw') winnerExposure = mDraw;
    else {
        // Fallback: find by trimmed key match in exposures
        winnerExposure = marketExposures[winTrimmed] || 0;
    }

    // finalcredit = blocked amount + winner's exposure (handles all cases)
    let marketFinalCredit = 0;
    if (winnerName === 'refund') {
        marketFinalCredit = normalizeExposure(mMostNeg);
    } else {
        marketFinalCredit = normalizeExposure(mMostNeg) + winnerExposure;
    }
    if (marketFinalCredit < 0) marketFinalCredit = 0;

    // netamount for inr_balance = winner's exposure (the net P/L for this market)
    const marketNetAmount = winnerName === 'refund' ? 0 : winnerExposure;

    console.log('[Settlement] MARKET-LEVEL:', { mTeam1, mTeam2, mDraw, mMostNeg, winnerExposure, marketFinalCredit, marketNetAmount });

    // Check if ALL bets are fixed (bet locked) — if so, no wallet update
    const allFixed = bets.every(b => b.fixed == 1);

    for (const bet of bets) {

        let credit = moBmBetWinCredit(bet, winnerName);
        const stake = getStake(bet);
        const selIsWinner = norm(bet.selection_name) === norm(winnerName);

        totalCredit += credit;

        // Get odds information
        const rawOdds = getOdds(bet);
        const normalizedOddsValue = normalizeOdds(rawOdds);

        const desc = `MO/BM per-bet; winner="${winnerName}"; bet_type=${bet.bet_type}; selection="${bet.selection_name}"; odds=${rawOdds}; normalized_odds=${normalizedOddsValue}; stake=${stake}; credit=${credit}`;
        const meta = { api: { type: 'result', eventid, marketId, marketName, status: result.declared }, winnerName, reason, bet_id: bet.id, odds: rawOdds, normalized_odds: normalizedOddsValue };

        if (bet.fixed == 0) {
            let totalbets = await SportsBet.count({ where: { eventid, match_id, game_type: 'MO', user_id } });
            let drawex = firstBet.counts == 3 ? mDraw : 0;
            await MarketWin.create({
                totalbets, matchid: match_id, eventid, team1ex: mTeam1, team2ex: mTeam2, drawex,
                winteam: winnerName, matchname: `${bet.team_one} vs ${bet.team_two}`, payout: marketFinalCredit, user_id, created_at: new Date()
            });
        }

        // Calculate cost (liability/stake) for stats
        let cost = 0;
        if (isBack(bet) || bet.bet_type === "Yes" || bet.bet_type === "yes") {
            cost = stake;
        } else if (isLay(bet) || bet.bet_type === "No" || bet.bet_type === "no") {
            cost = (rawOdds - 1) * stake;
        }
        cost = cost > 0 ? cost : 0;

        // Per-bet P/L for User.increment and ledger
        let profit = 0;
        let loss = 0;
        let netamount = 0;

        if (credit > 0) {
            profit = credit;
            netamount = credit;
        } else {
            if (isBack(bet) || bet.bet_type === "Yes" || bet.bet_type === "yes") {
                loss = -stake;
                netamount = -stake;
            } else if (isLay(bet) || bet.bet_type === "No" || bet.bet_type === "no") {
                loss = - bet.liability;
                netamount = - bet.liability;
            }
        }

        console.log("per-bet netamount", netamount, "credit", credit);
        console.log("per-bet profit", profit, "loss", loss);

        // cash_received is never touched during settlement

        await User.increment(
            {
                net_win: profit,
                net_loss: loss,
                profit: netamount
            },
            {
                where: { user_id }
            }
        );

        await writeReport({
            job_id, bet_id: bet.id, user_id, eventid, match_id,
            game_type: String(bet.game_type || 'MO').toUpperCase(),
            market_type, selection_name: bet.selection_name,
            resolved_winner: winnerName || null, resolved_team: winnerName || null,
            credit_amount: marketFinalCredit, exposures_map: exposuresMap,
            api_snapshot: result.meta, decision_path: [reason, desc]
        });
    }

    // ── WALLET UPDATE: ONCE per market after all bets processed ──
    if (!allFixed && (marketFinalCredit !== 0 || marketNetAmount !== 0)) {
        try {
            const creditRecord = await Wallet.findOne({ where: { user_id: String(user_id) } });
            if (creditRecord) {
                const currentCash = Number(creditRecord.cash || 0);
                const currentInr = Number(creditRecord.inr_balance || 0);

                const newCash = currentCash + Number(marketFinalCredit);
                const newInr = currentInr + Number(marketNetAmount);

                console.log('[Settlement] WALLET UPDATE (ONCE):', { currentCash, marketFinalCredit, newCash, currentInr, marketNetAmount, newInr });

                await creditRecord.update({ cash: newCash, inr_balance: newInr });

                // ✅ ONE CreditsLedger entry per market settlement (cash statement)
                const settlementDesc = `Settlement: ${firstBet.team_one} vs ${firstBet.team_two}; winner=${winnerName}; market=${market_type}; bets=${bets.length}; cash_credit=${marketFinalCredit}; pnl=${marketNetAmount}`;
                await CreditsLedger.create({
                    user_id: String(user_id),
                    currency: "INR",
                    amount: marketFinalCredit,
                    reason: "settlement",
                    description: settlementDesc,
                    netamount: marketFinalCredit,
                    closing: newCash,
                    market_type: market_type || null,
                    sport_id: firstBet.sport_id || null,
                    eventid: eventid || null,
                    match_id: match_id || null,
                    job_id: job_id || null,
                    // Pivot on marketNetAmount (actual market P/L). Using totalCredit
                    // misclassified wins as losses when stake-locked credits summed to 0
                    // but the net outcome was positive (e.g. successful cashout).
                    profit: marketNetAmount > 0 ? marketNetAmount : 0,
                    loss: marketNetAmount < 0 ? marketNetAmount : null,
                    bet_id: firstBet.id || null,
                    category: 'SPORTS',
                });
            } else {
                log.error('[Settlement] No wallet found for user', { user_id });
            }
        } catch (err) {
            log.error('[Settlement] Error updating wallet', { user_id, error: err.message });
        }
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


        await initiateRefund({ job_id, user_id, eventid, match_id, bet, market_type });


        // Clear exposures and mark job as done
        await clearExposuresForMatch(user_id, match_id, market_type);
        return { settled: true, requeue: false };
    }

    console.log("step donw exposure");
    console.log("market_type", market_type);
    const exposuresMap = await getMatchExposures(user_id, match_id, market_type);
    console.log("exposuresMap", exposuresMap);

    // Fetch User to get percentage
    const user = await User.findByPk(user_id);
    const userPercentage = user ? user.percentage : 2;

    // ── MARKET-LEVEL: compute finalcredit & netamount from exposures ──
    const rawOldExposures = await getMatchExposures(user_id, match_id, market_type);
    const oldExposures = {};
    for (const [k, v] of Object.entries(rawOldExposures)) { oldExposures[k.trim()] = v; }

    const bt1 = (bet.team_one || '').trim();
    const bt2 = (bet.team_two || '').trim();
    const team1 = oldExposures[bt1] || 0;
    const team2 = oldExposures[bt2] || 0;
    const draw = oldExposures['The Draw'] || oldExposures['Draw'] || 0;
    const negExposures = Object.values(oldExposures).filter(x => x < 0);
    const mostNeg = negExposures.length > 0 ? Math.min(...negExposures) : 0;

    const nfWinTrimmed = (winnerName || '').trim();
    let winnerExposure = 0;
    if (bt1 === nfWinTrimmed) winnerExposure = team1;
    else if (bt2 === nfWinTrimmed) winnerExposure = team2;
    else if (nfWinTrimmed === 'The Draw' || nfWinTrimmed === 'Draw') winnerExposure = draw;
    else { winnerExposure = oldExposures[nfWinTrimmed] || 0; }

    let finalcredit = 0;
    if (winnerName === 'refund') {
        finalcredit = normalizeExposure(mostNeg);
    } else {
        finalcredit = normalizeExposure(mostNeg) + winnerExposure;
    }
    if (finalcredit < 0) finalcredit = 0;

    const marketNetAmount = winnerName === 'refund' ? 0 : winnerExposure;

    console.log('[Settlement] NON-FANCY MARKET-LEVEL:', { team1, team2, draw, mostNeg, winnerExposure, finalcredit, marketNetAmount });

    let credit = moBmBetWinCredit(bet, winnerName);
    const stake = getStake(bet);
    const selIsWinner = norm(bet.selection_name) === norm(winnerName);
    let totalCredit = credit;

    // Get odds information
    const rawOdds = getOdds(bet);
    const normalizedOddsValue = normalizeOdds(rawOdds);

    const desc = `FAN per-bet; winner="${winnerName}"; bet_type=${bet.bet_type}; selection="${bet.selection_name}"; odds=${rawOdds}; normalized_odds=${normalizedOddsValue}; stake=${stake}; credit=${credit}`;
    const meta = { api: { type: 'result', eventid, marketId, marketName, status: result.declared }, winnerName, reason, bet_id: bet.id, odds: rawOdds, normalized_odds: normalizedOddsValue };

    if (bet.fixed == 0) {
        let totalbets = await SportsBet.count({ where: { eventid, match_id, game_type: 'MO', user_id } });
        let drawex = bet.counts == 3 ? draw : 0;
        await MarketWin.create({
            totalbets, matchid: match_id, eventid, team1ex: team1, team2ex: team2, drawex,
            winteam: winnerName, matchname: `${bet.team_one} vs ${bet.team_two}`, payout: finalcredit, user_id, created_at: new Date()
        });
    }

    // Calculate cost (liability/stake) for stats
    let cost = 0;
    if (isBack(bet)) {
        cost = stake;
    } else if (isLay(bet)) {
        cost = (rawOdds - 1) * stake;
    }
    cost = cost > 0 ? cost : 0;

    let profit = 0;
    let loss = 0;
    let netamount = 0;

    if (credit > 0) {
        profit = credit;
        netamount = credit;
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

    // Wallet update ONCE using market-level calculation
    if (bet.fixed != 1 && (finalcredit !== 0 || marketNetAmount !== 0)) {
        try {
            const creditRecord = await Wallet.findOne({ where: { user_id: String(user_id) } });
            if (creditRecord) {
                const currentCash = Number(creditRecord.cash || 0);
                const currentInr = Number(creditRecord.inr_balance || 0);
                const newCash = currentCash + Number(finalcredit);
                const newInr = currentInr + Number(marketNetAmount);
                console.log('[Settlement] NON-FANCY WALLET UPDATE:', { currentCash, finalcredit, newCash, currentInr, marketNetAmount, newInr });
                await creditRecord.update({ cash: newCash, inr_balance: newInr });

                // ✅ ONE CreditsLedger entry per market settlement (cash statement)
                const settlementDesc = `Settlement: ${bet.team_one} vs ${bet.team_two}; winner=${winnerName}; market=${market_type}; cash_credit=${finalcredit}; pnl=${marketNetAmount}`;
                await CreditsLedger.create({
                    user_id: String(user_id),
                    currency: "INR",
                    amount: finalcredit,
                    reason: "settlement",
                    description: settlementDesc,
                    netamount: finalcredit,
                    closing: newCash,
                    market_type: market_type || null,
                    sport_id: bet.sport_id || null,
                    eventid: eventid || null,
                    match_id: match_id || null,
                    job_id: job_id || null,
                    profit: profit || 0,
                    loss: loss || null,
                    bet_id: bet.id || null,
                    category: 'SPORTS',
                });
            } else {
                log.error('[Settlement] No wallet found for user', { user_id });
            }
        } catch (err) {
            log.error('[Settlement] Error updating wallet', { user_id, error: err.message });
        }
    }

    // cash_received is never touched during settlement

    await User.increment(
        {
            net_win: profit,
            net_loss: loss,
            profit: netamount
        },
        {
            where: { user_id }
        }
    );

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
    const { id: bet_id, user_id, eventid, match_id, fancy_name, selection_name, bet_type, game_type, odds, stake_amount, market_type, team_one, team_two, runners, size, sport_id, status } = bet;
    log.info('[Settlement] Processing FAN bet', { bet_id, user_id, eventid, fancy_name, match_id, bet_type, sport_id, market_type, status });

    let result;
    if (status === 'manual') {
        // For FAN bets, we pass fancy_name as the selection identifier for the manual table lookup
        result = await fetchManualResult(eventid, match_id, game_type, market_type, selection_name);
    } else {
        result = await fetchResultForEventFancy(eventid, eventName, marketId, selection_name, sport_id, market_type);
    }

    log.debug('[Settlement] FAN result', { bet_id, eventid, declared: result.declared });
    console.log(" FAN result'", { bet_id, eventid, declared: result.declared });

    // Fetch User
    const user = await User.findByPk(user_id);
    const userPercentage = user ? user.percentage : 2;

    const exposuresMap = await getMatchExposures(user_id, match_id, market_type);

    // await insertScanRow({ user_id, eventid, declared: result.declared, final_result: result.final_result, counts: { total: 1 } });
    // await insertSummaryRow({
    //     user_id, eventid, declared: result.declared, counts: { total: 1 },
    //     result_meta: result.meta, sections: { bet_ids: [bet_id] }
    // });

    if (!result.declared) {
        log.info('[Settlement] FAN bet not declared, requeue', { bet_id, user_id, eventid });
        return { settled: false, requeue: true };
    }
    console.log("done1");
    // what team one and team twocredit
    console.log("team_one", team_one);
    console.log("team_two", team_two);
    log.info('[Settlement] calling resolveFancyWinner with data : ', { result, fancy_name, final_result: result.items, selection_name, team_one, team_two, bet_type });

    if (isNonFancyMarket(market_type)) {
        return await processnonfancy({ job_id, user_id, eventid, match_id, bet, eventName, marketId, marketName, market_type, game_type, team_one, team_two, result });
    }
    else {


        const resolve = resolveFancyWinner({ result: result.items[0], fancy_name, selection_name, team_one, team_two, bet_type, market_type, odds });
        let credit = 0;
        let winner = false;
        let netamount = 0;
        let resolved_winner = null;
        let desc = null;
        let meta = null;
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
                || market_type === 'oddeven' || market_type === 'fancy1'
            ) {

                if (winner) {
                    credit = bet_type === 'yes' || bet_type === 'YES' ? stake_amount * (odds - 1) : stake_amount;
                    netamount = bet_type === 'yes' || bet_type === 'YES' ? stake_amount * (odds - 1) : stake_amount;
                }
                else {
                    credit = 0;
                    netamount = bet_type === 'yes' || bet_type === 'YES' ? -stake_amount : - stake_amount * odds;
                }
            } else {
                console.log("size", bet.size);
                if (winner) {
                    credit = bet_type === 'yes' || bet_type === 'YES' ? stake_amount * (bet.size / 100) : stake_amount;
                    netamount = bet_type === 'yes' || bet_type === 'YES' ? stake_amount * (bet.size / 100) : stake_amount;
                }
                else {
                    credit = 0;
                    netamount = bet_type === 'yes' || bet_type === 'YES' ? -stake_amount : - stake_amount * (bet.size / 100);
                }
            }
            resolved_winner = winner ? selection_name : null;
            decision_path.push(`string match: selection=${selection_name} winnerName=${resolve.winnerName}`);
        } else {
            log.info('[Settlement] Unknown resolve type for FAN bet, requeue', { bet_id, type: resolve.type });
            return { settled: false, requeue: true };
        }
        await sequelize.transaction(async (transaction) => {

            const oldExposuresRows = await UserExposure.findAll({
                where: {
                    user_id,
                    match_id,
                    game_type: market_type,
                    team_name: selection_name
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });
            const oldExposure = oldExposuresRows[0]
                ? Number(oldExposuresRows[0].exposure_amount)
                : 0;
            console.log('OLD EXPOSURES:', oldExposure);
            let releaseexposure = Math.abs(oldExposure);
            if (releaseexposure > 0) {

                const creditRecord = await Wallet.findOne({
                    where: { user_id: String(user_id) },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });

                if (!creditRecord) {
                    console.log('{exposure release} No credit record for user', { user_id });
                } else {

                    const currentBal = Number(creditRecord.cash || 0);
                    const addAmt = Number(releaseexposure);

                    const newBal = currentBal + addAmt;

                    await creditRecord.update(
                        { cash: newBal },
                        { transaction }
                    );

                    console.log('newBal after exposure release', newBal);
                }
            }
            console.log("step after credit or reffund ")
            console.log("amount ", credit);
            console.log("winner ", winner);
            console.log("netamount ", netamount);


            desc = `FAN per-bet; fancy="${fancy_name}" selection=${selection_name}; iswinner="${winner}"; stake=${getStake(bet)}; credit=${credit}`;
            meta = { api: { type: 'result', eventid, marketName: fancy_name, bettingType: bet_type }, bet_id };

            await FanWin.create({
                user_id, fancyname: fancy_name, selection: selection_name, runsodds: odds, payout: credit,
                eventid, matchid: match_id, created_at: new Date()
            }, { transaction }); // Add transaction here too if possible, but the original code didn't

            if (Number(netamount) !== 0) {

                const amt = Number(num(netamount)); // signed net amount (+ / -)

                try {

                    const creditRecord = await Wallet.findOne({
                        where: { user_id: String(user_id) },
                        transaction,
                        lock: transaction.LOCK.UPDATE
                    });

                    if (!creditRecord) {
                        log.error('[Settlement] No credit record for user', { user_id });
                        return;
                    }

                    const currentCash = Number(creditRecord.cash || 0);
                    const currentInr = Number(creditRecord.inr_balance || 0);

                    const newCash = currentCash + amt;   // works for both + and -
                    const newInr = currentInr + amt;     // inr_balance also updates with netamount

                    await creditRecord.update(
                        { cash: newCash, inr_balance: newInr },
                        { transaction }
                    );

                    console.log('[Settlement wallet]');
                    console.log('currentCash:', currentCash, 'newCash:', newCash);
                    console.log('currentInr:', currentInr, 'newInr:', newInr);
                    console.log('netamount :', amt);

                } catch (err) {
                    log.error('[Settlement] Error updating credit record', {
                        user_id,
                        error: err.message
                    });
                    // Let transaction finish or catch rollback
                    throw err; // Ensure rollback on failure
                }
            }
            await UserExposure.destroy({
                where: {
                    user_id,
                    match_id,
                    game_type: market_type,
                    [Op.or]: [
                        { team_name: selection_name },
                        { team_name: `${selection_name}lay` },
                        { team_name: `${selection_name}back` },
                        // placeBet also writes a `<sel>totalstake` bookkeeping row.
                        // Omitting it here orphaned one row per settled fancy bet.
                        { team_name: `${selection_name}totalstake` }
                    ]
                },
                transaction
            });

            // clearExposuresForMatch (which carries the resync) is deliberately
            // NOT used on the FAN path — it would wipe sibling selections in the
            // same market. So resync the total here instead, inside this tx.
            await syncTotalExposure(user_id, transaction);
        });

        // cash_received is never touched during settlement

        await user.increment('net_win', { by: winner ? netamount : 0 });
        await user.increment('profit', { by: netamount });
        await user.increment('net_loss', { by: winner ? 0 : netamount });

        console.log("user", user);

        const walletForClosing = await Wallet.findOne({ where: { user_id: String(user_id) } });
        let closing = walletForClosing ? Number(walletForClosing.cash || 0) : 0;

        await CreditsLedger.create({
            user_id,
            currency: "INR",

            amount: credit,        // REQUIRED (raw +win / -loss)
            reason: "settlement",  // REQUIRED (ex: BET_WIN, BET_LOSS)

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
            bet_id: bet.id || null,
            closing: closing || null,
            category: 'SPORTS'
        });

        console.log("teset credit ledger");
        const fanStake = getStake(bet);
        const fanNetPL = credit - fanStake;

        // if (fanNetPL !== 0) {
        //     try {
        //         await UplineService.processUplineDistribution(user_id, fanNetPL, {
        //             match_id,
        //             market_id: marketId, // fan bets might not have standard marketId?
        //             bet_id: bet_id
        //         });
        //     } catch (err) {
        //         log.error(`[Settlement] Upline FAN distribution failed`, { bet_id, error: err.message });
        //     }
        // }

        // await writeReport({
        //     job_id, bet_id, user_id, eventid, match_id,
        //     game_type: String(game_type || 'FAN').toUpperCase(),
        //     market_type, fancy_name, selection_name,
        //     user_selection_yn: lower(bet_type || '') || null,
        //     resolved_winner,
        //     actual_numeric: null,
        //     rule_op: null,
        //     rule_threshold: null,
        //     credit_amount: credit,
        //     exposures_map: exposuresMap,
        //     api_snapshot: result.meta,
        //     decision_path
        // });

        const resultStatus = winner ? 'won' : 'loss';

        console.log("hello--done");
        // await clearExposuresForMatch(user_id, match_id, market_type);
        await SportsBet.update(
            { status: 'closed', result_status: resultStatus, fixed: 1, updated_at: new Date() },
            { where: { id: bet_id, job_id: String(job_id), status: { [Op.in]: ['open', 'manual'] } } }
        );

        console.log("Hellodone");
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
                eventName: any.match_title || '', marketId: any.match_id, marketName: any.selection_name || '', market_type: any.market_type, game_type: any.game_type, team_one: any.team_one, team_two: any.team_two,
                sport_id: any.sport_id, market_type: any.market_type, game_type: any.game_type
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
        log.info('[SettlementV2] Worker v3.0.0 (AVRKHUB) starting...');
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


