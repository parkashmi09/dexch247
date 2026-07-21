


import axios from 'axios';
import 'dotenv/config';
import { filterSeriesData } from './seriesfilter.js';
import SportsConfig from '../model/user/SportsConfig.js'; // Sequelize model

export const getCompetitions = async (req, res) => {
  try {
    const gameId = req.query.id;

    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    // Check if the game is enabled in DB
    const gameConfig = await SportsConfig.findOne({
      where: { game_id: gameId, enabled: true }
    });

    if (!gameConfig) {
      return res.status(404).json({ error: 'Game not found or disabled', gameId });
    }

    // Fetch competitions from external API
    const response = await axios.get('http://91.108.105.111:5000/api/getCompetitions', {
      params: { id: gameId },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    // Filter competitions using your existing logic
    const filteredSeries = await filterSeriesData(response.data, gameId);

    res.json(filteredSeries);

  } catch (error) {
    console.error('Competitions fetch error:', error);

    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      error: 'Error fetching competitions',
      details: error.message
    });
  }
};
