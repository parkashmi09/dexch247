export const CASINO_GAME_IDS = {
  TEEN6: "teen6",
  WORLI: "worli",
  WORLI2: "worli2",
  WORLI3: "worli3",
  TEEN62: "teen62",
  DOLIDANA: "dolidana",
  MOGAMBO: "mogambo",
  LUCKY5: "lucky5",
  POISON: "poison",
  POISON20: "poison20",
  JOKER20: "joker20",
  JOKER1: "joker1",
  TEEN20C: "teen20c",
  BTABLE2: "btable2",
  OURROULLETE: "ourroullete",
  SUPEROVER3: "superover3",
  SUPEROVER2: "superover2",
  GOAL: "goal",
  AB3: "ab3",
  AB4: "ab4",
  AB20: "ab20",
  LUCKY15: "lucky15",
  TEEN41: "teen41",
  TEEN42: "teen42",
  SICBO2: "sicbo2",
  SICBO: "sicbo",
  TEEN33: "teen33",
  TEEN: "teen",
  TEEN20: "teen20",
  TEEN9: "teen9",
  TEEN8: "teen8",
  POKER: "poker",
  POKER20: "poker20",
  POKER6: "poker6",
  BACCARAT: "baccarat",
  BACCARAT2: "baccarat2",
  DT20: "dt20",
  DT202: "dt202",
  DT6: "dt6",
  DTL20: "dtl20",
  SUPEROVER: "superover",
  TEENUNIQUE: "teenunique",
  ROULETTE11: "roulette11",
  ROULETTE12: "roulette12",
  ROULETTE13: "roulette13",
  CARD32: "card32",
  CARD32EU: "card32eu",
  ABJ: "abj",
  LUCKY7: "lucky7",
  LUCKY7EU: "lucky7eu",
  LUCKY7EU2: "lucky7eu2",
  THREECARDJ: "3cardj",
  WAR: "war",
  AAA: "aaa",
  AAA2: "aaa2",
  BTABLE: "btable",
  LOTTCARD: "lottcard",
  CRICKETV3: "cricketv3",
  CMATCH20: "cmatch20",
  CMETER: "cmeter",
  QUEEN: "queen",
  RACE20: "race20",
  RACE17: "race17",
  TRAP: "trap",
  PATTI2: "patti2",
  TEENSIN: "teensin",
  TEENMUF: "teenmuf",
  TEEN20B: "teen20b",
  TRIO: "trio",
  NOTENUM: "notenum",
  TEEN120: "teen120",
  TEEN1: "teen1",
  RACE2: "race2",
  TEEN3: "teen3",
  DUM10: "dum10",
  CMETER1: "cmeter1",
  TEEN32: "teen32",
  BALLBYBALL: "ballbyball",
};

// teen120: win=1→P(result-a), win=2→D(result-b), win=3→T
export function formatTeen120Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "P" : win === "2" ? "D" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// teen1: win=1→P(result-a), win=2→D(result-b), win=3→T
export function formatTeen1Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "P" : win === "2" ? "D" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// teen3: win=1→A(result-a), win=2→B(result-b)
export function formatTeen3Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// race2: win=1→A, win=2→B, win=3→C, win=4→D — all use result-b
export function formatRace2Result(r) {
  const win = String(r.win);
  const labels = { "1": "A", "2": "B", "3": "C", "4": "D" };
  return {
    label: labels[win] || win,
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// notenum: always show "R" with result-b
export function formatNotenumResult(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// trio: always show "R" with result-b
export function formatTrioResult(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// teen6: win=1 → A, win=2 → B
export function formatTeen6Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "result-c",
  };
}

// teen62: win=1 → A, win=2 → B
export function formatTeen62Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "result-c",
  };
}

// poison: win=1 → A (Player A), win=2 → B (Player B), win=3 → T (Tie)
export function formatPoisonResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// lucky7: win=1 → L (Low Card), win=2 → H (High Card), win=0 → T (Tie/7)
export function formatLucky7Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "L" : win === "2" ? "H" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// lucky5: win=1 → L (Low Card), win=2 → H (High Card), win=0 → T (Tie)
export function formatLucky5Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "L" : win === "2" ? "H" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// card32: win=1 → Player 8, win=2 → Player 9, win=3 → Player 10, win=4 → Player 11
export function formatCard32Result(r) {
  const win = String(r.win);
  const labels = { "1": "8", "2": "9", "3": "10", "4": "11" };
  return {
    label: labels[win] || win,
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// mogambo: win=1 → W (Mogambo wins), win=2 → L (Daga/Teja wins)
export function formatMogamboResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "W" : "L",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-b" : "result-a",
  };
}

// worli: show "R" with result-b
export function formatWorliResult(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// aaa: win=1 → A (Amar), win=2 → B (Akbar), win=3 → C (Anthony)
export function formatAAAResult(r) {
  const win = String(r.win || "").toUpperCase();
  let label = win;
  let type = "result-b";
  if (win === "1" || win.includes("AMAR")) { label = "A"; type = "result-a"; }
  else if (win === "2" || win.includes("AKBAR")) { label = "B"; type = "result-b"; }
  else if (win === "3" || win.includes("ANTHONY")) { label = "C"; type = "result-c"; }
  else if (win === "A") { type = "result-a"; }
  else if (win === "B") { type = "result-b"; }
  else if (win === "C") { type = "result-c"; }
  return { label: label || "R", mid: r.mid != null ? String(r.mid) : "", win: r.win || "", type };
}

// aaa2: win=1 → A (Amar), win=2 → B (Akbar), win=3 → C (Anthony)
export function formatAAA2Result(r) {
  const win = String(r.win || "").toUpperCase();
  let label = win;
  let type = "result-b";
  if (win === "1" || win.includes("AMAR")) { label = "A"; type = "result-a"; }
  else if (win === "2" || win.includes("AKBAR")) { label = "B"; type = "result-b"; }
  else if (win === "3" || win.includes("ANTHONY")) { label = "C"; type = "result-c"; }
  else if (win === "A") { type = "result-a"; }
  else if (win === "B") { type = "result-b"; }
  else if (win === "C") { type = "result-c"; }
  return { label: label || "R", mid: r.mid != null ? String(r.mid) : "", win: r.win || "", type };
}

// btable: win=1→A (Don), win=2→B (Amar Akbar Anthony), win=3→C (Sahib Bibi Aur Ghulam), win=4→D (Dharam Veer), win=5→E (Kis Kis Ko Pyaar Karoon), win=6→F (Ghulam)
export function formatBtableResult(r) {
  const win = String(r.win || "");
  const labels = { "1": "A", "2": "B", "3": "C", "4": "D", "5": "E", "6": "F" };
  return {
    label: labels[win] || win || "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// war: win is comma-separated player numbers e.g. "1,3,5" — show "R" with result-b
export function formatWarResult(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// abj: win=1 → A (Andar), win=2 → B (Bahar)
export function formatABJResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// ab3: always show "R" with result-b
export function formatAB3Result(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// race20: win=1→spade, win=2→heart, win=3→club, win=4→diamond
export function formatRace20Result(r) {
  const win = String(r.win);
  const suitMap = { "1": "spade", "2": "heart", "3": "club", "4": "diamond" };
  return {
    suit: suitMap[win] || "",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
  };
}

// queen: win is 0/1/2/3 — show as-is with result-b
export function formatQueenResult(r) {
  return {
    label: String(r.win || ""),
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// race17: win=1 → Y (Yes), win=2 → N (No)
export function formatRace17Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "Y" : "N",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win != null ? String(r.win) : "",
    type: win === "1" ? "result-b" : "result-a",
  };
}

// trap: win=1 → A (Player A), win=2 → B (Player B)
export function formatTrapResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : win,
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// patti2: win=1 → A (Player A), win=2 → B (Player B)
export function formatPatti2Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "result-c",
  };
}

// teenmuf (Muflis Teenpatti): win=1 → A (Player A), win=2 → B (Player B)
export function formatTeenmufResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "result-c",
  };
}

// teensin (29Card Baccarat): win=1 → A (Player A), win=2 → B (Player B)
export function formatTeensinResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "result-c",
  };
}

// teen20b: win=1 → A (Player A), win=2 → B (Player B)
export function formatTeen20bResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "result-c",
  };
}

// cmeter: win=1 → L (Low), win=2 → H (High)
export function formatCmeterResult(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "L" : win === "2" ? "H" : win,
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// cmeter1: win=1→A(result-a), win=2→B(result-b), win=3→T(result-c)
export function formatCmeter1Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "A" : win === "2" ? "B" : "T",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "result-c",
  };
}

// dum10: win=1→Y(result-a), win=2→N(result-b)
export function formatDum10Result(r) {
  const win = String(r.win);
  return {
    label: win === "1" ? "Y" : win === "2" ? "N" : win,
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: win === "1" ? "result-a" : win === "2" ? "result-b" : "",
  };
}

// ballbyball: always show "R" with result-b
export function formatBallByBallResult(r) {
  return {
    label: "R",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
    type: "result-b",
  };
}

// cmatch20: win is a ball number (2-10)
export function formatCmatch20Result(r) {
  return {
    ballNum: r.win || "",
    mid: r.mid != null ? String(r.mid) : "",
    win: r.win || "",
  };
}

// All casino types for dropdown select
export const CASINO_TYPES = [
  { value: "teen", label: "Teenpatti 1-day" },
  { value: "poker", label: "Poker 1-Day" },
  { value: "3cardj", label: "3 Cards Judgement" },
  { value: "aaa", label: "Amar Akbar Anthony" },
  { value: "ab20", label: "Andar Bahar" },
  { value: "abj", label: "Andar Bahar 2" },
  { value: "baccarat", label: "Baccarat" },
  { value: "baccarat2", label: "Baccarat 2" },
  { value: "btable", label: "Bollywood Casino" },
  { value: "card32", label: "32 Cards A" },
  { value: "card32eu", label: "32 Cards B" },
  { value: "cmatch20", label: "Cricket Match 20-20" },
  { value: "cmeter", label: "Casino Meter" },
  { value: "dt20", label: "20-20 Dragon Tiger" },
  { value: "dt202", label: "20-20 Dragon Tiger 2" },
  { value: "dt6", label: "1 Day Dragon Tiger" },
  { value: "dtl20", label: "20-20 D T L" },
  { value: "lucky7", label: "Lucky 7 - A" },
  { value: "lucky7eu", label: "Lucky 7 - B" },
  { value: "lucky7eu2", label: "Lucky 7 - C" },
  { value: "poker20", label: "20-20 Poker" },
  { value: "poker6", label: "Poker 6 Players" },
  { value: "teen20", label: "20-20 Teenpatti" },
  { value: "teen8", label: "Teenpatti Open" },
  { value: "teen9", label: "Teenpatti Test" },
  { value: "war", label: "Casino War" },
  { value: "worli", label: "Worli Matka" },
  { value: "worli2", label: "Instant Worli" },
  { value: "worli3", label: "Matka Market" },
  { value: "teen6", label: "Teenpatti - 2.0" },
  { value: "teen62", label: "V VIP Teenpatti 1-day" },
  { value: "queen", label: "Queen" },
  { value: "race20", label: "Race20" },
  { value: "trap", label: "The Trap" },
  { value: "patti2", label: "2 Cards Teenpatti" },
  { value: "teensin", label: "29Card Baccarat" },
  { value: "teenmuf", label: "Muflis Teenpatti" },
  { value: "race17", label: "Race to 17" },
  { value: "trio", label: "Trio" },
  { value: "notenum", label: "Note Number" },
  { value: "teen120", label: "1 CARD 20-20" },
  { value: "teen1", label: "1 CARD ONE-DAY" },
  { value: "ab3", label: "ANDAR BAHAR 50 CARDS" },
  { value: "aaa2", label: "Amar Akbar Anthony 2" },
  { value: "race2", label: "Race to 2nd" },
  { value: "teen3", label: "Instant Teenpatti" },
  { value: "cmeter1", label: "1 Card Meter" },
  { value: "sicbo", label: "Sic Bo" },
  { value: "ballbyball", label: "Ball By Ball" },
  { value: "sicbo2", label: "Sic Bo 2" },
  { value: "teen41", label: "Queen top open teenpatti" },
  { value: "lucky15", label: "Lucky 15" },
  { value: "goal", label: "Goal" },
  { value: "ab4", label: "ANDAR BAHAR 150 CARDS" },
  { value: "ab20", label: "Andar Bahar" },
  { value: "superover", label: "Super Over" },
  { value: "superover3", label: "Mini Super Over" },
  { value: "ourroullete", label: "Unique Roulette" },
  { value: "mogambo", label: "Mogambo" },
  { value: "dolidana", label: "Dolidana" },
  { value: "lucky5", label: "Lucky 6" },
  { value: "teenunique", label: "Unique Teenpatti" },
  { value: "joker1", label: "Unlimited Joker One Day" },
  { value: "joker120", label: "Unlimited Joker 20-20" },
  { value: "poison", label: "Teenpatti Poison One Day" },
  { value: "poison20", label: "Teenpatti Poison 20-20" },
  { value: "lottcard", label: "Lottery" },
  { value: "cricketv3", label: "Five Five Cricket" },
];

// Map raw win value to human-readable label based on game type
export function mapWinValue(win, type) {
  if (win === null || win === undefined) return "-";
  const v = String(win);
  switch (type) {
    case "teen62": case "teen": case "teen8": case "teen3":
      return v === "1" ? "Player A" : v === "2" ? "Player B" : v === "0" ? "Tie" : v;
    case "mogambo":
      return v === "1" ? "Mogambo" : v === "2" ? "Daga/Teja" : v;
    case "dolidana": return "R";
    case "dt6": case "dt20": case "dt202":
      return v === "1" ? "Dragon" : v === "2" ? "Tiger" : v === "3" ? "Tie" : v;
    case "dtl20":
      return v === "1" ? "Dragon" : v === "21" ? "Tiger" : v === "41" ? "Lion" : v;
    case "baccarat": case "baccarat2":
      return v === "1" ? "Player" : v === "2" ? "Banker" : v === "3" ? "Tie" : v;
    case "lucky7": case "lucky7eu": case "lucky7eu2":
      return v === "1" ? "Low" : v === "2" ? "High" : v === "0" ? "Tie" : v;
    case "aaa": case "aaa2":
      return v === "1" ? "Amar" : v === "2" ? "Akbar" : v === "3" ? "Anthony" : v;
    case "card32": case "card32eu":
      return v === "1" ? "Player 8" : v === "2" ? "Player 9" : v === "3" ? "Player 10" : v === "4" ? "Player 11" : v;
    case "teen1": case "teen120":
      return v === "1" ? "Player" : v === "2" ? "Dealer" : v === "3" ? "Tie" : v;
    case "poker": case "poker20": case "ab3": case "poison": case "poison20":
    case "teenjoker": case "joker1": case "joker20": case "joker120": case "patti2": case "trap":
      return v === "1" ? "Player A" : v === "2" ? "Player B" : v === "3" ? "Tie" : v;
    case "teen20": case "teen20c": case "teen3": case "teen32": case "teen33":
    case "teen41": case "teen42":
      return v === "1" ? "Low Card" : v === "2" ? "High Card" : v === "0" ? "Tie" : v;
    case "lucky5":
      return v === "1" ? "Low Card" : v === "2" ? "High Card" : v;
    case "teen9":
      return v === "1" ? "Tiger" : v === "2" ? "Lion" : v === "3" ? "Dragon" : v;
    case "teensin": case "teen6": case "teen20b": case "teenmuf":
      return v === "1" ? "Player A" : v === "2" ? "Player B" : v === "3" ? "Tie" : v;
    case "race17": case "dum10":
      return v === "1" ? "Yes" : v === "2" ? "No" : v;
    case "race2":
      return v === "1" ? "Player A" : v === "2" ? "Player B" : v === "3" ? "Player C" : v === "4" ? "Player D" : v;
    case "superover": case "superover2": case "superover3": case "cricketv3":
      return v === "1" ? "IND" : v === "2" ? "AUS" : v === "0" ? "TIE" : v;
    case "btable": case "btable2":
      return v === "1" ? "Don" : v === "2" ? "Amar Akbar Anthony" : v === "3" ? "Sahib Bibi Aur Ghulam" : v === "4" ? "Dharam Veer" : v === "5" ? "Kis Kis Ko Pyaar Karoon" : v === "6" ? "Ghulam" : v;
    case "cmatch20": return v;
    case "queen": return v;
    case "cmeter": return v === "1" ? "Low" : v === "2" ? "High" : v;
    case "cmeter1": return v === "1" ? "Fighter A" : v === "2" ? "Fighter B" : v === "3" ? "Tie" : v;
    case "race20": return v === "1" ? "Spade" : v === "2" ? "Heart" : v === "3" ? "Club" : v === "4" ? "Diamond" : v;
    case "notenum": case "trio": return "Win";
    case "worli": case "worli2": case "worli3": return v;
    default: return v || "-";
  }
}
