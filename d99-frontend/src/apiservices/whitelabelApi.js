import {
  API_URL,
  SOCKET_URL,
  THEME,
  BRAND,
  CASINO_STREAM_URL,
  SPORTS_STREAM_URL,
  SCORECARD_URL,
} from "../config.js";

import { WHITELABEL } from "../whitelabel.config.js";

// Static fallback map — used for any field the API doesn't return (or when
// the API call fails entirely). Env values + committed asset paths.
export const WHITELABEL_DEFAULTS = {
  brand: BRAND,
  theme: THEME,
  siteName: "Diamond Exch 99",
  title: "Diamond Exch 99",
  description: "Diamond Exch 99 — sports & casino exchange",
  themeColor: "#0088cc",
  logo: "/assets/brand/logo.png",
  favicon: "/assets/brand/fav-icon.png",
  welcomeBanner: "/assets/brand/welcome-banner.png",
  apkUrl: "https://sitethemedata.com/apk/diamondexch99-1.20.apk",
  marqueeText: "Newly Launched Matka Market In Our Exchange",
  supportText: "24X7 Support",
  copyrightText: "© Copyright 2026. All Rights Reserved. Powered by DIAMONDEXCH99.",
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
  casinoStreamUrl: CASINO_STREAM_URL,
  sportsStreamUrl: SPORTS_STREAM_URL,
  scorecardUrl: SCORECARD_URL,
};

/**
 * Resolve the whitelabel config. Reads the bundled config module (no network
 * request) and merges its values over the static defaults; non-empty fields
 * win, missing fields fall back to the defaults. Stays async to preserve the
 * existing caller contract (useWhitelabel().then(...)).
 */
export async function fetchWhitelabelConfig() {
  // Drop null/empty values so defaults win for missing fields
  const clean = Object.fromEntries(
    Object.entries(WHITELABEL || {}).filter(
      ([, v]) => v !== null && v !== undefined && v !== ""
    )
  );
  return { ...WHITELABEL_DEFAULTS, ...clean };
}
