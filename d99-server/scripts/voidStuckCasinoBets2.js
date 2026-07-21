/**
 * ONE-TIME CLEANUP — void stuck casino bets that can't auto-settle:
 *   #125 joker120 (round result purged, was a missing-resolver victim)
 *   #193/#194/#195 mogambo "3 Card Total" (placed before the size fix → no <N>,
 *     so the resolver can't match them even though the result is in)
 *
 * VOID = reverse the placement lock (cash += |exposer|, exactly the amount
 * deducted at placement per CasinoService.js:231), clear exposure for the round,
 * mark bet closed/void. inr_balance / P&L are NOT touched. Mirrors the settlement
 * worker's void path (settlementCasinoWorker.js:251-262) and voidStuckTrapBets.js.
 *
 * Run with DRY=1 (default) to preview; DRY=0 to apply.
 */
import "dotenv/config";
import { Sequelize, QueryTypes } from "sequelize";

const DRY = process.env.DRY !== "0";
const TARGETS = (process.env.IDS ? process.env.IDS.split(",").map(Number) : [125, 193, 194, 195]);

const s = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: "postgres", logging: false }
);

const wallets = async (uids) =>
  s.query('SELECT user_id, cash, inr_balance FROM "Wallets" WHERE user_id IN (:u)', {
    replacements: { u: uids }, type: QueryTypes.SELECT,
  });

(async () => {
  try {
    const bets = await s.query(
      "SELECT id, user_id, game_name, selection, type, stake, exposer, event_id, status FROM casino_bets WHERE id IN (:ids) AND status IN ('open','processing')",
      { replacements: { ids: TARGETS }, type: QueryTypes.SELECT }
    );
    if (!bets.length) { console.log("Nothing to void (already settled)."); await s.close(); return; }

    const users = [...new Set(bets.map((b) => Number(b.user_id)))];
    const refundByUser = {};
    for (const b of bets) refundByUser[b.user_id] = (refundByUser[b.user_id] || 0) + -Number(b.exposer);

    console.log(`MODE: ${DRY ? "DRY-RUN (no changes)" : "APPLY"}`);
    console.log("Bets to void:");
    for (const b of bets) console.log(`  #${b.id} user=${b.user_id} ${b.game_name} "${b.selection}"/${b.type} exposer=${b.exposer} → refund +${-Number(b.exposer)}  [${b.status}]`);

    const before = await wallets(users);
    console.log("BEFORE wallets:", JSON.stringify(before));
    for (const u of users) {
      const w = before.find((x) => Number(x.user_id) === u);
      console.log(`  user ${u}: cash ${w?.cash} + refund ${refundByUser[u]} = ${Number(w?.cash) + refundByUser[u]}`);
    }

    if (DRY) { console.log("\nDRY-RUN — no DB changes made. Re-run with DRY=0 to apply."); await s.close(); return; }

    await s.transaction(async (t) => {
      for (const b of bets) {
        await s.query('UPDATE "Wallets" SET cash = cash - :exp, "updatedAt" = NOW() WHERE user_id = :u',
          { replacements: { exp: b.exposer, u: b.user_id }, transaction: t });
        await s.query("DELETE FROM user_exposures WHERE user_id = :u AND match_id = :m",
          { replacements: { u: String(b.user_id), m: String(b.event_id) }, transaction: t });
        await s.query("UPDATE casino_bets SET status='closed', result_status='void', credit_amt=0, updated_at=NOW() WHERE id = :id",
          { replacements: { id: b.id }, transaction: t });
      }
    });

    console.log("AFTER wallets:", JSON.stringify(await wallets(users)));
    const left = await s.query("SELECT id, status, result_status FROM casino_bets WHERE id IN (:ids)",
      { replacements: { ids: TARGETS }, type: QueryTypes.SELECT });
    console.log("Bet states now:", JSON.stringify(left));
    console.log("✅ Voided", bets.length, "bets.");
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await s.close();
  }
})();
