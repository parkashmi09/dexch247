

import axios from 'axios';
import moment from 'moment';
import { filterEnabledGames } from './gamefilter.js';

const APP_TZ = process.env.APP_TZ || 'Asia/Kolkata';

const SPORT_NAME_BY_ID = {
  "4": "Cricket",
  "2": "Tennis",
  "1": "Soccer",
  "6423": "American Football",
  "7511": "Baseball",
  "7522": "Basketball",
  "6": "Boxing",
  "3503": "Darts",
  "2152880": "Gaelic Games",
  "3": "Golf",
  "4339": "Greyhound Racing",
  "15": "Greyhound Todays Card",
  "13": "Horse Race Todays Card",
  "7": "Horse Racing",
  "26420387": "Mixed Martial Arts",
  "8": "Motor Sport",
  "1477": "Rugby League",
  "5": "Rugby Union",
  "6422": "Snooker"
};

const IST_OFFSET = 330;

// --- Helper to get date range for today/tomorrow
function getRange(dateType) {
  const base = moment().utcOffset(IST_OFFSET).startOf('day');
  if (dateType === 'today') return { start: base.clone(), end: base.clone().endOf('day') };
  if (dateType === 'tomorrow') {
    const t = base.clone().add(1, 'day');
    return { start: t.clone(), end: t.clone().endOf('day') };
  }
  return null;
}

// --- Helper: earliest market start time
function getEarliestMarketStart(game) {
  if (!game?.markets?.length) return null;
  let min = null;
  for (const m of game.markets) {
    const dt = m?.marketStartTime ? moment(m.marketStartTime) : null;
    if (dt?.isValid() && (!min || dt.isBefore(min))) min = dt;
  }
  return min;
}

// --- Get all matches
const getAllMatches = async (req, res) => {
  try {
    const response = await axios.get('http://91.108.105.111:5000/api/home', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      }
    });
    const filteredGames = await filterEnabledGames(response.data);
    res.json(filteredGames);
  } catch (error) {
    console.error('All matches fetch error:', error);
    res.status(500).json({ error: 'Error fetching matches' });
  }
};

// --- Get matches by game ID
const getMatchesByGameId = async (req, res) => {
  try {
    const { gameId } = req.params;
    const response = await axios.get('http://91.108.105.111:5000/api/home', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      }
    });

    const filteredGames = await filterEnabledGames(response.data);
    const matchesForGame = filteredGames.find(game => String(game.id) === String(gameId));

    if (!matchesForGame) return res.status(404).json({ error: 'No matches found for the specified game ID' });

    res.json(matchesForGame);
  } catch (error) {
    console.error('Matches by game ID fetch error:', error);
    res.status(500).json({ error: 'Error fetching matches by game ID' });
  }
};

// --- Get matches by date ('today'/'tomorrow')
const getMatchesByDate = async (req, res) => {
  try {
    const { dateType } = req.params;
    const response = await axios.get('http://91.108.105.111:5000/api/home', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      }
    });

    const filteredGames = await filterEnabledGames(response.data);
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'days').startOf('day');

    const filteredMatchesByDate = filteredGames.filter(game => {
      const matchDate = moment(game.markets[0].marketStartTime);
      return dateType === 'today' ? matchDate.isSame(today, 'day') : matchDate.isSame(tomorrow, 'day');
    });

    const processedMatches = filteredMatchesByDate.map(game => ({
      ...game,
      isInPlay: game.markets.some(market => market.inplay === true)
    }));

    res.json(processedMatches);
  } catch (error) {
    console.error('Matches by date fetch error:', error);
    res.status(500).json({ error: 'Error fetching matches by date' });
  }
};

// --- Get matches by game and date
const getMatchesByDateGame = async (req, res) => {
  const { dateType, gameId } = req.params;
  if (!['today','tomorrow'].includes(dateType)) return res.status(400).json({ error: "dateType must be 'today' or 'tomorrow'" });
  if (!/^\d+$/.test(gameId)) return res.status(400).json({ error: 'gameId must be numeric' });

  const range = getRange(dateType);
  if (!range) return res.status(400).json({ error: 'Invalid dateType' });

  try {
    const response = await axios.get('http://91.108.105.111:5000/api/home', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      },
      timeout: 15000
    });

    const allGames = Array.isArray(response.data) ? response.data : [];
    if (!allGames.length) return res.json([]);

    const enabledGames = await filterEnabledGames(allGames);
    const sportGames = enabledGames.filter(g => String(g.id) === String(gameId));
    if (!sportGames.length) return res.json([]);

    const { start, end } = range;
    const byDate = sportGames.filter(g => {
      const first = getEarliestMarketStart(g);
      if (!first) return false;
      const local = moment(first).utcOffset(IST_OFFSET);
      return local.isSameOrAfter(start) && local.isSameOrBefore(end);
    });

    const processed = byDate.map(g => ({
      ...g,
      sportId: String(gameId),
      sportName: SPORT_NAME_BY_ID[String(gameId)] ?? g.name ?? 'Unknown',
      isInPlay: Array.isArray(g.markets) && g.markets.some(m => m?.inplay === true)
    }));

    return res.json(processed);
  } catch (error) {
    console.error('Matches by game & date error:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Error fetching matches by game and date' });
  }
};

// --- Get combined home + in-play sports data
const getAllSportsdata = async (req, res) => {
  try {
    const homeRes = await axios.get('http://91.108.105.111:5000/api/home', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      }
    });
    const homeGames = await filterEnabledGames(homeRes.data);

    const inplayRes = await axios.get('http://91.108.105.111:5000/api/inplay', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      }
    });
    const inplayGames = await filterEnabledGames(inplayRes.data);

    const maxMarkets = 5;
    const flattenMarkets = (games) => games.flatMap(sport =>
      (sport.markets || []).map(market => ({
        ...market,
        categoryId: sport.id,
        categoryName: sport.name
      }))
    );

    const inplayMarkets = flattenMarkets(inplayGames);
    const homeMarkets = flattenMarkets(homeGames);
    const mergedMarkets = [
      ...inplayMarkets.slice(0, maxMarkets),
      ...homeMarkets.slice(0, Math.max(0, maxMarkets - inplayMarkets.length))
    ];

    res.json(mergedMarkets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching matches" });
  }
};

export {
  getAllMatches,
  getMatchesByGameId,
  getMatchesByDate,
  getMatchesByDateGame,
  getAllSportsdata
};
