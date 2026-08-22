import api from "./axiosClient.js";

// All casino endpoints. Auth header + baseURL come from axiosClient; AbortSignal
// is forwarded as-is through axios config.

export const getCasinoGameDetails = async (type, signal = null) => {
  try {
    const response = await api.post(
      "/casino/casino/all-data",
      { type, data: {} },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching casino game details:", error);
    throw error;
  }
};

export const Getlivestream = async (gmid, signal = null) => {
  try {
    const response = await api.post(
      "/user/cricket/live-stream",
      { gmid },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching livestream:", error);
    throw error;
  }
};

export const placeCasinoBet = async (betData, signal = null) => {
  try {
    // Attach client geodata (browser user-agent) so the server can record it.
    // Server captures the IP itself from the request headers.
    const payload = {
      browser:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      ...betData,
    };
    const response = await api.post("/casino/casino/placebet", payload, {
      signal,
    });
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error placing casino bet:", error);
    throw error;
  }
};

export const getMatchExposure = async (userId, matchId, signal = null) => {
  try {
    const response = await api.post(
      "/user/exposures/get-exposure",
      { user_id: userId, match_id: matchId },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching match exposure:", error);
    throw error;
  }
};

// Undo the player's most recent open bet on a round (Unique Roulette "Undo Bet").
// The server takes the user from the auth token, so no userId is sent. Returns
// the parsed error body instead of throwing, so the caller can show the server's
// reason ("Betting is closed for this round…", "No bet to undo", …).
export const undoCasinoBet = async (gameName, roundId, { all = false } = {}, signal = null) => {
  try {
    const response = await api.post(
      "/casino/casino/undobet",
      { gameName, roundId, all },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") return null;
    return error?.response?.data || { success: false, error: "Could not undo the bet" };
  }
};

export const getMyBets = async (userId, matchId, signal = null) => {
  try {
    const response = await api.post(
      "/casino/casino/mybets",
      { user_id: userId, match_id: matchId },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching my bets:", error);
    throw error;
  }
};

export const getLastResults = async (type, signal = null) => {
  try {
    const response = await api.post(
      "/casino/casino/last-results",
      { type },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching last results:", error);
    throw error;
  }
};

export const getDetailResults = async (type, mid, signal = null) => {
  try {
    const response = await api.post(
      "/casino/casino/detail-results",
      { type, mid },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching detail results:", error);
    throw error;
  }
};

export const getUserExposure = async (userId, signal = null) => {
  try {
    const response = await api.get(`/d99/bets/exposure/${userId}`, { signal });
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching user exposure:", error);
    throw error;
  }
};

export const getCasinoBetHistory = async (userId, signal = null) => {
  try {
    const response = await api.post(
      "/casino/casino/bet-history",
      { user_id: userId },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === "AbortError" || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching casino bet history:", error);
    throw error;
  }
};
