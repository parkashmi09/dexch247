// pm2 config for the System Tracker always-on scanner.
//   start:  pm2 start systemTracker/ecosystem.config.cjs && pm2 save
const path = require('path');

module.exports = {
  apps: [
    {
      name: `${process.env.PROJECT_NAME || 'jmd'}-integrity-scan`,
      script: path.join(__dirname, 'integrityScanWorker.js'),
      cwd: path.join(__dirname, '..'), // run from d99-server so relative imports + .env resolve
      env: {
        NODE_ENV: 'production',
        INTEGRITY_SCAN_INTERVAL_MS: '600000', // 10 min
      },
      autorestart: true,
      max_restarts: 10,
      error_file: path.join(__dirname, 'logs/integrity-scan-error.log'),
      out_file: path.join(__dirname, 'logs/integrity-scan-out.log'),
      time: true,
    },
  ],
};
