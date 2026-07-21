

import axios from 'axios';
import 'dotenv/config'; // Load environment variables

// Function to fetch all sports IDs
export const getAllSportsID = async (req, res) => {
  try {
    // Make request to external API to fetch all sports IDs
    const response = await axios.get('http://91.108.105.111:5000/api/allSportsID', {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31',
        'x-rapidapi-host': process.env.RAPIDAPI_HOST ?? 'betfair14.p.rapidapi.com',
        'X-ScoreSwift-Key': process.env.SCORESWIFT_KEY ?? 'eNp57Jb7yHgI26S8Yw4u_v31'
      }
    });

    // Log the fetched sports IDs
    console.log('Fetched All Sports IDs:', response.data);

    // Return the response directly without any filtering
    res.json(response.data);
  } catch (error) {
    console.error('All Sports ID fetch error:', error);

    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);

      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      error: 'Error fetching all sports IDs',
      details: error.message
    });
  }
};
