

import axios from 'axios';
import 'dotenv/config';
import SportsMarket from '../model/user/SportsMarket.js'; // Sequelize model

// Get Market IDs V1 (by Event ID)
export const getMarketIdsV1 = async (req, res) => {
  try {
    const { eventid } = req.query;
    if (!eventid) return res.status(400).json({ error: 'Event ID is required' });

    // Optional: check in DB if event exists/enabled
    const marketExists = await SportsMarket.findOne({ where: { event_id: eventid, enabled: true } });
    if (!marketExists) return res.status(404).json({ error: 'Event not found or disabled', eventid });

    const response = await axios.get(`http://91.108.105.111:5000/api/GetMarketIdsV1?eventid=${eventid}`, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    console.log(`Fetched Market IDs V1 for Event ID ${eventid}:`, response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Market IDs V1 fetch error:', error);
    if (error.response) return res.status(error.response.status).json(error.response.data);
    res.status(500).json({ error: 'Error fetching market IDs V1', details: error.message });
  }
};

// Get Market IDs V2 (by Market ID)
export const getMarketIdsV2 = async (req, res) => {
  try {
    const { market_id } = req.query;
    if (!market_id) return res.status(400).json({ error: 'Market ID is required' });

    // Optional: check in DB if market exists/enabled
    const marketExists = await SportsMarket.findOne({ where: { market_id, enabled: true } });
    if (!marketExists) return res.status(404).json({ error: 'Market not found or disabled', market_id });

    const response = await axios.get(`http://91.108.105.111:5000/api/GetMarketIdsV2?market_id=${market_id}`, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    console.log(`Fetched Market IDs V2 for Market ID ${market_id}:`, response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Market IDs V2 fetch error:', error);
    if (error.response) return res.status(error.response.status).json(error.response.data);
    res.status(500).json({ error: 'Error fetching market IDs V2', details: error.message });
  }
};
