# Reports — Where Each Screen Pulls Its Data From

Every admin/user report that involves JS games data, traced end-to-end: **frontend page → API call → backend route → DB table → columns read → category filter → response shape → known quirks.**

All queries run against **PostgreSQL `diamond`** only. No other database is touched.

## Contents

1. [Admin Account Statement](#1-admin-account-statement)
2. [User Account Statement](#2-user-account-statement)
3. [Admin Total Profit Loss](#3-admin-total-profit-loss)
4. [Admin User Win/Loss](#4-admin-user-winloss)
5. [Category filter cheat-sheet](#category-filter-cheat-sheet)
6. [Loss-sign-convention gotcha](#loss-sign-convention-gotcha)

---

## 1. Admin Account Statement

**Page:** `https://admindiamond99.codefactory.games/admin/reports/accountstatement`

| Layer | File | Purpose |
|-------|------|---------|
| Frontend | `d99-admin/src/pages/accounts/account-statement.jsx` | Filter form, calls API on Load |
| API service | `d99-admin/src/services/ReportService.js:3` | `POST /admin/reports/accountstatement` |
| Route | `d99-server/routes/admin/reportsRoutes.js:8` | Mounts `ReportsController.getAccountStatement` |
| Controller | `d99-server/controller/admin/reportsController.js:122` | Resolves `clientName` → user/staff/owner target, delegates to service |
| Service | `d99-server/services/TransactionReportService.js` `getStatement()` | Does the DB work |

### Frontend → backend payload

Frontend sends `reportType` as the literal string from this mapping (in `account-statement.jsx:76-80`):

| Dropdown label | `reportType` sent |
|----------------|-------------------|
| All | `"ALL"` |
| Deposit/Withdraw Report | `"TRANSACTION"` |
| Sports Report | `"SPORTS"` |
| Casino Report | `"CASINO"` |
| **Third Party Casino Report** | `"THIRD-PARTY"` *(with hyphen; admin frontend convention)* |

### What the service does

For a **user** target (`target.type === 'USER'`):

1. **Fetch transactions** (if `reportType` is `ALL` or `TRANSACTION`):
   - Table: `transactions`
   - Where: `user_id = target.id`, date range on `createdAt`
   - Columns read: `id, createdAt, type, amount, new_balance, balance, debit, credit, initiated_by`

2. **Fetch ledger** (if `reportType` is `ALL`, `SPORTS`, `CASINO`, or `THIRD-PARTY`):
   - Table: `credits_ledger`
   - Where: `user_id = String(target.id)`, date range on `created_at`, **and category filter:**
     | `reportType` | DB filter applied |
     |-------------|------------------|
     | `SPORTS` | `category = 'SPORTS'` |
     | `CASINO` | `category = 'CASINO'` |
     | `THIRD-PARTY` | `category = 'THIRD_PARTY_CASINO'` ← **2026-04-24 fix** (was `'THIRD-PARTY'` — never matched) |
   - Columns read: `id, amount, profit, loss, closing, balance, description, reason, market_type, meta, sport_id, category, bet_id, created_at, eventid, match_id`

3. **Enrich descriptions:**
   - Sports rows: `SportsBet.findAll({ where: { id: bet_id } })` → remark `"{sport} / {match_title} / {market_type} / {selection}"`
   - Casino rows: `SELECT id, game_name, round_id, player_name FROM casino_bets` → remark `"{game_name} / R.No : {round_id} / {player_name}"`
   - **Third-party rows:** no secondary table lookup. Reads from ledger's own `meta` JSONB — remark = `"${meta.provider} / ${meta.game_name}"`, `fromto = meta.game_name`. (2026-04-24 formatting fix — earlier showed raw `THIRD_PARTY_CASINO` string.)

4. **Closing-delta pass:** sort rows chronologically ASC, then recompute `credit`/`debit` as `row.closing − prevClosing`. Keeps the running-balance column tallying row-by-row even when ledger `amount` drifts from actual wallet movement (common during bulk settlement with exposure release).

5. **Filter zero-impact rows** (no wallet movement).

6. **Return ASC** (oldest first). 2026-04-24 change — was DESC, now matches the user-facing page.

### Response shape

```json
{
  "success": true,
  "data": [
    {
      "id": "lg-948",
      "date": "2026-04-23T10:07:44.614Z",
      "credit": 16.80,
      "debit": 0,
      "closing": 2212.37,
      "description": "spribe / Aviator",
      "fromto": "Aviator"
    }
  ],
  "total": 5,
  "totalPages": 1,
  "currentPage": 1
}
```

### Known: staff/owner target

When `clientName` resolves to a Staff/Owner instead of a User, the service takes a **different branch** (`TransactionReportService.js:245+`). It aggregates ledger rows for all descendant users, applies `staff.percentage / 100` to compute this staff's share, and builds a running P&L trail. Same category filter fix applies (line ~299).

---

## 2. User Account Statement

**Page:** `https://diamond99.codefactory.games/user/account-statement`

| Layer | File | Purpose |
|-------|------|---------|
| Frontend | `d99-frontend/src/components/accountStatement/index.js` | Filter form |
| API service | `d99-frontend/src/apiservices/UserStatementService.js:8` | `POST /user/account-statement` |
| Route | `d99-server/routes/user/userStatementRoutes.js:8` | `UserStatementController.getAccountStatement` |
| Service | `d99-server/services/user/UserStatementService.js` `getAccountStatement()` | Does the DB work |

### Frontend → backend payload

Frontend sends `reportType` from this mapping (`accountStatement/index.js:162-164`):

| Dropdown label | `reportType` sent |
|----------------|-------------------|
| Sport Report | `"SPORTS"` |
| Casino Reports | `"CASINO"` |
| **Third-Party Casino Reports** | `"THIRD-PARTY-CASINO"` *(different naming from admin — includes the `-CASINO` suffix)* |

### What the service does

1. **Branch by type:**
   - `"" / "TRANSACTION" / "Deposit/Withdraw"` → only `transactions` table
   - `"SPORTS" / "CASINO" / "THIRD-PARTY-CASINO"` → only `credits_ledger`

2. **Ledger fetch** (table: `credits_ledger`, where: `user_id = String(user.id)`, date range):

   | `reportType` | DB filter |
   |-------------|----------|
   | `SPORTS` | `category = 'SPORTS'` |
   | `CASINO` | `category = 'CASINO'` |
   | `THIRD-PARTY-CASINO` | `category = 'THIRD_PARTY_CASINO'` |

   Same columns as admin path.

3. **Enrich descriptions:** sports from `SportsBet`, casino from `casino_bets`. Third-party uses `meta.game_name` for the `fromto` column; `description` is taken directly from the ledger's `description` column (`"{provider} / {game_name}"` — written by the controller at `gameController.js:236`).

4. **Closing-delta pass** — identical algorithm to the admin path.

5. **Return ASC** (oldest first).

### Response shape

Same shape as admin. `id` prefix differs (`ld-` for user path, `lg-` for admin path) but the data is identical for the same user + filter.

---

## 3. Admin Total Profit Loss

**Page:** `https://admindiamond99.codefactory.games/admin/reports/totalprofitloss`

| Layer | File |
|-------|------|
| Frontend | `d99-admin/src/pages/reports/total-profit-loss.jsx` |
| API service | `d99-admin/src/services/api.js:206` |
| Route | `d99-server/routes/admin/reportsRoutes.js:21` |
| Controller | `d99-server/controller/admin/reportsController.js:511` `getTotalProfitLoss` |

### Frontend → backend payload

Type dropdown sends a numeric string (`total-profit-loss.jsx:289-292`):

| Label | `type` sent |
|-------|-------------|
| All | `"0"` |
| Sports Report | `"2"` |
| Casino Report | `"3"` |
| Third Party Casino Report | `"4"` |

Also: `clientName` (or `"all"`), `fromDate`, `toDate`.

### What the controller does

1. **Resolve user set** via `getUserIdsByHierarchy(role, username)` → all downline users the caller is allowed to see. If a specific `clientName` was picked, narrow to that single user.

2. **Fetch ledger rows:**
   - Table: `credits_ledger`
   - Where: `user_id IN (...)`, date range on `created_at`, and **category filter:**
     | `type` | DB filter |
     |--------|----------|
     | `"0"` (All) | no category filter |
     | `"2"` | `category IN ('SPORTS')` |
     | `"3"` | `category IN ('CASINO')` |
     | `"4"` | `category IN ('THIRD_PARTY_CASINO')` ← **2026-04-24 fix** (was `'THIRD-PARTY'`) |
   - Columns read: `eventid, match_id, category, market_type, profit, loss, sport_id, meta` ← `sport_id` and `meta` added 2026-04-24 for third-party grouping.

3. **Group by category:**

   - **Sports:** key = `"${eventid}__${market_type}"`. `event_name` resolved later via one-time `SportsBet.findAll({ eventid IN })` lookup for `match_title`.
   - **Casino:** key = `row.match_id || 'Casino'`.
   - **Third-party:** key = `"${meta.provider || sport_id} / ${meta.game_name || match_id || 'Unknown Game'}"`. 2026-04-24 change — previously keyed off `match_id` alone, which is `null` for v2 rows (v2 stores game info in `meta`). Result: everything collapsed into one row labelled "Third Party".

4. **Compute totals** per group: `totalProfit = SUM(profit)`, `totalLoss = SUM(|loss|)`, `profit_loss = totalProfit − totalLoss`.

### Response shape

```json
{
  "success": true,
  "sports":     [{ "event_name": "...", "game_type": "...", "opening": 12.8, "closing": 60, "profit_loss": 47.2 }],
  "casino":     [{ "casino_name": "...", "opening": ..., "closing": ..., "profit_loss": ... }],
  "thirdParty": [{ "third_party_name": "spribe / Aviator", "opening": 12.80, "closing": 60.00, "profit_loss": 47.20 }]
}
```

`opening` is the `totalLoss` figure, `closing` is the `totalProfit` figure — an artefact of the original UI; do not confuse with wallet opening/closing balances.

---

## 4. Admin User Win/Loss

**Page:** `https://admindiamond99.codefactory.games/admin/reports/userwinloss`

| Layer | File |
|-------|------|
| Frontend | `d99-admin/src/pages/reports/user-win-loss.jsx` |
| API service | `d99-admin/src/services/ReportService.js` |
| Route | `d99-server/routes/admin/reportsRoutes.js:19` |
| Controller | `d99-server/controller/admin/reportsController.js:16` `getUserWinLoss` |

### Frontend → backend payload

`{ clientName, fromDate, toDate }`. No category filter on this screen — it always aggregates across SPORTS, CASINO, and THIRD_PARTY_CASINO.

### What the controller does

1. **Resolve user set** via hierarchy (same helper as Total Profit Loss).

2. **Aggregate in SQL:**
   - Table: `credits_ledger`
   - Where: `user_id IN (...)`, date range
   - `GROUP BY user_id, category`
   - `SELECT user_id, category, COALESCE(SUM(profit),0) AS total_profit, COALESCE(SUM(loss),0) AS total_loss`

3. **Build per-user map:**
   ```js
   userMap[user_id] = { SPORTS: 0, CASINO: 0, THIRD_PARTY_CASINO: 0 };
   ```
   **2026-04-24 fix** — key was `'THIRD-PARTY'` earlier, never matched any category in the DB.

4. **Net P/L formula (2026-04-24 fix):**
   ```js
   net = total_profit - Math.abs(total_loss);
   ```
   Earlier: `total_profit + total_loss`, which broke on THIRD_PARTY_CASINO because v2 writes `loss` as a positive number (see [Loss-sign-convention gotcha](#loss-sign-convention-gotcha)).

5. **Enrich with usernames** via `User.findAll({ where: { user_id IN } })`.

6. Sort by `profit_loss` DESC.

### Response shape

```json
{
  "success": true,
  "data": [
    {
      "user_id": 14,
      "username": "testuser111",
      "sport": 714.00,
      "casino": -472.75,
      "third_party": 47.20,
      "profit_loss": 288.45
    }
  ]
}
```

---

## Category filter cheat-sheet

When writing new code that queries `credits_ledger` for third-party data, **always use the underscore form**:

| Context | String to use |
|---------|--------------|
| DB `category` column value (immutable, written by controllers) | `'THIRD_PARTY_CASINO'` |
| Admin frontend dropdown (`reportType` sent to backend) | `'THIRD-PARTY'` |
| User frontend dropdown (`reportType` sent to backend) | `'THIRD-PARTY-CASINO'` |
| Total Profit Loss `type` code | `'4'` |

Both admin and user backend services translate the frontend value → DB value. Do not query the DB with the frontend form or you will silently get zero rows.

---

## Loss-sign-convention gotcha

The `credits_ledger.loss` column is written with **inconsistent sign conventions** across categories:

| Source | `loss` column stored as | Written at |
|--------|------------------------|-----------|
| Sports settlement | Negative (e.g. `-100.00`) | `settlementWorker.js`, `settlementv2.js` |
| Casino settlement | Negative (e.g. `-50.00`) | `casinobet/settlementCasinoWorker.js` |
| **JS games (v1 + v2)** | **Positive** (e.g. `12.80`) | `jsgames/controller.js:196`, `jsgamesv2/gameController.js:238` |

If you need total P&L across categories, **normalize**:

```js
const net = total_profit - Math.abs(total_loss);
```

A query like `SUM(profit) + SUM(loss)` will:
- work for SPORTS/CASINO only (loss is negative, so `+` subtracts),
- over-count for THIRD_PARTY_CASINO (loss is positive, so `+` double-counts).

This bit `getUserWinLoss` pre-2026-04-24. `getTotalProfitLoss` already used `Math.abs` so it was fine.

---

## Changelog — 2026-04-24 Report Fixes

| File | Lines | Change |
|------|-------|--------|
| `d99-server/services/TransactionReportService.js` | 72-73 | User branch: category filter `'THIRD-PARTY'` → `'THIRD_PARTY_CASINO'` |
| `d99-server/services/TransactionReportService.js` | ~165-181 | User branch: format `description`/`fromto` for third-party from `meta` |
| `d99-server/services/TransactionReportService.js` | ~238-242 | User branch: drop DESC sort, return chronological ASC |
| `d99-server/services/TransactionReportService.js` | 291 | Staff/Owner branch: same category fix |
| `d99-server/services/TransactionReportService.js` | ~307 | Staff/Owner branch: ledger fetch ASC (fixes running-closing semantics) |
| `d99-server/services/TransactionReportService.js` | ~365-372 | Staff/Owner branch: third-party description/fromto from meta |
| `d99-server/controller/admin/reportsController.js` | 562 | Total Profit Loss: category filter fix |
| `d99-server/controller/admin/reportsController.js` | 571 | Total Profit Loss: SELECT `meta`, `sport_id` added |
| `d99-server/controller/admin/reportsController.js` | 599-606 | Total Profit Loss: third-party grouping key = `"{provider} / {game_name}"` |
| `d99-server/controller/admin/reportsController.js` | 73 | User Win/Loss: userMap key `'THIRD-PARTY'` → `'THIRD_PARTY_CASINO'` |
| `d99-server/controller/admin/reportsController.js` | 76-79 | User Win/Loss: `net = profit − |loss|` (handles both sign conventions) |
| `d99-server/controller/admin/reportsController.js` | 101 | User Win/Loss: read `cats.THIRD_PARTY_CASINO` instead of `cats['THIRD-PARTY']` |
