// import Staff from '../../model/admin/Staff.js';
// import User from '../../model/user/User.js';
// import Owner from '../../model/admin/Owner.js';
// import WalletService from '../../services/walletService.js';
// import sequelize from '../../config/db.js';

// const updateCreditLimit = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { userId, userType, creditLimit, newCreditLimit } = req.body;

//         console.log("jjcnsx", userId);
//         console.log("jjcnsx", userType);
//         console.log("jjcnsx", newCreditLimit);
//         console.log("jjcnsx", creditLimit);
//         const initiatedBy = req?.user?.username || 'Admin'; // Fallback if req.user is not set

//         if (!userId || !userType || newCreditLimit === undefined) {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields: userId, userType, newCreditLimit'
//             });
//         }

//         let user;
//         const type = userType.toUpperCase();

//         // 1. Fetch the user/staff/owner to get the CURRENT credit limit from DB
//         if (type === 'USER') {
//             user = await User.findByPk(userId, { transaction });
//         } else if (type === 'OWNER') {
//             user = await Owner.findByPk(userId, { transaction });
//         } else {
//             // Default to Staff for other roles like ADMIN, MASTER, etc.
//             user = await Staff.findByPk(userId, { transaction });
//         }

//         if (!user) {
//             await transaction.rollback();
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         // 2. Calculate the difference
//         // We use the DB's current credit_limit to ensure accuracy, 
//         // though we could theoretically use the 'creditLimit' from body if we trusted it.
//         const currentDbLimit = Number(user.credit_limit || 0);
//         const newLimit = Number(newCreditLimit);
//         const difference = newLimit - currentDbLimit;

//         // 3. Update the Credit Limit in the User/Staff table
//         user.credit_limit = newLimit;
//         await user.save({ transaction });

//         // 4. Update the Wallet Balance (Add or Subtract Credit)
//         // If difference is 0, no wallet change needed.
//         if (difference > 0) {
//             // Difference > 0: Limit Increased.
//             // Admin gives credit to User.
//             // Receiver = User, Sender = Admin.

//             const senderId = req.user?.user_id || req.user?.account?.id || req.user?.id;
//             const senderRole = req.user?.role;

//             if (!senderId || !senderRole) {
//                 // Warning/Error handling if sender cannot be identified, though usually covered by auth middleware
//             }

//             await WalletService.addCredit(
//                 userId,             // Receiver (User)
//                 difference,         // Amount
//                 type,               // Receiver Type
//                 transaction,
//                 initiatedBy,
//                 senderId,           // Sender (Admin)
//                 senderRole          // Sender Type
//             );

//         } else if (difference < 0) {
//             // Difference < 0: Limit Decreased.
//             // User gives back credit to Admin.
//             // Reversed logic: Receiver = Admin, Sender = User.

//             const amount = Math.abs(difference);
//             const adminId = req.user?.user_id || req.user?.account?.id || req.user?.id;
//             const adminRole = req.user?.role;

//             // We use addCredit but swap the roles so User pays Admin
//             await WalletService.addCredit(
//                 adminId,            // Receiver (Admin)
//                 amount,             // Amount
//                 adminRole,          // Receiver Type
//                 transaction,
//                 initiatedBy,
//                 userId,             // Sender (User)
//                 type                // Sender Type
//             );
//         }

//         await transaction.commit();

//         return res.status(200).json({
//             success: true,
//             message: 'Credit limit updated successfully',
//             data: {
//                 userId,
//                 oldCreditLimit: currentDbLimit,
//                 newCreditLimit: newLimit,
//                 walletUpdate: difference !== 0 ? (difference > 0 ? 'Credited User' : 'Credited Admin (Refund)') : 'None'
//             }
//         });

//     } catch (error) {
//         await transaction.rollback();
//         console.error('Error updating credit limit:', error);
//         return res.status(500).json({
//             success: false,
//             message: error.message || 'Internal server error'
//         });
//     }
// };

// export default updateCreditLimit;

const updateCreditLimit = (req, res) => {
    return res.status(501).json({ success: false, message: 'Not implemented' });
};

export default updateCreditLimit;
