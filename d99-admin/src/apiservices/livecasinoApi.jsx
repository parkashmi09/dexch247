import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/jsGames/`;
const LAUNCH_URL = `${process.env.REACT_APP_API_URL}/jsGamesv2/`;

// Add interceptor to handle 401 Unauthorized globally for axios requests
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const getLivecasinoGames = async (vendor = "evolution", page = 1, category = "roulette", signal = null) => {
  try {
    const response = await axios.get(BASE_URL + `games?vendor=${vendor}&page=${page}&category=${category}`, {
      signal
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching live casino games:", error);
    throw error;
  }
};

export const launchLivecasinoGame = async (payload, signal = null) => {
  console.log("launch game payload.....>>>>>", payload);
  try {
    const response = await axios.post(LAUNCH_URL + "launch", payload, {
      signal
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error launching live casino game:", error);
    throw error;
  }
};

export const betCallbackLivecasino = async (payload, signal = null) => {
  try {
    const response = await axios.post(BASE_URL + "bet-callback", payload, {
      signal
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error in bet callback:", error);
    throw error;
  }
};

export const searchLivecasinoGames = async (params, signal = null) => {
  try {
    const response = await axios.get(BASE_URL + "games/search", { 
      params,
      signal
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error searching live casino games:", error);
    throw error;
  }
};

export const getLivecasinoHistory = async (params, signal = null) => {
  try {
    const response = await axios.get(BASE_URL + "history", { 
      params,
      signal
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching live casino history:", error);
    throw error;
  }
};

export const getLivecasinoHistoryAdmin = async (params, signal = null) => {
  try {
    const response = await axios.get(BASE_URL + "historyAdmin", { 
      params,
      signal
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return null;
    }
    console.error("Error fetching live casino admin history:", error);
    throw error;
  }
}; 