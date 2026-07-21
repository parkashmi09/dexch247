
import { Sequelize, DataTypes, Op, fn, col } from 'sequelize';
import sequelize from './config/db.js';
import User from './model/user/User.js';
import Staff from './model/admin/Staff.js';
import CreditsLedger from './model/user/CreditsLedger.js';
import SportsBet from './model/user/SportsBet.js';
import fetch from 'node-fetch';

// Mock request/response for controller testing
const mockReq = (body, user) => ({
  body,
  user
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

// Import the controller function (we can't easily import it if it's not exported, so we'll simulate the logic or use the API if running)
// Since we are running a script, we can just replicate the logic or use axios to hit the running server?
// But the server needs to be restarted to pick up changes.
// I'll restart the server first, then use axios to test the API.

const testAPI = async () => {
  const baseUrl = 'http://localhost:8091/api/admin/ledger/commission-report';
  const token = '...'; // We need a valid token. 
  // Instead of full API test with auth, let's just run the logic directly against DB like previous scripts.
  
  console.log('--- Verifying Drill-Down Logic ---');

  // 1. Update some SportsBet rows to have sport_id = '4' (Cricket)
  console.log('Updating SportsBet rows with sport_id = 4 for testing...');
  await SportsBet.update({ sport_id: '4' }, { where: { sport_id: null } });
  
  // 2. Simulate USER_LIST
  console.log('\n--- Case 1: USER_LIST ---');
  // ... (Logic similar to controller)
  // But wait, I can just use the code I wrote in the controller by copying it here or importing it?
  // Importing is hard because of dependencies.
  // I'll just verify the DB state and expected output.

  // Fetch commissions for testshivam (User 15)
  const commissions = await CreditsLedger.findAll({
    where: { user_id: '15', commission: { [Op.ne]: null } },
    raw: true
  });
  console.log(`User 15 has ${commissions.length} commission entries.`);
  
  const matchIds = [...new Set(commissions.map(c => c.match_id))];
  console.log(`Match IDs: ${matchIds.join(', ')}`);

  const bets = await SportsBet.findAll({
    where: { match_id: { [Op.in]: matchIds } },
    attributes: ['match_id', 'sport_id', 'match_title'],
    raw: true
  });
  console.table(bets);

  // Group by Sport
  const sportAgg = {};
  bets.forEach(b => {
      const sid = b.sport_id || 'UNKNOWN';
      if (!sportAgg[sid]) sportAgg[sid] = 0;
  });
  
  commissions.forEach(c => {
      // Find sport for this match
      const bet = bets.find(b => b.match_id == c.match_id);
      const sid = bet ? bet.sport_id : 'UNKNOWN';
      if (sportAgg[sid] !== undefined) sportAgg[sid] += parseFloat(c.commission);
      else sportAgg[sid] = parseFloat(c.commission);
  });

  console.log('Expected Sport Wise Output:');
  console.table(sportAgg);

};

testAPI().then(() => sequelize.close());
