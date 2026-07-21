# Risk Management System

## Overview
The Risk Management system allows administrators to monitor betting activities in real-time, identify high-risk bets, and manually control the status of matches (e.g., deactivating a match to stop betting).

## Models

### `SportsBet` Model (`model/user/SportsBet.js`)
The core model for tracking user bets. Risk management relies on querying this table for:
- High stake bets.
- Open bets (unsettled).
- Bets on specific events.

### `DeactivatedMatch` Model (`model/user/DeactivatedMatch.js`)
Stores matches that have been manually deactivated by the admin.
- **`eventid`**: The unique ID of the match/event.
- **`match_title`**: Name of the match.
- **`sport_id`**: ID of the sport.
- **`status`**: Current status (e.g., 'INACTIVE', 'ACTIVE').

## Routes & Controllers

### Risk Management Routes
**File:** `routes/admin/riskManagementRoutes.js`
**Controller:** `controller/admin/riskManagementController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/risk-management/bets` | `getRiskBets` | Fetches bets based on event ID, status, and sorting (highest stake first). |
| `POST` | `/risk-management/bets/update-status` | `updateBetsStatus` | Updates the status of multiple bets (e.g., voiding bets). |
| `GET` | `/risk-management/open-bets-by-event` | `getOpenBetsByEvent` | Aggregates open bets and total stake per event. |
| `GET` | `/risk-management/deactivated-matches` | `getDeactivatedMatches` | Fetches the list of all manually deactivated matches. |
| `POST` | `/risk-management/match/deactivate` | `addDeactivatedMatch` | Deactivates a match (sets status to INACTIVE). |
| `POST` | `/risk-management/match/activate` | `removeDeactivatedMatch` | Reactivates a match (sets status to ACTIVE). |

## Controller Functions
**File:** `controller/admin/riskManagementController.js`

- **`getRiskBets(req, res)`**:
  - **Params**: `eventid` (required), `status` (optional, defaults to 'open'), `page`, `limit`.
  - **Logic**: Queries `SportsBet` table. Sorts by `stake_amount` DESC to highlight high-risk bets.

- **`updateBetsStatus(req, res)`**:
  - **Body**: `betIds` (array), `status`.
  - **Logic**: Bulk updates the status of specified bets. Useful for voiding suspicious bets.

- **`getOpenBetsByEvent(req, res)`**:
  - **Logic**: Performs a `GROUP BY` query on `SportsBet` to show total exposure (`SUM(stake_amount)`) and bet count for each event.

- **`getDeactivatedMatches(req, res)`**:
  - **Logic**: Returns all records from `DeactivatedMatch` table.

- **`addDeactivatedMatch(req, res)`**:
  - **Body**: `eventid`, `match_title`, `sport_id`, `status`.
  - **Logic**: Uses `upsert` to add or update a record in `DeactivatedMatch`. Sets status to 'INACTIVE' by default if not provided.

- **`removeDeactivatedMatch(req, res)`**:
  - **Body**: `eventid`, `status`.
  - **Logic**: Updates the status of the match in `DeactivatedMatch` table to 'ACTIVE'.
