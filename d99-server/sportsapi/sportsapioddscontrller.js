



import axios from 'axios';
import 'dotenv/config';
import SportsMarket from '../model/user/SportsMarket.js'; // Sequelize model

export const getMarketOdds = async (req, res) => {
  try {
    const { market_id } = req.query;

    if (!market_id) {
      return res.status(400).json({ error: 'Market ID(s) are required' });
    }

    // Check if the market exists and is enabled in DB
    const market = await SportsMarket.findOne({ where: { market_id, enabled: true } });
    if (!market) {
      return res.status(404).json({ error: 'Market not found or disabled', market_id });
    }

    const encodedMarketIds = encodeURIComponent(market_id);

    // Fetch odds from external API
    const response = await axios.get(`http://91.108.105.111:5000/api/GetMarketOdds?market_id=${encodedMarketIds}`, {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    console.log(`Fetched Market Odds for Market ID(s) ${market_id}:`, response.data);

    res.json(response.data);

  } catch (error) {
    console.error('Market Odds fetch error:', error);

    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ error: 'Error fetching market odds', details: error.message });
  }
};
