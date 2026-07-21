export const FANTASY_PROVIDER_TABS = [
  { key: "0", name: "popok" },
  { key: "1", name: "pascal" },
  { key: "2", name: "smart" },
  { key: "3", name: "our" },
  { key: "4", name: "spribe" },
  { key: "5", name: "scratch" },
  { key: "6", name: "darwin" },
  { key: "7", name: "gemini" },
  { key: "8", name: "studio21" },
  { key: "9", name: "beon" },
  { key: "10", name: "jacktop" },
  { key: "11", name: "Kingmidas" },
];

export const POPOK_GAMES = [
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000397.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/555570411.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500043444.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/555558820.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420033108.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500009794.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420014051.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420033385.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/426634405.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000203.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420032901.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500001017.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/400041201.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/426639563.gif",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000674.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420040138.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/141420.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420015422.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/426634714.jpg",
  "https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500010297.jpg",
];

export function getFantasyGames(key) {
  if (key === "0") return POPOK_GAMES;
  return [];
}
