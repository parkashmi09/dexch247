


// controllers/eventsController.js
import axios from 'axios';
import SportsConfig from '../models/SportsConfig.js';

// Helper: validate if a sport is enabled
const validateSportsConfig = async (sportId) => {
  const sport = await SportsConfig.findOne({
    where: { game_id: sportId, enabled: true }
  });
  return !!sport;
};

// Get events by Sports ID
export const getEventsBySportsID = async (req, res) => {
  try {
    const { id: sportId } = req.query;
    if (!sportId) {
      return res.status(400).json({ error: 'Sports ID is required' });
    }

    const isEnabled = await validateSportsConfig(sportId);
    if (!isEnabled) {
      return res.status(403).json({ error: 'Game not enabled', id: sportId });
    }

    const response = await axios.get(`http://91.108.105.111:5000/api/getEventsBySportsID?id=${sportId}`, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      }
    });

    console.log('Fetched Events:', response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Events by Sports ID fetch error:', error);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ error: 'Error fetching events by sports ID', details: error.message });
  }
};

// Get events by Series and Sports ID
export const getEventsBySeriesAndSportsID = async (req, res) => {
  try {
    const { sid: seriesId, sportid: sportId } = req.query;

    if (!seriesId || !sportId) {
      return res.status(400).json({ error: 'Series ID and Sports ID are required' });
    }

    const isEnabled = await validateSportsConfig(sportId);
    if (!isEnabled) {
      return res.status(403).json({ error: 'Game not enabled', id: sportId });
    }

    const response = await axios.get(`http://91.108.105.111:5000/api/getEvents?sid=${seriesId}&sportid=${sportId}`, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY
      }
    });

    console.log('Fetched Events by Series and Sports ID:', response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Events by Series and Sports ID fetch error:', error);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ error: 'Error fetching events by series and sports ID', details: error.message });
  }
};
