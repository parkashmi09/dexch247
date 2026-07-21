import { addMatchedBet } from '../features/matchedBets/matchedBetsSlice';
import { updateDemoBalanceAndExposure } from '../features/user/userSlice';
import { toast } from 'react-toastify';

export const isDemoUser = (user) => {
  return !user || user.username === 'Demo' || user.email === 'demo@mail.com';
};

export const getDemoState = (state) => {
  return {
    balance: state.user.balance ?? 1500,
    exposure: state.user.exposure ?? 0,
  };
};

const calculateMarketLiability = (bets) => {
  if (!bets.length) return 0;
  const marketType = bets[0].marketType;

  if (marketType === 'MATCH_ODDS' || marketType === 'BOOKMAKER') {
    const teams = [...new Set(bets.map((b) => b.teamName))];
    const marketResults = {};

    teams.forEach((winningTeam) => {
      let net = 0;
      bets.forEach((bet) => {
        const stake = Number(bet.stake);
        const odds = Number(bet.odds);
        const isBookPercent = marketType === 'BOOKMAKER' && odds >= 10;
        const onThisTeam = bet.teamName === winningTeam;

        if (bet.betType === 'back' || bet.betType === 'yes') {
          if (onThisTeam) {
            net += isBookPercent ? (odds / 100) * stake : (odds - 1) * stake;
          } else {
            net -= stake;
          }
        } else {
          // lay
          if (onThisTeam) {
            net -= isBookPercent ? (odds / 100) * stake : (odds - 1) * stake;
          } else {
            net += stake;
          }
        }
      });
      marketResults[winningTeam] = net;
    });

    const minPL = Math.min(...Object.values(marketResults));
    return minPL < 0 ? Math.abs(minPL) : 0;
  } else if (marketType === 'FANCY') {
    let yesNet = 0;
    let noNet = 0;
    bets.forEach((bet) => {
      const stake = Number(bet.stake);
      const odds = Number(bet.odds);
      if (bet.betType === 'yes') {
        yesNet += (stake * odds) / 100;
        noNet -= stake;
      } else {
        noNet += (stake * odds) / 100;
        yesNet -= stake;
      }
    });
    const minPL = Math.min(yesNet, noNet);
    return minPL < 0 ? Math.abs(minPL) : 0;
  }
  return 0;
};

export const calculateGlobalDemoExposure = (matchedBets) => {
  const betsByMarket = matchedBets.reduce((acc, bet) => {
    const marketId = bet.market_id || 'unknown';
    if (!acc[marketId]) acc[marketId] = [];
    acc[marketId].push(bet);
    return acc;
  }, {});

  let totalExposure = 0;
  Object.values(betsByMarket).forEach((bets) => {
    totalExposure += calculateMarketLiability(bets);
  });

  return Number(totalExposure.toFixed(2));
};

export const handleDemoBetSubmission = (
  dispatch,
  betData,
  _exposure,
  onBetSubmit,
  handleClose,
  currentMatchedBets
) => {
  dispatch(addMatchedBet(betData));

  const marketId = betData.market_id;
  const marketBets = (currentMatchedBets || []).filter(
    (b) => b.market_id === marketId
  );

  const oldLiability = calculateMarketLiability(marketBets);
  const newLiability = calculateMarketLiability([...marketBets, betData]);
  const deltaExposure = newLiability - oldLiability;

  dispatch(updateDemoBalanceAndExposure({ exposure: deltaExposure }));

  toast.success('Demo bet placed successfully!');

  if (onBetSubmit) onBetSubmit(betData);

  if (handleClose) {
    setTimeout(() => {
      handleClose();
    }, 2000);
  }
};
