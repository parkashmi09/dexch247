

// import Owner from '../../model/admin/Owner.js';

// import sequelize from '../../config/db.js';
// import PasswordService from '../../services/passwordService.js';

// const OwnerController = {
//   // ===================================================================
//   // CREATE Owner 
//   // ===================================================================
 
  

//   // ===================================================================
//   // GET SINGLE Owner
//   // ===================================================================
//   getOwner: async (req, res) => {
//     try {
//       const { ownerId } = req.params;

//       const owner = await Owner.findOne({
//         where: { owner_id: ownerId },
//         attributes: { exclude: ['password'] },
//       });

//       if (!owner) {
//         return res.status(404).json({ success: false, error: 'Owner not found' });
//       }

//       res.status(200).json({ success: true, data: owner });
//     } catch (error) {
//       console.error('Error in getOwner:', error);
//       res.status(500).json({ success: false, error: error.message });
//     }
//   },

//   // ===================================================================
//   // DELETE Owner
//   // ===================================================================
//   deleteOwner: async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//       const { ownerId } = req.params;

//       const owner = await Owner.findOne({ where: { owner_id: ownerId } });
//       if (!owner) {
//         return res.status(404).json({ success: false, error: 'Owner not found' });
//       }

//       // Optional: Delete associated wallet
//       await Wallet.destroy({ where: { user_id: ownerId, user_type: 'Owner' }, transaction });

//       await owner.destroy({ transaction });
//       await transaction.commit();

//       res.status(200).json({ success: true, message: 'Owner deleted successfully' });
//     } catch (error) {
//       await transaction.rollback();
//       console.error('Error in deleteOwner:', error);
//       res.status(500).json({ success: false, error: error.message });
//     }
//   },

//   // ===================================================================
//   // UPDATE OWNER PASSWORD
//   // ===================================================================
//   updatePassword: async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//       const ownerId = req.user.user_id;
//       const { currentPassword, newPassword } = req.body;

//       if (!currentPassword || !newPassword) {
//         return res.status(400).json({ success: false, error: 'Both passwords are required' });
//       }

//       const owner = await Owner.findOne({ where: { owner_id: ownerId } });
//       if (!owner) {
//         return res.status(404).json({ success: false, error: 'Owner not found' });
//       }

//       // Verify current password
//       const isValid = await PasswordService.comparePassword(currentPassword, owner.password);
//       if (!isValid) {
//         return res.status(400).json({ success: false, error: 'Current password is incorrect' });
//       }

//       // Validate new password
//       const validation = PasswordService.validatePasswordStrength(newPassword);
//       if (!validation.isValid) {
//         return res.status(400).json({
//           success: false,
//           error: `New password too weak: ${validation.errors.join(', ')}`,
//         });
//       }

//       const hashed = await PasswordService.hashPassword(newPassword);
//       await owner.update({ password: hashed }, { transaction });

//       await transaction.commit();
//       res.status(200).json({ success: true, message: 'Password updated successfully' });
//     } catch (error) {
//       await transaction.rollback();
//       console.error('Error in updatePassword:', error);
//       res.status(500).json({ success: false, error: error.message });
//     }
//   },
// };

// export default OwnerController;


import Owner from '../../model/admin/Owner.js';
import Wallet from '../../model/admin/Wallet.js'; // Add this import
import sequelize from '../../config/db.js';
import PasswordService from '../../services/passwordService.js';
import WalletService from '../../services/walletService.js';
import { Op } from 'sequelize'; // For uniqueness check

const OwnerController = {
  // ===================================================================
  // CREATE Owner + Wallet (CFZ / SuperAdmin only)
  // ===================================================================
  // createOwner: async (req, res) => {
  //   const transaction = await sequelize.transaction();
  //   try {
  //     const {
  //       name,
  //       website_name,
  //       domain_name,
  //       website_ui,
  //       country,
  //       logo,
  //       favicon,
  //       game_providers = [],
  //       subscription_plan,
  //       platform_configurations = {},
  //       payment_methods = [],
  //       site_email_address,
  //       password,
  //       platform_name,
  //       inr_balance = 0.0,
  //       cash = 0.0,
  //       credit = 0.0,
  //     } = req.body;

  //     // Required fields
  //     if (!name || !site_email_address || !password || !domain_name) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'Name, email, password, and domain are required',
  //       });
  //     }

  //     // Check if email or domain already exists
  //     const exists = await Owner.findOne({
  //       where: {
  //         [Op.or]: [
  //           { site_email_address },
  //           { domain_name },
  //         ],
  //       },
  //     });

  //     if (exists) {
  //       await transaction.rollback();
  //       return res.status(409).json({
  //         success: false,
  //         error: 'Email or domain already in use',
  //       });
  //     }

  //     // Hash password
  //     const hashedPassword = await PasswordService.hashPassword(password);

  //     // Create Owner
  //     const owner = await Owner.create(
  //       {
  //         name,
  //         website_name,
  //         domain_name,
  //         website_ui,
  //         country,
  //         logo,
  //         favicon,
  //         game_providers,
  //         subscription_plan,
  //         platform_configurations,
  //         payment_methods,
  //         site_email_address,
  //         password: hashedPassword,
  //         platform_name,
  //         role: 'Owner',
  //         account_status: true,
  //       },
  //       { transaction }
  //     );

  //     // Create Wallet for Owner
  //     const walletUsername = `owner_${owner.owner_id}`;

  //     await Wallet.create(
  //       {
  //         user_id: owner.owner_id,
  //         user_type: 'Owner',
  //         username: walletUsername,
  //         inr_balance: parseFloat(inr_balance),
  //         cash: parseFloat(cash),
  //         credit: parseFloat(credit),
  //         // profit_loss & verdict auto-calculated by hook
  //       },
  //       { transaction }
  //     );

  //     await transaction.commit();

  //     return res.status(201).json({
  //       success: true,
  //       message: 'Owner and wallet created successfully',
  //       data: {
  //         owner_id: owner.owner_id,
  //         email: site_email_address,
  //         domain: domain_name,
  //         wallet_username: walletUsername,
  //       },
  //     });
  //   } catch (error) {
  //     await transaction.rollback();
  //     console.error('Error in createOwner:', error);
  //     return res.status(500).json({
  //       success: false,
  //       error: error.message || 'Failed to create owner',
  //     });
  //   }
  // },

  createOwner : async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      username,
      website_name,
      domain_name,
      website_ui,
      country,
      logo,
      favicon,
      game_providers = [],
      subscription_plan,
      platform_configurations = {},
      payment_methods = [],
      site_email_address,
      password,
      platform_name,
      inr_balance = 0.0,
      cash = 0.0,
      credit = 0.0,
    } = req.body;

    let role = 'OWNER';

    // ✅ Validate required fields
    if (!username || !site_email_address || !password || !domain_name) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and domain are required',
      });
    }

    // ✅ Check for duplicate email or domain
    const exists = await Owner.findOne({
      where: {
        [Op.or]: [{ site_email_address }, { domain_name }],
      },
    });

    if (exists) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: 'Email or domain already in use',
      });
    }

    // ✅ Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // ✅ Create Owner
    const owner = await Owner.create(
      {
        username,
        website_name,
        domain_name,
        website_ui,
        country,
        logo,
        favicon,
        game_providers,
        subscription_plan,
        platform_configurations,
        payment_methods,
        site_email_address,
        password: hashedPassword,
        platform_name,
        role: 'OWNER',
        account_status: true,
      },
      { transaction }
    );

    // ✅ Create Wallet using WalletService (linking via owner_id)
    const wallet = await WalletService.createWallet(
      owner.owner_id,    // entityId
      role,           // userType
      transaction,       // transaction instance
      username,          // username from request body
      credit,            // credit amount
      cash               // cash amount
    );

    // ✅ Adjust INR balance if additional amount passed
    // const totalOpeningBalance = parseFloat(inr_balance) || 0;
    // if (totalOpeningBalance > 0) {
    //   await WalletService.creditBalance(
    //     owner.owner_id,
    //     totalOpeningBalance,
    //     role,
    //     transaction,
    //     'system'
    //   );
    // }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Owner and wallet created successfully',
      data: {
        owner_id: owner.owner_id,
        email: site_email_address,
        domain: domain_name,
        wallet: {
          username: wallet.username,
          user_type: wallet.user_type,
          cash: wallet.cash,
          inr_balance: wallet.inr_balance,
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error in createOwner:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create owner',
    });
  }
},

  // ===================================================================
  // GET SINGLE Owner
  // ===================================================================
  getOwner: async (req, res) => {
    try {
      const { ownerId } = req.params;

      const owner = await Owner.findOne({
        where: { owner_id: ownerId },
        attributes: { exclude: ['password'] },
      });

      if (!owner) {
        return res.status(404).json({ success: false, error: 'Owner not found' });
      }

      res.status(200).json({ success: true, data: owner });
    } catch (error) {
      console.error('Error in getOwner:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ===================================================================
  // DELETE Owner
  // ===================================================================
  deleteOwner: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { ownerId } = req.params;

      const owner = await Owner.findOne({ where: { owner_id: ownerId } });
      if (!owner) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: 'Owner not found' });
      }

      // Delete associated wallet
      await Wallet.destroy({
        where: { user_id: ownerId, user_type: 'Owner' },
        transaction,
      });

      await owner.destroy({ transaction });
      await transaction.commit();

      res.status(200).json({ success: true, message: 'Owner deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error in deleteOwner:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ===================================================================
  // UPDATE OWNER PASSWORD
  // ===================================================================
  updatePassword: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const ownerId = req.user.account.id;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ success: false, error: 'New password is required' });
      }

      const owner = await Owner.findOne({ where: { owner_id: ownerId } });
      if (!owner) {
        return res.status(404).json({ success: false, error: 'Owner not found' });
      }

      // Validate new password strength
      const validation = PasswordService.validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: `New password too weak: ${validation.errors.join(', ')}`,
        });
      }

      const hashed = await PasswordService.hashPassword(newPassword);
      // 🔐 Changing the login password also rotates the transaction password.
      const newTransactionPassword = Math.floor(100000 + Math.random() * 900000).toString();
      await owner.update({ password: hashed, transaction_password: newTransactionPassword }, { transaction });

      await transaction.commit();
      res.status(200).json({ success: true, message: 'Password updated successfully', transactionPassword: newTransactionPassword });
    } catch (error) {
      await transaction.rollback();
      console.error('Error in updatePassword:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default OwnerController;