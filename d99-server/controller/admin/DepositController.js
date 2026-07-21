// import Deposit from '../../model/admin/Deposit.js';
// import User from '../../model/user/User.js';
// import UserTransaction from '../../model/user/user_transaction.js';

// const DepositController = {
//   // Create a deposit
//   async createDeposit(req, res) {
//     console.log
//     try {
//       const {
//         depositAmount,
//         coinType,
//         chain,
//         walletAddress,
//         accountHolderName,
//         accountNumber,
//         ifscCode,
//         upiId,
//         transactionNumber,
//         bank,
//         paymentMethod,
//       } = req.body;

//       // Get the user_id from the token
//       const userId = req.user.user_id;

//       // Fetch user details
//       const user = await User.findOne({ where: { user_id: userId } });
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }

//       // Validate based on coinType
//       if (coinType === 'INR') {
//         // Either bank details (accountHolderName, accountNumber, ifscCode) or UPI ID must be provided
//         const hasBankDetails = accountHolderName && accountNumber && ifscCode;
//         const hasUpiId = upiId;

//         if (!hasBankDetails && !hasUpiId) {
//           return res.status(400).json({
//             message: 'For INR, either bank details (accountHolderName, accountNumber, ifscCode) or UPI ID is required.',
//           });
//         }
//       } else if (coinType === 'USDT') {
//         // Both walletAddress and chain are mandatory for USDT
//         if (!walletAddress || !chain) {
//           return res.status(400).json({
//             message: 'For USDT, walletAddress and chain are required.',
//           });
//         }
//       } else {
//         return res.status(400).json({ message: 'Invalid coinType. Allowed values are INR or USDT.' });
//       }

//       // Get the uploaded file path (if any)
//       const paymentScreenshot = req.file ? req.file.path : null;
// console.log(paymentMethod,"1111111111111111111")
//       // Create the deposit
//       const deposit = await Deposit.create({
//         user_id: userId, // Use the user_id from the token
//         depositAmount,
//         coinType,
//         chain,
//         walletAddress,
//         accountHolderName,
//         accountNumber,
//         ifscCode,
//         upiId,
//         transactionNumber,
//         bank,
//         paymentMethod,
//         paymentScreenshot,
//         status: 'In Queue', // Default status
//       });
//       // Log to user_transaction table
//       await UserTransaction.create({
//         user_id: userId,
//         transaction_type: 'credit',
//         pts: depositAmount,
//         remark: '',
//         action_by: null,
//       });
    
//       res.status(201).json({ message: 'Deposit created successfully', deposit });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error creating deposit', error: error.message });
//     }
//   },

//   // Update deposit status (Admin only)
//   async updateDepositStatus(req, res) {
//     try {
//       const { deposit_id, status } = req.body;

//       // Check if the user is an admin
//       if (req.user.role !== 'Agent' && req.user.role !== 'Owner'&& req.user.role !== 'Master') {
//         return res.status(403).json({ message: 'Access denied. Only admins can update deposit status.' });
//       }

//       // Find the deposit
//       const deposit = await Deposit.findByPk(deposit_id);
//       if (!deposit) {
//         return res.status(404).json({ message: 'Deposit not found' });
//       }

//       // Update the status
//       deposit.status = status;
//       await deposit.save();

//       // Update the corresponding user_transaction record
//       await UserTransaction.update(
//         { remark: status, action_by: req.user.user_id },
//         { where: { user_id: deposit.user_id, transaction_type: 'credit', pts: deposit.depositAmount } }
//       );

//       res.status(200).json({ message: 'Deposit status updated successfully', deposit });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error updating deposit status', error: error.message });
//     }
//   },

//   // Get all deposits (Admin only)
//   async getAllDeposits(req, res) {
//     try {
//       // Check if the user is an admin
//       if (req.user.role !== 'Agent' && req.user.role !== 'Owner' && req.user.role !== 'Master') {
//         return res.status(403).json({ message: 'Access denied. Only admins can view all deposits.' });
//       }

//       const deposits = await Deposit.findAll();
//       res.status(200).json({ deposits });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error fetching deposits', error: error.message });
//     }
//   },

//   // Get deposits related to a specific user
//   async getUserDeposits(req, res) {
//     try {
//       const userId = req.user.user_id; // Get user_id from the token

//       // Fetch deposits for the user
//       const deposits = await Deposit.findAll({
//         where: { user_id: userId },
//       });

//       res.status(200).json({ deposits });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error fetching user deposits', error: error.message });
//     }
//   },
// };

// export default DepositController;

import Deposit from '../../model/admin/Deposit.js';
import User from '../../model/user/User.js';
import UserTransaction from '../../model/user/user_transaction.js';
import WalletService from '../../services/walletService.js';
import sequelize from '../../config/db.js';

const DepositController = {
  // ===================================================================
  // CREATE DEPOSIT (User) – INR only
  // ===================================================================
  async createDeposit(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const {
        depositAmount,
        accountHolderName,
        accountNumber,
        ifscCode,
        upiId,
        transactionNumber,
        bank,
        paymentMethod,
      } = req.body;

      const userId = req.user.account.id;
      const userRole = req.user.role || 'User';

      // Validate amount
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        return res.status(400).json({ success: false, message: 'Valid deposit amount is required' });
      }

      // Fetch user
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Validate INR payment method
      const hasBankDetails = accountHolderName && accountNumber && ifscCode;
      const hasUpiId = upiId;

      if (!hasBankDetails && !hasUpiId) {
        return res.status(400).json({
          success: false,
          message: 'For INR deposit, provide either bank details (accountHolderName, accountNumber, ifscCode) or UPI ID.',
        });
      }

      const paymentScreenshot = req.file ? req.file.path : null;

      // Create deposit record
      const deposit = await Deposit.create(
        {
          user_id: userId,
          depositAmount: parseFloat(depositAmount),
          accountHolderName,
          accountNumber,
          ifscCode,
          upiId,
          transactionNumber,
          bank,
          paymentMethod,
          paymentScreenshot,
          status: 'In Queue',
        },
        { transaction }
      );

      // Log to user_transaction (pending credit)
      await UserTransaction.create(
        {
          user_id: userId,
          transaction_type: 'credit',
          pts: parseFloat(depositAmount),
          remark: `Deposit #${deposit.deposit_id} - In Queue`,
          action_by: null,
        },
        { transaction }
      );

      await transaction.commit();
      res.status(201).json({ success: true, message: 'Deposit request created', data: deposit });
    } catch (error) {
      await transaction.rollback();
      console.error('Error in createDeposit:', error);
      res.status(500).json({ success: false, message: 'Error creating deposit', error: error.message });
    }
  },

  // ===================================================================
  // UPDATE DEPOSIT STATUS (Admin only) – Credit INR on approval
  // ===================================================================
  async updateDepositStatus(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { deposit_id, status } = req.body;
      const adminId = req.user.account.id;
      const adminRole = req.user.role;

      // Only Agent, Master, Owner can approve/reject
      const allowedRoles = ['Agent', 'Master', 'Owner'];
      if (!allowedRoles.includes(adminRole)) {
        return res.status(403).json({ success: false, message: 'Access denied. Only admins can update deposit status.' });
      }

      const deposit = await Deposit.findByPk(deposit_id, { transaction });
      if (!deposit) {
        return res.status(404).json({ success: false, message: 'Deposit not found' });
      }

      const oldStatus = deposit.status;
      deposit.status = status;
      await deposit.save({ transaction });

      // Update user_transaction remark
      await UserTransaction.update(
        {
          remark: `Deposit #${deposit_id} - ${status}`,
          action_by: adminId,
        },
        {
          where: {
            user_id: deposit.user_id,
            transaction_type: 'credit',
            pts: deposit.depositAmount,
          },
          transaction,
        }
      );

      // If approved, credit INR to wallet
      if (status === 'Approved' && oldStatus !== 'Approved') {
        await WalletService.creditBalance(
          deposit.user_id,
          deposit.depositAmount,
          'User', // assuming deposit is for User
          transaction,
          req.user.username || 'Admin'
        );
      }

      await transaction.commit();
      res.status(200).json({ success: true, message: 'Deposit status updated', data: deposit });
    } catch (error) {
      await transaction.rollback();
      console.error('Error in updateDepositStatus:', error);
      res.status(500).json({ success: false, message: 'Error updating deposit', error: error.message });
    }
  },

  // ===================================================================
  // GET ALL DEPOSITS (Admin only)
  // ===================================================================
  async getAllDeposits(req, res) {
    try {
      const adminRole = req.user.role;
      const allowedRoles = ['Agent', 'Master', 'Owner'];
      if (!allowedRoles.includes(adminRole)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const deposits = await Deposit.findAll({
        include: [{ model: User, attributes: ['username', 'phone'] }],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({ success: true, data: deposits });
    } catch (error) {
      console.error('Error in getAllDeposits:', error);
      res.status(500).json({ success: false, message: 'Error fetching deposits', error: error.message });
    }
  },

  // ===================================================================
  // GET USER'S DEPOSITS (User)
  // ===================================================================
  async getUserDeposits(req, res) {
    try {
      const userId = req.user.account.id;

      const deposits = await Deposit.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({ success: true, data: deposits });
    } catch (error) {
      console.error('Error in getUserDeposits:', error);
      res.status(500).json({ success: false, message: 'Error fetching deposits', error: error.message });
    }
  },
};

export default DepositController;