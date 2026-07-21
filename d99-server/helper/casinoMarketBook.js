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
 * helper/netExposureHelper.js. Games absent from MARKETS keep the legacy
 * single-row behaviour, so this is opt-in per game.
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

const MARKETS = {
  aaa: AAA_MARKETS,
  aaa2: AAA_MARKETS,
};

const norm = (s) => String(s ?? "").trim().toLowerCase();

/**
 * Find the market a selection belongs to.
 * @returns {{key: string, runners: string[]}|null} null → game/selection not
 *          book-managed, caller keeps the single-row path.
 */
export function findCasinoMarket(gameName, selection) {
  const markets = MARKETS[norm(gameName)];
  if (!markets) return null;
  const sel = norm(selection);
  if (!sel) return null;
  return markets.find((m) => m.runners.some((r) => norm(r) === sel)) || null;
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

/** game_type tag that groups a book market's rows for net-exposure math. */
export function casinoMarketGameType(gameName, marketKey) {
  return `${norm(gameName)}:${marketKey}`;
}

export default { findCasinoMarket, calculateCasinoBook, casinoMarketGameType };
