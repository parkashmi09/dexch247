# Core Business Logic

## Sports Betting

The platform integrates with external sports data providers to offer betting on various sports (Cricket, Soccer, Tennis, etc.).

### Routes & Controllers
**File:** `routes/user/gamesRoutes.js`
**Controller:** `controller/sports/cricket/cricketController.js`

| Method | Route | Controller Function | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/cricket/all-data` | `fetchCricketData` | Fetches all matches/events for a specific sport ID. |
| `GET` | `/cricket/get-all-sports-data` | `GetallSportsdata` | Fetches list of all available sports. |
| `POST` | `/cricket/get-sport-data-by-id` | `getSportdetailsById` | Fetches specific match details (odds, runners). |
| `POST` | `/cricket/score-card` | `fetchScoreCard` | Fetches live score for a match. |
| `POST` | `/cricket/gameresults` | `GetResults` | Fetches results for settled markets. |
| `GET` | `/cricket/sports-bets/user` | `getSportsBetsByUserId` | Fetches betting history for the logged-in user. |
| `GET` | `/cricket/matched-bets/user/event` | `getUserMatchedBetsByEvent` | Fetches matched bets for a user on a specific event. |
| `GET` | `/cricket/open-bets/user/event` | `getUserOpenBetsByEvent` | Fetches open (unsettled) bets for a user on a specific event. |

### Controller Functions
**File:** `controller/sports/cricket/cricketController.js`

- **`fetchCricketData(req, res)`**:
  - Calls `CricketService.fetchCricketData(id)` to get events from external API.

- **`getSportdetailsById(req, res)`**:
  - Calls `CricketService.getSportDataById(gmid, sid)` to get market odds.

- **`fetchScoreCard(req, res)`**:
  - First fetches match details to get `gtv` (tracker ID).
  - Then calls `CricketService.fetchScoreCard(gtv, sid)`.

- **`GetResults(req, res)`**:
  - Calls `CricketService.GetResult` to get market results.

- **`getSportsBetsByUserId(req, res)`**:
  - Fetches `SportsBet` records for the user.

- **`getUserMatchedBetsByEvent(req, res)`**:
  - Fetches `SportsBet` records where `result_status` is NOT pending (or based on status).

- **`getUserOpenBetsByEvent(req, res)`**:
  - Fetches `SportsBet` records where `result_status` IS 'pending'.

## Settlement & Financials

### Real-time Wallet Updates
- When a bet is placed, the stake is deducted (or exposure blocked).
- When a bet is settled (Won/Lost), the wallet is updated immediately.
- The `Wallet` model's `profit_loss` field is automatically updated via Sequelize hooks to reflect the current financial standing (`inr_balance - credit`).

### Daily Profit/Loss Snapshot
- **File:** `jobs/dailyProfitLossJob.js`
- **Schedule:** Runs daily at 3:20 PM.
- **Purpose:** Creates a historical record of every user's Profit/Loss for that day.
- **Process:**
    1.  Iterates through all `Wallet` records.
    2.  Reads the current `profit_loss`.
    3.  Upserts a record into the `DailyProfitLoss` table for the previous day.
    4.  This data is used for generating historical P/L reports.

## Casino Integration
- **Routes:** `jsgames/` and `jsgamesv2/`.
- **Logic:** Handles game sessions, bet placement, and result processing for casino games.
