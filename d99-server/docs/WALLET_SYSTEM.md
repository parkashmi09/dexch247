# Wallet System

## Overview
The wallet system manages user balances, credits, and financial transactions. It is designed to track "Profit/Loss" based on the difference between the balance and the given credit.

## Models

### `Wallet` Model (`model/admin/Wallet.js`)
Every user and staff member has a wallet.
- **`inr_balance`**: The current available balance.
- **`credit`**: The credit limit assigned to the user.
- **`cash`**: Cash component (specific use cases).
- **`profit_loss`**: Automatically calculated field.
    - Formula: `profit_loss = inr_balance - credit`
- **`verdict`**: Indicates if the user is in 'profit' or 'loss'.
- **Hooks**: Sequelize `beforeCreate` and `beforeUpdate` hooks ensure `profit_loss` and `verdict` are always up-to-date.

### `Transaction` Model (`model/admin/Transaction.js`)
An immutable record of all financial movements.
- **`credit`**: Username of the user receiving funds.
- **`debit`**: Username of the user sending funds.
- **`amount`**: The transaction amount.
- **`balance`**: The running balance of the affected wallet after the transaction.
- **`type`**: The type of transaction (e.g., `ADD_CASH`, `SUBTRACT_CREDIT`, `BET_PLACED`, `BET_WON`).
- **`initiated_by`**: Tracks who performed the action.

## Key Concepts

### Profit/Loss Calculation
The system treats `credit` as the baseline.
- If `inr_balance` > `credit`, the user is in **Profit**.
- If `inr_balance` < `credit`, the user is in **Loss**.
- This allows for a credit-based betting system where users settle the difference.

### Settlement
Settlement involves adjusting the `credit` or `inr_balance` to square off the profit/loss, usually handled via specific transaction types.

## Routes & Controllers

### Admin Wallet Routes
**File:** `routes/admin/adminWalletRoutes.js`
**Controller:** `controller/walletController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/wallet-list` | `getAllWallets` | Fetches all wallets (Admin only). |
| `GET` | `/wallets/:role` | `getWalletsByRole` | Fetches wallets filtered by user role (e.g., USER, AGENT). |
| `POST` | `/wallet/cash/add` | `addCash` | Adds cash to a user's wallet. Handles sender deduction unless Owner. |
| `POST` | `/wallet/cash/subtract` | `subtractCash` | Subtracts cash from a user's wallet (Withdrawal). |
| `POST` | `/wallet/credit/add` | `addCredit` | Adds credit to a user's wallet. Handles sender deduction unless Owner. |
| `POST` | `/wallet/credit/subtract` | `subtractCredit` | Subtracts credit from a user's wallet. |
| `GET` | `/wallet/:userId` | `getUserWallet` | Fetches full wallet details (cash, credit, balance) for a specific user. |
| `GET` | `/wallets/all` | `getAllWallets` | Alias for `/wallet-list`. |

### User Wallet Routes
**File:** `routes/user/userWalletRoutes.js`
**Controller:** `controller/walletController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/transactions` | `getUserTransactions` | Fetches transaction history for the logged-in user. |

### Controller Functions
**File:** `controller/walletController.js`

- **`addCash(req, res)`**: 
  - Validates `userId`, `amount`, `userType`.
  - Starts a transaction.
  - Calls `WalletService.subtractCash` for the sender (if not OWNER).
  - Calls `WalletService.addCash` for the receiver.
  - Commits transaction.

- **`subtractCash(req, res)`**:
  - Validates inputs.
  - Calls `WalletService.subtractCash` on the user's wallet.
  - Commits transaction.

- **`addCredit(req, res)`**:
  - Similar to `addCash` but affects `credit` field.
  - Calls `WalletService.subtractCredit` (sender) and `WalletService.addCredit` (receiver).

- **`subtractCredit(req, res)`**:
  - Calls `WalletService.subtractCredit` on the user's wallet.

- **`getUserWallet(req, res)`**:
  - Calls `WalletService.getUserWallet` to retrieve wallet data.

- **`getAllWallets(req, res)`**:
  - Calls `WalletService.getAllWallets`.

- **`getUserTransactions(req, res)`**:
  - Uses `UserTransaction` model directly to fetch records for `req.user.user_id`.
