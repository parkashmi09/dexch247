

//====================

import axios from 'axios';
import 'dotenv/config'; // Load environment variables

// Function to get line market (by Event ID)
export const getLineMarket = async (req, res) => {
  try {
    const { eventid } = req.query;

    // Validate event ID is provided
    if (!eventid) {
      return res.status(400).json({
        error: 'Event ID is required'
      });
    }

    // Make request to external API with event ID
    const response = await axios.get(
      `http://91.108.105.111:5000/api/GetLineMarket?eventid=${eventid}`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
          'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
          'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
        }
      }
    );

    // Log the fetched market IDs
    console.log(`Fetched line market for Event ID ${eventid}:`, response.data);

    // Return the response directly
    res.json(response.data);
  } catch (error) {
    console.error('Line market fetch error:', error);

    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);

      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      error: 'Error fetching line market',
      details: error.message
    });
  }
};
