import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { Op } from "sequelize";
import redis from "../config/redisClient.js"; // Import Redis Client

import SportsBet from '../model/user/SportsBet.js';
// import sequelize from '../config/db.js';

import FanWin from "../model/user/FanWin.js";
import MarketWin from "../model/user/MarketWin.js";

const BASE_URL = process.env.DIAMOND_BASE_URL;
const API_KEY = process.env.DIAMOND_API_KEY;
const SPORTS_API_VERSION = process.env.SPORTS_API_VERSION || 'v2';
const AVRKHUB_SPORTS_BASE_URL = process.env.AVRKHUB_SPORTS_BASE_URL;
const AVRKHUB_SPORTS_KEY = process.env.AVRKHUB_SPORTS_KEY;
const CACHE_TTL = 2; // Cache time in seconds

console.log("DEBUG: BASE_URL =", BASE_URL);
console.log("DEBUG: API_KEY =", API_KEY ? "Loaded" : "Missing");

// ---------------------------------------------------------------------------
// FEED "LAST UPDATED" EXTRACTION
// ---------------------------------------------------------------------------
// The staleness guard (sportsbet/liveOddsGuard.js) needs to know how old the
// prices in a feed response are. Upstream has not standardised the field name,
// so probe a candidate list at the response root first, then fall back to the
// NEWEST per-market stamp. Returns epoch ms, or null when nothing parses —
// callers must treat null as "unknown", never as "stale".
const FEED_TIME_KEYS = [
  'lastUpdatedAt', 'last_updated_at', 'lastUpdated', 'last_updated',
  'updatedAt', 'updated_at', 'lutm', 'ltm', 'utime', 'updateTime', 'timestamp', 'ts',
];

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// A bare wall-clock string with NO zone marker is IST on this feed — the same
// trap already documented for racing `stime` in sportbetscontroller.js. Reading
// it as UTC lands 5h30m in the past and every bet would look stale.
function parseFeedTimeValue(v) {
  if (v == null) return null;

  if (typeof v === 'number' && Number.isFinite(v)) {
    // Heuristic: 10-digit values are epoch seconds, 13-digit are ms.
    return v > 1e11 ? v : v * 1000;
  }

  const s = String(v).trim();
  if (!s) return null;

  if (/^\d+$/.test(s)) return parseFeedTimeValue(Number(s));

  // Carries an explicit zone (Z or ±HH:MM) → trust Date.parse.
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) {
    const t = Date.parse(s);
    return Number.isFinite(t) ? t : null;
  }

  // Bare locale wall-clock, e.g. "29/07/2026, 20:46:06" or "7/22/2026 1:44:00 AM".
  const m = s.match(
    /^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})[,\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
  );
  if (m) {
    let [, a, b, c, hh, mm, ss, ap] = m;
    a = Number(a); b = Number(b); c = Number(c);
    let day, month, year;
    if (a > 31) {            // YYYY-MM-DD
      year = a; month = b; day = c;
    } else if (a > 12) {     // DD/MM/YYYY — unambiguous
      day = a; month = b; year = c;
    } else if (b > 12) {     // MM/DD/YYYY — unambiguous
      month = a; day = b; year = c;
    } else {
      // Genuinely ambiguous (both ≤ 12). AM/PM implies the en-US M/D form;
      // otherwise assume D/M, which is what en-GB / en-IN locales emit.
      if (ap) { month = a; day = b; } else { day = a; month = b; }
      year = c;
    }
    let hour = Number(hh);
    if (ap) {
      const pm = ap.toUpperCase() === 'PM';
      if (pm && hour < 12) hour += 12;
      if (!pm && hour === 12) hour = 0;
    }
    const utc = Date.UTC(year, month - 1, day, hour, Number(mm), Number(ss || 0));
    return Number.isFinite(utc) ? utc - IST_OFFSET_MS : null;
  }

  // Anything else — let Date have a go, but only accept a sane result.
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

function pickFeedTime(obj) {
  if (!obj || typeof obj !== 'object') return null;
  for (const k of FEED_TIME_KEYS) {
    if (obj[k] != null) {
      const t = parseFeedTimeValue(obj[k]);
      if (t != null) return t;
    }
  }
  return null;
}

export function extractFeedUpdatedMs(root, markets) {
  const top = pickFeedTime(root) ?? pickFeedTime(root?.data);
  if (top != null) return top;

  // No root stamp — use the freshest market-level stamp we can find.
  if (Array.isArray(markets)) {
    let newest = null;
    for (const m of markets) {
      const t = pickFeedTime(m);
      if (t != null && (newest == null || t > newest)) newest = t;
    }
    return newest;
  }
  return null;
}

// Helper for caching
const getCachedData = async (key, fetchFunction) => {
  let cachedData = null;

  // 1. Try to get from Cache
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

  // 2. Fetch from API
  try {
    console.log(`[Trace] Cache miss for ${key}, fetching...`);
    const data = await fetchFunction();

    // 3. Set Cache (Async, don't block)
    redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL).catch(err =>
      console.error(`❌ Failed to set cache for ${key}:`, err.message)
    );

    console.log(`🌐 Fetched from API & Cached: ${key}`);
    return data;
  } catch (err) {
    console.error(`❌ API Error for ${key}:`, err.message);
    // If API fails, we return null or rethrow. 
    // For now, let's return null to avoid crashing the whole request if one sub-request fails,
    // assuming the controller handles nulls gracefully.
    // Or simpler: just throw/return error object so controller knows.
    throw err;
  }
};

const CricketService = {
  // fetchCricketData: async (id) => {
  //   // console.log("======>>>>fetch cricket all data for id : "+id+ "===="+ API_KEY+ "===="+BASE_URL);
  //   if (!id) {
  //     throw new Error("ID is required to fetch cricket data");
  //   }

  //   const key = `cricket_data_${id}`;
  //   return await getCachedData(key, async () => {
  //     const response = await axios.get(`${BASE_URL}/esid`, {
  //       headers: { Accept: "*/*" },
  //       params: { sid: id, key: API_KEY },
  //       timeout: 6000 // 3s timeout
  //     });
  //     return response.data;
  //   });
  // },


  fetchCricketData: async (id) => {
    try {
      const sid = id;

      if (!sid) {
        throw new Error("sid is required to fetch cricket data");
      }

      if (SPORTS_API_VERSION === 'v2') {
        const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/highlighthomePrivate`, {
          params: { etid: id, key: AVRKHUB_SPORTS_KEY },
          timeout: 8000,
          validateStatus: (s) => (s >= 200 && s < 300) || s === 404
        });

        // 404 from upstream = no fixtures for this sport right now, not a server error
        if (response.status === 404) {
          const empty = { success: true, data: { t1: [], t2: [] } };
          redis.set(`alleventss:${id}`, JSON.stringify(empty.data), 'EX', 60).catch(() => { });
          return empty;
        }

        const rawData = response.data?.data?.data || response.data?.data || {};
        const t1 = Array.isArray(rawData.t1) ? rawData.t1 : [];
        const t2 = Array.isArray(rawData.t2) ? rawData.t2 : [];

        // Match the legacy format expected by the frontend
        const finalData = {
          success: true,
          data: {
            t1: t1.map(e => ({ ...e, etid: parseInt(id) })),
            t2: t2.map(e => ({ ...e, etid: parseInt(id) }))
          }
        };

        // Cache in redis key so other parts of the system (like odds cron) can see it
        redis.set(`alleventss:${id}`, JSON.stringify(finalData.data), 'EX', 120).catch(() => { });

        return finalData;
      }

      // console.log("======>>>>sid: " + sid)

      const dataStr = await redis.get(`allevents:${sid}`);
      // console.log("======>>>>dataStr: " + dataStr)

      if (!dataStr) {
        return {
          success: true,
          data: { t1: [], t2: [] }
        };
      }

      let parsedData;
      try {
        parsedData = JSON.parse(dataStr);
      } catch (e) {
        console.error("Error parsing redis data", e);
        return {
          success: true,
          data: { t1: [], t2: [] }
        };
      }

      // ✅ Redis already stores { t1, t2 }
      if (
        parsedData &&
        typeof parsedData === "object" &&
        !Array.isArray(parsedData) &&
        Array.isArray(parsedData.t1)
      ) {
        return {
          success: true,
          data: {
            t1: parsedData.t1 || [],
            t2: parsedData.t2 || []
          }
        };
      }

      // ✅ OLD redis structure (flat array → split now)
      if (Array.isArray(parsedData)) {

        const t1 = parsedData.filter(
          (e) => e?.status === "OPEN" && e?.gscode === 1
        );

        const t2 = parsedData.filter(
          (e) => e?.status === "SUSPENDED" || e?.gscode === 0
        );

        return {
          success: true,
          data: { t1, t2 }
        };
      }

      // fallback
      return {
        success: true,
        data: { t1: [], t2: [] }
      };

    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  GetallSportsdata: async () => {
    const key = `all_sports_data`;
    return await getCachedData(key, async () => {
      const response = await axios.get(`${BASE_URL}/allSportid`, {
        headers: { Accept: "*/*" },
        params: { key: API_KEY },
        timeout: 6000
      });
      return response?.data?.data;
    });
  },


  // GetMatchPrivateData: async (gmid, sid) => {

  //   // console.log("======>>>>fetch match private data for id : "+ sid+", gmid : "+gmid);
  //   if (!gmid || !sid) {
  //     throw new Error("Game ID is required to fetch match private data");
  //   }

  //   // Cache key combination of gmid and sid
  //   const key = `match_private_${gmid}_${sid}`;
  //   return await getCachedData(key, async () => {
  //     const response = await axios.get(`${BASE_URL}/gamedataPrivate`, {
  //       headers: { Accept: "*/*" },
  //       params: { gmid: gmid, etid: sid },
  //       timeout: 6000
  //     });

  //     // console.log("======>>>>Response  match private data for id : "+ sid+", gmid : "+gmid+"==response=="+ response.data);
  //     return response.data?.data;
  //   });
  // },

  GetMatchPrivateData: async (gmid, sid) => {

    if (!gmid || !sid) {
      throw new Error("gmid and sid are required to fetch match private data");
    }

    if (process.env.COUNT_CALLS === "true" && typeof isSampling !== "undefined" && isSampling) {
      requestCounter++;
    }

    // console.log("GetMatchPrivateData(gmid, sid)", gmid, sid);

    try {
      if (SPORTS_API_VERSION === 'v2') {
        const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/gamedataPrivate`, {
          params: { gmid, etid: sid, key: AVRKHUB_SPORTS_KEY },
          timeout: 8000
        });
        let innerData = response.data?.data || [];
        // Unwrap if AVRKHUB double-wraps in { data: [...] }
        if (innerData && !Array.isArray(innerData) && Array.isArray(innerData.data)) {
          innerData = innerData.data;
        }
        // Also cache in old key so odds cron stays warm
        if (Array.isArray(innerData) && innerData.length > 0) {
          redis.setex(`odds:${gmid}`, 3, JSON.stringify(innerData)).catch(() => { });
        }
        // `feed_updated_ms` carries the upstream "last updated" stamp so the
        // bet-placement staleness guard can tell a live price from a frozen
        // one. Extra key only — the { success, data } contract is unchanged,
        // and it is null whenever the feed omits a recognisable stamp.
        return {
          success: true,
          data: innerData,
          feed_updated_ms: extractFeedUpdatedMs(response.data, innerData),
          fetched_at_ms: Date.now(),
        };
      }

      // IMPORTANT: odds cron stores by gmid only
      const redisKey = `odds:${gmid}`;



      const cached = await redis.get(redisKey);

      if (!cached) {
        return { success: true, data: [] };   // keep same behaviour as API (usually array)
      }

      const parsedData = JSON.parse(cached);
      return { success: true, data: parsedData };

    } catch (error) {
      console.error(
        "GetMatchPrivateData(redis) error:",
        error.message
      );
      throw error;
    }
  },


  getSportDataById: async (gmid, sid) => {
    if (!sid || !gmid) {
      throw new Error("Sport ID is required to fetch data");
    }

    const key = `sport_data_${gmid}_${sid}`;
    return await getCachedData(key, async () => {
      const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/getDetailsData`, {
        headers: { Accept: "*/*" },
        params: { sid: sid, gmid: gmid, key: API_KEY },
        timeout: 8000
      });
      // console.log("======>>>>Response  match private data for id : "+ sid+", gmid : "+gmid+"==response=="+ response.data);
      return response.data;
    });
  },


  fetchLiveStream: async (gmid) => {
    if (!gmid) {
      throw new Error("Game ID is required to fetch live stream data");
    }
    const key = `live_stream_${gmid}`;
    // Cache live stream URL slightly longer if needed, but 2s is safe
    return await getCachedData(key, async () => {
      const response = await axios.get(`${BASE_URL}/tv_url`, {
        headers: { Accept: "*/*" },
        params: { gmid: gmid, key: API_KEY },
        timeout: 6000
      });
      return response.data;
    });
  },

  fetchScoreCard: async (gmid, sid) => {
    if (!gmid) {
      throw new Error("gmid is required to fetch scorecard");
    }
    if (!sid) {
      throw new Error("sid is required to fetch scorecard");
    }

    // v2: Use AVRKHUB scorecard endpoint - works for ALL sports (no gtv needed)
    if (SPORTS_API_VERSION === 'v2') {
      const key = `scorecard_v2_${gmid}_${sid}`;
      return await getCachedData(key, async () => {
        const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/scorecard`, {
          params: { gmid, etid: sid, key: AVRKHUB_SPORTS_KEY },
          timeout: 8000
        });
        // Response: { etid, gmid, scorecard_url }
        // Normalize to score_url for frontend compatibility
        const data = response.data;
        if (data?.scorecard_url) {
          return { score_url: data.scorecard_url };
        }
        return data;
      });
    }

    // v1 fallback: Diamond /score endpoint (requires gtv)
    const key = `scorecard_${gmid}_${sid}`;
    return await getCachedData(key, async () => {
      const response = await axios.get(`${BASE_URL}/score`, {
        headers: { Accept: "*/*" },
        params: { gtv: gmid, key: API_KEY, sid: sid, sportid: sid },
        timeout: 6000
      });
      return response.data;
    });
  },


  fetchTreeData: async () => {
    if (SPORTS_API_VERSION === 'v2') {
      const key = `tree_data_v2`;
      return await getCachedData(key, async () => {
        const response = await axios.get(`${AVRKHUB_SPORTS_BASE_URL}/treedata`, {
          params: { key: AVRKHUB_SPORTS_KEY },
          timeout: 8000
        });
        return response.data;
      });
    }

    const key = `tree_data`;
    // Tree data changes less frequently, can potentially cache longer, but sticking to 2-5s for consistency
    return await getCachedData(key, async () => {
      const response = await axios.get(`${BASE_URL}/tree`, {
        headers: { Accept: "*/*" },
        params: { key: API_KEY },
        timeout: 6000
      });
      return response.data;
    });
  },







  GetResult: async (
    sid,
    event_id,
    event_name,
    market_id,
    market_name,

  ) => {
    if (!sid) {
      throw new Error("sid is required");
    } else if (
      !event_id ||
      !event_name ||
      !market_id ||
      !market_name

    ) {
      throw new Error(
        "Event ID, Event Name, Market ID, Market Name and Market Type are required"
      );
    }
    const payload = {
      event_id,
      event_name,
      market_id,
      market_name,

    };

    try {
      const response = await axios.post(
        `${BASE_URL}/get-result`, // no such endpoint is available in api , neeed to modify this one 
        payload,

        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
          params: {
            sid,
            key: API_KEY,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Axios error :", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new Error(
          error.response?.data?.message ||
          `Request failed with status ${error.response?.status}`
        );
      } else {
        console.error("❌ Unknown error ", error);
        throw new Error("An unexpected error occurred.");
      }
    }
  },


  getAllSportsBets: async () => {
    // Fetch all sports bets
    const bets = await SportsBet.findAll();
    return bets;
  },


  getSportsBetsByUserId: async (user_id, { page = 1, limit = 10, search = '', betType = 'all' } = {}) => {
    const offset = (page - 1) * limit;
    const where = { user_id };

    if (betType !== 'all') {
      where.bet_type = betType;
    }

    if (search) {
      where[Op.or] = [
        { match_title: { [Op.like]: `%${search}%` } },
        { selection_name: { [Op.like]: `%${search}%` } },
        { market_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await SportsBet.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    return {
      rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit)
      }
    };
  },

  getWinsByUserId: async (user_id) => {
    // Fetch all winning bets for a specific user
    const fanWins = await FanWin.findAll({ where: { user_id } });
    const marketWins = await MarketWin.findAll({ where: { user_id, } });
    const allWins = [{ marketWins }, { fanWins }];
    return allWins;
  }
};

export default CricketService;

