import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

const router = express.Router();
dotenv.config();

// AVRKHUB result API — GET-based, no API key required
// Usage: POST /result/get-result-v2  { event_id, sid }
// Proxies to: GET https://diamond-result-v2.avrkhub.in/get_result?gmid=EVENT_ID&sid=SID

const AVRKHUB_BASE_URL = process.env.AVRKHUB_BASE_URL || 'https://diamond-result-v2.avrkhub.in';

router.post('/get-result-v2', async (req, res) => {
  const { event_id, sid } = req.body;

  if (!event_id) {
    return res.status(400).json({ success: false, error: 'Missing required field: event_id' });
  }

  try {
    const apiUrl = `${AVRKHUB_BASE_URL}/get_result`;

    const response = await axios.get(apiUrl, {
      params: {
        gmid: event_id,
        sid: sid || '4',
      },
      headers: {
        'Accept': 'application/json',
      },
      timeout: 60000,
      validateStatus: () => true,
    });

    // Normalize response to match expected shape used by settlement workers:
    // { success, markets: [...] }
    const raw = typeof response.data === 'string'
      ? JSON.parse(response.data)
      : response.data;

    return res.status(response.status).json(raw);
  } catch (error) {
    const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
    if (isTimeout) {
      console.error('[get-result-v2] TIMEOUT fetching result', error.message);
      return res.status(504).json({ success: false, error: 'Upstream timeout: Result fetching took too long' });
    }
    console.error('[get-result-v2] fetch error', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

export default router;
