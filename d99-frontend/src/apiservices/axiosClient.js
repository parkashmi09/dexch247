import axios from "axios";
import { API_URL } from "../config.js";

// Real backend base URL. Takes VITE_API_URL from .env when set, otherwise
// falls back to the production host so the app never posts to the page
// origin (e.g. http://localhost:3090) when the .env file is missing.
const BASE_URL = API_URL || "https://api.bigwinexch.live/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      // Soft redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  },
);

export default api;
