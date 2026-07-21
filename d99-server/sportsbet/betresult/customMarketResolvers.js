// =====================================================================
// customMarketResolvers.js
// ---------------------------------------------------------------------
// Result fallbacks for platform-internal markets that the upstream
// avrkhub feed does NOT publish directly. The standard
// fetchResultForEvent matches by (ename, mname); these custom markets
// have neither, so the standard match fails and the bet sits pending
// forever unless an admin declares it manually.
//
// Each resolver here is invoked by the settlement worker AS A FALLBACK,
// only after the standard upstream fetch returns `declared: false`.
// On success they return a synthesized result that
// resolveMobmWinner can consume — winnerName matches the bet's
// team_one or team_two so the rest of the existing settlement flow
// keeps working unchanged. On failure they return null and the bet
// requeues as before.
// =====================================================================

import axios from 'axios';

const AVRKHUB_BASE_URL =
    process.env.AVRKHUB_BASE_URL || 'https://diamond-result-v2.avrkhub.in';

const ax = axios.create({
    timeout: 10_000,
    headers: { 'User-Agent': 'd99-settlement-h2h-fallback/1.0' },
});

// ---------------------------------------------------------------------
// resolveH2HBookmakerFallback
//
// Handles custom "head-to-head over runs" bookmakers like
// "6 Over Bookmaker ( RR VS RCB )" — a market where the user picks one
// of two teams to score more in N overs. The upstream feed only
// publishes the underlying NORMAL session results
// ("6 OVER RUNS RR(RR VS RCB)ADV" with winnerId=97 and
//  "6 OVER RUNS RCB(RR VS RCB)ADV" with winnerId=61). We pull both,
// compare the run totals, and synthesize a winner.
//
// Detection requirements:
//   • market_type contains the word "BOOKMAKER" but is NOT plain
//     "BOOKMAKER" / "BOOKMAKER 2" (those are the standard markets the
//     upstream feed already covers)
//   • market_type contains an "<N> Over" pattern
//   • bet has team_one + team_two whose first uppercase token matches
//     the team prefix used in upstream session marketNames
//
// Return shape mirrors fetchResultForEvent so the caller can use it
// interchangeably:
//   { declared: true, items: [<synthesized market>], meta: {...} }
// or
//   null   (when this resolver does not apply / cannot derive)
// ---------------------------------------------------------------------
export async function resolveH2HBookmakerFallback({
    eventid,
    sport_id,
    market_type,
    team_one,
    team_two,
    logger,
}) {
    const log = logger || console;

    const mt = (market_type || '').toUpperCase().trim();
    if (!mt.includes('BOOKMAKER')) return null;
    if (mt === 'BOOKMAKER' || mt === 'BOOKMAKER 2') return null;

    const overMatch = mt.match(/(\d+(?:\.\d+)?)\s*OVER/);
    if (!overMatch) return null;
    const overNum = overMatch[1];

    // Extract team prefix from "X TO Y Over Runs":
    // first uppercase token, then strip any trailing digits.
    const cleanTeam = (s) => {
        const m = (s || '').toUpperCase().trim().match(/^([A-Z]+\d*)/);
        if (!m) return '';
        return m[1].replace(/\d+$/, ''); // "RR1" → "RR"
    };
    const t1 = cleanTeam(team_one);
    const t2 = cleanTeam(team_two);
    if (!t1 || !t2) return null;

    log.info?.('[H2HFallback] start', {
        eventid, market_type, team_one, team_two, overNum, t1, t2,
    });

    let data;
    try {
        const res = await ax.get(`${AVRKHUB_BASE_URL}/get_result`, {
            params: { gmid: eventid, sid: sport_id || '4' },
        });
        data = typeof res?.data === 'string' ? JSON.parse(res.data) : res.data;
    } catch (e) {
        log.error?.('[H2HFallback] upstream fetch failed', {
            eventid, error: e.message,
        });
        return null;
    }
    const markets = Array.isArray(data?.markets) ? data.markets : [];

    // Find a NORMAL session result for the given team.
    // The team code must appear IMMEDIATELY after "RUN[S]" so we don't
    // accidentally match the parenthetical (e.g. "6 OVER RUNS RR(RR VS
    // RCB)ADV" contains "RCB" in the parens but is the RR-side market).
    // We accept either "RUN RR" / "RUNS RR" / "RUN BHAV RR" patterns.
    const findSession = (teamCode) => {
        const overEsc = overNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match "<over> OVER RUN[S] [BHAV] <team>(...|.|space|end)"
        const re = new RegExp(
            `^${overEsc}\\s*OVER\\s+RUNS?(?:\\s+BHAV)?\\s+${teamCode}(?:\\b|\\(|\\.|$)`,
            'i'
        );
        return markets.find((m) =>
            (m?.mname || '').toUpperCase() === 'NORMAL' &&
            m?.status === 'SETTLE' &&
            m?.winnerId != null &&
            re.test(m?.marketName || '')
        );
    };

    const m1 = findSession(t1);
    const m2 = findSession(t2);
    if (!m1 || !m2) {
        log.warn?.('[H2HFallback] missing one or both session results', {
            eventid, t1, t2, found_t1: !!m1, found_t2: !!m2,
        });
        return null;
    }

    const score1 = parseInt(m1.winnerId, 10);
    const score2 = parseInt(m2.winnerId, 10);

    let winnerName;
    if (score1 > score2) winnerName = team_one;
    else if (score2 > score1) winnerName = team_two;
    else winnerName = 'SUSPENDED'; // exact tie → refund

    log.info?.('[H2HFallback] resolved', {
        eventid, market_type, t1, score1, t2, score2, winnerName,
    });

    return {
        declared: true,
        items: [
            {
                ename: m1.ename || '',
                marketName: market_type,
                mname: market_type,
                winnerName,
                winnerId: null,
                status: 'SETTLE',
            },
        ],
        meta: {
            source: 'h2h_bookmaker_fallback',
            overNum,
            t1, score1, t1_market: m1.marketName,
            t2, score2, t2_market: m2.marketName,
        },
    };
}
