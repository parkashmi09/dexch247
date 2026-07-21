# Bet List API Documentation

## Endpoint
`GET /api/lords/bet-list`

## Description
Fetches a paginated list of bets. 
- **Current Bets**: Retrieves active/open bets from both Sports and Casino.
- **Past Bets**: Retrieves settled bets history (typically from Credits Ledger or settled bet history).

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `current` or `past`. |
| `from` | date | No | Start date (YYYY-MM-DD). Default: `2024-01-01`. |
| `to` | date | No | End date (YYYY-MM-DD). Default: `2025-12-31`. |
| `page` | number | No | Page number for pagination. Default: `1`. |
| `limit` | number | No | Records per page. Default: `50`. |
| `status` | string | No | Filter by status (e.g., `Matched`, `Unmatched`, `Void`, `Settled`). |
| `category`| string | No | `sport` or `casino`. Filters the source of the bets. |
| `sport` | string | No | Specific Sport ID (e.g., `4` for Cricket) or Game Name (e.g., `teen20c` for Casino). |
| `search` | string | No | Generic search term for Match Title, Market, or Selection. |
| `username`| string | No | Filter bets by specific user's username. |

## Endpoint: Context-Aware Bet List
`GET /api/lords/bet-list-by-user`

## Description
Fetches bets for a specific User or a Staff's downline.
- **Used by**: User Details view in Admin Panel.
- **Behavior**:
    -   If `userId` provided: Returns bets for that specific User.
    -   If `staffId` provided: Returns bets for all Users in that Staff's downline.

## Query Parameters (Additional)
In addition to the standard parameters above:

| Parameter | Type | Mode | Description |
|-----------|------|------|-------------|
| `userId` | number | Optional | ID of the specific User to fetch. |
| `staffId` | number | Optional | ID of the Staff to fetch downline bets for. |

---

## Logic: Current Bets (`type=current`)

This mode aggregates data from two distinct tables to provide a unified view of all active internal bets.

### Data Sources
1.  **SportsBet Table** (`SportsBet`): Contains bets related to sports (Cricket, Tennis, Soccer, etc.).
    -   **Table Name**: `SportsBet`
    -   **Join**: `LEFT JOIN users ON SportsBet.user_id = users.user_id`
    -   **Status Filter**: `OPEN`, `PENDING`, `open`, `matched`, `Match`
    
2.  **Casino Bets Table** (`casino_bets`): Contains bets related to casino games (Teen Patti, Poker, etc.).
    -   **Table Name**: `casino_bets`
    -   **Join**: `LEFT JOIN users ON casino_bets.user_id = users.user_id`
    -   **Status Filter**: `pending`, `OPEN`, `open`

### Unified Schema (Response)
The Raw SQL Query maps columns from both tables to a common schema:

| Field | Source (Sports) | Source (Casino) | Description |
|-------|-----------------|-----------------|-------------|
| `id` | `sb.id` | `cb.id` | Bet ID |
| `user_id` | `sb.user_id` | `cb.user_id` | User ID |
| `username` | `u.username` | `u.username` | Username from Users table |
| `created_at`| `sb.created_at` | `cb.created_at` | Date placed |
| `description`| `match_title` or `game_type` | `game_name` | Event/Game Name |
| `selection` | `selection_name` | `selection` | Bet Selection (e.g., "India", "Player A") |
| `game_type` | `game_type` | `type` | Game Identifier |
| `odds` | `odds` | `odds` | Bet Odds |
| `amount` | `stake_amount` | `stake` | Stake Amount |
| `status` | `status` | `status` | Current Status |
| `source` | `'sport'` | `'casino'` | Origin Indicator |

### Filtering Logic
-   **Category Filter**:
    -   If `category=sport`: Only specifically queries `SportsBet`.
    -   If `category=casino`: Only queries `casino_bets`.
    -   If `category=All` (or missing): UNION ALL of both queries.
    
-   **Sport/Game Filter**:
    -   If numeric (e.g., `4`): Assumed to be a Sport ID. Adds `AND sb.sport_id = '4'`.
    -   If string (e.g., `teen20c`): Assumed to be a Casino game or text search. Search in `game_name`, `type`, `mtype` (Casino) and `game_type`, `match_title` (Sports).

### SQL Implementation
The controller uses a Raw SQL `UNION ALL` query to efficiently combine results, apply filters to respective sub-queries, count total records, and apply `LIMIT`/`OFFSET` for pagination.

```sql
SELECT ... FROM "SportsBet" ...
UNION ALL
SELECT ... FROM "casino_bets" ...
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset
```

---

## Logic: Past Bets (`type=past`)

Retrieves historical data from `CreditsLedger`.
-   **Table**: `CreditsLedger`
-   **Filtering**: Standard Sequelize `findAndCountAll` with `where` clauses.
-   **Note**: Does not currently perform a Raw Union; relies on the single ledger table for settle history.
