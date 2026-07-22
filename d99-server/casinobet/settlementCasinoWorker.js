// settlementCasinoWorker.js
// Run with PM2: pm2 start settlementCasinoWorker.js --name settlement-casino

import axios from "axios";
import sequelize from "../config/db.js";
import CasinoBet from "../model/user/casino.js";
import Wallet from "../model/admin/Wallet.js";
import UserExposure from "../model/user/UserExposure.js";
import { trace } from "bullmq";
import CreditsLedger from "../model/user/CreditsLedger.js";
import User from "../model/user/User.js";
import Staff from "../model/admin/Staff.js";
import WalletService from "../services/walletService.js";
// cash_received is never touched during settlement
import { QueryTypes } from "sequelize";
import UserNetExposure from "../model/user/UserNetExposure.js";
import { syncTotalExposure } from "../helper/netExposureHelper.js";
import { emitBalanceUpdate } from "../utils/socketUtils.js";


const BASE_URL =
  process.env.CASINO_RESULTS_API_BASE ||
  "https://apilords.codefactory.games/api";

const DETAIL_PATH =
  process.env.CASINO_DETAIL_RESULTS_PATH ||
  "/casino/casino/detail-results";
const INTERVAL = Number(process.env.SETTLE_INTERVAL_MS || 2500);

axios.defaults.timeout = Number(process.env.SETTLE_HTTP_TIMEOUT_MS || 10000);

// ----------------- Generic helpers -----------------

const toKey = (v) => (v == null ? "" : String(v));

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// 1 Card Meter charges 2% on winnings only (game rules). Losses are charged in full.
const CASINO_WIN_COMMISSION = 0.02;

async function clearExposuresForMatch(user_id, match_id, transaction) {
  try {
    await UserExposure.destroy({
      where: {
        user_id: String(user_id),
        match_id: String(match_id)
      },
      transaction,
    });
    console.log("[Settlement] All exposures cleared for match", { user_id, match_id });
  } catch (e) {
    console.error("[Settlement] clearExposuresForMatch failed", {
      user_id,
      match_id,
      error: e.message,
    });
  }
}

// ---------- Helpers ----------

// rdesc example:
// "Player B#A : One Pair  |  B : One Pair"
function parsePoker20Hands(rdesc) {
  const parts = (rdesc || "").split("#");
  const handPart = (parts[1] || "").trim(); // "A : One Pair  |  B : One Pair"

  const aMatch = handPart.match(/A\s*:\s*([A-Za-z ]+?)(\||$)/i);
  const bMatch = handPart.match(/B\s*:\s*([A-Za-z ]+?)(\||$)/i);

  const aHand = aMatch ? aMatch[1].trim().toUpperCase() : "";
  const bHand = bMatch ? bMatch[1].trim().toUpperCase() : "";

  return { aHand, bHand };
}

function normalize(str) {
  return (str || "").trim().toUpperCase();
}

// ---------- ✅ Core Winner Checker ----------

// Frontend (BetTablePoker20.findItem) sends the selection already carrying the
// player side:
//   Winner market → "Player A" / "Player B"
//   Hand market   → "<Hand> A" / "<Hand> B"  e.g. "One Pair A", "Full House B"
// rdesc = "Player A#A : Full House  |  B : Two Pair" (each player's best hand).
// (Older code required player_name === winnat, which never held because the
//  frontend sets player_name to the full nat — so every bet always lost.)
function isPoker20Winner(selection, rdesc, winnat) {
  if (!selection) return false;

  const sel = normalize(selection);
  const winNat = normalize(winnat); // "PLAYER A" / "PLAYER B"

  // Winner market: selection IS the player.
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    return sel === winNat;
  }

  // Hand market: "<HAND> A" / "<HAND> B" — trailing token is the side.
  const m = sel.match(/^(.*)\s+([AB])$/);
  if (!m) return false;
  const handWanted = m[1].trim(); // "ONE PAIR", "FULL HOUSE", ...
  const side = m[2];              // "A" / "B"

  const { aHand, bHand } = parsePoker20Hands(rdesc);
  const playerHand = normalize(side === "A" ? aHand : bHand);

  return handWanted === playerHand;
}
/**
 * Common settlement flow:
 * - winner === true → credit wallet, clear exposure, mark bet won & closed
 * - winner === false → just mark bet lost & closed
 */
function parseTeen8Winners(str) {
  return (str || "")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean); // ["1","6","7"]
}

// Pair Plus: "1 : Pair | 6 : Flush | 7 : Pair"
function parseTeen8PairPlus(str) {
  const map = {};
  if (!str) return map;

  const entries = str.split("|");
  for (const entry of entries) {
    const [seatRaw, handRaw] = entry.split(":");
    if (!seatRaw || !handRaw) continue;

    const seat = seatRaw.trim();               // "1", "6", "7"
    const hand = handRaw.trim().toUpperCase(); // "PAIR", "FLUSH", etc.

    if (!seat) continue;
    map[seat] = hand;
  }
  return map;
}

// Totals: "1 : 23 | 2 : 28 | 3 : 23 | 4 : 29~5 : 14 | 6 : 19 | 7 : 18 | 8 : 22~Dealer : 17"
function parseTeen8Totals(str) {
  const map = {};
  if (!str) return map;

  const sections = str.split("~");
  for (const section of sections) {
    const part = section.trim();
    if (!part) continue;

    const tokens = part.split("|");
    for (const token of tokens) {
      const [labelRaw, valRaw] = token.split(":");
      if (!labelRaw || !valRaw) continue;

      const label = labelRaw.trim().toUpperCase(); // "1", "2", "DEALER", etc.
      const val = Number(valRaw.trim());
      if (Number.isNaN(val)) continue;

      map[label] = val; // map["1"] = 23, map["DEALER"] = 17
    }
  }

  return map;
}

// Helper to recursively update bal_up for all staff ancestors
// async function updateStaffAncestorsBalUp(startStaffId, amount, transaction) {
//   let currentId = startStaffId;
//   console.log(`[DEBUG] updateStaffAncestorsBalUp called for startStaffId: ${startStaffId}, amount: ${amount}`);
//   while (currentId) {
//     // 1. Update current staff
//     await Staff.increment(
//       { bal_up: amount },
//       { where: { staff_id: currentId }, transaction }
//     );
//     // ... rest of loop
//     const staff = await Staff.findByPk(currentId, {
//       attributes: ['parent_id'],
//       transaction
//     });

//     if (!staff || !staff.parent_id) {
//       break;
//     }
//     currentId = staff.parent_id;
//   }
// }

// Helper to update bal_up for ONLY the direct parent staff
async function updateStaffParentBalUp(staffId, amount, transaction) {
  if (!staffId) return;
  console.log(`[DEBUG] updateStaffParentBalUp called for staffId: ${staffId}, amount: ${amount}`);

  await Staff.increment(
    { bal_up: amount },
    { where: { staff_id: staffId }, transaction }
  );
}

/**
 * @param {object} bet
 * @param {boolean|"void"} winner
 * @param {number|null} payoutRate  multiplier games (1 Card Meter) settle at
 *        stake × rate instead of stake × odds; null for every other game.
 */
async function settleBetCommon(bet, winner, payoutRate = null) {
  const transaction = await sequelize.transaction();

  try {
    // 🔐 1. LOCK BET ROW FIRST
    const lockedBet = await CasinoBet.findOne({
      where: { id: bet.id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    // ❌ Already settled → EXIT (IDEMPOTENT)
    if (!lockedBet || lockedBet.status === "closed") {
      await transaction.rollback();
      return { success: true, skipped: true };
    }

    const {
      user_id,
      stake,
      odds,
      event_id,
      selection,
      type,
      mtype,
      id,
    } = lockedBet;

    const stakeNum = Number(stake || 0);
    const oddsNum = Number(odds || 0);

    let amt = 0;
    let resultStatus = "lost";

    // Cash this bet locked at placement (exposer is stored negative). Book
    // markets lock a MARGINAL worst case, which a hedge can make negative —
    // i.e. the bet released cash — so this is signed, not an absolute value.
    const lockedAmount = -Number(lockedBet.exposer || 0);

    // 🔐 2. LOCK WALLET AFTER BET LOCK
    const wallet = await Wallet.findOne({
      where: { user_id: String(user_id) },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!wallet) {
      throw new Error(`[Settlement] Wallet not found for user ${user_id}`);
    }

    /* =======================
       ♻️ VOID / REFUND CASE
       Resolver returned "void" → market is un-settleable from the casino feed
       (e.g. cricketv3 over-runs session fancy). Reverse the placement lock by
       returning the locked liability to `cash`; leave `inr_balance`, P/L, and
       staff balances untouched (no win/loss). Mirrors scripts/voidStuckTrapBets.js
       + admin /void. MUST be checked before `if (winner)` because the string
       "void" is truthy and would otherwise be paid out as a win.
    ======================= */
    if (winner === "void") {
      resultStatus = "void";
      amt = 0; // credit_amt stays 0 for a void (matches manual void convention)

      // exposer is the (negative) liability locked at placement: cash += exposer.
      // Refund = reverse it: cash -= exposer  (i.e. cash += |exposer|).
      const exposerNum = Number(lockedBet.exposer || 0);
      await wallet.update(
        { cash: Number(wallet.cash || 0) - exposerNum },
        { transaction }
      );
    }

    /* =======================
       ✅ WIN CASE
    ======================= */
    else if (winner) {
      let netProfit;

      if (payoutRate) {
        // MULTIPLIER GAME (1 Card Meter): the win is stake × point difference,
        // not stake × odds, and commission is charged on the winnings only.
        // Placement locked the worst case (max rate × stake), so the cash credit
        // is that whole lock back plus the actual winnings.
        netProfit = round2(stakeNum * payoutRate * (1 - CASINO_WIN_COMMISSION));
        amt = round2(lockedAmount + netProfit);
      } else {
        // Cash credit on win = the lock that was taken at placement + winnings.
        //
        // The lock comes from the stored `exposer` rather than being re-derived
        // from stake/odds, because book-managed markets (aaa, dum10 — see
        // helper/casinoMarketBook.js) lock the MARGINAL worst case, not each
        // bet's standalone liability. Re-deriving it would credit back more
        // cash than was ever taken on a hedged book. For every other game the
        // stored exposer IS the standalone liability, so this is identical to
        // the old `stake*odds` form:
        //   back      lock=stake             + stake*(odds-1) = stake*odds
        //   lay       lock=stake*(odds-1)    + stake          = stake*odds
        //   lay fancy lock=stake             + stake          = stake*2
        //
        // BACK always pays the locked decimal odds. The old `fancy → stake*2`
        // path mis-paid any casino back bet whose odds ≠ 2.0 (lowercase-etype
        // "fancy" games — teen20, poker20, …). Casino `b` is always the decimal
        // multiplier, so stake×(odds−1) is universally correct for back.
        netProfit = (type === "lay") ? stakeNum : round2(stakeNum * (oddsNum - 1));
        amt = round2(lockedAmount + netProfit);
      }

      resultStatus = "won";

      await wallet.update(
        {
          cash: Number(wallet.cash || 0) + amt,
          inr_balance: Number(wallet.inr_balance || 0) + netProfit,
        },
        { transaction }
      );

      await User.increment(
        {
          net_win: netProfit,
          profit: netProfit,
        },
        { where: { user_id }, transaction }
      );

      const userRow = await User.findOne({
        where: { user_id },
        transaction,
      });

      await CreditsLedger.create(
        {
          user_id,
          currency: "INR",
          amount: amt,
          reason: "BET_WIN",
          description: `${type === "lay" ? "Lay" : "Back"} ${selection} win`,
          eventid: event_id,
          match_id: selection,
          market_type: mtype,
          netamount: netProfit,
          profit: netProfit,
          bet_id: id,
          closing: Number(wallet.cash),
          category: 'CASINO',
        },
        { transaction }
      );

      if (userRow.parent_staff_id) {
        await updateStaffParentBalUp(userRow.parent_staff_id, netProfit, transaction);
      }
    }

    /* =======================
       ❌ LOSS CASE
    ======================= */
    else {
      let cashAdjust = 0;

      if (payoutRate) {
        // MULTIPLIER GAME (1 Card Meter): the loss is stake × point difference.
        // Placement locked the worst case (max rate × stake), so whatever the
        // actual loss did not consume must go back to cash.
        amt = round2(stakeNum * payoutRate);
        cashAdjust = round2(lockedAmount - amt);
      } else if (type === "lay") {
        amt = mtype === "fancy" ? stakeNum : round2(stakeNum * (oddsNum - 1));
        cashAdjust = round2(lockedAmount - amt);
      } else {
        amt = stakeNum;
        cashAdjust = round2(lockedAmount - amt);
      }

      resultStatus = "lost";

      // Deduct inr_balance on loss (cash already deducted at placement)
      await wallet.update(
        {
          inr_balance: Number(wallet.inr_balance || 0) - amt,
          ...(cashAdjust ? { cash: Number(wallet.cash || 0) + cashAdjust } : {}),
        },
        { transaction }
      );

      await User.increment(
        {
          net_loss: -amt,
          profit: -amt,
        },
        { where: { user_id }, transaction }
      );

      const userRow = await User.findOne({
        where: { user_id },
        transaction,
      });

      await CreditsLedger.create(
        {
          user_id,
          currency: "INR",
          amount: amt,
          reason: "BET_LOSS",
          description: `${type === "lay" ? "Lay" : "Back"} ${selection} loss`,
          eventid: event_id,
          match_id: selection,
          market_type: mtype,
          netamount: -amt,
          loss: -amt,
          bet_id: id,
          closing: Number(wallet.cash),
          category: 'CASINO',
        },
        { transaction }
      );

      if (userRow.parent_staff_id) {
        await updateStaffParentBalUp(userRow.parent_staff_id, -amt, transaction);
      }
    }

    // 🧹 Clear ALL exposures for this match/round (safe after settlement)
    await clearExposuresForMatch(
      user_id,
      event_id,
      transaction
    );

    // ✅ 3. FINAL BET CLOSE (ONLY ONCE)
    await lockedBet.update(
      {
        status: "closed",
        result_status: resultStatus,
        credit_amt: amt,
        settled_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    // 📢 4. RECALCULATE & EMIT TOTAL EXPOSURE (Real-time UI sync)
    //
    // Use the SHARED calculation (syncTotalExposure -> calculateUserNetExposure),
    // exactly like placeBet does. The inline query that used to live here lacked
    // the LEAST(...,0) clamp and the `%totalstake` exclusion, so the exposure it
    // pushed over the socket could differ from what /net-exposures returns on a
    // page refresh — the header would flicker to one number, then correct itself
    // to another after F5.
    try {
      const netExposure = await syncTotalExposure(user_id);

      // Keep user_net_exposure immediately consistent (the bg worker also syncs
      // every ~1s) so a refresh right after settlement shows the same value.
      await UserNetExposure.upsert({ user_id: Number(user_id), net_exposure: netExposure });

      // 📢 Emit final balance & exposure update via Socket (re-fetch fresh wallet after commit)
      const freshWallet = await Wallet.findOne({ where: { user_id: String(user_id) }, raw: true });
      if (freshWallet) {
        await emitBalanceUpdate(user_id, {
          inr_balance: freshWallet.inr_balance,
          cash: freshWallet.cash,
          exposure: netExposure
        });
      }
    } catch (e) {
      console.error("[Settlement] Failed to emit balance update", e.message);
    }

    return { success: true };
  } catch (err) {
    await transaction.rollback();
    console.error("[Settlement] settleBetCommon failed:", err.message);
    throw err;
  }
}




// ----------------- Teen20C-specific helpers -----------------

function parseRdesc(rdesc) {
  const parts = (rdesc || "").split("#");
  const [mainStr, baccaratStr, totalStr, pairPlusStr, colorStr] = [
    parts[0] || "",
    parts[1] || "",
    parts[2] || "",
    parts[3] || "",
    parts[4] || "",
  ];
  return { mainStr, baccaratStr, totalStr, pairPlusStr, colorStr };
}

function parseABNumbers(str) {
  if (!str) return { a: null, b: null };
  const aMatch = str.match(/A\s*:\s*([0-9]+)/i);
  const bMatch = str.match(/B\s*:\s*([0-9]+)/i);
  return {
    a: aMatch ? Number(aMatch[1]) : null,
    b: bMatch ? Number(bMatch[1]) : null,
  };
}

function parseABColors(str) {
  if (!str) return { aColor: null, bColor: null };
  const aMatch = str.match(/A\s*:\s*([A-Za-z ]+)/i);
  const bMatch = str.match(/B\s*:\s*([A-Za-z ]+)/i);
  return {
    aColor: aMatch ? aMatch[1].trim() : null,
    bColor: bMatch ? bMatch[1].trim() : null,
  };
}

/**
 * Core teen20c winner logic:
 * Takes only: selection, rdesc, winnat, winCode
 * Returns: true (win), false (lose)
 */
function isTeen20CWinner(selection, rdesc, winnat, winCode) {
  if (!selection) return false;
  const sel = selection.trim().toUpperCase();
  const { baccaratStr, totalStr, pairPlusStr, colorStr } = parseRdesc(rdesc);
  const winNatNorm = (winnat || "").trim().toUpperCase();

  // 1) Main Player A / Player B
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    return sel === winNatNorm;
  }

  // 2) 3 Baccarat A / B
  if (sel === "3 BACCARAT A" || sel === "3 BACCARAT B") {
    const { a, b } = parseABNumbers(baccaratStr);
    if (a == null || b == null) return false;
    return sel.endsWith("A") ? a > b : b > a;
  }

  // 3) Total A / Total B
  if (sel === "TOTAL A" || sel === "TOTAL B") {
    const { a, b } = parseABNumbers(totalStr);
    if (a == null || b == null) return false;
    return sel.endsWith("A") ? a > b : b > a;
  }

  // 4) Pair Plus A / Pair Plus B
  if (sel === "PAIR PLUS A" || sel === "PAIR PLUS B") {
    const pp = (pairPlusStr || "").trim();

    if (!pp) return false;

    // Pair Plus pays for a pair OR BETTER (pair, two pair, trio, straight, flush,
    // full house, straight flush). The provider lists "A : <hand>" / "B : <hand>"
    // only for a qualifying side (a high-card side is omitted, or shown as
    // "High Card"). So a side wins iff it has a listed hand that isn't High Card.
    // (Old rule only matched "Pair" → a Flush/Trio/Straight wrongly lost — confirmed
    // live: teen20b rdesc "A : Flush".)
    const side = sel.endsWith("A") ? "A" : "B";
    const m = pp.match(new RegExp(`${side}\\s*:\\s*([A-Za-z ]+?)\\s*(\\||$)`, "i"));
    if (!m) return false;
    const hand = m[1].trim().toUpperCase();
    return hand.length > 0 && hand !== "HIGH CARD";
  }

  // 5) BLACK / RED A / B
  if (
    sel === "BLACK A" ||
    sel === "BLACK B" ||
    sel === "RED A" ||
    sel === "RED B"
  ) {
    const { aColor, bColor } = parseABColors(colorStr);
    const aC = (aColor || "").toUpperCase();
    const bC = (bColor || "").toUpperCase();

    if (sel === "BLACK A") return aC.includes("BLACK");
    if (sel === "BLACK B") return bC.includes("BLACK");
    if (sel === "RED A") return aC.includes("RED");
    if (sel === "RED B") return bC.includes("RED");
  }

  return false;
}


// teenmuf
async function resolveTeenMuf(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teenmuf missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,   // teenmuf
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teenmuf no result yet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";

  const sel = selection.trim().toUpperCase();
  const winNatNorm = winnat.trim().toUpperCase();

  // rdesc format:
  // "Player B#Player A#Player A (A : 0  |  B : 1)"
  const parts = rdesc.split("#");

  const top9Part = (parts[1] || "").trim().toUpperCase();        // ✅ FIXED HERE
  const baccaratPart = (parts[2] || "").trim();                 // ✅ M Baccarat part

  let winner = false;

  // ✅ 1) MAIN PLAYER A / PLAYER B → match with winnat
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    winner = sel === winNatNorm;
  }

  // ✅ 2) TOP 9 A / TOP 9 B → match with parts[1]
  else if (sel === "TOP 9 A" || sel === "TOP 9 B") {
    if (sel === "TOP 9 A") {
      winner = top9Part === "PLAYER A";
    } else {
      winner = top9Part === "PLAYER B";
    }
  }

  // ✅ 3) M BACCARAT A / M BACCARAT B → use the provider's declared winner.
  // baccaratPart = "Player A (A : 1 | B : 3)"; the leading name is the M Baccarat
  // winner. teenmuf is Muflis (lower value wins) — confirmed live: "Player A" won
  // with A:1 < B:3 — so a numeric a>b comparison was WRONG. Match the leading name.
  else if (sel === "M BACCARAT A" || sel === "M BACCARAT B") {
    const mb = normalize(baccaratPart);
    winner = sel.endsWith("A") ? mb.startsWith("PLAYER A") : mb.startsWith("PLAYER B");
  }

  // ✅ Default: lose
  else {
    winner = false;
  }

  console.log("[Settlement] teenmuf resolve ✅", {
    bet_id: bet.id,
    selection,
    rdesc,
    winnat,
    top9Part,
    baccaratPart,
    winner,
  });

  return winner; // ✅ true or false only
}
// teen9
async function resolveTeen9(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teen9 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,   // teen9
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teen9 no result yet", bet.id);
    return null;
  }

  // Selections: "<Animal> Winner" / "<Animal> <Hand>" (Animal = Tiger/Lion/Dragon;
  // Hand = Pair/Flush/Straight/Trio/Straight Flush). rdesc = "<WinnerAnimal>#<hand|->"
  // e.g. "Tiger#-" (Tiger won, high-card) or "Lion#Pair". The winning hand applies
  // to the winning animal only (rdesc carries no per-animal hands).
  const parts = (t1.rdesc || "").split("#");
  const winnerAnimal = normalize(parts[0] || t1.winnat || ""); // "TIGER"
  // hand may be plain ("Pair") or prefixed ("T : Pair") — strip a leading "X :".
  const winnerHand = normalize((parts[1] || "").replace(/^[A-Za-z]\s*:\s*/, "").trim()); // "PAIR" or "-"

  const sel = normalize(selection);
  const m = sel.match(/^(TIGER|LION|DRAGON)\s+(.+)$/);
  if (!m) {
    console.warn("[Settlement] teen9 unknown selection", { bet_id: bet.id, selection });
    return null;
  }
  const animal = m[1];
  const market = m[2].trim(); // "WINNER" or a hand name

  let winner;
  if (animal !== winnerAnimal) {
    winner = false; // wrong animal → always lose
  } else if (market === "WINNER") {
    winner = true; // this animal won the round
  } else {
    winner = market === winnerHand; // animal won AND its hand matches
  }

  console.log("[Settlement] teen9 resolve ✅", {
    bet_id: bet.id, selection: sel, winnerAnimal, winnerHand, animal, market, winner,
  });

  return winner;
}

// teen8

async function resolveTeen8(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teen8 missing event_id/selection", bet.id);
    return null; // keep as processing, retry later
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,  // 'teen8'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teen8 no t1 data yet for bet", bet.id);
    return null; // no result yet
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || ""; // "1,6,7" but we don't actually need it because we have winnersPart

  const sel = selection.trim().toUpperCase();

  // rdesc format example:
  // "1  6  7 #1 : Pair | 6 : Flush | 7 : Pair#1 : 23 | 2 : 28 | 3 : 23 | 4 : 29~5 : 14 | 6 : 19 | 7 : 18 | 8 : 22~Dealer : 17#Any Colour : Yes"
  const parts = rdesc.split("#");

  const winnersPart = (parts[0] || "").trim();  // "1  6  7 "
  const pairPlusPart = (parts[1] || "").trim();  // "1 : Pair | 6 : Flush | 7 : Pair"
  const totalsPart = (parts[2] || "").trim();  // "1 : 23 | ... ~ ... ~Dealer : 17"
  const anyPart = (parts[3] || "").trim();  // "Any Colour : Yes" etc.

  const winnerSeats = parseTeen8Winners(winnersPart); // ["1","6","7"]
  const pairPlusMap = parseTeen8PairPlus(pairPlusPart);
  const totalsMap = parseTeen8Totals(totalsPart);

  const dealerTotal =
    totalsMap["DEALER"] !== undefined ? totalsMap["DEALER"] : null;

  let winner = false;

  // 1) Player N
  // selection like: "Player 1" .. "Player 8"
  if (/^PLAYER\s+\d+$/.test(sel)) {
    const seat = sel.split(/\s+/)[1]; // "1"
    winner = winnerSeats.includes(seat);
  }

  // 2) Pair Plus N
  // selection like: "Pair Plus 1" .. "Pair Plus 8"
  else if (/^PAIR PLUS\s+\d+$/.test(sel)) {
    const seat = sel.split(/\s+/)[2]; // "1"
    const hand = pairPlusMap[seat];   // "PAIR", "FLUSH", "STRAIGHT", "TRIO", etc.
    // 👉 Rule you gave: player 1 pair won, 6 flush won, 7 pair won
    //    So if ANY hand exists for that seat, that seat's Pair Plus is winner
    winner = Boolean(hand);
  }

  // 3) Total N
  // selection like: "Total 1" .. "Total 8"
  else if (/^TOTAL\s+\d+$/.test(sel)) {
    const seat = sel.split(/\s+/)[1];        // "1"
    const seatTotal = totalsMap[seat];       // e.g. 23
    if (seatTotal != null && dealerTotal != null) {
      winner = seatTotal > dealerTotal;      // beat dealer
    } else {
      winner = false;
    }
  }

  // 4) Any Colour / Any Straight / Any Trio / Any Straight Flush
  else if (sel === "ANY COLOUR") {
    winner = /ANY\s+COLOUR\s*:\s*YES/i.test(anyPart);
  } else if (sel === "ANY STRAIGHT") {
    winner = /ANY\s+STRAIGHT\s*:\s*YES/i.test(anyPart);
  } else if (sel === "ANY TRIO") {
    winner = /ANY\s+TRIO\s*:\s*YES/i.test(anyPart);
  } else if (sel === "ANY STRAIGHT FLUSH") {
    winner = /ANY\s+STRAIGHT\s+FLUSH\s*:\s*YES/i.test(anyPart);
  } else {
    // unknown selection naming: treat as lost
    winner = false;
  }

  console.log("[Settlement] teen8 resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    winnersPart,
    pairPlusPart,
    totalsPart,
    anyPart,
    winnerSeats,
    dealerTotal,
    winner,
  });

  return winner; // true or false
}


/**
 * Teen20C resolver: only decides true/false/null.
 * - returns true  => winner
 * - returns false => loser
 * - returns null  => cannot decide yet (no t1 / no result)
 */
async function resolveTeen20C(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id) {
    console.warn("[Settlement] teen20c bet has no event_id, skipping", bet.id);
    return null; // keep as 'processing'
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'teen20c'
    mid: event_id,   // match/round id
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teen20c no t1 data yet for bet", bet.id);
    return null; // allow worker to retry later
  }

  const rdesc = t1.rdesc;
  const winnat = t1.winnat;
  const winCode = t1.win;

  const winner = isTeen20CWinner(selection, rdesc, winnat, winCode);

  console.log("[Settlement] teen20c resolve", {
    bet_id: bet.id,
    selection,
    rdesc,
    winnat,
    winCode,
    winner,
  });

  return winner; // true | false
}

//poker20

async function resolvePoker20(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] poker20 missing data", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,   // "poker20"
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] poker20 no result yet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc;
  const winnat = t1.winnat;

  const winner = isPoker20Winner(selection, rdesc, winnat);

  console.log("[Settlement] poker20 resolve ✅", {
    bet_id: bet.id,
    selection,
    winnat,
    rdesc,
    winner,
  });

  return winner;
}

//teen 41
//helper


// rdesc example: "Player B#B : Under 21(16)"
function isTeen41Winner(selection, rdesc, winnat) {
  if (!selection) return false;

  const sel = normalize(selection);    // "PLAYER A", "PLAYER B UNDER 21", ...
  const winNat = normalize(winnat);       // "PLAYER A" / "PLAYER B"

  const parts = (rdesc || "").split("#");
  const mainPart = normalize(parts[0] || "");   // "PLAYER B"
  const sidePart = normalize(parts[1] || "");   // "B : UNDER 21(16)"

  // 1) Main winner: Player A / Player B
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    return sel === winNat;
  }

  // 2) Player B Under 21
  if (sel === "PLAYER B UNDER 21") {
    const match = sidePart.match(/B\s*:\s*(UNDER|OVER)\s*21\s*\((\d+)\)/i);
    if (!match) return false;

    const kind = match[1].toUpperCase();  // UNDER / OVER
    const val = Number(match[2]);        // e.g. 16

    return kind === "UNDER" && val < 21;
  }

  // 3) Player B Over 21
  if (sel === "PLAYER B OVER 21") {
    const match = sidePart.match(/B\s*:\s*(UNDER|OVER)\s*21\s*\((\d+)\)/i);
    if (!match) return false;

    const kind = match[1].toUpperCase();
    const val = Number(match[2]);        // e.g. 23

    return kind === "OVER" && val > 21;
  }

  // Any unknown selection → lose
  return false;
}


async function resolveTeen41(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teen41 missing event_id/selection", bet.id);
    return null; // keep as processing, retry later
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,   // "teen41"
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teen41 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";

  // 1️⃣ Raw market outcome for selection
  const outcome = isTeen41Winner(selection, rdesc, winnat); // true/false

  const selNorm = normalize(selection);
  let userWon;

  // 2️⃣ If selection is Player A / Player B → apply BACK/LAY
  if (selNorm === "PLAYER A" || selNorm === "PLAYER B") {
    const betType = String(type || "back").toLowerCase(); // "back" or "lay"
    userWon = betType === "lay" ? !outcome : outcome;
  } else {
    // 3️⃣ For side bets (Player B Under 21 / Over 21) → ignore type, use outcome directly
    userWon = outcome;
  }

  console.log("[Settlement] teen41 resolve ✅", {
    bet_id: bet.id,
    selection,
    type,
    rdesc,
    winnat,
    outcome,
    userWon,
  });

  return userWon; // final answer for settlement
}

// teen 33

//helper 
function isTeen33Winner(selection, winnat) {
  if (!selection) return false;

  const sel = normalize(selection);  // "PLAYER A" / "PLAYER B"
  const winNat = normalize(winnat);     // "PLAYER A" / "PLAYER B"

  if (sel !== "PLAYER A" && sel !== "PLAYER B") {
    return false;
  }

  return sel === winNat;
}

async function resolveTeen33(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teen33 missing event_id/selection", bet.id);
    return null; // keep as processing, retry later
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,   // "teen33"
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teen33 no t1 data yet for bet", bet.id);
    return null;
  }

  const winnat = t1.winnat || "";

  // 1️⃣ Raw market outcome: did my selection win in the market?
  const outcome = isTeen33Winner(selection, winnat); // true/false

  // 2️⃣ Apply BACK / LAY for all selections in this game
  const betType = String(type || "back").toLowerCase(); // "back" or "lay"
  const userWon = betType === "lay" ? !outcome : outcome;

  console.log("[Settlement] teen33 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    winnat,
    outcome,
    userWon,
  });

  return userWon; // final boolean used by settleBetCommon
}

// cmeter1 — "1 Card Meter" (Fighter A vs Fighter B)
async function resolveCmeter1(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] cmeter1 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] cmeter1 no t1 data yet for bet", bet.id);
    return null;
  }

  const sel = normalize(selection);
  const winNat = normalize(t1.winnat || "");

  if (sel !== "FIGHTER A" && sel !== "FIGHTER B") {
    console.warn("[Settlement] cmeter1 unknown selection", { bet_id: bet.id, selection });
    return false;
  }

  // 1 Card Meter pays a MULTIPLE of the stake — the point difference between the
  // two cards (A=1 … K=13), capped at 12. Equal ranks are split by suit rank and
  // pay 1x; identical rank AND suit is a tie -> stake pushed back.
  // The feed carries it in rdesc as "Fighter A#3"; the cards are the fallback.
  const rate = parseCmeter1Rate(t1);

  if (rate === "void" || !winNat) {
    console.log("[Settlement] cmeter1 tie -> void", { bet_id: bet.id, rdesc: t1.rdesc, card: t1.card });
    return "void";
  }

  if (!rate) {
    console.warn("[Settlement] cmeter1 unreadable rate, retrying", {
      bet_id: bet.id, rdesc: t1.rdesc, card: t1.card,
    });
    return null; // leaves the bet OPEN for the next pass rather than mis-paying
  }

  const outcome = sel === winNat;
  const betType = String(type || "back").toLowerCase();
  const userWon = betType === "lay" ? !outcome : outcome;

  console.log("[Settlement] cmeter1 resolve", {
    bet_id: bet.id,
    selection,
    type: betType,
    winnat: t1.winnat,
    rdesc: t1.rdesc,
    card: t1.card,
    rate,
    outcome,
    userWon,
  });

  return { won: userWon, rate };
}

// helper cmeter1 — point difference that scales the payout (1x … 12x)
const CMETER1_MAX_RATE = 12;

function cmeter1CardValue(card) {
  // feed card format: "QSS" / "10DD" / "9CC" -> rank chars then a doubled suit
  const rank = String(card || "").trim().toUpperCase().replace(/[SHCD]+$/, "");
  if (!rank) return null;
  const map = { A: 1, J: 11, Q: 12, K: 13 };
  if (map[rank]) return map[rank];
  const n = parseInt(rank, 10);
  return n >= 2 && n <= 10 ? n : null;
}

function parseCmeter1Rate(t1) {
  // Preferred: the "#n" tail of rdesc ("Fighter A#3")
  const fromRdesc = parseInt(String(t1?.rdesc || "").split("#")[1], 10);
  if (Number.isFinite(fromRdesc) && fromRdesc > 0) {
    return Math.min(fromRdesc, CMETER1_MAX_RATE);
  }

  // Fallback: derive from the two cards
  const [a, b] = String(t1?.card || "").split(",").map((c) => cmeter1CardValue(c));
  if (a == null || b == null) return null;

  const diff = Math.abs(a - b);
  if (diff === 0) {
    // Same rank: suit ranking decides and pays 1x. Identical card = tie (push).
    const [ca, cb] = String(t1.card).split(",").map((c) => String(c || "").trim().toUpperCase());
    return ca === cb ? "void" : 1;
  }
  return Math.min(diff, CMETER1_MAX_RATE);
}

//poker
async function resolvePoker(bet) {
  const { game_name, event_id, selection, type, player_name } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] poker missing event_id/selection", bet.id);
    return null;
  }

  // fetch detail-results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'poker'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] poker no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";

  const selNorm = normalize(selection);

  // 1) Main Player markets: Player A / Player B
  if (selNorm === "PLAYER A" || selNorm === "PLAYER B") {
    const outcome = normalize(winnat) === selNorm; // true if selection matches winnat
    // Apply BACK / LAY only for main market
    const betType = String(type || "back").toLowerCase();
    const userWon = betType === "lay" ? !outcome : outcome;

    console.log("[Settlement] poker resolve main", {
      bet_id: bet.id,
      selection,
      type: betType,
      winnat,
      outcome,
      userWon,
    });
    return userWon;
  }

  // 2) Bonus markets (back-only). The provider's rdesc already states each side's
  //    bonus hand or "-" (no bonus): parts[1] = 2-card bonus, parts[2] = 7-card,
  //    each "A : <hand|-> | B : <hand|->". So a side wins iff its entry qualifies
  //    (non-empty and not "-"). Robust to BOTH feed naming conventions:
  //      • avrkhub: "Player A 2 card Bonus" / "Player B 7 card bonus"
  //      • Diamond: "2 Cards Bonus A" / "7 Cards Bonus B" / "Bonus A"
  const { bonus2A, bonus2B, bonus7A, bonus7B } = extractPokerBonusParts(rdesc);
  const qualifies = (v) => {
    const s = normalize(v);
    return s.length > 0 && s !== "-" && s !== "HIGH CARD";
  };
  const side = /\bB\b/.test(selNorm) ? "B" : "A"; // standalone B (not inside "BONUS")
  const is7 = /7/.test(selNorm);
  const val = is7
    ? (side === "B" ? bonus7B : bonus7A)
    : (side === "B" ? bonus2B : bonus2A);

  console.log("[Settlement] poker bonus resolve", {
    bet_id: bet.id, selection, side, bonus: is7 ? "7card" : "2card", val,
  });

  return Boolean(qualifies(val));
}

// poker + helper 
// Lists (keywords to detect). These are fuzzy-match patterns.
const BONUS1_PATTERNS = [
  /PAIR\b/i,               // Pair (2-10) or Pair (JQK)
  /\bA\/Q\b/i,             // A/Q off or suited
  /\bA\/J\b/i,
  /\bA\/K\b/i,
  /\bA\s*\/\s*K\s*SUIT/i,  // A/K Suited (alternative formatting)
  /\bA\/K\s*SUITED\b/i,
  /\bA\/Q\s*SUITED\b/i,
  /\bA\/J\s*SUITED\b/i,
  /\bA\s*A\b/i,            // A/A (Ace pair) or "A A"
  /\bA\/A\b/i,
];

const BONUS2_PATTERNS = [
  /THREE OF A KIND/i,
  /\bSTRAIGHT\b/i,
  /\bFLUSH\b/i,
  /\bFULL HOUSE\b/i,
  /FOUR OF A KIND/i,
  /STRAIGHT FLUSH/i,
  /ROYAL FLUSH/i,
];

// parse a "A : Something | B : Something" string into { A: "Something", B: "Something" }
function parseABPairString(str) {
  const out = { A: "", B: "" };
  if (!str) return out;
  // split by | but keep robust
  const parts = str.split("|").map((p) => p.trim());
  for (const p of parts) {
    const m = p.match(/^\s*(A|B)\s*:\s*(.+)$/i);
    if (m) {
      out[m[1].toUpperCase()] = m[2].trim();
    } else {
      // fallback: if string contains "A :" anywhere
      const ma = p.match(/A\s*:\s*(.+)/i);
      const mb = p.match(/B\s*:\s*(.+)/i);
      if (ma) out.A = ma[1].trim();
      if (mb) out.B = mb[1].trim();
    }
  }
  return out;
}

// determine if any pattern from list matches the content (case-insensitive)
function matchesAnyPattern(str, patterns) {
  if (!str) return false;
  return patterns.some((re) => re.test(str));
}

/**
 * parse rdesc expected format:
 * "Player A#A : <bonus1>  |  B : <bonus1>#A : <bonus2>  |  B : <bonus2>"
 * parts[1] => 2-card bonus info (A : ... | B : ...)
 * parts[2] => 7-card bonus info (A : ... | B : ...)
 */
function extractPokerBonusParts(rdesc) {
  const parts = (rdesc || "").split("#");
  const part1 = (parts[1] || "").trim(); // 2-card bonus (A : ... | B : ...)
  const part2 = (parts[2] || "").trim(); // 7-card bonus (A : ... | B : ...)
  const p1 = parseABPairString(part1);
  const p2 = parseABPairString(part2);
  return { bonus2A: p1.A, bonus2B: p1.B, bonus7A: p2.A, bonus7B: p2.B };
}

// poker 
async function resolvePoker6(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] poker6 missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'poker6'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] poker6 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // "Player 1#Three of a Kind"
  const winnat = t1.winnat || "";  // "Player 1"
  const { playerPart, handPart } = parsePoker6Rdesc(rdesc);

  const sel = normalize(selection);

  // 1) Player selection (Player 1..6)
  if (/^PLAYER\s+\d+$/i.test(sel)) {
    const winnerPlayerNorm = normalize(playerPart); // from rdesc
    const userSelectionNorm = sel;                 // "PLAYER 1"
    const isWin = userSelectionNorm === normalize(winnat) || userSelectionNorm === winnerPlayerNorm;
    console.log("[Settlement] poker6 player check", { bet_id: bet.id, selection, winnat, playerPart, isWin });
    return Boolean(isWin);
  }

  // 2) Hand selection
  // canonicalize both sides for robust comparison
  const handNorm = normalizeHandName(handPart);      // e.g. "THREE OF A KIND"
  const selHandNorm = normalizeHandName(selection);  // e.g. "THREE OF A KIND"

  // Some providers may use slight synonyms: handle common variations
  // Map common short/alt forms to canonical
  const synonyms = new Map([
    ["3 OF A KIND", "THREE OF A KIND"],
    ["3 OF KIND", "THREE OF A KIND"],
    ["FOUR OF KIND", "FOUR OF A KIND"],
    ["STRAIGHT FLUSH", "STRAIGHT FLUSH"],
    ["HIGH CARD", "HIGH CARD"],
    ["PAIR", "PAIR"],
    ["TWO PAIR", "TWO PAIR"],
    ["FULL HOUSE", "FULL HOUSE"],
    ["FLUSH", "FLUSH"],
    ["STRAIGHT", "STRAIGHT"],
    ["THREE OF A KIND", "THREE OF A KIND"],
    ["FOUR OF A KIND", "FOUR OF A KIND"],
  ]);

  const canonHand = synonyms.get(handNorm) || handNorm;
  const canonSelHand = synonyms.get(selHandNorm) || selHandNorm;

  const handMatch = canonHand === canonSelHand;

  console.log("[Settlement] poker6 hand check", {
    bet_id: bet.id,
    selection,
    handPart,
    handNorm,
    canonHand,
    canonSelHand,
    handMatch,
  });

  return Boolean(handMatch);
}

// helper to parse poker6 rdesc
// parse rdesc like: "Player 1#Three of a Kind"
function parsePoker6Rdesc(rdesc) {
  const parts = (rdesc || "").split("#");
  const playerPart = (parts[0] || "").trim(); // "Player 1"
  const handPart = (parts[1] || "").trim();   // "Three of a Kind"
  return { playerPart, handPart };
}

// normalize canonical hand names for comparison
function normalizeHandName(s) {
  return normalize(s)
    .replace(/\s+/g, " ")
    .replace(/\s*OF\s*/g, " OF "); // keep readable but normalized
}

// baccarat

async function resolveBaccarat(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] baccarat missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'baccarat'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] baccarat no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Banker#Player Pair#No#Yes#Small"
  const winnat = t1.winnat || "";  // e.g. "Banker"
  const { winnerPart, pairPart, perfectPairPart, eitherPairPart, bigSmallPart } = parseBaccaratRdesc(rdesc);

  const sel = normalize(selection);

  // 1) Player / Banker / Tie selection
  if (["PLAYER", "BANKER", "TIE"].includes(sel)) {
    const winnerNorm = normalize(winnat) || normalize(winnerPart);

    // Tie variations: provider may return "Tie" or "Tie Game"
    if (sel === "TIE") {
      const isTie = winnerNorm.includes("TIE");
      console.log("[Settlement] baccarat tie check", { bet_id: bet.id, selection, winnat, winnerPart, isTie });
      return Boolean(isTie);
    }

    const isWin = sel === winnerNorm;
    console.log("[Settlement] baccarat player/banker check", { bet_id: bet.id, selection, winnat, winnerPart, isWin });
    return Boolean(isWin);
  }

  // 2) Player Pair / Banker Pair
  if (sel === "PLAYER PAIR" || sel === "BANKER PAIR") {
    const pairNorm = normalize(pairPart);
    const isPairMatch = pairNorm === sel;
    console.log("[Settlement] baccarat pair check", {
      bet_id: bet.id,
      selection,
      pairPart,
      pairNorm,
      isPairMatch,
    });
    return Boolean(isPairMatch);
  }

  // 3) Perfect Pair
  if (sel === "PERFECT PAIR") {
    // perfectPairPart expected "Yes" or "No"
    const perfectNorm = normalize(perfectPairPart);
    const isPerfect = perfectNorm === "YES";
    console.log("[Settlement] baccarat perfect pair check", {
      bet_id: bet.id,
      selection,
      perfectPairPart,
      perfectNorm,
      isPerfect,
    });
    return Boolean(isPerfect);
  }

  // 4) Either Pair
  if (sel === "EITHER PAIR") {
    const eitherNorm = normalize(eitherPairPart);
    const isEither = eitherNorm === "YES";
    console.log("[Settlement] baccarat either pair check", {
      bet_id: bet.id,
      selection,
      eitherPairPart,
      eitherNorm,
      isEither,
    });
    return Boolean(isEither);
  }

  // 5) Big / Small
  if (sel === "BIG" || sel === "SMALL") {
    const bigSmallNorm = normalize(bigSmallPart);
    const isBigSmallMatch = sel === bigSmallNorm;
    console.log("[Settlement] baccarat big/small check", {
      bet_id: bet.id,
      selection,
      bigSmallPart,
      bigSmallNorm,
      isBigSmallMatch,
    });
    return Boolean(isBigSmallMatch);
  }

  // If selection not recognized, warn and return null
  console.warn("[Settlement] baccarat unknown selection", { bet_id: bet.id, selection });
  return null;
}

// helper 
function parseBaccaratRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    winnerPart: parts[0] || "",
    pairPart: parts[1] || "",
    perfectPairPart: parts[2] || "",
    eitherPairPart: parts[3] || "",
    bigSmallPart: parts[4] || "",
  };
}

//baccarat2 
async function resolveBaccarat2(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] baccarat2 missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'baccarat2'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] baccarat2 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Player#-#8"
  const winnat = t1.winnat || "";  // e.g. "Player"
  const { winnerPart, pairPart, scorePart } = parseBaccarat2Rdesc(rdesc);

  const sel = normalize(selection);

  // 1) Player / Banker / Tie selection
  if (["PLAYER", "BANKER", "TIE"].includes(sel)) {
    const winnerNorm = normalize(winnat) || normalize(winnerPart);

    if (sel === "TIE") {
      const isTie = winnerNorm.includes("TIE");
      console.log("[Settlement] baccarat2 tie check", { bet_id: bet.id, selection, winnat, winnerPart, isTie });
      return Boolean(isTie);
    }

    const isWin = sel === winnerNorm;
    console.log("[Settlement] baccarat2 player/banker check", { bet_id: bet.id, selection, winnat, winnerPart, isWin });
    return Boolean(isWin);
  }

  // 2) Player Pair / Banker Pair
  if (sel === "PLAYER PAIR" || sel === "BANKER PAIR") {
    const pairNorm = normalize(pairPart); // could be "-" or "PLAYER PAIR" etc.
    const isPairMatch = pairNorm === sel;
    console.log("[Settlement] baccarat2 pair check", {
      bet_id: bet.id,
      selection,
      pairPart,
      pairNorm,
      isPairMatch,
    });
    return Boolean(isPairMatch);
  }

  // 3) Score checks
  if (sel.startsWith("SCORE")) {
    // try parse numeric score from rdesc scorePart first, fallback to t1.win if numeric
    let scoreNum = null;
    const sp = (scorePart || "").trim();
    if (/^\d+$/.test(sp)) {
      scoreNum = parseInt(sp, 10);
    } else if (/^\d+$/.test((t1.win || "").toString().trim())) {
      scoreNum = parseInt(t1.win, 10);
    }

    if (scoreNum === null) {
      // cannot determine numeric score -> not resolvable now
      console.warn("[Settlement] baccarat2 score missing/unparseable", { bet_id: bet.id, selection, scorePart, win: t1.win });
      return null;
    }

    let isScoreMatch = false;

    // handle ranges and exacts
    if (sel === "SCORE 1-4") {
      isScoreMatch = scoreNum >= 1 && scoreNum <= 4;
    } else if (sel === "SCORE 5-6") {
      isScoreMatch = scoreNum >= 5 && scoreNum <= 6;
    } else if (sel === "SCORE 7") {
      isScoreMatch = scoreNum === 7;
    } else if (sel === "SCORE 8") {
      isScoreMatch = scoreNum === 8;
    } else if (sel === "SCORE 9") {
      isScoreMatch = scoreNum === 9;
    } else {
      console.warn("[Settlement] baccarat2 unknown score selection", { bet_id: bet.id, selection });
      return null;
    }

    console.log("[Settlement] baccarat2 score check", {
      bet_id: bet.id,
      selection,
      scorePart,
      scoreNum,
      isScoreMatch,
    });
    return Boolean(isScoreMatch);
  }

  // If selection not recognized, warn and return null
  console.warn("[Settlement] baccarat2 unknown selection", { bet_id: bet.id, selection });
  return null;
}

// helper baccarat2
function parseBaccarat2Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    winnerPart: parts[0] || "",
    pairPart: parts[1] || "",
    scorePart: parts[2] || "",
  };
}
// card32 
async function resolveCard32(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] card32 missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'card32' or whatever your type is
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] card32 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Player 9"
  const winnat = t1.winnat || "";  // e.g. "Player 9"
  const { winnerPart } = parseCard32Rdesc(rdesc);

  const sel = normalize(selection);        // e.g. "PLAYER 9"
  const winnerNorm = normalize(winnat) || normalize(winnerPart); // prefer winnat
  const betType = normalize(type || "BACK"); // default to BACK if missing

  // Only handle expected selection set; if unknown selection, warn and return null
  const validSelections = new Set(["PLAYER 8", "PLAYER 9", "PLAYER 10", "PLAYER 11"]);
  if (!validSelections.has(sel)) {
    console.warn("[Settlement] card32 unknown selection", { bet_id: bet.id, selection });
    return null;
  }

  const selectionIsWinner = sel === winnerNorm;

  // Determine outcome using back/lay semantics:
  // - If selection is winner => back wins, lay loses
  // - If selection is not winner => lay wins, back loses
  let result = null;
  if (selectionIsWinner) {
    result = betType === "BACK";
  } else {
    result = betType === "LAY";
  }

  console.log("[Settlement] card32 check", {
    bet_id: bet.id,
    selection,
    sel,
    winnat,
    winnerPart,
    winnerNorm,
    type,
    betType,
    selectionIsWinner,
    result,
  });

  return Boolean(result);
}

// helper card32
function parseCard32Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  // in your example there's no '#', just "Player 9"
  return {
    winnerPart: parts[0] || rdesc || "",
  };
}

// goal 

async function resolveGoal(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] goal missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'goal'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] goal no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Erling Haaland#Penalty Goal"
  const winnat = t1.winnat || "";  // e.g. "Erling Haaland" or "No Goal"
  const { scorerPart, goalTypePart } = parseGoalRdesc(rdesc);

  const sel = normalize(selection);
  const winnerNorm = normalize(winnat) || normalize(scorerPart);

  // Recognized player list
  const playerSet = new Set([
    "CRISTIANO RONALDO",
    "LIONEL MESSI",
    "ROBERT LEWANDOWSKI",
    "NEYMAR",
    "HARRY KANE",
    "ZLATAN IBRAHIMOVIC",
    "ROMELU LUKAKU",
    "KYLIAN MBAPPE",
    "ERLING HAALAND",
  ]);

  // Goal-type canonicalization map (handle short/alt forms)
  const goalSynonyms = new Map([
    ["PENALTY", "PENALTY GOAL"],
    ["PENALTY GOAL", "PENALTY GOAL"],
    ["HEADER", "HEADER GOAL"],
    ["HEADER GOAL", "HEADER GOAL"],
    ["SHOT", "SHOT GOAL"],
    ["SHOT GOAL", "SHOT GOAL"],
    ["FREE KICK", "FREE KICK GOAL"],
    ["FREE KICK GOAL", "FREE KICK GOAL"],
    ["NO GOAL", "NO GOAL"],
    ["NO", "NO GOAL"],
  ]);

  // 1) Player selection
  if (playerSet.has(sel)) {
    const isWin = sel === winnerNorm;
    console.log("[Settlement] goal player check", {
      bet_id: bet.id,
      selection,
      winnat,
      scorerPart,
      winnerNorm,
      isWin,
    });
    return Boolean(isWin);
  }

  // 2) Goal-type selection
  const goalSelCanon = goalSynonyms.get(sel) || sel; // e.g. "PENALTY GOAL"
  const goalPartNorm = normalize(goalTypePart);

  // Special-case: "No Goal" can be present in winnat or scorerPart
  if (goalSelCanon === "NO GOAL") {
    const noGoalDetected = (normalize(winnat).includes("NO GOAL") || normalize(scorerPart).includes("NO GOAL"));
    console.log("[Settlement] goal No Goal check", {
      bet_id: bet.id,
      selection,
      winnat,
      scorerPart,
      noGoalDetected,
    });
    return Boolean(noGoalDetected);
  }

  // For other goal types, check parsed goalTypePart (e.g. "Penalty Goal")
  const canonGoalPart = goalSynonyms.get(goalPartNorm) || goalPartNorm;

  const isGoalTypeMatch = canonGoalPart === goalSelCanon;
  console.log("[Settlement] goal type check", {
    bet_id: bet.id,
    selection,
    goalTypePart,
    goalPartNorm,
    canonGoalPart,
    goalSelCanon,
    isGoalTypeMatch,
  });

  return Boolean(isGoalTypeMatch);
}

// goal helper
function parseGoalRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    scorerPart: parts[0] || "",
    goalTypePart: parts[1] || "",
  };
}


// aaa

async function resolveAaa(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] aaa missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'aaa'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] aaa no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Amar#Even#Red#Under 7#6"
  const winnat = t1.winnat || "";  // e.g. "Amar"
  const { winnerPart, evenOddPart, colorPart, underOverPart, cardPart } = parseAaaRdesc(rdesc);

  const sel = normalize(selection);
  const winnerNorm = normalize(winnat) || normalize(winnerPart);
  const betType = normalize(type || "BACK");

  // 1) Amar / Akbar / Anthony — use back/lay semantics
  const mainPlayers = new Set(["AMAR", "AKBAR", "ANTHONY"]);
  if (mainPlayers.has(sel)) {
    const selectionIsWinner = sel === winnerNorm;

    let result = null;
    if (selectionIsWinner) {
      result = betType === "BACK";
    } else {
      result = betType === "LAY";
    }

    console.log("[Settlement] aaa main player check", {
      bet_id: bet.id,
      selection,
      winnat,
      winnerPart,
      type,
      betType,
      selectionIsWinner,
      result,
    });
    return Boolean(result);
  }

  // 2) Even / Odd
  if (sel === "EVEN" || sel === "ODD") {
    const evenOddNorm = normalize(evenOddPart);
    const isMatch = sel === evenOddNorm;
    console.log("[Settlement] aaa even/odd check", {
      bet_id: bet.id,
      selection,
      evenOddPart,
      evenOddNorm,
      isMatch,
    });
    return Boolean(isMatch);
  }

  // 3) Red / Black
  if (sel === "RED" || sel === "BLACK") {
    const colorNorm = normalize(colorPart);
    const isMatch = sel === colorNorm;
    console.log("[Settlement] aaa color check", {
      bet_id: bet.id,
      selection,
      colorPart,
      colorNorm,
      isMatch,
    });
    return Boolean(isMatch);
  }

  // 4) Under 7 / Over 7
  if (sel === "UNDER 7" || sel === "OVER 7") {
    const uoNorm = normalize(underOverPart);
    const isMatch = sel === uoNorm;
    console.log("[Settlement] aaa under/over check", {
      bet_id: bet.id,
      selection,
      underOverPart,
      uoNorm,
      isMatch,
    });
    return Boolean(isMatch);
  }

  // 5) Card checks (Card A .. Card K)
  if (sel.startsWith("CARD ")) {
    const cardRequested = sel.replace(/^CARD\s+/i, "").trim();
    const cardPartNorm = normalize(cardPart);

    const faceMap = new Map([
      ["A", "A"], ["1", "A"],
      ["J", "J"], ["Q", "Q"], ["K", "K"],
      ["10", "10"], ["9", "9"], ["8", "8"], ["7", "7"],
      ["6", "6"], ["5", "5"], ["4", "4"], ["3", "3"], ["2", "2"],
    ]);

    const requestedCode = faceMap.get(cardRequested) || cardRequested;
    const actualCode = faceMap.get(cardPartNorm) || cardPartNorm;

    const isCardMatch = requestedCode === actualCode;

    console.log("[Settlement] aaa card check", {
      bet_id: bet.id,
      selection,
      cardPart,
      cardPartNorm,
      requestedCode,
      actualCode,
      isCardMatch,
    });
    return Boolean(isCardMatch);
  }

  // Unknown selection
  console.warn("[Settlement] aaa unknown selection", { bet_id: bet.id, selection });
  return null;
}

function parseAaaRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    winnerPart: parts[0] || "",
    evenOddPart: parts[1] || "",
    colorPart: parts[2] || "",
    underOverPart: parts[3] || "",
    cardPart: parts[4] || "",
  };
}

// aaa2

async function resolveAaa2(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] aaa2 missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'aaa2'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] aaa2 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Anthony#Even#Red#Over 7#Q"
  const winnat = t1.winnat || "";  // e.g. "Anthony"
  const { winnerPart, evenOddPart, colorPart, underOverPart, cardPart } = parseAaa2Rdesc(rdesc);

  const sel = normalize(selection);
  const winnerNorm = normalize(winnat) || normalize(winnerPart);
  const betType = normalize(type || "BACK"); // default to BACK

  // 1) Amar / Akbar / Anthony — use back/lay semantics (like card32)
  const mainPlayers = new Set(["AMAR", "AKBAR", "ANTHONY"]);
  if (mainPlayers.has(sel)) {
    const selPlayerNorm = sel; // e.g. "ANTHONY"
    const selectionIsWinner = selPlayerNorm === winnerNorm;

    let result = null;
    if (selectionIsWinner) {
      result = betType === "BACK";
    } else {
      result = betType === "LAY";
    }

    console.log("[Settlement] aaa2 main player check", {
      bet_id: bet.id,
      selection,
      winnat,
      winnerPart,
      type,
      betType,
      selectionIsWinner,
      result,
    });
    return Boolean(result);
  }

  // 2) Even / Odd
  if (sel === "EVEN" || sel === "ODD") {
    const evenOddNorm = normalize(evenOddPart); // expected "EVEN" or "ODD"
    const isMatch = sel === evenOddNorm;
    console.log("[Settlement] aaa2 even/odd check", {
      bet_id: bet.id,
      selection,
      evenOddPart,
      evenOddNorm,
      isMatch,
    });
    return Boolean(isMatch);
  }

  // 3) Red / Black
  if (sel === "RED" || sel === "BLACK") {
    const colorNorm = normalize(colorPart); // expected "RED" or "BLACK"
    const isMatch = sel === colorNorm;
    console.log("[Settlement] aaa2 color check", {
      bet_id: bet.id,
      selection,
      colorPart,
      colorNorm,
      isMatch,
    });
    return Boolean(isMatch);
  }

  // 4) Under 7 / Over 7
  if (sel === "UNDER 7" || sel === "OVER 7") {
    const uoNorm = normalize(underOverPart); // expected "UNDER 7" or "OVER 7" (provider may vary spacing)
    const isMatch = sel === uoNorm;
    console.log("[Settlement] aaa2 under/over check", {
      bet_id: bet.id,
      selection,
      underOverPart,
      uoNorm,
      isMatch,
    });
    return Boolean(isMatch);
  }

  // 5) Card checks (Card A .. Card K)
  if (sel.startsWith("CARD ")) {
    // map selection "CARD Q" -> "Q", "CARD A" -> "A", "CARD 10" -> "10"
    const cardRequested = sel.replace(/^CARD\s+/i, "").trim(); // e.g. "Q" or "A" or "10"
    const cardRequestedNorm = cardRequested; // already normalized

    // cardPart from rdesc might be "Q" or "10" or "A"
    const cardPartNorm = normalize(cardPart);

    // Some providers might send face cards as words, handle common synonyms
    const faceMap = new Map([
      ["A", "A"],
      ["1", "A"],
      ["J", "J"],
      ["Q", "Q"],
      ["K", "K"],
      ["10", "10"],
      ["9", "9"],
      ["8", "8"],
      ["7", "7"],
      ["6", "6"],
      ["5", "5"],
      ["4", "4"],
      ["3", "3"],
      ["2", "2"],
    ]);

    const requestedCode = faceMap.get(cardRequestedNorm) || cardRequestedNorm;
    const actualCode = faceMap.get(cardPartNorm) || cardPartNorm;

    const isCardMatch = requestedCode === actualCode;

    console.log("[Settlement] aaa2 card check", {
      bet_id: bet.id,
      selection,
      cardPart,
      cardPartNorm,
      requestedCode,
      actualCode,
      isCardMatch,
    });
    return Boolean(isCardMatch);
  }

  // Unknown selection -> not resolvable
  console.warn("[Settlement] aaa2 unknown selection", { bet_id: bet.id, selection });
  return null;
}

//heler 

function parseAaa2Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    winnerPart: parts[0] || "",
    evenOddPart: parts[1] || "",
    colorPart: parts[2] || "",
    underOverPart: parts[3] || "",
    cardPart: parts[4] || "",
  };
}

// ---------------- race2
async function resolveRace2(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] race2 missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'race2'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] race2 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Player D"
  const winnat = t1.winnat || "";  // e.g. "Player D"
  const { winnerPart } = parseRace2Rdesc(rdesc);

  const sel = normalize(selection);         // e.g. "PLAYER D"
  const winnerNorm = normalize(winnat) || normalize(winnerPart);
  const betType = normalize(type || "BACK"); // default to BACK

  const validSelections = new Set(["PLAYER A", "PLAYER B", "PLAYER C", "PLAYER D"]);
  if (!validSelections.has(sel)) {
    console.warn("[Settlement] race2 unknown selection", { bet_id: bet.id, selection });
    return null;
  }

  const selectionIsWinner = sel === winnerNorm;

  // back/lay outcome:
  // - If selection is winner => back true, lay false
  // - If selection is not winner => lay true, back false
  let result = null;
  if (selectionIsWinner) {
    result = betType === "BACK";
  } else {
    result = betType === "LAY";
  }

  console.log("[Settlement] race2 check", {
    bet_id: bet.id,
    selection,
    sel,
    winnat,
    winnerPart,
    winnerNorm,
    type,
    betType,
    selectionIsWinner,
    result,
  });

  return Boolean(result);
}

//helper race2
function parseRace2Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    winnerPart: parts[0] || rdesc || "",
  };
}

// -------------------------------------------------------
async function resolveRace17(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] race17 missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'race17'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] race17 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const { racePart, bigCardPart, zeroCardPart, oneZeroPart } = parseRace17Rdesc(rdesc);

  const sel = normalize(selection);
  const betType = normalize(type || "BACK"); // default BACK

  // Helper: parse expected numeric suffix from selection like "- 2"
  const expectedCountFromSelection = (s) => {
    const m = s.match(/-\s*(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
  };

  // Helper: split token string into tokens (handles multiple spaces)
  const splitTokens = (s) => (s || "").split(/\s+/).map(x => x.trim()).filter(x => x.length > 0);

  // 1) Race to 17 -> check racePart contains YES/NO
  if (sel === "RACE TO 17") {
    const raceNorm = normalize(racePart);
    const match = raceNorm.includes("YES"); // true if "YES", false if "NO" (or not present)
    const result = match ? (betType === "BACK") : (betType === "LAY");

    console.log("[Settlement] race17 race-to-17 check", {
      bet_id: bet.id,
      selection,
      rdesc,
      racePart,
      raceNorm,
      match,
      type,
      betType,
      result,
    });

    return Boolean(result);
  }

  // 2) Big Card - N
  if (sel.startsWith("BIG CARD")) {
    // count "BIG" tokens in bigCardPart
    const bigTokens = splitTokens(bigCardPart).map(t => normalize(t)); // e.g. ["SMALL","SMALL","BIG"]
    const bigCount = bigTokens.reduce((acc, t) => acc + (t === "BIG" ? 1 : 0), 0);

    const expected = expectedCountFromSelection(selection); // e.g. 2
    // If expected is provided in selection, require equality; otherwise treat presence of any BIG as match
    let match;
    if (expected !== null) {
      match = bigCount === expected;
    } else {
      match = bigCount > 0;
    }

    const result = match ? (betType === "BACK") : (betType === "LAY");

    console.log("[Settlement] race17 big-card check", {
      bet_id: bet.id,
      selection,
      rdesc,
      bigCardPart,
      bigTokens,
      bigCount,
      expected,
      match,
      type,
      betType,
      result,
    });

    return Boolean(result);
  }

  // 3) Zero Card - N
  if (sel.startsWith("ZERO CARD")) {
    // count "YES" tokens in zeroCardPart
    const zeroTokens = splitTokens(zeroCardPart).map(t => normalize(t)); // e.g. ["YES","NO","YES",...]
    const yesCount = zeroTokens.reduce((acc, t) => acc + (t === "YES" ? 1 : 0), 0);

    const expected = expectedCountFromSelection(selection);
    let match;
    if (expected !== null) {
      match = yesCount === expected;
    } else {
      match = yesCount > 0;
    }

    const result = match ? (betType === "BACK") : (betType === "LAY");

    console.log("[Settlement] race17 zero-card check", {
      bet_id: bet.id,
      selection,
      rdesc,
      zeroCardPart,
      zeroTokens,
      yesCount,
      expected,
      match,
      type,
      betType,
      result,
    });

    return Boolean(result);
  }

  // 4) Any Zero
  if (sel === "ANY ZERO") {
    const zeroTokens = splitTokens(zeroCardPart).map(t => normalize(t));
    const anyZeroFromTokens = zeroTokens.some(t => t === "YES");
    const oneZeroNorm = normalize(oneZeroPart); // summary token
    const anyZero = anyZeroFromTokens || oneZeroNorm === "YES";

    const match = anyZero;
    const result = match ? (betType === "BACK") : (betType === "LAY");

    console.log("[Settlement] race17 any-zero check", {
      bet_id: bet.id,
      selection,
      rdesc,
      zeroCardPart,
      zeroTokens,
      oneZeroPart,
      anyZeroFromTokens,
      oneZeroNorm,
      match,
      type,
      betType,
      result,
    });

    return Boolean(result);
  }

  // Unknown selection -> not resolvable
  console.warn("[Settlement] race17 unknown selection", { bet_id: bet.id, selection, rdesc });
  return null;
}

// helper race17

function parseRace17Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    racePart: parts[0] || "",         // "No (15)" or "Yes (17)"
    bigCardPart: parts[1] || "",     // "Small  Small  ... Big" (per-card)
    zeroCardPart: parts[2] || "",    // "Yes  No  Yes ..." (per-card)
    oneZeroPart: parts[3] || "",     // "Yes" or "No" (summary)
  };
}

//----------------race 20

async function resolveRace20(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] race20 missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'race20'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] race20 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "K Spade#99#14"
  const winnat = t1.winnat || "";  // prefer this if present
  const { winnerPart, pointsPart, cardsPart } = parseRace20Rdesc(rdesc);

  const sel = normalize(selection);         // e.g. "K OF SPADE" or "WIN WITH 14"
  const winnerNorm = normalize(winnat) || normalize(winnerPart); // e.g. "K SPADE"
  const betType = normalize(type || "BACK");

  // Helper: boolean result from match, then convert using back/lay semantics
  const toOutcome = (match) => (match ? (betType === "BACK") : (betType === "LAY"));

  // 1) King of suit checks
  // Accept variety of selection forms: "K of spade", "K OF SPADE", "K SPADE"
  const suitMap = {
    "K OF SPADE": "K SPADE",
    "K OF HEART": "K HEART",
    "K OF CLUB": "K CLUB",
    "K OF DIAMOND": "K DIAMOND",
    "K SPADE": "K SPADE",
    "K HEART": "K HEART",
    "K CLUB": "K CLUB",
    "K DIAMOND": "K DIAMOND",
  };

  if (suitMap[sel]) {
    const target = suitMap[sel];
    const match = target === winnerNorm;
    console.log("[Settlement] race20 king-suit check", {
      bet_id: bet.id,
      selection,
      sel,
      winnerPart,
      winnat,
      winnerNorm,
      match,
      type,
      betType,
    });
    return Boolean(toOutcome(match));
  }

  // 2) Total points / 3) Total cards — these are line bets (over/under a target),
  // but the FE selection ("Total points"/"Total cards") carries NO line, so the
  // win condition can't be determined from the bet. The old code matched on
  // "a numeric value exists" which is ALWAYS true → back always won (money leak).
  // Until the FE sends the line (or the exact rule is confirmed), do NOT settle —
  // return null (stays open) rather than mis-pay. rdesc carries the actual values
  // (pointsPart/cardsPart) for when the rule is wired.
  if (sel === "TOTAL POINTS" || sel === "TOTAL CARDS") {
    console.warn("[Settlement] race20 total points/cards has no line in selection — not settling", {
      bet_id: bet.id, selection, pointsPart, cardsPart,
    });
    return null;
  }

  // 4) Win with N  (e.g. "WIN WITH 5", "WIN WITH 6", ...)
  if (/^WIN WITH\s+\d+$/i.test(selection)) {
    const m = selection.match(/^WIN WITH\s+(\d+)$/i);
    const expected = m ? parseInt(m[1], 10) : null;
    const cardsNum = (/^\d+$/.test(cardsPart) ? parseInt(cardsPart, 10) : null);

    if (cardsNum === null) {
      console.warn("[Settlement] race20 win-with missing cardsPart", { bet_id: bet.id, selection, rdesc });
      return null;
    }

    const match = cardsNum === expected;
    console.log("[Settlement] race20 win-with check", {
      bet_id: bet.id,
      selection,
      expected,
      cardsPart,
      cardsNum,
      match,
      type,
      betType,
    });
    return Boolean(toOutcome(match));
  }

  // Unknown selection -> not resolvable
  console.warn("[Settlement] race20 unknown selection", { bet_id: bet.id, selection, rdesc });
  return null;
}
// helper race20
function parseRace20Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    winnerPart: parts[0] || "",
    pointsPart: parts[1] || "",
    cardsPart: parts[2] || "",
  };
}

//---------kbc
async function resolveKbc(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] kbc missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'kbc'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] kbc no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "Black#Even#Down#8  9  10#Heart"
  const { redBlackPart, oddEvenPart, upDownPart, threeCardPart, suitPart } = parseKbcRdesc(rdesc);

  const selRaw = selection.toString();
  const sel = normalize(selRaw);

  // Helpers
  const splitThreeCard = (s) =>
    (s || "").split(/\s+/).map(x => x.trim()).filter(x => x.length > 0);

  // 1) Red / Black
  if (sel === "RED" || sel === "BLACK") {
    const rbNorm = normalize(redBlackPart);
    const match = sel === rbNorm;
    console.log("[Settlement] kbc red-black check", {
      bet_id: bet.id,
      selection,
      redBlackPart,
      rbNorm,
      match,
    });
    return Boolean(match);
  }

  // 2) Odd / Even
  if (sel === "ODD" || sel === "EVEN") {
    const oeNorm = normalize(oddEvenPart);
    const match = sel === oeNorm;
    console.log("[Settlement] kbc odd-even check", {
      bet_id: bet.id,
      selection,
      oddEvenPart,
      oeNorm,
      match,
    });
    return Boolean(match);
  }

  // 3) 7 Up / 7 Down
  // Accept "UP"/"DOWN" or "7 UP"/"7 DOWN"
  if (sel === "UP" || sel === "DOWN" || sel === "7 UP" || sel === "7 DOWN") {
    // normalize token to either "UP" or "DOWN"
    const token = normalize(upDownPart).replace(/^7\s*/i, "");
    const want = sel.replace(/^7\s*/i, "");
    const match = want === token;
    console.log("[Settlement] kbc up-down check", {
      bet_id: bet.id,
      selection,
      upDownPart,
      token,
      want,
      match,
    });
    return Boolean(match);
  }

  // 4) 3 Card Judgement
  // If selection is exactly "3 CARD JUDGEMENT" -> ambiguous -> return null
  if (sel === "3 CARD JUDGEMENT") {
    console.warn("[Settlement] kbc 3-card ambiguous selection (needs detail)", { bet_id: bet.id, selection });
    return null;
  }

  // If selection is a single number (e.g. "8") or a whitespace-separated list ("8 9 10"),
  // check membership / exact match against token.
  if (/^\d+(\s+\d+)*$/.test(selRaw.trim())) {
    // requested either single number or list
    const requestedList = selRaw.trim().split(/\s+/).map(x => x.trim());
    const available = splitThreeCard(threeCardPart); // e.g. ["8","9","10"]

    // If user supplied a list, compare as sets (order-insensitive)
    if (requestedList.length > 1) {
      // treat as exact-match set: same elements (ignoring order)
      const reqNormalized = requestedList.map(x => x.toUpperCase()).sort().join(",");
      const availNormalized = available.map(x => x.toUpperCase()).sort().join(",");
      const match = reqNormalized === availNormalized;
      console.log("[Settlement] kbc 3-card list check", {
        bet_id: bet.id,
        selection,
        requestedList,
        available,
        match,
      });
      return Boolean(match);
    } else {
      // single number presence check
      const num = requestedList[0];
      const match = available.map(x => x.toUpperCase()).includes(num.toUpperCase());
      console.log("[Settlement] kbc 3-card single check", {
        bet_id: bet.id,
        selection,
        num,
        available,
        match,
      });
      return Boolean(match);
    }
  }

  // 5) Suits -> Club / Heart / Spade / Diamond
  const suitAliases = new Map([
    ["CLUB", "CLUB"],
    ["HEART", "HEART"],
    ["SPADE", "SPADE"],
    ["DIAMOND", "DIAMOND"],
    // accept variants
    ["CLUBS", "CLUB"],
    ["HEARTS", "HEART"],
    ["SPADES", "SPADE"],
    ["DIAMONDS", "DIAMOND"],
  ]);

  const suitWanted = suitAliases.get(sel);
  if (suitWanted) {
    const suitNorm = normalize(suitPart).replace(/S$/, ""); // remove trailing plural if any
    const match = suitWanted === suitNorm;
    console.log("[Settlement] kbc suits check", {
      bet_id: bet.id,
      selection,
      suitPart,
      suitNorm,
      match,
    });
    return Boolean(match);
  }

  // Unknown selection -> not resolvable
  console.warn("[Settlement] kbc unknown selection", { bet_id: bet.id, selection, rdesc });
  return null;
}
// helper kbc
function parseKbcRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    redBlackPart: parts[0] || "",    // "Black"
    oddEvenPart: parts[1] || "",     // "Even"
    upDownPart: parts[2] || "",      // "Down"
    threeCardPart: parts[3] || "",   // "8  9  10"
    suitPart: parts[4] || "",        // "Heart"
  };
}

// ballby ball
async function resolveBallByBall(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] ballbyball missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'ballbyball'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] ballbyball no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";
  const { raw, norm } = parseBallByBallRdesc(rdesc);
  const winNorm = normalize(winnat) || norm;

  const sel = normalize(selection);

  // Mapping numeric run selections to canonical "N RUN"
  const runMatch = sel.match(/^(\d+)\s*RUNS?$/i);
  if (runMatch) {
    const wanted = `${runMatch[1]} RUN`; // "4 RUN" etc
    const isMatch = winNorm === wanted || norm === wanted;
    console.log("[Settlement] ballbyball numeric run check", {
      bet_id: bet.id,
      selection,
      wanted,
      rdesc,
      winnat,
      norm,
      winNorm,
      isMatch,
    });
    return Boolean(isMatch);
  }

  // Boundary -> match 4 or 6 runs OR literal 'BOUNDARY' in rdesc/winnat
  if (sel === "BOUNDARY") {
    const isBoundary =
      winNorm.includes("BOUNDARY") ||
      norm === "BOUNDARY" ||
      winNorm === "4 RUN" ||
      winNorm === "6 RUN" ||
      norm === "4 RUN" ||
      norm === "6 RUN";
    console.log("[Settlement] ballbyball boundary check", {
      bet_id: bet.id,
      selection,
      rdesc,
      winnat,
      norm,
      winNorm,
      isBoundary,
    });
    return Boolean(isBoundary);
  }

  // Wicket
  if (sel === "WICKET") {
    const isWicket = winNorm.includes("WICKET") || norm.includes("WICKET");
    console.log("[Settlement] ballbyball wicket check", {
      bet_id: bet.id,
      selection,
      rdesc,
      winnat,
      norm,
      winNorm,
      isWicket,
    });
    return Boolean(isWicket);
  }

  // Extra Runs -> NO BALL / WIDE / BYE / LEGBYE / EXTRA
  if (sel === "EXTRA RUNS") {
    const extraIndicators = ["EXTRA", "NO BALL", "NOBALL", "WIDE", "BYE", "LEGBYE", "LEG BYE"];
    const combined = `${winNorm} ${norm}`;
    const isExtra = extraIndicators.some(ind => combined.includes(ind));
    console.log("[Settlement] ballbyball extra-runs check", {
      bet_id: bet.id,
      selection,
      rdesc,
      winnat,
      norm,
      winNorm,
      isExtra,
    });
    return Boolean(isExtra);
  }

  // Unknown selection -> not resolvable
  console.warn("[Settlement] ballbyball unknown selection", { bet_id: bet.id, selection, rdesc, winnat });
  return null;
}

// helper ballbyball
function parseBallByBallRdesc(rdesc) {
  const txt = (rdesc || "").trim();
  return { raw: txt, norm: normalize(txt) };
}

// ---------- trap
async function resolveTrap(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] trap missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'trap' (or whatever your type is)
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] trap no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";
  const { main, totals, hlArray, picArray } = parseTrapRdesc(rdesc);

  const selRaw = (selection || "").toString().trim();
  const sel = normalize(selRaw);
  const betType = normalize(type || "BACK");

  // helper to convert boolean match -> back/lay outcome
  const toOutcome = (match) => (match ? (betType === "BACK") : (betType === "LAY"));

  // 1) Player A / Player B -> fall into trap when total in [13,14,15]
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    const playerKey = sel === "PLAYER A" ? "A" : "B";
    const total = totals[playerKey];
    if (total === null) {
      console.warn("[Settlement] trap missing totals in rdesc", { bet_id: bet.id, rdesc, totals });
      return null;
    }
    const fallsIntoTrap = [13, 14, 15].includes(total);
    // match === fallsIntoTrap (true if this player fell into trap)
    const result = toOutcome(fallsIntoTrap);
    console.log("[Settlement] trap player check", {
      bet_id: bet.id,
      selection,
      rdesc,
      main,
      totals,
      fallsIntoTrap,
      type,
      betType,
      result,
    });
    return Boolean(result);
  }

  // 2) Card N High/Low  => expect selection like "Card 3 High" or "Card 2 Low"
  // also accept "CARD N HIGH"/"CARD N LOW" (case-insensitive)
  const cardHighLowMatch = selRaw.match(/^Card\s+(\d+)\s+(High|Low)$/i);
  if (cardHighLowMatch) {
    const idx = parseInt(cardHighLowMatch[1], 10) - 1; // convert to 0-based
    const want = cardHighLowMatch[2].toUpperCase(); // "HIGH" or "LOW"

    if (idx < 0 || idx >= hlArray.length) {
      console.warn("[Settlement] trap card index out of range", { bet_id: bet.id, selection, hlArrayLength: hlArray.length });
      return null;
    }

    const actual = normalize(hlArray[idx]);
    const match = actual === want;
    const result = toOutcome(match);

    console.log("[Settlement] trap card High/Low check", {
      bet_id: bet.id,
      selection,
      rdesc,
      idx: idx + 1,
      want,
      actual,
      match,
      type,
      betType,
      result,
    });
    return Boolean(result);
  }

  // 3) Card N JQK => selection like "Card 3 JQK"
  const cardJQKMatch = selRaw.match(/^Card\s+(\d+)\s+JQK$/i);
  if (cardJQKMatch) {
    const idx = parseInt(cardJQKMatch[1], 10) - 1;
    if (idx < 0 || idx >= picArray.length) {
      console.warn("[Settlement] trap card JQK index out of range", { bet_id: bet.id, selection, picArrayLength: picArray.length });
      return null;
    }
    const actual = normalize(picArray[idx]); // "YES"/"NO"
    const match = actual === "YES";
    const result = toOutcome(match);

    console.log("[Settlement] trap card JQK check", {
      bet_id: bet.id,
      selection,
      rdesc,
      idx: idx + 1,
      actual,
      match,
      type,
      betType,
      result,
    });
    return Boolean(result);
  }

  // If selection is only "Card N" (no qualifier), ambiguous -> return null
  if (/^CARD\s+\d+$/i.test(selRaw)) {
    console.warn("[Settlement] trap ambiguous Card N selection (need qualifier High/Low/JQK)", { bet_id: bet.id, selection });
    return null;
  }

  // Unknown selection
  console.warn("[Settlement] trap unknown selection", { bet_id: bet.id, selection, rdesc });
  return null;
}

// helper trap
function parseTrapRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  const main = parts[0] || "";
  const hlPart = parts[1] || "";   // "Low,High,High" or "Low High High"
  const picPart = parts[2] || "";  // "No,No,No" or "No No No"

  // parse A/B totals from main: look for (A:15, B:8) pattern
  let totals = { A: null, B: null };
  const m = main.match(/\(.*?A\s*:?\s*(\d+)[,;]?\s*B\s*:?\s*(\d+).*?\)/i);
  if (m) {
    totals.A = parseInt(m[1], 10);
    totals.B = parseInt(m[2], 10);
  } else {
    // try more permissive extraction (A:15) and (B:8) anywhere
    const ma = main.match(/A\s*:?\s*(\d+)/i);
    const mb = main.match(/B\s*:?\s*(\d+)/i);
    if (ma) totals.A = parseInt(ma[1], 10);
    if (mb) totals.B = parseInt(mb[1], 10);
  }

  // parse per-card arrays (allow comma or whitespace separation)
  const splitTokens = (s) => (s || "")
    .split(/[,|\s]+/)
    .map(x => x.trim())
    .filter(x => x.length > 0);

  const hlArray = splitTokens(hlPart);   // ["Low","High","High", ...]
  const picArray = splitTokens(picPart); // ["No","No","No", ...]

  return { main, totals, hlArray, picArray };
}

// resolveTrio: thin wrapper that applies BACK/LAY inversion to the raw market
// outcome. Trio offers LAY on Session / 3-Card Judgement / Two Red-Black /
// Two Odd-Even; settleBetCommon does NOT invert for lay, so the resolver must.
// Back-only markets never receive a lay bet, so the inversion is a no-op there.
async function resolveTrio(bet) {
  const outcome = await resolveTrioOutcome(bet);
  if (outcome === null || outcome === undefined) return outcome;
  const betType = String(bet.type || "back").toLowerCase();
  return betType === "lay" ? !outcome : outcome;
}

async function resolveTrioOutcome(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] trio missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'trio'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] trio no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || ""; // "Yes (23)#J Q K#Red#Even#"
  const { sessionPart, threeCardPart, redBlackPart, oddEvenPart } = parseTrioRdesc(rdesc);
  const cards = parseCardList(t1.card || ""); // e.g. [{rank:'Q',suit:'D'},...]

  const selRaw = (selection || "").toString().trim();
  const sel = normalize(selRaw);

  // 1) Session -> match if sessionPart includes YES
  if (sel === "SESSION") {
    const match = normalize(sessionPart).includes("YES");
    console.log("[Settlement] trio session check", { bet_id: bet.id, selection, sessionPart, match });
    return Boolean(match);
  }

  // 2) 3 Card Judgement (numbers) or (faces)
  if (/^3\s*CARD/i.test(selRaw) || /^3 CARD JUDGEMENT/i.test(sel)) {
    // extract requested tokens inside parentheses if present
    const m = selRaw.match(/\(([^)]+)\)/);
    if (!m) {
      console.warn("[Settlement] trio 3-card ambiguous (needs tokens)", { bet_id: bet.id, selection });
      return null;
    }
    const requested = m[1].trim().split(/\s+/).map(x => x.trim().toUpperCase()).filter(Boolean); // e.g. ["J","Q","K"] or ["1","2","4"]
    const available = (threeCardPart || "").split(/\s+/).map(x => x.trim().toUpperCase()).filter(Boolean); // token array

    // exact set match (order-insensitive)
    const reqSorted = requested.slice().sort().join(",");
    const availSorted = available.slice().sort().join(",");
    const match = reqSorted === availSorted;
    console.log("[Settlement] trio 3-card check", { bet_id: bet.id, selection, requested, available, match });
    return Boolean(match);
  }

  // 3) Two Red Only / Two Black Only
  if (sel === "TWO RED ONLY" || sel === "TWO BLACK ONLY") {
    const token = normalize(redBlackPart); // provider token likely "Red" or "Black"
    const want = sel === "TWO RED ONLY" ? "RED" : "BLACK";
    const match = token === want;
    console.log("[Settlement] trio two-red/black check", { bet_id: bet.id, selection, redBlackPart, token, match });
    return Boolean(match);
  }

  // 4) Two Odd Only / Two Even Only
  if (sel === "TWO ODD ONLY" || sel === "TWO EVEN ONLY") {
    const token = normalize(oddEvenPart); // "EVEN"/"ODD"
    const want = sel === "TWO EVEN ONLY" ? "EVEN" : "ODD";
    const match = token === want;
    console.log("[Settlement] trio two-odd/even check", { bet_id: bet.id, selection, oddEvenPart, token, match });
    return Boolean(match);
  }

  // Helper checks using parsed cards
  const ranks = cards.map(c => c.rank.toUpperCase());
  const suits = cards.map(c => c.suit.toUpperCase());
  const nums = ranks.map(rankToNumber).filter(n => n !== null);

  // 5) Pair (any two ranks equal)
  if (sel === "PAIR") {
    const hasPair = (new Set(ranks)).size <= 2 && (new Set(ranks)).size >= 1;
    // size==1 -> trio (also counts as pair true? For safety treat trio as pair=false)
    const isTrio = (new Set(ranks)).size === 1;
    const match = hasPair && !isTrio;
    console.log("[Settlement] trio pair check", { bet_id: bet.id, selection, ranks, isTrio, match });
    return Boolean(match);
  }

  // 6) Flush (all suits same)
  if (sel === "FLUSH") {
    const match = suits.length > 0 && suits.every(s => s === suits[0]);
    console.log("[Settlement] trio flush check", { bet_id: bet.id, selection, suits, match });
    return Boolean(match);
  }

  // 7) Straight (consecutive ranks)
  if (sel === "STRAIGHT") {
    // need three numeric ranks
    if (nums.length !== ranks.length || nums.length < 3) {
      console.warn("[Settlement] trio straight insufficient data", { bet_id: bet.id, ranks, nums });
      return null;
    }
    const match = isStraight(ranks);
    console.log("[Settlement] trio straight check", { bet_id: bet.id, selection, ranks, nums, match });
    return Boolean(match);
  }

  // 8) Trio (all three same rank)
  if (sel === "TRIO") {
    const match = (new Set(ranks)).size === 1;
    console.log("[Settlement] trio trio check", { bet_id: bet.id, selection, ranks, match });
    return Boolean(match);
  }

  // 9) Straight Flush (both straight and flush)
  if (sel === "STRAIGHT FLUSH") {
    const isFlush = suits.length > 0 && suits.every(s => s === suits[0]);
    const isStr = isStraight(ranks);
    const match = Boolean(isFlush && isStr);
    console.log("[Settlement] trio straight-flush check", { bet_id: bet.id, selection, ranks, suits, isFlush, isStr, match });
    return Boolean(match);
  }

  // Unknown selection -> not resolvable
  console.warn("[Settlement] trio unknown selection", { bet_id: bet.id, selection, rdesc, cards });
  return null;
}

// helper trio
function parseTrioRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    sessionPart: parts[0] || "",        // e.g. "Yes (23)"
    threeCardPart: parts[1] || "",     // e.g. "J Q K" or "1 2 4"
    redBlackPart: parts[2] || "",      // e.g. "Red" / "Black"
    oddEvenPart: parts[3] || "",       // e.g. "Even" / "Odd"
    patternPart: parts[4] || "",       // optional
  };
}

// parse t1.card into [{rank:'Q', suit:'D'}, ...]
// accepts forms like "QDD,8SS,3HH"
function parseCardList(cardStr) {
  if (!cardStr) return [];
  return cardStr
    .split(",")
    .map(c => c.trim())
    .filter(c => c.length > 0)
    .map(raw => {
      // raw examples: "QDD" (rank Q, suit D) or "10SS"
      // find rank (1-2 digits or J,Q,K,A) at start
      const m = raw.match(/^([0-9]{1,2}|10|J|Q|K|A)([CDHS]?)$/i);
      // provider sometimes uses two-letter suit like 'DD' or 'SS' => take last char
      if (!m) {
        // fallback: last char is suit, rest is rank
        const suit = raw.slice(-1).toUpperCase();
        const rank = raw.slice(0, -1).toUpperCase();
        return { rank, suit };
      }
      const rank = m[1].toUpperCase();
      let suit = m[2] ? m[2].toUpperCase() : "";
      if (!suit && raw.length >= 1) suit = raw.slice(-1).toUpperCase();
      return { rank, suit };
    });
}

// rank -> numeric value for straight detection (A as 1 and 14 handled)
function rankToNumber(rank) {
  if (!rank) return null;
  if (/^\d+$/.test(rank)) return parseInt(rank, 10);
  const map = { A: 1, J: 11, Q: 12, K: 13 };
  return map[rank] || null;
}

// helper: is consecutive (handles A as 1 only); for trio small set it's enough
function isStraight(ranks) {
  const nums = ranks.map(rankToNumber).filter(n => n !== null);
  if (nums.length !== ranks.length) return false;
  nums.sort((a, b) => a - b);

  // check normal consecutive
  let ok = true;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1) { ok = false; break; }
  }
  if (ok) return true;

  // try A-high sequences (convert A(1) to 14 if needed)
  const numsAHigh = nums.map(n => (n === 1 ? 14 : n)).sort((a, b) => a - b);
  for (let i = 1; i < numsAHigh.length; i++) {
    if (numsAHigh[i] !== numsAHigh[i - 1] + 1) return false;
  }
  return true;
}

async function resolveDusKaDum(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] duskadum missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] duskadum no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = (t1.winnat || "").toString();
  const { cardPart, totalPart, totalCalcPart, oddEvenPart, redBlackPart } = parseDusRdesc(rdesc);

  const sel = (selection || "").toString().trim();
  const selNorm = normalize(sel);
  const betType = normalize(type || "BACK"); // MUST use bet.type for final mapping

  // Helper: convert match boolean -> outcome using back/lay semantics
  const toOutcome = (match) => (match ? (betType === "BACK") : (betType === "LAY"));

  // Helper: try to parse computed total from totalCalcPart
  const parseComputedTotal = (s) => {
    if (!s) return null;
    // 1) look for "= N" pattern
    let m = s.match(/=\s*([0-9]{1,})/);
    if (m) return parseInt(m[1], 10);
    // 2) if not found, extract all integers and return the largest (fallback)
    const all = s.match(/\d+/g);
    if (all && all.length) {
      const nums = all.map(n => parseInt(n, 10));
      return Math.max(...nums);
    }
    return null;
  };

  // Helper: extract threshold from selection like "Next Total 240 or More"
  const parseThresholdFromSelection = (s) => {
    const m = s.match(/NEXT\s*TOTAL\s*(\d+)\s*OR\s*MORE/i);
    if (m) return parseInt(m[1], 10);
    return null;
  };

  // -------- NEXT TOTAL dynamic handling --------
  const threshold = parseThresholdFromSelection(sel);
  if (threshold !== null) {
    // Prefer numeric comparison using computed total
    const computed = parseComputedTotal(totalCalcPart);

    if (computed !== null) {
      const match = computed >= threshold;
      const outcome = toOutcome(match);
      console.log("[Settlement] duskadum next-total numeric check", {
        bet_id: bet.id,
        selection,
        threshold,
        rdesc,
        totalCalcPart,
        computed,
        match,
        betType,
        outcome,
      });
      return Boolean(outcome);
    }

    // Fallback to provider Yes/No flags
    const providerYes = hasYes(totalCalcPart) || hasYes(winnat);
    const providerNo = hasNo(totalCalcPart) || hasNo(winnat);

    if (providerYes || providerNo) {
      const match = providerYes && !providerNo;
      const outcome = toOutcome(match);
      console.log("[Settlement] duskadum next-total fallback Yes/No check", {
        bet_id: bet.id,
        selection,
        threshold,
        rdesc,
        totalCalcPart,
        winnat,
        providerYes,
        providerNo,
        match,
        betType,
        outcome,
      });
      return Boolean(outcome);
    }

    // Unparseable -> return null
    console.warn("[Settlement] duskadum next-total unparseable", {
      bet_id: bet.id,
      selection,
      threshold,
      rdesc,
      totalCalcPart,
      winnat,
    });
    return null;
  }

  // -------- other selections (respect bet.type) --------
  if (selNorm === "RED" || selNorm === "BLACK") {
    const rbNorm = normalize(redBlackPart);
    const match = selNorm === rbNorm;
    const outcome = toOutcome(match);
    console.log("[Settlement] duskadum red-black check", {
      bet_id: bet.id,
      selection,
      redBlackPart,
      rbNorm,
      match,
      betType,
      outcome,
    });
    return Boolean(outcome);
  }

  if (selNorm === "EVEN" || selNorm === "ODD") {
    const oeNorm = normalize(oddEvenPart);
    const match = selNorm === oeNorm;
    const outcome = toOutcome(match);
    console.log("[Settlement] duskadum odd-even check", {
      bet_id: bet.id,
      selection,
      oddEvenPart,
      oeNorm,
      match,
      betType,
      outcome,
    });
    return Boolean(outcome);
  }

  console.warn("[Settlement] duskadum unknown selection", { bet_id: bet.id, selection, rdesc });
  return null;
}

// helper duskadum

function parseDusRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    cardPart: parts[0] || "",
    totalPart: parts[1] || "",      // may contain "Next Total ..." phrase
    totalCalcPart: parts[2] || "",  // contains computed total and Yes/No (e.g. "236 + 5 = 241 | Yes")
    oddEvenPart: parts[3] || "",
    redBlackPart: parts[4] || "",
  };
}

const hasYes = (s) => normalize(s).includes("YES");
const hasNo = (s) => normalize(s).includes("NO");


//notenum

async function resolveNoteNumber(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] noteNumber missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'noteNumber' or whatever your type is
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] noteNumber no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const { oddEvenArray, colorArray, lowHighArray, cardValues, baccaratPart } = parseNoteNumberRdesc(rdesc);

  const selRaw = (selection || "").toString().trim();
  const sel = normalize(selRaw);
  const betType = normalize(type || "BACK");

  // helper: convert match boolean -> back/lay outcome
  const toOutcome = (match) => (match ? (betType === "BACK") : (betType === "LAY"));

  // helper: parse "Card N" index
  const parseCardIndex = (s) => {
    const m = s.match(/CARD\s+(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
  };

  // 1) Odd / Even Card N  (expects "Odd Card 1" or "Even Card 1")
  let m = selRaw.match(/^(Odd|Even)\s+Card\s+(\d+)$/i);
  if (m) {
    const want = m[1].toUpperCase(); // "ODD" or "EVEN"
    const idx = parseInt(m[2], 10) - 1;
    if (idx < 0 || idx >= oddEvenArray.length) {
      console.warn("[Settlement] noteNumber odd/even index out of range", { bet_id: bet.id, selection, oddEvenArrayLength: oddEvenArray.length });
      return null;
    }
    const actual = normalize(oddEvenArray[idx]); // "ODD"/"EVEN"
    const match = actual === want.toUpperCase();
    console.log("[Settlement] noteNumber odd/even check", { bet_id: bet.id, selection, idx: idx + 1, want, actual, match, betType });
    return Boolean(toOutcome(match));
  }

  // 2) Red / Black Card N
  m = selRaw.match(/^(Red|Black)\s+Card\s+(\d+)$/i);
  if (m) {
    const want = m[1].toUpperCase(); // "RED" or "BLACK"
    const idx = parseInt(m[2], 10) - 1;
    if (idx < 0 || idx >= colorArray.length) {
      console.warn("[Settlement] noteNumber color index out of range", { bet_id: bet.id, selection, colorArrayLength: colorArray.length });
      return null;
    }
    const actual = normalize(colorArray[idx]); // "RED"/"BLACK"
    const match = actual === want;
    console.log("[Settlement] noteNumber color check", { bet_id: bet.id, selection, idx: idx + 1, want, actual, match, betType });
    return Boolean(toOutcome(match));
  }

  // 3) Low / High Card N
  m = selRaw.match(/^(Low|High)\s+Card\s+(\d+)$/i);
  if (m) {
    const want = m[1].toUpperCase(); // "LOW" or "HIGH"
    const idx = parseInt(m[2], 10) - 1;
    if (idx < 0 || idx >= lowHighArray.length) {
      console.warn("[Settlement] noteNumber low/high index out of range", { bet_id: bet.id, selection, lowHighArrayLength: lowHighArray.length });
      return null;
    }
    const actual = normalize(lowHighArray[idx]); // "LOW"/"HIGH"
    const match = actual === want;
    console.log("[Settlement] noteNumber low/high check", { bet_id: bet.id, selection, idx: idx + 1, want, actual, match, betType });
    return Boolean(toOutcome(match));
  }

  // 4) Baccarat 1 / Baccarat 2
  if (sel === "BACCARAT 1" || sel === "BACCARAT 2") {
    // parse baccaratPart for "Baccarat 2 (B1 : 4  |  B2 : 9)" or similar
    const want = sel === "BACCARAT 1" ? "BACCARAT 1" : "BACCARAT 2";
    const bpartNorm = normalize(baccaratPart);

    // match if baccaratPart mentions the requested baccarat
    // e.g. "BACCARAT 2 (B1 : 4 | B2 : 9)" -> contains "BACCARAT 2"
    const match = bpartNorm.includes(want);
    console.log("[Settlement] noteNumber baccarat check", { bet_id: bet.id, selection, baccaratPart, bpartNorm, match, betType });
    return Boolean(toOutcome(match));
  }

  // 5) Card 1 (ambiguous) -> we choose to return null and warn.
  if (/^CARD\s+\d+$/i.test(selRaw)) {
    // ambiguous because no qualifier; you can change this to compare exact numeric value if needed.
    console.warn("[Settlement] noteNumber ambiguous Card N selection (needs qualifier)", { bet_id: bet.id, selection });
    return null;
  }

  // Unknown selection -> not resolvable
  console.warn("[Settlement] noteNumber unknown selection", { bet_id: bet.id, selection, rdesc });
  return null;
}

//helper

function parseNoteNumberRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  const splitTokens = (s) => (s || "").split(/\s+/).map(x => x.trim()).filter(Boolean);
  return {
    oddEvenArray: splitTokens(parts[0] || ""),   // ["Odd","Odd","Even",...]
    colorArray: splitTokens(parts[1] || ""),     // ["Red","Black",...]
    lowHighArray: splitTokens(parts[2] || ""),   // ["High","High",...]
    cardValues: splitTokens(parts[3] || ""),     // ["9","9","6","10",...]
    baccaratPart: parts[4] || "",                // e.g. "Baccarat 2 (B1 : 4  |  B2 : 9)"
  };
}

async function resolveQueen(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] queen missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'queen'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] queen no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";
  const { raw, totalNum } = parseQueenRdesc(rdesc);

  // fallback: try to parse from winnat if rdesc had no number
  const total = totalNum !== null ? totalNum : ((() => {
    const m = (winnat || "").toString().match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  })());

  if (total === null) {
    console.warn("[Settlement] queen could not parse total", { bet_id: bet.id, rdesc, winnat });
    return null;
  }

  // parse selection number (e.g. "Total 1" -> 1)
  const selMatch = (selection || "").toString().match(/(\d+)/);
  if (!selMatch) {
    console.warn("[Settlement] queen selection not numeric", { bet_id: bet.id, selection });
    return null;
  }
  const selNum = parseInt(selMatch[1], 10);

  const match = selNum === total;
  const betType = normalize(type || "BACK");
  const outcome = match ? (betType === "BACK") : (betType === "LAY");

  console.log("[Settlement] queen check", {
    bet_id: bet.id,
    selection,
    selNum,
    rdesc,
    winnat,
    total,
    match,
    type,
    betType,
    outcome,
  });

  return Boolean(outcome);
}

// helper queen
function parseQueenRdesc(rdesc) {
  const txt = (rdesc || "").trim();
  // try find a number in the string
  const m = txt.match(/(\d+)/);
  return {
    raw: txt,
    totalNum: m ? parseInt(m[1], 10) : null,
  };
}

// lottcard

async function resolveLottcard(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] lottcard missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'lottcard' or 'lottery'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] lottcard no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";    // e.g. "6  3  9"
  const resultNums = parseLottRdesc(rdesc); // [6,3,9]

  // lottcard markets are the patti TYPE of the 3 drawn numbers (no number is
  // picked by the player): Single = all 3 distinct (SP), Double = exactly 2 same
  // (DP), Triple = all 3 same (TP). e.g. rdesc "5  5  0" → Double.
  const nums = resultNums.slice(0, 3);
  if (nums.length < 3) {
    console.warn("[Settlement] lottcard incomplete result", { bet_id: bet.id, rdesc, resultNums });
    return null;
  }
  const uniq = new Set(nums).size;
  const isTriple = uniq === 1;
  const isDouble = uniq === 2;
  const isSingle = uniq === 3;

  const sel = normalize(selection);
  const betType = String(type || "back").toLowerCase();
  const applyLay = (w) => (betType === "lay" ? !w : w);

  if (sel === "SINGLE") return applyLay(isSingle);
  if (sel === "DOUBLE") return applyLay(isDouble);
  if (sel === "TRIPLE" || sel === "TRIPPLE") return applyLay(isTriple);

  console.warn("[Settlement] lottcard unknown selection", { bet_id: bet.id, selection });
  return null;
}

// helper lottcard

function parseLottRdesc(rdesc) {
  // extract all integers (allow 10 as two-digit)
  const nums = (rdesc || "").match(/\d+/g) || [];
  // convert to numbers (but keep as strings sometimes for exact matching is fine)
  return nums.map(n => parseInt(n, 10));
}

// helper: parse numbers list from selection body like:
// "Single 2", "Double 25", "Double 2 5", "Tripple 664", "Tripple 6,6,4"
function parseSelectionNumbers(selection) {
  if (!selection) return null;
  const sel = selection.trim();

  // find primary keyword and the payload after it
  const m = sel.match(/^(\w+)\s*(.*)$/i);
  if (!m) return null;
  const kind = m[1].toUpperCase(); // SINGLE / DOUBLE / TRIPPLE (or TRIPLE)
  let payload = (m[2] || "").trim();

  // normalize spelling
  const kindNorm = kind === "TRIPPLE" ? "TRIPLE" : kind;

  // If payload empty -> can't parse
  if (!payload) return { kind: kindNorm, numbers: [] };

  // Try to extract all integer tokens first
  let nums = payload.match(/\d+/g);
  if (nums && nums.length >= 1) {
    // convert "25" -> ["25"] (we'll handle concatenated digits below if needed)
    nums = nums.map(x => parseInt(x, 10));
    // If kind expects 2 numbers but we got 1 integer and that integer's digits length == count needed (e.g. "25" for double),
    // attempt to split into digits while preserving "10" as two-digit token (heuristic).
    if ((kindNorm === "DOUBLE") && nums.length === 1) {
      const s = payload.replace(/\s+/g, "");
      // split into single-char digits but keep "10" as '10' if present
      const splitDigits = s.match(/10|\d/g); // matches '10' or single digits
      if (splitDigits && splitDigits.length === 2) {
        nums = splitDigits.map(x => parseInt(x, 10));
      }
    }
    if ((kindNorm === "TRIPLE") && nums.length === 1) {
      const s = payload.replace(/\s+/g, "");
      const splitDigits = s.match(/10|\d/g);
      if (splitDigits && splitDigits.length === 3) {
        nums = splitDigits.map(x => parseInt(x, 10));
      }
    }
    return { kind: kindNorm, numbers: nums };
  }

  // As fallback, if payload is concatenated letters/digits, try per-digit
  const allDigits = payload.match(/\d/g);
  if (allDigits && allDigits.length > 0) {
    const numsFallback = allDigits.map(d => parseInt(d, 10));
    return { kind: kindNorm, numbers: numsFallback };
  }

  return { kind: kindNorm, numbers: [] };
}

// helper: compare multisets of numbers (order-insensitive, multiplicity counts)
function multisetEquals(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const freq = {};
  for (const x of a) {
    freq[x] = (freq[x] || 0) + 1;
  }
  for (const y of b) {
    if (!freq[y]) return false;
    freq[y]--;
  }
  return true;
}

// rouleets 

// resolveRouletteSimple: thin wrapper applying BACK/LAY inversion. roulette12 /
// roulette13 (and roulette11 once aliased) expose a Back/Lay switch; ourroullete
// is back-only (inversion is a no-op there). settleBetCommon doesn't invert.
async function resolveRouletteSimple(bet) {
  const outcome = await resolveRouletteSimpleOutcome(bet);
  if (outcome === null || outcome === undefined) return outcome;
  const betType = String(bet.type || "back").toLowerCase();
  return betType === "lay" ? !outcome : outcome;
}

async function resolveRouletteSimpleOutcome(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] roulette-simple missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] roulette-simple no t1 data yet for bet", bet.id);
    return null;
  }

  const winNum = parseNumber(t1.rdesc, t1.winnat);
  if (winNum === null) {
    console.warn("[Settlement] roulette-simple cannot parse winning number", bet.id);
    return null;
  }

  const sel = normalize(selection);

  // 1) Straight number (allow "0" through "36")
  if (/^\d+$/.test(sel)) {
    const selNum = parseInt(sel, 10);
    return selNum === winNum;
  }

  // 1b) Multi-number combos: split ("0,1"), street ("1,2,3"),
  //     corner ("1,2,4,5"), top-line ("0,1,2,3"), top split ("0,1,2").
  //     Win if winNum is in the set.
  if (/^[\d,\s]+$/.test(sel)) {
    const nums = sel
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    if (nums.length > 0) return nums.includes(winNum);
  }

  // 2) Dozens
  if (sel === "1ST 12") return winNum >= 1 && winNum <= 12;
  if (sel === "2ND 12") return winNum >= 13 && winNum <= 24;
  if (sel === "3RD 12") return winNum >= 25 && winNum <= 36;

  // 3) Columns (1st column %3==1, 2nd %3==2, 3rd %3==0), only for 1..36
  if (sel === "1ST COLUMN") return (winNum >= 1 && winNum <= 36) && (winNum % 3 === 1);
  if (sel === "2ND COLUMN") return (winNum >= 1 && winNum <= 36) && (winNum % 3 === 2);
  if (sel === "3RD COLUMN") return (winNum >= 1 && winNum <= 36) && (winNum % 3 === 0);

  // 4) Ranges
  if (sel === "1 TO 18") return winNum >= 1 && winNum <= 18;
  if (sel === "19 TO 36") return winNum >= 19 && winNum <= 36;

  // 5) Colors (0 is green)
  if (sel === "RED") return RED_NUMBERS.has(winNum);
  if (sel === "BLACK") return BLACK_NUMBERS.has(winNum);
  if (sel === "GREEN") return GREEN_NUMBERS.has(winNum);

  // 6) Odd / Even (0 is neither)
  if (sel === "ODD") return (winNum !== 0 && winNum % 2 === 1);
  if (sel === "EVEN") return (winNum !== 0 && winNum % 2 === 0);

  // Unknown selection
  console.warn("[Settlement] roulette-simple unknown selection", bet.id, selection);
  return null;
}

// helper roulette-simple
function parseNumber(rdesc, winnat) {
  const m1 = (rdesc || "").match(/-?\d+/);
  if (m1) return parseInt(m1[0], 10);
  const m2 = (winnat || "").match(/-?\d+/);
  if (m2) return parseInt(m2[0], 10);
  return null;
}

// red/black sets taken from your image
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BLACK_NUMBERS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]);
const GREEN_NUMBERS = new Set([0]);

// dolidana

async function resolveDolidana(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] dolidana missing event_id/selection", bet.id);
    return null;
  }

  // Fetch detail results
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'dolidana'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] dolidana no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";
  const { mainPart, extraPart } = parseDolidanaRdesc(rdesc);

  const cards = parseTwoCards(t1.card || (winnat || ""));
  if (!cards) {
    console.warn("[Settlement] dolidana could not parse cards", { bet_id: bet.id, card: t1.card, winnat });
    return null;
  }
  const [c1, c2] = cards;
  const sum = c1 + c2;

  const sel = normalize(selection);

  // 1) Player A / Player B — check winner token
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    const winnerNorm = normalize(mainPart || winnat || extraPart);
    const match = winnerNorm.includes(sel); // if rdesc like "Player A#Player A"
    console.log("[Settlement] dolidana player check", { bet_id: bet.id, selection, rdesc, winnat, winnerNorm, match });
    return Boolean(match);
  }

  // 2) Any Pair
  if (sel === "ANY PAIR") {
    const match = c1 === c2;
    console.log("[Settlement] dolidana any-pair check", { bet_id: bet.id, selection, c1, c2, match });
    return Boolean(match);
  }

  // 3) Specific pairs 1-1 ... 6-6
  const pairMatch = sel.match(/^(\d+)-\1\s+PAIR$/i); // matches "1-1 Pair"
  if (pairMatch) {
    const val = parseInt(pairMatch[1], 10);
    const match = c1 === val && c2 === val;
    console.log("[Settlement] dolidana specific-pair check", { bet_id: bet.id, selection, c1, c2, val, match });
    return Boolean(match);
  }

  // Some front-ends might send "1-1 Pair" as "1-1 Pair" or "1-1 pair". We handled above.
  // Also support explicit spelled forms like "1-1 PAIR" already.

  // 4) Sum Total N (2..12)
  const sumMatch = sel.match(/^SUM\s+TOTAL\s+(\d+)$/i);
  if (sumMatch) {
    const want = parseInt(sumMatch[1], 10);
    if (Number.isNaN(want)) return null;
    const match = sum === want;
    console.log("[Settlement] dolidana sum-total check", { bet_id: bet.id, selection, c1, c2, sum, want, match });
    return Boolean(match);
  }

  // 5) Odd / Even
  if (sel === "ODD") {
    const match = sum % 2 === 1;
    console.log("[Settlement] dolidana odd check", { bet_id: bet.id, selection, sum, match });
    return Boolean(match);
  }
  if (sel === "EVEN") {
    const match = sum % 2 === 0;
    console.log("[Settlement] dolidana even check", { bet_id: bet.id, selection, sum, match });
    return Boolean(match);
  }

  // 6) Lucky 7
  if (sel === "LUCKY 7" || sel === "LUCKY7") {
    const match = sum === 7;
    console.log("[Settlement] dolidana lucky7 check", { bet_id: bet.id, selection, sum, match });
    return Boolean(match);
  }

  // 7) Greater than 7 / Less than 7
  if (sel === "GREATER THAN 7") {
    const match = sum > 7;
    console.log("[Settlement] dolidana greater-than-7 check", { bet_id: bet.id, selection, sum, match });
    return Boolean(match);
  }
  if (sel === "LESS THAN 7") {
    const match = sum < 7;
    console.log("[Settlement] dolidana less-than-7 check", { bet_id: bet.id, selection, sum, match });
    return Boolean(match);
  }

  // Unknown selection
  console.warn("[Settlement] dolidana unknown selection", { bet_id: bet.id, selection, rdesc, cards });
  return null;
}

// helper dolidana
function parseDolidanaRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    mainPart: parts[0] || "",   // e.g. "Player A"
    extraPart: parts[1] || "",  // optional second token
  };
}

function parseTwoCards(cardStr) {
  if (!cardStr) return null;
  // card string example: "5,6" or "5, 6"
  const nums = cardStr.split(/[,|\s]+/).map(x => x.trim()).filter(Boolean);
  if (nums.length < 2) return null;
  const a = parseInt(nums[0], 10);
  const b = parseInt(nums[1], 10);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return [a, b];
}

// mogambo 

async function resolveMogambo(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] mogambo missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] mogambo no t1 data yet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";
  const sel = normalize(selection);

  // parse winner
  const winner = normalize(parseWinner(rdesc, winnat)); // e.g. "DAGA/TEJA"

  // parse total
  let total = parseTotal(rdesc);
  if (total === null) {
    const nums = parse3Cards(t1.card);
    if (nums) total = nums.reduce((a, b) => a + b, 0);
  }

  const betType = normalize(type || "BACK"); // used only for total

  // ------------------------------  
  // WINNER SELECTION (no back/lay)
  // ------------------------------
  if (sel === "MOGAMBO" || sel === "DAGA / TEJA" || sel === "DAGA/TEJA") {
    const pureSel = sel.replace(/\s+/g, "");
    const pureWin = winner.replace(/\s+/g, "");

    const isWin = pureSel === pureWin; // pure match
    console.log("[Settlement] mogambo winner check", {
      bet_id: bet.id,
      selection,
      winner,
      isWin
    });
    return Boolean(isWin);
  }

  // ------------------------------  
  // 3 CARD TOTAL (uses type)
  // ------------------------------
  const totalMatch = sel.match(/^3\s*CARD\s*TOTAL\s*(\d+)/i);
  if (totalMatch) {
    const want = parseInt(totalMatch[1], 10);
    if (Number.isNaN(want) || total === null) return null;

    const equal = (want === total);

    const outcome = equal
      ? (betType === "BACK")
      : (betType === "LAY");

    console.log("[Settlement] mogambo total check", {
      bet_id: bet.id,
      selection,
      want,
      total,
      equal,
      type: betType,
      outcome
    });

    return Boolean(outcome);
  }

  console.warn("[Settlement] mogambo unknown selection", {
    bet_id: bet.id,
    selection,
    rdesc
  });
  return null;
}

// helper mogambo

function parse3Cards(cardStr) {
  const raw = (cardStr || "").split(/[, ]+/).filter(Boolean);
  if (raw.length < 3) return null;

  const nums = raw.map(c => {
    // rank = first 1 or 2 chars until letter
    const m = c.match(/^(\d+|A|J|Q|K)/i);
    if (!m) return null;

    const r = m[1].toUpperCase();
    if (/^\d+$/.test(r)) return parseInt(r, 10);

    // map face cards
    const map = { A: 1, J: 11, Q: 12, K: 13 };
    return map[r] ?? null;
  });

  if (nums.includes(null)) return null;

  return nums;
}

function parseWinner(rdesc, winnat) {
  // rdesc like "Daga/Teja#13"
  const parts = (rdesc || "").split("#");
  const winner = parts[0] || "";
  return winner.trim() || winnat || "";
}

function parseTotal(rdesc) {
  const parts = (rdesc || "").split("#");
  if (parts.length < 2) return null;
  const num = parseInt(parts[1], 10);
  return Number.isNaN(num) ? null : num;
}


// teen sin 

//helper 
function parseTeensinRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  // Extract high card values from "(A: 6 | B: 1)"
  let aHigh = null, bHigh = null;
  const m = parts[0]?.match(/A\s*:\s*(\d+)\s*\|\s*B\s*:\s*(\d+)/i);
  if (m) {
    aHigh = parseInt(m[1], 10);
    bHigh = parseInt(m[2], 10);
  }

  return {
    highA: aHigh,
    highB: bHigh,
    pairWinner: normalize(parts[1] || ""),        // PLAYER A / PLAYER B
    colorPlusWinner: normalize(parts[2] || ""),  // PLAYER A / PLAYER B
    lucky9: normalize(parts[4] || ""),            // YES / NO
  };
}

//s

async function resolveTeensin(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teensin missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // teensin
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teensin no t1 data yet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";
  const winnat = t1.winnat || "";

  const {
    highA,
    highB,
    pairWinner,
    colorPlusWinner,
    lucky9
  } = parseTeensinRdesc(rdesc);

  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---------------- Player A / B ----------------
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    marketWin = normalize(winnat) === sel;
  }

  // ---------------- High Card ----------------
  else if (sel === "HIGH CARD A") {
    marketWin = highA !== null && highB !== null && highA > highB;
  } else if (sel === "HIGH CARD B") {
    marketWin = highA !== null && highB !== null && highB > highA;
  }

  // ---------------- Pair ----------------
  else if (sel === "PAIR A") {
    marketWin = pairWinner === "PLAYER A";
  } else if (sel === "PAIR B") {
    marketWin = pairWinner === "PLAYER B";
  }

  // ---------------- Color Plus ----------------
  else if (sel === "COLOR PLUS A") {
    marketWin = colorPlusWinner === "PLAYER A";
  } else if (sel === "COLOR PLUS B") {
    marketWin = colorPlusWinner === "PLAYER B";
  }

  // ---------------- Lucky 9 ----------------
  // Lucky 9 is a Yes/No market with BACK+LAY. Set the raw outcome and let the
  // common BACK/LAY line below apply inversion (previously the NO branch did
  // `return false`, which wrongly settled LAY-on-NO as a loss instead of a win).
  else if (sel === "LUCKY 9") {
    marketWin = lucky9 === "YES";
  }

  // BACK / LAY application
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] teensin resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    rdesc,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// lucky 15 

function normalizeLucky15Result(rdesc, winnat) {
  const raw = (rdesc || winnat || "").toString().trim();

  // Wicket
  if (/WICKET/i.test(raw)) return "WICKET";

  // Runs (numeric)
  const m = raw.match(/(\d+)/);
  if (m) {
    return `${m[1]} RUNS`; // "6 RUNS"
  }

  return null;
}

async function resolveLucky15(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] lucky15 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // lucky15
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] lucky15 no t1 data yet", bet.id);
    return null;
  }

  const winKey = normalizeLucky15Result(t1.rdesc, t1.winnat);
  if (!winKey) {
    console.warn("[Settlement] lucky15 unable to parse result", {
      bet_id: bet.id,
      rdesc: t1.rdesc,
      winnat: t1.winnat,
    });
    return null;
  }

  const sel = normalize(selection);          // "6 RUNS", "WICKET"
  const betType = normalize(type || "BACK"); // BACK / LAY

  // Validate selection
  const validSelections = new Set([
    "0 RUNS",
    "1 RUNS",
    "2 RUNS",
    "4 RUNS",
    "6 RUNS",
    "WICKET",
  ]);

  if (!validSelections.has(sel)) {
    console.warn("[Settlement] lucky15 unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // Market outcome
  const marketWin = sel === winKey;

  // BACK / LAY logic
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] lucky15 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    winKey,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// sicbo 
function parseSicBoDice(str) {
  const nums = (str || "")
    .split(",")
    .map(n => parseInt(n.trim(), 10))
    .filter(n => !Number.isNaN(n));

  return nums.length === 3 ? nums : null;
}

function countOccurrences(arr, num) {
  return arr.filter(x => x === num).length;
}
//
async function resolveSicbo(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] sicbo missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // sicbo
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] sicbo no t1 data yet", bet.id);
    return null;
  }

  const dice = parseSicBoDice(t1.card || t1.rdesc || t1.winnat);
  if (!dice) {
    console.warn("[Settlement] sicbo invalid dice data", {
      bet_id: bet.id,
      rdesc: t1.rdesc,
      card: t1.card,
    });
    return null;
  }

  const selRaw = selection.toString().trim();
  const sel = normalize(selRaw);
  const betType = normalize(type || "BACK");

  const total = dice.reduce((a, b) => a + b, 0);
  const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

  let marketWin = false;

  // -------- Small / Big --------
  if (sel === "SMALL") {
    marketWin = total >= 4 && total <= 10 && !isTriple;
  } else if (sel === "BIG") {
    marketWin = total >= 11 && total <= 17 && !isTriple;
  }

  // -------- Odd / Even --------
  else if (sel === "ODD") {
    marketWin = total % 2 === 1;
  } else if (sel === "EVEN") {
    marketWin = total % 2 === 0;
  }

  // -------- Any Triple --------
  else if (sel === "ANY TRIPLE") {
    marketWin = isTriple;
  }

  // -------- Double N --------
  else if (/^DOUBLE\s+\d+$/i.test(selRaw)) {
    const n = parseInt(selRaw.match(/\d+/)[0], 10);
    marketWin = countOccurrences(dice, n) >= 2;
  }

  // -------- Triple N --------
  else if (/^TRIPLE\s+\d+$/i.test(selRaw)) {
    const n = parseInt(selRaw.match(/\d+/)[0], 10);
    marketWin = isTriple && dice[0] === n;
  }

  // -------- Total N --------
  else if (/^TOTAL\s+\d+$/i.test(selRaw)) {
    const n = parseInt(selRaw.match(/\d+/)[0], 10);
    marketWin = total === n;
  }

  // -------- Combination A and B --------
  else if (/^COMBINATION\s+\d+\s+AND\s+\d+$/i.test(selRaw)) {
    const nums = selRaw.match(/\d+/g).map(n => parseInt(n, 10));
    const [a, b] = nums;
    marketWin = dice.includes(a) && dice.includes(b);
  }

  // -------- Single N --------
  else if (/^SINGLE\s+\d+$/i.test(selRaw)) {
    const n = parseInt(selRaw.match(/\d+/)[0], 10);
    marketWin = dice.includes(n);
  }

  else {
    console.warn("[Settlement] sicbo unknown selection", {
      bet_id: bet.id,
      selection,
      dice,
    });
    return null;
  }

  // BACK / LAY logic
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] sicbo resolve ✅", {
    bet_id: bet.id,
    selection,
    dice,
    total,
    isTriple,
    type: betType,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// abj 

function parseAbjRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  return {
    side: normalize(parts[0] || ""),   // ANDAR / BAHAR
    suit: normalize(parts[1] || ""),   // SPADE / CLUB / HEART / DIAMOND
    parity: normalize(parts[2] || ""), // ODD / EVEN
    rank: normalize(parts[3] || ""),   // A,2..10,J,Q,K
  };
}

function jokerRankValue(rank) {
  const map = {
    A: 1, J: 11, Q: 12, K: 13
  };
  return map[rank] || parseInt(rank, 10) || null;
}


//
async function resolveAbj(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] abj missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // abj
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] abj no t1 yet", bet.id);
    return null;
  }

  const {
    side,
    suit,
    parity,
    rank
  } = parseAbjRdesc(t1.rdesc);

  if (!side || !rank) {
    console.warn("[Settlement] abj invalid rdesc", {
      bet_id: bet.id,
      rdesc: t1.rdesc,
    });
    return null;
  }

  const selRaw = selection.toString().trim();
  const sel = normalize(selRaw);
  const betType = normalize(type || "BACK");

  const rankVal = jokerRankValue(rank);
  let marketWin = false;

  // -------- SA / SB --------
  if (sel === "SA") {
    marketWin = side === "ANDAR";
  } else if (sel === "SB") {
    marketWin = side === "BAHAR";
  }

  // -------- 1st / 2nd Bet (joker rank low/high) --------
  // The frontend groups these under each side and sends "1st Bet SA"/"2nd Bet SB"
  // etc.; the win condition is the joker's rank range (the rdesc carries only the
  // joker card, no per-side card data), so the SA/SB suffix is just UI grouping.
  else if (sel.startsWith("1ST BET")) {
    marketWin = rankVal !== null && rankVal <= 7;
  } else if (sel.startsWith("2ND BET")) {
    marketWin = rankVal !== null && rankVal >= 8;
  }

  // -------- Joker Rank / Suit / Odd-Even --------
  else if (sel.startsWith("JOKER ") && sel.split(" ").length === 2) {
    const token = normalize(sel.split(" ")[1]);

    if (token === "ODD") {
      marketWin = rankVal !== null && rankVal % 2 === 1;
    } else if (token === "EVEN") {
      marketWin = rankVal !== null && rankVal % 2 === 0;
    } else if (token === suit) {
      marketWin = true;
    } else {
      marketWin = token === rank;
    }
  }

  else {
    console.warn("[Settlement] abj unknown selection", {
      bet_id: bet.id,
      selection,
      rdesc: t1.rdesc,
    });
    return null;
  }

  // BACK / LAY
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] abj resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    side,
    suit,
    rank,
    parity,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

//dt202
function parseDT202Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  const winner = parts[0] || "";        // Dragon / Tiger / Tie
  const pair = parts[1] || "";          // Yes / No
  const oddEven = parts[2] || "";       // D : Even | T : Odd
  const color = parts[3] || "";         // D : Red | T : Black
  const cards = parts[4] || "";         // D : 10 | T : 4

  const extractDT = (str) => {
    const d = str.match(/D\s*:\s*([A-Za-z0-9]+)/i);
    const t = str.match(/T\s*:\s*([A-Za-z0-9]+)/i);
    return {
      D: d ? d[1].toUpperCase() : null,
      T: t ? t[1].toUpperCase() : null,
    };
  };

  return {
    winner: winner.toUpperCase(),
    pair: pair.toUpperCase(),
    oddEven: extractDT(oddEven),
    color: extractDT(color),
    cards: extractDT(cards),
  };
}

// helper 

async function resolveDT202(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] dt202 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // dt202
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] dt202 no t1 yet", bet.id);
    return null;
  }

  const data = parseDT202Rdesc(t1.rdesc || "");
  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---- MAIN RESULT ----
  if (["DRAGON", "TIGER", "TIE"].includes(sel)) {
    marketWin = sel === data.winner;
  }

  // ---- PAIR ----
  else if (sel === "PAIR") {
    marketWin = data.pair === "YES";
  }

  // ---- ODD / EVEN ----
  else if (sel === "DRAGON EVEN") marketWin = data.oddEven.D === "EVEN";
  else if (sel === "DRAGON ODD") marketWin = data.oddEven.D === "ODD";
  else if (sel === "TIGER EVEN") marketWin = data.oddEven.T === "EVEN";
  else if (sel === "TIGER ODD") marketWin = data.oddEven.T === "ODD";

  // ---- COLOR ----
  else if (sel === "DRAGON RED") marketWin = data.color.D === "RED";
  else if (sel === "DRAGON BLACK") marketWin = data.color.D === "BLACK";
  else if (sel === "TIGER RED") marketWin = data.color.T === "RED";
  else if (sel === "TIGER BLACK") marketWin = data.color.T === "BLACK";

  // ---- CARD ----
  else if (sel.startsWith("DRAGON CARD")) {
    const want = sel.replace("DRAGON CARD", "").trim();
    marketWin = data.cards.D === want;
  } else if (sel.startsWith("TIGER CARD")) {
    const want = sel.replace("TIGER CARD", "").trim();
    marketWin = data.cards.T === want;
  }

  else {
    console.warn("[Settlement] dt202 unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---- BACK / LAY ----
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] dt202 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    data,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}


//helper 
function parseLucky7euCard(cardStr) {
  // e.g. "7DD"
  const m = cardStr.match(/^([AJQK]|\d+)([SHDC]{2})$/i);
  if (!m) return null;

  const rankRaw = m[1].toUpperCase();
  const suitRaw = m[2].toUpperCase();

  const rankMap = { A: 1, J: 11, Q: 12, K: 13 };
  const rankVal = rankMap[rankRaw] || parseInt(rankRaw, 10);

  const redSuits = ["HH", "DD"];
  const blackSuits = ["SS", "CC"];

  return {
    rankRaw,
    rankVal,
    parity: rankVal % 2 === 0 ? "EVEN" : "ODD",
    color: redSuits.includes(suitRaw) ? "RED" : "BLACK",
  };
}

function lineOfRank(rankVal) {
  // Mirror frontend BetTableLucky7 CARD_GROUPS (shared by lucky7eu):
  //   Line 1 = A,2,3 | Line 2 = 4,5,6 | Line 3 = 8,9,10 | Line 4 = J,Q,K
  //   (7 skipped — no line.)
  if ([1, 2, 3].includes(rankVal)) return "LINE 1";
  if ([4, 5, 6].includes(rankVal)) return "LINE 2";
  if ([8, 9, 10].includes(rankVal)) return "LINE 3";
  if ([11, 12, 13].includes(rankVal)) return "LINE 4";
  return null; // 7 → no line
}



//
async function resolveLucky7eu(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] lucky7eu missing event_id/selection", bet.id);
    return null;
  }

  const apiGameType = game_name === "lucky7c" ? "lucky7eu2" : game_name;
  
  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: apiGameType,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] lucky7eu no t1 yet", bet.id);
    return null;
  }

  const card = parseLucky7euCard(t1.card);
  if (!card) {
    console.warn("[Settlement] lucky7eu invalid card", t1.card);
    return null;
  }

  const selRaw = selection.toString().trim();
  const sel = normalize(selRaw);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // -------- Low / High --------
  if (sel === "LOW CARD") {
    marketWin = card.rankVal <= 6;
  } else if (sel === "HIGH CARD") {
    marketWin = card.rankVal >= 8;
  }

  // -------- Even / Odd --------
  else if (sel === "EVEN") {
    marketWin = card.parity === "EVEN";
  } else if (sel === "ODD") {
    marketWin = card.parity === "ODD";
  }

  // -------- Red / Black --------
  else if (sel === "RED") {
    marketWin = card.color === "RED";
  } else if (sel === "BLACK") {
    marketWin = card.color === "BLACK";
  }

  // -------- Card X --------
  else if (sel.startsWith("CARD ")) {
    const want = normalize(sel.replace("CARD ", ""));
    // Frontend sends "Card 1" for the Ace; result card may be "A" or "1".
    const aceAliases = new Set(["1", "A"]);
    marketWin =
      want === card.rankRaw ||
      (aceAliases.has(want) && aceAliases.has(card.rankRaw));
  }

  // -------- Line Bets --------
  else if (sel.startsWith("LINE ")) {
    marketWin = sel === lineOfRank(card.rankVal);
  }

  else {
    console.warn("[Settlement] lucky7eu unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // BACK / LAY
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] lucky7eu resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    card,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// 
async function resolveLucky7eu2(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) return null;

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) return null;

  const sel = selection.trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  const parts = t1.rdesc.split("#").map(p => p.trim().toUpperCase());
  const selClean = sel.replace("CARD ", "").trim();
  // Ace: frontend sends "Card 1"; rdesc may carry the ace as "1" or "A".
  const aceAlt = selClean === "1" ? "A" : selClean === "A" ? "1" : null;

  const marketWin =
    parts.includes(selClean) ||
    parts.includes(sel) ||
    (aceAlt !== null && parts.includes(aceAlt));

  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] lucky7eu2 resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    marketWin,
    userWon
  });

  return Boolean(userWon);
}

// helper 

function parseCmatch20Result(t1) {
  const raw = (t1?.winnat || t1?.rdesc || "").toString().trim();
  const num = parseInt(raw, 10);
  return Number.isNaN(num) ? null : num;
}


//
async function resolveCmatch20(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] cmatch20 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // cmatch20
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] cmatch20 no t1 yet", bet.id);
    return null;
  }

  const winRun = parseCmatch20Result(t1);
  if (winRun === null) {
    console.warn("[Settlement] cmatch20 invalid result", t1);
    return null;
  }

  const selRaw = selection.toString().trim();
  const sel = normalize(selRaw);
  const betType = normalize(type || "BACK");

  // Expect selection like "Run 4"
  const m = sel.match(/^RUN\s+(\d+)$/);
  if (!m) {
    console.warn("[Settlement] cmatch20 invalid selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  const want = parseInt(m[1], 10);
  if (Number.isNaN(want)) return null;

  const marketWin = want === winRun;

  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] cmatch20 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    winRun,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}


// helper 

function parseCmeterResult(t1) {
  return normalize(t1?.winnat || t1?.rdesc || "");
}
async function resolveCmeter(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] cmeter missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // cmeter
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] cmeter no t1 yet", bet.id);
    return null;
  }

  const result = parseCmeterResult(t1);
  if (result !== "LOW" && result !== "HIGH") {
    console.warn("[Settlement] cmeter invalid result", {
      bet_id: bet.id,
      result,
    });
    return null;
  }

  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  if (sel !== "LOW" && sel !== "HIGH") {
    console.warn("[Settlement] cmeter invalid selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  const marketWin = sel === result;
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] cmeter resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    result,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

//helper war
function parseWarRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  // ---- winners ----
  const winners = parts[0]
    .split(/\s+/)
    .map(n => parseInt(n, 10))
    .filter(n => !Number.isNaN(n));

  const parseMap = (str) => {
    const map = {};
    str.split(/[\|~]/).forEach(p => {
      const m = p.match(/(\d+)\s*:\s*([A-Za-z]+)/);
      if (m) map[m[1]] = m[2].toUpperCase();
    });
    return map;
  };

  return {
    winners,
    color: parseMap(parts[1] || ""),
    parity: parseMap(parts[2] || ""),
    suit: parseMap(parts[3] || ""),
  };
}

//
async function resolveWar(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] war missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // war
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] war no t1 yet", bet.id);
    return null;
  }

  const data = parseWarRdesc(t1.rdesc || "");
  const selRaw = selection.toString().trim();
  const sel = normalize(selRaw);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // -------- Winner N --------
  if (sel.startsWith("WINNER ")) {
    const n = parseInt(sel.replace("WINNER ", ""), 10);
    marketWin = data.winners.includes(n);
  }

  // -------- Color --------
  else if (sel.startsWith("RED ") || sel.startsWith("BLACK ")) {
    const [color, n] = sel.split(" ");
    marketWin = data.color[n] === color;
  }

  // -------- Odd / Even --------
  else if (sel.startsWith("ODD ") || sel.startsWith("EVEN ")) {
    const [parity, n] = sel.split(" ");
    marketWin = data.parity[n] === parity;
  }

  // -------- Suit --------
  else if (
    sel.startsWith("SPADE ") ||
    sel.startsWith("HEART ") ||
    sel.startsWith("CLUB ") ||
    sel.startsWith("DIAMOND ")
  ) {
    const [suit, n] = sel.split(" ");
    marketWin = data.suit[n] === suit;
  }

  else {
    console.warn("[Settlement] war unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---- BACK / LAY ----
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] war resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}


//helper
function parseDTL20Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  const extractDTL = (str) => {
    const d = str.match(/D\s*:\s*([A-Za-z0-9]+)/i);
    const t = str.match(/T\s*:\s*([A-Za-z0-9]+)/i);
    const l = str.match(/L\s*:\s*([A-Za-z0-9]+)/i);
    return {
      D: d ? d[1].toUpperCase() : null,
      T: t ? t[1].toUpperCase() : null,
      L: l ? l[1].toUpperCase() : null,
    };
  };

  return {
    winner: normalize(parts[0] || ""), // DRAGON / TIGER / LION
    color: extractDTL(parts[1] || ""),
    parity: extractDTL(parts[2] || ""),
    rank: extractDTL(parts[3] || ""),
  };
}

async function resolveDTL20(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] dtl20 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // dtl20
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] dtl20 no t1 yet", bet.id);
    return null;
  }

  const data = parseDTL20Rdesc(t1.rdesc || "");
  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---------- WINNER ----------
  if (sel === "WINNER D") marketWin = data.winner === "DRAGON";
  else if (sel === "WINNER T") marketWin = data.winner === "TIGER";
  else if (sel === "WINNER L") marketWin = data.winner === "LION";

  // ---------- COLOR ----------
  else if (sel === "RED D") marketWin = data.color.D === "RED";
  else if (sel === "BLACK D") marketWin = data.color.D === "BLACK";
  else if (sel === "RED T") marketWin = data.color.T === "RED";
  else if (sel === "BLACK T") marketWin = data.color.T === "BLACK";
  else if (sel === "RED L") marketWin = data.color.L === "RED";
  else if (sel === "BLACK L") marketWin = data.color.L === "BLACK";

  // ---------- ODD / EVEN ----------
  else if (sel === "ODD D") marketWin = data.parity.D === "ODD";
  else if (sel === "EVEN D") marketWin = data.parity.D === "EVEN";
  else if (sel === "ODD T") marketWin = data.parity.T === "ODD";
  else if (sel === "EVEN T") marketWin = data.parity.T === "EVEN";
  else if (sel === "ODD L") marketWin = data.parity.L === "ODD";
  else if (sel === "EVEN L") marketWin = data.parity.L === "EVEN";

  // ---------- CARD ----------
  else if (sel.startsWith("DRAGON ")) {
    marketWin = data.rank.D === sel.replace("DRAGON ", "");
  } else if (sel.startsWith("TIGER ")) {
    marketWin = data.rank.T === sel.replace("TIGER ", "");
  } else if (sel.startsWith("LION ")) {
    marketWin = data.rank.L === sel.replace("LION ", "");
  }

  else {
    console.warn("[Settlement] dtl20 unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---------- BACK / LAY ----------
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] dtl20 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    data,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// helper 

function parseCard32euRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  const winner = normalize(parts[0] || "");

  const parseParity = (str) => {
    const map = {};
    str.split(/[\|~]/).forEach(p => {
      const m = p.match(/(\d+)\s*:\s*(Odd|Even)/i);
      if (m) map[m[1]] = m[2].toUpperCase();
    });
    return map;
  };

  return {
    winner,                         // PLAYER 10
    parity: parseParity(parts[1] || ""),
    threeCardColor: normalize(parts[2] || ""), // RED / BLACK / TWO BLACK TWO RED
    totalGroup: normalize(parts[3] || ""),     // 10-11 / 8-9
    single: normalize(parts[4] || ""),         // 0-9
  };
}


//
async function resolveCard32eu(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] card32eu missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // card32eu
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] card32eu no t1 yet", bet.id);
    return null;
  }

  const data = parseCard32euRdesc(t1.rdesc || "");
  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // -------- Player Winner --------
  if (/^PLAYER \d+$/.test(sel)) {
    marketWin = data.winner === sel;
  }

  // -------- Player Odd / Even --------
  else if (/^PLAYER \d+ (ODD|EVEN)$/.test(sel)) {
    const [_, num, oe] = sel.match(/^PLAYER (\d+) (ODD|EVEN)$/);
    marketWin = data.parity[num] === oe;
  }

  // -------- Any Three Card Color --------
  else if (sel === "ANY THREE CARD RED") {
    marketWin = data.threeCardColor === "RED";
  } else if (sel === "ANY THREE CARD BLACK") {
    marketWin = data.threeCardColor === "BLACK";
  }

  // -------- Single --------
  else if (sel.startsWith("SINGLE ")) {
    const want = sel.replace("SINGLE ", "");
    marketWin = want === data.single;
  }

  // -------- Total Groups --------
  else if (sel === "8 & 9 TOTAL") {
    marketWin = data.totalGroup === "8-9";
  } else if (sel === "10 & 11 TOTAL") {
    marketWin = data.totalGroup === "10-11";
  }

  // -------- Two Black Two Red --------
  else if (sel === "TWO BLACK TWO RED") {
    marketWin = data.threeCardColor === "TWO BLACK TWO RED";
  }

  else {
    console.warn("[Settlement] card32eu unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // -------- BACK / LAY --------
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] card32eu resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    data,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}
//

function parseDT6Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  const extractDT = (str) => {
    const d = str.match(/D\s*:\s*([A-Za-z]+)/i);
    const t = str.match(/T\s*:\s*([A-Za-z]+)/i);
    return {
      D: d ? d[1].toUpperCase() : null,
      T: t ? t[1].toUpperCase() : null,
    };
  };

  return {
    winner: normalize(parts[0] || ""),   // DRAGON / TIGER
    pair: normalize(parts[1] || ""),     // YES / NO
    parity: extractDT(parts[2] || ""),   // EVEN / ODD
    color: extractDT(parts[3] || ""),    // RED / BLACK
    suit: extractDT(parts[4] || ""),     // SPADE / HEART / DIAMOND / CLUB
  };
}
//
async function resolveDt6(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] dt6 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // dt6
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] dt6 no t1 yet", bet.id);
    return null;
  }

  const data = parseDT6Rdesc(t1.rdesc || "");
  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---- Main ----
  if (sel === "DRAGON") marketWin = data.winner === "DRAGON";
  else if (sel === "TIGER") marketWin = data.winner === "TIGER";

  // ---- Pair ----
  else if (sel === "PAIR") marketWin = data.pair === "YES";

  // ---- Odd / Even ----
  else if (sel === "DRAGON EVEN") marketWin = data.parity.D === "EVEN";
  else if (sel === "DRAGON ODD") marketWin = data.parity.D === "ODD";
  else if (sel === "TIGER EVEN") marketWin = data.parity.T === "EVEN";
  else if (sel === "TIGER ODD") marketWin = data.parity.T === "ODD";

  // ---- Color ----
  else if (sel === "DRAGON RED") marketWin = data.color.D === "RED";
  else if (sel === "DRAGON BLACK") marketWin = data.color.D === "BLACK";
  else if (sel === "TIGER RED") marketWin = data.color.T === "RED";
  else if (sel === "TIGER BLACK") marketWin = data.color.T === "BLACK";

  // ---- Suit ----
  else if (sel === "DRAGON SPADE") marketWin = data.suit.D === "SPADE";
  else if (sel === "DRAGON HEART") marketWin = data.suit.D === "HEART";
  else if (sel === "DRAGON DIAMOND") marketWin = data.suit.D === "DIAMOND";
  else if (sel === "DRAGON CLUB") marketWin = data.suit.D === "CLUB";

  else if (sel === "TIGER SPADE") marketWin = data.suit.T === "SPADE";
  else if (sel === "TIGER HEART") marketWin = data.suit.T === "HEART";
  else if (sel === "TIGER DIAMOND") marketWin = data.suit.T === "DIAMOND";
  else if (sel === "TIGER CLUB") marketWin = data.suit.T === "CLUB";

  else {
    console.warn("[Settlement] dt6 unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---- BACK / LAY ----
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] dt6 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    data,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}
//
function parseBtableRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  return {
    movie: normalize(parts[0] || ""),
    group: normalize(parts[2] || ""),   // DULHA DULHAN / BARATI
    color: normalize(parts[3] || ""),   // RED / BLACK
    rank: normalize(parts[4] || ""),    // A J Q K
  };
}

function rankValue(rank) {
  return { A: 1, J: 11, Q: 12, K: 13 }[rank] || null;
}
async function resolveBtable(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] btable missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // btable
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] btable no t1 yet", bet.id);
    return null;
  }

  const data = parseBtableRdesc(t1.rdesc || "");
  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---- Movie Winner ----
  if (
    [
      "DON",
      "AMAR AKBAR ANTHONY",
      "SAHIB BIBI AUR GHULAM",
      "DHARAM VEER",
      "KIS KIS KO PYAAR KAROON",
      "GHULAM",
    ].includes(sel)
  ) {
    marketWin = data.movie === sel;
  }

  // ---- Odd ----
  else if (sel === "ODD") {
    const rv = rankValue(data.rank);
    marketWin = rv !== null && rv % 2 === 1;
  }

  // ---- Color ----
  else if (sel === "RED" || sel === "BLACK") {
    marketWin = data.color === sel;
  }

  // ---- Card Rank ----
  else if (sel.startsWith("CARD ")) {
    marketWin = data.rank === sel.replace("CARD ", "");
  }

  // ---- Dulha / Barati ----
  else if (sel === "DULHA DULHAN K-Q") {
    marketWin =
      data.group === "DULHA DULHAN" &&
      (data.rank === "K" || data.rank === "Q");
  } else if (sel === "BARATI J-A") {
    marketWin =
      data.group === "BARATI" &&
      (data.rank === "J" || data.rank === "A");
  }

  else {
    console.warn("[Settlement] btable unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---- BACK / LAY ----
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] btable resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    data,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// helper 

function rankFromCard(card) {
  // "10HH", "QDD", "ASS"
  const m = card.match(/^([AJQK]|\d+)/i);
  return m ? m[1].toUpperCase() : null;
}

function normalizeRank(rank) {
  return rank; // A,2..10,J,Q,K
}
//

async function resolveAb20(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] ab20 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // ab20
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.card) {
    console.warn("[Settlement] ab20 no card data yet", bet.id);
    return null;
  }

  const cards = t1.card.split(",").map(c => c.trim());
  if (!cards.length) return null;

  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  // Expect: "ANDAR A", "BAHAR 10", etc.
  const m = sel.match(/^(ANDAR|BAHAR)\s+([AJQK]|\d+)$/);
  if (!m) {
    console.warn("[Settlement] ab20 invalid selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  const wantSide = m[1];               // ANDAR / BAHAR
  const wantRank = normalizeRank(m[2]);

  let firstIndex = -1;

  for (let i = 0; i < cards.length; i++) {
    const r = rankFromCard(cards[i]);
    if (r === wantRank) {
      firstIndex = i;
      break;
    }
  }

  if (firstIndex === -1) {
    console.warn("[Settlement] ab20 rank not found", {
      bet_id: bet.id,
      wantRank,
    });
    return null;
  }

  // Card dealing convention (must match the frontend exactly):
  //   AB20VideoCards.jsx: "first=Bahar, second=Andar, third=Bahar..."
  //   AB4ResultContent.jsx: "Even indices (0,2,4..) = Bahar, Odd (1,3,5..) = Andar"
  // i.e. even index → BAHAR, odd index → ANDAR. (Was inverted before, which
  // settled every Andar/Bahar bet backwards.)
  const actualSide = firstIndex % 2 === 0 ? "BAHAR" : "ANDAR";

  const marketWin = actualSide === wantSide;
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] ab20 resolve ✅", {
    bet_id: bet.id,
    selection,
    wantRank,
    actualSide,
    index: firstIndex,
    type: betType,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}
//
function parseLucky7Card(cardStr) {
  // e.g. "7CC", "QDD", "10SS"
  const m = cardStr.match(/^([AJQK]|\d+)([SHDC]{2})$/i);
  if (!m) return null;

  const rankRaw = m[1].toUpperCase();
  const suitRaw = m[2].toUpperCase();

  const rankMap = { A: 1, J: 11, Q: 12, K: 13 };
  const rankVal = rankMap[rankRaw] || parseInt(rankRaw, 10);

  const redSuits = ["HH", "DD"];
  const blackSuits = ["SS", "CC"];

  return {
    rankRaw,                     // A,2..10,J,Q,K
    rankVal,                     // 1..13
    parity: rankVal % 2 === 0 ? "EVEN" : "ODD",
    color: redSuits.includes(suitRaw) ? "RED" : "BLACK",
  };
}

function lucky7Line(rankVal) {
  // Must mirror frontend BetTableLucky7 CARD_GROUPS exactly:
  //   Line 1 = A,2,3 | Line 2 = 4,5,6 | Line 3 = 8,9,10 | Line 4 = J,Q,K
  //   (7 is intentionally skipped — belongs to no line.)
  if ([1, 2, 3].includes(rankVal)) return "LINE 1";
  if ([4, 5, 6].includes(rankVal)) return "LINE 2";
  if ([8, 9, 10].includes(rankVal)) return "LINE 3";
  if ([11, 12, 13].includes(rankVal)) return "LINE 4";
  return null; // 7 → no line
}
//
async function resolveLucky7(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] lucky7 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // lucky7
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.card) {
    console.warn("[Settlement] lucky7 no card yet", bet.id);
    return null;
  }

  const card = parseLucky7Card(t1.card);
  if (!card) {
    console.warn("[Settlement] lucky7 invalid card", t1.card);
    return null;
  }

  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---- Low / High ----
  if (sel === "LOW CARD") {
    marketWin = card.rankVal <= 6;
  } else if (sel === "HIGH CARD") {
    marketWin = card.rankVal >= 8;
  }

  // ---- Even / Odd ----
  else if (sel === "EVEN") {
    marketWin = card.parity === "EVEN";
  } else if (sel === "ODD") {
    marketWin = card.parity === "ODD";
  }

  // ---- Red / Black ----
  else if (sel === "RED") {
    marketWin = card.color === "RED";
  } else if (sel === "BLACK") {
    marketWin = card.color === "BLACK";
  }

  // ---- Card X ----
  else if (sel.startsWith("CARD ")) {
    const want = sel.replace("CARD ", "").trim();
    // Frontend sends "Card 1" for the Ace; the result card may encode the ace
    // as rankRaw "A" or "1". Treat both as equivalent so the ace bet resolves
    // regardless of upstream convention.
    const aceAliases = new Set(["1", "A"]);
    marketWin =
      want === card.rankRaw ||
      (aceAliases.has(want) && aceAliases.has(card.rankRaw));
  }

  // ---- Line ----
  else if (sel.startsWith("LINE ")) {
    marketWin = sel === lucky7Line(card.rankVal);
  }

  else {
    console.warn("[Settlement] lucky7 unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---- BACK / LAY ----
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] lucky7 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    card,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// lucky5
async function resolveLucky5(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] lucky5 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) {
    console.warn(`[Settlement] lucky5 result not yet ready for bet ${bet.id}`);
    return null;
  }

  const sel = (selection || "").trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  // Example rdesc: "Low Card#Odd#Black#5"
  const rdescParts = t1.rdesc.split("#").map(p => p.trim().toUpperCase());

  // Individual card bets arrive as "Card N" but the rdesc card-value part is a
  // bare rank ("5"), so strip the "CARD " prefix for that comparison. Ace may be
  // "1" or "A". Keep the full-selection match for "Low Card"/"High Card" etc.
  const selClean = sel.replace("CARD ", "").trim();
  const aceAlt = selClean === "1" ? "A" : selClean === "A" ? "1" : null;
  const marketWin =
    rdescParts.includes(sel) ||
    rdescParts.includes(selClean) ||
    (aceAlt !== null && rdescParts.includes(aceAlt));

  const winner = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] lucky5 resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    rdesc: t1.rdesc,
    marketWin,
    winner,
  });

  return Boolean(winner);
}

// poison
async function resolvePoison(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] poison missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) {
    console.warn(`[Settlement] poison result not yet ready for bet ${bet.id}`);
    return null;
  }

  let sel = (selection || "").trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  if (sel.startsWith("POISON ")) {
    sel = sel.replace("POISON ", "").trim();
  }

  // Example rdesc: "Player A#Odd#Red#Diamond"
  const rdescParts = t1.rdesc.split("#").map(p => p.trim().toUpperCase());

  // Market wins if the precise selection is found in any of the rdesc outcome strings
  const marketWin = rdescParts.includes(sel);

  const winner = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] poison resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    rdesc: t1.rdesc,
    marketWin,
    winner,
  });

  return Boolean(winner);
}

// dt20 helper
function normalizeDT20Rank(val) {
  if (!val) return null;
  const v = val.toUpperCase();
  return v === "A" ? "1" : v; // A treated as 1
}

function parseDT20Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  const extractDT = (str) => {
    const d = str.match(/D\s*:\s*([A-Za-z0-9]+)/i);
    const t = str.match(/T\s*:\s*([A-Za-z0-9]+)/i);
    return {
      D: d ? d[1].toUpperCase() : null,
      T: t ? t[1].toUpperCase() : null,
    };
  };

  return {
    winner: normalize(parts[0] || ""),   // DRAGON / TIGER / TIE
    pair: normalize(parts[1] || ""),     // YES / NO
    parity: extractDT(parts[2] || ""),   // ODD / EVEN
    color: extractDT(parts[3] || ""),    // RED / BLACK
    rank: extractDT(parts[4] || ""),     // A,2..10,J,Q,K
  };
}

//resolver


async function resolveDt20(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] dt20 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // dt20
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] dt20 no t1 yet", bet.id);
    return null;
  }

  const data = parseDT20Rdesc(t1.rdesc || "");
  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---- Main ----
  if (sel === "DRAGON") marketWin = data.winner === "DRAGON";
  else if (sel === "TIGER") marketWin = data.winner === "TIGER";
  else if (sel === "TIE") marketWin = data.winner === "TIE";

  // ---- Pair ----
  else if (sel === "PAIR") marketWin = data.pair === "YES";

  // ---- Odd / Even ----
  else if (sel === "DRAGON EVEN") marketWin = data.parity.D === "EVEN";
  else if (sel === "DRAGON ODD") marketWin = data.parity.D === "ODD";
  else if (sel === "TIGER EVEN") marketWin = data.parity.T === "EVEN";
  else if (sel === "TIGER ODD") marketWin = data.parity.T === "ODD";

  // ---- Color ----
  else if (sel === "DRAGON RED") marketWin = data.color.D === "RED";
  else if (sel === "DRAGON BLACK") marketWin = data.color.D === "BLACK";
  else if (sel === "TIGER RED") marketWin = data.color.T === "RED";
  else if (sel === "TIGER BLACK") marketWin = data.color.T === "BLACK";

  // ---- Card ----
  else if (sel.startsWith("DRAGON CARD")) {
    const want = normalizeDT20Rank(sel.replace("DRAGON CARD", "").trim());
    marketWin = normalizeDT20Rank(data.rank.D) === want;
  } else if (sel.startsWith("TIGER CARD")) {
    const want = normalizeDT20Rank(sel.replace("TIGER CARD", "").trim());
    marketWin = normalizeDT20Rank(data.rank.T) === want;
  }

  else {
    console.warn("[Settlement] dt20 unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---- BACK / LAY ----
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] dt20 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    data,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// helper 

function parseTeenJokerRdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());

  return {
    winner: normalize(parts[0] || ""), // PLAYER A / PLAYER B
    parity: normalize(parts[1] || ""), // ODD / EVEN
    color: normalize(parts[2] || ""),  // RED / BLACK
    suit: normalize(parts[3] || ""),   // SPADE / HEART / DIAMOND / CLUB
  };
}


// superover3
// Match a team token from the selection (often a short code like "AUS") against
// a score entry's nat (which may be the full name like "Australia"). superover3
// uses short codes on both sides (exact); cricketv3's score uses full names while
// the selection uses short codes — so allow a prefix match either way.
function soTeamMatches(scoreNat, team) {
  const a = String(scoreNat || "").toUpperCase();
  const b = String(team || "").toUpperCase();
  if (!a || !b) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

async function resolveSuperover3(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn(`[Settlement] superover3 missing event_id/selection ${bet.id}`);
    return null;
  }

  // Over-runs / session fancy ("Aus Over 5", "6 Over Run AUS", "Run Bhav", …) are
  // SPORTS-style session markets — the casino result feed NEVER publishes their
  // outcome (it only declares the match winner + ball-by-ball score). They can
  // therefore never settle here, so void (refund) upfront instead of leaving the
  // bet stuck `open` forever. Done before the result fetch so it also voids rounds
  // whose feed has no winnat/score yet.
  // NOTE: ball-by-ball markets ("0.5 Over Boundry IND") also contain "OVER" but ARE
  // settleable from score[] below, so exclude that "0.N Over <event> <team>" shape.
  const selUpper = (selection || "").trim().toUpperCase();
  const isBallByBall = /^0\.\d\s+OVER\s+[A-Z]+\s+[A-Z]+$/.test(selUpper);
  if (!isBallByBall && (selUpper.includes("OVER") || selUpper.includes("RUN") || selUpper.includes("BHAV"))) {
    console.warn("[Settlement] superover3 voiding unsettleable session/over-runs fancy", { bet_id: bet.id, selection: selUpper });
    return "void";
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.winnat || !t1.score) {
    console.warn(`[Settlement] superover3 NO data yet for bet ${bet.id}`);
    return null;
  }

  const sel = (selection || "").trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  let marketWin = false;

  // 1) Match Winner (e.g. "IND", "AUS", "ENG", "TIE")
  // If the selection doesn't have "OVER", "COMMON", or "RUN", it is a Match Winner selection.
  if (!sel.includes("OVER") && !sel.includes("COMMON") && !sel.includes("RUN")) {
    marketWin = (t1.winnat.toUpperCase() === sel);
  }
  else {
    // 2) Ball-by-ball markets ("0.1 Over Zero AUS", "0.5 Over Boundry IND")
    const ballRegex = /^0\.(\d)\s+OVER\s+([A-Z]+)\s+([A-Z]+)$/i;
    const match = sel.match(ballRegex);

    if (match) {
      const ballNum = parseInt(match[1]); // 1 to 6
      const eventTarget = match[2].toUpperCase();
      const team = match[3].toUpperCase();

      const teamScores = t1.score.filter(s => s.nat && soTeamMatches(s.nat, team));
      if (!teamScores.length) return null; // team not in score (feed name mismatch) — don't mis-pay
      teamScores.sort((a, b) => a.cid - b.cid);

      const ballData = teamScores[ballNum - 1];

      if (ballData) {
        if (eventTarget === "ZERO") marketWin = (ballData.run === 0 && !ballData.wkt);
        else if (eventTarget === "ONE") marketWin = (ballData.run === 1);
        else if (eventTarget === "TWO") marketWin = (ballData.run === 2);
        else if (eventTarget === "THREE") marketWin = (ballData.run === 3);
        else if (eventTarget === "FOUR") marketWin = (ballData.run === 4);
        else if (eventTarget === "SIX") marketWin = (ballData.run === 6);
        else if (eventTarget === "BOUNDRY" || eventTarget === "BOUNDARY") marketWin = (ballData.run === 4 || ballData.run === 6);
        else if (eventTarget === "WICKET") marketWin = (ballData.wkt === true);
      } else {
        marketWin = false;
      }
    } else {
      // 3) Common markets ("Common Wicket IND", "Common Boundry AUS")
      const commonRegex = /^COMMON\s+([A-Z]+)\s+([A-Z]+)$/i;
      const cMatch = sel.match(commonRegex);
      if (cMatch) {
        const eventTarget = cMatch[1].toUpperCase();
        const team = cMatch[2].toUpperCase();
        const teamScores = t1.score.filter(s => s.nat && soTeamMatches(s.nat, team));
        if (!teamScores.length) return null;

        marketWin = teamScores.some(ballData => {
          if (eventTarget === "WICKET") return ballData.wkt === true;
          if (eventTarget === "BOUNDRY" || eventTarget === "BOUNDARY") return (ballData.run === 4 || ballData.run === 6);
          return false;
        });
      } else {
        // Over-runs / "Run Bhav" session fancy are already voided upfront (see the
        // early over-runs check at the top of this resolver), so anything reaching
        // here is a genuinely unknown layout — leave it open (null) for retry/manual.
        console.warn("[Settlement] superover3 unmatched selection layout", sel);
        return null;
      }
    }
  }

  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] superover3 resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    marketWin,
    userWon
  });

  return Boolean(userWon);
}

// 
async function resolveTeen1(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn(`[Settlement] teen1 missing event_id/selection ${bet.id}`);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.winnat || !t1.rdesc) return null;

  const sel = (selection || "").trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  let marketWin = false;

  if (sel === "PLAYER" || sel === "DEALER") {
    marketWin = (t1.winnat.toUpperCase() === sel);
  } else {
    // Ex: "7 UP PLAYER"
    // rdesc: "Dealer#P : Down  |  D : Down"
    const parts = t1.rdesc.split("#");
    if (parts.length > 1) {
      const sideData = parts[1]; // "P : Down  |  D : Down"

      let targetSide = "";
      let targetDir = "";

      if (sel.includes("PLAYER")) targetSide = "P";
      else if (sel.includes("DEALER")) targetSide = "D";

      if (sel.includes("UP")) targetDir = "UP";
      else if (sel.includes("DOWN")) targetDir = "DOWN";

      // sideData could be "P : Down  |  D : Up"
      const regex = new RegExp(`${targetSide}\\s*:\\s*([A-Za-z]+)`, "i");
      const match = sideData.match(regex);
      if (match) {
        marketWin = (match[1].toUpperCase() === targetDir);
      }
    }
  }

  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] teen1 resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    marketWin,
    userWon
  });

  return Boolean(userWon);
}

// teenunique — Unique Teenpatti
// Single-market game (sub array has only 1 item; no `nat`).
// Outcome is binary, derived purely from rdesc:
//   rdesc === "Won"  → market wins  (back wins, lay loses)
//   rdesc === "Lost" → market loses (back loses, lay wins)
async function resolveTeenunique(bet) {
  const { game_name, event_id, type } = bet;

  if (!event_id) {
    console.warn(`[Settlement] teenunique missing event_id ${bet.id}`);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) {
    console.warn(`[Settlement] teenunique no rdesc yet ${bet.id}`);
    return null;
  }

  const rdesc = (t1.rdesc || "").trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  let marketWin;
  if (rdesc === "WON") marketWin = true;
  else if (rdesc === "LOST") marketWin = false;
  else {
    console.warn(`[Settlement] teenunique unknown rdesc ${bet.id}`, { rdesc });
    return null;
  }

  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] teenunique resolve ✅", {
    bet_id: bet.id,
    rdesc,
    marketWin,
    type: betType,
    userWon,
  });

  return Boolean(userWon);
}

// teen120 — 1 CARD 20-20
// Markets: Player / Tie / Dealer / Pair
// rdesc format: "<Winner>#<Pair Yes|No>"  e.g. "Dealer#No"
async function resolveTeen120(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn(`[Settlement] teen120 missing event_id/selection ${bet.id}`);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.winnat || !t1.rdesc) return null;

  const sel = (selection || "").trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  const winnat = (t1.winnat || "").trim().toUpperCase();
  const parts = (t1.rdesc || "").split("#");
  const pairResult = (parts[1] || "").trim().toUpperCase(); // "YES" / "NO"

  let marketWin = false;

  if (sel === "PLAYER" || sel === "DEALER" || sel === "TIE") {
    marketWin = (winnat === sel);
  } else if (sel === "PAIR") {
    marketWin = (pairResult === "YES");
  } else {
    console.warn(`[Settlement] teen120 unknown selection ${bet.id}`, { selection: sel });
    return null;
  }

  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] teen120 resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    winnat,
    pairResult,
    marketWin,
    userWon
  });

  return Boolean(userWon);
}

//
async function resolvePatti2(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) return null;

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name,
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc || !t1.winnat) return null;

  const sel = selection.trim().toUpperCase();
  const betType = (type || "BACK").trim().toUpperCase();

  let marketWin = false;

  const parts = t1.rdesc.split("#"); // Ex: "Tie#Tie (A : 8  |  B : 8)#A : 8  |  B : 8#No"

  if (sel === "PLAYER A" || sel === "PLAYER B") {
    marketWin = (t1.winnat.toUpperCase() === sel);
  }
  else if (sel.startsWith("MINI BACCARAT") && parts.length > 1) {
    const bacData = parts[1].toUpperCase(); // "TIE (..." or "PLAYER A (..."
    if (sel.includes("PLAYER A") || sel.endsWith(" A")) {
        marketWin = bacData.startsWith("PLAYER A");
    } else if (sel.includes("PLAYER B") || sel.endsWith(" B")) {
        marketWin = bacData.startsWith("PLAYER B");
    }
  }
  else if (sel === "TOTAL A" || sel === "TOTAL B") {
    // Higher-total wins. parts[2] = "A : 26  |  B : 13".
    const totalData = (parts[2] || "").toUpperCase();
    const a = totalData.match(/A\s*:\s*(\d+)/);
    const b = totalData.match(/B\s*:\s*(\d+)/);
    if (!a || !b) {
      console.warn("[Settlement] patti2 cannot parse totals", { bet_id: bet.id, rdesc: t1.rdesc });
      return null;
    }
    const av = parseInt(a[1], 10), bv = parseInt(b[1], 10);
    marketWin = sel === "TOTAL A" ? av > bv : bv > av;
  }
  else if (sel.startsWith("TOTAL") && parts.length > 2) {
    // legacy exact-number total bet "Total A 19"
    const totalData = parts[2].toUpperCase();
    const match = sel.match(/^TOTAL\s+(A|B)\s+(\d+)$/i);
    if (match) {
       const sMatch = totalData.match(new RegExp(`${match[1]}\\s*:\\s*(\\d+)`));
       if (sMatch) marketWin = (parseInt(sMatch[1]) === parseInt(match[2]));
    } else {
       console.warn("[Settlement] patti2 unmatched total layout", sel);
       return null;
    }
  }
  else if (sel === "COLOR PLUS") {
    // parts[3] = "Yes" / "No"
    marketWin = (parts[3] || "").trim().toUpperCase() === "YES";
  }
  else {
    console.warn("[Settlement] patti2 unmatched layout", sel);
    return null;
  }

  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] patti2 resolve ✅", {
    bet_id: bet.id,
    selection: sel,
    marketWin,
    userWon
  });

  return Boolean(userWon);
}

// btable2 — Bollywood Casino 2
// rdesc format: "<Movie>#<Odd Yes/No>#<Dulha Dulhan|Barati>#<Red|Black>#<Rank>"
function parseBtable2Rdesc(rdesc) {
  const parts = (rdesc || "").split("#").map(p => p.trim());
  return {
    movie: normalize(parts[0] || ""),
    odd: normalize(parts[1] || ""),     // "YES" / "NO"
    group: normalize(parts[2] || ""),   // DULHA DULHAN / BARATI
    color: normalize(parts[3] || ""),   // RED / BLACK
    rank: normalize(parts[4] || ""),    // A J Q K (or 2-10)
  };
}

async function resolveBtable2(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] btable2 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'btable2'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] btable2 no t1 yet", bet.id);
    return null;
  }

  const data = parseBtable2Rdesc(t1.rdesc || "");
  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---- Movie Winner ----
  if (
    [
      "DON",
      "AMAR AKBAR ANTHONY",
      "SAHIB BIBI AUR GHULAM",
      "DHARAM VEER",
      "KIS KIS KO PYAAR KAROON",
      "GHULAM",
    ].includes(sel)
  ) {
    marketWin = data.movie === sel;
  }

  // ---- Odd (explicit Yes/No in rdesc; fall back to rank parity) ----
  else if (sel === "ODD") {
    if (data.odd === "YES") marketWin = true;
    else if (data.odd === "NO") marketWin = false;
    else {
      const rv = rankValue(data.rank);
      marketWin = rv !== null && rv % 2 === 1;
    }
  }

  // ---- Color ----
  else if (sel === "RED" || sel === "BLACK") {
    marketWin = data.color === sel;
  }

  // ---- Card Rank (Card J / Card Q / Card K / Card A) ----
  else if (sel.startsWith("CARD ")) {
    marketWin = data.rank === sel.replace("CARD ", "");
  }

  // ---- Dulha / Barati ----
  else if (sel === "DULHA DULHAN K-Q") {
    marketWin =
      data.group === "DULHA DULHAN" &&
      (data.rank === "K" || data.rank === "Q");
  } else if (sel === "BARATI J-A") {
    marketWin =
      data.group === "BARATI" &&
      (data.rank === "J" || data.rank === "A");
  }

  else {
    console.warn("[Settlement] btable2 unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // ---- BACK / LAY ----
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] btable2 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    rdesc: t1.rdesc,
    data,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

// joker1 — Unlimited Joker Oneday (Player A vs Player B)
async function resolveJoker1(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] joker1 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 'joker1'
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] joker1 no t1 data yet for bet", bet.id);
    return null;
  }

  const rdesc = t1.rdesc || "";   // e.g. "Player A"
  const winnat = t1.winnat || ""; // e.g. "Result" (generic, ignore)

  const sel = normalize(selection);
  // winner sits in rdesc; winnat is just "Result"
  const winnerNorm = normalize(rdesc) || normalize(winnat);
  const betType = normalize(type || "BACK");

  if (sel !== "PLAYER A" && sel !== "PLAYER B") {
    console.warn("[Settlement] joker1 unknown selection", { bet_id: bet.id, selection });
    return null;
  }

  const marketWin = sel === winnerNorm;
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] joker1 resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    rdesc,
    winnat,
    winnerNorm,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}

//
async function resolveTeenjoker(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teenjoker missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // teenjoker
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teenjoker no t1 yet", bet.id);
    return null;
  }

  const data = parseTeenJokerRdesc(t1.rdesc || "");

  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  // ---------------- Player A / Player B (BACK & LAY)
  if (sel === "PLAYER A" || sel === "PLAYER B") {

    const winner = normalize(t1.winnat || data.winner || "");
    marketWin = winner === sel;

    const userWon = betType === "LAY" ? !marketWin : marketWin;

    console.log("[Settlement] teenjoker main resolve ✅", {
      bet_id: bet.id,
      selection,
      type: betType,
      winner,
      marketWin,
      userWon,
    });

    return Boolean(userWon);
  }

  // ---------------- Joker markets (BACK ONLY)
  else if (sel === "JOKER EVEN") {
    marketWin = data.parity === "EVEN";
  }
  else if (sel === "JOKER ODD") {
    marketWin = data.parity === "ODD";
  }

  else if (sel === "JOKER RED") {
    marketWin = data.color === "RED";
  }
  else if (sel === "JOKER BLACK") {
    marketWin = data.color === "BLACK";
  }

  else if (sel === "JOKER SPADE") {
    marketWin = data.suit === "SPADE";
  }
  else if (sel === "JOKER HEART") {
    marketWin = data.suit === "HEART";
  }
  else if (sel === "JOKER DIAMOND") {
    marketWin = data.suit === "DIAMOND";
  }
  else if (sel === "JOKER CLUB") {
    marketWin = data.suit === "CLUB";
  }

  else {
    console.warn("[Settlement] teenjoker unknown selection", {
      bet_id: bet.id,
      selection,
      rdesc: t1.rdesc,
    });
    return null;
  }

  // ❗ Joker bets do NOT use LAY logic
  console.log("[Settlement] teenjoker joker resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    data,
    marketWin,
  });

  return Boolean(marketWin);
}

// helper 
function parseWorliResult(rdesc) {
  if (!rdesc) return null;

  const parts = rdesc.split("#");
  if (parts.length < 2) return null;

  const num = parseInt(parts[1].trim(), 10);
  if (Number.isNaN(num)) return null;

  return num;
}

// Map text-based worli selections to numbers they contain
function getWorliValidNumbers(selection) {
  if (!selection) return [];

  const sel = String(selection).trim().toUpperCase();

  // Check if it's already a number
  const asNum = parseInt(String(selection).trim(), 10);
  if (!Number.isNaN(asNum) && asNum >= 0 && asNum <= 9) {
    return [asNum];
  }

  // Map text selections to valid numbers
  if (sel.includes("LINE 1") || sel === "LINE 1") return [1, 2, 3, 4, 5];
  if (sel.includes("LINE 2") || sel === "LINE 2") return [6, 7, 8, 9, 0];
  if (sel === "ODD") return [1, 3, 5, 7, 9];
  if (sel === "EVEN") return [2, 4, 6, 8, 0];

  // "All Trio" covers any result (all three-digit combinations)
  if (sel.includes("ALL TRIO") || sel === "ALL TRIO") return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return [];
}

//

// Worli Matka result: rdesc = "Pana#Single(Ocada)" e.g. "590#4".
//   • Pana   = 3 card face-values sorted ascending → last digit each ("590")
//   • Single = sum of the 3 digits mod 10 (the "ank"/Ocada) = 4
//   • SP = 3 distinct digits · DP = exactly 2 same · TP(Trio) = all 3 same
// Frontend selections (BetTableWorli): "Single N", "Single Line 1/2", "Single ODD/EVEN",
//   "Pana N", "SP N"/"SP ALL", "DP N"/"DP ALL", "ALL TRIO", "Cycle N", "Motor N",
//   "56 N"/"56 ALL", "64 N"/"64 ALL", "A/B/R/AB/AR/BR/ABR/ABR CUT",
//   "Common SP N", "Common DP N", "Color DP N"/"COLOR DP ALL".
async function resolveWorli(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] worli missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // worli
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) {
    console.warn("[Settlement] worli no result yet", bet.id);
    return null;
  }

  const parts = String(t1.rdesc).split("#");
  const panaStr = (parts[0] || "").trim();
  const single = parseInt((parts[1] || "").trim(), 10);
  const digits = panaStr.replace(/[^0-9]/g, "").split("").map(Number);
  if (digits.length < 3 || Number.isNaN(single)) {
    console.warn("[Settlement] worli cannot parse rdesc", { bet_id: bet.id, rdesc: t1.rdesc });
    return null;
  }
  const counts = {};
  digits.forEach((d) => { counts[d] = (counts[d] || 0) + 1; });
  const uniq = Object.keys(counts).length;
  const isTP = uniq === 1; // triple pana
  const isDP = uniq === 2; // double pana
  const isSP = uniq === 3; // single pana
  const allOdd = digits.every((d) => d % 2 === 1);
  const allEven = digits.every((d) => d % 2 === 0);
  const has = (n) => digits.includes(n);
  const countOf = (n) => counts[n] || 0;
  // Ron (sequence) pana: 3 consecutive digits, incl. the 8-9-0 wrap (per rules:
  // 123,234,…,789,890,120). sorted "089" == {8,9,0}.
  const sortedKey = [...digits].sort((a, b) => a - b).join("");
  const RON = new Set(["012", "123", "234", "345", "456", "567", "678", "789", "089"]);
  const isRon = RON.has(sortedKey);
  // 56 chart = SP panas from digits 2..9 only (C(8,3)=56). 64 chart = SP panas
  // that include 0 or 1 (120−56=64).
  const in56 = isSP && digits.every((d) => d >= 2 && d <= 9);
  const in64 = isSP && digits.some((d) => d === 0 || d === 1);

  const sel = normalize(selection);
  const betType = String(type || "back").toLowerCase();
  const applyLay = (w) => (betType === "lay" ? !w : w);

  let m;
  // ----- Single (ank / Ocada) -----
  if ((m = sel.match(/^SINGLE\s+(\d)$/))) return applyLay(single === Number(m[1]));
  if (sel === "SINGLE LINE 1") return applyLay([1, 2, 3, 4, 5].includes(single));
  if (sel === "SINGLE LINE 2") return applyLay([6, 7, 8, 9, 0].includes(single));
  if (sel === "SINGLE ODD")    return applyLay(single % 2 === 1);
  if (sel === "SINGLE EVEN")   return applyLay(single % 2 === 0);

  // ----- Pana (full 3-digit group): win if result pana == chosen pana (as a
  //       multiset — order-independent, the standard Matka pana match) -----
  if ((m = sel.match(/^PANA\s+(\d{3})$/))) {
    const chosen = m[1].split("").map(Number).sort((a, b) => a - b).join("");
    const result = [...digits].sort((a, b) => a - b).join("");
    return applyLay(chosen === result);
  }
  // ----- Pana N (legacy 1-digit = the pana's single/ank; kept for back-compat) -----
  if ((m = sel.match(/^PANA\s+(\d)$/))) return applyLay(single === Number(m[1]));

  // ----- SP / DP / Trio (keyed by ank) -----
  if ((m = sel.match(/^SP\s+(\d)$/))) return applyLay(isSP && single === Number(m[1]));
  if (sel === "SP ALL")              return applyLay(isSP);
  if ((m = sel.match(/^DP\s+(\d)$/))) return applyLay(isDP && single === Number(m[1]));
  if (sel === "DP ALL")              return applyLay(isDP);
  if (sel === "ALL TRIO")            return applyLay(isTP);

  // ----- 56 / 64 charts -----
  if ((m = sel.match(/^56\s+(\d)$/))) return applyLay(in56 && single === Number(m[1]));
  if (sel === "56 ALL")              return applyLay(in56);
  if ((m = sel.match(/^64\s+(\d)$/))) return applyLay(in64 && single === Number(m[1]));
  if (sel === "64 ALL")              return applyLay(in64);

  // ----- Common SP / DP -----
  // Common SP N: digit N appears exactly once in the pana.
  if ((m = sel.match(/^COMMON SP\s+(\d)$/))) return applyLay(countOf(Number(m[1])) === 1);
  // Common DP N: pana is a double (a pair exists, not a trio) and N is in the set.
  if ((m = sel.match(/^COMMON DP\s+(\d)$/))) return applyLay(isDP && has(Number(m[1])));

  // ----- Color DP N: double-pana, all three same parity, and N present -----
  if ((m = sel.match(/^COLOR DP\s+(\d)$/)))
    return applyLay(isDP && (allOdd || allEven) && has(Number(m[1])));
  if (sel === "COLOR DP ALL") return applyLay(isDP && (allOdd || allEven));

  // ----- ABR: A = Aki (odd ank), B = Beki (even ank), R = Ron (sequence) -----
  if (sel === "A") return applyLay(single % 2 === 1);
  if (sel === "B") return applyLay(single % 2 === 0);
  if (sel === "R") return applyLay(isRon);

  // ----- Cycle (CP): "Cycle 1-2" — choose 2 digits; win if BOTH appear in the pana.
  if ((m = sel.match(/^CYCLE\b(.*)$/))) {
    const ds = [...new Set((m[1].match(/\d/g) || []).map(Number))];
    if (ds.length === 2) return applyLay(ds.every((d) => has(d)));
    console.warn("[Settlement] worli Cycle needs exactly 2 digits → void", { bet_id: bet.id, selection });
    return "void"; // wrong arity (e.g. FE sent a single digit) — refund, never freeze
  }

  // ----- Motor SP: "Motor 1,2,3,4" — choose 4-9 digits; win if the result is an SP
  //       (3 distinct) AND all three result digits are within the chosen set.
  if ((m = sel.match(/^MOTOR\b(.*)$/))) {
    const ds = [...new Set((m[1].match(/\d/g) || []).map(Number))];
    if (ds.length >= 4 && ds.length <= 9) {
      const pick = new Set(ds);
      return applyLay(isSP && digits.every((d) => pick.has(d)));
    }
    console.warn("[Settlement] worli Motor needs 4-9 digits → void", { bet_id: bet.id, selection });
    return "void";
  }

  // ----- ABR combos (AB / AR / BR / ABR / ABR CUT): NOT defined in WorliRules.jsx.
  //       Cannot settle correctly without the exact rule → refund (void) rather than
  //       guess real money. Implement properly once the rule is provided.
  if (/^ABR CUT$/.test(sel) || /^(AB|AR|BR|ABR)$/.test(sel)) {
    console.warn("[Settlement] worli ABR combo rule undefined → void (needs product rule)", { bet_id: bet.id, selection });
    return "void";
  }

  // Fallback: worli's selection space is fully enumerable from BetTableWorli, so a
  // genuinely-unknown layout here means an un-settleable/malformed bet → refund so
  // cash never freezes (matches the worker void/refund path).
  console.warn("[Settlement] worli unhandled selection → void", { bet_id: bet.id, selection });
  return "void";
}

// helper 
function parseWorli2Result(rdesc) {
  if (!rdesc) return null;

  const parts = rdesc.split("#");
  if (parts.length < 2) return null;

  const n = parseInt(parts[1].trim(), 10);
  return Number.isNaN(n) ? null : n;
}

// Map text-based worli2 selections to numbers they contain
function getWorli2ValidNumbers(selection) {
  if (!selection) return [];

  const sel = String(selection).trim().toUpperCase();

  // Check if it's already a number
  const asNum = parseInt(String(selection).trim(), 10);
  if (!Number.isNaN(asNum) && asNum >= 0 && asNum <= 9) {
    return [asNum];
  }

  // Map text selections to valid numbers
  if (sel.includes("LINE 1") || sel === "LINE 1") return [1, 2, 3, 4, 5];
  if (sel.includes("LINE 2") || sel === "LINE 2") return [6, 7, 8, 9, 0];
  if (sel === "ODD") return [1, 3, 5, 7, 9];
  if (sel === "EVEN") return [2, 4, 6, 8, 0];

  return [];
}

// 
async function resolveWorli2(bet) {
  const { game_name, event_id, selection } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] worli2 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // worli2
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) {
    console.warn("[Settlement] worli2 no result yet", bet.id);
    return null;
  }

  // rdesc = "Pana#Single"; worli2 (Instant Worli) is a Single-only grid.
  // Selections (BetTableWorli2): "single-N" (N=0..9), "single-line1"/"single-line2",
  // "single-odd"/"single-even".
  const single = parseInt(String(t1.rdesc).split("#")[1] ?? "", 10);
  if (Number.isNaN(single)) {
    console.warn("[Settlement] worli2 cannot parse rdesc", { bet_id: bet.id, rdesc: t1.rdesc });
    return null;
  }

  const sel = String(selection).trim().toLowerCase();
  const betType = String(bet.type || "back").toLowerCase();
  const applyLay = (w) => (betType === "lay" ? !w : w);

  let m;
  if ((m = sel.match(/^single-(\d)$/))) return applyLay(single === Number(m[1]));
  if (sel === "single-line1") return applyLay([1, 2, 3, 4, 5].includes(single));
  if (sel === "single-line2") return applyLay([6, 7, 8, 9, 0].includes(single));
  if (sel === "single-odd")   return applyLay(single % 2 === 1);
  if (sel === "single-even")  return applyLay(single % 2 === 0);

  console.warn("[Settlement] worli2 unknown selection", { bet_id: bet.id, selection });
  return null;
}

// ============================================================================
// worli3 — Matka Market (scheduled multi-market Open/Close Matka)
// Each market (Lords/Riga/Asia/Taj/Gulf/Diamond/World) runs an OPEN draw then a
// CLOSE draw. Each draw declares a 3-digit Pana → Single = last digit of the sum
// (cards A=1..9, 10=0). Jodi = Open-Single·10 + Close-Single (00-99).
// Per-draw result mirrors worli: t1.rdesc = "pana#single".
// Selection (from FE) may be prefixed "<Market> <Session> | <selection>".
// ============================================================================

// Pure: classify a 3-digit pana. Returns null if not parseable.
function classifyMatkaPana(panaStr) {
  const all = String(panaStr || "").replace(/[^0-9]/g, "").split("").map(Number);
  if (all.length < 3) return null;
  const d3 = all.slice(0, 3);
  const counts = {};
  d3.forEach((d) => { counts[d] = (counts[d] || 0) + 1; });
  const uniq = Object.keys(counts).length;
  const RON = new Set(["012", "123", "234", "345", "456", "567", "678", "789", "089"]);
  return {
    digits: d3,
    single: d3.reduce((a, b) => a + b, 0) % 10,
    isSP: uniq === 3, isDP: uniq === 2, isTP: uniq === 1,
    allOdd: d3.every((x) => x % 2 === 1), allEven: d3.every((x) => x % 2 === 0),
    isRon: RON.has([...d3].sort((a, b) => a - b).join("")),
    in56: uniq === 3 && d3.every((x) => x >= 2 && x <= 9),
    in64: uniq === 3 && d3.some((x) => x === 0 || x === 1),
    has: (n) => d3.includes(n),
    countOf: (n) => counts[n] || 0,
  };
}

// Pure: settle a single-draw (pana) market. `sel` uppercased/trimmed.
// Returns true | false | "void" | null(unknown).
function matchMatkaPanaMarket(sel, info) {
  if (!info) return null;
  const { single, isSP, isDP, isTP, allOdd, allEven, isRon, in56, in64, has, countOf, digits } = info;
  let m;
  if ((m = sel.match(/^SINGLE\s+(\d)$/))) return single === Number(m[1]);
  if (sel === "SINGLE LINE 1") return [1, 2, 3, 4, 5].includes(single);
  if (sel === "SINGLE LINE 2") return [6, 7, 8, 9, 0].includes(single);
  if (sel === "SINGLE ODD")    return single % 2 === 1;
  if (sel === "SINGLE EVEN")   return single % 2 === 0;
  if ((m = sel.match(/^PANA\s+(\d{3})$/))) {
    return m[1].split("").map(Number).sort((a, b) => a - b).join("") ===
           [...digits].sort((a, b) => a - b).join("");
  }
  if ((m = sel.match(/^PANA\s+(\d)$/))) return single === Number(m[1]); // legacy ank
  if ((m = sel.match(/^SP\s+(\d)$/)))  return isSP && single === Number(m[1]);
  if (sel === "SP ALL")  return isSP;
  if ((m = sel.match(/^DP\s+(\d)$/)))  return isDP && single === Number(m[1]);
  if (sel === "DP ALL")  return isDP;
  if (sel === "ALL TRIO" || sel === "TRIO") return isTP;
  if ((m = sel.match(/^56\s+(\d)$/)))  return in56 && single === Number(m[1]);
  if (sel === "56 ALL")  return in56;
  if ((m = sel.match(/^64\s+(\d)$/)))  return in64 && single === Number(m[1]);
  if (sel === "64 ALL")  return in64;
  if ((m = sel.match(/^COMMON SP\s+(\d)$/))) return countOf(Number(m[1])) === 1;
  if ((m = sel.match(/^COMMON DP\s+(\d)$/))) return isDP && has(Number(m[1]));
  if ((m = sel.match(/^COLOR DP\s+(\d)$/)))  return isDP && (allOdd || allEven) && has(Number(m[1]));
  if (sel === "COLOR DP ALL") return isDP && (allOdd || allEven);
  if (sel === "A") return single % 2 === 1;
  if (sel === "B") return single % 2 === 0;
  if (sel === "R") return isRon;
  if ((m = sel.match(/^CYCLE\b(.*)$/))) {
    const ds = [...new Set((m[1].match(/\d/g) || []).map(Number))];
    return ds.length === 2 ? ds.every((d) => has(d)) : "void";
  }
  if ((m = sel.match(/^MOTOR\b(.*)$/))) {
    const ds = [...new Set((m[1].match(/\d/g) || []).map(Number))];
    if (ds.length >= 4 && ds.length <= 9) { const p = new Set(ds); return isSP && digits.every((d) => p.has(d)); }
    return "void";
  }
  if (/^ABR CUT$/.test(sel) || /^(AB|AR|BR|ABR)$/.test(sel)) return "void"; // combos undefined
  return null;
}

// Pure: Jodi settlement. openAnk/closeAnk are 0-9 or null (not declared).
// Per rules: if Close draw never starts, Jodi is judged on the OPEN ank only and
// pays at SINGLE rate (caller handles payout rate). Returns true|false|"void"|null.
function matchMatkaJodi(sel, openAnk, closeAnk) {
  const m = sel.match(/^JODI\s+(\d)\s*[-]?\s*(\d)$|^JODI\s+(\d{2})$/);
  if (!m) return null;
  const jj = (m[3] != null) ? m[3] : `${m[1]}${m[2]}`;
  const jOpen = Number(jj[0]), jClose = Number(jj[1]);
  if (openAnk == null) return null;            // open not declared yet → retry
  if (closeAnk == null) return jOpen === openAnk; // close not started → open-only (single payout)
  return jOpen === openAnk && jClose === closeAnk;
}

async function resolveWorli3(bet) {
  const { game_name, event_id, selection, type } = bet;
  if (!event_id || !selection) {
    console.warn("[Settlement] worli3 missing event_id/selection", bet.id);
    return null;
  }

  const betType = String(type || "back").toLowerCase();
  const applyLay = (w) => (betType === "lay" ? !w : w);
  const selUpper = String(selection).trim().toUpperCase();
  // FE may prefix "<Market> <Session> | <selection>" — settle on the core selection.
  const core = selUpper.includes("|") ? selUpper.split("|").pop().trim() : selUpper;

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, { type: game_name, mid: event_id });
  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) {
    console.warn("[Settlement] worli3 no result yet", bet.id);
    return null; // retry until the draw is declared
  }

  // rdesc may carry both draws ("openPana#openSingle#closePana#closeSingle") or one
  // ("pana#single"). Parse robustly.
  const parts = String(t1.rdesc).split("#").map((s) => s.trim());
  const openInfo = classifyMatkaPana(parts[0]);
  const closeInfo = parts.length >= 3 ? classifyMatkaPana(parts[2]) : null;

  // JODI — needs open (+ close) ank
  if (/^JODI\b/.test(core)) {
    const openAnk = openInfo ? openInfo.single : null;
    const closeAnk = closeInfo ? closeInfo.single : null;
    const out = matchMatkaJodi(core, openAnk, closeAnk);
    if (out === null) return null;
    if (out === "void") return "void";
    return applyLay(out);
  }

  // Per-draw markets settle on this draw's pana (the session bet was placed on).
  if (!openInfo) {
    console.warn("[Settlement] worli3 cannot parse pana", { bet_id: bet.id, rdesc: t1.rdesc });
    return null;
  }
  const out = matchMatkaPanaMarket(core, openInfo);
  if (out === null) {
    console.warn("[Settlement] worli3 unknown selection → void", { bet_id: bet.id, selection });
    return "void"; // enumerable space; unknown → refund (no freeze)
  }
  if (out === "void") return "void";
  return applyLay(out);
}

//helper

function parse3CardJResult(rdesc) {
  if (!rdesc) return [];

  // "Q  Q  K"
  return rdesc
    .trim()
    .split(/\s+/)
    .map(r => r.toUpperCase());
}


//

async function resolve3cardj(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] 3cardj missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // 3cardj
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1 || !t1.rdesc) {
    console.warn("[Settlement] 3cardj no result yet", bet.id);
    return null;
  }

  const ranks = parse3CardJResult(t1.rdesc);

  if (ranks.length !== 3) {
    console.warn("[Settlement] 3cardj invalid rdesc", {
      bet_id: bet.id,
      rdesc: t1.rdesc,
    });
    return null;
  }

  // count ranks
  const count = {};
  for (const r of ranks) count[r] = (count[r] || 0) + 1;

  // YES if any pair (or triple)
  const isYes = Object.values(count).some(v => v >= 2);

  const sel = normalize(selection);
  const betType = normalize(type || "BACK");

  let marketWin = false;

  if (sel === "YES") marketWin = isYes;
  else if (sel === "NO") marketWin = !isYes;
  else {
    console.warn("[Settlement] 3cardj unknown selection", {
      bet_id: bet.id,
      selection,
    });
    return null;
  }

  // normal BACK / LAY behaviour
  const userWon = betType === "LAY" ? !marketWin : marketWin;

  console.log("[Settlement] 3cardj resolve ✅", {
    bet_id: bet.id,
    selection,
    type: betType,
    ranks,
    isYes,
    marketWin,
    userWon,
  });

  return Boolean(userWon);
}










// teen62 — V VIP Teenpatti 1-day (Main + Consecutive + Odd/Even per card)
// Bettable markets (BetTableTeen62 + Teen62Rules + live feed):
//   • Main      : selection "Player A"/"Player B", mtype="match"  → winner === winnat (back/lay)
//   • Consecutive: selection "Player A"/"Player B", mtype="fancy" → that player's "A/B : Yes" in rdesc parts[3] (back/lay)
//   • Odd/Even  : selection "Card N Odd"/"Card N Even" (N=1..6)   → rdesc parts[2] per-card parity (back-only)
// rdesc = "Player A # <6 suits> # <6 odd/even> # A : No | B : No"
// NOTE: a Tie pushes (returns) Main bets per the rules; the settlement engine has
// no void path, so a tie currently falls through to a loss like every other teen
// resolver — tracked as a system-wide limitation, not specific to teen62.
async function resolveTeen62(bet) {
  const { game_name, event_id, selection, type, mtype } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teen62 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // teen62
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teen62 no t1 data yet", bet.id);
    return null;
  }

  const parts = (t1.rdesc || "").split("#").map((p) => p.trim());
  const winnat = t1.winnat || "";
  const oddEvenPart = parts[2] || ""; // "Even Even Odd Odd Even Even"
  const conPart = parts[3] || "";     // "A : No | B : No"

  const sel = normalize(selection);
  const betType = String(type || "back").toLowerCase();
  const applyLay = (win) => (betType === "lay" ? !win : win);

  // ----- Main / Consecutive (selection is the player) -----
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    const side = sel === "PLAYER A" ? "A" : "B";
    const isConsecutive = String(mtype || "").toLowerCase() === "fancy";

    if (isConsecutive) {
      const m = conPart.match(new RegExp(`${side}\\s*:\\s*(YES|NO)`, "i"));
      const win = m ? m[1].toUpperCase() === "YES" : false;
      return applyLay(win);
    }

    // Main winner market
    const win = sel === normalize(winnat);
    return applyLay(win);
  }

  // ----- Odd / Even per card: "Card N Odd" / "Card N Even" -----
  const cm = sel.match(/^CARD\s+(\d+)\s+(ODD|EVEN)$/);
  if (cm) {
    const idx = parseInt(cm[1], 10) - 1;
    const want = cm[2];
    const arr = oddEvenPart
      .split(/\s+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (idx < 0 || idx >= arr.length) {
      console.warn("[Settlement] teen62 card index out of range", { bet_id: bet.id, selection });
      return null;
    }
    const win = arr[idx] === want;
    return applyLay(win); // odd/even is back-only; invert is a no-op for back
  }

  console.warn("[Settlement] teen62 unknown selection", { bet_id: bet.id, selection });
  return null;
}

// teen6 — Teenpatti 2.0 (Main + Under21/Over22 + per-card suit/oddeven/value)
// rdesc = "Player A # <6 suits> # <6 odd/even> # <6 ranks> # A : Over 22(27) | B : Draw(21)"
// Bettable (BetTableTeen6 + live feed):
//   • Main           : "Player A"/"Player B"  → winner === winnat (back/lay)
//   • Under/Over      : "Player A Under 21"/"Player A Over 22"/"Player B …" → parts[4] classification (back)
//   • Suit/OddEven/Value: selection is JUST "Spade"/"Odd"/"Card K" with NO card index
//       (the FE bets the currently-visible card; the index is never sent in the payload),
//       so settlement cannot know which card → return null + warn. FE payload gap:
//       it must send e.g. "Card 6 Spade" for these to settle. (Was silently losing under resolveTeen33.)
async function resolveTeen6(bet) {
  const { game_name, event_id, selection, type } = bet;

  if (!event_id || !selection) {
    console.warn("[Settlement] teen6 missing event_id/selection", bet.id);
    return null;
  }

  const resp = await axios.post(`${BASE_URL}${DETAIL_PATH}`, {
    type: game_name, // teen6
    mid: event_id,
  });

  const t1 = resp.data?.data?.data?.t1;
  if (!t1) {
    console.warn("[Settlement] teen6 no t1 data yet", bet.id);
    return null;
  }

  const parts = (t1.rdesc || "").split("#").map((p) => p.trim());
  const winnat = t1.winnat || "";
  const uoPart = parts[4] || ""; // "A : Over 22(27) | B : Draw(21)"

  const sel = normalize(selection);
  const betType = String(type || "back").toLowerCase();
  const applyLay = (win) => (betType === "lay" ? !win : win);

  // ----- Main winner -----
  if (sel === "PLAYER A" || sel === "PLAYER B") {
    return applyLay(sel === normalize(winnat));
  }

  // ----- Under 21 / Over 22 -----
  const uom = sel.match(/^PLAYER\s+([AB])\s+(UNDER\s+21|OVER\s+22)$/);
  if (uom) {
    const side = uom[1];      // A / B
    const kind = uom[2];      // "UNDER 21" / "OVER 22"
    // classification text for that side, e.g. "Over 22", "Under 21", "Draw"
    const m = uoPart.match(new RegExp(`${side}\\s*:\\s*([^(|]+)`, "i"));
    const classification = m ? normalize(m[1]) : "";
    // A "Draw" classification matches neither → both Under/Over lose (matches the
    // existing no-void convention; flag if a push refund is ever required).
    return applyLay(classification.includes(kind));
  }

  // ----- Per-card suit / odd-even / value: "Card N <Suit|Odd|Even|Rank>" -----
  // (FE now sends the active card position.) rdesc: parts[1]=per-card suits,
  // parts[2]=per-card odd/even, parts[3]=per-card ranks.
  const cm = sel.match(/^CARD\s+(\d+)\s+(.+)$/);
  if (cm) {
    const idx = parseInt(cm[1], 10) - 1;
    const what = cm[2].trim();
    const col = (p) => (parts[p] || "").split(/\s+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (idx < 0) return null;
    if (["SPADE", "HEART", "CLUB", "DIAMOND"].includes(what)) {
      const a = col(1);
      return idx < a.length ? applyLay(a[idx] === what) : null;
    }
    if (what === "ODD" || what === "EVEN") {
      const a = col(2);
      return idx < a.length ? applyLay(a[idx] === what) : null;
    }
    const a = col(3); // rank
    return idx < a.length ? applyLay(a[idx] === what) : null;
  }

  console.warn("[Settlement] teen6 unknown selection", { bet_id: bet.id, selection });
  return null;
}

// ----------------- Game resolver registry -----------------

/**
 * Map game_name → resolver function(bet) => Promise<true|false|null>
 * Add more game types here as you implement them.
 */
const GAME_RESOLVERS = {
  teen20c: resolveTeen20C,
  teenmuf: resolveTeenMuf,
  teen20b: resolveTeen20C,  // similar logic as teen20c
  teen20: resolveTeen20C, // similar logic as teen20c
  teen9: resolveTeen9,
  teen8: resolveTeen8,
  poker20: resolvePoker20,
  teen41: resolveTeen41,
  teen42: resolveTeen41, // similar logic as teen41
  teen33: resolveTeen33,
  teen3: resolveTeen33, //similar logic teen 33
  teen32: resolveTeen33, //similar logic teen 33
  teen: resolveTeen62, // Teenpatti 1-day — identical markets+rdesc to teen62 (main/consecutive/odd-even; no suit in FE)
  poker: resolvePoker,
  poker6: resolvePoker6,
  baccarat: resolveBaccarat,
  baccarat2: resolveBaccarat2,
  card32: resolveCard32,
  goal: resolveGoal,
  aaa: resolveAaa,
  aaa2: resolveAaa2,
  race2: resolveRace2,
  race17: resolveRace17,
  race20: resolveRace20,
  kbc: resolveKbc,
  ballbyball: resolveBallByBall,
  trap: resolveTrap,
  trio: resolveTrio,
  dum10: resolveDusKaDum,
  notenum: resolveNoteNumber,
  queen: resolveQueen,
  lottcard: resolveLottcard,
  ourroullete: resolveRouletteSimple,
  roulette13: resolveRouletteSimple,
  roulette12: resolveRouletteSimple,
  roulette11: resolveRouletteSimple, // byte-for-byte clone of roulette12/13 (same BetTableRoulette12 + markets)
  teen62: resolveTeen62,
  teen6: resolveTeen6,
  cmeter1: resolveCmeter1,
  dolidana: resolveDolidana,
  mogambo: resolveMogambo,
  teensin: resolveTeensin,
  lucky15: resolveLucky15,
  sicbo: resolveSicbo,
  sicbo2: resolveSicbo, // same markets & dice format as sicbo
  abj: resolveAbj,
  dt202: resolveDT202,
  lucky7eu: resolveLucky7eu,
  lucky7c: resolveLucky7eu,
  lucky7eu2: resolveLucky7eu2,
  cmatch20: resolveCmatch20,
  cmeter: resolveCmeter,
  war: resolveWar,
  dtl20: resolveDTL20,
  card32eu: resolveCard32eu,
  dt6: resolveDt6,
  dt20: resolveDt20,
  btable: resolveBtable,
  btable2: resolveBtable2,
  ab20: resolveAb20,
  ab4: resolveAb20, // Andar Bahar 150 cards — same mechanic (first rank match → side), only deck size differs
  ab3: resolveAb20, // same Andar-Bahar mechanic + same index0=Bahar convention; selections "Andar <rank>"/"Bahar <rank>"
  lucky7: resolveLucky7,
  lucky5: resolveLucky5,
  patti2: resolvePatti2,
  poison: resolvePoison,
  poison20: resolvePoison,
  teenjoker: resolveTeenjoker,
  joker20: resolveTeenjoker,
  joker1: resolveJoker1,
  joker120: resolveJoker1, // Unlimited Joker 20-20 — same Player A/B game as joker1 (shares BetTableJoker1); was missing → bets never settled
  teen1: resolveTeen1,
  teen120: resolveTeen120,
  teenunique: resolveTeenunique,
  superover3: resolveSuperover3,
  superover2: resolveSuperover3,
  superover: resolveSuperover3,
  cricketv3: resolveSuperover3, // Five Five Cricket — same SuperOver markets; team-name prefix match handles "Australia" vs "AUS"
  worli: resolveWorli,
  worli2: resolveWorli2,
  worli3: resolveWorli3,
  cardj3: resolve3cardj,



  // teen40c: resolveTeen40C,
  // andarbahar20: resolveAndarBahar20,
  // etc...
};

// ----------------- Main loop -----------------

//
// Seconds after which a bet still stuck in 'processing' is considered orphaned
// and re-claimed for settlement. Covers two cases:
//   1) worker_fetch.js flips a bet open->processing (without processing_at) but
//      never settles it — those have processing_at IS NULL and are reclaimed at once.
//   2) this worker crashes/restarts mid-batch after setting processing_at but
//      before settling — reclaimed once processing_at is older than the threshold.
// settleBetCommon is idempotent (locks the row, skips if already 'closed'), so
// re-claiming is always safe.
const STALE_PROCESSING_SEC = Number(process.env.SETTLE_STALE_PROCESSING_SEC || 30);

async function fetchLockedCasinoBets(limit = 10) {
  return sequelize.query(
    `
    UPDATE casino_bets
    SET status = 'processing',
        processing_at = NOW()
    WHERE id IN (
      SELECT id
      FROM casino_bets
      WHERE status = 'open'
         OR (
           status = 'processing'
           AND (
             processing_at IS NULL
             OR processing_at < NOW() - (:staleSec * INTERVAL '1 second')
           )
         )
      ORDER BY created_at
      LIMIT :limit
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
    `,
    {
      replacements: { limit, staleSec: STALE_PROCESSING_SEC },
      type: QueryTypes.UPDATE,
    }
  );
}
//

async function processPendingCasinoBets() {
  try {
    const [bets] = await fetchLockedCasinoBets(20);

    if (!bets.length) return;

    console.log(`[Settlement] Locked ${bets.length} casino bet(s)`);

    for (const bet of bets) {
      try {
        let resolver = null;
        if (bet.game_name === "3cardj") {
          console.log("[Settlement] 3cardj bet", bet);
          resolver = GAME_RESOLVERS['cardj3'];
        }
        else {
          resolver = GAME_RESOLVERS[bet.game_name];
        }

        if (!resolver) {
          console.warn(
            `[Settlement] No resolver for ${bet.game_name}, bet ${bet.id}`
          );
          // Revert to OPEN so the bet isn't stuck in "processing" forever once
          // the resolver gets added later.
          await CasinoBet.update(
            { status: "open", processing_at: null },
            { where: { id: bet.id } }
          );
          continue;
        }

        let winner = await resolver(bet);

        // Multiplier games (1 Card Meter) return { won, rate } instead of a bare
        // boolean: the payout is stake × rate, not stake × odds. Everything else
        // keeps returning true / false / "void" / null.
        let payoutRate = null;
        if (winner && typeof winner === "object") {
          payoutRate = Number(winner.rate) || null;
          winner = winner.won;
        }

        // No result yet → revert back to OPEN
        if (winner === null) {
          await CasinoBet.update(
            { status: "open", processing_at: null },
            { where: { id: bet.id } }
          );
          continue;
        }

        await settleBetCommon(bet, winner, payoutRate);
      } catch (err) {
        console.error("[Settlement] Bet failed:", bet.id, err.message);

        // Fail-safe: unlock bet
        await CasinoBet.update(
          { status: "open", processing_at: null },
          { where: { id: bet.id } }
        );
      }
    }
  } catch (err) {
    console.error("[Settlement] Worker error:", err.message);
  }
}


async function start() {
  try {
    await sequelize.authenticate();
    console.log(
      `[Settlement] Casino settlement worker started. Polling every ${INTERVAL} ms...`
    );
    setInterval(processPendingCasinoBets, INTERVAL);
  } catch (err) {
    console.error("[Settlement] DB connection failed:", err.message);
    process.exit(1);
  }
}

start();
