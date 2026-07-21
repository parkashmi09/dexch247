
import xssClean from "xss-clean";
import fetch from "node-fetch";
import Wallet from "../model/admin/Wallet.js";
import SportsBet from "../model/user/SportsBet.js";
import UserExposure from "../model/user/UserExposure.js";
import TotalExposure from "../model/user/TotalExposure.js";
import sequelize from "../config/db.js";
import BetLock from "../model/admin/BetLock.js";
import PlatformGames from '../model/admin/PlatformGames.js'
import GamesMarkets from '../model/admin/GamesMarkets.js'
import axios from "axios";
import User from "../model/user/User.js";
import Staff from "../model/admin/Staff.js";
import Owner from "../model/admin/Owner.js";
import { Op, Sequelize } from "sequelize";
import UserMatchLocks from "../model/admin/UserMatchLocks.js";
import UserEventMarketLocks from "../model/admin/UserEventMarketLocks.js";
import BetLockService from "../services/BetLockService.js";
import DebitLedger from "../model/user/DebitLedger.js";
import CreditsLedger from "../model/user/CreditsLedger.js";
import SportsLockController from "../controller/admin/SportsLockController.js";
import UserNetExposure from "../model/user/UserNetExposure.js";
import { emitBalanceUpdate } from "../utils/socketUtils.js";
import { calculateUserNetExposure, syncTotalExposure } from "../helper/netExposureHelper.js";
import CricketService from "../services/CricketService.js";
import { isBookmakerMarket, backProfit, backProfitRate, round2 } from "../helper/marketClassify.js";

// Resolve server-side min/max stake limits from the live (redis-cached) private
// market feed. Returns null when the market can't be found so callers can fall
// back to env caps. Shared by placeBet's STEP 4.5.
async function resolveMarketLimits({ eventid, sid, match_id, mname, market_type, selection_name }) {
  const pd = await CricketService.GetMatchPrivateData(eventid, sid);
  const markets = Array.isArray(pd?.data) ? pd.data : [];
  if (!markets.length) return null;

  const mkt = markets.find(m => String(m.mid) === String(match_id))
    || markets.find(m => (m.mname || '') === (mname || market_type));
  if (!mkt) return null;

  const selNorm = (selection_name || '').toString().trim().toLowerCase();
  const sec = (mkt.section || []).find(s => (s.nat || '').trim().toLowerCase() === selNorm) || null;

  // NOTE: `maxb` is NOT a stake cap on this deployment — the feed sends
  // maxb:1 on every market (cricket MATCH_ODDS and racing alike) as a boolean
  // flag. Reading it as a limit would reject every bet above 1. The real cap
  // is mkt.max (per-market) or sec.max (per-runner).
  const maxLimit = Number(mkt.max) > 0 ? Number(mkt.max) : (Number(sec?.max) || 0);
  const minLimit = Number(sec?.min) > 0 ? Number(sec.min) : (Number(mkt.min) || 0);

  return { minLimit, maxLimit, marketName: mkt.mname };
}

// ---------------------------------------------------------------------------
// HORSE RACING BETTING WINDOW (sid=10 only)
// ---------------------------------------------------------------------------
// A horse race accepts bets only in the final N minutes before the off.
// Greyhound (65) is NOT affected.
const RACE_BET_WINDOW_MINUTES = Number(process.env.RACE_BET_WINDOW_MINUTES) || 5;

// ⚠️ THE TIMEZONE TRAP. The feed sends `stime` as an IST wall-clock string
// with NO zone marker: "7/22/2026 1:44:00 AM". This server runs in UTC, where
// `new Date(stime)` reads it as UTC and lands 5h30m LATE — every race would
// look hours away and EVERY bet would be refused. Parse the parts explicitly
// and subtract the +05:30 offset to get true UTC.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
function parseFeedIstTime(stime) {
  if (!stime) return null;
  const m = String(stime).trim().match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );
  if (!m) {
    const d = new Date(stime);
    return isNaN(d) ? null : d.getTime();
  }
  const [, mo, day, yr, hhRaw, mi, ss, ampm] = m;
  let hh = Number(hhRaw);
  if (ampm) {
    const up = ampm.toUpperCase();
    if (up === 'PM' && hh !== 12) hh += 12;
    if (up === 'AM' && hh === 12) hh = 0;
  }
  const asUtc = Date.UTC(Number(yr), Number(mo) - 1, Number(day), hh, Number(mi), Number(ss || 0));
  return asUtc - IST_OFFSET_MS;
}

// Race start read from the LIVE board feed — never from the client-sent
// match_start_time, which is forgeable. Racing boards nest
// country → venue → race, so the tree has to be walked.
// Returns null when the race can't be found, so callers FAIL OPEN (matching
// how the limit and rate-cap checks behave when the feed is unreadable).
// The board is one upstream call, and every bet on the same race would repeat
// it. Memoise briefly — race times don't move second to second.
const raceBoardCache = new Map();
const RACE_BOARD_TTL_MS = 5000;
async function fetchRaceBoard(sid) {
  const key = String(sid);
  const hit = raceBoardCache.get(key);
  if (hit && Date.now() - hit.at < RACE_BOARD_TTL_MS) return hit.board;
  const board = await CricketService.fetchCricketData(sid);
  raceBoardCache.set(key, { at: Date.now(), board });
  return board;
}

async function resolveRaceStartMs(eventid, sid) {
  try {
    const board = await fetchRaceBoard(sid);
    const t1 = board?.data?.t1 || [];
    const t2 = board?.data?.t2 || [];
    const stack = [...t1, ...t2];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== 'object') continue;
      if (String(node.gmid ?? '') === String(eventid)) {
        return parseFeedIstTime(node.stime);
      }
      if (Array.isArray(node.children)) stack.push(...node.children);
    }
  } catch (e) {
    console.warn('[placeBet] Race start lookup failed (non-blocking):', e.message);
  }
  return null;
}

let cachedUsdRate = 0;
let cachedAt = 0;
const sportsDataSet = [
  { sid: 4, ename: "Cricket" },
  { sid: 1, ename: "Football" },
  { sid: 2, ename: "Tennis" },
  { sid: 8, ename: "Table Tennis" },
  { sid: 68, ename: "Esoccer" },
  { sid: 10, ename: "Horse Racing" },
  { sid: 65, ename: "Greyhound Racing" },
  { sid: 15, ename: "Basketball" },
  { sid: 69, ename: "Wrestling" },
  { sid: 18, ename: "Volleyball" },
  { sid: 22, ename: "Badminton" },
  { sid: 59, ename: "Snooker" },
  { sid: 57, ename: "Darts" },
  { sid: 6, ename: "Boxing" },
  { sid: 3, ename: "Mixed Martial Arts" },
  { sid: 58, ename: "American Football" },
  { sid: 11, ename: "E Games" },
  { sid: 19, ename: "Ice Hockey" },
  { sid: 9, ename: "Futsal" },
  { sid: 40, ename: "Politics" },
  { sid: 67, ename: "Boat Racing" },
  { sid: 52, ename: "Motor Sports" },
  { sid: 12, ename: "Greyhounds" },
  { sid: 66, ename: "Kabaddi" },
  { sid: 5, ename: "Golf" },
  { sid: 55, ename: "Rugby League" },
  { sid: 7, ename: "Beach Volleyball" },
  { sid: 13, ename: "Trotting" },
  { sid: 39, ename: "Handball" },
  { sid: 14, ename: "Speedway" },
  { sid: 16, ename: "MotoGP" },
  { sid: 17, ename: "Chess" },
  { sid: 20, ename: "Equine Sports" },
  { sid: 21, ename: "Australian Rules" },
  { sid: 23, ename: "Formula 1" },
  { sid: 24, ename: "Nascar" },
  { sid: 25, ename: "Hockey" },
  { sid: 26, ename: "Supercars" },
  { sid: 27, ename: "Netball" },
  { sid: 28, ename: "Surfing" },
  { sid: 29, ename: "Cycling" },
  { sid: 30, ename: "Gaelic Sports" },
  { sid: 31, ename: "Biathlon" },
  { sid: 32, ename: "Motorbikes" },
  { sid: 33, ename: "Athletics" },
  { sid: 34, ename: "Squash" },
  { sid: 35, ename: "Basketball 3X3" },
  { sid: 36, ename: "Floorball" },
  { sid: 37, ename: "Sumo" },
  { sid: 38, ename: "Virtual sports" },
  { sid: 41, ename: "Weather" }
];
const sportsMap = sportsDataSet.reduce((acc, item) => {
  acc[item.sid] = item.ename;
  return acc;
}, {});

function normalizeOdds(odds) {
  if (odds > 100) return Math.floor(((odds / 100) + 1) * 100) / 100;
  if (odds < 100) return Math.floor((1 + (odds / 100)) * 100) / 100;
  return 2.0;
}

export const getMarketNameFromGtype = ({ mname, gtype, nat, section }) => {


  console.log("market name from gtype", { mname, gtype, nat, section })
  if (!mname || !gtype) return null;

  /* =======================
     1️⃣ MATCH / MATCH1
     section se "vs" banta hai
  ======================= */
  if (gtype === "match" || gtype === "match1") {
    let sections = [];

    if (Array.isArray(section)) {
      sections = section;
    } else if (typeof section === "string") {
      try {
        sections = JSON.parse(section);
      } catch (e) {
        sections = [];
      }
    }


    const runnerNames = sections
      .map((s) => s?.nat?.trim())
      .filter(Boolean);

    if (runnerNames.length === 0) return null;

    const marketName =
      runnerNames.length > 1
        ? runnerNames.join(" vs ")
        : runnerNames[0];

    return {
      mname,
      gtype,
      marketName,
    };
  }

  /* =======================
     2️⃣ ALL OTHER TYPES
     nat is single string
     section ignored
  ======================= */
  if (!nat || typeof nat !== "string") return null;

  return {
    mname,
    gtype,
    marketName: nat.trim(),
  };
};

async function inrToUsd(inrAmount = 0) {
  const FIVE_MIN = 5 * 60 * 1000;
  const now = Date.now();
  if (!cachedUsdRate || now - cachedAt > FIVE_MIN) {
    try {
      const r = await fetch("https://api.exchangerate.host/latest?base=INR&symbols=USD");
      const j = await r.json();
      cachedUsdRate = 1 / j.rates.USD;
      cachedAt = now;
    } catch (e) {
      console.error("FX fetch failed, using fallback 83:", e.message);
      cachedUsdRate = 1 / 83;
    }
  }
  return +(inrAmount * cachedUsdRate).toFixed(2);
}

const liabilityOf = (gameType, betType, stake, odds) => {
  if (gameType === "FAN") return stake * odds / 100;
  return betType === "lay" ? stake * (odds - 1) : stake;
};




// user: betlock , is user active or not, lock for particular market 
export const checkUserBetLock = async (user_id, game_type, event_id = null, transaction = null, market_id = null) => {
  try {
    console.log('[BetLock] checkUserBetLock CALLED:', { user_id, game_type, event_id, market_id });
    if (!user_id || !game_type) {
      return {
        allowed: false,
        message: "Missing required parameters: user_id or game_type.",
      };
    }

    // 1. Check Global Lock (BetLock)
    const betLock = await BetLock.findOne({ where: { user_id }, transaction });

    if (betLock) {
      // 🔒 If Match Odds market
      if (game_type.trim().toUpperCase() === "MO") {
        if (betLock.MatchOdds === true) {
          return {
            allowed: false,
            message: "Bet not allowed, contact admin (MatchOdds locked).",
          };
        }
      }
      // 🔒 Any other market type
      else {
        if (betLock.OtherMarkets === true) {
          return {
            allowed: false,
            message: "Bet not allowed, contact admin (OtherMarkets locked).",
          };
        }
      }
    }

    // 2. Check Match-Specific Lock (UserMatchLocks)
    if (event_id) {
      const matchLock = await UserMatchLocks.findOne({
        where: { user_id, event_id: String(event_id), is_locked: true },
        transaction
      });

      if (matchLock) {
        return {
          allowed: false,
          message: "Bet not allowed, this match is locked for you.",
        };
      }
    }

    // 3. Check Market-wise Lock (UserEventMarketLocks) - uses market_id (primary), market_name (fallback)
    if (event_id) {
      // Build market condition: prefer market_id, fallback to market_name
      let marketCondition;
      if (market_id) {
        // Primary: match by market_id directly
        marketCondition = { market_id: String(market_id) };
      } else {
        // Fallback: match by market_name variations
        const marketNames = [];
        const gt = game_type.trim().toUpperCase();
        if (gt === "MO" || gt === "MATCH" || gt === "MATCH_ODDS" || gt === "MATCH1") {
          marketNames.push("MATCH_ODDS", "Match_Odds", "match_odds", "MATCH", "match", "match1");
        } else if (gt === "BM" || gt === "BOOKMAKER" || gt === "BOOKMAKER2") {
          marketNames.push("bookmaker", "Bookmaker", "BOOKMAKER", "bookmaker2", "BM");
        } else if (gt === "FAN" || gt === "FANCY" || gt === "FANCY1" || gt === "NORMAL") {
          marketNames.push("fancy1", "Fancy", "FANCY", "Normal", "normal", "FAN");
        } else {
          marketNames.push(game_type.trim());
        }
        marketCondition = { market_name: { [Op.in]: marketNames } };
      }

      console.log('[BetLock] Checking market lock for user:', { user_id, event_id, market_id, game_type, marketCondition });

      // Check if user is directly locked
      const userMarketLock = await UserEventMarketLocks.findOne({
        where: {
          account_id: user_id,
          account_type: 'user',
          event_id: String(event_id),
          ...marketCondition,
          is_locked: true
        },
        transaction
      });

      console.log('[BetLock] User market lock result:', userMarketLock ? userMarketLock.toJSON() : 'NOT FOUND');

      if (userMarketLock) {
        return {
          allowed: false,
          message: 'Bet not allowed',
        };
      }

      // Check if any staff in upline is locked for this market
      const user = await User.findOne({ where: { user_id }, attributes: ['parent_staff_id'], transaction });
      if (user?.parent_staff_id) {
        let staffId = user.parent_staff_id;
        const visited = new Set();
        while (staffId && !visited.has(staffId)) {
          visited.add(staffId);
          const staffLock = await UserEventMarketLocks.findOne({
            where: {
              account_id: staffId,
              account_type: 'staff',
              event_id: String(event_id),
              ...marketCondition,
              is_locked: true
            },
            transaction
          });
          if (staffLock) {
            return {
              allowed: false,
              message: 'Bet not allowed',
            };
          }
          const staff = await Staff.findOne({ where: { staff_id: staffId }, attributes: ['parent_id'], transaction });
          staffId = staff?.parent_id || null;
        }
      }
    }

    // ✅ If no restrictions
    return { allowed: true };

  } catch (error) {
    console.error("Error checking user bet lock:", error);
    return {
      allowed: false,
      message: "Internal server error while checking bet lock.",
    };
  }
};

// Helper to get all ancestor staff IDs (upline)
const getAllAncestorStaffIds = async (userId, transaction = null) => {
  let ancestors = [];
  let currentUser = await User.findOne({ where: { user_id: userId }, attributes: ['parent_staff_id'], transaction });

  if (!currentUser || !currentUser.parent_staff_id) return []; // Direct under owner or invalid

  let currentStaffId = currentUser.parent_staff_id;

  while (currentStaffId) {
    ancestors.push(currentStaffId);
    const staff = await Staff.findOne({ where: { staff_id: currentStaffId }, attributes: ['parent_id'], transaction });
    if (!staff || !staff.parent_id) break;
    currentStaffId = staff.parent_id;
  }

  return ancestors;
};

import StaffMarketLocks from "../model/admin/StaffMarketLocks.js";

// platform betlock: check if platform betlock for this market is allowed or not for sports
export const checkPlatformBetLock = async (sportsId, game_type, user_id, transaction = null) => {

  console.log("check platform betlock ===> for ", { sportsId, game_type, user_id })
  try {
    if (!sportsId || !game_type || !user_id) {
      return {
        allowed: false,
        message: "Missing required parameters: sportsId, game_type or user_id."
      };
    }

    // 1. Get Upline (Ancestors) + Owner (null)
    const ancestors = await getAllAncestorStaffIds(user_id, transaction);
    const staffIdsToCheck = [null, ...ancestors]; // null = Owner

    let key = game_type.trim();
    if (key == "MO") { key = "Match_Odds" }

    // 2. Check for locks in StaffMarketLocks
    // We check for specific market lock OR "ALL" lock
    const locks = await StaffMarketLocks.findAll({
      where: {
        game_id: sportsId,
        staff_id: { [Op.or]: staffIdsToCheck },
        market_name: { [Op.or]: [key, 'ALL'] },
        is_locked: true
      },
      transaction
    });

    if (locks.length > 0) {
      // Found a lock!
      const lock = locks[0];
      const lockType = lock.market_name === 'ALL' ? 'ALL markets' : `${key} market`;
      const locker = lock.staff_id ? `upline staff` : `Owner`;

      return {
        allowed: false,
        message: `Bet not allowed, ${lockType} is locked by ${locker}.`
      };
    }

    return { allowed: true };

  } catch (err) {
    console.error("Error checking platform bet lock:", err);
    return {
      allowed: false,
      message: "Internal server error while checking platform lock."
    };
  }
};



// Helper to get buffer time from Owner's configuration
// Simply fetches the first owner's configuration as requested by user
const getOwnerBufferTime = async () => {
  try {
    const owner = await Owner.findOne(); // Fetch the first owner
    if (owner && owner.platform_configurations) {
      let config = owner.platform_configurations;
      // Handle potential string format if DB returns JSON as string
      if (typeof config === 'string') {
        try { config = JSON.parse(config); } catch (e) { }
      }
      // Return buffer_time (ensure it's a number)
      return Number(config.buffer_time) || 0;
    }
  } catch (error) {
    console.error("Error fetching buffer time:", error);
  }
  return 0;
};

// GET /api/user/buffer-time
// Exposes the global bet-placement buffer (Owner.platform_configurations.buffer_time)
// to the client so the user panel honours the admin setting instead of a hardcoded default.
const getBufferTime = async (req, res) => {
  try {
    const buffer_time = await getOwnerBufferTime();
    return res.json({ success: true, buffer_time });
  } catch (err) {
    console.error("getBufferTime error:", err);
    return res.json({ success: true, buffer_time: 0 });
  }
};



const walletUpdate = async (wallet, balanceChange, transaction, context = {}) => {
  const {
    user_id,
    match_title,
    selection_name,
    market_type,
    game_type,
    match_id,
    eventid,
    sid,
    newBet
  } = context;

  if (isNaN(balanceChange)) {
    console.error(`[walletUpdate] ❌ Critical: balanceChange is NaN for user ${user_id}. Context:`, context);
    return; // Abort to identify source and prevent corruption
  }

  let currentCash = Number(wallet.cash || 0);

  // Apply wallet delta only when non-zero. Zero-delta (hedge that doesn't
  // change max liability) still needs an audit ledger row below.
  if (balanceChange < 0) {
    // Negative delta = cash returned (hedging reduced max exposure)
    const amountToAdd = Math.abs(balanceChange);
    wallet.cash = currentCash + amountToAdd;
    await wallet.save({ transaction });
  } else if (balanceChange > 0) {
    // Positive delta = cash deducted (max exposure increased)
    const amountToDeduct = balanceChange;
    if (currentCash >= amountToDeduct) {
      wallet.cash = currentCash - amountToDeduct;
    }
    if (isNaN(wallet.cash)) {
      console.error(`[walletUpdate] ❌ Resulting balance is NaN! Reverting. Curr: ${currentCash}, Ded: ${amountToDeduct}`);
      throw new Error("Balance calculation resulted in NaN");
    }
    await wallet.save({ transaction });
  }

  const newBalance = Number(wallet.cash || 0);

  // ✅ DebitLedger — keep existing behavior (only when actually deducted)
  if (balanceChange > 0) {
    await DebitLedger.create({
      user_id,
      amount: balanceChange,
      currency: "INR",
      reason: "bet_placed",
      description: `${match_title} ${selection_name}`,
      balance: newBalance,
      market_type: market_type || game_type,
      match_id: match_id,
      event_id: eventid,
      sport_id: sid,
      meta: { bet_id: newBet?.id }
    }, { transaction });
  }

  // ✅ CreditsLedger — ALWAYS write a `bet_placed` audit row per bet,
  //    so per-bet history can find the placement entry by bet_id.
  //    `amount` reflects the cash impact at placement:
  //      • balanceChange > 0  → -balanceChange (debit)
  //      • balanceChange < 0  → 0 (no cash impact at placement; the
  //        exposure_release entry below carries the positive amount)
  const placedAmount = balanceChange > 0 ? -balanceChange : 0;
  await CreditsLedger.create({
    user_id: String(user_id),
    currency: "INR",
    amount: placedAmount,
    reason: "bet_placed",
    description: `${match_title} ${selection_name}`,
    netamount: placedAmount,
    closing: newBalance,
    market_type: market_type || game_type,
    match_id: match_id,
    eventid: eventid,
    sport_id: sid,
    bet_id: newBet?.id || null,
    category: 'SPORTS',
  }, { transaction });

  // ✅ CreditsLedger — exposure_release row when this bet hedged earlier
  //    exposure and freed up cash at placement time.
  if (balanceChange < 0) {
    const releaseAmount = Math.abs(balanceChange);
    await CreditsLedger.create({
      user_id: String(user_id),
      currency: "INR",
      amount: releaseAmount,
      reason: "exposure_release",
      description: `${match_title} ${selection_name} (exposure release)`,
      netamount: releaseAmount,
      closing: newBalance,
      market_type: market_type || game_type,
      match_id: match_id,
      eventid: eventid,
      sport_id: sid,
      bet_id: newBet?.id || null,
      category: 'SPORTS',
    }, { transaction });
  }

  console.log(`[walletUpdate] Delta: ${balanceChange}, Cash: ${wallet.cash}`);
};




//======================================================================================================
//-------------------------   SPORTS PLACE BET FUNCTION  -----------------------------------------------
//======================================================================================================

// `options` is the optional 3rd argument used by placeCombinedBet:
//   options.transaction   — the CALLER owns the transaction: placeBet does not
//                           commit, does not roll back, and does not emit the
//                           balance socket push (the caller does all three
//                           once, after every leg has been priced).
//   options.skipMinStake  — waive the per-leg market MINIMUM. A dutched slip
//                           splits one stake across runners, so an 8.37 leg of
//                           a 100 slip must not trip a 100 minimum; the caller
//                           enforces the minimum against the slip TOTAL.
// As a plain Express handler the 3rd argument is `next` (a function) and is
// ignored — only a plain object is treated as options.
export const placeBet = async (req, res, options) => {

  const opts = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
  const ownsTransaction = !opts.transaction;
  const transaction = opts.transaction || await sequelize.transaction();

  try {


    const user_id = req.user.account.id; //set in auth middleware
    if (!user_id) return res.status(400).json({ success: false, error: "User ID is required" });

    let {
      game_type,
      match_id,
      match_title,
      selection_name,
      bet_type,
      odds,
      stake_amount,
      team_one,
      team_two,
      category,
      original_currency,
      original_amount,
      usd_amount,
      match_start_time,
      eventid,
      fancy_name,
      count, sid,
      market_type,
      unmatched,
      unmatched_odds,
      is_cashout,
      size,
      runners,
      lay_size,
      back_size,
      runner_odds,
      mname,
      gtype,
      nat,
      section
    } = req.body;


    count = runners.length;


    console.log('PLACE BET PAYLOAD RECEIVED:', req.body);
    const ip_address = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress || req.ip;
    console.log('IP ADDRESS:', ip_address);




    //=============================================================================================
    // ✅ STEP 2:                 COMMON VALIDATIONS
    //=============================================================================================

    //  Hierarchical Bet Lock Check
    const hierarchyAllowed = await BetLockService.isBettingAllowed(user_id);
    if (!hierarchyAllowed) {
      return res.status(403).json({
        success: false,
        message: "Betting locked by admin/upline.",
      });
    }


    // Dynamic Sport ID Lookup
    let sportsId = null;
    if (sid) {
      // If sid is provided, try to find the game by sport_id
      const platformGame = await PlatformGames.findOne({ where: { sport_id: String(sid) }, transaction });
      if (platformGame) {
        sportsId = platformGame.id;
      }
    }

    //  checking user bet lock status
    const lockStatus = await checkUserBetLock(user_id, game_type, eventid, transaction, match_id);
    if (!lockStatus.allowed) {
      return res.status(403).json({
        success: false,
        message: lockStatus.message,
      });
    }


    // Fallback or additional check if needed (e.g. using category/game_type)
    if (!sportsId) {
      console.warn(`Could not resolve PlatformGame for sid: ${sid}`);
    }

    // ✅ checking platform bet lock status
    if (sportsId) {
      const platformlockStatus = await checkPlatformBetLock(sportsId, game_type, user_id, transaction);
      if (!platformlockStatus.allowed) {
        return res.status(403).json({
          success: false,
          message: platformlockStatus.message,
        });
      }
    }


    // ✅ checking sports lock (Sport → Series → Match → Market hierarchy + upline staff/owner)
    if (sid) {
      const sportsLockStatus = await SportsLockController.checkSportsLock(
        user_id,
        sid,           // sport_id
        null,          // series_id (not available in bet payload, checked at sport/match/market level)
        eventid,       // match_id (event_id is the match identifier)
        match_id       // market_id
      );
      if (!sportsLockStatus.allowed) {
        return res.status(403).json({
          success: false,
          message: sportsLockStatus.message,
        });
      }
    }

    //=============================================================================================
    // ✅ STEP 3:                   PLATFORM SPECIFIC VALIDATIONS DIAMOND99
    //=============================================================================================


    //==========================================================================================
    // ✅ STEP 4: Call external API first   [SELECT ONE OPTION ONLY - COMMENT OUT THE OTHER OPTION] 
    // =========================================================================================

    const placedata = getMarketNameFromGtype({ mname, gtype, nat, section });

    console.log("placedata", placedata);

    if (placedata) {
      const apiPayload = {
        sportsid: sid,
        gmid: eventid,
        marketName: placedata.marketName,
        mname: placedata.mname,
        gtype: placedata.gtype,

      };

      if (gtype == "match" || gtype == "bookmaker" || gtype == "bookmaker2" || gtype == "match1") {
        match_title = placedata.marketName;
      }


      //---------------------------------------------------------------------------------------
      // [ PROCEEDING BET PLACEMENT ] :  despite external API failure with warning logs 
      //-------------------------------------------------------------------------------------

      let apiResponse;
      const placedBetsUrl =
        "http://cloud.turnkeyxgaming.com:8086/api/v1/post-market";

      console.log("External API URL:", placedBetsUrl);
      console.log("External API Payload:", apiPayload);

      try {
        apiResponse = await axios.request({
          method: "POST",
          url: placedBetsUrl,
          headers: {
            "x-turnkeyxgaming-key": "69a1b439560c772d441cabe7",
          },
          data: apiPayload,
          timeout: 2000
        });

        console.log("External API Response:", apiResponse?.data);

        if (!apiResponse.data || apiResponse.status !== 200) {
          throw new Error("External API rejected the bet");
        }

      } catch (apiErr) {
        console.warn(
          "External API Warning (Non-blocking):",
          apiErr?.response?.data || apiErr.message
        );
      }
    } else {
      console.warn("Skipping external API call: placedata is null (Market info missing or format invalid).");
    }




    //-----------------------------------------------------------------------------------------
    // [ NOT PROCEEDING BET PLACEMENT ] : Throw error if bet is not saved to external api 
    //-----------------------------------------------------------------------------------------

    // let apiResponse;
    // const placedBetsUrl = `${process.env.DIAMOND_BASE_URL}/placed_bets?key=${process.env.DIAMOND_API_KEY}`;

    // console.log("External API URL:", placedBetsUrl);
    // console.log("External API Payload:", apiPayload);

    // apiResponse = await axios.post(
    //   placedBetsUrl,
    //   apiPayload,
    //   { timeout: 5000 }
    // );
    // console.log("External API Response:", apiResponse?.data);

    // if (!apiResponse.data || apiResponse.status !== 200) {
    //   throw new Error("External API rejected the bet");
    // }

    // console.log("External API Response:", apiResponse?.data);






    //=============================================================================================
    // ✅ STEP 4.5:                 MIN / MAX STAKE VALIDATION (server-side)
    //=============================================================================================
    // Frontend validates limits too, but the API must not trust the client —
    // limits come from the live (redis-cached) market feed. If the feed can't
    // be read (match ended / upstream down), betting stays up under env caps.
    {
      let limits = null;
      try {
        limits = await resolveMarketLimits({ eventid, sid, match_id, mname, market_type, selection_name });
      } catch (limitErr) {
        console.warn('[placeBet] Market limits lookup failed (non-blocking):', limitErr.message);
      }

      const stakeNum = Number(stake_amount);
      // Cashout hedge stakes are COMPUTED (not user-chosen) — a min-stake
      // reject would leave the position unbalanceable. Max still applies.
      // Combined (dutched) legs skip it for the same reason: the caller checks
      // the market minimum against the slip TOTAL instead.
      const skipMin = is_cashout === true || opts.skipMinStake === true;
      if (limits) {
        console.log(`[placeBet] Limits for ${limits.marketName}: min=${limits.minLimit} max=${limits.maxLimit} stake=${stakeNum}${skipMin ? ' (cashout — min skipped)' : ''}`);
        if (!skipMin && limits.minLimit > 0 && stakeNum < limits.minLimit) {
          throw new Error(`Minimum bet amount is ${limits.minLimit}`);
        }
        if (limits.maxLimit > 0 && stakeNum > limits.maxLimit) {
          throw new Error(`Maximum bet amount is ${limits.maxLimit}`);
        }
      } else {
        // Fallback safety caps (market not found in feed) — env-overridable
        const hardCap = Number(process.env.MAX_STAKE_HARD_CAP) || 500000;
        const minDefault = Number(process.env.MIN_STAKE_DEFAULT) || 0;
        console.warn(`[placeBet] Limits unavailable for market ${match_id} — fallback caps min=${minDefault} max=${hardCap}`);
        if (!skipMin && minDefault > 0 && stakeNum < minDefault) {
          throw new Error(`Minimum bet amount is ${minDefault}`);
        }
        if (stakeNum > hardCap) {
          throw new Error(`Maximum bet amount is ${hardCap}`);
        }
      }
    }

    //=============================================================================================
    // ✅ STEP 4.55:              HORSE RACING BETTING WINDOW (server-side)
    //=============================================================================================
    // A horse race (sid=10) accepts bets ONLY in the final
    // RACE_BET_WINDOW_MINUTES before the off. Greyhound (65) is unaffected.
    // The start time comes from the LIVE board feed — never from the
    // client-sent match_start_time, which is forgeable. Combined slips inherit
    // this automatically because every leg goes through placeBet.
    // Feed unreadable / race not listed → fails open (check skipped), matching
    // the limit and rate-cap checks above.
    if (String(sid) === '10') {
      const raceStartMs = await resolveRaceStartMs(eventid, sid);
      if (raceStartMs != null) {
        const minutesToOff = (raceStartMs - Date.now()) / 60000;
        console.log(`[placeBet] Race window: gmid=${eventid} minutesToOff=${minutesToOff.toFixed(1)} window=${RACE_BET_WINDOW_MINUTES}`);
        if (minutesToOff > RACE_BET_WINDOW_MINUTES) {
          throw new Error(`Betting opens ${RACE_BET_WINDOW_MINUTES} minutes before the race starts`);
        }
      } else {
        console.warn(`[placeBet] Race start unresolved for gmid=${eventid} — window check skipped`);
      }
    }

    //=============================================================================================
    // ✅ STEP 4.6:            CRICKET ODI/T20 MATCH_ODDS RATE CAP (server-side)
    //=============================================================================================
    // Operator rule "Bet Not Accept Rate Over 4.00 on Oneday and T20": on cricket
    // limited-overs (ODI / T20) matches, a MATCH_ODDS bet's rate may not exceed
    // 4.00. Test matches are exempt. The frontend blocks this too, but the API
    // must not trust the client — the match FORMAT is read from the live feed
    // (getSportDataById → cname), never from a client-sent flag. Only runs when a
    // bet actually crosses the cap, so normal bets pay no extra feed call.
    {
      const RATE_CAP = 4.0;
      const isMatchOdds = ['MATCH_ODDS', 'MATCH', 'MO'].includes(String(market_type || game_type || '').toUpperCase())
        || /match[\s_]*odds/i.test(String(mname || ''));
      if (String(sid) === '4' && isMatchOdds && Number(odds) > RATE_CAP) {
        let hay = String(match_title || '');
        try {
          const sd = await CricketService.getSportDataById(eventid, sid);
          const m = Array.isArray(sd?.data) ? sd.data[0] : null;
          if (m) hay = `${m.cname || ''} ${m.ename || match_title || ''}`;
        } catch (fmtErr) {
          // Feed unreadable → fall back to match_title; cap applies (safe default).
          console.warn('[placeBet] Rate-cap format lookup failed (non-blocking):', fmtErr.message);
        }
        const isTest = /\btest\b|ashes|first[\s-]?class|county\s+champ|sheffield\s+shield|ranji|plunket/i.test(hay);
        if (!isTest) {
          throw new Error('Bet Not Accept Rate Over 4.00 on Oneday and T20');
        }
      }
    }

    //=============================================================================================
    // ✅ STEP 5:                   EXPOSURE CALCULATION & WALLET VALIDATION
    //=============================================================================================

    const stake = Number(stake_amount);
    const oddN = Number(odds);
    let betTypeLower = (bet_type || "").toLowerCase().trim();
    console.log('Bet details:', { stake, oddN, betTypeLower, game_type });
    if (game_type === "BOOKMAKER") {
      game_type = "BM"
    }
    if (game_type === "FANCY") {
      game_type = "FAN"
    }
    // The client never sends 'BOOKMAKER' — GameDetails.jsx only sends
    // 'MATCH'/'FANCY' and identifies a bookmaker by mname/gtype — so the mapping
    // above never fired and bookmaker bets were stored as 'MO'. Their odds are
    // PERCENTAGES (78 = +78%), so settlement then read 78 as decimal and paid
    // (78-1)*stake instead of stake*78/100 — a ~100x overpayment. Classify off
    // the market identity instead, so 'BM' is stored and normalizeOdds applies.
    if (game_type !== "FAN" && isBookmakerMarket({ game_type, market_type, mname, gtype })) {
      game_type = "BM";
    }
    console.log('Normalized game_type:', game_type);



    const isYesNo = betTypeLower === 'yes' || betTypeLower === 'no';
    const isFancy = game_type === "FAN" || (game_type === "MO" && isYesNo);
    const isBookmaker = game_type === 'BM';

    // Validation
    if (stake <= 0) throw new Error("Invalid stake");
    if (isFancy) {
      if (!Number.isFinite(oddN) || oddN <= 0) throw new Error("Invalid fancy odds");
      // if (!isYesNo) throw new Error("Fancy bet must be YES or NO");
    } else {
      if (!Number.isFinite(oddN) || oddN <= 1) throw new Error("Invalid odds");
    }


    // Wallet
    const wallet = await Wallet.findOne({ where: { user_id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!wallet) throw new Error("Wallet not found");
    const currentInr = Number(wallet.cash);
    console.log('Current wallet balance:', currentInr);

    const exposureGameType = market_type;

    // Exposures
    const oldExposuresRows = await UserExposure.findAll({
      where: {
        user_id,
        match_id,
        game_type: exposureGameType
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const oldExposures = {};
    oldExposuresRows.forEach((r) => (oldExposures[r.team_name] = Number(r.exposure_amount)));
    console.log('OLD EXPOSURES:', oldExposures);

    let newExposures = { ...oldExposures };

    const sel = (selection_name || "").toString();
    const selLower = sel.trim().toLowerCase();
    const isDrawSel = selLower === "the draw" || selLower === "draw";
    const normGameType = isFancy ? "FAN" : game_type === "BM" ? "BM" : "MO";

    const marketsfornonfancy = [
      'Game Winner 1/2',
      'OVER_UNDER_55',
      'OVER_UNDER_45',
      'OVER_UNDER_35',
      'OVER_UNDER_25',
      'OVER_UNDER_15',
      'OVER_UNDER_05',
      'OVER_UNDER_10',

      '2nd Period Winner',
      '1st Period Winner',
      '3rd Period Winner',
      'Both Teams To Score',
      'DRAW_NO_BET',
      'Draw No Bet',

      'HALF_TIME',
      'Match Time Result 70:00',
      'Match Time Result 10:00',
      'Match Time Result 30:00',
      'Match Time Result 20:00',
      'Match Time Result 40:00',
      'Match Time Result 60:00',
      'Match Time Result 50:00',
      'Match Time Result 70:00',
      'Match Time Result 80:00',
      'Match Time Result 90:00',
      'Game Winner 1/1',
      'Game Winner 1/2',
      'Game Winner 1/3',
      'Game Winner 1/4',
      'Game Winner 1/5',
      'Game Winner 1/6',
      'Game Winner 1/7',
      'Game Winner 1/8',
      'Game Winner 1/9',
      'Game Winner 1/10',
      'Game Winner 1/11',
      'Game Winner 1/12',
      'Game Winner 1/13',
      'Game Winner 1/14',
      'Game Winner 1/15',
      'Game Winner 1/16',
      'Game Winner 1/17',
      'Game Winner 1/18',
      'Game Winner 1/19',
      'Game Winner 1/20',
      'Game Winner 2/2',
      'Game Winner 2/3',
      'Game Winner 2/4',
      'Game Winner 2/5',
      'Game Winner 2/6',
      'Game Winner 2/7',
      'Game Winner 2/8',
      'Game Winner 2/9',
      'Game Winner 2/10',
      'Game Winner 2/11',
      'Game Winner 2/12',
      'Game Winner 2/13',
      'Game Winner 2/14',
      'Game Winner 2/15',
      'Game Winner 2/16',
      'Game Winner 2/17',
      'Game Winner 2/18',
      'Game Winner 2/19',
      'Game Winner 2/20',
      'Game Winner 3/1',
      'Game Winner 3/2',
      'Game Winner 3/3',
      'Game Winner 3/4',
      'Game Winner 3/5',
      'Game Winner 3/6',
      'Game Winner 3/7',
      'Game Winner 3/8',
      'Game Winner 3/9',
      'Game Winner 3/10',
      'Game Winner 3/11',
      'Game Winner 3/12',
      'Game Winner 3/13',
      'Game Winner 3/14',
      'Game Winner 3/15',
      'Game Winner 3/16',
      'Game Winner 3/17',
      'Game Winner 3/18',
      'Game Winner 3/19',
      'Game Winner 3/20',
      'Game Winner 4/1',
      'Game Winner 4/2',
      'Game Winner 4/3',
      'Game Winner 4/4',
      'Game Winner 4/5',
      'Game Winner 4/6',
      'Game Winner 4/7',
      'Game Winner 4/8',
      'Game Winner 4/9',
      'Game Winner 4/10',
      'Game Winner 4/11',
      'Game Winner 4/12',
      'Game Winner 4/13',
      'Game Winner 4/14',
      'Game Winner 4/15',
      'Game Winner 4/16',
      'Game Winner 4/17',
      'Game Winner 4/18',
      'Game Winner 4/19',
      'Game Winner 4/20',
      'Game Winner 5/1',
      'Game Winner 5/2',
      'Game Winner 5/3',
      'Game Winner 5/4',
      'Game Winner 5/5',
      'Game Winner 5/6',
      'Game Winner 5/7',
      'Game Winner 5/8',
      'Game Winner 5/9',
      'Game Winner 5/10',
      'Game Winner 5/11',
      'Game Winner 5/12',
      'Game Winner 5/13',
      'Game Winner 5/14',
      'Game Winner 5/15',
      'Game Winner 5/16',
      'Game Winner 5/17',
      'Game Winner 5/18',
      'Game Winner 5/19',
      'Game Winner 5/20',
      'Game Winner 6/1',
      'Game Winner 6/2',
      'Game Winner 6/3',
      'Game Winner 6/4',
      'Game Winner 6/5',
      'Game Winner 6/6',
      'Game Winner 6/7',
      'Game Winner 6/8',
      'Game Winner 6/9',
      'Game Winner 6/10',
      'Game Winner 7/1',
      'Game Winner 7/2',
      'Game Winner 7/3',
      'Game Winner 7/4',
      'Game Winner 7/5',
      'Game Winner 7/6',
      'Game Winner 7/7',
      'Game Winner 2/7',
      'Game Winner 3/7',
      'Game Winner 4/7',
      'Game Winner 5/7',
      'Game Winner 6/7',
      'Game Winner 7/7',
      '1st Set Winner Home/Away',
      '2nd Set Winner Home/Away',
      '3rd Set Winner Home/Away',
      '4th Set Winner Home/Away',
      '5th Set Winner Home/Away',
      '1st Set Winner',
      '2nd Set Winner',
      '3rd Set Winner',
      '4th Set Winner',
      '5th Set Winner',
      '6th Set Winner',
      '1st Half Winner',
      '2nd Half Winner',
      '3rd Half Winner',
      '4th Half Winner',
      '5th Half Winner',
      '6th Half Winner',
      '1st Quarter Winner',
      '2nd Quarter Winner',
      '3rd Quarter Winner',
      '4th Quarter Winner',
      '5th Quarter Winner',
      '6th Quarter Winner',
      '1st Set Race To 1.0',
      '1st Set Race To 2.0',
      '1st Set Race To 3.0',
      '1st Set Race To 4.0',
      '1st Set Race To 5.0',
      '1st Set Race To 6.0',
      '1st Set Race To 7.0',
      '1st Set Race To 8.0',
      '1st Set Race To 9.0',
      '1st Set Race To 10.0',
      '1st Set Race To 11.0',
      '1st Set Race To 12.0',
      '1st Set Race To 13.0',
      '1st Set Race To 14.0',
      '1st Set Race To 15.0',
      '2nd Set Race To 1.0',
      '2nd Set Race To 2.0',
      '2nd Set Race To 3.0',
      '2nd Set Race To 4.0',
      '2nd Set Race To 5.0',
      '2nd Set Race To 6.0',
      '2nd Set Race To 7.0',
      '2nd Set Race To 8.0',
      '2nd Set Race To 9.0',
      '2nd Set Race To 10.0',
      '2nd Set Race To 11.0',
      '2nd Set Race To 12.0',
      '2nd Set Race To 13.0',
      '2nd Set Race To 14.0',
      '2nd Set Race To 15.0',
      '3rd Set Race To 1.0',
      '3rd Set Race To 2.0',
      '3rd Set Race To 3.0',
      '3rd Set Race To 4.0',
      '3rd Set Race To 5.0',
      '3rd Set Race To 6.0',
      '3rd Set Race To 7.0',
      '3rd Set Race To 8.0',
      '3rd Set Race To 9.0',
      '3rd Set Race To 10.0',
      '3rd Set Race To 11.0',
      '3rd Set Race To 12.0',
      '3rd Set Race To 13.0',
      '3rd Set Race To 14.0',
      '3rd Set Race To 15.0',
      '4th Set Race To 1.0',
      '4th Set Race To 2.0',
      '4th Set Race To 3.0',
      '4th Set Race To 4.0',
      '4th Set Race To 5.0',
      '4th Set Race To 6.0',
      '4th Set Race To 7.0',
      '4th Set Race To 8.0',
      '4th Set Race To 9.0',
      '4th Set Race To 10.0',
      '4th Set Race To 11.0',
      '4th Set Race To 12.0',
      '4th Set Race To 13.0',
      '4th Set Race To 14.0',
      '4th Set Race To 15.0',
      'Point Winner 1/1/1',
      'Point Winner 1/1/1',
      'Point Winner 1/1/2',
      'Point Winner 1/1/3',
      'Point Winner 1/1/4',
      'Point Winner 1/1/5',
      'Point Winner 1/1/6',
      'Point Winner 1/1/7',
      'Point Winner 1/1/8',
      'Point Winner 1/1/9',
      'Point Winner 1/1/10',
      'Point Winner 1/1/11',
      'Point Winner 1/1/12',
      'Point Winner 1/1/13',
      'Point Winner 1/1/14',
      'Point Winner 1/1/15',
      'Point Winner 1/1/16',
      'Point Winner 1/1/17',
      'Point Winner 1/1/18',
      'Point Winner 1/1/19',
      'Point Winner 1/1/20',
      'Point Winner 1/2/1',
      'Point Winner 1/2/2',
      'Point Winner 1/2/3',
      'Point Winner 1/2/4',
      'Point Winner 1/2/5',
      'Point Winner 1/2/6',
      'Point Winner 1/2/7',
      'Point Winner 1/2/8',
      'Point Winner 1/2/9',
      'Point Winner 1/2/10',
      'Point Winner 1/2/11',
      'Point Winner 1/2/12',
      'Point Winner 1/2/13',
      'Point Winner 1/2/14',
      'Point Winner 1/2/15',
      'Point Winner 1/2/16',
      'Point Winner 1/2/17',
      'Point Winner 1/2/18',
      'Point Winner 1/2/19',
      'Point Winner 1/2/20',
      'Point Winner 1/3/1',
      'Point Winner 1/3/2',
      'Point Winner 1/3/3',
      'Point Winner 1/3/4',
      'Point Winner 1/3/5',
      'Point Winner 1/3/6',
      'Point Winner 1/3/7',
      'Point Winner 1/3/8',
      'Point Winner 1/3/9',
      'Point Winner 1/3/10',
      'Point Winner 1/3/11',
      'Point Winner 1/3/12',
      'Point Winner 1/3/13',
      'Point Winner 1/3/14',
      'Point Winner 1/3/15',
      'Point Winner 1/3/16',
      'Point Winner 1/3/17',
      'Point Winner 1/3/18',
      'Point Winner 1/3/19',
      'Point Winner 1/3/20',
      'Point Winner 1/4/1',
      'Point Winner 1/4/2',
      'Point Winner 1/4/3',
      'Point Winner 1/4/4',
      'Point Winner 1/4/5',
      'Point Winner 1/4/6',
      'Point Winner 1/4/7',
      'Point Winner 1/4/8',
      'Point Winner 1/4/9',
      'Point Winner 1/5/1',
      'Point Winner 1/5/2',
      'Point Winner 1/5/3',
      'Point Winner 1/5/4',
      'Point Winner 1/5/5',
      'Point Winner 1/5/6',
      'Point Winner 1/5/7',
      'Point Winner 1/5/8',
      'Point Winner 1/5/9',
      'Point Winner 1/6/1',
      'Point Winner 1/6/2',
      'Point Winner 1/6/3',
      'Point Winner 1/6/4',
      'Point Winner 1/6/5',
      'Point Winner 1/6/6',
      'Point Winner 1/6/7',
      'Point Winner 1/6/8',
      'Point Winner 1/6/9',
      'Point Winner 1/7/1',
      'Point Winner 1/7/2',
      'Point Winner 1/7/3',
      'Point Winner 1/7/4',
      'Point Winner 1/7/5',
      'Point Winner 1/7/6',
      'Point Winner 1/7/7',
      'Point Winner 1/7/8',
      'Point Winner 1/7/9',
      'Point Winner 1/8/1',
      'Point Winner 1/8/2',
      'Point Winner 1/8/3',
      'Point Winner 1/8/4',
      'Point Winner 1/8/5',
      'Point Winner 1/8/6',
      'Point Winner 1/8/7',
      'Point Winner 1/8/8',
      'Point Winner 1/8/9',
      'Point Winner 1/9/1',
      'Point Winner 1/9/2',
      'Point Winner 1/9/3',
      'Point Winner 1/9/4',
      'Point Winner 1/9/5',
      'Point Winner 1/9/6',
      'Point Winner 1/9/7',
      'Point Winner 1/9/8',
      'Point Winner 1/9/9',


      'Point Winner 2/1/1',
      'Point Winner 2/1/2',
      'Point Winner 2/1/3',
      'Point Winner 2/1/4',
      'Point Winner 2/1/5',
      'Point Winner 2/1/6',
      'Point Winner 2/1/7',
      'Point Winner 2/1/8',
      'Point Winner 2/1/9',
      'Point Winner 2/2/1',
      'Point Winner 2/2/2',
      'Point Winner 2/2/3',
      'Point Winner 2/2/4',
      'Point Winner 2/2/5',
      'Point Winner 2/2/6',
      'Point Winner 2/2/7',
      'Point Winner 2/2/8',
      'Point Winner 2/2/9',
      'Point Winner 2/3/1',
      'Point Winner 2/3/2',
      'Point Winner 2/3/3',
      'Point Winner 2/3/4',
      'Point Winner 2/3/5',
      'Point Winner 2/3/6',
      'Point Winner 2/3/7',
      'Point Winner 2/3/8',
      'Point Winner 2/3/9',
      'Point Winner 2/4/1',
      'Point Winner 2/4/2',
      'Point Winner 2/4/3',
      'Point Winner 2/4/4',
      'Point Winner 2/4/5',
      'Point Winner 2/4/6',
      'Point Winner 2/4/7',
      'Point Winner 2/4/8',
      'Point Winner 2/4/9',
      'Point Winner 2/5/1',
      'Point Winner 2/5/2',
      'Point Winner 2/5/3',
      'Point Winner 2/5/4',
      'Point Winner 2/5/5',
      'Point Winner 2/5/6',
      'Point Winner 2/5/7',
      'Point Winner 2/5/8',
      'Point Winner 2/5/9',
      'Point Winner 2/6/1',
      'Point Winner 2/6/2',
      'Point Winner 2/6/3',
      'Point Winner 2/6/4',
      'Point Winner 2/6/5',
      'Point Winner 2/6/6',
      'Point Winner 2/6/7',
      'Point Winner 2/6/8',
      'Point Winner 2/6/9',
      'Point Winner 2/7/1',
      'Point Winner 2/7/2',
      'Point Winner 2/7/3',
      'Point Winner 2/7/4',
      'Point Winner 2/7/5',
      'Point Winner 2/7/6',
      'Point Winner 2/7/7',
      'Point Winner 2/7/8',
      'Point Winner 2/7/9',
      'Point Winner 2/8/1',
      'Point Winner 2/8/2',
      'Point Winner 2/8/3',
      'Point Winner 2/8/4',
      'Point Winner 2/8/5',
      'Point Winner 2/8/6',
      'Point Winner 2/8/7',
      'Point Winner 2/8/8',
      'Point Winner 2/8/9',
      'Point Winner 2/9/1',
      'Point Winner 2/9/2',
      'Point Winner 2/9/3',
      'Point Winner 2/9/4',
      'Point Winner 2/9/5',
      'Point Winner 2/9/6',
      'Point Winner 2/9/7',
      'Point Winner 2/9/8',
      'Point Winner 2/9/9',

      'Point Winner 3/1/1',
      'Point Winner 3/1/2',
      'Point Winner 3/1/3',
      'Point Winner 3/1/4',
      'Point Winner 3/1/5',
      'Point Winner 3/1/6',
      'Point Winner 3/1/7',
      'Point Winner 3/1/8',
      'Point Winner 3/1/9',
      'Point Winner 3/2/1',
      'Point Winner 3/2/2',
      'Point Winner 3/2/3',
      'Point Winner 3/2/4',
      'Point Winner 3/2/5',
      'Point Winner 3/2/6',
      'Point Winner 3/2/7',
      'Point Winner 3/2/8',
      'Point Winner 3/2/9',
      'Point Winner 3/3/1',
      'Point Winner 3/3/2',
      'Point Winner 3/3/3',
      'Point Winner 3/3/4',
      'Point Winner 3/3/5',
      'Point Winner 3/3/6',
      'Point Winner 3/3/7',
      'Point Winner 3/3/8',
      'Point Winner 3/3/9',
      'Point Winner 3/4/1',
      'Point Winner 3/4/2',
      'Point Winner 3/4/3',
      'Point Winner 3/4/4',
      'Point Winner 3/4/5',
      'Point Winner 3/4/6',
      'Point Winner 3/4/7',
      'Point Winner 3/4/8',
      'Point Winner 3/4/9',
      'Point Winner 3/5/1',
      'Point Winner 3/5/2',
      'Point Winner 3/5/3',
      'Point Winner 3/5/4',
      'Point Winner 3/5/5',
      'Point Winner 3/5/6',
      'Point Winner 3/5/7',
      'Point Winner 3/5/8',
      'Point Winner 3/5/9',
      'Point Winner 3/6/1',
      'Point Winner 3/6/2',
      'Point Winner 3/6/3',
      'Point Winner 3/6/4',
      'Point Winner 3/6/5',
      'Point Winner 3/6/6',
      'Point Winner 3/6/7',
      'Point Winner 3/6/8',
      'Point Winner 3/6/9',
      'Point Winner 3/7/1',
      'Point Winner 3/7/2',
      'Point Winner 3/7/3',
      'Point Winner 3/7/4',
      'Point Winner 3/7/5',
      'Point Winner 3/7/6',
      'Point Winner 3/7/7',
      'Point Winner 3/7/8',
      'Point Winner 3/7/9',
      'Point Winner 3/8/1',
      'Point Winner 3/8/2',
      'Point Winner 3/8/3',
      'Point Winner 3/8/4',
      'Point Winner 3/8/5',
      'Point Winner 3/8/6',
      'Point Winner 3/8/7',
      'Point Winner 3/8/8',
      'Point Winner 3/8/9',
      'Point Winner 3/9/1',
      'Point Winner 3/9/2',
      'Point Winner 3/9/3',
      'Point Winner 3/9/4',
      'Point Winner 3/9/5',
      'Point Winner 3/9/6',
      'Point Winner 3/9/7',
      'Point Winner 3/9/8',
      'Point Winner 3/9/9',

      'Point Winner 4/1/1',
      'Point Winner 4/1/2',
      'Point Winner 4/1/3',
      'Point Winner 4/1/4',
      'Point Winner 4/1/5',
      'Point Winner 4/1/6',
      'Point Winner 4/1/7',
      'Point Winner 4/1/8',
      'Point Winner 4/1/9',
      'Point Winner 4/2/1',
      'Point Winner 4/2/2',
      'Point Winner 4/2/3',
      'Point Winner 4/2/4',
      'Point Winner 4/2/5',
      'Point Winner 4/2/6',
      'Point Winner 4/2/7',
      'Point Winner 4/2/8',
      'Point Winner 4/2/9',
      'Point Winner 4/3/1',
      'Point Winner 4/3/2',
      'Point Winner 4/3/3',
      'Point Winner 4/3/4',
      'Point Winner 4/3/5',
      'Point Winner 4/3/6',
      'Point Winner 4/3/7',
      'Point Winner 4/3/8',
      'Point Winner 4/3/9',
      'Point Winner 4/4/1',
      'Point Winner 4/4/2',
      'Point Winner 4/4/3',
      'Point Winner 4/4/4',
      'Point Winner 4/4/5',
      'Point Winner 4/4/6',
      'Point Winner 4/4/7',
      'Point Winner 4/4/8',
      'Point Winner 4/4/9',
      'Point Winner 4/5/1',
      'Point Winner 4/5/2',
      'Point Winner 4/5/3',
      'Point Winner 4/5/4',
      'Point Winner 4/5/5',
      'Point Winner 4/5/6',
      'Point Winner 4/5/7',
      'Point Winner 4/5/8',
      'Point Winner 4/5/9',
      'Point Winner 4/6/1',
      'Point Winner 4/6/2',
      'Point Winner 4/6/3',
      'Point Winner 4/6/4',
      'Point Winner 4/6/5',
      'Point Winner 4/6/6',
      'Point Winner 4/6/7',
      'Point Winner 4/6/8',
      'Point Winner 4/6/9',
      'Point Winner 4/7/1',
      'Point Winner 4/7/2',
      'Point Winner 4/7/3',
      'Point Winner 4/7/4',
      'Point Winner 4/7/5',
      'Point Winner 4/7/6',
      'Point Winner 4/7/7',
      'Point Winner 4/7/8',
      'Point Winner 4/7/9',
      'Point Winner 4/8/1',
      'Point Winner 4/8/2',
      'Point Winner 4/8/3',
      'Point Winner 4/8/4',
      'Point Winner 4/8/5',
      'Point Winner 4/8/6',
      'Point Winner 4/8/7',
      'Point Winner 4/8/8',
      'Point Winner 4/8/9',
      'Point Winner 4/9/1',
      'Point Winner 4/9/2',
      'Point Winner 4/9/3',
      'Point Winner 4/9/4',
      'Point Winner 4/9/5',
      'Point Winner 4/9/6',
      'Point Winner 4/9/7',
      'Point Winner 4/9/8',
      'Point Winner 4/9/9',


      'Under/Over 5.5',
      'Under/Over 0.5',
      'Under/Over 1.5',
      'Under/Over 2.5',
      'Under/Over 3.5',
      'Under/Over 4.5',
      'Under/Over 6.5',
      // 'BM 1st Set Winner',
      // 'BM 2nd Set Winner',
      // 'BM 3rd Set Winner',
      // 'BM 4th Set Winner',
      // 'BM 5th Set Winner',
      '1st Set Race To 10.0',
      '1st Set Race To 9.0',
      '1st Set Race To 8.0',
      '1st Set Race To 7.0',
      '1st Set Race To 6.0',
      '1st Set Race To 5.0',
      '1st Set Race To 4.0',
      '1st Set Race To 3.0',
      '1st Set Race To 2.0',
      '1st Set Race To 1.0',
      '2nd Set Race To 10.0',
      '2nd Set Race To 9.0',
      '2nd Set Race To 8.0',
      '2nd Set Race To 7.0',
      '2nd Set Race To 6.0',
      '2nd Set Race To 5.0',
      '2nd Set Race To 4.0',
      '2nd Set Race To 3.0',
      '2nd Set Race To 2.0',
      '2nd Set Race To 1.0',
      '3rd Set Race To 10.0',
      '3rd Set Race To 9.0',
      '3rd Set Race To 8.0',
      '3rd Set Race To 7.0',
      '3rd Set Race To 6.0',
      '3rd Set Race To 5.0',
      '3rd Set Race To 4.0',
      '3rd Set Race To 3.0',
      '3rd Set Race To 2.0',
      '3rd Set Race To 1.0',
      '4th Set Race To 10.0',
      '4th Set Race To 9.0',
      '4th Set Race To 8.0',
      '4th Set Race To 7.0',
      '4th Set Race To 6.0',
      '4th Set Race To 5.0',
      '4th Set Race To 4.0',
      '4th Set Race To 3.0',
      '4th Set Race To 2.0',
      '4th Set Race To 1.0',
      '5th Set Race To 4.0',
      '5th Set Race To 3.0',
      '5th Set Race To 2.0',
      '5th Set Race To 1.0',
      'Total Tie Break in the Match 0.5',
      'Total Tie Break in the Match 1.0',
      'Total Tie Break in the Match 1.5',
      'Total Tie Break in the Match 2.0',
      'Total Tie Break in the Match 2.5',
      'Total Tie Break in the Match 3.5',
      'Game To Deuce 1/1',
      'Game To Deuce 1/2',
      'Game To Deuce 1/3',
      'Game To Deuce 1/4',
      'Game To Deuce 1/5',
      'Game To Deuce 1/6',
      'Game To Deuce 1/7',
      'Game To Deuce 1/8',
      'Game To Deuce 1/9',
      'Game To Deuce 1/10',
      'Game To Deuce 1/11',
      'Game To Deuce 1/12',
      'Game To Deuce 1/13',
      'Game To Deuce 1/14',
      'Game To Deuce 1/15',
      'Game To Deuce 1/16',
      'Game To Deuce 1/17',
      'Game To Deuce 1/18',
      'Game To Deuce 1/19',
      'Game To Deuce 1/20',
      'Game To Deuce 2/1',
      'Game To Deuce 2/2',
      'Game To Deuce 2/3',
      'Game To Deuce 2/4',
      'Game To Deuce 2/5',
      'Game To Deuce 2/6',
      'Game To Deuce 2/7',
      'Game To Deuce 2/8',
      'Game To Deuce 2/9',
      'Game To Deuce 2/10',
      'Game To Deuce 2/11',
      'Game To Deuce 2/12',
      'Game To Deuce 2/13',
      'Game To Deuce 2/14',
      'Game To Deuce 2/15',
      'Game To Deuce 2/16',
      'Game To Deuce 2/17',
      'Game To Deuce 2/18',
      'Game To Deuce 2/19',
      'Game To Deuce 2/20',

      'Game To Deuce 3/1',
      'Game To Deuce 3/2',
      'Game To Deuce 3/3',
      'Game To Deuce 3/4',
      'Game To Deuce 3/5',
      'Game To Deuce 3/6',
      'Game To Deuce 3/7',
      'Game To Deuce 3/8',
      'Game To Deuce 3/9',
      'Game To Deuce 3/10',
      'Game To Deuce 3/11',
      'Game To Deuce 3/12',
      'Game To Deuce 3/13',
      'Game To Deuce 3/14',
      'Game To Deuce 3/15',
      'Game To Deuce 3/16',
      'Game To Deuce 3/17',
      'Game To Deuce 3/18',
      'Game To Deuce 3/19',
      'Game To Deuce 3/20',

      'Game To Deuce 4/1',
      'Game To Deuce 4/2',
      'Game To Deuce 4/3',
      'Game To Deuce 4/4',
      'Game To Deuce 4/5',
      'Game To Deuce 4/6',
      'Game To Deuce 4/7',
      'Game To Deuce 4/8',
      'Game To Deuce 4/9',
      'Game To Deuce 4/10',
      'Game To Deuce 4/11',
      'Game To Deuce 4/12',
      'Game To Deuce 4/13',
      'Game To Deuce 4/14',
      'Game To Deuce 4/15',
      'Game To Deuce 4/16',
      'Game To Deuce 4/17',
      'Game To Deuce 4/18',
      'Game To Deuce 4/19',
      'Game To Deuce 4/20',

      'Game To Deuce 5/1',
      'Game To Deuce 5/2',
      'Game To Deuce 5/3',
      'Game To Deuce 5/4',
      'Game To Deuce 5/5',
      'Game To Deuce 5/6',
      'Game To Deuce 5/7',
      'Game To Deuce 5/8',
      'Game To Deuce 5/9',
      'Game To Deuce 5/10',
      'Game To Deuce 5/11',
      'Game To Deuce 5/12',
      'Game To Deuce 5/13',
      'Game To Deuce 5/14',
      'Game To Deuce 5/15',
      'Game To Deuce 5/16',
      'Game To Deuce 5/17',
      'Game To Deuce 5/18',
      'Game To Deuce 5/19',
      'Game To Deuce 5/20',

      'Game To Deuce 6/1',
      'Game To Deuce 6/2',
      'Game To Deuce 6/3',
      'Game To Deuce 6/4',
      'Game To Deuce 6/5',
      'Game To Deuce 6/6',
      'Game To Deuce 6/7',
      'Game To Deuce 6/8',
      'Game To Deuce 6/9',
      'Game To Deuce 6/10',
      'Game To Deuce 6/11',
      'Game To Deuce 6/12',
      'Game To Deuce 6/13',
      'Game To Deuce 6/14',
      'Game To Deuce 6/15',
      'Game To Deuce 6/16',
      'Game To Deuce 6/17',
      'Game To Deuce 6/18',
      'Game To Deuce 6/19',
      'Game To Deuce 6/20',

      'Game To Deuce 7/1',
      'Game To Deuce 7/2',
      'Game To Deuce 7/3',
      'Game To Deuce 7/4',
      'Game To Deuce 7/5',
      'Game To Deuce 7/6',
      'Game To Deuce 7/7',
      'Game To Deuce 7/8',
      'Game To Deuce 7/9',
      'Game To Deuce 7/10',

      'Game To Deuce 8/1',
      'Game To Deuce 8/2',
      'Game To Deuce 8/3',
      'Game To Deuce 8/4',
      'Game To Deuce 8/5',
      'Game To Deuce 8/6',
      'Game To Deuce 8/7',
      'Game To Deuce 8/8',
      'Game To Deuce 8/9',
      'Game To Deuce 8/10',

      'Game To Deuce 9/1',
      'Game To Deuce 9/2',
      'Game To Deuce 9/3',
      'Game To Deuce 9/4',
      'Game To Deuce 9/5',
      'Game To Deuce 9/6',
      'Game To Deuce 9/7',
      'Game To Deuce 9/8',
      'Game To Deuce 9/9',
      'Under/Over 180s 0.5',
      'Under/Over 180s 1.0',
      'Under/Over 180s 1.5',
      'Under/Over 180s 2.0',
      'Under/Over 180s 2.5',
      'Under/Over 180s 3.0',
      'Under/Over 180s 3.5',
      'Under/Over 180s 4.0',



      'Tied Match',
      "TIED_MATCH"



    ];
    function isNonFancyMarket(market_type) {

      // 1️⃣ fixed names
      if (fixedNonFancyMarkets.includes(market_type)) {
        return true;
      }

      // 2️⃣ Game Winner X/Y
      if (/^Game Winner\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
      }

      // 3️⃣ Match Time Result 10:00, 70:00, etc
      if (/^Match Time Result\s+\d{2}:\d{2}$/.test(market_type)) {
        return true;
      }

      // 4️⃣ Set Race To 1.0 – 15.0 (all sets)
      if (/^\d+(?:st|nd|rd|th)\s+Set Race To\s+(?:[1-9]|1[0-5])\.0$/.test(market_type)) {
        return true;
      }

      // 5️⃣ Under/Over 0.5 , 1.5 , 180s etc
      if (/^Under\/Over(?: 180s)?\s+\d+(\.\d)?$/.test(market_type)) {
        return true;
      }

      // 6️⃣ Total Tie Break in the Match X.X
      if (/^Total Tie Break in the Match\s+\d+(\.\d)?$/.test(market_type)) {
        return true;
      }

      // 7️⃣ Point Winner A/B/C
      if (/^Point Winner\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
      }

      // 8️⃣ Game To Deuce A/B   (your current list)
      if (/^Game To Deuce\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
      }

      // 9️⃣ Game To Deuce A/B/C (future support – as you mentioned before)
      if (/^Game To Deuce\s+(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)\/(?:[1-9]|1\d|20)$/.test(market_type)) {
        return true;
      }

      return false;
    }

    const fixedNonFancyMarkets = [
      'OVER_UNDER_55',
      'OVER_UNDER_45',
      'OVER_UNDER_35',
      'OVER_UNDER_25',
      'OVER_UNDER_15',
      'OVER_UNDER_05',
      'OVER_UNDER_10',

      '2nd Period Winner',
      '1st Period Winner',
      '3rd Period Winner',

      'Both Teams To Score',

      'DRAW_NO_BET',
      'Draw No Bet',

      'HALF_TIME',

      '1st Set Winner Home/Away',
      '2nd Set Winner Home/Away',
      '3rd Set Winner Home/Away',
      '4th Set Winner Home/Away',
      '5th Set Winner Home/Away',

      '1st Set Winner',
      '2nd Set Winner',
      '3rd Set Winner',
      '4th Set Winner',
      '5th Set Winner',
      '6th Set Winner',

      '1st Half Winner',
      '2nd Half Winner',
      '3rd Half Winner',
      '4th Half Winner',
      '5th Half Winner',
      '6th Half Winner',

      '1st Quarter Winner',
      '2nd Quarter Winner',
      '3rd Quarter Winner',
      '4th Quarter Winner',
      '5th Quarter Winner',
      '6th Quarter Winner',

      'Tied Match',
      'TIED_MATCH'
    ];

    const marketsforfancy = [
      '1st Innings 6 Overs Line',
      '2nd Innings 6 Overs Line',
      '3rd Innings 6 Overs Line',
      '1st Innings 50 Overs Line',
      '2nd Innings 50 Overs Line',
      '3rd Innings 50 Overs Line',
      '1st Innings 40 Overs Line',
      '2nd Innings 40 Overs Line',
      '3rd Innings 40 Overs Line',
      '1st Innings 30 Overs Line',
      '2nd Innings 30 Overs Line',
      '3rd Innings 30 Overs Line',
      '1st Innings 20 Overs Line',
      '2nd Innings 20 Overs Line',
      '3rd Innings 20 Overs Line',
      '1st Innings 10 Overs Line',
      '2nd Innings 10 Overs Line',
      '3rd Innings 10 Overs Line',
      'Over By Over',
      'Ball By Ball',
      'Normal',
      'khado',
      'meter',
      'fancy1',
      'oddeven',
    ];
    const marketsforBMfancy = [
      'BM 1st Set Winner',
      'BM 2nd Set Winner',
      'BM 3rd Set Winner',
      'BM 4th Set Winner',
      'BM 5th Set Winner',
    ]
    const marketforfancywithbigrunners = [
      '2ND INN 30 OVER',
      '2ND INN 35 OVER',
      '1ST INN 20 OVER',
      '2ND INN 50 OVER',
      'TOURNAMENT_WINNER',
      'Next Goal 1.0',
      'Next Goal 2.0',
      'Next Goal 3.0',
      'Next Goal 4.0',
      'Next Goal 5.0',
      'Next Goal 6.0',
      'Next Goal 7.0',
      'Next Goal 8.0',
      'Next Goal 9.0',
      'Next Goal 10.0',
      'Match Result/Both Teams to score',
      'Correct Score 1st Set',
      'Correct Score 2nd Set',
      'Correct Score 3rd Set',
      'Correct Score 4th Set',
      'Correct Score 5th Set',
      'Correct Score 6th Set',
      'HT/FT'

      // 'oddeven'

    ];

    function calculateRunnerExposure({
      runners,
      selectedRunner,
      stake,
      odd,
      betType,
      oldExposures = {},
      profitRate = null
    }) {
      let newExposures = { ...oldExposures };

      // profitRate lets callers supply the EXACT rate (see backProfitRate) rather
      // than round-tripping through normalized decimal odds, which truncates and
      // carries float error. Falls back to the decimal form when not supplied.
      const rate = profitRate != null ? profitRate : (odd - 1);
      const profit = round2(stake * rate);
      const liability = round2(stake * rate);

      const isBack = betType === 'back' || betType === 'yes';
      const isLay = betType === 'lay' || betType === 'no';

      for (const runner of runners) {
        const prev = oldExposures[runner] || 0;

        if (runner === selectedRunner) {
          newExposures[runner] = isBack
            ? prev + profit
            : prev - liability;
        } else {
          newExposures[runner] = isBack
            ? prev - stake
            : prev + stake;
        }
      }

      return newExposures;
    }
    function isFancyMatch(gameType = '', matchList = []) {
      const normalized = gameType.toUpperCase();

      return matchList.some(item =>
        normalized.includes(item.toUpperCase())
      );
    }


    if (marketsforfancy.includes(market_type)) {
      console.log("marketsforfancy", marketsforfancy);
      console.log("market_type", market_type);

      const S = Number(stake);        // 100
      let L = Number(lay_size);     // 110
      let B = Number(back_size);    // 90
      // fancy1/oddeven are priced in decimal odds, and this feed puts market
      // VOLUME in size/back_size/lay_size (e.g. 1000000) rather than a bhav.
      // Derive the bhav from the runner prices instead: (odds - 1) * 100.
      if (market_type === 'fancy1' || market_type === 'oddeven') {
        // Tolerate a missing/!array runner_odds — the priceBasis guard below
        // rejects the bet rather than letting NaN flow into the exposure math.
        const ro = Array.isArray(runner_odds) ? runner_odds : [];
        const backOdds = ro.find(o => o.oname === "back1")?.odds ?? null;
        const layOdds = ro.find(o => o.oname === "lay1")?.odds ?? null;
        L = (layOdds - 1) * 100
        B = (backOdds - 1) * 100
      }

      // const L = 110;     // 110
      // const B = 90;
      let layword = sel + 'lay';
      let backword = sel + 'back';
      if (market_type === '1st Innings 6 Overs Line' || market_type === '2nd Innings 6 Overs Line' || market_type === '3rd Innings 6 Overs Line' || market_type === '1st Innings 10 Overs Line' || market_type === '2nd Innings 10 Overs Line' || market_type === '3rd Innings 10 Overs Line' || market_type === '1st Innings 20 Overs Line' || market_type === '2nd Innings 20 Overs Line' || market_type === '3rd Innings 20 Overs Line'
        || market_type === '1st Innings 50 Overs Line' || market_type === '2nd Innings 50 Overs Line' || market_type === '3rd Innings 50 Overs Line' || market_type === '1st Innings 30 Overs Line' || market_type === '2nd Innings 30 Overs Line' || market_type === '3rd Innings 30 Overs Line' || market_type === '1st Innings 40 Overs Line' || market_type === '2nd Innings 40 Overs Line' || market_type === '3rd Innings 40 Overs Line'
        || market_type === '1st Innings 10 Overs Line' || market_type === '2nd Innings 10 Overs Line' || market_type === '3rd Innings 10 Overs Line' || market_type === '1st Innings 20 Overs Line' || market_type === '2nd Innings 20 Overs Line' || market_type === '3rd Innings 20 Overs Line'
      ) {
        newExposures[sel] = (oldExposures[sel] || 0) - stake;
        newExposures[layword] = (oldExposures[layword] || 0) + stake;
        newExposures[backword] = (oldExposures[backword] || 0) - stake;

      }
      else {


        // Previous exposures
        console.log("oldExposures", oldExposures);
        let layExp = Number(oldExposures?.[layword] || 0);
        let backExp = Number(oldExposures?.[backword] || 0);

        console.log("layExp", layExp);
        console.log("backExp", backExp);

        // oddeven/fancy1: a losing "no" costs stake*odds — that is what
        // singleBetLiability persists and what settlementv2 pays out — not the
        // stake*(odds-1) the bhav formula gives. Existing bets already read that
        // figure from the `liability` column; keep the incoming leg in step.
        // GUARD: liability below is priced from the feed bhav
        //   lay/no  -> layRisk = S*oddN (fancy1/oddeven) or S*L/100
        //   yes/back-> backWin = S*B/100
        // If the client sends no usable size/price (this frontend used to
        // hardcode back_size/lay_size/size=0 and runner_odds=[]), the lay leg
        // computes ZERO liability and the bet is accepted with no wallet
        // deduction. Never book an unpriced position — refuse it instead.
        const isVolumePriced = market_type === 'fancy1' || market_type === 'oddeven';
        const isLayLeg = betTypeLower === 'lay' || betTypeLower === 'no';
        const priceBasis = isLayLeg ? (isVolumePriced ? oddN : L) : B;
        if (!Number.isFinite(priceBasis) || priceBasis <= 0) {
          console.warn('[placeBet] Unpriceable fancy bet rejected', {
            market_type, betTypeLower, L, B, oddN,
            lay_size, back_size, size,
            runner_odds_len: Array.isArray(runner_odds) ? runner_odds.length : null,
          });
          throw new Error('Market not available');
        }

        const layRisk = (market_type === 'fancy1' || market_type === 'oddeven')
          ? S * oddN
          : (S * L) / 100;   // 110
        const backWin = (S * B) / 100;  // 90

        if (betTypeLower === 'lay') {

          // LAY impact
          layExp += S;        // +100
          backExp -= layRisk; // -110

        } else if (betTypeLower === 'back') {

          // BACK impact
          layExp -= S;        // -100
          backExp += backWin; // +90
        }
        console.log("layExp", layExp);
        console.log("backExp", backExp);

        // Legacy 2-region aggregates (kept for any other consumers)
        newExposures[layword] = layExp;
        newExposures[backword] = backExp;

        // Track total stakes (kept for reference / other consumers)
        let stakeKey = sel + 'totalstake';
        let totalStake = Number(oldExposures?.[stakeKey] || 0) + S;
        newExposures[stakeKey] = totalStake;

        // ---- TRUE worst-case liability for this selection ----------------
        // A ladder with bets on different lines has more than two outcome
        // regions, so the old `currentWorst` (2-region collapse) could
        // UNDER-block (when a middle region is the worst, e.g. No@low+Yes@high)
        // and the old `runningSel` (naive per-bet sum) could OVER-block (when a
        // middle region wins, e.g. No@high+Yes@low — the reported bug).
        // Instead compute the real minimum net P&L across every run value from
        // ALL open bets on this selection (plus the incoming bet) — the same
        // per-run-value model the ladder book uses. Each bet is a step:
        //   yes/back: wins when runValue >= line -> +stake*size/100, else -stake
        //   no/lay:   wins when runValue <  line -> +stake,          else -liability
        const existingBets = await SportsBet.findAll({
          where: { user_id, selection_name: sel, eventid, status: 'open' },
          attributes: ['bet_type', 'stake_amount', 'odds', 'size', 'liability'],
          transaction,
        });

        const toContribution = (betType, line, win, lose) => ({
          line: Number(line),
          isYes: ['yes', 'back'].includes(String(betType || '').toLowerCase()),
          winAmt: win,
          loseAmt: lose,
        });

        const contribs = existingBets.map((b) => {
          const stk = Number(b.stake_amount);
          // For fancy1/oddeven the persisted `size` is market volume, not a bhav,
          // so stk*size/100 would book a ~10,000x win and mask real losses in the
          // same region. Derive the bhav from the price, matching both the
          // incoming-bet leg above and settlementv2's payout (stake*(odds-1)).
          const sz = (market_type === 'fancy1' || market_type === 'oddeven')
            ? (Number(b.odds) - 1) * 100
            : Number(b.size);
          const liab = Number(b.liability);
          const isYes = ['yes', 'back'].includes(String(b.bet_type || '').toLowerCase());
          return toContribution(
            b.bet_type,
            b.odds,
            isYes ? (stk * sz) / 100 : stk,                       // win amount
            isYes ? stk : (liab > 0 ? liab : (stk * sz) / 100)    // lose amount
          );
        });
        // Add the incoming bet (not yet persisted). layRisk/backWin already in scope.
        contribs.push(
          betTypeLower === 'lay' || betTypeLower === 'no'
            ? toContribution(betTypeLower, oddN, S, layRisk)
            : toContribution(betTypeLower, oddN, backWin, S)
        );

        const validContribs = contribs.filter(
          (c) => !isNaN(c.line) && c.line > 0 && !isNaN(c.winAmt) && !isNaN(c.loseAmt)
        );

        const pnlAt = (r) =>
          validContribs.reduce(
            (sum, c) => sum + ((c.isYes ? r >= c.line : r < c.line) ? c.winAmt : -c.loseAmt),
            0
          );

        // P&L only changes at line boundaries, so evaluating each distinct line
        // plus the region just below the lowest line covers every region.
        let worstCase = 0;
        if (validContribs.length) {
          const lines = validContribs.map((c) => c.line);
          const points = [Math.min(...lines) - 1, ...new Set(lines)];
          worstCase = Math.min(...points.map(pnlAt));
        }
        worstCase = Math.round(worstCase * 100) / 100;

        // sel holds the signed worst-case P&L (negative => liability to block)
        newExposures[sel] = worstCase;

        console.log('[FANCY EXPOSURE TRACK]', {
          selection: sel,
          betType: betTypeLower,
          stake: S,
          layBhav: L,
          backBhav: B,
          layExposure: layExp,
          backExposure: backExp,
          worstCase,
          openBets: existingBets.length + 1,
        });
      }
    }




    else if (normGameType === 'MO') {

      newExposures = calculateRunnerExposure({
        runners,
        selectedRunner: sel,
        stake,
        odd: oddN,
        betType: betTypeLower,
        oldExposures
      });
    } else if (normGameType === 'BM') {
      // BOOKMAKER (two-way). Rate comes from the shared helper (odds/100) so
      // exposure, liability, settlement and the statement all agree exactly.
      const newodds = normalizeOdds(oddN);
      const bmRate = backProfitRate({ odds: oddN, game_type, market_type, mname, gtype });
      console.log(`Normalized BM odds: ${oddN} → ${newodds} (profit rate ${bmRate})`);


      newExposures = calculateRunnerExposure({
        runners,
        selectedRunner: sel,
        stake,
        odd: newodds,
        betType: betTypeLower,
        oldExposures,
        profitRate: bmRate
      });
    } else if (isNonFancyMarket(market_type)) {
      let profit = 0
      let layLiab = 0
      if (market_type === 'Tied Match') {
        let new_odds = oddN / 100
        profit = stake * (new_odds);
        layLiab = stake * (new_odds);

      } else {
        profit = stake * (oddN - 1);
        layLiab = stake * (oddN - 1);

      }


      // ✅ If Draw is selected, ALWAYS update Draw exposure (regardless of count)
      if (isDrawSel) {

        if (betTypeLower === 'back' || betTypeLower === 'yes' || betTypeLower === 'Yes') {
          newExposures['The Draw'] = (oldExposures['The Draw'] || 0) + profit;
          newExposures[team_one] = (oldExposures[team_one] || 0) - stake;
          newExposures[team_two] = (oldExposures[team_two] || 0) - stake;
        } else {
          newExposures['The Draw'] = (oldExposures['The Draw'] || 0) - layLiab;
          newExposures[team_one] = (oldExposures[team_one] || 0) + stake;
          newExposures[team_two] = (oldExposures[team_two] || 0) + stake;
        }
      } else {
        // selection is one of the teams
        const otherTeam = sel === team_one ? team_two : team_one;

        if (betTypeLower === 'back') {
          newExposures[sel] = (oldExposures[sel] || 0) + profit;
          newExposures[otherTeam] = (oldExposures[otherTeam] || 0) - stake;
          // Update Draw if it exists in oldExposures OR if count is 3
          if (count == 3 || oldExposures['The Draw'] !== undefined) {
            newExposures['The Draw'] = (oldExposures['The Draw'] || 0) - stake;
          }
        } else {
          newExposures[sel] = (oldExposures[sel] || 0) - layLiab;
          newExposures[otherTeam] = (oldExposures[otherTeam] || 0) + stake;
          if (count == 3 || oldExposures['The Draw'] !== undefined) {
            newExposures['The Draw'] = (oldExposures['The Draw'] || 0) + stake;
          }
        }
      }
    }
    else if (isFancyMatch(market_type, marketsforBMfancy)) {
      const newodds = normalizeOdds(oddN);
      console.log(`Normalized BM odds: ${oddN} → ${newodds}`);
      newExposures = calculateRunnerExposure({
        runners,
        selectedRunner: sel,
        stake,
        odd: newodds,
        betType: betTypeLower,
        oldExposures
      });
    }
    else if (isFancyMatch(market_type, marketforfancywithbigrunners)) {

      newExposures = calculateRunnerExposure({
        runners,
        selectedRunner: sel,
        stake,
        odd: oddN,
        betType: betTypeLower,
        oldExposures
      });
    }
    else {
      throw new Error(`bet is closed for this market`);
    }

    console.log('NEW EXPOSURES:', newExposures);

    // WALLET BLOCK - Calculate balance change
    let balanceChange = 0; // +deduct, -release

    // fancy1 no longer takes a flat stake deduction — it now goes through the
    // ladder worst-case above, so the wallet must follow the same signed
    // exposure delta as every other fancy market.
    if (marketsforfancy.includes(market_type)) {
      const oldNegs = Object.entries(oldExposures)
        .filter(([key, val]) => key === sel && val < 0)
        .map(([, val]) => val);

      const newNegs = Object.entries(newExposures)
        .filter(([key, val]) => key === sel && val < 0)
        .map(([, val]) => val);
      const oldMax = oldNegs.length ? Math.abs(Math.min(...oldNegs)) : 0;
      const newMax = newNegs.length ? Math.abs(Math.min(...newNegs)) : 0;
      const liabInc = newMax - oldMax;

      console.log('LIABILITY CALCULATION (MO/BM):');
      console.log('- Old liabilities:', oldNegs);
      console.log('- New liabilities:', newNegs);
      console.log('- Old total liability (blocked):', oldMax);
      console.log('- New total liability (to block):', newMax);
      console.log('- Liability change:', liabInc);

      if (Object.keys(oldExposures).length === 0) balanceChange = newMax;
      else if (liabInc > 0) balanceChange = liabInc;
      else if (liabInc < 0) balanceChange = liabInc; // negative → release

      if (balanceChange > 0 && currentInr < balanceChange) throw new Error('Insufficient balance');

    }
    else {
      // MO/BM — max negative liability delta
      const oldNegs = Object.values(oldExposures).filter(x => x < 0);
      const newNegs = Object.values(newExposures).filter(x => x < 0);
      const oldMax = oldNegs.length ? Math.abs(Math.min(...oldNegs)) : 0;
      const newMax = newNegs.length ? Math.abs(Math.min(...newNegs)) : 0;
      const liabInc = newMax - oldMax;

      console.log('LIABILITY CALCULATION (MO/BM):');
      console.log('- Old liabilities:', oldNegs);
      console.log('- New liabilities:', newNegs);
      console.log('- Old total liability (blocked):', oldMax);
      console.log('- New total liability (to block):', newMax);
      console.log('- Liability change:', liabInc);

      if (Object.keys(oldExposures).length === 0) balanceChange = newMax;
      else if (liabInc > 0) balanceChange = liabInc;
      else if (liabInc < 0) balanceChange = liabInc; // negative → release

      if (balanceChange > 0 && currentInr < balanceChange) throw new Error('Insufficient balance');
    }

    console.log('FINAL BALANCE CHANGE:', balanceChange, '(+deduct, -release)');

    //=============================================================================================
    // ✅ STEP 6:                    UPSERT MARKET EXPOSURE OF THE USER
    //============================================================================================
    for (const [name, amt] of Object.entries(newExposures)) {
      await UserExposure.upsert(
        {
          user_id,
          match_id,
          team_name: name,
          exposure_amount: amt,
          match_title,
          game_type: exposureGameType,
          event_id: eventid,
          category: "sports"
        },
        { transaction }
      );
    }

    console.log("het");

    // Calculate single bet liability for record keeping
    let singleBetLiability;
    if (market_type === 'fancy1' || market_type === 'oddeven') {
      singleBetLiability = (betTypeLower === 'back') ? stake : (oddN * stake);
    }
    else if (market_type === 'Tied Match') {
      let new_odds = oddN / 100
      singleBetLiability = (betTypeLower === 'back') ? stake : stake * new_odds;

    }
    else if (normGameType === 'MO' || marketsfornonfancy.includes(market_type)) {
      singleBetLiability = (betTypeLower === 'back') ? stake : stake * (oddN - 1);
    } else if ((normGameType === 'MO') || (normGameType === 'BM')) {
      // Bookmaker lay liability == the backer's profit rate. Same shared helper
      // as the exposure/settlement/statement paths.
      singleBetLiability = (betTypeLower === 'back')
        ? stake
        : backProfit(stake, { odds: oddN, game_type, market_type, mname, gtype });
    } else {
      singleBetLiability = (betTypeLower === 'back') ? stake : (size * stake) / 100;
    }
    console.log("tesr", singleBetLiability);

    let fixed = 0;
    // if (balanceChange < 0) {
    //   fixed = 1;
    // }

    if (!marketsforfancy.includes(market_type)) {
      size = 0;
    }

    if (market_type === '1st Innings 6 Overs Line' || market_type === '2nd Innings 6 Overs Line' || market_type === '3rd Innings 6 Overs Line' || market_type === '1st Innings 10 Overs Line' || market_type === '2nd Innings 10 Overs Line' || market_type === '3rd Innings 10 Overs Line' || market_type === '1st Innings 20 Overs Line' || market_type === '2nd Innings 20 Overs Line' || market_type === '3rd Innings 20 Overs Line'
      || market_type === '1st Innings 50 Overs Line' || market_type === '2nd Innings 50 Overs Line' || market_type === '3rd Innings 50 Overs Line' || market_type === '1st Innings 30 Overs Line' || market_type === '2nd Innings 30 Overs Line' || market_type === '3rd Innings 30 Overs Line' || market_type === '1st Innings 40 Overs Line' || market_type === '2nd Innings 40 Overs Line' || market_type === '3rd Innings 40 Overs Line'
      || market_type === '1st Innings 10 Overs Line' || market_type === '2nd Innings 10 Overs Line' || market_type === '3rd Innings 10 Overs Line' || market_type === '1st Innings 20 Overs Line' || market_type === '2nd Innings 20 Overs Line' || market_type === '3rd Innings 20 Overs Line') {
      size = 0;
    }

    // Line/session markets (e.g. "1st Innings 20 Overs Line") sometimes arrive with
    // game_type='MATCH'/'MO' + bet_type back/lay because the client doesn't tag them
    // fancy. They MUST be persisted as FAN + yes/no so the settlement worker routes
    // them to resolveFancyWinner (the line math) instead of resolveMobmWinner.
    // IMPORTANT: exposure, wallet (balanceChange) and singleBetLiability above are all
    // keyed on market_type (marketsforfancy) — NOT on game_type — so they already ran
    // the correct fancy path. Overriding only these two persisted fields changes no
    // money computation; betTypeLower (used by the exposure block) is left untouched.
    const isFancyMarketType = marketsforfancy.includes(market_type);
    const storedGameType = isFancyMarketType ? "FAN" : normGameType;

    // Insert bet (use converted bet_type for fancy)
    const finalBetType = ((game_type === "FAN" || isFancyMarketType) && bet_type)
      ? (bet_type.toLowerCase() === "back" ? "yes" : bet_type.toLowerCase() === "lay" ? "no" : bet_type)
      : bet_type;

    //=============================================================================================
    // ✅ STEP 7:                  SAVING BET TO DATABASE
    //=============================================================================================   

    const startTime = match_start_time || new Date();

    const newBet = await SportsBet.create(
      {
        user_id,
        game_type: storedGameType,
        match_id,
        match_title,
        team_one,
        team_two,
        selection_name,
        category: category || "1",
        bet_type: finalBetType,
        odds: oddN,
        stake_amount: stake,
        original_currency: original_currency || "INR",
        original_amount: original_amount || stake,
        usd_amount: usd_amount || (await inrToUsd(stake)),
        liability: singleBetLiability,
        match_start_time: startTime,
        exposure_after_bet: Math.max(0, ...Object.values(newExposures).filter(v => v < 0).map(v => Math.abs(v)), 0),
        status: "open",
        eventid,
        ip_address,
        fancy_name: fancy_name || "NULL",
        fixed: fixed,
        counts: count,
        sport_id: sid,
        fancy_name: fancy_name || "NULL",
        fixed: fixed,
        counts: count,
        sport_id: sid,
        market_type: market_type,
        unmatched: unmatched || false,
        unmatched_odds: unmatched_odds || null,
        size: size,
        runners: runners,
      },
      { transaction }
    );

    //=============================================================================================
    // ✅ STEP 8: [PLATFORM SPECIFIC: DIAMOND] WALLET UPDATE : Deduct or Release cash+credit concept [BP]
    //=============================================================================================

    await walletUpdate(wallet, balanceChange, transaction, {
      user_id,
      match_title,
      selection_name,
      market_type,
      game_type,
      match_id,
      eventid,
      sid,
      newBet
    });

    // ========================================================================================
    // ✅ STEP 9:  CALCULATE NET EXPOSURE OF THIS BET (most negative among 2-3 outcomes)
    // ========================================================================================
    // Get all exposures for this match from newExposures
    const betExposureValues = Object.values(newExposures);
    console.log('NEW EXPOSURES FOR THIS BET:', newExposures);
    console.log('EXPOSURE VALUES:', betExposureValues);

    // Find the net exposure of this bet: pick the most negative (minimum value)
    let betNetExposure = 0;
    if (betExposureValues.length > 0) {
      // Get the minimum value (most negative = highest liability)
      const minValue = Math.min(...betExposureValues);
      // Take absolute value to represent liability magnitude
      betNetExposure = minValue < 0 ? Math.abs(minValue) : 0;
    }
    console.log('NET EXPOSURE OF THIS BET:', betNetExposure);

    // ========================================================================================
    // ✅ STEP 10:              UPSERT TOTAL EXPOSURE RECORD
    // ========================================================================================
    // Use the SHARED calculation (syncTotalExposure -> calculateUserNetExposure)
    // rather than the inline query above. The inline copy lacked the
    // LEAST(...,0) clamp and did not exclude the `<sel>totalstake` bookkeeping
    // row, so a fancy bet's +stake totalstake row cancelled its -stake
    // worst-case and wrote total_exposure = 0 while the wallet really had the
    // stake blocked. Settlement already resyncs through this same helper, so
    // sharing it keeps placement and settlement from disagreeing.
    const totalUserExposure = await syncTotalExposure(user_id, transaction);
    console.log(`✅ TotalExposure synced for user ${user_id}: ${totalUserExposure}`);

    // A combined slip is ALL-OR-NOTHING: the caller owns the transaction and
    // commits once, after every leg has priced successfully.
    if (ownsTransaction) await transaction.commit();

    const newBalance = balanceChange !== 0 ? currentInr - balanceChange : currentInr;

    console.log('Transaction completed successfully');
    console.log('Old balance:', currentInr);
    console.log('New balance:', newBalance);
    console.log('Actual balance delta:', newBalance - currentInr);

    // ========================================================================================
    // ✅ STEP 11:  REAL-TIME PUSH — emit balance + net exposure over the socket so the header
    //              updates without a page refresh. Best-effort: a failure here must never fail
    //              an already-committed bet.
    //
    //   Concept: the header "Balance" is inr_balance (total funds) and does NOT change when a
    //   bet is placed — only `cash` (available = inr_balance − exposure) drops and exposure
    //   rises. So we emit the UNCHANGED inr_balance (placeBet only mutates wallet.cash) and the
    //   fresh net exposure: the header keeps its Balance and only Exp moves.
    // ========================================================================================
    // Skipped for combined legs — nothing is committed yet, so an emit here
    // would push a balance the database does not hold. The caller emits once.
    if (ownsTransaction) {
      try {
        // Net exposure computed the same way the header reads it (clamped,
        // worst-case liability) so the pushed value equals a page refresh.
        const netExposure = await calculateUserNetExposure(user_id);

        // Keep user_net_exposure immediately consistent (the bg worker also syncs
        // every ~1s) so a refresh right after the bet shows the same value.
        await UserNetExposure.upsert({ user_id, net_exposure: netExposure });

        await emitBalanceUpdate(user_id, {
          inr_balance: Number(wallet.inr_balance),
          exposure: netExposure,
        });
      } catch (emitErr) {
        console.error('placeBet: real-time balanceUpdate emit failed:', emitErr.message);
      }
    }

    return res.json({
      success: true,
      exposure: { [match_id]: { match_title, teams: newExposures } },
      balanceDelta: newBalance - currentInr,
      oldBalance: currentInr,
      newBalance: newBalance,
      totalExposure: totalUserExposure
    });

  } catch (err) {
    // Only roll back a transaction we opened. For a combined leg the caller
    // rolls the whole slip back, so the other legs unwind too.
    if (ownsTransaction) await transaction.rollback();
    console.error("PLACE BET ERROR:", err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
};

//=============================================================================================
//-------------------   SPORTS COMBINED (DUTCHED) PLACE BET FUNCTION  -------------------------
//=============================================================================================
// A COMBINED slip is NOT one wager: it is one bet PER RUNNER, each at its own
// price, with the typed stake split so that whichever selected runner wins,
// the return is the same (dutching). The frontend does the split; this
// endpoint stores each leg through the SAME placeBet — all the usual locks,
// limits, exposure, wallet and ledger logic — inside ONE transaction, so the
// slip is ALL-OR-NOTHING. If any leg is rejected (suspended runner, over max,
// insufficient balance), nothing is stored and the wallet is untouched.
//
// Exposure needs no special handling: each leg is a normal bet, so the
// existing per-runner maths produces the correct dutched book on its own.
//
//   POST /api/user/place-combined   { "bets": [ <same shape as /place>, … ] }
//=============================================================================================

const MAX_COMBINED_LEGS = Number(process.env.MAX_COMBINED_LEGS) || 10;

export const placeCombinedBet = async (req, res) => {
  const user_id = req.user?.account?.id;
  if (!user_id) return res.status(400).json({ success: false, error: "User ID is required" });

  const legs = req.body?.bets;

  //---------------------------------------------------------------------------
  // VALIDATION — every rule here exists because breaking it makes the slip
  // either meaningless or a way around a per-bet limit.
  //---------------------------------------------------------------------------
  if (!Array.isArray(legs) || legs.length < 2) {
    // A combined PRICE needs at least two runners.
    return res.status(400).json({ success: false, error: "A combined bet needs at least 2 selections" });
  }
  if (legs.length > MAX_COMBINED_LEGS) {
    return res.status(400).json({ success: false, error: `A combined bet allows at most ${MAX_COMBINED_LEGS} selections` });
  }

  const first = legs[0] || {};
  // A combined price is only meaningful inside ONE market.
  const sameMarket = legs.every(b =>
    String(b?.eventid ?? '') === String(first.eventid ?? '') &&
    String(b?.match_id ?? '') === String(first.match_id ?? '')
  );
  if (!sameMarket) {
    return res.status(400).json({ success: false, error: "All selections must belong to the same market" });
  }

  // Mixing back and lay is not a dutch.
  const side = String(first.bet_type || '').toLowerCase();
  if (!legs.every(b => String(b?.bet_type || '').toLowerCase() === side)) {
    return res.status(400).json({ success: false, error: "All selections must be on the same side (all back or all lay)" });
  }

  // Duplicate selections would double-count exposure on one outcome.
  const names = legs.map(b => String(b?.selection_name || '').trim().toLowerCase());
  if (names.some(n => !n)) {
    return res.status(400).json({ success: false, error: "Every selection must have a name" });
  }
  if (new Set(names).size !== names.length) {
    return res.status(400).json({ success: false, error: "Duplicate selections in a combined bet" });
  }

  let total = 0;
  for (const b of legs) {
    const s = Number(b?.stake_amount);
    if (!Number.isFinite(s) || s <= 0) {
      return res.status(400).json({ success: false, error: "Every selection needs a valid stake" });
    }
    total += s;
  }
  total = round2(total);

  //---------------------------------------------------------------------------
  // Market MIN / MAX are checked against the SLIP TOTAL, not per leg:
  //   • an 8.37 leg of a 100 slip must not trip a 100 minimum;
  //   • splitting must not become a way around the per-bet cap.
  // The per-leg minimum is waived via opts.skipMinStake below.
  //---------------------------------------------------------------------------
  try {
    const limits = await resolveMarketLimits({
      eventid: first.eventid,
      sid: first.sid,
      match_id: first.match_id,
      mname: first.mname,
      market_type: first.market_type,
      selection_name: first.selection_name,
    });
    if (limits) {
      if (limits.minLimit > 0 && total < limits.minLimit) {
        return res.status(400).json({ success: false, error: `Minimum bet amount is ${limits.minLimit}` });
      }
      if (limits.maxLimit > 0 && total > limits.maxLimit) {
        return res.status(400).json({ success: false, error: `Maximum bet amount is ${limits.maxLimit}` });
      }
    }
  } catch (limitErr) {
    console.warn('[placeCombinedBet] Market limits lookup failed (non-blocking):', limitErr.message);
  }

  //---------------------------------------------------------------------------
  // ALL-OR-NOTHING placement. Each leg runs through the real placeBet with the
  // shared transaction; a fake `res` captures its verdict, because placeBet
  // reports some rejections (bet locks) by RETURNING an error response rather
  // than throwing — those must abort the slip too.
  //---------------------------------------------------------------------------
  const transaction = await sequelize.transaction();
  try {
    const placed = [];
    for (const leg of legs) {
      // Object.create keeps the real request's prototype (headers, ip, …)
      // while overriding only the body for this leg.
      const legReq = Object.create(req);
      legReq.body = leg;

      const captured = { status: 200, body: null };
      const legRes = {
        status(code) { captured.status = code; return this; },
        json(body) { captured.body = body; return this; },
      };

      await placeBet(legReq, legRes, { transaction, skipMinStake: true });

      if (captured.body?.success !== true) {
        throw new Error(captured.body?.error || captured.body?.message || 'Selection rejected');
      }
      placed.push(captured.body);
    }

    await transaction.commit();

    // ONE balance push for the whole slip, after the commit.
    let totalExposure = null;
    try {
      const netExposure = await calculateUserNetExposure(user_id);
      await UserNetExposure.upsert({ user_id, net_exposure: netExposure });
      totalExposure = netExposure;
      const wallet = await Wallet.findOne({ where: { user_id: String(user_id) } });
      await emitBalanceUpdate(user_id, {
        inr_balance: Number(wallet?.inr_balance ?? 0),
        exposure: netExposure,
      });
    } catch (emitErr) {
      console.error('placeCombinedBet: real-time balanceUpdate emit failed:', emitErr.message);
    }

    return res.json({
      success: true,
      legs: placed.length,
      total_stake: total,
      totalExposure,
      results: placed,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("PLACE COMBINED BET ERROR:", err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
};

//=============================================================================================



export const getUserBets = async (req, res) => {
  const user_id = req.user.user_id || req.user.actor.id;
  console.log("Fetching exposure breakdown for USER ID:", user_id);

  try {
    // 1️⃣ Fetch all active exposures from the source of truth
    const exposures = await UserExposure.findAll({
      where: { 
        user_id: String(user_id),
        exposure_amount: { [Op.ne]: 0 }
      }
    });

    // 2️⃣ Group by match_id to maintain match-level structure
    const grouped = {};
    exposures.forEach(exp => {
      const mid = exp.match_id;
      if (!grouped[mid]) {
        grouped[mid] = {
          event_type: exp.category === 'casino' ? 'Casino' : (exp.game_type || 'Sports'),
          event_name: exp.match_title || 'Unknown Match',
          match_name: exp.match_title || 'Unknown',
          match_id: mid,
          event_id: exp.event_id || mid,
          selections: []
        };
      }
      grouped[mid].selections.push({
        team_name: exp.team_name,
        amount: Number(exp.exposure_amount)
      });
    });

    // 3️⃣ Format response with calculated exposure per match
    const response = Object.values(grouped).map(group => {
      // Exposure per match is the worst-case scenario (most negative)
      const minVal = Math.min(0, ...group.selections.map(s => s.amount));
      return {
        event_type: group.event_type,
        event_name: group.event_name,
        match_name: group.match_name,
        match_id: group.match_id,
        event_id: group.event_id,
        exposure: Math.abs(minVal),
        trade: group.selections.length,
        details: group.selections // Detailed breakdown for tracking
      };
    });

    return res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("Get User Exposure Breakdown Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exposure breakdown"
    });
  }
};





// ------------------------ OTHER CONTROLLER FUNCTIONS ------------------------
export const getUserExposures = async (req, res) => {
  try {
    const { user_id } = req.params;
    const exposures = await UserExposure.findAll({ where: { user_id } });

    const out = {};
    exposures.forEach((e) => {
      if (!out[e.match_id]) out[e.match_id] = { match_title: e.match_title, teams: {} };
      out[e.match_id].teams[e.team_name] = Number(e.exposure_amount);
    });

    return res.json({ success: true, exposures: out });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Could not fetch exposures" });
  }
};

export const getOpenBets = async (req, res) => {
  const { user_id, match_id } = req.params;
  try {
    const bets = await SportsBet.findAll({
      where: { user_id, match_id, status: "open" },
    });
    return res.json({ success: true, bets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Could not fetch open bets" });
  }
};

export const getWalletBalance = async (req, res) => {
  const { uuid } = req.params;
  try {
    const wallet = await Wallet.findOne({ where: { user_id: uuid } });
    if (!wallet) return res.status(404).json({ success: false, error: "Wallet not found" });
    return res.json({ success: true, balance: +wallet.inr });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const settleBets = async () => {
  try {
    // TODO: implement using Sequelize models
    console.log("settleBets function called - migrate raw SQL to Sequelize models");
  } catch (err) {
    console.error("settleBets error:", err);
  }
};

// ------------------------ EXPORT ------------------------
const controller = {
  placeBet,
  placeCombinedBet,
  getUserExposures,
  getOpenBets,
  getWalletBalance,
  settleBets,
  getUserBets,
  getBufferTime
};

export default controller;
