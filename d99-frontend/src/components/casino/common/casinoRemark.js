import { CASINO_TYPES } from "../tables/tableCasinoUtils.js";

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Resolve a loose game token (value OR label) coming from an account-statement
 * remark into the canonical gameType value used by CasinoResultContent.
 *   "trap"      -> "trap"
 *   "The Trap"  -> "trap"
 */
export function resolveCasinoGameType(token) {
  if (!token) return "";
  const t = String(token).trim().toLowerCase();
  const byValue = CASINO_TYPES.find((g) => g.value.toLowerCase() === t);
  if (byValue) return byValue.value;
  const byLabel = CASINO_TYPES.find((g) => g.label.toLowerCase() === t);
  if (byLabel) return byLabel.value;
  const n = norm(t);
  const byNorm = CASINO_TYPES.find((g) => norm(g.value) === n || norm(g.label) === n);
  if (byNorm) return byNorm.value;
  return t; // already a raw value like "trap"
}

/** Human-friendly label for a gameType value. */
export function casinoGameLabel(gameType) {
  const found = CASINO_TYPES.find((g) => g.value === gameType);
  return found ? found.label : gameType;
}

/**
 * Parse a casino account-statement remark/description into its parts.
 *   "trap / R.No : 135260605163327"
 *     -> { gameType: "trap", mid: "135260605163327", label: "The Trap", raw: "trap" }
 * Returns null when there is no round id (i.e. the row isn't a casino bet).
 */
export function parseCasinoRemark(description) {
  if (!description) return null;
  const roundMatch = String(description).match(/R\.?\s*No\.?\s*[:\-]?\s*([0-9]+)/i);
  const mid = roundMatch ? roundMatch[1] : "";
  if (!mid) return null;
  const namePart = String(description).split("/")[0].trim();
  const gameType = resolveCasinoGameType(namePart);
  return { gameType, mid, label: casinoGameLabel(gameType), raw: namePart };
}
