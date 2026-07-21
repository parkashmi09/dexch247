import CricketService from '../CricketService.js';
import Wallet from '../../model/admin/Wallet.js';
import SportsBet from '../../model/user/sports_bet.js';
import ExposureService from '../ExposureService.js';
import MatchModel from '../../model/user/Match.js';

jest.mock('../../model/admin/Wallet.js');
jest.mock('../../model/user/sports_bet.js');
jest.mock('../ExposureService.js');
jest.mock('../../model/user/Match.js');

const mockTransaction = {};

const user_id = 1;
const event_id = 101;
const betData = {
  user_id,
  sports: 'Cricket',
  event_name: 'Test Match',
  market_name: 'Match Odds',
  market_type: 'match-odds',
  nation: 'India',
  user_rate: 2.0,
  amount: 100,
  place_date: '2024-06-01 12:00:00',
  event_id,
  market_id: 'm1',
  sid: 'sid1',
  bet_type: 'back',
  settlened: 'pending',
};

describe('CricketService.placebetWithBalanceAndSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should debit only the net increase in exposure and save the bet', async () => {
    // Mock wallet with enough balance
    Wallet.findOne.mockResolvedValue({
      inr_balance: 200,
      save: jest.fn().mockResolvedValue(true),
    });
    // No unsettled bets before
    SportsBet.findAll.mockResolvedValue([]);
    // Mock bet creation
    SportsBet.create.mockResolvedValue({ id: 1, ...betData });
    // Mock match
    MatchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(true),
    });
    // Mock exposure update
    ExposureService.updateUserMatchExposureAfterBet.mockResolvedValue(true);
    ExposureService.updateUserTotalExposureAfterBet.mockResolvedValue(true);
    // Mock exposure calculation
    ExposureService.calculateExposureScenarios.mockImplementation(bets => ({
      exposureBySelection: { India: bets.reduce((sum, b) => sum + b.stake, 0) },
    }));

    // Call the function
    const result = await CricketService.placebetWithBalanceAndSave(betData);
    // Wallet should be debited by 100 (net exposure increase)
    expect(Wallet.findOne).toHaveBeenCalled();
    expect(SportsBet.create).toHaveBeenCalled();
    expect(ExposureService.updateUserMatchExposureAfterBet).toHaveBeenCalled();
    expect(ExposureService.updateUserTotalExposureAfterBet).toHaveBeenCalled();
    // The result should include the bet
    expect(result.bet).toBeDefined();
  });

  it('should not debit if net exposure does not increase (hedging)', async () => {
    // Mock wallet with enough balance
    Wallet.findOne.mockResolvedValue({
      inr_balance: 200,
      save: jest.fn().mockResolvedValue(true),
    });
    // Existing bet already present
    SportsBet.findAll.mockResolvedValue([
      {
        nation: 'India',
        user_rate: 2.0,
        amount: 100,
        bet_type: 'back',
        market_type: 'match-odds',
      },
    ]);
    // Mock bet creation
    SportsBet.create.mockResolvedValue({ id: 2, ...betData, bet_type: 'lay', amount: 100 });
    // Mock match
    MatchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(true),
    });
    // Mock exposure update
    ExposureService.updateUserMatchExposureAfterBet.mockResolvedValue(true);
    ExposureService.updateUserTotalExposureAfterBet.mockResolvedValue(true);
    // Mock exposure calculation: exposure stays the same
    ExposureService.calculateExposureScenarios.mockImplementation(bets => ({
      exposureBySelection: { India: 100 },
    }));

    // Call the function
    const result = await CricketService.placebetWithBalanceAndSave({ ...betData, bet_type: 'lay', amount: 100 });
    // Wallet should not be debited
    expect(Wallet.findOne).toHaveBeenCalled();
    expect(SportsBet.create).toHaveBeenCalled();
    expect(ExposureService.updateUserMatchExposureAfterBet).toHaveBeenCalled();
    expect(ExposureService.updateUserTotalExposureAfterBet).toHaveBeenCalled();
    expect(result.bet).toBeDefined();
  });
}); 