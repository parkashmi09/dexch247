# Casino Lock System Documentation

## Overview

The **Casino Lock System** allows **Owners** and **Staff** to manage access to specific casino tables/games. It ensures that if a parent (Owner or Staff) locks a game, no one in their downline can play that game. If a specific user is locked, they cannot play.

The system enforces locks at two critical points:
1.  **Management (Frontend/Admin)**: Setting and viewing locks.
2.  **Enforcement (Backend/Betting)**: Verifying locks recursively before allowing a bet.

---

## 1. Backend Architecture (`d99-server`)

### Models
1.  **`TableCasino`**: Represents the casino tables/games (e.g., Teenpatti, Poker).
2.  **`StaffTableLock`**: Stores lock status for **Staff** and **Owners**.
    *   `staff_id`: ID of the staff member (nullable).
    *   `owner_id`: ID of the owner (nullable).
    *   `table_casino_id`: ID of the table (FK to `TableCasino`).
    *   `is_locked`: Boolean status (true = locked).
3.  **`UserTableLock`**: Stores lock status for **Users** (End Bettors).
    *   `user_id`: ID of the user.
    *   `table_casino_id`: ID of the table.
    *   `is_locked`: Boolean status.

---

## 2. Lock Management Logic (Admin Panel)

Managed via `TableCasinoController.js` and `general-lock.jsx`.

### API: Update Lock (`POST /api/admin/table-casino/lock`)
*   **Payload**: `{ staffId, userId, tableCasinoId, isLocked, type }`
*   **Logic**:
    *   **`type === 'SELF'`**: Updates `StaffTableLock` for the logged-in Owner/Staff.
    *   **`type === 'USER'`**: Updates `UserTableLock`. Requires `userId`.
    *   **`type === 'OTHER'`**: Updates `StaffTableLock` for a downline staff member.

### API: Get Locks (`GET /api/admin/table-casino/locks/:id`)
*   Fetches the current lock state for the visual toggle switches.

---

## 3. Lock Enforcement Logic (Betting)

**This is the most critical part.** Before any casino bet is placed, the system verifies permissions recursively.

### Location
*   **File**: `controller/casino/casinoController.js`
*   **Function**: `placeBet`

### Verification Flow (The "Recursive Check")

When a user attempts to place a bet, the system performs the following checks in order. If **ANY** check finds a lock, the bet is **rejected** (403 Forbidden).

#### Step 1: Resolve Game to Table
The system first resolves the incoming `gameId` or `gameName` to a valid `TableCasino` entry to get the `table_casino_id`.

#### Step 2: User Lock Check (Direct)
Checks the `UserTableLock` table for the specific `user_id` and `table_casino_id`.
> **Rule**: If the user is specifically locked, block the bet.

#### Step 3: Hierarchy traversal (The "Upline" Check)
The system walks up the user's hierarchy chain, from their direct parent staff up to the top-level owner.

**Hierarchy Path**:
`User` -> `Parent Staff (L1)` -> `Parent Staff (L2)` -> ... -> `Owner`.

**At each level (Staff or Owner)**:
1.  Check `StaffTableLock` for that `staff_id` (or `owner_id`) and `table_casino_id`.
2.  **Rule**: If `is_locked` is `true` for **ANY** ancestor:
    *   **BLOCK THE BET**.
    *   Return error: *"This game is locked by your upline."*

### Why this works:
*   **Owner Lock**: If the Owner locks a game (e.g., "Poker"), that `OwnerID` + `PokerID` entry is set to locked in `StaffTableLock`. Since *every* user in the system eventually traces back to an Owner, this lock blocks everyone.
*   **Staff Lock**: If a mid-level Staff locks "Poker", only users descending from that Staff member will encounter this locked node in their hierarchy traversal. Users under other Staff members are unaffected.

---

## 4. Example Scenarios

### Scenario A: Owner Locks "Teenpatti"
*   **State**: `StaffTableLock` has `{ owner_id: 1, table: 'Teenpatti', is_locked: true }`.
*   **Action**: Any User under Owner 1 tries to bet on Teenpatti.
*   **Check**:
    1.  User Lock? No.
    2.  Parent Staff Lock? No.
    3.  ...
    4.  **Owner Lock? YES.**
*   **Result**: ❌ Bet Rejected.

### Scenario B: Staff A Locks "Poker"
*   **State**: `StaffTableLock` has `{ staff_id: 100, table: 'Poker', is_locked: true }`.
*   **Action 1**: User X (child of Staff A) bets on Poker.
    *   **Check**: Traversal finds Staff A is locked.
    *   **Result**: ❌ Bet Rejected.
*   **Action 2**: User Y (child of Staff B) bets on Poker.
    *   **Check**: Traversal goes through Staff B (unlocked) -> Owner (unlocked).
    *   **Result**: ✅ Bet Accepted.

### Scenario C: Specific User Locked
*   **State**: `UserTableLock` has `{ user_id: 500, table: 'Baccarat', is_locked: true }`.
*   **Action**: User 500 bets on Baccarat.
    *   **Check**: Step 2 (Direct User Lock) finds lock.
    *   **Result**: ❌ Bet Rejected.

---
