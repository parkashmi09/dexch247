# Profit & Loss System

## Overview
The Profit & Loss (P/L) system tracks the financial performance of users and the platform. It provides historical data on user gains and losses, allowing admins to generate reports and analyze trends.

## Core Components

### 1. Daily Snapshot Job
**File:** `jobs/dailyProfitLossJob.js`
- **Schedule:** Runs daily at 3:20 PM.
- **Functionality:**
    1.  Fetches the current `profit_loss` from every user's `Wallet`.
    2.  Calculates the snapshot for the **previous day**.
    3.  Upserts records into the `DailyProfitLoss` table.
    4.  Ensures that if the job runs multiple times, it updates existing records rather than creating duplicates.

### 2. Models

#### `DailyProfitLoss` Model (`model/admin/DailyProfitLoss.js`)
Stores the historical P/L data.
- **`wallet_id`**: Link to the user's wallet.
- **`username`**: Snapshot of the username.
- **`user_type`**: Role of the user (USER, AGENT, etc.).
- **`profit_loss`**: The P/L amount for that day.
- **`verdict`**: 'profit' or 'loss'.
- **`date`**: The date of the record (YYYY-MM-DD).

#### `Wallet` Model (`model/admin/Wallet.js`)
The source of truth for the current balance and P/L.
- **`profit_loss`**: Calculated field (`inr_balance - credit`).

## Routes & Controllers

### Admin P/L Routes
**File:** `routes/admin/profitLossRoutes.js`
**Controller:** `controller/admin/profitLossController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/pl/all` | `getAllUsersPL` | Fetches P/L for all users. Supports date range filtering and summary mode. |
| `GET` | `/pl/all/today` | `getAllUsersPL` | Fetches P/L for all users for the current day (live snapshot). |
| `GET` | `/pl/user/:wallet_id` | `getUserPL` | Fetches P/L history for a specific user. |

### Controller Functions
**File:** `controller/admin/profitLossController.js`

- **`getAllUsersPL(req, res)`**:
  - **Query Params**: `start`, `end`, `summary` (true/false), `format` (csv).
  - **Logic**:
    - Builds a date range filter.
    - If `summary=true`: Aggregates total P/L, profit days, and loss days per user.
    - If `summary=false`: Returns daily records.
    - Supports CSV export.

- **`getUserPL(req, res)`**:
  - **Params**: `wallet_id`.
  - **Query Params**: `start`, `end`, `summary`.
  - **Logic**: Similar to `getAllUsersPL` but filtered for a single wallet.

- **`getMyPL(req, res)`**:
  - **Logic**: Wrapper around `getUserPL` that automatically uses the logged-in user's `wallet_id`.

## Usage Examples

### Get Monthly Report
`GET /api/admin/pl/all?start=2023-10-01&end=2023-10-31&summary=true`
Returns a list of users with their total P/L for October.

### Get Daily Breakdown for User
`GET /api/admin/pl/user/123?start=2023-10-01&end=2023-10-07`
Returns 7 records showing the P/L for each day.
