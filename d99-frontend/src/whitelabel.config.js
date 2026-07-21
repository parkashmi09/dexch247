// Whitelabel config — bundled into the app at build time.
//
// This is the single source of truth for branding + endpoints. Because it is a
// JS module (not a fetched JSON file), Vite compiles it into the bundle, so it
// NEVER shows up as a runtime network request. Edit values here and rebuild to
// change branding/endpoints. (Replaces the old fetch of /mock/whitelabel.json.)
export const WHITELABEL = {
  brand: "dexch247",
  theme: "light",
  siteName: "Dexch247",
  title: "Dexch247",
  description: "Dexch247 — sports & casino exchange",
  themeColor: "#0088cc",
  logo: "/assets/brand/logo.png",
  favicon: "/assets/brand/fav-icon.png",
  welcomeBanner: "/assets/brand/welcome-banner.png",
  apkUrl: "https://sitethemedata.com/apk/diamondexch99-1.21.apk",
  marqueeText: "Newly Launched Matka Market In Our Exchange",
  supportText: "24X7 Support",
  copyrightText:
    "© Copyright 2026. All Rights Reserved. Powered by Dexch247.",
  apiUrl: "https://api.dexch247.com/api",
  socketUrl: "https://api.dexch247.com",
  casinoStreamUrl: "https://stream-s-43.uhdmovies.online/casino-stream",
  sportsStreamUrl: "https://stream-s-43.uhdmovies.online/sports-stream",
  scorecardUrl: "https://scorecard22-avrkhub.tuknfalt.workers.dev",
};

export default WHITELABEL;
