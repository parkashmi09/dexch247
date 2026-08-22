import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import redis from "../config/redisClient.js"; // Import Redis Client
import CasinoBet from "../model/user/casino.js";
import sequelize from "../config/db.js";
import UserExposure from "../model/user/UserExposure.js";
import User from "../model/user/User.js";
import Wallet from "../model/admin/Wallet.js";
import TotalExposure from "../model/user/TotalExposure.js";
import { emitBalanceUpdate } from "../utils/socketUtils.js";
import { findCasinoMarket, calculateCasinoBook, calculateTwoWayBook, casinoMarketGameType, isSuperOverFamily, extractBookmakerRunners, superOverFancyKey } from "../helper/casinoMarketBook.js";
import { QueryTypes } from "sequelize";

const BASE_URL = process.env.DIAMOND_BASE_URL;
const API_KEY = process.env.DIAMOND_API_KEY;
const FALLBACK_BASE_URL = process.env.CASINO_API_BASE_URL;
const FALLBACK_API_KEY = process.env.CASINO_API_KEY;
const CACHE_TTL = 2; // Cache time in seconds

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Helper for caching
const getCachedData = async (key, fetchFunction) => {
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`⚡ Serving from cache: ${key}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error(`❌ Redis Cache Error for ${key}:`, err.message);
    // Continue to fetch from API
  }

  try {
    const data = await fetchFunction();

    // Set Cache (Async, don't block)
    redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL).catch(err =>
      console.error(`❌ Failed to set cache for ${key}:`, err.message)
    );

    console.log(`🌐 Fetched from API & Cached: ${key}`);
    return data;
  } catch (err) {
    console.error(`❌ API Error for ${key}:`, err.message);
    throw err;
  }
};

const CasinoService = {
  fetchAllData: async (type, data) => {
    if (!type) {
      throw new Error("Type are required casiono server");
    }

    const key = `casino_all_data_${type}`;
    return await getCachedData(key, async () => {
      try {
        const response = await axios.get(`${BASE_URL}/casino/data`, {
          headers: { Accept: "*/*" },
          params: { type: type, key: API_KEY },
          timeout: 3000
        });
        return response.data;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          console.log(`⚠️ Primary casino API TIMED OUT, trying fallback...`);
        } else {
          console.log(`⚠️ Primary casino API failed, trying fallback...`);
        }
        const response = await axios.get(`${FALLBACK_BASE_URL}/casino/data`, {
          headers: { Accept: "*/*" },
          params: { gtype: type, key: FALLBACK_API_KEY },
          timeout: 8000
        });
        return response.data?.data;
      }
    });
  },
  fetchCricketData: async (id) => {
    if (!id) {
      throw new Error("ID is required to fetch cricket data");
    }
    const key = `casino_cricket_data_${id}`;
    return await getCachedData(key, async () => {
      try {
        const response = await axios.get(`${BASE_URL}/esid`, {
          headers: { Accept: "*/*" },
          params: { sid: id, key: API_KEY },
          timeout: 3000
        });
        return response.data;
      } catch (err) {
        console.log(`⚠️ Primary cricket API failed, trying fallback...`);
        const response = await axios.get(`${FALLBACK_BASE_URL}/esid`, {
          headers: { Accept: "*/*" },
          params: { sid: id, key: FALLBACK_API_KEY },
          timeout: 3000
        });
        return response.data;
      }
    });
  },
  fetchCasinolastResults: async (type) => {
    if (!type) {
      throw new Error("Type are required to fetch casino results");
    }
    const key = `casino_last_results_${type}`;
    return await getCachedData(key, async () => {
      try {
        const response = await axios.get(`${BASE_URL}/casino/result`, {
          headers: { Accept: "*/*" },
          params: { type: type, key: API_KEY },
          timeout: 3000
        });
        return response.data;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          console.log(`⚠️ Primary casino results API TIMED OUT, trying fallback...`);
        } else {
          console.log(`⚠️ Primary casino results API failed, trying fallback...`);
        }
        const response = await axios.get(`${FALLBACK_BASE_URL}/casino/lastresultsnew`, {
          headers: { Accept: "*/*" },
          params: { gType: type, key: FALLBACK_API_KEY },
          timeout: 8000
        });
        return response.data?.data;
      }
    });
  },

  fetchCasionDetailResults: async (type, mid) => {
    if (!type || !mid) {
      throw new Error("Type and mid are required to fetch casino detail results");
    }

    const key = `casino_detail_results_${type}_${mid}`;
    return await getCachedData(key, async () => {
      try {
        const response = await axios.get(`${BASE_URL}/casino/detail_result`, {
          headers: { Accept: "*/*" },
          params: { type: type, mid: mid, key: API_KEY },
          timeout: 3000
        });
        return response.data;
      } catch (err) {
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          console.log(`⚠️ Primary casino detail results API TIMED OUT, trying fallback...`);
        } else {
          console.log(`⚠️ Primary casino detail results API failed, trying fallback...`);
        }
        const response = await axios.get(`${FALLBACK_BASE_URL}/detail_casino_results`, {
          headers: { Accept: "*/*" },
          params: { gtype: type, mid: mid, key: FALLBACK_API_KEY },
          timeout: 8000
        });
        return response.data?.data;
      }
    });
  },

  fetchCasionDetailsData: async (gmid, sid) => {
    if (!gmid || !sid) {
      throw new Error("gmid and sid are required to fetch casino details data");
    }

    const key = `casino_details_data_${gmid}_${sid}`;
    return await getCachedData(key, async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getDetailsData`, {
          headers: { Accept: "*/*" },
          params: { gmid: gmid, sid: sid, key: API_KEY },
          timeout: 3000
        });
        return response.data;
      } catch (err) {
        console.log(`⚠️ Primary casino details API failed, trying fallback...`);
        const response = await axios.get(`${FALLBACK_BASE_URL}/getDetailsData`, {
          headers: { Accept: "*/*" },
          params: { gmid: gmid, sid: sid, key: FALLBACK_API_KEY },
          timeout: 3000
        });
        return response.data;
      }
    });
  },

  placeBet: async (betData) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        userId,
        player_name,
        gameName,
        odds,
        amount,     // stake
        selection,
        exposer,
        libality,
        eventId,
        roundId,
        type,
        mtype,
        ip_address,
        browser
      } = betData;

      if (!userId || !gameName || !selection || !amount || !odds) {
        throw new Error("Missing required bet fields");
      }

      // 💰 WALLET CHECK & DEDUCTION
      const wallet = await Wallet.findOne({
        where: { user_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      const currentCash = Number(wallet.cash);

      // 1️⃣ BUILD THE BOOK FIRST — the wallet lock is derived from it.
      //
      // Book-managed games (see helper/casinoMarketBook.js) write ONE ROW PER
      // RUNNER of the bet's market — the backed runner holds the profit, the
      // others the loss — exactly like the sports side does. Everything else
      // keeps the legacy single-row behaviour (the wallet liability only).
      let market = findCasinoMarket(gameName, selection);

      // teen (Teenpatti 1-day): the Main market is a two-way Player A vs Player B
      // book (exactly one wins), so a back on A must show +profit under A and
      // −stake under B — it can't stay on the legacy single-row path. The
      // Consecutive market reuses the SAME nats "Player A"/"Player B" (the feed
      // distinguishes it only by mtype "fancy"), and it is an INDEPENDENT YES/NO
      // per player, NOT a two-way book — so it keeps the single-row path but its
      // exposure row is namespaced ("Player A Consecutive") to avoid colliding
      // with the Main row under the same team_name. Odd/Even card bets (selection
      // "Card N Odd") are untouched — they aren't the player nats.
      // teen62 (V VIP Teenpatti 1-day) is the same table as teen: Main and
      // Consecutive both quote runners called literally "Player A" / "Player B"
      // (sids 1/2 vs 17/18), separated only by mtype. Without this it fell to the
      // legacy path with team_name "Player A" for BOTH markets, so a Main bet and
      // a Consecutive bet on the same player collided in one exposure row and the
      // table showed a single combined worst-case figure on both.
      let teenConsecutive = false;
      if (!market && ["teen", "teen62"].includes(String(gameName).toLowerCase())) {
        const isPlayer = /^player\s+[ab]$/i.test(String(selection).trim());
        if (isPlayer && String(mtype).toLowerCase() === "match") {
          market = { key: "main", runners: ["Player A", "Player B"] };
        } else if (isPlayer) {
          teenConsecutive = true;
        }
      }

      // SuperOver / Five Five Cricket family: the Bookmaker runner names are
      // per-round (not listable in the static registry), so resolve them from
      // the live feed and book across BOTH teams; every fancy/Tie/Fancy1 line is
      // an independent YES/NO market booked two-way (worst case). mtype tags the
      // Bookmaker as "match" (the frontend already sends this).
      if (!market && isSuperOverFamily(gameName)) {
        if (String(mtype).toLowerCase() === "match") {
          let runners = [];
          try {
            const feed = await CasinoService.fetchAllData(gameName);
            const bm = extractBookmakerRunners(feed);
            // Guard the round-boundary race: only trust the cached feed when its
            // round id matches THIS bet's round.
            if (bm.gmid && String(bm.gmid) === String(roundId) && bm.runners.length >= 2) {
              runners = bm.runners;
            }
          } catch (e) {
            console.error("[CasinoService.placeBet] superover bookmaker runners fetch failed:", e.message);
          }
          // Only book across both teams when we could resolve them. If the feed
          // is unavailable / the round rolled, leave `market` null and fall
          // through to the legacy single-row path — that still records the
          // backed runner's worst case (the client-computed `exposer`), and
          // avoids mixing a two-way `<sel>` row into the `bookmaker` game_type
          // group should a later bet in the same round resolve the full book.
          if (runners.length >= 2) market = { key: "bookmaker", runners };
        } else {
          market = { key: superOverFancyKey(selection), twoWay: true };
        }
      }

      const gameType = market ? casinoMarketGameType(gameName, market.key) : null;

      // Book markets need their existing rows up front, both to price the lock
      // and because a two-outcome market's `<sel>` row is a min() over both
      // sides, so it has to be recomputed from the whole book rather than
      // nudged by a per-bet delta. calculateTwoWayBook returns absolute
      // `value`s (SET below); every other path returns additive `delta`s.
      const oldExposures = {};
      if (market) {
        const existing = await UserExposure.findAll({
          where: {
            user_id: userId,
            match_id: String(roundId),
            event_id: String(roundId),
            game_type: gameType,
          },
          transaction,
        });
        for (const r of existing) oldExposures[r.team_name] = Number(r.exposure_amount) || 0;
      }

      let bookRows;
      if (market?.twoWay) {
        bookRows = calculateTwoWayBook({ selection, stake: amount, odds, type, oldExposures });
      } else if (market) {
        bookRows = calculateCasinoBook({ market, selection, stake: amount, odds, type });
      } else {
        const legacyTeam = teenConsecutive
          ? `${String(selection).trim()} Consecutive`
          : (gameName === 'abj' ? (player_name || selection) : selection);
        bookRows = [{ team_name: legacyTeam, delta: Number(exposer ?? 0) }];
      }

      // 2️⃣ WALLET LOCK
      //
      // Book markets lock the MARGINAL worst case — how much this bet worsens
      // the market's worst outcome — mirroring the sports side's oldMax→newMax
      // delta (sportsbet/sportbetscontroller.js). Locking each bet's standalone
      // liability instead double-counts hedges: backing and laying the same
      // runner is risk-free, yet used to tie up both stakes.
      //
      // A hedge can make the delta NEGATIVE, which RELEASES cash — so `exposer`
      // is not always ≤ 0 any more. It stays "the cash this bet locked", which
      // is the contract settlement and the void scripts rely on, and it sums
      // across a round to exactly the book's worst case.
      let effExposer = Number(exposer ?? 0);
      if (market) {
        const newTotals = {};
        for (const row of bookRows) {
          newTotals[row.team_name] = row.value !== undefined
            ? Number(row.value)
            : round2((Number(oldExposures[row.team_name]) || 0) + Number(row.delta));
        }
        // Only rows that stand for a real OUTCOME count. A two-way market's
        // back/lay rows are display aggregates — its single `<sel>` row already
        // holds the min of the two sides.
        const outcomeNames = market.twoWay ? [String(selection).trim()] : Object.keys(newTotals);
        const worstOf = (book) => Math.min(0, ...outcomeNames.map((n) => Number(book[n]) || 0));

        const lockDelta = round2(Math.abs(worstOf(newTotals)) - Math.abs(worstOf(oldExposures)));
        effExposer = -lockDelta;
      }

      if (effExposer < 0 && currentCash < Math.abs(effExposer)) {
        throw new Error("Insufficient balance");
      }

      // Lock liability in cash; inr_balance moves only at settlement.
      wallet.cash = round2(currentCash + effExposer);
      await wallet.save({ transaction });

      const bet = await CasinoBet.create(
        {
          user_id: userId,
          player_name: player_name || "",
          odds,
          stake: amount,
          selection,
          exposer: effExposer,
          libality: libality ?? 0,
          game_name: gameName,
          status: "open",
          event_id: eventId || null,
          round_id: roundId ?? 0,
          type: type || null,
          mtype: mtype || null,
          ip_address: ip_address || null,
          browser: browser || null,
        },
        { transaction }
      );

      // 3️⃣ UPSERT user exposure (find -> update OR create)
      for (const row of bookRows) {
        const existingExposure = await UserExposure.findOne({
          where: {
            user_id: userId,
            match_id: String(roundId),
            team_name: row.team_name,
            event_id: String(roundId),
            game_type: gameType,
          },
          transaction,
        });

        // `value` → absolute (already folds in the old amount); `delta` → additive.
        const nextAmount = row.value !== undefined
          ? row.value
          : Number(existingExposure?.exposure_amount || 0) + row.delta;

        if (existingExposure) {
          // ✅ UPDATE: this bet's contribution to the running book
          await existingExposure.update({ exposure_amount: nextAmount }, { transaction });
        } else {
          // ✅ CREATE: first exposure row
          await UserExposure.create(
            {
              user_id: userId,
              match_id: String(roundId),
              exposure_amount: nextAmount,
              team_name: row.team_name,
              match_title: gameName,
              event_id: String(roundId),
              game_type: gameType,
              category: "casino"
            },
            { transaction }
          );
        }
      }


      await transaction.commit();

      // 📢 Real-time push (header balance + net exposure update WITHOUT a page
      // refresh). Placement previously emitted nothing — only settlement did — so
      // the header stayed stale until refresh. Fire-and-forget after commit; any
      // failure here must never affect the placed bet.
      (async () => {
        try {
          const freshWallet = await Wallet.findOne({ where: { user_id: userId }, raw: true });
          const [expRow] = await sequelize.query(
            `SELECT COALESCE(SUM(market_exposure),0) AS net FROM (
               SELECT LEAST(MIN(exposure_amount),0) AS market_exposure
               FROM user_exposures
               WHERE user_id = :uid AND game_type IS NOT NULL
                 AND game_type NOT IN ('Normal','Ball By Ball','Over By Over','khado','meter','fancy1')
                 AND game_type NOT LIKE '%Overs Line%'
                 AND NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay')
               GROUP BY match_id, game_type, event_id
               UNION ALL
               SELECT LEAST(exposure_amount,0) AS market_exposure
               FROM user_exposures
               WHERE user_id = :uid AND (game_type IS NULL
                 OR game_type IN ('Normal','Ball By Ball','Over By Over','khado','meter','fancy1')
                 OR game_type LIKE '%Overs Line%')
                 AND NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay')
             ) s`,
            { replacements: { uid: String(userId) }, type: sequelize.QueryTypes.SELECT }
          );
          emitBalanceUpdate(userId, {
            inr_balance: freshWallet?.inr_balance,
            cash: freshWallet?.cash,
            exposure: parseFloat(expRow?.net) || 0,
          });
        } catch (e) {
          console.error("[CasinoService.placeBet] balance emit failed:", e.message);
        }
      })();

      // Return plain object if you like consistency with pg
      return bet.get({ plain: true });
    } catch (error) {
      await transaction.rollback();
      throw new Error(error.message || "Failed to place casino bet");
    }
  },
  /**
   * Player-initiated UNDO of their own most recent still-open bet in a round.
   *
   * Backs the "Undo Bet" button on Unique Roulette, where a click posts a bet
   * immediately (the chip IS the stake — there is no confirm step), so the only
   * way to take one back is to reverse it server-side.
   *
   * WHY THIS IS NOT AN EXPLOIT: it is refused unless the round is still OPEN for
   * betting (live feed `lt > 0` and `mid` still equal to the bet's round). In
   * Unique Roulette the deck state is FIXED for the whole betting window — the
   * card is only drawn at lt=0 — so no information reaches the player between
   * placing and undoing. Verified against the live feed: the open-spot count is
   * constant while lt > 0 and only changes at the round boundary. Undoing is
   * therefore exactly as informed as placing was, and closing the window is what
   * stops anyone cancelling a bet they have learnt is a loser.
   *
   * Deliberately restricted to the LEGACY single-row exposure path. Book-managed
   * markets (helper/casinoMarketBook.js) spread one bet across every runner, and
   * a two-way market's row is a min() over both sides that cannot be un-applied
   * by reversing one delta — so those are refused rather than silently corrupted.
   *
   * Reversal mirrors the settlement void path exactly
   * (settlementCasinoWorker.js → settleBetCommon, `winner === "void"`):
   * cash -= exposer, exposure delta backed out, bet closed/void, credit_amt 0.
   * inr_balance and P&L are untouched — a void is not a win or a loss — and no
   * CreditsLedger row is written, matching that path and scripts/voidStuckCasinoBets2.js.
   *
   * @returns {{bet_id:number, refunded:number, cash:number}}
   */
  undoLastBet: async ({ userId, gameName, roundId, all = false }) => {
    if (!userId || !gameName || roundId == null) {
      throw new Error("userId, gameName and roundId are required");
    }

    // 1️⃣ Round must still be open for betting — see the note above.
    let feed;
    try {
      feed = await CasinoService.fetchAllData(gameName);
    } catch (e) {
      throw new Error("Could not verify the round is still open");
    }
    const root = feed?.data?.data || feed?.data || feed || {};
    const liveMid = root?.mid ?? root?.t1?.mid ?? root?.t1?.gmid;
    const liveLt = Number(root?.lt ?? root?.t1?.lt ?? 0);
    if (String(liveMid ?? "") !== String(roundId) || !(liveLt > 0)) {
      throw new Error("Betting is closed for this round — the bet can no longer be undone");
    }

    const transaction = await sequelize.transaction();
    try {
      // 2️⃣ The user's OPEN bets on this round, newest first. `all` (Clear) takes
      // every one; otherwise (Undo) just the most recent. Doing the whole set in
      // ONE transaction matters — a Clear that failed halfway would leave the
      // wallet and the exposure rows disagreeing.
      const bets = await CasinoBet.findAll({
        where: {
          user_id: userId,
          game_name: gameName,
          event_id: String(roundId),
          status: "open",
        },
        order: [["id", "DESC"]],
        ...(all ? {} : { limit: 1 }),
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!bets.length) {
        throw new Error("No bet to undo");
      }

      // 3️⃣ Legacy single-row path only.
      for (const b of bets) {
        if (findCasinoMarket(gameName, b.selection) || isSuperOverFamily(gameName)) {
          throw new Error("This market's bets cannot be undone");
        }
      }

      const wallet = await Wallet.findOne({
        where: { user_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!wallet) throw new Error("Wallet not found");

      let refund = 0;
      for (const bet of bets) {
        const exposer = Number(bet.exposer) || 0;
        refund = round2(refund + -exposer); // exposer is stored negative

        // Back this bet's delta out of its exposure row. Placement did
        // `exposure_amount += exposer` for that one team_name, so undo subtracts
        // it. NOT a blanket delete for the round — with `all` we still unwind bet
        // by bet, so any row shared with a bet we are NOT undoing stays correct.
        const teamName = String(bet.selection).trim();
        const row = await UserExposure.findOne({
          where: {
            user_id: userId,
            match_id: String(roundId),
            team_name: teamName,
            event_id: String(roundId),
            game_type: null,
          },
          transaction,
        });
        if (row) {
          const next = round2(Number(row.exposure_amount || 0) - exposer);
          if (next === 0) await row.destroy({ transaction });
          else await row.update({ exposure_amount: next }, { transaction });
        }

        await bet.update(
          { status: "closed", result_status: "void", credit_amt: 0 },
          { transaction }
        );
      }

      // 4️⃣ Reverse the placement locks in one wallet write.
      wallet.cash = round2(Number(wallet.cash) + refund);
      await wallet.save({ transaction });

      await transaction.commit();
      const bet = bets[0];

      const cash = Number(wallet.cash);
      // Keep total_exposures in step, then push the new balance (fire-and-forget:
      // the undo is already committed and must not fail on a socket error).
      (async () => {
        try {
          const { syncTotalExposure } = await import("../helper/netExposureHelper.js");
          await syncTotalExposure(userId);
          const fresh = await Wallet.findOne({ where: { user_id: userId }, raw: true });
          emitBalanceUpdate(userId, { cash: Number(fresh?.cash ?? cash) });
        } catch (e) {
          console.error("[CasinoService.undoLastBet] post-commit sync failed:", e.message);
        }
      })();

      console.log("✅ Bet(s) undone:", { count: bets.length, bet_id: bet.id, userId, gameName, roundId, refund });
      return { bet_id: bet.id, count: bets.length, refunded: refund, cash };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  UserBets: async (userId, match_id) => {
    try {
      if (!userId) {
        throw new Error("User ID is required to fetch bets");
      }

      const bets = await CasinoBet.findAll({
        where: { user_id: userId, event_id: match_id },
        // Deterministic newest-first order. Without it Postgres returns rows in
        // an unstable order that changes between the 2s My Bets polls (a row's
        // physical position shifts after an UPDATE, e.g. open→closed), so the
        // list visibly reshuffles.
        order: [["id", "DESC"]],
      });

      return bets.map(bet => bet.get({ plain: true }));
    } catch (error) {
      throw new Error(error.message || "Failed to fetch user bets");
    }
  },
  UserBetsHistory: async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID is required to fetch bets");
      }

      const bets = await CasinoBet.findAll({
        where: { user_id: userId },

      });

      return bets.map(bet => bet.get({ plain: true }));
    } catch (error) {
      throw new Error(error.message || "Failed to fetch user bets");
    }
  }
};




export default CasinoService;
