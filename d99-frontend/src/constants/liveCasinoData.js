// Provider tabs for Live Casino list page
export const LIVE_CASINO_PROVIDER_TABS = [
  { provider: "CS", providerId: "24", name: "Creedroomz" },
  { provider: "CS", providerId: "5",  name: "Evolution" },
  { provider: "CS", providerId: "1",  name: "EZUGI" },
  { provider: "CS", providerId: "6",  name: "CockFight" },
  { provider: "CS", providerId: "42", name: "Red Carat" },
  { provider: "CS", providerId: "43", name: "Jacktop" },
  { provider: "Holi", providerId: "3", name: "Holi" },
];

// Sub-categories per provider
export const LIVE_CASINO_CATEGORIES = {
  "24": [
    { id: 111, name: "Roulette" },
    { id: 112, name: "Blackjack" },
    { id: 113, name: "Baccarat" },
    { id: 114, name: "Poker" },
    { id: 115, name: "Keno" },
    { id: 116, name: "Other" },
  ],
};

export const DEFAULT_PROVIDER    = "CS";
export const DEFAULT_PROVIDER_ID = "24";
export const DEFAULT_CATEGORY_ID = 111;

// Static game images for Creedroomz (24) → Roulette (111)
export const LIVE_CASINO_GAMES = {
  "24": {
    111: [
      "https://sitethemedata.com/casino_icons/bc/roulette/400040324.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40003094.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40003103.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/3001055.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40003105.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40003106.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40003107.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40003139.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40003099.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040621.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040006.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/40004120.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040640.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040638.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040312.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040313.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040314.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040315.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040316.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040319.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040317.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040629.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040311.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040323.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040329.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400031897.jpg",
      "https://sitethemedata.com/casino_icons/bc/roulette/400040782.jpg",
    ],
  },
};

export function getCategories(providerId) {
  return LIVE_CASINO_CATEGORIES[providerId] || [];
}

export function getGames(providerId, categoryId) {
  const providerGames = LIVE_CASINO_GAMES[providerId];
  if (!providerGames) return [];
  return providerGames[Number(categoryId)] || [];
}
