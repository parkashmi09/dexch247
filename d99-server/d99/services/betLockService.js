
import Staff from '../../model/admin/Staff.js';
import User from '../../model/user/User.js';

/**
 * Recursively checks if betting is allowed for a user.
 * 
 * Rules:
 * 1. If user.bet_locked is true -> LOCKED (return false).
 * 2. If valid staff/parent chain has any bet_locked=true -> LOCKED (return false).
 * 3. Base case: Reached Owner (root) or no parent -> ALLOWED (return true).
 */
export const isBettingAllowed = async (userId) => {
    try {
        // 1. Check User first
        const user = await User.findByPk(userId, {
            attributes: ['user_id', 'bet_locked', 'parent_staff_id', 'parent_owner_id']
        });

        if (!user) {
             console.error(`BetLock: User ${userId} not found`);
             return false; // Fail safe
        }

        if (user.bet_locked) {
            console.log(`BetLock: User ${userId} is directly locked.`);
            return false;
        }

        // If directly under owner, we assume owner isn't "locked" in this context usually,
        // or we check owner table if needed. Typically owners are not locked by anyone.
        if (user.parent_owner_id) {
            // Optional: Check owner status if owners can be locked. Not requested.
            return true;
        }

        // 2. Check Staff Hierarchy
        let currentStaffId = user.parent_staff_id;

        while (currentStaffId) {
            const staff = await Staff.findByPk(currentStaffId, {
                attributes: ['staff_id', 'bet_locked', 'parent_id', 'parent_owner_id']
            });

            if (!staff) {
                // Orphaned or invalid parent? Break/Allow or Fail?
                // Let's assume safe to proceed if parent ref is broken unless strict.
                break;
            }

            if (staff.bet_locked) {
                console.log(`BetLock: User ${userId} blocked by Staff ${currentStaffId}`);
                return false;
            }

            // Move up
            if (staff.parent_owner_id) {
                // Reached top (owner)
                return true;
            }
            currentStaffId = staff.parent_id;
        }

        return true;
    } catch (error) {
        console.error("Error in isBettingAllowed:", error);
        return false; // Fail safe
    }
};

export default { isBettingAllowed };
