// Global error handlers to catch crashes

process.on('uncaughtException', err => {
    console.error('[ResultCron] Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('[ResultCron] Unhandled Rejection:', err);
});


import fs from 'fs';
import path from 'path';

import crypto from 'crypto';
import http from 'http';
import https from 'https';
import axios from 'axios';
import SportEventResultScan from '../../model/user/SportsEventResultScan.js';
import SportsEventResultSummary from '../../model/user/SportsEventResultSummary.js';
import SportsEventSettlementJob from '../../model/user/SportsEventSettlementJobs.js';
import SportsBetResultCache from '../../model/user/SportsBetResultCache.js';
import Tokens from '../../model/user/Tokens.js';
import SportsBet from '../../model/user/SportsBet.js'
import { Op } from 'sequelize';
import { resolveH2HBookmakerFallback } from './customMarketResolvers.js';

console.log('[ResultCron] Process started');



// ---------- logging ----------
const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true';
const LOG_DIR = process.env.RESULTS_CRON_LOG_DIR || path.join(process.cwd(), 'sportsbet/betresult/logs');
const LOG_BASENAME = 'results-cron';
function ensureLogDir() { try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (_) { } }
ensureLogDir();
function currentLogPath() {
    const d = new Date(), yyyy = d.getFullYear(), mm = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return path.join(LOG_DIR, `${LOG_BASENAME}-${yyyy}-${mm}-${dd}.log`);
}
function writeLog(level, msg, ctx = {}) {
    const ctxStr = Object.keys(ctx).length ? ' ' + JSON.stringify(ctx) : '';
    const line = `[${new Date().toISOString()}] [${level}] ${msg}${ctxStr}\n`;
    if (level === 'ERROR') console.error(msg, ctx); else console.log(msg, ctx);
    try { fs.appendFileSync(currentLogPath(), line, 'utf8'); } catch (e) { console.error('Log write failed:', e.message); }
}
const log = {
    info: (m, c = {}) => writeLog('INFO', m, c),
    error: (m, c = {}) => writeLog('ERROR', m, c),
    debug: (m, c = {}) => { if (DEBUG) writeLog('DEBUG', m, c); },
};

// ---------- env ----------
const RESULTS_API_BASE = process.env.RESULTS_API_BASE || 'https://apilords.codefactory.games/api';
const AVRKHUB_BASE_URL = process.env.AVRKHUB_BASE_URL || 'https://diamond-result-v2.avrkhub.in';
const SETTLEMENT_VERSION = process.env.SETTLEMENT_VERSION || 'v2'; // v1 = old Diamond, v2 = AVRKHUB

const API_TIMEOUT_MS = +(process.env.API_TIMEOUT_MS || 30000);
const MAX_CONCURRENT_API = +(process.env.MAX_CONCURRENT_API || 3);
const USER_BATCH_CONCURRENCY = +(process.env.USER_BATCH_CONCURRENCY || 5);
const RESULTS_REQUEUE_MS = +(process.env.RESULTS_REQUEUE_MS || 120000);
const CRON_INTERVAL_MS = + 60000;
const SUMMARY_KEEP_PER_EVENT = +(process.env.SUMMARY_KEEP_PER_EVENT || 5);
const SUMMARY_RETENTION_DAYS = +(process.env.SUMMARY_RETENTION_DAYS || 7);
const BET_CACHE_TTL_DAYS = +(process.env.BET_CACHE_TTL_DAYS || 14);
const RESULTS_MAX_FETCH_RETRIES = +(process.env.RESULTS_MAX_FETCH_RETRIES || 6);
const RESULTS_RETRY_BASE_MS = +(process.env.RESULTS_RETRY_BASE_MS || 500);
const RESULTS_FORCE_IPV4 = process.env.RESULTS_FORCE_IPV4 === '1' || process.env.RESULTS_FORCE_IPV4 === 'true';
const RESULTS_DISABLE_KEEPALIVE = process.env.RESULTS_DISABLE_KEEPALIVE === '1' || process.env.RESULTS_DISABLE_KEEPALIVE === 'true';
const RESULTS_RATE_LIMIT_MS = +(process.env.RESULTS_RATE_LIMIT_MS || 250); // actively used

// ---------- sid (sport id) resilience ----------
// AVRKHUB keys results by gmid + the betfair-style sport id ("sid"/etid):
//   correct sid            -> 200 + markets
//   valid but wrong sport  -> 404 "Result data not created yet"
//   invalid/garbage sid    -> 400 "Invalid sid parameter"
// The placebet payload occasionally carries a wrong/garbage sid (e.g. a marketId
// like 87500) which gets stored as SportsBet.sport_id. AVRKHUB then 400s forever
// and the bet never settles. When a bet's sid is garbage we fall back across the
// known sport ids (cricket first — this platform is cricket-dominant) until one
// returns data for the gmid. Override via RESULTS_SID_FALLBACKS="4,1,2".
const RESULTS_SID_FALLBACKS = (process.env.RESULTS_SID_FALLBACKS || '4,1,2')
    .split(',').map(s => Number(String(s).trim())).filter(n => Number.isInteger(n) && n > 0);
const KNOWN_VALID_SIDS = new Set([1, 2, 4, ...RESULTS_SID_FALLBACKS]);
function isValidSid(sid) {
    const n = Number(sid);
    return Number.isInteger(n) && n > 0 && KNOWN_VALID_SIDS.has(n);
}

// ---------- axios client ----------
const httpAgent = new http.Agent({ keepAlive: !RESULTS_DISABLE_KEEPALIVE, family: RESULTS_FORCE_IPV4 ? 4 : undefined });
const httpsAgent = new https.Agent({ keepAlive: !RESULTS_DISABLE_KEEPALIVE, family: RESULTS_FORCE_IPV4 ? 4 : undefined });

const ax = axios.create({
    timeout: API_TIMEOUT_MS,
    httpAgent, httpsAgent,
    validateStatus: () => true,
    headers: {
        'Accept': 'application/json',
        'User-Agent': `results-cron/1.0 (+node ${process.version})`
    }
});

function formatName(name) {
    return name.replace(/\s+/g, '').toLowerCase();
}

// ---------- utils ----------
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function jitter(ms) { return Math.round(ms * (1 + Math.random() * 0.25)); }
function uuidv4() { return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'); }
function peekBody(data, max = 200) {
    try {
        const s = typeof data === 'string' ? data : JSON.stringify(data);
        return s.slice(0, max);
    } catch { return ''; }
}
function parseRetryAfter(h) {
    if (!h) return null;
    const n = Number(h);
    if (!Number.isNaN(n)) return Math.max(0, Math.round(n * 1000)); // seconds → ms
    const d = Date.parse(h);
    return Number.isNaN(d) ? null : Math.max(0, d - Date.now());
}

// per-attempt transport fallback: after 3rd attempt, disable keep-alive + force IPv4, add Connection: close
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

// ---------- schema ----------

async function ensureTables() {
    await SportEventResultScan.sync();
    await SportsEventResultSummary.sync();
    await SportsEventSettlementJob.sync();
    await SportsBetResultCache.sync();
    log.info('[ResultCron] tables ensured.');
}
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


// Fetch result — AVRKHUB GET API (v2) or old Diamond POST API (v1)
async function fetchResultForEvent(eventid, eventName, marketId, marketName, sport_id, market_type, gameType, team_one, team_two) {
    log.debug('[ResultCronV2] fetchResultForEvent start', { eventid, eventName, market_type, version: SETTLEMENT_VERSION });

    const maxAttempts = RESULTS_MAX_FETCH_RETRIES || 6;
    const useAvrkhub = SETTLEMENT_VERSION !== 'v1';
    const url = useAvrkhub
        ? `${AVRKHUB_BASE_URL}/get_result`
        : `${RESULTS_API_BASE}/result/get-result`;

    // Ordered sids to try. A known-valid sid is used as-is (single call,
    // unchanged behaviour). A garbage/invalid sid falls back across known sports.
    let sidCandidates;
    if (!useAvrkhub) sidCandidates = [sport_id];
    else if (isValidSid(sport_id)) sidCandidates = [Number(sport_id)];
    else {
        sidCandidates = [...RESULTS_SID_FALLBACKS];
        log.info('[ResultCronV2] bad sid on bet — using fallbacks', { eventid, sport_id, sidCandidates });
    }

    return apiQueue.push(async () => {
        let sidIdx = 0;
        let sid = sidCandidates[sidIdx];
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await globalRateLimit();

                const res = useAvrkhub
                    ? await ax.get(url, { params: { gmid: eventid, sid: sid || '4' }, ...buildPerAttemptConfig(attempt) })
                    : await ax.post(url, { event_id: eventid, sid }, buildPerAttemptConfig(attempt));

                log.debug('[ResultCronV2] response', { eventid, sid, attempt, status: res.status });

                if (res.status === 200) {
                    const data = typeof res?.data === 'string' ? JSON.parse(res.data) : res.data;
                    // guard: the 200 must actually be for this gmid
                    if (useAvrkhub && data?.gmid && String(data.gmid) !== String(eventid)) {
                        log.error('[ResultCronV2] gmid mismatch — trying next sid', { eventid, sid, got: data?.gmid });
                        if (sidIdx < sidCandidates.length - 1) { sid = sidCandidates[++sidIdx]; continue; }
                        return { declared: false, items: [] };
                    }
                    const markets = Array.isArray(data?.markets) ? data.markets : [];

                    let matchedMarket;
                    const inputMarketName = normalizeText(marketName);
                    const inputMarketType = normalizeMarketType(market_type);

                    if (market_type === 'TIED_MATCH' || market_type === 'Tied Match') {
                        matchedMarket = markets.find(m =>
                            normalizeMarketType(m?.mname) === inputMarketType
                        );
                    } else if (gameType === 'FAN' && (Number(sport_id) === 1 || Number(sport_id) === 2)) {
                        // Soccer/tennis FAN markets: upstream marketName holds the "PLAYER VS PLAYER"
                        // (or "YES VS NO") runner string, NOT the selection, so marketName===selection
                        // never fires. The feed is gmid-scoped, so match on event (ename) + mname; the
                        // upstream ename is often abbreviated, so fall back to a UNIQUE mname match.
                        const inputEventName = normalizeText(eventName);
                        matchedMarket = markets.find(m =>
                            normalizeText(m?.ename) === inputEventName &&
                            normalizeMarketType(m?.mname) === inputMarketType
                        );
                        if (!matchedMarket) {
                            const cands = markets.filter(m => normalizeMarketType(m?.mname) === inputMarketType);
                            if (cands.length === 1) matchedMarket = cands[0];
                        }
                    } else if (gameType === 'FAN') {
                        // FAN: m.marketName is the fancy label
                        matchedMarket = markets.find(m =>
                            normalizeText(m?.marketName) === inputMarketName &&
                            normalizeMarketType(m?.mname) === inputMarketType
                        );
                        if (!matchedMarket) {
                            // CRICKETCASINO session markets ("X Number"): upstream marketName == mname
                            // (the session title), outcome in winnerName. The bet's market_type IS that
                            // title, so match by mname + event. Gated to gtype CRICKETCASINO and to a
                            // UNIQUE candidate, so generic mnames (NORMAL, ODDEVEN, …) are never mis-declared.
                            const inputEventName = normalizeText(eventName);
                            const sessionCands = markets.filter(m =>
                                String(m?.gtype || '').toUpperCase() === 'CRICKETCASINO' &&
                                normalizeMarketType(m?.mname) === inputMarketType &&
                                normalizeText(m?.ename) === inputEventName
                            );
                            if (sessionCands.length === 1) matchedMarket = sessionCands[0];
                        }
                    } else {
                        // MO/BM: AVRKHUB uses m.ename for event title
                        const inputEventName = normalizeText(eventName);
                        const inputMname = normalizeMarketType(market_type);

                        if (useAvrkhub) {
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
                            if (!matchedMarket) {
                                matchedMarket = markets.find(m =>
                                    normalizeText(m?.ename) === inputEventName &&
                                    normalizeMarketType(m?.mname) === inputMname
                                );
                            }
                            if (!matchedMarket) {
                                matchedMarket = markets.find(m =>
                                    normalizeText(m?.marketName) === inputEventName &&
                                    normalizeMarketType(m?.mname) === inputMname
                                );
                            }
                        } else {
                            matchedMarket = markets.find(m =>
                                normalizeText(m?.marketName) === inputEventName &&
                                normalizeMarketType(m?.mname) === inputMname
                            );
                        }
                    }

                    // VOID = declared, settlement worker handles refund
                    const declared = matchedMarket?.status === 'SETTLE' || matchedMarket?.status === 'VOID';
                    log.debug('[ResultCronV2] matchedMarket', { eventid, market_type, gameType, declared, status: matchedMarket?.status });

                    return {
                        declared,
                        items: matchedMarket ? [matchedMarket] : [],
                        meta: { success: data?.success, source: useAvrkhub ? 'avrkhub' : 'diamond', gmid: data?.gmid, resolvedSid: sid }
                    };
                }

                if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
                    const ra = parseRetryAfter(res.headers?.['retry-after']);
                    const wait = ra != null ? ra : jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
                    log.debug('[ResultCronV2] retry backoff', { eventid, attempt, status: res.status, waitMs: wait });
                    await sleep(wait);
                    continue;
                }

                // 400 = invalid sid, 404 = valid sid but no data for this gmid.
                // If more fallback sids remain, advance and retry with a fresh
                // attempt budget; otherwise give up (legit "not declared yet").
                if ((res.status === 400 || res.status === 404) && sidIdx < sidCandidates.length - 1) {
                    log.debug('[ResultCronV2] sid rejected — trying next', { eventid, sid, status: res.status });
                    sid = sidCandidates[++sidIdx];
                    attempt = 0; // for-loop ++ makes it 1 again
                    continue;
                }

                return { declared: false, items: [] };
            } catch (e) {
                const wait = jitter(RESULTS_RETRY_BASE_MS * Math.pow(2, attempt - 1));
                const isTimeout = e.code === 'ECONNABORTED' || e.message.includes('timeout');
                
                if (isTimeout) {
                    log.error('[ResultCronV2] fetchResultForEvent TIMEOUT', { eventid, attempt, error: e.message });
                } else {
                    log.error('[ResultCronV2] fetchResultForEvent error', { eventid, attempt, error: e.message, code: e.code });
                }

                if (attempt < maxAttempts) {
                    log.info('[ResultCronV2] retrying after backoff...', { eventid, waitMs: wait });
                    await sleep(wait);
                }
            }
        }

        log.debug('[ResultCronV2] fetchResultForEvent exhausted', { eventid, sidCandidates });
        return { declared: false, items: [] };
    });
}





// ---------- queries ----------
// async function getUserToken(uid) {
//     try {
//         const token = await Tokens.findOne({ userId: uid });
//         return token?.value || null;
//     } catch (e) {
//         log.error('[ResultCron] getUserToken error', { uid, error: e.message });
//         return null;
//     }
// }
// async function getUsersWithOpenBets() {
//     try {
//         const users = await SportsBet.aggregate([
//             { $match: { status: 'open', game_type: { $in: ['MO', 'BM', 'FAN'] }, eventid: { $ne: null } } },
//             { $group: { _id: '$user_id' } },
//             { $project: { user_id: '$_id', _id: 0 } }
//         ]);
//         log.debug('[ResultCron] getUsersWithOpenBets', { count: users.length });
//         return users || [];
//     } catch (e) {
//         log.error('[ResultCron] getUsersWithOpenBets error', { error: e.message });
//         return [];
//     }
// }

// async function getOpenBetsForUser(userId) {
//     try {
//         const bets = await SportsBet.findAll({
//             where: {
//                 user_id: userId,
//                 status: 'open',
//                 game_type: { [Op.in]: ['MO', 'BM', 'FAN'] },
//                 eventid: { [Op.ne]: null }
//             },
//             attributes: ['id', 'user_id', 'game_type', 'bet_type', 'selection_name', 'odds', 'stake_amount', 'match_title', 'match_id', 'fancy_name', 'eventid', 'created_at'],
//             order: [['created_at', 'ASC']]
//         });
//         log.debug('[ResultCron] getOpenBetsForUser', { userId, openBets: bets.length });
//         return bets || [];
//     } catch (e) {
//         log.error('[ResultCron] getOpenBetsForUser error', { userId, error: e.message });
//         return [];
//     }
// }

// ---------- pruning ----------
async function pruneSummaries() {
    try {
        const cutoff = new Date(Date.now() - SUMMARY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
        await SportsEventResultSummary.destroy({ where: { recorded_at: { [Op.lt]: cutoff } } });
        log.debug('[ResultCron] pruneSummaries done');
    } catch (e) {
        log.error('[ResultCron] pruneSummaries error', { error: e.message });
    }
}
async function pruneBetCache() {
    try {
        const cutoff = new Date(Date.now() - BET_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
        await SportsBetResultCache.destroy({ where: { recorded_at: { [Op.lt]: cutoff } } });
        log.debug('[ResultCron] pruneBetCache done');
    } catch (e) {
        log.error('[ResultCron] pruneBetCache error', { error: e.message });
    }
}

// ---------- main run ----------
async function runOnce() {
    log.info('[ResultCron-NEW-JOB] ===== Run start =====');

    try {
        await ensureTables();

        // Fetch all open bets (one big list)
        const allBets = await SportsBet.findAll({
            where: {
                status: { [Op.in]: ['open', 'manual'] },
                game_type: { [Op.in]: ['MO', 'BM', 'FAN'] },
                eventid: { [Op.ne]: null },
                job_id: null   // jinke paas already job hai unhe dobara queue mat karo (double-settle rok)
            },
            attributes: ['id', 'user_id', 'game_type', 'bet_type', 'selection_name', 'odds', 'stake_amount', 'match_title', 'match_id', 'fancy_name', 'eventid', 'created_at', 'sport_id', 'market_type', 'status', 'team_one', 'team_two'],
            order: [['created_at', 'ASC']]
        });

        if (!allBets || !allBets.length) {
            log.info('[ResultCron] no open bets.');
            return;
        }
        log.debug('[ResultCron] fetched open bets', { count: allBets.length });

        console.log("main", allBets);

        // Process each bet sequentially
        for (const b of allBets) {
            try {
                // Basic sanity checks
                if (!b.eventid) {
                    log.debug('[ResultCron] skipping bet with no eventid', { betId: b.id });
                    continue;
                }



                const userId = b?.user_id;
                const eid = b?.eventid;
                const eventName = b?.match_title || '';
                const gameType = (b?.game_type || '').toUpperCase();
                const marketId = b?.match_id || b?.eventid;
                const sport_id = b?.sport_id;
                const market_type = b?.market_type

                let marketName = b?.selection_name || '';

                if (gameType === "FAN") {
                    marketName = b?.selection_name || '';
                }
                else if (gameType === "MO") {
                    marketName = 'Match_Odds';
                }
                else if (gameType === "BM") {
                    marketName = 'BookMaker';
                }



                log.debug('[ResultCron] processing single bet', { userId, betId: b.id, eid, eventName, gameType, marketId, marketName, market_type });
                console.log('[ResultCron] processing single bet', { userId, betId: b.id, eid, eventName, gameType, marketId, marketName, market_type });
                let declared = false;
                let result_meta = null;
                const name = b.fancy_name || '';
                const formattedName = formatName(name);

                if (b.status === 'manual') {
                    declared = true;
                } else {
                    const res = await fetchResultForEvent(eid, eventName, marketId, marketName, sport_id, market_type, gameType, b.team_one, b.team_two);
                    log.debug(`[ResultCron] fetchResultForEvent result`, { betId: b.id, res });
                    declared = res?.declared;
                    result_meta = res?.meta || null;

                    // self-heal: if a fallback sid resolved this gmid, persist it so
                    // future runs query AVRKHUB with the correct sid (no re-probing).
                    const goodSid = res?.meta?.resolvedSid;
                    if (goodSid && String(goodSid) !== String(sport_id)) {
                        try {
                            await b.update({ sport_id: goodSid });
                            log.info('[ResultCron] healed bad sport_id', { betId: b.id, from: sport_id, to: goodSid });
                        } catch (e) {
                            log.error('[ResultCron] sport_id heal failed', { betId: b.id, error: e.message });
                        }
                    }

                    // Custom h2h bookmaker fallback (see customMarketResolvers.js).
                    // Only triggers when standard upstream match failed AND the
                    // bet is on a custom over-based bookmaker market like
                    // "6 Over Bookmaker ( RR VS RCB )". Settlement worker will
                    // re-derive the same fallback when it processes the queued
                    // job — this branch only exists so the cron actually QUEUES
                    // the job (it skips queueing when declared=false).
                    if (!declared && gameType === 'BM') {
                        const fb = await resolveH2HBookmakerFallback({
                            eventid: eid,
                            sport_id,
                            market_type,
                            team_one: b.team_one,
                            team_two: b.team_two,
                            logger: log,
                        });
                        if (fb?.declared) {
                            log.info('[ResultCron] H2H bookmaker fallback declared', { betId: b.id, ...fb.meta });
                            declared = true;
                            result_meta = fb.meta;
                        }
                    }
                }

                log.debug(`[ResultCron] ${gameType} result for bet`, { betId: b.id, declared });
                console.log(`[ResultCron] ${gameType} result for bet`, { betId: b.id, declared });







                const counts = { total: 1 };
                const summary = { user_id: userId, eventid: eid, declared, counts, result_meta, sections: { bets: [b] }, checked_at: new Date() };

                // upsert scan row for this user+event
                try {
                    await SportEventResultScan.upsert({
                        user_id: userId,
                        eventid: eid,
                        declared,
                        counts: JSON.stringify(counts),
                        checked_at: new Date()
                    }, { conflictFields: ['user_id', 'eventid'] });
                    log.debug('[ResultCron] scan upserted (single bet)', { user: userId, eventid: eid, declared, betId: b.id, counts });
                } catch (e) {
                    log.error('[ResultCron] scan insert fail (single bet)', { betId: b.id, eventid: eid, error: e.message });
                }

                // insert a summary row
                try {
                    await SportsEventResultSummary.create({
                        user_id: summary.user_id,
                        eventid: summary.eventid,
                        declared: summary.declared,
                        counts: JSON.stringify(counts),
                        result_meta: result_meta ? JSON.stringify(result_meta) : null,
                        sections: JSON.stringify(summary.sections),
                        recorded_at: new Date()
                    });
                    log.debug('[ResultCron] summary inserted (single bet)', { eventid: eid, betId: b.id });
                } catch (e) {
                    log.error('[ResultCron] summary insert fail (single bet)', { betId: b.id, eventid: eid, error: e.message, declared });
                }

                // If declared, queue a settlement job for this single bet
                if (declared) {
                    const betIdStr = b.id != null ? String(b.id) : uuidv4();
                    const betType = (b.bet_type || '').toString().toLowerCase() || 'unknown';
                    const payload = { user_id: userId, eventid: eid, bet_id: betIdStr, bet_type: betType, bet: b, match_over: declared };
                    const jobId = uuidv4();
                    const runAfter = new Date();
                    console.log("Payload for Job", payload);
                    try {
                        const [job, created] = await SportsEventSettlementJob.upsert(
                            {
                                job_id: jobId,              // optional; if you leave it undefined, PG will use default uuid
                                user_id: userId,
                                eventid: eid,
                                bet_id: betIdStr,
                                bet_type: betType,
                                status: "queued",
                                priority: 5,
                                run_after: runAfter,
                                payload,                    // JSONB: you can pass the object directly
                                created_at: new Date(),
                                updated_at: new Date(),
                            },
                            {
                                conflictFields: ["user_id", "eventid", "bet_id"],
                                returning: true,
                            }
                        );

                        console.log({ created, job: job?.toJSON?.() });

                        const realJobId = job?.job_id || jobId;
                        console.log("Real Job ID", realJobId);
                        console.log("DOne");

                        // Update only this specific bet row to reference the returned job_id.

                        try {
                            console.log("insertion sstarted");

                            await SportsBet.update(
                                { job_id: realJobId },
                                {
                                    where: {
                                        id: b.id,
                                        user_id: userId,
                                        eventid: eid,
                                        status: { [Op.in]: ["open", "manual"] },
                                    },
                                }
                            );

                            // maybe other code after this...
                        } catch (err) {
                            console.error("[ResultCron] job insert fail for bet (single)", {
                                eventid: eid,
                                betId: b.id,
                                betType: b.bet_type,
                                error: err.message,
                                stack: err.stack,   // <-- IMPORTANT
                            });
                        }
                        console.log("Insertion done");

                        log.info('[ResultCron] job queued + single bet updated', { user_id: userId, eventid: eid, betId: betIdStr, betType, jobId: realJobId, declared, runAfter });
                    } catch (e) {
                        log.error('[ResultCron] job insert fail for bet (single)', { eventid: eid, betId: b.id, betType, error: e.message });
                    }
                }

            } catch (err) {
                log.error('[ResultCron] error processing single bet', { betId: b.id, error: err.message });
                // continue to next bet
            }
        } // end for each bet

        // pruning (keep existing behavior)
        try { await pruneSummaries(); } catch (e) { log.error('prune summaries fail', { error: e.message }); }
        try { await pruneBetCache(); } catch (e) { log.error('prune cache fail', { error: e.message }); }

    } catch (e) {
        log.error('[ResultCron] fatal', { error: e.message });
    } finally {
        log.info('[ResultCron] ===== Run end =====');
    }
}

function startCron() { log.info('[ResultCron] Scheduler starting...', { everyMs: CRON_INTERVAL_MS }); runOnce(); setInterval(runOnce, CRON_INTERVAL_MS); }




// Always start the scheduler when this script is run
startCron();

// export functions
export { startCron, runOnce };