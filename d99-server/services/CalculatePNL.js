

// export default function calculatePNL(bet, result) {
//   if (['abandoned', 'no-result'].includes(result.match_status)) {
//     return {
//       profit: 0,
//       loss: 0,
//       net_pnl: 0,
//       return_amount: bet.stake,
//       status: 'void',
//     };
//   }

//   const betWon = determineBetOutcome(bet, result);

//   if (bet.bet_type === 'back') {
//     return calculateBackBetPNL(bet, betWon);
//   } else {
//     return calculateLayBetPNL(bet, betWon);
//   }
// }

// function determineBetOutcome(bet, result) {
//   const marketType = bet.market_type;

//   if (marketType === 'match-odds') {
//     return bet.selection === result.winner;
//   }

//   if (marketType === 'over-under') {
//     const actualValue = result.actual_value;
//     const line = bet.market_line;
//     return bet.selection === 'over' ? actualValue > line : actualValue < line;
//   }

//   if (marketType === 'fancy') {
//     const sessionValue = result.session_value;
//     const line = bet.market_line;
//     return sessionValue > line;
//   }

//   return false;
// }

// function calculateBackBetPNL(bet, betWon) {
//   const stake = parseFloat(bet.stake);
//   const odds = parseFloat(bet.odds);
//   const profit = parseFloat(((odds - 1) * stake).toFixed(2));

//   if (betWon) {
//     return {
//       profit,
//       loss: 0,
//       net_pnl: profit,
//       return_amount: parseFloat((stake + profit).toFixed(2)),
//       status: 'won',
//     };
//   } else {
//     return {
//       profit: 0,
//       loss: stake,
//       net_pnl: -stake,
//       return_amount: 0,
//       status: 'lost',
//     };
//   }
// }

// function calculateLayBetPNL(bet, betWon) {
//   const stake = parseFloat(bet.stake);
//   const odds = parseFloat(bet.odds);
//   const liability = parseFloat(((odds - 1) * stake).toFixed(2));

//   if (betWon) {
//     return {
//       profit: stake,
//       loss: 0,
//       net_pnl: stake,
//       return_amount: stake * 2,
//       status: 'won',
//     };
//   } else {
//     return {
//       profit: 0,
//       loss: liability,
//       net_pnl: -liability,
//       return_amount: 0,
//       status: 'lost',
//     };
//   }
// }

  
 
  