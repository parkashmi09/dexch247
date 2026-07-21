const path = require('path');

module.exports = {
  apps: [
    {
      name: `${process.env.PROJECT_NAME}-casino-results-worker`,
      script: path.join(__dirname, 'worker_fetch.js'),
      env: {
        NODE_ENV: "production",
        DEBUG: "1",
        CASINO_RESULTS_API_BASE: `${process.env.PROJECT_BASE_URL}/api`,
        CASINO_RESULTS_ENDPOINT: "/casino/casino/last-results",
        WORKER_INTERVAL_MS: "5000",
        API_TIMEOUT_MS: "40000",
        
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(__dirname, 'logs/results-worker-error.log'),
      out_file: path.join(__dirname, 'logs/results-worker-out.log'),
      time: true
    },
    {
      name: `${process.env.PROJECT_NAME}-casino-settlement-worker`,
      script:   path.join(__dirname, 'settlementCasinoWorker.js'),
      env: {
        NODE_ENV: "production",
        DEBUG: "1",
        WORKER_MODE: "1",
        CASINO_RESULTS_API_BASE: `${process.env.PROJECT_BASE_URL}/api`,
        SETTLE_POLL_MS: "60000",
        SETTLE_BATCH_LIMIT: "10",

      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_restarts: 10,
      error_file: path.join(__dirname, 'logs/settlement-worker-error.log'),
      out_file: path.join(__dirname, 'logs/settlement-worker-out.log'),
      time: true
    }
  ]
};
