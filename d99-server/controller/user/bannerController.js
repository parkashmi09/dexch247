import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Upstream welcome-banner feed. It is served from Cloudflare WITHOUT any
// CORS headers, so the browser cannot read it directly — we proxy it here
// (server-to-server has no CORS restriction) and expose it on our own origin.
const BANNER_URL =
  process.env.WELCOME_BANNER_URL ||
  "https://diamondapi.avrkhub.in/idkbro/welcomebanners.json";

// Small in-memory cache so we don't hit the upstream on every page load.
const CACHE_TTL_MS = 60 * 1000; // refresh at most once a minute
let cache = { at: 0, data: null };

const BannerController = {
  // GET /api/user/banners/welcome
  // Returns { success, data: { bdesc, img_desktop, img_mobile } | null }.
  getWelcomeBanner: async (req, res) => {
    try {
      const now = Date.now();
      if (cache.data && now - cache.at < CACHE_TTL_MS) {
        return res.json({ success: true, data: cache.data });
      }

      const response = await axios.get(BANNER_URL, { timeout: 6000 });
      const banner = response.data?.data?.welcome_banner ?? null;

      cache = { at: now, data: banner };
      return res.json({ success: true, data: banner });
    } catch (err) {
      console.error("[WelcomeBanner] fetch failed:", err.message);
      // Serve the last good value if we have one, otherwise signal "no banner"
      // so the frontend can fall back to its bundled static image.
      if (cache.data) {
        return res.json({ success: true, data: cache.data, stale: true });
      }
      return res.json({ success: false, data: null });
    }
  },
};

export default BannerController;
