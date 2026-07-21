# Account Statement Report Workflow

## Overview
The Account Statement Report is a critical feature that allows Users, Staff, and Owners to view their financial history. It supports:
1.  **Self-Reporting**: Viewing one's own transaction history.
2.  **Downline Reporting**: Owners and Staff can view the account statements of any user or staff member in their hierarchy.
3.  **Unified Data**: For Users, it combines Wallet Transactions (Deposits/Withdrawals) with Betting P/L (CreditsLedger).
4.  **Comprehensive Audit**: For Owners/Staff, it shows all direct wallet actions AND transactions initiated by them for others.

## Architecture

### 1. Controller Layer: `ReportsController.js`
The entry point for the report request. It is responsible for:
*   **Target Resolution**: Determining *whose* report to generate.
    *   If `clientName` is provided: Searches for a User or Staff with that username (Downline Report).
    *   If `clientName` is empty: Uses the logged-in user's ID (Self Report).
*   **Delegation**: Passes the resolved `target` object and request filters to the `TransactionReportService`.

### 2. Service Layer: `TransactionReportService.js`
Encapsulates the core business logic for generating the report. It handles the differences between User and Staff/Owner reports.

#### **Logic for USER Type**
*   **Data Sources**:
    1.  **`Transaction` Model**: Fetches wallet transactions (Deposits, Withdrawals).
    2.  **`CreditsLedger` Model**: Fetches betting Profit/Loss and other ledger entries.
*   **Process**:
    1.  Fetches `Transaction` records (filtered by date).
    2.  Fetches `CreditsLedger` records (filtered by date).
    3.  **Normalization**: Maps both datasets to a common format:
        *   `credit`, `debit`, `closing` (balance), `description`, `fromto`.
    4.  **Combination**: Merges both arrays.
    5.  **Sorting**: Sorts by `createdAt` (descending).
    6.  **Pagination**: Slices the combined array based on `page` and `limit`.

#### **Logic for STAFF / OWNER Type**
*   **Data Source**: `Transaction` Model only.
*   **Filter Logic**:
    *   Uses a broadened filter: `WHERE username = target.username OR initiated_by = target.username`.
    *   **Direct Transactions**: Money added/deducted from their own wallet.
    *   **Initiated Transactions**: Money they added/deducted from downline users (Audit Trail).
*   **Process**:
    1.  Fetches and counts records using Sequelize `findAndCountAll`.
    2.  Formats the output.

## API Endpoints

### 1. Generate Report
*   **Endpoint**: `POST /api/reports/accountstatement`
*   **Auth**: Required (`authMiddleware`)
*   **Payload**:
    ```json
    {
      "clientName": "username" (Optional, for downline search),
      "fromDate": "YYYY-MM-DD",
      "toDate": "YYYY-MM-DD",
      "gameName": "ALL" | "TRANSACTION" | "SPORTS" | "CASINO",
      "page": 1,
      "limit": 25
    }
    ```

### 2. Search Downline (Helper)
*   **Endpoint**: `GET /api/admin/search-by-username`
*   **Auth**: Required
*   **Query Params**: `?username=te&page=1&limit=10`
*   **Purpose**: Provides auto-complete suggestions for the "Search By Client Name" dropdown. Returns a list of users/staff matching the search term within the requestor's hierarchy.

## Frontend Integration
*   **File**: `src/pages/accounts/account-statement.jsx`
*   **Search Dropdown**:
    *   Uses `searchByUsername` API to fetch suggestions as the user types.
    *   Displays `Username (UserType)`.
    *   On selection, updates the `clientName` state.
*   **Trigger**: The report is generated only when the **Load** button is clicked (or pagination changes), ensuring efficient API usage.

## Key Files
*   `server/controller/admin/reportsController.js`
*   `server/services/TransactionReportService.js`
*   `server/routes/admin/userRoutes.js` (Search API)
*   `client/src/pages/accounts/account-statement.jsx`
