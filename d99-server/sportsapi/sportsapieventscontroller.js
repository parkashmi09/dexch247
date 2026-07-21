import axios from 'axios';
import 'dotenv/config';
import SportsConfig from '../model/user/SportsConfig.js';

// Validate if seriesId exists and is enabled using SportsConfig model
const validateSeriesId = async (seriesId) => {
  try {
    const config = await SportsConfig.findOne({
      where: {
        game_id: seriesId,
        enabled: true
      }
    });
    return !!config;
  } catch (error) {
    console.error('Series ID validation error:', error);
    throw error;
  }
};
// ...existing code...

// Get list of events by series ID
export const getEventListBySeriesId = async (req, res) => {
  try {
    const { sid: seriesId } = req.query;

    if (!seriesId) {
      return res.status(400).json({ error: 'Series ID is required' });
    }

    const isValid = await validateSeriesId(seriesId);
    if (!isValid) {
      console.warn(`Series ID ${seriesId} is not valid or enabled`);
      return res.status(403).json({ error: 'Invalid or disabled series ID', id: seriesId });
    }

    const apiResponse = await axios.get(
      `http://91.108.105.111:5000/api/result/event-list?sid=${seriesId}`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
          'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
          'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
        }
      }
    );

    console.log('Fetched Events:', apiResponse.data);
    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching events:', error);
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get event details by event ID
export const getEventDetailsByEventId = async (req, res) => {
  try {
    const { eventid: eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const apiResponse = await axios.get(
      `http://91.108.105.111:5000/api/result/event-result?eventid=${eventId}`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
          'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
          'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
        }
      }
    );

    console.log('Fetched Event Details:', apiResponse.data);
    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching event details:', error);

    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
