/**
 * Per-runner exposure book for casino tables.
 *
 * WHY: casino placement used to write a SINGLE user_exposures row — the backed
 * runner holding the wallet liability (−stake). The exchange shows a *book*
 * instead: the backed runner carries the potential profit and every other runner
 * in the same market carries the loss. With one row the frontend could only
 * print "−stake" under the selected player and nothing under the others, which
 * is the opposite of what the live site shows.
 *
 * The math is the same one the sports side already uses in
 * sportsbet/sportbetscontroller.js → calculateRunnerExposure, and it matches how
 * casinobet/settlementCasinoWorker.js pays out:
 *   back win  → +stake*(odds−1)   back loss → −stake
 *   lay  win  → +stake            lay  loss → −stake*(odds−1)
 *
 * Rows written for a book market carry game_type = `${gameName}:${marketKey}`.
 * That tag is what makes net exposure treat them as ONE market (worst case =
 * MIN over its runners) instead of summing every row — see
 * helper/netExposureHelper.js. Games absent from both MARKETS and
 * DYNAMIC_MARKETS keep the legacy single-row behaviour, so this is opt-in per
 * game.
 */

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Runner sets mirror how settlementCasinoWorker resolves each game: every group
// below settles independently, so every group is its own book.
// aaa and aaa2 are the same table (same 22 runners, same back/lay layout — only
// the main players take a lay), so they share one definition.
//
// ONLY the main market books across its runners. The live site shows the side
// markets (Even/Odd, Red/Black, Under 7/Over 7, Card A–K) as a plain worst-case
// figure under the selected runner alone, with nothing under its opposite — so
// those selections deliberately stay OUT of this registry and fall through to
// the legacy single-row path in CasinoService.placeBet.
const AAA_MARKETS = [
  { key: "main", runners: ["Amar", "Akbar", "Anthony"] },
];

// teen1 — 1 CARD ONE-DAY. ONLY the main Player/Dealer bet books (back AND lay);
// a TIE returns it, which cannot improve the worst case, so the plain two-runner
// shape holds. The 7Up/7Down pairs stay out on purpose — like the other side
// markets above, the live site prints a single worst-case figure under the
// backed side and nothing under its opposite, which is the legacy single-row
// path in CasinoService.placeBet.
const TEEN1_MARKETS = [
  { key: "main", runners: ["Player", "Dealer"] },
];

// trap — THE TRAP. ONLY the main Player A / Player B bet books across both
// runners, so the backed side shows the profit and the other side shows the
// worst-case loss (the exchange book) instead of the old single worst-case row
// under the backed player alone. Back A → A:+stake*(odds−1), B:−stake; lay is
// the inverse. The Card High/Low and JQK side markets stay OUT of the registry
// on purpose — like aaa/teen1's side markets they keep the legacy single-row
// path (one worst-case figure under the backed side, nothing under its opposite).
const TRAP_MARKETS = [
  { key: "main", runners: ["Player A", "Player B"] },
];

// race20 — RACE TO 20. ONLY the main market books: which King's suit reaches 20
// first. It has FOUR runners, so the backed King shows the profit and the other
// three each show the worst-case loss (−stake) — the exchange book — instead of
// the old single worst-case row under the backed King alone. Back K → K wins:
// +stake*(odds−1); any other King wins: −stake; lay is the inverse. The Win-with
// N, Total points and Total cards markets settle independently (see
// settlementCasinoWorker.resolveRace20) and stay OUT of the registry on purpose —
// like the aaa/trap/teen1 side markets they keep the legacy single-row path (one
// worst-case figure under the backed selection, nothing under any other).
const RACE20_MARKETS = [
  {
    key: "main",
    runners: ["K of spade", "K of heart", "K of club", "K of diamond"],
  },
];

// queen — QUEEN (21-card lane race). ONLY the main market books: four lanes
// ("Total 0"–"Total 3") race to reach the winning total, exactly ONE lane wins
// (settlementCasinoWorker.resolveQueen matches the backed lane's number against
// the winning lane). Four runners, so the backed lane shows the profit and the
// other three each show the worst-case loss (−stake) — the exchange book —
// instead of the old single worst-case row under the backed lane alone. Back a
// lane → that lane wins: +stake*(odds−1); any other lane wins: −stake; lay is
// the inverse.
const QUEEN_MARKETS = [
  { key: "main", runners: ["Total 0", "Total 1", "Total 2", "Total 3"] },
];

// teen6 — TEENPATTI 2.0. ONLY the main Player A / Player B bet books across both
// runners, so the backed side shows the profit and the other side shows the
// worst-case loss (the exchange book) instead of the old single worst-case row
// under the backed player alone. Back A → A:+stake*(odds−1), B:−stake; lay is
// the inverse (settlementCasinoWorker.resolveTeen6 pays exactly one of A/B). The
// side markets — Player A/B Under 21 / Over 22 and the per-card
// suit/odd-even/value bets — settle independently and stay OUT of the registry
// on purpose, keeping the legacy single-row path (one worst-case figure under the
// backed selection, nothing under any other).
const TEEN6_MARKETS = [
  { key: "main", runners: ["Player A", "Player B"] },
];

// btable — BOLLYWOOD CASINO. ONLY the main 6-movie market books (back AND lay):
// exactly one movie wins (settlementCasinoWorker win=1..6 → Don / Amar Akbar
// Anthony / Sahib Bibi Aur Ghulam / Dharam Veer / Kis Kis Ko Pyaar Karoon /
// Ghulam), so the backed movie shows the profit and the other five each show the
// worst-case loss (−stake) — the exchange book — instead of the old single row
// under the backed movie alone. Back Don → Don:+stake*(odds−1), others:−stake;
// lay is the inverse. Names are the feed's exact `nat` values so the stored rows
// line up with what BetTableBtable renders. The Odd/Red/Black/Card/Dulha/Barati
// side markets settle independently and stay OUT of the registry, keeping the
// legacy single-row path (one worst-case figure under the backed selection).
const BTABLE_MARKETS = [
  {
    key: "main",
    runners: [
      "Don",
      "Amar Akbar Anthony",
      "Sahib Bibi Aur Ghulam",
      "Dharam Veer",
      "Kis Kis Ko Pyaar Karoon",
      "Ghulam",
    ],
  },
];

// card32 / card32eu — 32 CARDS A / B. ONLY the main 4-player market books (back
// AND lay): exactly one player wins (settlementCasinoWorker win=1..4 → Player 8 /
// 9 / 10 / 11), so the backed player shows the profit and the other three each
// show the worst-case loss (−stake) — the exchange book — instead of the old
// single row under the backed player alone. Back Player 8 → 8:+stake*(odds−1),
// others:−stake; lay is the inverse. Names are the feed's exact `nat`s. card32eu's
// side markets (Player N Odd/Even, Single N, Any Three Card, Totals, …) don't
// match these runner names, so they stay OUT of the book on the legacy single-row
// path (one worst-case figure under the backed selection).
const CARD32_MARKETS = [
  { key: "main", runners: ["Player 8", "Player 9", "Player 10", "Player 11"] },
];

// poker — POKER 1-DAY. ONLY the main Player A / Player B market books (back AND
// lay): exactly one player wins (settlementCasinoWorker matches winnat to Player
// A/B), so the backed player shows the profit and the other shows the worst-case
// loss (−stake) — the exchange book — instead of a single −stake row under the
// backed player (which read as a wrong liability with nothing on the opponent).
// Back Player A → A:+stake*(odds−1), B:−stake; lay is the inverse. The 2-card /
// 7-card Bonus side bets (nats "Player A 2 card Bonus", …) don't match these
// runner names, so they stay OUT of the book on the legacy single-row path.
const POKER_MARKETS = [
  { key: "main", runners: ["Player A", "Player B"] },
];

// teen9 — TEENPATTI TEST. ONLY the main Winner market books: exactly one animal
// wins (settlementCasinoWorker matches winnerAnimal to Tiger/Lion/Dragon), so the
// backed animal shows the profit and the other two show the worst-case loss
// (−stake) — the exchange book — instead of a single −stake row (which read as a
// wrong liability with nothing on the others). Back Tiger Winner → +stake*(odds−1),
// the others −stake. Runner names are the feed's exact `nat`s ("Tiger Winner", …).
// The per-animal hand side bets (Pair/Flush/Straight/Trio/Straight Flush) are
// independent, so they stay OUT of the book on the legacy single-row path.
const TEEN9_MARKETS = [
  { key: "winner", runners: ["Tiger Winner", "Lion Winner", "Dragon Winner"] },
];

// teen32 — INSTANT TEENPATTI 2.0. A single two-way market: Player A vs Player B
// (exactly one wins; settlement matches selection to winnat). Backing A books
// A:+stake*(odds−1) / B:−stake, lay is the inverse — so the backed player shows
// the profit and the other the worst-case loss, instead of the legacy single
// −stake row that put the loss only under the placed player.
const TEEN32_MARKETS = [
  { key: "main", runners: ["Player A", "Player B"] },
];

const MARKETS = {
  aaa: AAA_MARKETS,
  aaa2: AAA_MARKETS,
  teen1: TEEN1_MARKETS,
  trap: TRAP_MARKETS,
  race20: RACE20_MARKETS,
  queen: QUEEN_MARKETS,
  teen6: TEEN6_MARKETS,
  btable: BTABLE_MARKETS,
  card32: CARD32_MARKETS,
  card32eu: CARD32_MARKETS,
  poker: POKER_MARKETS,
  teen9: TEEN9_MARKETS,
  teen32: TEEN32_MARKETS,
};

const norm = (s) => String(s ?? "").trim().toLowerCase();

/**
 * Row names for a TWO-OUTCOME market that occupies a single table row.
 *
 * Same convention the sports side already uses for its fancy lines
 * (sportsbet/sportbetscontroller.js → `sel + 'back'` / `sel + 'lay'`), so the
 * two sides of the book and the worst case are stored under three rows:
 *
 *   `<sel>`      worst case — the only one that counts toward net exposure
 *   `<sel>back`  P/L if the outcome LANDS   (the back side wins)
 *   `<sel>lay`   P/L if it does NOT land    (the lay side wins)
 *
 * The suffixed rows are display aggregates: helper/netExposureHelper.js drops
 * any team_name matching `%back`/`%lay`, which is exactly why the bare `<sel>`
 * row has to carry the worst case. Note there is no separator before the
 * suffix — matching sports byte for byte.
 */
export const backRunner = (selection) => `${String(selection).trim()}back`;
export const layRunner = (selection) => `${String(selection).trim()}lay`;

// Markets whose runner names carry a per-round value and so cannot be listed
// statically. `test` decides membership. `twoWay` marks the single-row shape
// above, which books through calculateTwoWayBook instead of the runner loop.
// Matched only after the static registry above misses.
const DYNAMIC_MARKETS = {
  dum10: [
    {
      key: "main",
      // "Next Total 240 or More" — the threshold changes every round, and the
      // "it does not happen" outcome is never a selection the punter can click.
      test: (sel) => /^next\s+total\s+\d+\s+or\s+more$/i.test(sel),
      twoWay: true,
    },
  ],
  trio: [
    {
      key: "session",
      // Trio "Session" (Fancy2) is a YES/NO market that takes BOTH back and lay
      // on one row. Booked two-way so a back+lay hedge nets to the worst case
      // (min of the two sides) instead of accumulating each standalone liability.
      test: (sel) => /^session$/i.test(String(sel).trim()),
      twoWay: true,
    },
  ],
};

/**
 * Find the market a selection belongs to.
 * @returns {{key: string, runners?: string[], twoWay?: boolean}|null} null →
 *          game/selection not book-managed, caller keeps the single-row path.
 *          `twoWay` markets carry no runners — book them with
 *          calculateTwoWayBook, everything else with calculateCasinoBook.
 */
export function findCasinoMarket(gameName, selection) {
  const game = norm(gameName);
  const sel = String(selection ?? "").trim();
  if (!sel) return null;

  const markets = MARKETS[game];
  if (markets) {
    const hit = markets.find((m) => m.runners.some((r) => norm(r) === norm(sel)));
    if (hit) return hit;
  }

  const dynamic = DYNAMIC_MARKETS[game];
  if (dynamic) {
    const hit = dynamic.find((m) => m.test(sel));
    if (hit) return { key: hit.key, twoWay: !!hit.twoWay };
  }

  return null;
}

/**
 * Book delta this bet adds to every runner of its market.
 *
 * @param {object} p
 * @param {{key: string, runners: string[]}} p.market
 * @param {string} p.selection - the backed/laid runner
 * @param {number} p.stake
 * @param {number} p.odds     - decimal odds
 * @param {string} p.type     - 'back' | 'lay'
 * @returns {Array<{team_name: string, delta: number}>}
 */
export function calculateCasinoBook({ market, selection, stake, odds, type }) {
  const s = Number(stake) || 0;
  const o = Number(odds) || 0;
  const isLay = norm(type) === "lay";
  const win = round2(s * (o - 1));
  const sel = norm(selection);

  return market.runners.map((runner) => ({
    team_name: runner,
    delta: norm(runner) === sel
      ? (isLay ? -win : win)
      : (isLay ? s : -s),
  }));
}

/**
 * Book for a two-outcome market that occupies one table row.
 *
 * Returns ABSOLUTE values, not deltas: the `<sel>` row holds the worst case,
 * which is a min() over the two sides and so cannot be accumulated one bet at a
 * time. The caller must SET these rows rather than add to them. Both sides are
 * still derived additively from `oldExposures`, so a mixed back+lay book nets
 * out exactly as settlement will pay it.
 *
 * Mirrors settlement: back wins stake*(odds−1) / loses stake; lay is the inverse.
 *
 * @param {object} p
 * @param {string} p.selection
 * @param {number} p.stake
 * @param {number} p.odds        - decimal odds
 * @param {string} p.type        - 'back' | 'lay'
 * @param {Record<string, number>} p.oldExposures - team_name → amount, this
 *        market's existing rows. Absent keys are treated as 0.
 * @returns {Array<{team_name: string, value: number}>}
 */
export function calculateTwoWayBook({ selection, stake, odds, type, oldExposures = {} }) {
  const s = Number(stake) || 0;
  const o = Number(odds) || 0;
  const isLay = norm(type) === "lay";
  const win = round2(s * (o - 1));

  const backKey = backRunner(selection);
  const layKey = layRunner(selection);
  const prev = (k) => Number(oldExposures[k]) || 0;

  // Outcome lands: a back collects its winnings, a lay pays them out.
  const hit = round2(prev(backKey) + (isLay ? -win : win));
  // Outcome does not land: a back loses its stake, a lay collects it.
  const miss = round2(prev(layKey) + (isLay ? s : -s));

  return [
    { team_name: String(selection).trim(), value: round2(Math.min(hit, miss)) },
    { team_name: backKey, value: hit },
    { team_name: layKey, value: miss },
  ];
}

/** game_type tag that groups a book market's rows for net-exposure math. */
export function casinoMarketGameType(gameName, marketKey) {
  return `${norm(gameName)}:${marketKey}`;
}

// ---------------------------------------------------------------------------
// SuperOver / Five Five Cricket family
//
// These games (cricketv3 + superover1/2/3) share the SuperOver market layout: a
// two-team Bookmaker (match winner) plus a batch of independent YES/NO fancy /
// Tie / Fancy1 session lines. Unlike the static book games above, the Bookmaker
// runner NAMES change every round (India/Australia → AUS/IND …), so they cannot
// be listed in MARKETS — the caller resolves them from the live feed at
// placement (see extractBookmakerRunners) and books through calculateCasinoBook.
// The fancy/Tie/Fancy1 lines are each their own two-outcome market, booked
// two-way (worst case = min of the two sides).
// ---------------------------------------------------------------------------
const SUPEROVER_GAMES = new Set(["cricketv3", "superover", "superover2", "superover3"]);

export function isSuperOverFamily(gameName) {
  return SUPEROVER_GAMES.has(norm(gameName));
}

/**
 * Pull the Bookmaker (match-winner) runner names and the round id out of a
 * cached `casino/all-data` feed. Shape-tolerant: the provider body may nest the
 * markets under `.data` and quote t1 as an object or a one-element array.
 *
 * @returns {{ gmid: string|null, runners: string[] }} runners is [] when the
 *          Bookmaker market isn't present yet — caller must handle that.
 */
export function extractBookmakerRunners(feed) {
  const root = feed?.data && (feed.data.t1 || feed.data.t2) ? feed.data : feed || {};
  const t1 = Array.isArray(root.t1) ? root.t1[0] : root.t1;
  const t2 = Array.isArray(root.t2) ? root.t2 : [];
  const gmid = t1?.gmid ?? t1?.mid ?? null;
  const bm = t2.find((m) => Number(m?.dtype) === 2 || norm(m?.gtype) === "match1");
  const runners = (bm?.section || [])
    .map((s) => String(s?.nat ?? "").trim())
    .filter(Boolean);
  return { gmid: gmid != null ? String(gmid) : null, runners };
}

/** Normalized fancy market key so each YES/NO line groups on its own in net
 * exposure (worst case per line, summed) rather than collapsing together. */
export function superOverFancyKey(selection) {
  return `fancy_${norm(selection)}`;
}

export default {
  findCasinoMarket,
  calculateCasinoBook,
  calculateTwoWayBook,
  casinoMarketGameType,
  backRunner,
  layRunner,
  isSuperOverFamily,
  extractBookmakerRunners,
  superOverFancyKey,
};
