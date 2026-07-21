// Single place for app config. Values come from the bundled whitelabel config
// module (src/whitelabel.config.js), then are exported as constants. Import
// from here, never hardcode these URLs inside components.
//
// The config is a compiled-in JS module rather than a fetched JSON file, so it
// is captured synchronously at module load (no top-level await, no network
// request) — services like axiosClient/socket read the real values immediately.

import { WHITELABEL as wl } from "./whitelabel.config.js";

export const API_URL = wl.apiUrl;
export const SOCKET_URL = wl.socketUrl;
export const THEME = wl.theme;
export const CASINO_STREAM_URL = wl.casinoStreamUrl;
export const SPORTS_STREAM_URL = wl.sportsStreamUrl;
export const SCORECARD_URL = wl.scorecardUrl;

// Whitelabel: pick a brand from the mock config, else from the hostname.
export const BRAND =
  wl.brand ||
  (typeof window !== "undefined"
    ? window.location.hostname.split(".")[0]
    : "default");

// Apply the brand to <html data-brand="..."> so theme overrides in
// styles/themes/<brand>.css can target it via :root[data-brand="..."].
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-brand", BRAND);
}
