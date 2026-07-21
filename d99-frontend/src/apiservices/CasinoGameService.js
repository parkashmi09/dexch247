import api from "./axiosClient.js";

// External casino data endpoint (separate host, not the main API).
// This URL is not gated behind auth, so we use the raw axios instance only for
// the base-URL override and keep the shared interceptors for everything else.
const CASINO_DATA_URL = "http://164.52.216.63:3009/casino/data";

export const fetchCasinoGameData = async (key, type) => {
  try {
    const response = await api.get(CASINO_DATA_URL, {
      params: { key, type },
      // Override baseURL so the shared instance still handles headers/401
      baseURL: "",
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
