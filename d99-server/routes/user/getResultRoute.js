import express from 'express';
import dotenv from "dotenv";
import axios from 'axios';

const router = express.Router();
dotenv.config();

const BASE_URL = process.env.DIAMOND_BASE_URL;
const API_KEY = process.env.DIAMOND_API_KEY;
// OLD: TurnkeyXGaming (dead — connection refused on 103.161.26.78:8086)
// router.post('/get-result', async (req, res) => {
//   const { event_id, sid } = req.body;
//   if (!event_id) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }
//   try {
//     const apiUrl = `http://cloud.turnkeyxgaming.com:8086/sports/posted-market-result?sportsid=${sid}&gmid=${event_id}`;
//     const response = await axios.get(apiUrl, {
//       headers: { "x-turnkeyxgaming-key": "6989891694106e1978c297b6" },
//       timeout: 60000,
//       validateStatus: () => true
//     });
//     return res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error('[get-result] fetch error', error);
//     return res.status(500).json({ error: error.message || 'Unknown error' });
//   }
// });

// NEW: DIAMOND middleware (130.250.191.212:3009)
router.post('/get-result', async (req, res) => {
  const { event_id, sid, market_id, event_name, market_name } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const BASE_URL = process.env.DIAMOND_BASE_URL || 'http://130.250.191.212:3009';
    const API_KEY = process.env.DIAMOND_API_KEY || 'diamond99_demokey1';

    const response = await axios.post(
      `${BASE_URL}/get-result`,
      {
        event_id,
        market_id: market_id || event_id,
        event_name: event_name || '',
        market_name: market_name || '',
      },
      {
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/json",
        },
        params: {
          sid: sid || '4',
          key: API_KEY,
        },
        timeout: 60000,
        validateStatus: () => true
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[get-result] fetch error', error);
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

export default router;