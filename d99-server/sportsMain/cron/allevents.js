import { sidArray } from "../config/sid.js";
import redisClient from "../../config/redisClient.js";
import { fetchSportsData } from "../helper/apihelper.js";

const INTERVAL_MINUTES = 1;
const REDIS_TTL = 60 * 60 * 3;
const DELAY_BETWEEN_SPORTS = 1000;

let isRunning = false;

const normalizeEvents = (data) => {
    // Case 1: API already gives t1 / t2
    if (data && typeof data === "object" && !Array.isArray(data)) {
        return {
            t1: Array.isArray(data.t1) ? data.t1 : [],
            t2: Array.isArray(data.t2) ? data.t2 : [],
            t3: Array.isArray(data.t3) ? data.t3 : [],
        };
    }

    // Case 2: Old flat array → split manually
    if (Array.isArray(data)) {
        return {
            t1: data.filter(
                (e) => e?.status === "OPEN" && e?.gscode === 1
            ),
            t2: data.filter(
                (e) => e?.status === "SUSPENDED" || e?.gscode === 0
            ),
            t3: data.filter(
                (e) => e?.status === "SUSPENDED" || e?.gscode === 0
            ),
        };
    }

    return { t1: [], t2: [], t3: [] };
};


const runAllEventsCron = async () => {
    if (isRunning) return;
    isRunning = true;

    try {
        const activeSports = sidArray.filter((sport) => sport.active);

        for (const sport of activeSports) {
            const sportId = sport.eid;
            const endpoint = `/highlighthomePrivate?etid=${sportId}`;

            try {
                const response = await fetchSportsData(endpoint);
                const rawData = response?.data?.data;

                const { t1, t2, t3 } = normalizeEvents(rawData);

                const finalData = {
                    t1,
                    t2,
                    t3
                };

                await redisClient.setex(
                    `alleventss:${sportId}`,
                    REDIS_TTL,
                    JSON.stringify(finalData)
                );

                console.log(
                    `✅ sportId=${sportId} | t1=${finalData.t1.length} | t2=${finalData.t2.length} | t3=${finalData.t3.length}`
                );

            } catch (err) {
                console.error(`❌ API failed for sport ${sportId}`, err.message);
            }

            await new Promise((r) => setTimeout(r, DELAY_BETWEEN_SPORTS));
        }
    } catch (err) {
        console.error("❌ AllEvents cron error:", err.message);
    } finally {
        isRunning = false;
    }
};

runAllEventsCron();
setInterval(runAllEventsCron, INTERVAL_MINUTES * 60 * 1000);
