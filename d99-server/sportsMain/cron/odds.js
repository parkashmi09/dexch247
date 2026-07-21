import { sidArray } from "../config/sid.js";
import redisClient from "../../config/redisClient.js";
import { fetchSportsData } from "../helper/apihelper.js";

const INTERVAL_SECONDS = 2;
const REDIS_TTL = 3;

let isRunning = false;

const runAllEventsCron = async () => {
    if (isRunning) return;
    const startTime = Date.now();
    isRunning = true;
    try {
        const activeSports = sidArray.filter((sport) => sport.active);
        const getMatchesPromises = activeSports.map(async (sport) => {
            const sportId = sport.eid;
            try {
                const cachedMatches = await redisClient.get(`alleventss:${sportId}`);
                if (!cachedMatches) return { sportId, matches: [] };
                const matches = JSON.parse(cachedMatches);
                const gmids = [
                    ...new Set(
                        matches
                            .filter((match) => match && match.gmid) // remove null & invalid
                            .map((match) => match.gmid)
                    ),
                ];

                return { sportId, gmids };
            } catch (err) {
                console.error(`❌ Redis get failed for sport ${sportId}:`, err.message);
                return { sportId, gmids: [] };
            }
        });

        const sportsWithGmids = await Promise.all(getMatchesPromises);
        const allOddsPromises = [];
        sportsWithGmids.forEach(({ sportId, gmids }) => {
            if (!gmids || gmids.length === 0) return;
            gmids.forEach((gmid) => {
                const promise = (async () => {
                    const endpoint = `/gamedataPrivate?etid=${sportId}&gmid=${gmid}`;
                    try {
                        const response = await fetchSportsData(endpoint);
                        const oddsData = response?.data || {};

                        if (Array.isArray(oddsData) && oddsData.length > 0) {
                            await redisClient.setex(
                                `oddss:${gmid}`,
                                REDIS_TTL,
                                JSON.stringify(oddsData)
                            );
                            return { sportId, gmid, success: true, hasData: true };
                        }
                        return { sportId, gmid, success: true, hasData: false };
                    } catch (err) {
                        console.error(
                            `❌ Odds API failed for ${sportId}:${gmid}:`,
                            err.message
                        );
                        return { sportId, gmid, success: false, error: err.message };
                    }
                })();

                allOddsPromises.push(promise);
            });
        });
        // Wait for all odds API calls to complete
        const oddsResults = await Promise.allSettled(allOddsPromises);
        // Count results
        const totalGmids = allOddsPromises.length;
        const successful = oddsResults.filter(
            (r) => r.status === "fulfilled" && r.value.success
        );
        const withData = oddsResults.filter(
            (r) => r.status === "fulfilled" && r.value.success && r.value.hasData
        );
        const failed = oddsResults.filter(
            (r) => r.status === "rejected" || !r.value?.success
        );
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        console.log(
            `⚡ ${totalGmids} matches processed in ${processingTime}ms | ` +
            `✅ ${successful.length} success (${withData.length} with odds) | ` +
            `❌ ${failed.length} failed`
        );

        if (processingTime > 1800) {
            console.warn(
                `⚠️ Processing took ${processingTime}ms - slower than 1.8 second interval!`
            );
        }
    } catch (err) {
        console.error("❌ Cron error:", err.message);
    } finally {
        isRunning = false;
    }
};

// Run immediately
runAllEventsCron();

// Run every second
setInterval(runAllEventsCron, INTERVAL_SECONDS * 1000);