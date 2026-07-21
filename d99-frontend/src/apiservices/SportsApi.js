import api from "./axiosClient.js";

// All sports endpoints. Ported from
// old-frontend/d99-frontend/src/apiservices/SportsApi.js and rewritten to
// use the shared axios client (which already handles baseURL + auth + 401).

/** Live top-level board for a sport id (e.g. cricket=4, football=1). */
export const getAllSportData = (sid) =>
  api.post("/user/cricket/all-data", { id: sid }).then((r) => r.data);

/** Legacy alias — old code calls this `getTopBarEvents`. */
export const getTopBarEvents = (sid) =>
  api.post("/user/cricket/all-data", { id: sid }).then((r) => r.data);

/** Match-level odds for a specific game. */
export const getSportsGameDetails = (gmid, sid) =>
  api
    .post("/user/cricket/get-sport-data-by-id", { gmid, sid })
    .then((r) => r.data);

/** TV / score-card URL for a specific game. Returns null on failure. */
export const getSportsScoreCard = async (gmid, sid) => {
  try {
    const r = await api.post("/user/cricket/score-card", { gmid, sid });
    return r.data?.data?.score_url ?? null;
  } catch {
    return null;
  }
};

/** Private market data (bookmaker / fancy) for a game. */
export const getMatchPrivateData = (gmid, sid) =>
  api
    .post("/user/cricket/get-match-private-data", { gmid, sid })
    .then((r) => r.data);

/** Full sports tree (left sidebar). */
export const getSportsTree = () =>
  api.get("/user/all/sports/tree").then((r) => r.data);

/** Legacy alias for getSportsTree — old code calls this `getTreeData`. */
export const getTreeData = getSportsTree;

/** Platform-configured bet buffer, in seconds. */
export const getPlatformBufferTime = () =>
  api.get("/user/buffer-time").then((r) => r.data);

/** Place a bet. */
export const sportsPlaceBet = (payload) =>
  api.post("/user/place", payload).then((r) => r.data);

/** Open bets for a user on a given event. */
export const getUserMatchedBets = (eventid, userid) =>
  api
    .get("/user/cricket/user-open-bets", { params: { eventid, user_id: userid } })
    .then((r) => r.data);

/** Combined sports + casino open bets for header / home badges. */
export const getUserSportsCasinoOpenBets = (userId) =>
  api
    .get("/user/cricket/user-sports-casino-open-bets", { params: { user_id: userId } })
    .then((r) => r.data);

/** Current sports bets for the authenticated user. */
export const getSportsBets = ({ page = 1, limit = 10, search = "", betType = "all" } = {}) =>
  api
    .get("/user/cricket/sports-bets/user", {
      params: { page, limit, search, betType },
    })
    .then((r) => r.data);

/** Match exposures. Accepts optional userId → POST; otherwise GET. */
export const getMatchExposures = async (matchId, userId = null) => {
  try {
    if (userId) {
      const r = await api.post("/user/matchexposures/match", {
        user_id: userId,
        match_id: matchId,
      });
      return r.data;
    }
    const r = await api.get("/user/matchexposures/match", {
      params: { match_id: matchId },
    });
    return r.data;
  } catch (err) {
    if (err?.response?.status === 404) return { success: false, data: [] };
    return { success: false, data: [] };
  }
};
