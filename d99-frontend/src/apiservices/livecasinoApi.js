import api from "./axiosClient.js";
import { API_URL } from "../config.js";

// The live-casino endpoints use two path prefixes that sit alongside the main
// API base. We derive them from the same VITE_API_URL used by axiosClient so
// there is a single source of truth.
const BASE_URL = `${API_URL}/jsGames/`;
const LAUNCH_URL = `${API_URL}/jsGamesv2/`;

export const getLivecasinoGames = async (
  vendor = "evolution",
  page = 1,
  category = "roulette",
  signal = null
) => {
  try {
    const response = await api.get(
      `${BASE_URL}games?vendor=${vendor}&page=${page}&category=${category}`,
      { signal, baseURL: "" }
    );
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching live casino games:", error);
    throw error;
  }
};

export const launchLivecasinoGame = async (payload, signal = null) => {
  try {
    const response = await api.post(`${LAUNCH_URL}launch`, payload, {
      signal,
      baseURL: "",
    });
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error launching live casino game:", error);
    throw error;
  }
};

export const betCallbackLivecasino = async (payload, signal = null) => {
  try {
    const response = await api.post(`${BASE_URL}bet-callback`, payload, {
      signal,
      baseURL: "",
    });
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error in bet callback:", error);
    throw error;
  }
};

export const getSlotGames = async (vendor, page = 1, signal = null) => {
  try {
    const response = await api.get(
      `${BASE_URL}games?vendor=${encodeURIComponent(vendor)}&game_type=Slot&page=${page}`,
      { signal, baseURL: "" }
    );
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") return null;
    console.error("Error fetching slot games:", error);
    throw error;
  }
};

export const getCrashGames = async (page = 1, perPage = 100, signal = null) => {
  try {
    const response = await api.get(
      `${BASE_URL}games?game_type=Crash&page=${page}&per_page=${perPage}`,
      { signal, baseURL: "" }
    );
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") return null;
    console.error("Error fetching crash games:", error);
    throw error;
  }
};

export const getGamesByVendor = async (vendor, page = 1, signal = null) => {
  try {
    const response = await api.get(
      `${BASE_URL}games?vendor=${encodeURIComponent(vendor)}&page=${page}`,
      { signal, baseURL: "" }
    );
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") return null;
    console.error("Error fetching games by vendor:", error);
    throw error;
  }
};

export const searchLivecasinoGames = async (params, signal = null) => {
  try {
    const response = await api.get(`${BASE_URL}games/search`, {
      params,
      signal,
      baseURL: "",
    });
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error searching live casino games:", error);
    throw error;
  }
};

export const getLivecasinoHistory = async (params, signal = null) => {
  try {
    const response = await api.get(`${LAUNCH_URL}history`, {
      params,
      signal,
      baseURL: "",
    });
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching live casino history:", error);
    throw error;
  }
};

export const getLivecasinoHistoryAdmin = async (params, signal = null) => {
  try {
    const response = await api.get(`${LAUNCH_URL}historyAdmin`, {
      params,
      signal,
      baseURL: "",
    });
    return response.data;
  } catch (error) {
    if (api.isCancel?.(error) || error.name === "CanceledError") {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching live casino admin history:", error);
    throw error;
  }
};
