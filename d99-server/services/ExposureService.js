

// services/exposure/exposureCalculator.js

import sequelize from '../config/db.js';

import Exposure from '../model/user/UserExposure.js';
import TotalExposure from '../model/user/TotalExposure.js'; // total exposure table CRUD not implemented yet , exposure is still in users_exposure table can use it and calculate total exp of user 


 async function getUserTotalExposure(user_id) {
  // Get the TotalExposure model instance
  const TotalExposure = (await import('../model/user/TotalExposure.js')).default;
  const record = await TotalExposure.findOne({ where: { user_id } });
  if (record) {
    return parseFloat(record.total_exposure);
  }
  return null;
}


async function getexpossurebyid(user_id, match_id) {
  console.log("Fetching exposure for user_id:", user_id, "and match_id:", match_id);
  const { Op } = (await import("sequelize"));
  return await Exposure.findAll({
    where: {
      user_id,
        [Op.or]: [
          { match_id: match_id },
          { event_id: match_id }
        ]
    },
  });
}
async function getUserExposures(userId) {
  // Fetch all exposures for this user
  const rows = await Exposure.findAll({
    where: { user_id: Number(userId) },
    raw: true,
  });

  const exposures = {};

  for (const row of rows) {
    const matchId = row.match_id;
    const teamName = row.team_name;
    const amount = Number(row.exposure_amount || 0);

    if (!exposures[matchId]) {
      exposures[matchId] = {
        match_title: row.match_title || '',
        teams: {},
      };
    }

    const current = Number(exposures[matchId].teams[teamName] || 0);
    exposures[matchId].teams[teamName] = current + amount;
  }

  return exposures;
}

export { getUserTotalExposure ,getexpossurebyid,getUserExposures};
