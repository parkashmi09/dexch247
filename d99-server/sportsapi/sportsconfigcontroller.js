


// controllers/sportsConfigController.js
import SportsConfig from '../models/SportsConfig.js';

// Get all sports configuration
export const getSportsConfig = async (req, res) => {
  try {
    const sports = await SportsConfig.findAll();
    res.json(sports);
  } catch (error) {
    console.error('Error fetching sports configuration:', error);
    res.status(500).json({
      error: 'Error fetching sports configuration',
      details: error.message,
    });
  }
};

// Add a new game
export const addGame = async (req, res) => {
  try {
    const { game_id, game_name, enabled } = req.body;

    if (!game_id || !game_name || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid or missing fields' });
    }

    const newGame = await SportsConfig.create({
      game_id,
      game_name,
      enabled,
    });

    res.status(201).json({
      message: 'Game added successfully',
      game: newGame,
    });
  } catch (error) {
    console.error('Add game error:', error);
    res.status(500).json({ error: 'Error adding game', details: error.message });
  }
};

// Update a game
export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { game_name, enabled } = req.body;

    const game = await SportsConfig.findByPk(id);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    if (game_name) game.game_name = game_name;
    if (typeof enabled === 'boolean') game.enabled = enabled;
    game.updated_at = new Date();

    await game.save();

    res.json({ message: 'Game updated successfully', game });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Error updating game', details: error.message });
  }
};

// Delete a game
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await SportsConfig.findByPk(id);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    await game.destroy();
    res.json({ message: 'Game deleted successfully', game });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Error deleting game', details: error.message });
  }
};
