// import WalletService from '../../services/walletService.js';
// import { getAllDescendantStaffIds } from '../utils/hierarchyHelper.js';
// import User from '../../model/user/User.js';
// import Staff from '../../model/admin/Staff.js';
// import Wallet from '../../model/admin/Wallet.js';
// import Transaction from '../../model/admin/Transaction.js';
// import sequelize from '../../config/db.js';
// import { Op } from 'sequelize';

// const TransferController = {
//   transfer: async (req, res) => {
//     try {
//       const { userId, amount, recieverType, transactionPassword } = req.body;
//       const initiatedBy = req.user.username;

//       // Validation
//       if (!userId || !amount || !recieverType) {
//         return res.status(400).json({ success: false, message: 'Missing required fields: userId, amount, recieverType' });
//       }

//       // Sender details (Staff/Owner)
//       const senderId = req.user.account.id;
//       const senderRole = req.user.role;

//       // 1. Downline Validation
//       // Ensure the receiver is in the sender's hierarchy
//       // If Sender is OWNER, they can transfer to anyone (conceptually, or usually direct downline)
//       // But typically filtering is required. Assuming OWNER can transfer to anyone for now OR 
//       // if strict hierarchy is needed, Owner downline check is mostly "all users".

//       // If Sender is STAFF, strict downline check is required.
//       // 1. Downline Validation (DISABLED per user request)
//       /* 
//       if (senderRole !== 'OWNER') {
//         const descendantStaffIds = await getAllDescendantStaffIds(senderId);
        
//         if (recieverType.toUpperCase() === 'USER') {
//           const user = await User.findByPk(userId);
//           if (!user || !descendantStaffIds.includes(user.parent_staff_id)) {
//             return res.status(403).json({ success: false, message: 'Receiver is not in your downline' });
//           }
//         } else {
//             // Receiver is STAFF
//             // Must be in descendant list AND not self (though self transfer usually blocked by UI)
//             if (!descendantStaffIds.includes(Number(userId)) || Number(userId) === Number(senderId)) {
//                  // Note: logic might vary if you can transfer to self, but usually "transfer" implies another
//                  // If userId is in descendants, it is valid.
//                  // getAllDescendantStaffIds includes self? Yes, usually.
//                  if (Number(userId) === Number(senderId)) {
//                      // Self transfer? 
//                  }
                 
//                  // If the staff is NOT in the list
//                  if (!descendantStaffIds.includes(Number(userId))) {
//                      return res.status(403).json({ success: false, message: 'Receiver is not in your downline' });
//                  }
//             }
//         }
//       }
//       */

//       // 2. Remaining Topup Check (Credit Limit Check)
//       // Fetch receiver's credit limit and current wallet credit
//       let creditLimit = 0;
//       let idField = '';

//       if (recieverType.toUpperCase() === 'USER') {
//         const user = await User.findByPk(userId);
//         if (user) {
//           creditLimit = parseFloat(user.credit_limit || 0);
//           req.user_gt = parseFloat(user.user_gt || 0); // Store GT for validation
//         }
//         idField = 'user_id';
//       } else {
//         const staff = await Staff.findByPk(userId);
//         if (staff) creditLimit = parseFloat(staff.credit_limit || 0);
//         idField = 'staff_id';
//       }

//       const receiverWallet = await Wallet.findOne({
//         where: { [idField]: userId }
//       });

//       if (!receiverWallet) {
//         return res.status(404).json({ success: false, message: 'Receiver wallet not found' });
//       }

//       const currentCredit = parseFloat(receiverWallet.credit || 0);
//       const remainingTopup = creditLimit - currentCredit;
//       const amountVal = parseFloat(amount);

//       // GT Validation (Only for USER)
//       if (recieverType.toUpperCase() === 'USER') {
//         const gt = req.user_gt || 0;

//         if (gt === 0) {
//           return res.status(400).json({ success: false, message: 'Nothing to clear (GT is 0)' });
//         }

//         if (gt < 0) {
//           // GT is negative (User owes money), expects Positive transfer
//           if (amountVal <= 0 || amountVal > -gt) {
//             return res.status(400).json({ success: false, message: `Amount must be between 0 and ${-gt}` });
//           }
//         } else if (gt > 0) {
//           // GT is positive (User is owed money), expects Negative transfer (Withdrawal)
//           if (amountVal >= 0 || amountVal < -gt) {
//             return res.status(400).json({ success: false, message: `Amount must be between ${-gt} and 0` });
//           }
//         }
//       }

//       // Credit Limit Check
//       // Block if amount is POSITIVE and exceeds remaining limit
//       // Allow if amount is NEGATIVE (Withdrawal) even if over limit
//       if (amountVal > 0) {
//         if (remainingTopup <= 0) {
//           return res.status(400).json({ success: false, message: 'Receiver has reached or exceeded allowed credit limit' });
//         }
//         if (amountVal > remainingTopup) {
//           return res.status(400).json({
//             success: false,
//             message: `Transfer amount exceeds remaining topup limit. limit: ${remainingTopup}`
//           });
//         }
//       }


//       // 3. Perform Transfer
//       const transaction = await sequelize.transaction();



//       console.log('DEBUG: Transaction Object:', transaction ? 'Exists' : 'NULL', transaction?.id);

//       try {
//         const isWithdrawal = parseFloat(amount) < 0;
//         let result;

//         if (isWithdrawal) {
//           result = await WalletService.addCredit(
//             senderId,
//             Math.abs(amount),
//             senderRole,
//             transaction, // Pass transaction
//             initiatedBy,
//             userId,
//             recieverType,
//             isWithdrawal ? 'withdraw' : 'deposit',            // customCreditType
//             isWithdrawal ? 'credit for withdraw' : 'debit for deposit'   // customDebitType
//           );

//         } else {
//           result = await WalletService.addCredit(
//             userId,
//             amount,
//             recieverType,
//             transaction, // Pass transaction
//             initiatedBy,
//             senderId,
//             senderRole,
//             isWithdrawal ? 'withdraw' : 'deposit',            // customCreditType
//             isWithdrawal ? 'credit for withdraw' : 'debit for deposit'   // customDebitType
//           );


//         }

//         // 🔹 Update bal_up if Receiver is Staff
//         if (['SUPERADMIN', 'COMPANY', 'ADMIN', 'SUPERMASTER', 'MASTER'].includes(recieverType?.toUpperCase()) ||
//           (!['USER', 'OWNER'].includes(recieverType?.toUpperCase()))) {

//           // Safety check: ensure we are targeting Staff table.
//           if (recieverType?.toUpperCase() !== 'USER' && recieverType?.toUpperCase() !== 'OWNER') {

//             console.log(`[Transfer] Updating Staff bal_up for ID: ${userId}, Amount: ${amount}`);

//             // Use literal update to handle NULL values safely: bal_up = COALESCE(bal_up, 0) + amount
//             await Staff.update(
//               {
//                 bal_up: sequelize.literal(`COALESCE(bal_up, 0) + ${Number(amount)}`)
//               },
//               {
//                 where: { staff_id: userId },
//                 transaction
//               }
//             );


//           }
//         }

//         await transaction.commit();
//         res.status(200).json({ success: true, message: 'Transfer successful', data: result });
//       } catch (err) {
//         try {
//           await transaction.rollback();
//         } catch (rbError) {
//           // If transaction is already finished, rollback throws an error. We can ignore it or log it.
//           // The original error is what matters.
//           if (rbError.message && !rbError.message.includes('finished')) {
//             console.error('Rollback failed:', rbError);
//           }
//         }
//         throw err;
//       }

//     } catch (error) {
//       console.error('Transfer error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },



//   // transfer =============================================================
//   getStatement: async (req, res) => {
//     try {
//       // Use username to filter ONLY "My" ledger entries
//       // Previously used IDs which caused Staff to see their downline's deposits as their own
//       let myUsername = req.user.username;
//       if (req.body.username) {
//         myUsername = req.body.username;
//       }

//       const whereClause = {
//         username: myUsername
//       };

//       // 2. Fetch Transactions
//       // Filter by type: 'deposit' (Received), 'debit for deposit' (Sent)
//       const transactions = await Transaction.findAll({
//         where: {
//           ...whereClause,
//           type: {
//             [Op.in]: ['deposit', 'debit for deposit', 'withdraw', 'credit for withdraw']
//           }
//         },
//         order: [['createdAt', 'DESC']],
//         limit: 100 // TODO: Pagination
//       });

//       // 3. Format and Group
//       const groupedData = {};

//       transactions.forEach(tx => {
//         const date = new Date(tx.createdAt).toLocaleDateString('en-GB'); // DD/MM/YYYY
//         const time = new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

//         let payerPayee = 'Unknown';
//         let amount = parseFloat(tx.amount);
//         let type = ''; // info

//         // Logic:
//         // If type='deposit': I Received money. Payer is 'debit' (Sender). Amount Positive.
//         // If type='debit for deposit': I Sent money. Payee is 'credit' (Receiver). Amount Negative.

//         if (tx.type === 'deposit') {
//           payerPayee = tx.debit;
//           // amount is positive
//         } else if (tx.type === 'debit for deposit') {
//           payerPayee = tx.credit;
//           amount = -amount;
//         } else if (tx.type === 'withdraw') {
//           // Received a negative amount (Withdrawal from me?) OR System withdrawal logic
//           payerPayee = tx.debit;
//           // amount is negative
//         } else if (tx.type === 'credit for withdraw') {
//           // I sent "credit for withdraw" (I initiated the withdrawal on someone else?)
//           payerPayee = tx.credit;
//           amount = Math.abs(amount); // Should be positive for me
//         }

//         if (!groupedData[date]) {
//           groupedData[date] = {
//             date,
//             transactions: []
//           };
//         }

//         groupedData[date].transactions.push({
//           id: tx.id,
//           time,
//           payerPayee,
//           amount,
//           description: tx.type
//         });
//       });

//       // Convert object to array
//       const responseData = Object.values(groupedData);

//       res.status(200).json({ success: true, data: responseData });

//     } catch (error) {
//       console.error('Statement error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }
// };

// export default TransferController;
