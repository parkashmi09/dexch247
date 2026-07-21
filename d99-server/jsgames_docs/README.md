# JSGames System - Developer Documentation

> Complete guide for new developers on how third-party casino games work in the diamond99 platform.

> **Separate report docs:** [`REPORTS.md`](./REPORTS.md) — every admin/user report that consumes JS games data, with the exact DB table → column → route mapping and the 2026-04-24 category/normalization fixes.

---

## Recent Changes (2026-04-24)

1. **Wallet update now moves `cash` AND `inr_balance` together.** Previously only `cash` was incremented on each callback, which caused the main header/wallet (bound to `inr_balance`) not to reflect JS game wins/losses. Since JS games have **no exposure concept** (unlike sports), both fields move in lockstep by the same `delta = winAmount − betAmount`. Validation still checks `cash` only — the invariant `cash ≤ inr_balance` keeps `inr_balance` safe automatically. See section 11.
2. **Admin reports now find third-party data.** Category mismatch fixes in `reportsController.js` and `TransactionReportService.js` — the DB stores `category = 'THIRD_PARTY_CASINO'` but admin code was filtering for `'THIRD-PARTY'`. Fully documented in [`REPORTS.md`](./REPORTS.md).
3. **Admin statement order aligned with user page** — rows now return ASC (oldest first), matching `/user/account-statement`.
4. **User Win/Loss aggregation normalized.** Changed from `profit + loss` to `profit − |loss|` because third-party ledger rows store `loss` as positive while sports/casino store it negative. The new formula handles both conventions correctly.

---

## Table of Contents

1. [Big Picture - What Is This?](#1-big-picture)
2. [The 3 Systems](#2-the-3-systems)
3. [Directory Structure](#3-directory-structure)
4. [Complete Game Flow - Step by Step](#4-complete-game-flow)
5. [jsgamesv2 Module (V2 - Primary)](#5-jsgamesv2-module)
6. [jsgames Module (V1 - Direct Provider)](#6-jsgames-module)
7. [Sequelize Models](#7-sequelize-models)
8. [Database Tables](#8-database-tables)
9. [Game Integration System (Middleware)](#9-game-integration-system)
10. [Authentication Between Systems](#10-authentication)
11. [Bet Callback - The Money Flow](#11-bet-callback-the-money-flow)
12. [Credits Ledger](#12-credits-ledger)
13. [Rakeback System](#13-rakeback-system)
14. [Frontend Integration](#14-frontend-integration)
15. [Configuration](#15-configuration)
16. [Common Issues & Debugging](#16-debugging)

---

## 1. Big Picture

This system lets users play third-party casino games (slots, roulette, live casino, crash games, etc.) from providers like Evolution, Spribe, Pragmatic, Microgaming, and others.

The games are NOT hosted by us. They run on an external provider (huidu.bet). Our system:
- Shows the game catalog to users
- Launches games in an iframe
- Receives bet results via callbacks
- Updates user wallets (debit on bet, credit on win)
- Records everything in transaction logs and credits ledger

**Key concept:** Every time a user bets or wins inside a third-party game, the provider sends a callback to our server. We update the balance and send it back. This happens for EVERY SINGLE bet/spin/action.

---

## 2. The 3 Systems

```
┌─────────────────────┐     ┌────────────────────────────┐     ┌──────────────┐
│  d99-server          │     │  game-integration-system   │     │  huidu.bet    │
│  (this codebase)     │     │  (middleware)              │     │  (provider)   │
│                      │     │                            │     │              │
│  jsgamesv2/ ─────────│────>│  Port 3031                 │────>│  Hosts games  │
│  jsgames/            │     │  /var/www/html/apigames/   │     │  Sends bet    │
│                      │<────│  game-integration-system-  │<────│  callbacks    │
│  Port 9971           │     │  dev/                      │     │              │
└─────────────────────┘     └────────────────────────────┘     └──────────────┘
```

### d99-server (this codebase)
- **Role:** YOUR backend. Manages users, wallets, game sessions, transactions
- **Port:** 9971
- **Has 2 game modules:** `jsgamesv2/` (primary) and `jsgames/` (direct provider)

### game-integration-system (middleware)
- **Role:** Sits between d99-server and huidu.bet. Manages multiple clients, GGR, encryption
- **Port:** 3031
- **Location:** `/var/www/html/apigames/game-integration-system-dev/`
- **Why it exists:** Handles multi-tenant client management, API key auth, balance callbacks, GGR calculation, and AES encryption with the provider

### huidu.bet (provider)
- **Role:** Hosts the actual games. Players play directly on their servers
- **Sends callbacks** to game-integration-system when bets are placed/settled

---

## 3. Directory Structure

```
d99-server/
├── jsgamesv2/                          # V2 - Goes through game-integration-system
│   ├── gameController.js               # Route handlers (functions, not class)
│   ├── gameRoutes.js                   # Express routes
│   ├── config.js                       # API key, secret, base URL for middleware
│   ├── cryptoUtils.js                  # HMAC-SHA256 signature generation
│   ├── logger.js                       # Simple console logger
│   └── models/                         # Sequelize models (modular)
│       ├── JSGame.js                   # js_games table
│       ├── JSGameTransaction.js        # js_game_transactions table
│       └── ExchangeRate.js             # exchangerate table
│
├── jsgames/                            # V1 - Direct to huidu.bet (AES encrypted)
│   ├── controller.js                   # Route handlers (functions, not class)
│   ├── routes.js                       # Express routes
│   ├── gameResposneHandler.js          # Error codes & response formatting
│   └── models/                         # Sequelize models (modular)
│       ├── JSGame.js                   # js_games table
│       ├── JSGameTransaction.js        # js_game_transactions table
│       ├── PrioritizedGame.js          # prioritized_games table
│       └── ExchangeRate.js             # exchangerate table
│
├── model/                              # Shared models used by both modules
│   ├── GameSession.js                  # game_sessions table (V2 sessions)
│   ├── user/
│   │   ├── User.js                     # users table
│   │   ├── JSGameSession.js            # js_game_sessions table (V1 sessions)
│   │   └── CreditsLedger.js            # credits_ledger table
│   └── admin/
│       └── Wallet.js                   # Wallets table
│
└── server.js                           # Route mounting:
                                        #   app.use('/api/jsGames', jsGamesRoutes)
                                        #   app.use('/api/jsGamesv2', jsGamesv2)
```

---

## 4. Complete Game Flow - Step by Step

### Phase 1: User Sees Games

```
Browser                     d99-server (V1)               game-integration-system
   │                             │                              │
   │ GET /api/jsGames/games      │                              │
   │ ?vendor=evolution&page=1    │                              │
   │────────────────────────────>│                              │
   │                             │                              │
   │                 Queries js_games table                     │
   │                 using JSGame Sequelize model               │
   │                 with caching (NodeCache, 5min)             │
   │                             │                              │
   │  { success, code:0,        │                              │
   │    payload: { games: [...], │                              │
   │    pagination: {...} } }    │                              │
   │<────────────────────────────│                              │
```

Game listing uses V1 `/api/jsGames/` which queries the LOCAL `js_games` PostgreSQL table directly. No middleware involved.

### Phase 2: User Launches a Game

```
Browser                     d99-server (V2)               game-integration-system    huidu.bet
   │                             │                              │                       │
   │ POST /api/jsGamesv2/launch  │                              │                       │
   │ {game_uid, user_id,         │                              │                       │
   │  credit_amount, currency}   │                              │                       │
   │────────────────────────────>│                              │                       │
   │                             │                              │                       │
   │               1. Find user (User model)                    │                       │
   │               2. Find wallet (Wallet model)                │                       │
   │               3. Build payload + HMAC signature            │                       │
   │                             │                              │                       │
   │                             │ POST /api/game/launch        │                       │
   │                             │ Headers: x-api-key,          │                       │
   │                             │ x-timestamp, x-signature     │                       │
   │                             │─────────────────────────────>│                       │
   │                             │                              │                       │
   │                             │               Validates API key + signature          │
   │                             │               Gets/creates user in MySQL             │
   │                             │               Encrypts payload (AES-256-ECB)        │
   │                             │                              │                       │
   │                             │                              │ POST /game/v1         │
   │                             │                              │ {encrypted payload}   │
   │                             │                              │──────────────────────>│
   │                             │                              │                       │
   │                             │                              │ {game_launch_url}     │
   │                             │                              │<──────────────────────│
   │                             │                              │                       │
   │                             │ {game_launch_url,            │                       │
   │                             │  session_token}              │                       │
   │                             │<─────────────────────────────│                       │
   │                             │                              │                       │
   │               4. Save GameSession                          │                       │
   │                             │                              │                       │
   │ {success, data:             │                              │                       │
   │  {game_launch_url,          │                              │                       │
   │   session_token}}           │                              │                       │
   │<────────────────────────────│                              │                       │
   │                             │                              │                       │
   │ Opens game_launch_url       │                              │                       │
   │ in iframe ════════════════════════════════════════════════════════════════════════>│
```

Game launch uses V2 `/api/jsGamesv2/` which goes through the game-integration-system middleware.

### Phase 3: User Plays (Bet Callback Loop)

Every bet/spin/action triggers this flow:

```
huidu.bet                game-integration-system              d99-server (V2)
   │                              │                              │
   │ POST /api/game/bet-callback  │                              │
   │ {encrypted payload}          │                              │
   │─────────────────────────────>│                              │
   │                              │                              │
   │              Decrypts payload (AES-256-ECB)                 │
   │              Extracts user_id from member_account           │
   │              Determines transaction type                    │
   │                              │                              │
   │                              │ POST /api/jsGamesv2/         │
   │                              │ v2/bet-callback              │
   │                              │ {user_id, game_uid,          │
   │                              │  bet_amount, win_amount,     │
   │                              │  currency, game_round}       │
   │                              │─────────────────────────────>│
   │                              │                              │
   │                              │           processBetCallbackV2():
   │                              │           1. Lock wallet (SELECT FOR UPDATE)
   │                              │           2. Calculate: new = current - bet + win
   │                              │           3. Check balance >= 0
   │                              │           4. UPDATE Wallets
   │                              │           5. INSERT js_game_transactions
   │                              │           6. COMMIT transaction
   │                              │           7. Credits Ledger (on win/loss only)
   │                              │           8. Rakeback (on bet/bet_result only)
   │                              │                              │
   │                              │ {success: true,              │
   │                              │  new_balance: "950"}         │
   │                              │<─────────────────────────────│
   │                              │                              │
   │              Updates client balance (GGR)                   │
   │              Encrypts response                              │
   │                              │                              │
   │ {code:0, payload:encrypted   │                              │
   │  {credit_amount:"950"}}      │                              │
   │<─────────────────────────────│                              │
   │                              │                              │
   │ Game UI shows balance: 950   │                              │
```

**This loop repeats for EVERY bet.** A 10-minute game session might have 50+ callbacks.

---

## 5. jsgamesv2 Module (V2 - Primary)

This is the PRIMARY module used for game launching and bet processing. It communicates with the game-integration-system middleware.

### Routes (`jsgamesv2/gameRoutes.js`)

| Method | Endpoint | Handler | Purpose |
|--------|----------|---------|---------|
| POST | `/launch` | `getGameLaunchURL` | Launch game via middleware |
| POST | `/bet-callback` | `processBetCallbackV2` | Receive bet results from middleware |
| POST | `/v2/bet-callback` | `processBetCallbackV2` | Same (alias) |
| GET | `/games` | `getActiveGames` | List games (proxy to middleware) |
| GET | `/games/search` | `searchGames` | Search games (proxy to middleware) |
| GET | `/history` | `userhistory` | User game history |
| GET | `/historyAdmin` | `userhistoryAdmin` | Admin game history |

### Controller Functions (`jsgamesv2/gameController.js`)

All functions are plain `async function` exports (no classes).

#### `getGameLaunchURL(req, res)`
1. Validates required fields (`game_uid`, `user_id`, `credit_amount`, `currency_code`)
2. Fetches user from `User` model
3. Fetches wallet from `Wallet` model
4. Builds payload and HMAC-SHA256 signature
5. Calls `POST http://localhost:3031/api/game/launch`
6. Saves session via `GameSession.create()`
7. Returns `{ success, data: { game_launch_url, session_token } }`

#### `processBetCallbackV2(req, res)` - THE CORE FUNCTION
This is where the money moves. Called by game-integration-system on every bet result.

**Input:**
```json
{
  "user_id": "42",
  "game_uid": "abc123",
  "game_round": "round_789",
  "serial_number": "sn_456",
  "bet_amount": 100,
  "win_amount": 250,
  "currency": "INR",
  "timestamp": 1711180900000
}
```

**Transaction Type Matrix:**

| bet_amount | win_amount | Type | Meaning |
|-----------|-----------|------|---------|
| > 0 | > 0 | `bet_result` | Bet + win in single callback |
| > 0 | = 0 | `bet` | Bet placed (money deducted) |
| = 0 | > 0 | `win` | Win credited |
| = 0 | = 0 | `loss` | Round ended, no change |

**Processing Steps (inside Sequelize transaction with row lock):**
1. `Wallet.findOne()` with `lock: t.LOCK.UPDATE` — prevents race conditions
2. Calculate `newBalance = currentBalance - betAmount + winAmount`
3. Reject if `newBalance < 0` (insufficient balance)
4. `Wallet.update()` — set new balance
5. `JSGameTransaction.create()` — record the transaction
6. `COMMIT` — atomic, all-or-nothing

**After commit (fire-and-forget):**
7. **Credits Ledger** — only on `win`, `loss`, or `bet_result` (settled rounds)
8. **Rakeback** — 0.2% of bet amount on `bet` or `bet_result`

#### `getActiveGames(req, res)` / `searchGames(req, res)`
Proxy to game-integration-system at `localhost:3031`. Returns game list from the middleware's MySQL database.

### Config (`jsgamesv2/config.js`)
```javascript
{
  gameApi: {
    baseUrl: 'http://localhost:3031/api/game/',
    apiKey: '0a21b23471ada537b04ae266599a886a',      // Registered in middleware
    apiSecret: '755da31a15c9219bee3384fb038...',       // Used for HMAC signing
  }
}
```

### Auth Headers (`jsgamesv2/cryptoUtils.js`)
Every request to the middleware includes:
```
x-api-key:    <apiKey>
x-timestamp:  <current_ms>              (valid for 5 min)
x-signature:  HMAC-SHA256(sorted_params, apiSecret)
```

Signature is generated by:
1. Sort all params (body + timestamp) alphabetically by key
2. Join as `key1=value1&key2=value2`
3. HMAC-SHA256 with `apiSecret`

---

## 6. jsgames Module (V1 - Direct Provider)

This module talks DIRECTLY to huidu.bet (no middleware). Used for game listing from local DB and as a fallback provider integration.

### Routes (`jsgames/routes.js`)

| Method | Endpoint | Handler | Purpose |
|--------|----------|---------|---------|
| POST | `/game/launch` | `getGameLaunchURL` | Launch game directly with provider |
| POST | `/game/bet-callback` | `processBetCallback` | Receive encrypted callbacks from provider |
| POST | `/game/transfer` | `processGameTransfer` | Deposit/withdrawal to provider |
| POST | `/game/transactions` | `getTransactionRecords` | Fetch transaction history from provider |
| GET | `/games` | `getActiveGames` | List games from LOCAL js_games table |
| GET | `/games/search` | `searchGames` | Search games from LOCAL js_games table |

### Key Differences from V2

| Feature | V1 (jsgames) | V2 (jsgamesv2) |
|---------|-------------|----------------|
| Game launch | Direct to huidu.bet | Through middleware (localhost:3031) |
| Encryption | AES-256-ECB | HMAC-SHA256 signatures |
| Game listing | Local PostgreSQL `js_games` table | Proxy to middleware |
| Bet callback | Encrypted from huidu.bet | Plain JSON from middleware |
| Response format | `{ success, code, payload }` | `{ success, data }` |
| Session model | JSGameSession | GameSession |

### AES Encryption (V1 only)
V1 communicates with huidu.bet using AES-256-ECB encrypted payloads:
```javascript
// Encrypt: JSON → AES-256-ECB → Base64
encryptPayload(payload, AGENCY_CONFIG.aes_key)

// Decrypt: Base64 → AES-256-ECB → JSON (using CryptoJS)
decryptPayload(encrypted, AGENCY_CONFIG.aes_key)
```

### Agency Config (V1 only)
```javascript
{
  agency_uid: 'b96581ad0785ff9f86c960def63aee4b',
  aes_key: '8ce9295ab6786ef6e4bd8d07eda4ce81',
  player_prefix: 'h24e9e',
  server_url: 'https://huidu.bet'
}
```

### Game Listing with Prioritization (V1)
V1's `getActiveGames` queries the LOCAL `js_games` table with:
- **NodeCache** (5-minute TTL) to reduce DB queries
- **PrioritizedGame** model to show featured games first on page 1
- **Vendor filtering** and pagination

---

## 7. Sequelize Models

### JSGame (`jsgamesv2/models/JSGame.js` and `jsgames/models/JSGame.js`)
```
Table: js_games
├── id            INTEGER PK AUTO_INCREMENT
├── game_uid      STRING UNIQUE         — Provider's game identifier
├── game_name     STRING                — "Crazy Time", "Aviator"
├── vendor        STRING                — "evolution", "spribe", "pragmatic"
├── game_type     STRING                — "CasinoLive", "Slots", "Arcade"
├── game_icon     STRING                — URL to game thumbnail
├── description   TEXT
├── is_active     BOOLEAN DEFAULT true
├── created_at    TIMESTAMP
└── updated_at    TIMESTAMP
```

### JSGameTransaction (`jsgamesv2/models/JSGameTransaction.js`)
```
Table: js_game_transactions
├── id                       INTEGER PK AUTO_INCREMENT
├── user_id                  BIGINT NOT NULL
├── game_uid                 STRING
├── transaction_type         STRING      — "bet", "win", "loss", "bet_result"
├── amount                   DECIMAL(18,8)
├── currency                 STRING
├── transaction_status       STRING      — "processed"
├── external_transaction_id  STRING      — game_round ID
├── serial_number            STRING
├── additional_data          JSONB       — full callback payload
└── timestamp                TIMESTAMP DEFAULT NOW
```

### GameSession (`model/GameSession.js`) — V2 sessions
```
Table: game_sessions
├── id             INTEGER PK AUTO_INCREMENT
├── user_id        INTEGER
├── game_uid       STRING
├── session_token  STRING
├── launch_url     TEXT
├── createdAt      TIMESTAMP
└── updatedAt      TIMESTAMP
```

### JSGameSession (`model/user/JSGameSession.js`) — V1 sessions
```
Table: js_game_sessions
├── id             INTEGER PK AUTO_INCREMENT
├── user_id        STRING
├── game_uid       STRING
├── session_token  STRING
├── launch_url     STRING
├── status         STRING DEFAULT 'active'
├── started_at     TIMESTAMP
└── ended_at       TIMESTAMP
```

### PrioritizedGame (`jsgames/models/PrioritizedGame.js`) — V1 only
```
Table: prioritized_games
├── vendor    STRING PK    — "evolution", "spribe"
└── game_ids  TEXT         — "385,343,401" (comma-separated IDs shown first)
```

### ExchangeRate (`models/ExchangeRate.js`)
```
Table: exchangerate
├── currency      STRING PK    — "INR", "USD", "USDT"
├── usd_rate      DECIMAL      — 0.01190 (1 INR = 0.0119 USD)
└── last_updated  TIMESTAMP
```

### CreditsLedger (`model/user/CreditsLedger.js`)
```
Table: credits_ledger
├── id           BIGINT PK AUTO_INCREMENT
├── user_id      TEXT
├── bet_id       BIGINT
├── currency     TEXT DEFAULT 'INR'
├── amount       DECIMAL         — Net change (+win / -loss)
├── reason       TEXT            — "win", "loss", "bet_result"
├── description  TEXT            — "evolution - Crazy Time; win; bet=0; win=250"
├── eventid      TEXT            — game_round
├── match_id     TEXT            — serial_number
├── meta         JSONB           — {game_name, provider, bet_amount, win_amount, ...}
├── market_type  TEXT            — "THIRD_PARTY_CASINO"
├── sport_id     TEXT            — provider name ("evolution", "spribe")
├── category     STRING(20)      — "THIRD_PARTY_CASINO" | "SPORTS" | "CASINO"
├── commission   DECIMAL(18,2)
├── netamount    DECIMAL(18,2)   — Amount after commission (wins only)
├── profit       DECIMAL(18,2)   — Win amount (wins only)
├── loss         DECIMAL(18,2)   — Loss amount (losses only)
├── closing      DECIMAL(18,2)   — Net change
├── balance      DECIMAL(18,2)   — Wallet balance after this entry
└── created_at   TIMESTAMP
```

---

## 8. Database Tables

### PostgreSQL (reddyanna database)

| Table | Used By | Purpose |
|-------|---------|---------|
| `js_games` | V1, V2 | Game catalog (1980 games) |
| `js_game_transactions` | V1, V2 | Every bet/win/loss record |
| `game_sessions` | V2 | Game launch sessions |
| `js_game_sessions` | V1 | Game launch sessions |
| `prioritized_games` | V1 | Featured games per vendor |
| `exchangerate` | V2 | Currency rates for rakeback |
| `credits_ledger` | V1, V2 | Financial ledger (THIRD_PARTY_CASINO) |
| `Wallets` | V1, V2 | User balances |
| `users` | V2 | User info, rakeback amount |

### MySQL (game_integration_system database)

| Table | Purpose |
|-------|---------|
| `clients` | Registered game clients (reddyanna = id 46) |
| `client_users` | Players mapped per client |
| `games` | Master game catalog |
| `game_sessions` | Launch sessions |
| `game_transactions` | Transaction records |
| `client_vendor_settings` | Which vendors are enabled per client |
| `exchangerate` | Currency rates |

---

## 9. Game Integration System (Middleware)

**Location:** `/var/www/html/apigames/game-integration-system-dev/`
**Port:** 3031
**Database:** MySQL `game_integration_system`

### What It Does
1. **Client Management** — Each d99-server instance registers as a client with an API key
2. **Game Launch Proxy** — Receives launch requests, encrypts with AES, forwards to huidu.bet
3. **Bet Callback Router** — Receives encrypted callbacks from huidu.bet, decrypts, sends to correct client's callback_url
4. **GGR Calculation** — Takes a percentage of gaming profit (platform revenue)
5. **Balance Tracking** — Tracks client balance and user balance in its own MySQL DB

### Reddyanna Client Registration
```
Client ID:     46
Client Name:   reddyanna
API Key:       0a21b23471ada537b04ae266599a886a
Callback URL:  https://api.reddyannaexch.cloud/api/jsGamesv2/v2/bet-callback
Status:        active
Balance:       100.00 USD
GGR:           15%
```

### How It Processes a Bet Callback from huidu.bet

1. Receive encrypted payload from huidu.bet
2. Decrypt with AES-256-ECB
3. Extract `client_id` from `member_account` (format: `h24e9e_clientId_userId`)
4. Look up client's `callback_url`
5. Send bet data to client: `POST https://api.reddyannaexch.cloud/api/jsGamesv2/v2/bet-callback`
6. Client (d99-server) processes bet, returns `{ new_balance: "950" }`
7. Calculate GGR from gaming profit
8. Send encrypted balance back to huidu.bet

### PM2 Processes
```bash
pm2 status | grep game
# game-integration-dev    (id: 76) — Main API + workers
# game-integration-system (id: 13) — Old version on port 3030 (DO NOT USE)
```

---

## 10. Authentication Between Systems

### Frontend → d99-server
```
Header: Authorization: Bearer <JWT token>
```
Standard JWT auth from user login.

### d99-server → game-integration-system
```
Header: x-api-key:    0a21b23471ada537b04ae266599a886a
Header: x-timestamp:  1711180800000
Header: x-signature:  HMAC-SHA256(sorted_params, apiSecret)
```
- Timestamp must be within 5 minutes
- Signature uses sorted `key=value&key=value` pairs

### game-integration-system → huidu.bet
```
Body: { payload: AES-256-ECB-encrypted-JSON }
```
All data encrypted with agency AES key.

### game-integration-system → d99-server (bet callback)
```
Header: Authorization: Bearer <client.api_secret>
Body: { user_id, game_uid, bet_amount, win_amount, ... }
```
Plain JSON with the client's API secret as bearer token.

---

## 11. Bet Callback - The Money Flow

### Balance Formula
```
newBalance = currentBalance - betAmount + winAmount
```

### Examples
```
Starting balance: 1000 INR

Bet placed (bet=100, win=0):     1000 - 100 + 0   = 900
Win result (bet=0, win=250):      900 - 0   + 250  = 1150
Bet+Win    (bet=50, win=120):    1150 - 50  + 120  = 1220
Loss       (bet=0, win=0):      1220 - 0   + 0    = 1220 (no change)
```

### Database Writes Per Bet Callback

**Inside the Sequelize transaction (atomic, rolls back on failure):**

```
1. SELECT cash, inr_balance FROM "Wallets" WHERE user_id = X FOR UPDATE
2. Compute delta = winAmount − betAmount
3. If cash + delta < 0 → reject ("Insufficient balance"), rollback
4. UPDATE "Wallets"
     SET cash        = cash        + delta,
         inr_balance = inr_balance + delta           ← both fields move together (2026-04-24)
     WHERE user_id = X
5. INSERT js_game_transactions (audit log of raw callback payload)
6. COMMIT
```

**After commit (fire-and-forget, failures logged but do not reverse the bet):**

```
7. UPDATE game_sessions SET exit_balance = newBalance (latest session row)
8. Emit socket: emitBalanceUpdate(user_id, {cash, inr_balance})   ← header refresh
9. credits_ledger upsert keyed by "session-{game_sessions.id}"   ← one row per session, not per callback
10. UPDATE users SET rakeamount += betAmount * 0.002 (INR→USD if currency=INR)  ← only on "bet"/"bet_result"
```

Key points:
- **Only `cash` is validated** before the update — `inr_balance` does not need its own check because the project-wide invariant `cash ≤ inr_balance` guarantees `inr_balance` stays non-negative whenever `cash` does.
- **`inr_balance` moves in lockstep with `cash`** for JS games only. Sports/casino settlement deliberately moves just one of them because of their exposure model. See [`project_jsgames_wallet.md`](../../../../root/.claude/projects/-var-www-main-CFZ-d99/memory/project_jsgames_wallet.md) for the design rationale.
- **Credits ledger is upserted (v2), not inserted** — see section 12 below.

### Concurrency Safety
The wallet is locked with `SELECT ... FOR UPDATE` inside a Sequelize transaction. This prevents race conditions when multiple bet callbacks arrive simultaneously for the same user.

---

## 12. Credits Ledger

The `credits_ledger` table records financial events for reporting and audit. Same table is shared by sports, in-house casino, and JS games — `category` discriminates the source.

### v2 writes: one row per session, upserted

The v2 controller (`jsgamesv2/gameController.js:215-267`) does **not** append a new row per callback. Instead it:

1. Computes `sessionPnL = newBalance − game_sessions.entry_balance` (wallet delta for the whole session so far).
2. Looks up the existing ledger row with key `{user_id, eventid: "session-{session.id}", category: "THIRD_PARTY_CASINO"}`.
3. If found → `UPDATE` the row (`amount`, `profit`/`loss`, `netamount`, `closing`, `balance`, `description`, `reason`).
4. If not found → `INSERT` the row.

Effect: no matter how many callbacks a session has, **there is exactly one ledger row per `game_sessions.id`**, and it always holds the running session P&L.

### v1 writes: one row per callback

The legacy v1 controller (`jsgames/controller.js:174-200`) creates a new ledger row for **every** settled callback (`win`, `loss`, `bet_result`). `eventid = game_round`, `match_id = serial_number`.

Both v1 and v2 rows use the same `category = 'THIRD_PARTY_CASINO'` and are consumed identically by reports.

### When a ledger row is created/updated

- `win` — Player won, money credited
- `loss` — Round ended with a loss (bet was already deducted)
- `bet_result` — Bet + win in single callback

### When the ledger is NOT touched

- `bet` — Just a bet placement (deduction only, no settlement yet). *Edit: v2 upserts on every callback because session P&L always changes. Only v1 skips `bet`.*
- `adjustment`, `negative_bet`, etc. — Edge cases, no settlement

### Ledger row shape (v2)

```json
{
  "user_id": "42",
  "currency": "INR",
  "amount": 47.20,                             // Session P&L (signed)
  "reason": "session_profit",                  // or "session_loss"
  "description": "spribe / Aviator",           // "{provider} / {game_name}"
  "profit": 47.20,                             // if sessionPnL > 0, else null
  "loss": null,                                // if sessionPnL < 0: Math.abs(sessionPnL) — POSITIVE
  "netamount": 47.20,                          // same as amount
  "closing": 2212.37,                          // wallet cash after this callback
  "balance": 2212.37,                          // duplicate of closing
  "eventid": "session-25",                     // UPSERT KEY
  "match_id": null,
  "meta": {
    "game_uid": "a04d1f3eb8ccec8a4823bdf18e3f0e84",
    "game_name": "Aviator",
    "provider": "spribe",
    "session_id": 25,
    "entry_balance": 2165.17
  },
  "sport_id": "spribe",
  "market_type": "THIRD_PARTY_CASINO",
  "category": "THIRD_PARTY_CASINO"
}
```

### Loss sign convention — IMPORTANT

| Category | `loss` column stored as | Example |
|----------|-----------------------|---------|
| `SPORTS` | **Negative** (e.g. `-100.00`) | Settlement writes `loss: -netLoss` |
| `CASINO` | **Negative** (e.g. `-50.00`) | Settlement writes `loss: -netLoss` |
| `THIRD_PARTY_CASINO` | **Positive** (e.g. `12.80`) | v2/v1 both write `loss: Math.abs(pnL)` |

This divergence breaks any naïve `SUM(profit) + SUM(loss)` aggregation that assumed a consistent sign. The admin **User Win/Loss** report was affected; the fix (2026-04-24) normalizes with `SUM(profit) − |SUM(loss)|`. See [`REPORTS.md`](./REPORTS.md#user-win-loss-report) for details.

### Categories in credits_ledger

| Category (exact string) | Source |
|-------------------------|--------|
| `SPORTS` | Sports betting settlement |
| `CASINO` | Table casino games (internal) |
| `THIRD_PARTY_CASINO` | Third-party games (jsgames/jsgamesv2) — **note: underscores, not hyphens** |
| `ADJUSTMENT` | Manual admin adjustments |

---

## 13. Rakeback System

Rakeback gives users a small cashback (0.2%) on every bet placed.

### How It Works
```
On every "bet" or "bet_result" callback:

If currency is INR:
  rate = ExchangeRate.findOne({ where: { currency: 'INR' } })
  rakebackAmount = betAmount * rate.usd_rate * 0.002

If currency is anything else:
  rakebackAmount = betAmount * 0.002

Then:
  User.increment('rakeamount', { by: rakebackAmount, where: { user_id } })
```

### Example
```
User bets 1000 INR
INR rate: 0.01190 USD
Rakeback: 1000 * 0.01190 * 0.002 = 0.0238 USD
Added to users.rakeamount
```

Rakeback is fire-and-forget — if it fails, the bet still processes normally.

---

## 14. Frontend Integration

### API Services (`d99-frontend/src/apiservices/livecasinoApi.js`)
```javascript
// Game listing — uses V1 (returns payload format)
const BASE_URL = `${REACT_APP_API_URL}/jsGames/`;

// Game launching — uses V2 (returns data format)
const LAUNCH_URL = `${REACT_APP_API_URL}/jsGamesv2/`;
```

### Response Format Differences

**Game listing (V1):**
```json
{ "success": true, "code": 0, "payload": { "games": [...], "pagination": {...} } }
```
Frontend reads: `data?.payload?.games`

**Game launch (V2):**
```json
{ "success": true, "data": { "game_launch_url": "https://...", "session_token": "..." } }
```
Frontend reads: `data?.data?.game_launch_url`

### Components
- `liveCasinoSection/index.js` — Game grid with pagination, launches games via route navigation
- `launchedLiveSection/index.js` — Iframe container, loads game URL
- Both handle launch response as `res.data?.game_launch_url`

---

## 15. Configuration

### d99-server Environment (`.env`)
```
PORT=9971
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=reddyanna
DB_USER=reddyanna
DB_PASSWORD=reddyanna
PROJECT_BASE_URL=https://api.reddyannaexch.cloud
```

### jsgamesv2 Config (`jsgamesv2/config.js`)
```javascript
{
  gameApi: {
    baseUrl: 'http://localhost:3031/api/game/',   // game-integration-system-dev
    apiKey: '0a21b23471ada537b04ae266599a886a',
    apiSecret: '755da31a15c9219bee3384fb0388257ededaab1ac222e4ef71290c9ffacd19fd',
  }
}
```

### V1 Agency Config (hardcoded in `jsgames/controller.js`)
```javascript
{
  agency_uid: 'b96581ad0785ff9f86c960def63aee4b',
  aes_key: '8ce9295ab6786ef6e4bd8d07eda4ce81',
  player_prefix: 'h24e9e',
  server_url: 'https://huidu.bet'
}
```

### Route Mounting (`server.js`)
```javascript
app.use('/api/jsGames', jsGamesRoutes);    // V1 — lines 194-195
app.use('/api/jsGamesv2', jsGamesv2);      // V2
```

---

## 16. Common Issues & Debugging

### "Server error" on game launch
```bash
pm2 logs Reddyanna-server --lines 30 | grep -i "launch\|error"
```
**Common causes:**
- game-integration-system not running on port 3031 → `ss -tlnp | grep 3031`
- Wrong API key in config.js → check `clients` table in MySQL
- User not found → check `users` table in PostgreSQL

### Balance goes to 0
- game-integration-system callback_url is wrong → check `clients` table:
  ```sql
  mysql> SELECT callback_url FROM clients WHERE id = 46;
  ```
  Must be: `https://api.reddyannaexch.cloud/api/jsGamesv2/v2/bet-callback`

### Games not showing on frontend
- V1 game list returns `payload.games` — frontend must read `data?.payload?.games`
- Check `js_games` table has data: `SELECT count(*) FROM js_games;`
- Check cache: restart server to clear NodeCache

### Vendor not enabled
```sql
-- Check enabled vendors for reddyanna (client_id=46)
mysql> SELECT * FROM client_vendor_settings WHERE client_id = 46;

-- Enable a vendor
mysql> INSERT INTO client_vendor_settings (client_id, vendor, is_active)
       VALUES (46, 'crash', 1);
```

### Credits ledger not updating
- Only updates on `win`, `loss`, or `bet_result` — NOT on `bet` (placement)
- Check logs: `pm2 logs Reddyanna-server | grep "ledger"`

### PM2 Commands
```bash
pm2 status                                    # All processes
pm2 logs Reddyanna-server --lines 50          # Server logs
pm2 logs game-integration-dev --lines 50      # Middleware logs
pm2 restart Reddyanna-server                  # Restart server
pm2 restart game-integration-dev              # Restart middleware
```

### Database Quick Checks
```bash
# PostgreSQL (diamond) — the only DB this codebase reads/writes for JS games
PGPASSWORD=diamond psql -U diamond -d diamond -h 127.0.0.1

SELECT count(*) FROM js_games;                                          -- Game catalog size
SELECT * FROM js_game_transactions ORDER BY id DESC LIMIT 5;            -- Raw callback audit
SELECT * FROM credits_ledger WHERE category = 'THIRD_PARTY_CASINO'      -- Note: UNDERSCORES
        ORDER BY id DESC LIMIT 5;
SELECT cash, inr_balance FROM "Wallets" WHERE user_id = 14;             -- User balance
SELECT id, game_uid, entry_balance, exit_balance, created_at            -- Sessions + P&L
   FROM game_sessions WHERE user_id = 14 ORDER BY id DESC LIMIT 5;
```

> The middleware's MySQL DB is out-of-scope for this codebase — we never query it. The entire JS games pipeline on our side is PostgreSQL-only.
