// Provider tabs shown on mobile (top tab row)
export const CASINO_PROVIDER_TABS = [
  { id: "4", name: "Our Casino" },
  { id: "45", name: "Our VIP Casino" },
  { id: "52", name: "Our Premium Casino" },
  { id: "19", name: "Our Virtual" },
];

// Per-provider category definitions and game lists
const PROVIDER_DATA = {
  "4": {
    allCategoryId: 35,
    categories: [
      { id: 35, name: "All Casino" },
      { id: 31, name: "Roulette" },
      { id: 20, name: "Teenpatti" },
      { id: 21, name: "Poker" },
      { id: 22, name: "Baccarat" },
      { id: 23, name: "Dragon Tiger" },
      { id: 24, name: "32 Cards" },
      { id: 26, name: "Andar Bahar" },
      { id: 27, name: "Lucky 7" },
      { id: 28, name: "3 Card Judgement" },
      { id: 29, name: "Casino War" },
      { id: 30, name: "Worli" },
      { id: 34, name: "Sports" },
      { id: 32, name: "Bollywood" },
      { id: 33, name: "Lottery" },
      { id: 40, name: "Queen" },
      { id: 41, name: "Race" },
      { id: 73, name: "Others" },
    ],
    categorySlugs: {
      31: ["roulette12", "roulette13", "roulette11", "ourroullete"],
      20: [
        "teen62", "teen", "teen20", "teen20c", "teen20b", "teen9", "teen8",
        "teen6", "teen33", "teen32", "teen41", "teen42", "teenunique",
        "poison", "poison20", "joker1", "joker20", "teen120", "teen1",
        "patti2", "teensin", "teenmuf", "teen3",
      ],
      21: ["poker", "poker20", "poker6"],
      22: ["baccarat", "baccarat2"],
      23: ["dt20", "dt202", "dt6", "dtl20"],
      24: ["card32", "card32eu"],
      26: ["ab20", "abj", "ab3", "ab4"],
      27: ["lucky7", "lucky7eu", "lucky7eu2", "lucky5", "lucky15"],
      28: ["3cardj"],
      29: ["war"],
      30: ["worli", "worli2", "worli3"],
      34: ["superover", "superover2", "superover3", "cricketv3", "cmatch20", "ballbyball"],
      32: ["btable", "btable2"],
      33: ["lottcard"],
      40: ["queen"],
      41: ["race20", "race17", "race2"],
      73: [
        "dolidana", "mogambo", "goal", "sicbo", "sicbo2",
        "cmeter", "cmeter1", "notenum", "trio", "trap", "aaa", "aaa2", "dum10",
      ],
    },
    // Uses homeData.casino_list
    games: null,
  },
  "45": {
    allCategoryId: 148,
    categories: [
      { id: 148, name: "All Casino" },
      { id: 149, name: "Teenpatti" },
    ],
    categorySlugs: {
      // teen20v1 redirection blocked — commented out for now
      // 149: ["teen20v1"],
    },
    games: [
      // teen20v1 redirection blocked — commented out for now
      // { slug: "teen20v1", name: "20-20 Teenpatti VIP1", file: "/assets/casino-icons/teen20v1_green.gif" },
    ],
  },
  "52": {
    allCategoryId: 159,
    categories: [
      { id: 159, name: "All Casino" },
      { id: 160, name: "Teenpatti" },
      { id: 161, name: "Baccarat" },
      { id: 162, name: "Dragon Tiger" },
      { id: 163, name: "Lucky 7" },
      { id: 164, name: "32 Cards" },
    ],
    categorySlugs: {
      160: ["pteen", "pteen20"],
      161: ["pbaccarat"],
      162: ["pdt20", "pdt6"],
      163: ["plucky7"],
      164: ["pcard32"],
    },
    games: [
      { slug: "pteen", name: "Premium Teenpatti", file: "/assets/casino-icons/pteen.jpg" },
      { slug: "pteen20", name: "Premium Teenpatti 20-20", file: "/assets/casino-icons/pteen20.jpg" },
      { slug: "pbaccarat", name: "Premium Baccarat", file: "/assets/casino-icons/pbaccarat.jpg" },
      { slug: "pdt20", name: "Premium Dragon Tiger 20-20", file: "/assets/casino-icons/pdt20.jpg" },
      { slug: "pdt6", name: "Premium Dragon Tiger 1-Day", file: "/assets/casino-icons/pdt6.jpg" },
      { slug: "pcard32", name: "Premium 32 Cards", file: "/assets/casino-icons/pcard32.jpg" },
      { slug: "plucky7", name: "Premium Lucky 7", file: "/assets/casino-icons/plucky7.jpg" },
    ],
  },
  "19": {
    allCategoryId: 82,
    categories: [
      { id: 82, name: "All Casino" },
      { id: 79, name: "Teenpatti" },
      { id: 80, name: "Dragon Tiger" },
      { id: 81, name: "Lucky 7" },
      { id: 91, name: "Bollywood" },
      { id: 96, name: "Others" },
    ],
    categorySlugs: {
      79: ["vteen", "vteen20", "vteenmuf"],
      80: ["vdtl20", "vdt6"],
      81: ["vlucky7"],
      91: ["vbtable"],
      96: ["vtrio", "vaaa"],
    },
    games: [
      { slug: "vlucky7", name: "Virtual Lucky 7", file: "/assets/casino-icons/vlucky7.jpg" },
      { slug: "vtrio", name: "Virtual Trio", file: "/assets/casino-icons/vtrio.jpg" },
      { slug: "vdtl20", name: "Virtual DTL 20-20", file: "/assets/casino-icons/vdtl20.jpg" },
      { slug: "vteenmuf", name: "Virtual Muflis Teenpatti", file: "/assets/casino-icons/vteenmuf.jpg" },
      { slug: "vaaa", name: "Virtual Amar Akbar Anthony", file: "/assets/casino-icons/vaaa.jpg" },
      { slug: "vbtable", name: "Virtual Bollywood Casino", file: "/assets/casino-icons/vbtable.jpg" },
      { slug: "vdt6", name: "Virtual Dragon Tiger 1-Day", file: "/assets/casino-icons/vdt6.jpg" },
      { slug: "vteen", name: "Virtual Teenpatti 1-day", file: "/assets/casino-icons/vteen.jpg" },
      { slug: "vteen20", name: "Virtual 20-20 Teenpatti", file: "/assets/casino-icons/vteen20.jpg" },
    ],
  },
};

export function getProviderData(providerId) {
  return PROVIDER_DATA[providerId] || PROVIDER_DATA["4"];
}

// Legacy exports for backward compat
export const CASINO_CATEGORIES = PROVIDER_DATA["4"].categories;
export const CATEGORY_SLUGS = PROVIDER_DATA["4"].categorySlugs;
