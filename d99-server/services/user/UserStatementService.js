import { buildUserStatement } from '../statement/StatementBuilder.js';

const UserStatementService = {
  /**
   * Dedicated account statement for the logged-in user.
   * Delegates to the shared StatementBuilder so the user panel and the
   * admin panel return identical, tallying numbers:
   *   • one net row per SETTLED bet (Credit if won, Debit if lost)
   *   • deposits / withdrawals from the Transaction table
   *   • running balance: Opening + ΣCredit − ΣDebit = Closing
   */
  getAccountStatement: async (user, filters) => {
    console.log(`🔍 [UserStatementService] Statement for: ${user.username} | Type: ${filters?.reportType}`);
    return buildUserStatement(user, filters);
  },
};

export default UserStatementService;
