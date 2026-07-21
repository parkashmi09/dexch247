# User Commission System

## Overview
The User Commission System calculates and tracks commissions earned by users (typically Agents, Masters, etc.) based on betting turnover or profit/loss. The system allows admins to generate reports at different levels of granularity: per user, per sport, or per match.

## Core Components

### 1. Models

#### `CreditsLedger` Model (`model/user/CreditsLedger.js`)
The primary source for commission data.
- **`commission`**: The commission amount earned for a specific transaction.
- **`user_id`**: The user who earned the commission.
- **`sport_id`**: The sport associated with the bet.
- **`match_id`**: The specific match.
- **`market_type`**: The type of market (e.g., Match Odds, Fancy).

#### `User` Model (`model/user/User.js`)
Used to link commission data to user details (username).

#### `SportsBet` Model (`model/user/SportsBet.js`)
Used to fetch detailed event information (Match Title, Selection Name) when generating detailed match-wise reports.

## Routes & Controllers

### Admin Commission Routes
**File:** `routes/admin/creditLedgerRoutes.js`
**Controller:** `controller/admin/CreditLedgerController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ledger/commission-report` | `getCommissionReport` | Generates commission reports based on `view_type`. |

### Controller Functions
**File:** `controller/admin/CreditLedgerController.js`

- **`getCommissionReport(req, res)`**:
  - **Body Params**: 
    - `view_type`: Determines the report level ('USER_LIST', 'SPORT_WISE', 'MATCH_WISE').
    - `user_id`: The logged-in admin's ID (used for hierarchy filtering).
    - `target_user_id`: Required for 'SPORT_WISE' and 'MATCH_WISE' views.
    - `target_sport_id`: Optional filter for 'MATCH_WISE' view.

  - **Logic**:
    1.  **Hierarchy Check**: If the logged-in user is not an OWNER, the system first fetches all downline users to ensure the admin only sees data for their subordinates.
    2.  **View Types**:
        - **`USER_LIST`**: Aggregates total commission for all downline users. Returns a list sorted by highest commission.
        - **`SPORT_WISE`**: Aggregates commission by sport for a specific `target_user_id`.
        - **`MATCH_WISE`**: Lists individual commission entries for a specific user. It attempts to link `CreditsLedger` entries to `SportsBet` to provide readable event names (e.g., "India vs Pakistan - Match Odds"). If no bet link is found, it falls back to the ledger description.

## Usage Examples

### Get Total Commission for All Downline Users
**Request:**
```json
{
  "view_type": "USER_LIST"
}
```
**Response:** List of users with their total earned commission.

### Get Commission Breakdown by Sport for a User
**Request:**
```json
{
  "view_type": "SPORT_WISE",
  "target_user_id": "12345"
}
```
**Response:**
```json
[
  { "sport_name": "Cricket", "total_commission": "500.00" },
  { "sport_name": "Soccer", "total_commission": "150.00" }
]
```

### Get Detailed Match Commission for a User
**Request:**
```json
{
  "view_type": "MATCH_WISE",
  "target_user_id": "12345",
  "target_sport_id": "4"
}
```
**Response:** List of specific matches/bets and the commission earned on each.
