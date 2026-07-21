// Provider tabs for the Slot list page
export const SLOT_PROVIDER_TABS = [
  { id: "65", name: "Amigo" },
  { id: "64", name: "Jili" },
  { id: "63", name: "Turbo Games" },
  { id: "24", name: "Red Tiger" },
  { id: "1",  name: "1X2 Gaming" },
  { id: "3",  name: "BB Games" },
  { id: "4",  name: "Booongo" },
  { id: "58", name: "Dragoon Soft" },
  { id: "61", name: "Pocket Game" },
  { id: "8",  name: "Evoplay" },
  { id: "9",  name: "Fantasma Games" },
  { id: "11", name: "Habanero" },
  { id: "12", name: "Hacksaw Gaming" },
  { id: "13", name: "Iron Dog Studio" },
  { id: "14", name: "Kalamba Games" },
  { id: "15", name: "Lady Luck" },
  { id: "17", name: "Nolimit city" },
  { id: "18", name: "OMI Gaming" },
  { id: "19", name: "OneTouch" },
  { id: "21", name: "PlayPearls" },
  { id: "22", name: "Push Gaming" },
  { id: "23", name: "Quickspin" },
  { id: "26", name: "Relax Gaming" },
  { id: "27", name: "RTG Slots" },
  { id: "28", name: "Spearhead Studios" },
  { id: "29", name: "Slotmill" },
  { id: "30", name: "Splitrock Gaming" },
  { id: "31", name: "Thunderkick" },
  { id: "32", name: "Woohoo Games" },
  { id: "33", name: "Yggdrasil" },
  { id: "52", name: "Virtual Games" },
  { id: "67", name: "EXA" },
  { id: "99", name: "Kingmidas" },
  { id: "66", name: "EGT" },
];

export const DEFAULT_SLOT_PROVIDER_ID = "65";
export const DEFAULT_SLOT_CATEGORY_ID = "177";

// Sub-categories per provider
export const SLOT_CATEGORIES = {
  "65": [{ id: "177", name: "New Slots" }],
};

// Static game images per provider → category
export const SLOT_GAMES = {
  "65": {
    "177": [
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_1stcricketleague@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_olympusrivals@amigo.gif",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_cubeguys@amigo.gif",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_diceinvaders@amigo.gif",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_triplechili@amigo.gif",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_3fortunesouls@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_3tombs@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_fortunebags@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_3spiritvolcanoes@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_moongirls@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_5fruitinvaders@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_fortunebros@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_fruitinvaders@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_blazingcrowndeluxe@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_fruitsandcoins@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_regalcrown100@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_9circlesofhell@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_alexandersfortune@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_alibabasbounty@amigo.jpg",
      "https://sitethemedata.com/casino_icons/slot/amigo/amigo_americanspirit@amigo.jpg",
    ],
  },
};

export function getSlotCategories(providerId) {
  return SLOT_CATEGORIES[providerId] || [];
}

export function getSlotGames(providerId, categoryId) {
  const providerGames = SLOT_GAMES[providerId];
  if (!providerGames) return [];
  return providerGames[categoryId] || [];
}
