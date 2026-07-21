#!/usr/bin/env node
/**
 * Casino Bet & Exposure Test Script
 *
 * Usage: node scripts/test-casino-bets.mjs [gameType]
 *
 * Tests:
 * 1. Waits for an open round (lt > 5)
 * 2. Places a 10-amount back bet on the first OPEN item
 * 3. Checks exposure mapping
 * 4. Reports results
 *
 * Requires: CASINO_API_BASE and TEST_USER_ID env vars, or uses defaults.
 */

const API_BASE = process.env.CASINO_API_BASE || "https://apidiamond99.codefactory.games/api";
const TEST_USER_ID = process.env.TEST_USER_ID || "";
const TEST_TOKEN = process.env.TEST_TOKEN || "";
const BET_AMOUNT = 10;

const GAME_CONFIGS = {
  poison:     { name: "Teenpatti Poison One Day", subType: "array", natField: "nat" },
  poison20:   { name: "Teenpatti Poison 20-20",   subType: "array", natField: "nat" },
  joker20:    { name: "Teenpatti Joker 20-20",   subType: "array", natField: "nat" },
  joker1:     { name: "Unlimited Joker Oneday",  subType: "array", natField: "nat" },
  teen20c:    { name: "20-20 Teenpatti C",       subType: "array", natField: "nat" },
  btable2:    { name: "Bollywood Casino 2",     subType: "array", natField: "nat" },
  teen41:     { name: "Queen Top Open Teenpatti", subType: "array", natField: "nat" },
  teen42:     { name: "Jack Top Open Teenpatti", subType: "array", natField: "nat" },
  sicbo2:     { name: "Sic Bo 2",              subType: "array", natField: "nat" },
  lucky15:    { name: "Lucky 15",               subType: "array", natField: "nat" },
  goal:       { name: "Goal",                   subType: "array", natField: "nat" },
  ourroullete: { name: "Unique Roulette",      subType: "roulette", natField: "n" },
  lucky5:     { name: "Lucky 6",                  subType: "array", natField: "nat" },
  teen6:      { name: "Teenpatti - 2.0",             subType: "array", natField: "nat" },
  teen62:     { name: "V VIP Teenpatti 1-day",     subType: "array", natField: "nat" },
  mogambo:    { name: "Mogambo",                   subType: "array", natField: "nat" },
  dolidana:   { name: "Dolidana",                  subType: "array", natField: "nat" },
  teenunique: { name: "Unique Teenpatti",          subType: "array", natField: "nat" },
  roulette11: { name: "Golden Roulette",           subType: "roulette", natField: "n" },
  roulette12: { name: "Beach Roulette",            subType: "roulette", natField: "n" },
  roulette13: { name: "Roulette",                  subType: "roulette", natField: "n" },
  teen:       { name: "Teenpatti 1-day",              subType: "array", natField: "nat" },
  teen9:      { name: "Teenpatti Test",                subType: "array", natField: "nat" },
  teen8:      { name: "Teenpatti Open",                subType: "array", natField: "nat" },
  teen33:     { name: "Teenpatti 33",                  subType: "array", natField: "nat" },
  poker:      { name: "Poker 1-Day",                   subType: "array", natField: "nat" },
  poker20:    { name: "20-20 Poker",                    subType: "array", natField: "nat" },
  poker6:     { name: "Poker 6 Players",                subType: "array", natField: "nat" },
  baccarat:   { name: "Baccarat",                       subType: "array", natField: "nat" },
  baccarat2:  { name: "Baccarat 2",                     subType: "array", natField: "nat" },
  dt20:       { name: "20-20 Dragon Tiger",               subType: "array", natField: "nat" },
  dt202:      { name: "20-20 Dragon Tiger 2",             subType: "array", natField: "nat" },
  lottcard:   { name: "Lottery",                           subType: "array", natField: "nat" },
  cricketv3:  { name: "Five Five Cricket",                 subType: "array", natField: "nat" },
  cmatch20:   { name: "Cricket Match 20-20",               subType: "array", natField: "nat" },
  cmeter:     { name: "Casino Meter",                      subType: "array", natField: "nat" },
  queen:      { name: "Queen",                             subType: "array", natField: "nat" },
  race20:     { name: "Race 20",                           subType: "array", natField: "nat" },
  trap:       { name: "The Trap",                          subType: "array", natField: "nat" },
  patti2:     { name: "2 Cards Teenpatti",                 subType: "array", natField: "nat" },
  teensin:    { name: "29Card Baccarat",                   subType: "array", natField: "nat" },
  teenmuf:    { name: "Muflis Teenpatti",                  subType: "array", natField: "nat" },
  teen20b:    { name: "20-20 Teenpatti B",                 subType: "array", natField: "nat" },
  trio:       { name: "Trio",                              subType: "array", natField: "nat" },
  notenum:    { name: "Note Number",                       subType: "array", natField: "nat" },
  teen120:    { name: "1 CARD 20-20",                      subType: "array", natField: "nat" },
  teen1:      { name: "1 CARD ONE-DAY",                    subType: "array", natField: "nat" },
  ab3:        { name: "ANDAR BAHAR 50 CARDS",              subType: "array", natField: "nat" },
  aaa2:       { name: "Amar Akbar Anthony 2",              subType: "array", natField: "nat" },
  race2:      { name: "Race to 2nd",                       subType: "array", natField: "nat" },
  teen3:      { name: "Instant Teenpatti",                  subType: "array", natField: "nat" },
  dum10:      { name: "Dus ka Dum",                        subType: "array", natField: "nat" },
  race17:     { name: "Race to 17",                        subType: "array", natField: "nat" },
  cmeter1:    { name: "1 Card Meter",                      subType: "array", natField: "nat" },
  ballbyball: { name: "Ball By Ball",                      subType: "array", natField: "nat" },
};

async function post(url, body) {
  const headers = { "Content-Type": "application/json" };
  if (TEST_TOKEN) headers["Authorization"] = `Bearer ${TEST_TOKEN}`;
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

async function getGameData(gameType) {
  const res = await post("/casino/casino/all-data", { type: gameType, data: {} });
  return res?.data?.data || res?.data || null;
}

async function placeBet(payload) {
  return post("/casino/casino/placebet", payload);
}

async function getExposure(userId, matchId) {
  return post("/user/exposures/get-exposure", { user_id: userId, match_id: matchId });
}

async function getLastResults(gameType) {
  const res = await post("/casino/casino/last-results", { type: gameType });
  return res?.data?.data?.res || res?.data?.res || [];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForOpenRound(gameType, maxWait = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const data = await getGameData(gameType);
    if (!data) { await sleep(1000); continue; }

    const lt = data.lt || 0;
    if (lt > 5) {
      const config = GAME_CONFIGS[gameType];
      const sub = data.sub || [];

      let openItems;
      if (config.subType === "roulette") {
        // Roulette: sub items have {i, n, b, l, s}
        openItems = sub.filter((s) => s.b > 0 && s.s === 1).map((s) => ({
          nat: s.n || String(s.i),
          b: s.b,
          l: s.l || 0,
          sid: s.i,
          gstatus: "OPEN",
        }));
      } else {
        openItems = sub.filter((s) => s.gstatus === "OPEN" && s.b > 0);
      }

      if (openItems.length > 0) {
        return { data, openItems, mid: data.mid, lt };
      }
    }
    await sleep(1000);
  }
  return null;
}

async function testGame(gameType) {
  const config = GAME_CONFIGS[gameType];
  if (!config) {
    console.log(`  ❌ Unknown game type: ${gameType}`);
    return false;
  }

  console.log(`\n🎮 Testing ${config.name} (${gameType})...`);

  // Step 1: Wait for open round
  console.log("  ⏳ Waiting for open round...");
  const round = await waitForOpenRound(gameType);
  if (!round) {
    console.log("  ⚠️  Timed out waiting for open round. Skipping.");
    return false;
  }

  console.log(`  ✅ Round ${round.mid} open (lt=${round.lt}), ${round.openItems.length} open items`);

  // Step 2: Pick first open item
  const target = round.openItems[0];
  console.log(`  🎯 Target: "${target.nat}" odds=${target.b}`);

  if (!TEST_USER_ID) {
    console.log("  ⚠️  No TEST_USER_ID set. Skipping bet placement.");
    console.log(`  📋 Would place: back bet, amount=${BET_AMOUNT}, odds=${target.b}, selection="${target.nat}"`);
    return true;
  }

  // Step 3: Place bet
  const mtype = config.subType === "roulette" ? "match" : (target.etype || "fancy").toLowerCase();
  const payload = {
    userId: TEST_USER_ID,
    player_name: target.nat,
    gameId: String(round.mid),
    gameName: gameType,
    gtype: gameType,
    amount: BET_AMOUNT,
    odds: target.b,
    selection: target.nat,
    roundId: round.mid,
    mtype: mtype === "fancy1" ? "fancy" : mtype,
    type: "back",
  };

  console.log("  📤 Placing bet...");
  const betResult = await placeBet(payload);

  if (betResult?.success || betResult?.status === 200) {
    console.log("  ✅ Bet placed successfully!");
  } else {
    console.log(`  ❌ Bet failed: ${betResult?.error || betResult?.msg || JSON.stringify(betResult)}`);
    return false;
  }

  // Step 4: Check exposure
  await sleep(1500);
  console.log("  📊 Checking exposure...");
  const expResult = await getExposure(TEST_USER_ID, String(round.mid));

  if (expResult?.success && expResult?.data?.length > 0) {
    console.log("  ✅ Exposure data received:");
    expResult.data.forEach((e) => {
      const amt = parseFloat(e.exposure_amount) || 0;
      const color = amt >= 0 ? "🟢" : "🔴";
      console.log(`     ${color} ${e.team_name}: ${amt}`);
    });
  } else {
    console.log("  ⚠️  No exposure data returned");
  }

  // Step 5: Check last results
  const results = await getLastResults(gameType);
  console.log(`  📋 Last results: ${results.length} entries`);

  return true;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const games = args.length > 0 ? args : Object.keys(GAME_CONFIGS);

  console.log("🏁 Casino Bet & Exposure Test");
  console.log(`   API: ${API_BASE}`);
  console.log(`   User: ${TEST_USER_ID || "(dry run - set TEST_USER_ID to place bets)"}`);
  console.log(`   Games: ${games.join(", ")}`);
  console.log("─".repeat(60));

  const results = {};
  for (const game of games) {
    results[game] = await testGame(game);
  }

  console.log("\n" + "─".repeat(60));
  console.log("📊 Summary:");
  for (const [game, ok] of Object.entries(results)) {
    console.log(`   ${ok ? "✅" : "❌"} ${game}`);
  }
}

main().catch(console.error);
