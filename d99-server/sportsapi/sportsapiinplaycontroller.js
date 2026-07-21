




import axios from 'axios';
import { filterEnabledGames } from './gamefilter.js';
import SportsConfig from '../model/user/SportsConfig.js';
import 'dotenv/config';

console.log('Loading sportsapiinplaycontroller...');

export const getInplayData = async (req, res) => {
  try {
    console.log('Inplay Data Request Received:', req.body);

    const response = await axios.get('http://91.108.105.111:5000/api/inplay', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    if (req.body.gameId) {
      const filteredData = response.data.filter(item => item.id === req.body.gameId.toString());
      if (!filteredData.length) {
        return res.status(404).json({
          error: 'No data found for the specified game',
          requestedGameId: req.body.gameId
        });
      }
      return res.json(filteredData[0]);
    }

    const filteredGames = await filterEnabledGames(response.data);
    res.json(filteredGames);

  } catch (error) {
    console.error('Inplay data fetch error:', error);
    res.status(500).json({ error: 'Error fetching inplay data', details: error.message });
  }
};

export const getAllEnabledGames = async (req, res) => {
  try {
    const response = await axios.get('http://91.108.105.111:5000/api/inplay', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    const filteredGames = await filterEnabledGames(response.data);
    res.json(filteredGames);

  } catch (error) {
    console.error('All games fetch error:', error);
    res.status(500).json({ error: 'Error fetching games' });
  }
};

export const getInPlayByGameId = async (req, res) => {
  try {
    const { gameId } = req.params;
    if (!gameId) return res.status(400).json({ error: 'Game ID parameter is required' });

    // Use Sequelize model instead of raw SQL
    const gameConfig = await SportsConfig.findOne({
      where: { game_id: gameId, enabled: true }
    });

    if (!gameConfig) return res.status(404).json({ error: 'Game not found or not enabled', gameId });

    const response = await axios.get('http://91.108.105.111:5000/api/inplay', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    const filteredGames = response.data.filter(game => game.id.toString() === gameId.toString());

    res.json({
      gameConfig: {
        id: gameConfig.id,
        gameId: gameConfig.game_id,
        gameName: gameConfig.game_name,
        enabled: gameConfig.enabled
      },
      games: filteredGames,
      totalGames: filteredGames.length
    });

  } catch (error) {
    console.error('Game ID fetch error:', error);
    res.status(500).json({ error: 'Error fetching games for game ID', gameId: req.params.gameId });
  }
};

export const getAllSportsdata = async (req, res) => {
  try {
    const [homeRes, inplayRes] = await Promise.all([
      axios.get('http://91.108.105.111:5000/api/home', {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
        }
      }),
      axios.get('http://91.108.105.111:5000/api/inplay', {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
        }
      })
    ]);

    const homeGames = await filterEnabledGames(homeRes.data);
    const inplayGames = await filterEnabledGames(inplayRes.data);

    const maxMarkets = 5;
    const flattenMarkets = games =>
      games.flatMap(sport =>
        (sport.markets || []).map(market => ({
          ...market,
          categoryId: sport.id,
          categoryName: sport.name
        }))
      );

    const mergedMarkets = [
      ...flattenMarkets(inplayGames).slice(0, maxMarkets),
      ...flattenMarkets(homeGames).slice(0, Math.max(0, maxMarkets - inplayGames.length))
    ];

    res.json(mergedMarkets);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching matches' });
  }
};
