

import dotenv from "dotenv";
dotenv.config();
import CricketService from "../../../services/CricketService.js";
import { Op } from "sequelize";
import SportsBet from '../../../model/user/SportsBet.js';
import User from '../../../model/user/User.js';


/* -------------------------------------------------------------
   Helper – safe string (null if missing/empty)
   ------------------------------------------------------------- */
const safeStr = (val) => {
  if (val == null || val === '') return null;
  return String(val).trim();
};

/* -------------------------------------------------------------
   Helper – safe integer (clamped to >=1, fallback if invalid)
   ------------------------------------------------------------- */
const safeInt = (val, fallback = 1) => {
  if (val == null || val === '') return fallback;
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : Math.max(1, n);
};


const CricketController = {





  // fetch sports data by ID it will show all the data related to games id , ex : if 4 is cricket then it will show all the data [matches or events]related to cricket
  fetchCricketData: async (req, res) => {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID is required to fetch cricket data"
      });
    }

    try {
      const cricketData = await CricketService.fetchCricketData(id);
      return res.status(200).json({
        success: true,
        data: cricketData
      });
    } catch (error) {
      console.error('❌ Error:', error.message);

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  getSportdetailsById: async (req, res) => {
    const { gmid, sid } = req.body; // gmid is game id and sid is sport id
    if (!sid || !gmid) {
      return res.status(400).json({
        success: false,
        error: "Sport ID and Game ID are required to fetch data"
      });
    }
    try {
      const sportData = await CricketService.getSportDataById(gmid, sid);
      console.log('✅ Sport Data:', sportData);
      return res.status(200).json({
        success: true,
        data: sportData
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  GetallSportsdata: async (req, res) => {
    try {
      const allSportsData = await CricketService.GetallSportsdata();
      console.log('✅ All Sports Data:', allSportsData);

      return res.status(200).json({
        success: true,
        data: allSportsData
      });
    }
    catch (error) {
      console.error('❌ Error:', error.message);

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  GetMatchPrivateData: async (req, res) => {
    const { gmid, sid } = req.body; // gmid is game id
    if (!gmid || !sid) {
      return res.status(400).json({
        success: false,
        error: "Game ID || sid is required to fetch match private data"
      });
    }
    try {
      const matchPrivateData = await CricketService.GetMatchPrivateData(gmid, sid);
      return res.status(200).json({
        success: true,
        data: matchPrivateData
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  fetchLiveStream: async (req, res) => { //curently not used, url hardcoded
    const { gmid } = req.body;
    if (!gmid) {
      return res.status(400).json({
        success: false,
        error: "Game ID is required to fetch live stream data"
      });
    }
    try {
      const liveStreamData = await CricketService.fetchLiveStream(gmid);
      console.log('✅ Live Stream Data:', liveStreamData);

      return res.status(200).json({
        success: true,
        data: liveStreamData
      });
    }
    catch (error) {
      console.error('❌ Error:', error.message);

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  fetchScoreCard: async (req, res) => {
    const { gmid, sid } = req.body;
    console.log("====>>>>scorecard_logs: " + gmid + " sid: " + sid)

    if (!gmid) {
      return res.status(400).json({
        success: false,
        error: "Game ID is required to fetch score card"
      });
    }
    if (!sid) {
      return res.status(400).json({
        success: false,
        error: "Sid is required to fetch score card"
      });
    }

    try {
      console.log(`[ScoreCard] Fetching scorecard for gmid=${gmid} sid=${sid}`);
      // Primary: AVRKHUB /scorecard (works for all sports, no gtv needed)
      const scoreCard = await CricketService.fetchScoreCard(gmid, sid);
      console.log('✅ Score Card:', scoreCard);

      return res.status(200).json({
        success: true,
        data: scoreCard
      });

    } catch (primaryError) {
      // Fallback: legacy gtv-based lookup (kept for compatibility)
      console.warn('⚠️ Primary scorecard failed, trying gtv fallback:', primaryError.message);
      try {
        const matchRes = await CricketService.getSportDataById(gmid, sid);
        const match = matchRes?.data?.[0];
        const gtv = match?.gtv;

        if (!gtv) {
          return res.status(200).json({
            success: false,
            error: "Scorecard not available: gtv cannot be fetched"
          });
        }

        const scoreCard = await CricketService.fetchScoreCard(gtv, sid);
        console.log('✅ Score Card (gtv fallback):', scoreCard);
        return res.status(200).json({ success: true, data: scoreCard });

      } catch (fallbackError) {
        console.error('❌ ScoreCard Error (all sources failed):', fallbackError.message);
        return res.status(500).json({
          success: false,
          error: fallbackError.message
        });
      }
    }
  },



  fetchTreeData: async (req, res) => {
    try {
      const treeData = await CricketService.fetchTreeData();
      console.log('✅ Tree Data:', treeData);
      return res.status(200).json({
        success: true,
        data: treeData
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },




  GetResults: async (req, res) => {
    const { event_id, event_name, market_id, market_name, sid } = req.body;
    if (!event_id || !event_name || !market_id || !market_name || !sid) {
      return res.status(400).json({
        success: false,
        error: "Event ID, Event Name, Market ID, Market Name, Market Type and SID are required to get results"
      });
    }

    try {
      const resultsData = await CricketService.GetResult(sid, event_id, event_name, market_id, market_name);
      console.log('✅ Results Data:', resultsData);
      return res.status(200).json({
        success: true,
        data: resultsData
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
  getAllSportsBets: async (req, res) => {
    try {
      const bets = await CricketService.getAllSportsBets();
      return res.status(200).json({ success: true, data: bets });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  // used by user to get his own bets
  getSportsBetsByUserId: async (req, res) => {
    const user_id = req.user?.account?.id || req.user?.id;
    if (!user_id) {
      return res.status(401).json({ success: false, error: 'Unauthorized: user_id missing' });
    }
    try {
      const { page, limit, search, betType } = req.query;
      const result = await CricketService.getSportsBetsByUserId(user_id, { page, limit, search, betType });
      return res.status(200).json({ success: true, data: result.rows, pagination: result.pagination });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // used by admin to get particular user's bets
  getSportsBetsOfUser: async (req, res) => {

    //validation
    const role = req.user?.role;
    if (role === 'User') {
      return res.status(401).json({ success: false, error: 'Unauthorized: user not allowed' });
    }


    const user_id = req.body.user_id;
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    try {
      const bets = await CricketService.getSportsBetsByUserId(user_id);
      return res.status(200).json({ success: true, data: bets });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  },


  getWinsByUserId: async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ success: false, error: 'Unauthorized: user_id missing' });
    }
    try {
      const wins = await CricketService.getWinsByUserId(user_id);
      return res.status(200).json({ success: true, data: wins });
    } catch (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  },


  getTotalStakeOnEvent: async (req, res) => {
    try {
      // 1. Query only the columns we need + sum
      const totals = await SportsBet.findAll({
        attributes: [
          'eventid',
          [SportsBet.sequelize.fn('SUM', SportsBet.sequelize.col('stake_amount')), 'total_stake'],
          [SportsBet.sequelize.fn('COUNT', SportsBet.sequelize.col('id')), 'bets_count'],
        ],
        where: {
          // optional: ignore cancelled / voided bets
          // status: { [Op.notIn]: ['void', 'cancelled'] },
          eventid: { [Op.ne]: null }, // skip rows without eventid
        },
        group: ['eventid'],
        order: [[SportsBet.sequelize.literal('total_stake'), 'DESC']],
        raw: true, // return plain objects (no Sequelize instances)
      });

      // 2. Cast numeric strings to real numbers & format nicely
      const result = totals.map(row => ({
        eventid: row.eventid,
        total_stake: parseFloat(row.total_stake).toFixed(2), // e.g. "12345.00"
        bets_count: Number(row.bets_count),
      }));

      return res.status(200).json({
        success: true,
        data: result,
        meta: {
          total_events: result.length,
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in getTotalStakeOnEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },

  getTotalStakeOnLiveAndUpcomingEvents: async (req, res) => {
    try {
      const totals = await SportsBet.findAll({
        attributes: [
          'eventid',
          [SportsBet.sequelize.fn('SUM', SportsBet.sequelize.col('stake_amount')), 'total_stake'],
          [SportsBet.sequelize.fn('COUNT', SportsBet.sequelize.col('id')), 'bets_count'],
        ],
        where: {
          eventid: { [Op.ne]: null },
          result_status: 'pending', // Only live or upcoming matches
          // Optional: exclude void/cancelled bets
          // status: { [Op.notIn]: ['void', 'cancelled', 'deleted'] },
        },
        group: ['eventid'],
        order: [[SportsBet.sequelize.literal('total_stake'), 'DESC']],
        raw: true,
      });

      const result = totals.map(row => ({
        eventid: row.eventid,
        total_stake: parseFloat(row.total_stake).toFixed(2),
        bets_count: Number(row.bets_count),
      }));

      return res.status(200).json({
        success: true,
        data: result,
        meta: {
          total_events: result.length,
          filter: 'live_and_upcoming_only',
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in getTotalStakeOnLiveAndUpcomingEvents:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },

  // 1. Get ALL matched bets for an event for admin only
  getMatchedBetsByEvent: async (req, res) => {
    try {
      const { eventid } = req.query;
      if (!eventid) {
        return res.status(400).json({
          success: false,
          error: 'eventid is required',
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows } = await SportsBet.findAndCountAll({
        where: {
          eventid: eventid.toString(),
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['username'],
          required: false
        }],
        attributes: { exclude: ['job_id'] },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        raw: false,
      });

      const bets = rows.map(bet => {
        const betPlain = bet.get({ plain: true });
        return {
          ...betPlain,
          stake_amount: parseFloat(betPlain.stake_amount).toFixed(2),
          odds: parseFloat(betPlain.odds).toFixed(4),
          liability: betPlain.liability ? parseFloat(betPlain.liability).toFixed(2) : null,
          usd_amount: betPlain.usd_amount ? parseFloat(betPlain.usd_amount).toFixed(2) : null,
        };
      });

      return res.status(200).json({
        success: true,
        data: bets,
        pagination: {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit),
        },
        meta: {
          eventid,
          filter: 'matched_bets',
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in getMatchedBetsByEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },

  // 2. Get only OPEN (pending result) bets for an event
  getOpenBetsByEvent: async (req, res) => {
    try {
      const { eventid } = req.query;
      if (!eventid) {
        return res.status(400).json({
          success: false,
          error: 'eventid is required',
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows } = await SportsBet.findAndCountAll({
        where: {
          eventid: eventid.toString(),
          result_status: 'pending', // Only unsettled bets
          // status: { [Op.notIn]: ['void', 'cancelled', 'deleted'] },
          // eventid: { [Op.ne]: null },
        },
        attributes: { exclude: ['job_id', 'ip_address'] },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        raw: true,
      });

      const bets = rows.map(bet => ({
        ...bet,
        stake_amount: parseFloat(bet.stake_amount).toFixed(2),
        odds: parseFloat(bet.odds).toFixed(4),
        liability: bet.liability ? parseFloat(bet.liability).toFixed(2) : null,
        usd_amount: bet.usd_amount ? parseFloat(bet.usd_amount).toFixed(2) : null,
      }));

      return res.status(200).json({
        success: true,
        data: bets,
        pagination: {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit),
        },
        meta: {
          eventid,
          filter: 'open_bets_only',
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in getOpenBetsByEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },

  /**
   * 1. Get ALL matched bets of a USER on a specific event
   */
  getUserMatchedBetsByEvent: async (req, res) => {
    try {
      const { eventid, user_id } = req.query;

      if (!eventid || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'Both eventid and user_id are required',
        });
      }

      const page = safeInt(req.query.page) || 1;
      const limit = safeInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows } = await SportsBet.findAndCountAll({
        where: {
          eventid: eventid.toString(),
          user_id: user_id.toString(),
          status: { [Op.notIn]: ['void', 'cancelled', 'deleted'] },
          eventid: { [Op.ne]: null },
        },
        attributes: { exclude: ['job_id', 'ip_address'] }, // hide sensitive
        order: [['created_at', 'DESC']],
        limit,
        offset,
        raw: true,
      });

      const bets = rows.map(bet => ({
        ...bet,
        stake_amount: parseFloat(bet.stake_amount).toFixed(2),
        odds: parseFloat(bet.odds).toFixed(4),
        liability: bet.liability ? parseFloat(bet.liability).toFixed(2) : null,
        usd_amount: bet.usd_amount ? parseFloat(bet.usd_amount).toFixed(2) : null,
      }));

      return res.status(200).json({
        success: true,
        data: bets,
        pagination: {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit),
        },
        meta: {
          eventid,
          user_id,
          filter: 'user_matched_bets',
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in getUserMatchedBetsByEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },

  /**
   * 2. Get only OPEN (pending result) bets of a USER on a specific event
   */
  getUserOpenBetsByEvent: async (req, res) => {
    try {
      const { eventid, user_id } = req.query;

      if (!eventid || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'Both eventid and user_id are required',
        });
      }

      const page = safeInt(req.query.page) || 1;
      const limit = safeInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows } = await SportsBet.findAndCountAll({
        where: {
          eventid: eventid.toString(),
          user_id: user_id.toString(),
          result_status: 'pending', // Only unsettled
          status: { [Op.notIn]: ['void', 'cancelled', 'deleted'] },
          eventid: { [Op.ne]: null },
        },
        attributes: { exclude: ['job_id', 'ip_address'] },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        raw: true,
      });

      const bets = rows.map(bet => ({
        ...bet,
        stake_amount: parseFloat(bet.stake_amount).toFixed(2),
        odds: parseFloat(bet.odds).toFixed(4),
        liability: bet.liability ? parseFloat(bet.liability).toFixed(2) : null,
        usd_amount: bet.usd_amount ? parseFloat(bet.usd_amount).toFixed(2) : null,
      }));

      return res.status(200).json({
        success: true,
        data: bets,
        pagination: {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit),
        },
        meta: {
          eventid,
          user_id,
          filter: 'user_open_bets_only',
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in getUserOpenBetsByEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },

  /**
   * 3. Get ONLY OPEN bets for a specific event and user (Fresh Implementation)
   */
  getUserOpenBetsForEvent: async (req, res) => {
    try {
      const { eventid, user_id } = req.query;

      console.log('getUserOpenBetsForEvent called with:', { eventid, user_id });

      if (!eventid || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'Both eventid and user_id are required',
        });
      }

      const bets = await SportsBet.findAll({
        where: {
          eventid: eventid.toString(),
          user_id: user_id.toString(),
          status: { [Op.in]: ['open', 'manual', 'matched'] },
        },
        attributes: { exclude: ['job_id', 'ip_address'] },
        order: [['created_at', 'DESC']],
        raw: true,
      });

      const formattedBets = bets.map(bet => ({
        ...bet,
        stake_amount: parseFloat(bet.stake_amount).toFixed(2),
        odds: parseFloat(bet.odds).toFixed(4),
        liability: bet.liability ? parseFloat(bet.liability).toFixed(2) : null,
        usd_amount: bet.usd_amount ? parseFloat(bet.usd_amount).toFixed(2) : null,
      }));

      return res.status(200).json({
        success: true,
        data: formattedBets,
        meta: {
          eventid,
          user_id,
          filter: 'fresh_open_bets_only',
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error in getUserOpenBetsForEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  },


};

export default CricketController;