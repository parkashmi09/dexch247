import { getExposureDebitAmount, calculateExposureScenarios } from '../ExposureService.js';
import SportsBet from '../../model/user/sports_bet.js';

jest.mock('../../model/user/sports_bet.js');

describe('ExposureService.getExposureDebitAmount integration scenarios', () => {
  const user_id = 1;
  const event_id_1 = 1001;
  const event_id_2 = 1002;
  const market_id_X = 'X';
  const market_id_Y = 'Y';
  const nation_A = 'TeamA';
  const nation_B = 'TeamB';
  const bet_type_back = 'back';
  const bet_type_lay = 'lay';
  const odds = 2.0;
  const transaction = undefined; // Not used in mock

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. First bet on a match: should debit full amount', async () => {
    SportsBet.findAll.mockResolvedValue([]);
    const debit = await getExposureDebitAmount(user_id, event_id_1, market_id_X, nation_A, bet_type_back, odds, 100, transaction);
    expect(debit).toBe(100);
  });

  it('2. Second bet, same match/market/team, increases exposure: debit only increase', async () => {
    // Previous bet: back 100 on TeamA
    SportsBet.findAll.mockResolvedValue([
      { market_id: market_id_X, nation: nation_A, user_rate: odds, amount: 100, bet_type: bet_type_back, market_type: 'match-odds' }
    ]);
    const debit = await getExposureDebitAmount(user_id, event_id_1, market_id_X, nation_A, bet_type_back, odds, 50, transaction);
    expect(debit).toBe(50);
  });

  it('3. Third bet, same match/market/team, reduces exposure (hedging): no debit', async () => {
    // Previous bet: back 100 on TeamA
    SportsBet.findAll.mockResolvedValue([
      { market_id: market_id_X, nation: nation_A, user_rate: odds, amount: 100, bet_type: bet_type_back, market_type: 'match-odds' }
    ]);
    // New bet: lay 100 on TeamA (should reduce exposure)
    const debit = await getExposureDebitAmount(user_id, event_id_1, market_id_X, nation_A, bet_type_lay, odds, 100, transaction);
    expect(debit).toBe(0);
  });

  it('4. Bet on same match, different market: debit full amount', async () => {
    // Previous bet: back 100 on TeamA, market X
    SportsBet.findAll.mockResolvedValue([
      { market_id: market_id_X, nation: nation_A, user_rate: odds, amount: 100, bet_type: bet_type_back, market_type: 'match-odds' }
    ]);
    // New bet: back 200 on TeamA, market Y
    const debit = await getExposureDebitAmount(user_id, event_id_1, market_id_Y, nation_A, bet_type_back, odds, 200, transaction);
    expect(debit).toBe(200);
  });

  it('5. Bet on different match: debit full amount', async () => {
    // Previous bet: back 100 on TeamA, match 1
    SportsBet.findAll.mockResolvedValue([
      { market_id: market_id_X, nation: nation_A, user_rate: odds, amount: 100, bet_type: bet_type_back, market_type: 'match-odds', event_id: event_id_1 }
    ]);
    // New bet: back 300 on TeamB, match 2
    SportsBet.findAll.mockResolvedValue([]); // No bets for match 2
    const debit = await getExposureDebitAmount(user_id, event_id_2, market_id_X, nation_B, bet_type_back, odds, 300, transaction);
    expect(debit).toBe(300);
  });
}); 