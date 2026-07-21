import Staff from '../../model/admin/Staff.js';
import { Op } from 'sequelize';

/**
 * Helper to get all descendant staff IDs recursively
 * @param {number} staffId 
 * @returns {Promise<number[]>} Array of staff IDs including the root staffId
 */
export const getAllDescendantStaffIds = async (staffId) => {
  let allIds = [staffId];
  let currentIds = [staffId];

  while (currentIds.length > 0) {
    const children = await Staff.findAll({
      where: { parent_id: { [Op.in]: currentIds } },
      attributes: ['staff_id'],
      raw: true
    });

    if (children.length === 0) break;

    const childIds = children.map(c => c.staff_id);
    allIds = [...allIds, ...childIds];
    currentIds = childIds;
  }
  return allIds;
};
