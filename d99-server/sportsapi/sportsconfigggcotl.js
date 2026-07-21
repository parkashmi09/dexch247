

//==============
// controllers/sportsController.js
import SportsConfig from '../models/SportsConfig.js';

class SportsController {
  // Get all sports
  static async getAllSports(req, res) {
    try {
      const sports = await SportsConfig.findAll();
      res.json({
        success: true,
        data: sports
      });
    } catch (error) {
      console.error('Error fetching all sports:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get a sport by ID
  static async getSportById(req, res) {
    try {
      const { id } = req.params;
      const sport = await SportsConfig.findByPk(id);

      if (!sport) {
        return res.status(404).json({
          success: false,
          error: 'Sport not found'
        });
      }

      res.json({
        success: true,
        data: sport
      });
    } catch (error) {
      console.error(`Error fetching sport ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update a sport's enabled status
  static async updateSport(req, res) {
    try {
      const { id } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Enabled status must be a boolean'
        });
      }

      const sport = await SportsConfig.findByPk(id);
      if (!sport) {
        return res.status(404).json({
          success: false,
          error: 'Sport not found'
        });
      }

      sport.enabled = enabled;
      sport.updated_at = new Date();
      await sport.save();

      res.json({
        success: true,
        data: sport
      });
    } catch (error) {
      console.error(`Error updating sport ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default SportsController;
