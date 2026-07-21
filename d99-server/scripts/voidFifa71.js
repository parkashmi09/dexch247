/**
 * ONE-TIME — void sports bet #71 (user 10, FIFA "Winning Group" / Group A, back ₹2000).
 * Unmappable to the result feed (bet market doesn't exist there — feed only has
 * per-group winners). VOID = refund the stake (reverse the bet_placed -2000 lock),
 * clear the sports exposure book for the round, close the bet, write a refund ledger.
 * inr_balance / P&L untouched. Net exposure recomputes via the net-exposure worker.
 *
 * DRY=1 (default) previews; DRY=0 applies.
 */
import "dotenv/config";
import { Sequelize, QueryTypes } from "sequelize";

const DRY = process.env.DRY !== "0";
const BET_ID = 71, USER = "10", STAKE = 2000;
const MATCH_ID = "7095364794627", EVENTID = "895976973";

const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER,
  process.env.DB_PASS || process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: "postgres", logging: false });

(async () => {
  try {
    const bet = (await s.query('SELECT id, status, stake_amount, bet_type, market_type FROM "SportsBet" WHERE id=:id', { replacements: { id: BET_ID }, type: QueryTypes.SELECT }))[0];
    if (!bet || !["open", "pending"].includes(String(bet.status))) { console.log("Bet not open (already handled?):", JSON.stringify(bet)); await s.close(); return; }
    const w = (await s.query('SELECT cash, inr_balance FROM "Wallets" WHERE user_id=:u', { replacements: { u: USER }, type: QueryTypes.SELECT }))[0];
    const expRows = (await s.query('SELECT count(*) c, coalesce(sum(exposure_amount),0) s FROM user_exposures WHERE user_id=:u AND match_id=:m', { replacements: { u: USER, m: MATCH_ID }, type: QueryTypes.SELECT }))[0];
    const newCash = Number(w.cash) + STAKE;

    console.log(`MODE: ${DRY ? "DRY-RUN" : "APPLY"}`);
    console.log(`  bet #${BET_ID} ${bet.bet_type} "${bet.market_type}" stake=${bet.stake_amount} status=${bet.status}`);
    console.log(`  refund +${STAKE}: cash ${w.cash} -> ${newCash}  (inr_balance ${w.inr_balance} unchanged)`);
    console.log(`  clear ${expRows.c} exposure rows (sum ${expRows.s})`);

    if (DRY) { console.log("\nDRY-RUN — no changes. Re-run with DRY=0 to apply."); await s.close(); return; }

    await s.transaction(async (t) => {
      await s.query('UPDATE "Wallets" SET cash = cash + :a, "updatedAt"=NOW() WHERE user_id=:u', { replacements: { a: STAKE, u: USER }, transaction: t });
      await s.query("DELETE FROM user_exposures WHERE user_id=:u AND match_id=:m", { replacements: { u: USER, m: MATCH_ID }, transaction: t });
      await s.query("UPDATE \"SportsBet\" SET status='closed', result_status='refunded', updated_at=NOW() WHERE id=:id", { replacements: { id: BET_ID }, transaction: t });
      await s.query(`INSERT INTO credits_ledger (user_id, bet_id, currency, amount, reason, description, eventid, match_id, market_type, sport_id, netamount, closing, category, created_at)
        VALUES (:u, :id, 'INR', :a, 'bet_void', :d, :ev, :m, :mt, '1', :a, :c, 'SPORTS', NOW())`,
        { replacements: { u: USER, id: BET_ID, a: STAKE, d: "FIFA Winning Group / Group A — void (unmappable to result feed)", ev: EVENTID, m: MATCH_ID, mt: bet.market_type, c: newCash }, transaction: t });
    });

    const after = (await s.query('SELECT cash, inr_balance FROM "Wallets" WHERE user_id=:u', { replacements: { u: USER }, type: QueryTypes.SELECT }))[0];
    const st = (await s.query('SELECT status, result_status FROM "SportsBet" WHERE id=:id', { replacements: { id: BET_ID }, type: QueryTypes.SELECT }))[0];
    console.log("AFTER:", JSON.stringify(after), "bet:", JSON.stringify(st));
    console.log("✅ Voided #71.");
  } catch (e) { console.error("ERROR:", e.message); } finally { await s.close(); }
})();
