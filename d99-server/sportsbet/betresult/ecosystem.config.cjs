
const path = require('path');

module.exports = {
  apps: [
    {
      name: `${process.env.PROJECT_NAME}-sports-results-cron`,
      script: path.join(__dirname, 'newjobv2.js'),
      env: {
  NODE_ENV: "production",
  DEBUG: "1",
  SETTLEMENT_VERSION: "v2",
  AVRKHUB_BASE_URL: process.env.AVRKHUB_BASE_URL || 'https://diamond-result-v2.avrkhub.in',
  API_TIMEOUT_MS: "40000",
  MAX_CONCURRENT_API: "3",
  USER_BATCH_CONCURRENCY: "5",
  RESULTS_REQUEUE_MS: "120000",
  CRON_INTERVAL_MS: "60000",            // 5 minutes
  SUMMARY_KEEP_PER_EVENT: "5",
  SUMMARY_RETENTION_DAYS: "7",
  BET_CACHE_TTL_DAYS: "14",
  RESULTS_CRON_LOG_DIR: path.join(__dirname, 'logs'),

      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(__dirname, 'logs/results-cron-error.log'),
      out_file: path.join(__dirname, 'logs/results-cron-out.log'),
      time: true
    },

    {
      name: `${process.env.PROJECT_NAME}-sports-settlement-worker`,
      script: path.join(__dirname, 'settlementv2.js'),
      env: {
  NODE_ENV: "production",
  DEBUG: "1",
  SETTLEMENT_VERSION: "v2",
  AVRKHUB_BASE_URL: process.env.AVRKHUB_BASE_URL || 'https://diamond-result-v2.avrkhub.in',
  API_TIMEOUT_MS: "15000",
  SETTLE_POLL_MS: "60000",             // 5 minutes
  SETTLE_BATCH_LIMIT: "10",
  SETTLE_REQUEUE_MS: "100000",
  LEDGER_ZERO_ROWS: "0",
  SETTLEMENT_LOG_DIR: path.join(__dirname, 'logs'),

      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file:   path.join(__dirname, 'logs/settlement-worker-error.log'),
      out_file: path.join(__dirname, 'logs/settlement-worker-out.log'),
      time: true
    }
  ]
};
