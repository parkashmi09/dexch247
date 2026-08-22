// Exercises liveOddsGuard against fixtures modelled on real fancy bets.
// Run: node sportsbet/liveOddsGuard.test.mjs
process.env.NODE_ENV = 'test';

const SRV = new URL('../', import.meta.url).href.replace(/\/$/, '');

// Import the service, then monkey-patch the singleton the guard will hold.
let FEED = null;
const svcMod = await import(`${SRV}/services/CricketService.js`);
svcMod.default.GetMatchPrivateData = async () => {
  if (FEED instanceof Error) throw FEED;
  return FEED;
};

const { verifyLiveOdds } = await import(`${SRV}/sportsbet/liveOddsGuard.js`);
const { extractFeedUpdatedMs } = svcMod;

let pass = 0, fail = 0;
const check = (name, got, want) => {
  const ok = got === want;
  ok ? pass++ : fail++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${ok ? '' : `  (got ${got}, want ${want})`}`);
};

// --- fixture: "W Smeed run" YES @ line 35, rate 100 (bet 626) --------------
const now = Date.now();
const feed = (over = {}) => ({
  success: true,
  data: [{
    mid: '707375327441', mname: 'NORMAL', gtype: 'fancy', status: 'OPEN',
    section: [{
      sid: '1', nat: 'W Smeed run(SB vs BP)adv', gstatus: 'OPEN',
      odds: [
        { otype: 'back', oname: 'back1', tno: 0, odds: 35, size: 100 },
        { otype: 'lay',  oname: 'lay1',  tno: 0, odds: 33, size: 100 },
      ],
    }],
    ...over.market,
  }],
  feed_updated_ms: now - 1000,
  fetched_at_ms: now,
  ...over.root,
});

const bet = (o = {}) => ({
  eventid: '920268851', sid: '4', match_id: '707375327441',
  mname: 'NORMAL', gtype: 'fancy', market_type: 'Normal',
  selection_name: 'W Smeed run(SB vs BP)adv', bet_type: 'yes',
  odds: 35, size: 100, ...o,
});

console.log('\n── freshness ─────────────────────────────────────────────');
FEED = feed(); check('1s old  → accept', (await verifyLiveOdds(bet())).ok, true);

FEED = feed({ root: { feed_updated_ms: now - 4900 } });
check('4.9s old → accept (under 5s)', (await verifyLiveOdds(bet())).ok, true);

FEED = feed({ root: { feed_updated_ms: now - 10000 } });
let r = await verifyLiveOdds(bet());
check('10s old → REJECT', r.ok, false);
check('  code = stale_odds', r.code, 'stale_odds');

FEED = feed({ root: { feed_updated_ms: now + 2000 } });
check('stamp 2s in future → accept (clock skew)', (await verifyLiveOdds(bet())).ok, true);

FEED = feed({ root: { feed_updated_ms: null } });
check('no stamp → accept (fail open)', (await verifyLiveOdds(bet())).ok, true);

console.log('\n── suspension ────────────────────────────────────────────');
FEED = feed({ market: { status: 'SUSPENDED' } });
r = await verifyLiveOdds(bet()); check('market SUSPENDED → REJECT', r.code, 'market_suspended');

FEED = feed({ market: { gtype: 'match1', status: 'SUSPENDED' } });
check('bookmaker stale SUSPENDED → accept', (await verifyLiveOdds(bet())).ok, true);

FEED = feed(); FEED.data[0].section[0].gstatus = 'BALL RUNNING';
r = await verifyLiveOdds(bet()); check('runner BALL RUNNING → REJECT', r.code, 'ball_running');

FEED = feed(); FEED.data[0].section[0].gstatus = 'SUSPENDED';
r = await verifyLiveOdds(bet()); check('runner SUSPENDED → REJECT', r.code, 'runner_suspended');

console.log('\n── line / rate ───────────────────────────────────────────');
FEED = feed(); check('line 35 on ladder → accept', (await verifyLiveOdds(bet())).ok, true);

FEED = feed();
r = await verifyLiveOdds(bet({ odds: 19 }));
check('stale line 19 (past-post) → REJECT', r.code, 'line_mismatch');

FEED = feed();
r = await verifyLiveOdds(bet({ size: 90 }));
check('rate 90 vs live 100 → REJECT', r.code, 'rate_mismatch');

FEED = feed();
check('NO side uses lay ladder (33)', (await verifyLiveOdds(bet({ bet_type: 'no', odds: 33 }))).ok, true);

FEED = feed();
r = await verifyLiveOdds(bet({ bet_type: 'no', odds: 35 }));
check('NO at back price 35 → REJECT', r.code, 'line_mismatch');

console.log('\n── fail-open paths ───────────────────────────────────────');
FEED = new Error('ECONNREFUSED');
check('feed down → accept', (await verifyLiveOdds(bet())).ok, true);

FEED = { success: true, data: [] };
check('empty feed → accept', (await verifyLiveOdds(bet())).ok, true);

FEED = feed();
check('unknown market → accept', (await verifyLiveOdds(bet({ match_id: 'nope', mname: 'nope', market_type: 'nope' }))).ok, true);

FEED = feed();
check('unknown runner → accept', (await verifyLiveOdds(bet({ selection_name: 'nobody' }))).ok, true);

console.log('\n── timestamp parsing ─────────────────────────────────────');
const IST = (5 * 60 + 30) * 60 * 1000;
const t1 = extractFeedUpdatedMs({ lastUpdatedAt: '29/07/2026, 20:46:06' }, null);
check('IST wall-clock "29/07/2026, 20:46:06"', t1, Date.UTC(2026, 6, 29, 20, 46, 6) - IST);
check('ISO with Z', extractFeedUpdatedMs({ updatedAt: '2026-07-29T15:16:06Z' }, null), Date.parse('2026-07-29T15:16:06Z'));
check('epoch ms', extractFeedUpdatedMs({ ts: 1785000000000 }, null), 1785000000000);
check('epoch sec', extractFeedUpdatedMs({ ts: 1785000000 }, null), 1785000000000);
check('en-US AM/PM "7/22/2026 1:44:00 AM"', extractFeedUpdatedMs({ lutm: '7/22/2026 1:44:00 AM' }, null), Date.UTC(2026, 6, 22, 1, 44, 0) - IST);
check('missing → null', extractFeedUpdatedMs({ foo: 1 }, null), null);
check('falls back to newest market stamp',
  extractFeedUpdatedMs({}, [{ updatedAt: '2026-07-29T10:00:00Z' }, { updatedAt: '2026-07-29T11:00:00Z' }]),
  Date.parse('2026-07-29T11:00:00Z'));

console.log(`\n${'─'.repeat(58)}\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
