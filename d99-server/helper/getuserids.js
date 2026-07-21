import User from "../model/user/User.js";
import { Op } from "sequelize";
import Staff from "../model/admin/Staff.js";
import Owner from "../model/admin/Owner.js";
import Role from '../model/admin/Role.js';

export const getUserIdsByHierarchy = async (role, username) => {
    const upperRole = role.toUpperCase();

    let ownerId = null;
    let rootStaffId = null;

    /* ───────── OWNER CASE ───────── */
    if (upperRole === 'OWNER') {
        const owner = await Owner.findOne({
            where: { username },
            attributes: ['owner_id'],
            raw: true
        });

        if (!owner) return [];

        ownerId = owner.owner_id;

        // 1️⃣ All staff under this owner
        const staffRows = await Staff.findAll({
            where: { parent_owner_id: ownerId },
            attributes: ['staff_id'],
            raw: true
        });

        const staffIds = staffRows.map(s => s.staff_id);

        // 2️⃣ All users under owner OR under those staff
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { parent_owner_id: ownerId },
                    staffIds.length
                        ? { parent_staff_id: { [Op.in]: staffIds } }
                        : null
                ].filter(Boolean)
            },
            attributes: ['user_id'],
            raw: true
        });

        return users.map(u => u.user_id);
    }

    /* ───────── STAFF ROLES CASE ───────── */
    // SUPERADMIN, ADMIN, COMPANY, SUPERMASTER, MASTER
    const staff = await Staff.findOne({
        where: { username },
        attributes: ['staff_id'],
        raw: true
    });

    if (!staff) return [];

    rootStaffId = staff.staff_id;

    // 🔁 Get all descendant staff (including self)
    const allStaffIds = [];
    let queue = [rootStaffId];

    while (queue.length) {
        const children = await Staff.findAll({
            where: { parent_id: { [Op.in]: queue } },
            attributes: ['staff_id'],
            raw: true
        });

        const childIds = children.map(c => c.staff_id);
        allStaffIds.push(...queue);
        queue = childIds;
    }

    // Include root staff
    if (!allStaffIds.includes(rootStaffId)) {
        allStaffIds.push(rootStaffId);
    }

    // 🔎 Final users under all staff
    const users = await User.findAll({
        where: {
            parent_staff_id: { [Op.in]: allStaffIds }
        },
        attributes: ['user_id'],
        raw: true
    });

    return users.map(u => u.user_id);
};