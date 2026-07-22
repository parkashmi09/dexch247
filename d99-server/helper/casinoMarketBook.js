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

const MARKETS = {
  aaa: AAA_MARKETS,
  aaa2: AAA_MARKETS,
  teen1: TEEN1_MARKETS,
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

export default {
  findCasinoMarket,
  calculateCasinoBook,
  calculateTwoWayBook,
  casinoMarketGameType,
  backRunner,
  layRunner,
};
