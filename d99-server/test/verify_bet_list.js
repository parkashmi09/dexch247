
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/admin/ledger/commission-report';
const ADMIN_TOKEN = 'mock_token'; // We need a valid token or mock the middleware if running locally against server
// Since I can't easily mock middleware in a live server, I will use the controller directly or use the existing verify script approach which likely mocked something or hit a test route?
// Ah, verify_drilldown.js imported the controller directly? No, it used axios?
// Let's check verify_drilldown.js content.

// Actually, I can just use the debug script approach but calling the controller function directly if I mock req/res.
// Or I can use the existing server if I have a token.
// The user has `npm start` running.
// I will try to use a script that imports the controller and mocks req/res, similar to unit testing.

import { getCommissionReport } from './controller/admin/CreditLedgerController.js';
// import { jest } from '@jest/globals'; // Not needed

// Manual mock
const req = {
  body: {
    user_id: '1', // testUser3 ID
    view_type: 'MATCH_WISE',
    target_user_id: '1',
    target_sport_id: 'UNKNOWN' // Test the "Other" case
  },
  user: { id: 1, role: 'OWNER' }
};

const res = {
  status: (code) => ({
    json: (data) => {
      console.log(`Status: ${code}`);
      console.log(JSON.stringify(data, null, 2));
    }
  })
};

// I need to run this in the server context (with DB connection).
// I will create a script in d247-server that imports the controller.

import './config/db.js'; // Init DB

const run = async () => {
  try {
    console.log('--- Testing MATCH_WISE View ---');
    await getCommissionReport(req, res);
  } catch (error) {
    console.error(error);
  }
};

run();
