// models/SportsConfig.js
const  pg  = require('../General/Model');


class SportsConfig {
  static async getAllSports() {
    const query = `SELECT
     id,
     game_id,
     game_name,
     enabled,
     created_at,
     updated_at
   FROM sports_config`;
    const { rows } = await pg.query(query);
    return rows;
  }

  static async getSportById(id) {
    const query = `SELECT
     id,
     game_id,
     game_name,
     enabled,
     created_at,
     updated_at
   FROM sports_config WHERE id = $1`;
    const { rows } = await pg.query(query, [id]);
    return rows[0];
  }

  static async updateSport(id, enabled) {
    const query = `
      UPDATE sports_config 
      SET enabled = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const { rows } = await pg.query(query, [enabled, id]);
    return rows[0];
  }
}

module.exports = SportsConfig;

