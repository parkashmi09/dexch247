
import { placeBet } from './sportsbet/sportbetscontroller.js';
import sequelize from './config/db.js';

// Mock Request and Response
const mockReq = {
  user: { id: 1 }, // Assuming user ID 1 exists
  body: {
    game_type: 'MO',
    match_id: '12345',
    match_title: 'Test Match',
    selection_name: 'Test Team',
    bet_type: 'back',
    odds: 2.0,
    stake_amount: 100,
    team_one: 'Team A',
    team_two: 'Team B',
    sid: '4', // Cricket Sport ID
    eventid: '888888'
  },
  headers: {}
};

const mockRes = {
  status: (code) => ({
    json: (data) => console.log(`Response [${code}]:`, data)
  }),
  json: (data) => console.log("Response [200]:", data)
};

const verify = async () => {
  try {
    console.log("--- Testing Dynamic Lookup ---");
    // We are mocking the controller call. 
    // Since we can't easily mock the entire DB state for a full bet placement without side effects,
    // we will rely on the fact that if it reaches the "External API" step or fails later with "Insufficient balance",
    // it means the lock check passed (or at least didn't crash).
    
    // Note: This script might fail if user 1 doesn't exist or has no wallet, but we are looking for "Lock" errors or "PlatformGame" errors.
    await placeBet(mockReq, mockRes);
    
  } catch (error) {
    console.error("Verification Error:", error);
  } finally {
    // await sequelize.close(); // Controller might not close it, but we should let the process exit
    setTimeout(() => process.exit(0), 2000);
  }
};

verify();
