import got from "got";
import http from "http";
import https from "https";
import dns from "dns";
import pLimit from "p-limit";
import ENV from "../config/env.js";

// ================= ENV =================
const SPORTS_BASE_URL = "http://167.71.224.37:9000";
const SPORTS_API_KEY = ENV.SPORTS_API_KEY;

// ================= AGENT =================
const agent = {
    http: new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 15000,
        maxSockets: 2000,
        maxFreeSockets: 1000,
        scheduling: "lifo",
    }),
    https: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 15000,
        maxSockets: 2000,
        maxFreeSockets: 1000,
        scheduling: "lifo",
    }),
};

// ================= DNS CACHE =================
const dnsCache = new Map();
const DNS_TTL = 5 * 60 * 1000;

const dnsLookup = (hostname, options, callback) => {
    const now = Date.now();
    const cached = dnsCache.get(hostname);

    if (cached && cached.expires > now) {
        return callback(null, cached.address, cached.family);
    }

    dns.lookup(hostname, options, (err, address, family) => {
        if (!err) {
            dnsCache.set(hostname, {
                address,
                family,
                expires: now + DNS_TTL,
            });
        }
        callback(err, address, family);
    });
};

// ================= PREWARM DNS =================
const prewarmDNS = () => {
    [SPORTS_BASE_URL].forEach((url) => {
        try {
            const host = new URL(url).hostname;
            dns.lookup(host, {}, () => { });
        } catch { }
    });
};

// ================= HEADERS =================
const COMMON_HEADERS = {
    // "x-turnkeyxgaming-key": SPORTS_API_KEY,
    accept: "application/json",
    // "accept-encoding": "gzip",
    connection: "keep-alive",
};

// ================= CACHE =================
const CACHE_TTL = 3000; // 🔥 3 seconds (stable speed)
const responseCache = new Map();

const getCache = (key) => {
    const item = responseCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        responseCache.delete(key);
        return null;
    }
    return item.data;
};

const setCache = (key, data) => {
    responseCache.set(key, {
        data,
        expiry: Date.now() + CACHE_TTL,
    });
};

// ================= GOT CONFIG =================
const requestConfig = {
    method: "GET",
    agent,
    headers: COMMON_HEADERS,
    responseType: "json",
    retry: { limit: 0 },
    throwHttpErrors: true,
    decompress: true,
    followRedirect: false,
    http2: true,
    dnsLookup,
    timeout: {
        lookup: 200,
        connect: 800,
        secureConnect: 800,
        socket: 2000,
        response: 1500,
    },
};

// ================= SINGLE FETCH =================
export const fetchSportsData = async (endpoint) => {
    const cached = getCache(endpoint);
    if (cached) return cached;

    const url = SPORTS_BASE_URL + endpoint;

    const res = await got(url, {
        ...requestConfig,
        timeout: { ...requestConfig.timeout, request: 3200 },
    });

    setCache(endpoint, res.body);
    return res.body;
};

// ================= CONCURRENCY =================
const limit = pLimit(45); // 🔥 50 req/sec API limit — safe margin

// ================= BATCH MEMORY REUSE =================
let lastBatch = null;
let lastBatchTime = 0;
const BATCH_CACHE_TTL = 2000;

// ================= BATCH FETCH =================
export const fetchSportsBatch = async (endpoints = []) => {
    const now = Date.now();

    // reuse previous batch if very recent
    if (lastBatch && now - lastBatchTime < BATCH_CACHE_TTL) {
        return lastBatch;
    }

    const start = Date.now();

    const results = await Promise.allSettled(
        endpoints.map((ep) =>
            limit(() => fetchSportsData(ep))
        )
    );

    const success = results.filter(r => r.status === "fulfilled").length;
    const failed = results.length - success;

    const duration = Date.now() - start;

    console.log(
        `⚡ ${results.length} matches processed in ${duration}ms | ✅ ${success} | ❌ ${failed}`
    );

    lastBatch = results;
    lastBatchTime = now;

    return results;
};

// ================= STARTUP WARMUP =================
export const warmupSportsAPI = async () => {
    try {
        await fetchSportsData("/ping");
        await fetchSportsData("/ping");
        await fetchSportsData("/ping");
        console.log("🔥 Sports API warmed");
    } catch {
        console.log("⚠️ Warmup failed");
    }
};

// run DNS prewarm immediately
prewarmDNS();