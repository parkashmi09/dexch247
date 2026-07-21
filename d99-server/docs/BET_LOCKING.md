# Bet Locking System

## Overview
The Bet Locking System allows administrators to restrict betting activities for specific users or globally. It supports locking specific markets (Match Odds, Other Markets) or specific matches.

## Models

### `BetLock` Model (`model/admin/BetLock.js`)
Stores the lock status for users.
- **`user_id`**: The user being locked.
- **`MatchOdds`**: Boolean, true if Match Odds are locked.
- **`OtherMarkets`**: Boolean, true if Other Markets (Fancy, Bookmaker) are locked.

### `UserMatchLocks` Model (`model/admin/UserMatchLocks.js`)
Stores locks for specific matches.
- **`user_id`**: The user.
- **`event_id`**: The match/event ID.
- **`is_locked`**: Boolean status.

## Routes & Controllers

### Admin Bet Lock Routes
**File:** `routes/admin/betLockRoutes.js`
**Controller:** `controller/admin/betLockController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/betlock/` | `getAllBetLocks` | Fetches bet lock status for all users (respects hierarchy). |
| `GET` | `/betlock/:user_id` | `getBetLock` | Fetches bet lock status for a single user. |
| `POST` | `/betlock/lock/user` | `lockBet` | Locks or updates lock status for a single user. |
| `POST` | `/betlock/unlock/user` | `unlockBet` | Unlocks a single user (resets to false). |
| `POST` | `/betlock/lock/multiple` | `lockMultipleBets` | Locks multiple users in one request. |
| `POST` | `/betlock/unlock/multiple` | `unlockMultipleBets` | Unlocks multiple users. |
| `POST` | `/betlock/lock/all/matchodds` | `lockAllMatchOdds` | Global lock: Locks Match Odds for ALL users. |
| `POST` | `/betlock/lock/all/othermarkets` | `lockAllOtherMarkets` | Global lock: Locks Other Markets for ALL users. |
| `POST` | `/betlock/unlock/all` | `unlockAllBets` | Global unlock: Resets all locks for all users. |
| `POST` | `/betlock/lock/match` | `lockMatchForUser` | Locks a specific match for a specific user. |
| `POST` | `/betlock/unlock/match` | `unlockMatchForUser` | Unlocks a specific match for a user. |
| `GET` | `/betlock/match/:event_id` | `getMatchLocks` | Gets all users locked for a specific match. |

### Controller Functions
**File:** `controller/admin/betLockController.js`

- **`getAllBetLocks(req, res)`**:
  - Checks hierarchy (if not OWNER, only shows downline).
  - Fetches `BetLock` records including `User` model for usernames.
  - Returns formatted list.

- **`getBetLock(req, res)`**:
  - Fetches `BetLock` for `user_id`.
  - If not found, returns default `{ MatchOdds: false, OtherMarkets: false }`.

- **`lockBet(req, res)`**:
  - Upserts `BetLock` record.
  - Updates `MatchOdds` and/or `OtherMarkets` based on input.

- **`unlockBet(req, res)`**:
  - Updates `BetLock` to set both flags to `false`.

- **`lockMultipleBets(req, res)`**:
  - Iterates through `users` array.
  - Performs upsert for each user.
  - Returns success count and errors.

- **`lockAllMatchOdds(req, res)`**:
  - Updates `MatchOdds = true` for ALL records in `BetLock` table.

- **`lockMatchForUser(req, res)`**:
  - Uses `UserMatchLocks.findOrCreate` to lock a specific `event_id`.
