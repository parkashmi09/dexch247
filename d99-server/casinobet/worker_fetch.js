// workers/casinoResultWorker.js
import cron from "node-cron";
import axios from "axios";
import sequelize from "../config/db.js";
import CasinoBet from "../model/user/casino.js";
import CasinoResult from "../model/admin/CasinoResult.js";


// If you want, you can move this to env
const CASINO_RESULTS_URL =
    (process.env.CASINO_RESULTS_API_BASE || "https://apilords.codefactory.games/api") +
    (process.env.CASINO_RESULTS_ENDPOINT || "/user/casino/last-results");

const API_KEY = process.env.DIAMOND_API_KEY;

const BASE_URL =
    process.env.CASINO_RESULTS_API_BASE ||
    "https://apilords.codefactory.games/api";

const DETAIL_PATH =
    process.env.CASINO_DETAIL_RESULTS_PATH ||
    "/casino/casino/detail-results";

// Helper: safely stringify bigints / numbers for comparison
const toKey = (v) => (v == null ? "" : String(v));

async function processOpenCasinoBets() {
    console.log("[CasinoWorker] Checking open casino bets...");

    // 1️⃣ Get all open bets
    const openBets = await CasinoBet.findAll({
        where: { status: "open" },
        raw: true,
    });

    if (!openBets.length) {
        // console.log("[CasinoWorker] No open bets found.");
        return;
    }

    // 2️⃣ Group by game_name to avoid calling API repeatedly for same game
    const betsByGame = openBets.reduce((acc, bet) => {
        const gameName = bet.game_name;
        if (!gameName) return acc;

        if (!acc[gameName]) acc[gameName] = [];
        acc[gameName].push(bet);
        return acc;
    }, {});

    // 3️⃣ For each game_name, call last-results and update matching bets
    for (const [gameName, bets] of Object.entries(betsByGame)) {
        try {
            console.log(`[CasinoWorker] Fetching last results for game: ${gameName}`);

            const resp = await axios.post(`${CASINO_RESULTS_URL}?key=${API_KEY}`, {
                type: gameName, // as per your requirement
            });

            const apiData = resp.data;
            console.log(`[CasinoWorker] API response for game ${gameName}:`, apiData);

            // This is the inner "data" object that actually contains res/res1
            const innerData = apiData?.data?.data;
            console.log("innerData", innerData);

            const results = innerData?.res || [];
            console.log("results", results);
            console.log(
                `[CasinoWorker] Retrieved ${results.length} results for game: ${gameName}`
            );
            for (const item of results) {
                try {
                    // 🔹 Call detail API for each mid
                    const winnatresponse = await axios.post(
                        `${BASE_URL}${DETAIL_PATH}?key=${API_KEY}`,
                        {
                            type: gameName,
                            mid: item.mid,
                        }
                    );

                    const t1 = winnatresponse?.data?.data?.data?.t1;

                    if (!t1 || t1.winnat == null) {
                        console.warn(
                            `[CasinoWorker] No winnat yet for game=${gameName}, mid=${item.mid}`
                        );
                        continue; // retry next cycle
                    }

                    const winnat = t1.winnat;

                    // 🔹 Upsert result (insert or update win)
                    await CasinoResult.upsert({
                        gamename: gameName,
                        mid: String(item.mid),
                        win: winnat,
                        date: new Date(),
                    });

                    console.log(
                        `[CasinoWorker] Stored winnat=${winnat} for game=${gameName}, mid=${item.mid}`
                    );

                } catch (err) {
                    console.error(
                        `[CasinoWorker] Failed processing mid=${item.mid} game=${gameName}:`,
                        err.message
                    );
                }
            }


            if (!Array.isArray(results) || !results.length) {
                console.log(
                    `[CasinoWorker] No results returned for game: ${gameName}`
                );
                continue;
            }

            // Build a set of mids from API for fast matching
            const midsSet = new Set(results.map((r) => toKey(r.mid)));

            // Find bets where event_id matches any mid
            const matchingBetIds = bets
                .filter((bet) => midsSet.has(toKey(bet.event_id)))
                .map((bet) => bet.id);

            if (!matchingBetIds.length) {
                console.log(
                    `[CasinoWorker] No matching event_id found for game: ${gameName}`
                );
                continue;
            }

            // 4️⃣ Update those bets to status = 'processing'
            const [updatedCount] = await CasinoBet.update(
                { status: "processing" },
                {
                    where: {
                        id: matchingBetIds,
                        status: "open", // extra safety: only open → processing
                    },
                }
            );

            console.log(
                `[CasinoWorker] Updated ${updatedCount} bet(s) to 'processing' for game: ${gameName}`
            );
        } catch (err) {
            console.error(
                `[CasinoWorker] Error processing game: ${gameName}`,
                err.message
            );
        }
    }
}

// 5️⃣ Schedule: run every 1 minute seconds
// cron.schedule("*/1 * * * *", async () => {
//     try {
//         // Ensure DB is alive before running
//         await sequelize.authenticate();
//         await processOpenCasinoBets();
//     } catch (err) {
//         console.error("[CasinoWorker] Error in scheduled job:", err.message);
//     }
// });
const INTERVAL = 2 * 1000; // 25 seconds

let running = false;

setInterval(async () => {
    if (running) return; // prevent overlap
    running = true;

    try {
        await sequelize.authenticate();
        await processOpenCasinoBets();
    } catch (err) {
        console.error("[CasinoWorker] Error in scheduled job:", err.message);
    } finally {
        running = false;
    }
}, INTERVAL);

console.log("[CasinoWorker] Worker started. Running every 5 seconds...");
