// const axios = require('axios');

// const getEventResult = async (req, res) => {
//   try {
//     // Get eventid from query parameters
//     const { eventid } = req.query;
    
//     if (!eventid) {
//       return res.status(400).json({ error: 'eventid parameter is required' });
//     }

//     // Make request to external API for event result
//     const response = await axios.get(`http://91.108.105.111:5000/api/result/event-result?eventid=${eventid}`, {
//       headers: {
//         'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? '2ca9cb98b4mshd1781885e76d4d1p19b3e0jsna3a9558803ed',
//         'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair-betting-api1.p.rapidapi.com',
//         'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
//       }
//     });

//     // Send back the response received from API
//     return res.status(200).json(response.data);
    
//   } catch (error) {
//     console.error('Error fetching event result:', error.message);
//     return res.status(500).json({ 
//       error: 'Failed to fetch event result',
//       details: error.response?.data || error.message 
//     });
//   }
// };

// const getEventListResult = async (req, res) => {
//   try {
//     // Get sid (sport id) from query parameters
//     const { sid } = req.query;
    
//     if (!sid) {
//       return res.status(400).json({ error: 'sid (sport id) parameter is required' });
//     }

//     // Make request to external API for event list
//     const response = await axios.get(`http://91.108.105.111:5000/api/result/event-list?sid=${sid}`, {
//       headers: {
//         'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? '2ca9cb98b4mshd1781885e76d4d1p19b3e0jsna3a9558803ed',
//         'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair-betting-api1.p.rapidapi.com',
//         'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
//       }
//     });

//     // Send back the response received from API
//     return res.status(200).json(response.data);
    
//   } catch (error) {
//     console.error('Error fetching event list:', error.message);
//     return res.status(500).json({ 
//       error: 'Failed to fetch event list',
//       details: error.response?.data || error.message 
//     });
//   }
// };


// const getMatchNetExposure = async (req, res) => {
//   try {

//     // let matchId = 1.247114432
//     const { matchId } = req.params;

//     console.log('getMatchNetExposure called', matchId);
//     const betsQuery = await db.query(
//       `SELECT 
//       sb.user_id,
//       sb.game_type,
//       sb.match_title,
//       sb.team_one,
//       sb.team_two,
//       sb.selection_name,
//       sb.category,
//       sb.bet_type,
//       sb.odds,
//       sb.stake_amount,
//       sb.liability,
//       sb.match_start_time,
//       sb.created_at,
//       sb.match_id,
//       sb.status,
//       sb.eventid,
//       u.email,
//       u.name
//    FROM sports_bets sb
//    LEFT JOIN users u ON u.id = sb.user_id
//    WHERE sb.match_id = $1
//    ORDER BY sb.created_at DESC`,
//       [matchId]
//     );
//     // console.log('betsQuery:', betsQuery);

//     const gameConfig = betsQuery.rows
//     // console.log('gameConfig:', gameConfig);

//     let totalStake = 0;

//     let teamOneProfit = 0;
//     let teamOneLiability = 0;

//     let teamTwoProfit = 0;
//     let teamTwoLiability = 0;

//     gameConfig.forEach(bet => {
//       totalStake += bet.liability;
    
//       const stake = bet.stake_amount;
//       const odds = bet.odds;
//       // const liability = bet.liability ?? ((bet.bet_type === "back") ? stake : (odds - 1) * stake);
//       const liability = bet.liability ;
    
//       // ---- TEAM ONE BACK ----
//       if (bet.selection_name === bet.team_one && bet.bet_type === "back") {
//         // Team1 win → profit
//         teamOneProfit += (odds - 1) * stake;
//         // Team2 win → liability
//         teamTwoLiability += liability;  // ✅ use liability
//       }
    
//       // ---- TEAM ONE LAY ----
//       if (bet.selection_name === bet.team_one && bet.bet_type === "lay") {
//         // Team1 lose → profit
//         teamTwoProfit += stake;
//         // Team1 win → liability
//         teamOneLiability += liability;  // ✅ use liability
//       }
    
//       // ---- TEAM TWO BACK ----
//       if (bet.selection_name === bet.team_two && bet.bet_type === "back") {
//         // Team2 win → profit
//         teamTwoProfit += (odds - 1) * stake;
//         // Team1 win → liability
//         teamOneLiability += liability;  // ✅ use liability
//       }
    
//       // ---- TEAM TWO LAY ----
//       if (bet.selection_name === bet.team_two && bet.bet_type === "lay") {
//         // Team2 lose → profit
//         teamOneProfit += stake;
//         // Team2 win → liability
//         teamTwoLiability += liability;  // ✅ use liability
//       }
//     });
    
//     const formatNumber = (num) => Number(num.toFixed(2));
//     let result = {
//       totalStake: formatNumber(totalStake),
//       teamOne: {
//         profit: formatNumber(teamOneProfit),
//         liability: formatNumber(teamOneLiability),
//         netExposure: formatNumber(teamOneLiability - teamOneProfit),
//       },
//       teamTwo: {
//         profit: formatNumber(teamTwoProfit),
//         liability: formatNumber(teamTwoLiability),
//         netExposure: formatNumber(teamTwoLiability - teamTwoProfit),
//       },
//       draw: {
//         liability: formatNumber(teamOneLiability + teamTwoLiability),
//       },
//     };

//     return res.status(200).json(result);
//   } catch (error) {
//     console.log('Error in getMatchNetExposure:', error);
//     return res.status(500).json(error);
//   }
// }

// const getMatchNetExposurepost = async (req, res) => {
//   try {

//     // let matchId = 1.247114432
//     const { matchId } = req.params;
//     const { userIds } = req.body;
//     console.log('userIds:', userIds);
//     let query = `
//   SELECT 
//     sb.user_id,
//     sb.game_type,
//     sb.match_title,
//     sb.team_one,
//     sb.team_two,
//     sb.selection_name,
//     sb.category,
//     sb.bet_type,
//     sb.odds,
//     sb.stake_amount,
//     sb.liability,
//     sb.match_start_time,
//     sb.created_at,
//     sb.match_id,
//     sb.status,
//     sb.eventid,
//     u.email,
//     u.name
//   FROM sports_bets sb
//   LEFT JOIN users u ON u.id = sb.user_id
//   WHERE sb.match_id = $1
// `;

//     let queryParams = [matchId];

//     if (userIds && userIds.length > 0) {
//       query += ` AND sb.user_id = ANY($2)`;
//       queryParams.push(userIds); // userIds should be an array
//     }
//     query += ` ORDER BY sb.created_at DESC`;
//     const betsQuery = await db.query(query, queryParams);

//     // console.log('betsQuery:', betsQuery);

//     const gameConfig = betsQuery.rows
//     // console.log('gameConfig:', gameConfig);

//     let totalStake = 0;

//     let teamOneProfit = 0;
//     let teamOneLiability = 0;

//     let teamTwoProfit = 0;
//     let teamTwoLiability = 0;

//   let team1backL = 0
//       let team1backS = 0
//       let team2backL = 0
//       let team2backS = 0
//      let  team1layL = 0
//       let team1layS = 0
//      let  team2layL = 0
//      let  team2layS = 0
//     gameConfig.forEach(bet => {
//       totalStake += bet.liability;

//       const stake = bet.stake_amount;
//       const odds = bet.odds;
//       // const liability = bet.liability ?? ((bet.bet_type === "back") ? stake : (odds - 1) * stake);
//       const liability = bet.liability;
    

//       if (bet.selection_name === bet.team_one && bet.bet_type === "back") {

//         teamOneProfit += (odds - 1) * stake;
//         teamTwoLiability += liability;  // ✅ use liability
//         team1backL += liability
//         team1backS += (odds - 1) * stake;
//       }


//       if (bet.selection_name === bet.team_one && bet.bet_type === "lay") {
//         teamTwoProfit += stake;
//         teamOneLiability += liability;  // ✅ use liability
//         team1layL += liability
//         team1layS += stake
//       }

//       // ---- TEAM TWO BACK ----
//       if (bet.selection_name === bet.team_two && bet.bet_type === "back") {
//         // Team2 win → profit
//         teamTwoProfit += (odds - 1) * stake;
//         // Team1 win → liability
//         teamOneLiability += liability;  // ✅ use liability
//         team2backL += liability
//         team2backS += (odds - 1) * stake
//       }

//       // ---- TEAM TWO LAY ----
//       if (bet.selection_name === bet.team_two && bet.bet_type === "lay") {
//         // Team2 lose → profit
//         teamOneProfit += stake;
//         // Team2 win → liability
//         teamTwoLiability += liability;  // ✅ use liability
//         team2layL += liability
//         team2layS += stake
//       }
//     });

//     const formatNumber = (num) => Number(num.toFixed(2));
//     let result = {
//       totalStake: formatNumber(totalStake),
//       team1backL: formatNumber(team1backL),
//       team1backS: formatNumber(team1backS),
//       team2backL: formatNumber(team2backL),
//       team2backS: formatNumber(team2backS),
//       team1layL: formatNumber(team1layL),
//       team1layS: formatNumber(team1layS),
//       team2layL: formatNumber(team2layL),
//       team2layS: formatNumber(team2layS),
//       teamOne: {
//         profit: formatNumber(teamOneProfit),
//         liability: formatNumber(teamOneLiability),
//         netExposure: formatNumber(teamOneLiability - teamOneProfit),
//         gameprofit: formatNumber(totalStake - teamOneProfit),
//       },
//       teamTwo: {
//         profit: formatNumber(teamTwoProfit),
//         liability: formatNumber(teamTwoLiability),
//         netExposure: formatNumber(teamTwoLiability - teamTwoProfit),
//         gameprofit: formatNumber(totalStake - teamTwoProfit),
//       },
//       draw: {
//         liability: formatNumber(teamOneLiability + teamTwoLiability),
//       },
//     };

//     return res.status(200).json(result);
//   } catch (error) {
//     console.log('Error in getMatchNetExposure:', error);
//     return res.status(500).json(error);
//   }
// }

// module.exports = {
//   getEventResult,
//   getEventListResult,
//    getMatchNetExposure,
//   getMatchNetExposurepost
// };


//=====================


// controllers/eventResultController.js
import axios from 'axios';
import SportsBet from '../model/user/SportsBet.js'
import User from '../model/user/User.js'; 

export const getEventResult = async (req, res) => {
  try {
    const { eventid } = req.query;
    if (!eventid) return res.status(400).json({ error: 'eventid parameter is required' });

    const response = await axios.get(
      `http://91.108.105.111:5000/api/result/event-result?eventid=${eventid}`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching event result:', error.message);
    res.status(500).json({
      error: 'Failed to fetch event result',
      details: error.response?.data || error.message
    });
  }
};

export const getEventListResult = async (req, res) => {
  try {
    const { sid } = req.query;
    if (!sid) return res.status(400).json({ error: 'sid (sport id) parameter is required' });

    const response = await axios.get(
      `http://91.108.105.111:5000/api/result/event-list?sid=${sid}`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching event list:', error.message);
    res.status(500).json({
      error: 'Failed to fetch event list',
      details: error.response?.data || error.message
    });
  }
};

// Generic helper to calculate profit/liability
const calculateExposure = (bets) => {
  let totalStake = 0;
  let teamOneProfit = 0, teamOneLiability = 0;
  let teamTwoProfit = 0, teamTwoLiability = 0;

  bets.forEach(bet => {
    const stake = bet.stake_amount;
    const odds = bet.odds;
    const liability = bet.liability;

    totalStake += liability;

    if (bet.selection_name === bet.team_one) {
      if (bet.bet_type === 'back') {
        teamOneProfit += (odds - 1) * stake;
        teamTwoLiability += liability;
      } else {
        teamTwoProfit += stake;
        teamOneLiability += liability;
      }
    }

    if (bet.selection_name === bet.team_two) {
      if (bet.bet_type === 'back') {
        teamTwoProfit += (odds - 1) * stake;
        teamOneLiability += liability;
      } else {
        teamOneProfit += stake;
        teamTwoLiability += liability;
      }
    }
  });

  const format = (num) => Number(num.toFixed(2));

  return {
    totalStake: format(totalStake),
    teamOne: {
      profit: format(teamOneProfit),
      liability: format(teamOneLiability),
      netExposure: format(teamOneLiability - teamOneProfit)
    },
    teamTwo: {
      profit: format(teamTwoProfit),
      liability: format(teamTwoLiability),
      netExposure: format(teamTwoLiability - teamTwoProfit)
    },
    draw: {
      liability: format(teamOneLiability + teamTwoLiability)
    }
  };
};

export const getMatchNetExposure = async (req, res) => {
  try {
    const { matchId } = req.params;

    const bets = await SportsBet.findAll({
      where: { match_id: matchId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(calculateExposure(bets));
  } catch (error) {
    console.error('Error in getMatchNetExposure:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMatchNetExposurePost = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userIds } = req.body;

    const whereClause = { match_id: matchId };
    if (userIds?.length > 0) whereClause.user_id = userIds;

    const bets = await SportsBet.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(calculateExposure(bets));
  } catch (error) {
    console.error('Error in getMatchNetExposurePost:', error);
    res.status(500).json({ error: error.message });
  }
};



const ctlresult = {
  getEventResult,
  getEventListResult,
  getMatchNetExposure,
  getMatchNetExposurePost
};

export default ctlresult;

