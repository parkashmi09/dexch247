# Transaction Password System Documentation

## Overview
The Transaction Password system provides an additional layer of security for sensitive operations within the admin panel. It requires users (Staff and Owners) to provide a unique 6-digit numeric password to authorize actions such as financial transactions (deposits, withdrawals, credits), account creation, status changes, and password updates.

## Architecture

### 1. Password Generation & Storage
*   **Generation**: The transaction password is automatically generated when a staff member or owner resets their password for the first time (First Time Login flow).
*   **Format**: A 6-digit random numeric string (e.g., "839201").
*   **Display**: It is displayed to the user **only once** on the `PasswordSuccess` page immediately after the first password reset.
*   **Storage**: 
    *   **Database**: Stored in the `transaction_password` column of the `staff` and `owners` tables.
    *   **Encryption**: Stored in **plain text** (as per specific business requirement).

### 2. Backend Implementation

#### Middleware
**File**: `middleware/transactionPasswordMiddleware.js`

The `verifyTransactionPassword` middleware intercepts requests to protected routes.
1.  Extracts `transactionPassword` from the request body.
2.  Identifies the authenticated user (Staff or Owner) from the request token.
3.  Retrieves the user's record from the database.
4.  Compares the provided password with the stored `transaction_password`.
5.  If valid, proceeds to the controller; otherwise, returns a `400 Bad Request` or `401 Unauthorized` error.

#### Protected Routes
The following API endpoints are protected by the `verifyTransactionPassword` middleware:

*   **Wallet Operations** (`routes/admin/adminWalletRoutes.js`):
    *   `POST /api/admin/wallet/cash/add` (Deposit)
    *   `POST /api/admin/wallet/cash/subtract` (Withdraw)
    *   `POST /api/admin/wallet/credit/add` (Add Credit)
    *   `POST /api/admin/wallet/credit/subtract` (Subtract Credit - *if implemented*)

*   **Account Management** (`routes/admin/staffRoutes.js`, `routes/admin/userRoutes.js`):
    *   `POST /api/admin/staff/create-staff` (Create Staff/Master/Agent)
    *   `POST /api/admin/users/create-under-parent` (Create User)
    *   `PUT /api/admin/staff-user-update` (Change User/Staff Status)

*   **Security Settings** (`routes/admin/userRoutes.js`, `routes/admin/tableCasinoRoutes.js`):
    *   `PUT /api/admin/staff-update-password` (Change Logged-in Staff Password)
    *   `POST /api/admin/table-casino/lock` (General Casino/Table Lock)

### 3. Frontend Integration

#### Components
The following React components have been updated to collect the Transaction Password and include it in the API payload:

*   **Modals**:
    *   `TransactionModal.jsx`: For Deposits and Withdrawals.
    *   `CreditModal.jsx`: For adding credit.
    *   `ChangeStatusModal.jsx`: For activating/deactivating users or betting.
    *   `BetLockModal.jsx`: For locking bets (User/Market specific).
    *   `ExposureLimitModal.jsx`: For setting exposure limits.
    *   `PasswordModal.jsx`: For changing other users' passwords (if applicable).

*   **Pages**:
    *   `Users2.jsx` & `Users.jsx`: Handles the submission logic for the above modals, ensuring `transactionPassword` is passed to the service layer.
    *   `AddAccount.jsx`: Includes a field for Transaction Password when creating new accounts.
    *   `GeneralLock.jsx`: Requires Transaction Password to toggle global casino locks.
    *   `ChangePassword.jsx`: Requires Transaction Password to update the logged-in user's login password.

#### Service Layer
*   `userService.js` and `walletService.js` have been updated to accept `transactionPassword` in their respective function arguments and pass it in the HTTP request body.

## Security Considerations
*   **Plain Text Storage**: The transaction password is stored in plain text to allow for easy retrieval/verification logic as requested. This implies that anyone with direct database access can view these passwords.
*   **Transmission**: All requests should be sent over HTTPS to protect the password during transmission.
*   **Validation**: Validation is performed strictly on the backend. Frontend validation (e.g., length check) is minimal to rely on the authoritative backend response.

## Troubleshooting
*   **"Transaction password is required" Error**: Ensure the frontend component is correctly capturing the input and passing it as `transactionPassword` in the JSON body of the request.
*   **"Transaction password invalid" Error**: The user entered the wrong code. They may need to contact an administrator if they have lost their code (functionality to reset transaction password specifically is handled via database or specific admin override if implemented).
