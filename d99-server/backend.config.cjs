const path = require('path');
const CWD = process.cwd();

require('dotenv').config({ path: path.join(CWD, '.env') });

const PROJECT_NAME = process.env.PROJECT_NAME;
const PROJECT_BASE_URL = process.env.PROJECT_BASE_URL;

module.exports = {
  apps: [
    {
      name: `${PROJECT_NAME}-server`,
      script: path.join(CWD, "server.js"),
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      kill_timeout: 6000,
      restart_delay: 3000,
      error_file: path.join(CWD, "logs", "backend", "error", "backend-error.log"),
      out_file: path.join(CWD, "logs", "backend", "out", "backend-out.log"),
      time: true
    },
    // Sports Results Cron
    // Uses newjobv2.js (AVRKHUB) when SETTLEMENT_VERSION=v2 (default)
    // Uses newjob.js (old Diamond) when SETTLEMENT_VERSION=v1
    {
      name: `${PROJECT_NAME}-sports-results-cron`,
      script: path.join(CWD, "sportsbet", "betresult",
        (process.env.SETTLEMENT_VERSION || 'v2') === 'v1' ? "newjob.js" : "newjobv2.js"
      ),
      env: {
        NODE_ENV: "production",
        WORKER_MODE: "1",
        DEBUG: "1",
        SETTLEMENT_VERSION: process.env.SETTLEMENT_VERSION || "v2",
        RESULTS_API_BASE: `${PROJECT_BASE_URL}/api`,
        AVRKHUB_BASE_URL: process.env.AVRKHUB_BASE_URL || "https://diamond-result-v2.avrkhub.in",
        API_TIMEOUT_MS: "40000",
        MAX_CONCURRENT_API: "3",
        USER_BATCH_CONCURRENCY: "5",
        RESULTS_REQUEUE_MS: "120000",
        CRON_INTERVAL_MS: "60000",            // 5 minutes
        SUMMARY_KEEP_PER_EVENT: "5",
        SUMMARY_RETENTION_DAYS: "7",
        BET_CACHE_TTL_DAYS: "14",
        RESULTS_CRON_LOG_DIR: path.join(CWD, "sportsbet", "betresult", "logs"),

      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(CWD, "sportsbet", "betresult", "logs", "results-cron-error.log"),
      out_file: path.join(CWD, "sportsbet", "betresult", "logs", "results-cron-out.log"),
      time: true
    },
    // Sports Settlement Worker
    // SETTLEMENT_VERSION controls which result API is used:
    //   v1 = settlementnew.js (old Diamond API via 130.250.191.212:3009)
    //   v2 = settlementv2.js  (new AVRKHUB API via diamond-result.avrkhub.in)
    // Set SETTLEMENT_VERSION in .env to switch. Default: v2 (AVRKHUB)
    {
      name: `${PROJECT_NAME}-sports-settlement-worker`,
      script: path.join(CWD, "sportsbet", "betresult",
        (process.env.SETTLEMENT_VERSION || 'v2') === 'v1' ? "settlementnew.js" : "settlementv2.js"
      ),
      env: {
        NODE_ENV: "production",
        WORKER_MODE: "1",
        DEBUG: "1",
        SETTLEMENT_VERSION: process.env.SETTLEMENT_VERSION || "v2",
        RESULTS_API_BASE: `${PROJECT_BASE_URL}/api`,
        AVRKHUB_BASE_URL: process.env.AVRKHUB_BASE_URL || "https://diamond-result-v2.avrkhub.in",
        API_TIMEOUT_MS: "15000",
        SETTLE_POLL_MS: "60000",             // 1 minute
        SETTLE_BATCH_LIMIT: "10",
        SETTLE_REQUEUE_MS: "100000",
        LEDGER_ZERO_ROWS: "0",
        SETTLEMENT_LOG_DIR: path.join(CWD, "sportsbet", "betresult", "logs"),
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(CWD, "sportsbet", "betresult", "logs", "settlement-worker-error.log"),
      out_file: path.join(CWD, "sportsbet", "betresult", "logs", "settlement-worker-out.log"),
      time: true
    },
    // Casino Results Worker
    {
      name: `${PROJECT_NAME}-casino-results-worker`,
      script: path.join(CWD, "casinobet", "worker_fetch.js"),
      env: {
        NODE_ENV: "production",
        WORKER_MODE: "1",
        DEBUG: "1",
        CASINO_RESULTS_API_BASE: `${PROJECT_BASE_URL}/api`,
        CASINO_RESULTS_ENDPOINT: "/casino/casino/last-results",
        WORKER_INTERVAL_MS: "5000",
        API_TIMEOUT_MS: "40000",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(CWD, "casinobet", "logs", "results-worker-error.log"),
      out_file: path.join(CWD, "casinobet", "logs", "results-worker-out.log"),
      time: true
    },
    // Casino Settlement Worker
    {
      name: `${PROJECT_NAME}-casino-settlement-worker`,
      script: path.join(CWD, "casinobet", "settlementCasinoWorker.js"),
      env: {
        NODE_ENV: "production",
        WORKER_MODE: "1",
        DEBUG: "1",
        SETTLE_POLL_MS: "60000",
        SETTLE_BATCH_LIMIT: "10",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(CWD, "casinobet", "logs", "settlement-worker-error.log"),
      out_file: path.join(CWD, "casinobet", "logs", "settlement-worker-out.log"),
      time: true
    },
    // User Net Exposure Worker
    {
      name: `${PROJECT_NAME}-net-exposure-worker`,
      script: path.join(CWD, "worker", "userNetExpSyncWorker.js"),
      env: {
        NODE_ENV: "production",
        WORKER_MODE: "1",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(CWD, "logs", "worker", "error", "net-exposure-error.log"),
      out_file: path.join(CWD, "logs", "worker", "out", "net-exposure-out.log"),
      time: true
    }
  ]
};
