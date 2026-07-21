/**
 * ONE-TIME CLEANUP — void 4 stuck `trap` bets (user 8 / testuser).
 *
 * These were placed 2026-06-05..08 BEFORE the trap FE fix, so they carry bare
 * selections ("High"/"JQK") with no "Card N" prefix. The current resolver can't
 * settle them and the rounds are days old (results unfetchable). They froze
 * ₹250 of `cash` (cash += exposer at placement), which is why testuser can no
 * longer place bets ("Insufficient balance": cash 21.75 < stake).
 *
 * VOID = reverse the placement lock (refund cash), clear exposure, mark bet
 * closed/void. inr_balance is NOT touched (no win/loss). Mirrors the settlement
 * worker's clearExposuresForMatch + TotalExposure recompute exactly.
 */
import "dotenv/config";
import { Sequelize, QueryTypes } from "sequelize";

const BET_IDS = [6, 7, 9, 14];
const USER_ID = 8;

const s = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: "postgres", logging: false }
);

const w = async () =>
  (await s.query('SELECT user_id, inr_balance, cash, cash_received FROM "Wallets" WHERE user_id=:u', {
    replacements: { u: USER_ID }, type: QueryTypes.SELECT,
  }))[0];

(async () => {
  try {
    console.log("BEFORE wallet:", JSON.stringify(await w()));

    const bets = await s.query(
      "SELECT id, event_id, selection, type, exposer, status FROM casino_bets WHERE id IN (:ids) AND user_id=:u AND status IN ('open','processing')",
      { replacements: { ids: BET_IDS, u: USER_ID }, type: QueryTypes.SELECT }
    );
    if (!bets.length) { console.log("Nothing to void (already settled?)."); await s.close(); return; }
    console.log("Voiding bets:", bets.map((b) => `#${b.id} ${b.selection}/${b.type} exposer=${b.exposer}`).join(", "));

    await s.transaction(async (t) => {
      for (const b of bets) {
        // 1) refund: reverse the placement lock (exposer is negative → cash goes up)
        await s.query(
          'UPDATE "Wallets" SET cash = cash - :exp, "updatedAt" = NOW() WHERE user_id = :u',
          { replacements: { exp: b.exposer, u: USER_ID }, transaction: t }
        );
        // 2) clear exposure for that round
        await s.query(
          "DELETE FROM user_exposures WHERE user_id = :u AND match_id = :m",
          { replacements: { u: String(USER_ID), m: String(b.event_id) }, transaction: t }
        );
        // 3) close bet as void
        await s.query(
          "UPDATE casino_bets SET status='closed', result_status='void', credit_amt=0, updated_at=NOW() WHERE id = :id",
          { replacements: { id: b.id }, transaction: t }
        );
      }
    });

    // 4) recompute TotalExposure (same query the settlement worker uses)
    const [exp] = await s.query(
      `SELECT SUM(market_exposure) AS total_exposure FROM (
         SELECT MIN(exposure_amount) AS market_exposure FROM user_exposures
         WHERE user_id = :u AND category <> 'casino' AND game_type IS NOT NULL
           AND game_type NOT IN ('Normal','Ball By Ball','Over By Over','khado','meter','fancy1')
           AND game_type NOT LIKE '%Overs Line%'
           AND NOT (team_name ILIKE '%back%' OR team_name ILIKE '%lay%')
         GROUP BY match_id, game_type, event_id
         UNION ALL
         SELECT exposure_amount AS market_exposure FROM user_exposures
         WHERE user_id = :u AND (category='casino' OR game_type IS NULL
           OR game_type IN ('Normal','Ball By Ball','Over By Over','khado','meter','fancy1')
           OR game_type LIKE '%Overs Line%')
           AND NOT (team_name ILIKE '%back%' OR team_name ILIKE '%lay%')
       ) sub`,
      { replacements: { u: String(USER_ID) }, type: QueryTypes.SELECT }
    );
    const total = parseFloat(exp?.total_exposure) || 0;
    const existing = await s.query("SELECT user_id FROM total_exposures WHERE user_id=:u", {
      replacements: { u: USER_ID }, type: QueryTypes.SELECT,
    }).catch(() => []);
    if (existing.length) {
      await s.query('UPDATE total_exposures SET total_exposure=:te, "updatedAt"=NOW() WHERE user_id=:u',
        { replacements: { te: total, u: USER_ID } });
    } else {
      await s.query('INSERT INTO total_exposures (user_id, total_exposure, "createdAt", "updatedAt") VALUES (:u,:te,NOW(),NOW())',
        { replacements: { u: USER_ID, te: total } }).catch((e) => console.log("(total_exposures upsert skipped:", e.message, ")"));
    }

    console.log("AFTER wallet:", JSON.stringify(await w()));
    console.log("Recomputed TotalExposure:", total);
    const left = await s.query("SELECT count(*)::int c FROM casino_bets WHERE status IN ('open','processing')", { type: QueryTypes.SELECT });
    console.log("Open/processing casino bets remaining:", left[0].c);
  } catch (e) {
    console.error("CLEANUP FAILED:", e.message);
  }
  await s.close();
})();
