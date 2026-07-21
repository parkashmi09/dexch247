import Staff from '../../model/admin/Staff.js';
import User from '../../model/user/User.js';
import Owner from '../../model/admin/Owner.js';
import WalletService from '../../services/walletService.js';
import sequelize from '../../config/db.js';
import bcrypt from 'bcryptjs';

const getUserModel = (userType) => {
    const type = userType.toUpperCase();
    if (type === 'USER') return User;
    if (type === 'OWNER') return Owner;
    return Staff;
};

// Helper: Fetch user by ID and Role
const fetchUser = async (userId, userType, transaction) => {
    const Model = getUserModel(userType);
    if (!Model) return null;
    return await Model.findByPk(userId, { transaction });
};

// 1. Update Credit Limit
export const updateCreditLimit = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId, userType, newCreditLimit, transactionPassword } = req.body;
        const initiatedBy = req?.user?.username || 'Admin';

        if (!userId || !userType || newCreditLimit === undefined) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const user = await fetchUser(userId, userType, transaction);
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentDbLimit = Number(user.credit_limit || 0);
        const newLimit = Number(newCreditLimit);
        const difference = currentDbLimit - newLimit;

        if (difference === 0) {
            await transaction.rollback();
            return res.status(200).json({ success: true, message: 'No change in credit limit' });
        }

        // Update limit
        user.credit_limit = newLimit;
        await user.save({ transaction });

        // Wallet Update
        const senderId = req.user?.user_id || req.user?.account?.id || req.user?.id;
        const senderRole = req.user?.role;
        const type = userType.toUpperCase();

        if (difference < 0) {
            // Admin gives credit to User
            await WalletService.addCredit(
                userId, Math.abs(difference), type, transaction, initiatedBy, senderId, senderRole
            );
        } else {
            // User gives back to Admin (Refund)
            await WalletService.addCredit(
                senderId, difference, senderRole, transaction, initiatedBy, userId, type
            );
        }

        await transaction.commit();
        return res.status(200).json({ success: true, message: 'Credit limit updated successfully', data: { newCreditLimit: newLimit } });

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating credit limit:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Update Exposure Limit
export const updateExposureLimit = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { userId, userType, newExposureLimit, transactionPassword } = req.body;

        if (!userId || !userType || newExposureLimit === undefined) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const user = await fetchUser(userId, userType, transaction);
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update exp_limit column
        user.exp_limit = newExposureLimit;

        await user.save({ transaction });
        await transaction.commit();

        return res.status(200).json({ success: true, message: 'Exposure limit updated' });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update Status (Active/Inactive/Locked)
export const updateStatus = async (req, res) => {
    try {
        const { userId, userType, userStatus, betStatus, transactionPassword } = req.body;

        // userStatus: 'Active', 'InActive', 'Suspended'
        // betStatus: 'Active', 'InActive' (often maps to 'bettingStatus' or 'is_locked')

        if (!userId || !userType) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const user = await fetchUser(userId, userType);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (userStatus) {
            // Map FRONTEND 'ACTIVE'/'INACTIVE' to DB 'Active'/'InActive' (Case sensitive enum?)
            // User.js: ENUM('Active', 'InActive', 'Pending')
            const statusMap = { 'ACTIVE': 'Active', 'INACTIVE': 'InActive' };
            user.status = statusMap[userStatus] || userStatus;
        }

        if (betStatus) {
            // betStatus: 'ACTIVE' -> Locked = false
            // betStatus: 'INACTIVE' -> Locked = true
            const isLocked = (betStatus === 'INACTIVE');
            user.bet_locked = isLocked;

            // Legacy support if needed? 
            // The user request said "add one more column bet active to user table and staff table".
            // So we rely on 'bet_locked'.
        }

        await user.save();
        return res.status(200).json({ success: true, message: 'Status updated successfully' });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Password
export const updatePassword = async (req, res) => {
    try {
        const { userId, userType, password, transactionPassword } = req.body;

        if (!userId || !userType || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const user = await fetchUser(userId, userType);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.passwordChanged = true; // Flag as changed

        // If updating STAFF password, set first_login = true to trigger Transaction Password generation on next login
        if (userType.toUpperCase() !== 'USER') {
            user.first_login = false;
        }

        await user.save();
        return res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
