# Sports Place Bet — Frontend Payload Documentation

## Overview

Jab user kisi bhi odds cell pe click karta hai, frontend ek `betValue` object banata hai API response data se, aur fir `prepareRealBetPayload()` use final API payload mein convert karta hai jo `POST /api/user/place` pe bhejta hai.

---

## Flow (Step by Step)

```
API Response (sportData)
    ↓
User clicks odds cell (Back/Lay/Yes/No)
    ↓
buildBetData() / handleBetClick() → betValue object banata hai
    ↓
SportsPlaceBet component open hota hai (betValue as prop)
    ↓
User stake enter karta hai → "Place Bet" click
    ↓
prepareRealBetPayload(betValue, odds, stake, user, ...) → final API payload
    ↓
sportsPlaceBet(payload) → POST /api/user/place
```

---

## API Response Structure (sportData)

Backend se jo data aata hai (`/api/user/cricket/get-sport-data-by-id`), uska structure:

```json
{
  "data": [
    {
      "mid": "1.234567890",        // Market ID
      "mname": "Match Odds",       // Market Name
      "gtype": "match",            // Game type from API
      "min": 100,                  // Min stake
      "max": 100000,               // Max stake
      "maxb": 50000,               // Max bet (priority over max)
      "section": [                 // Runners/Selections
        {
          "sid": "12345",          // Selection ID
          "nat": "India",          // Selection/Team Name
          "mid": "1.234567890",    // Market ID (same as parent)
          "status": "",            // SUSPENDED / BALL RUNNING / empty
          "gstatus": "",
          "min": 100,
          "max": 50000,
          "odds": [                // Odds array
            {
              "oname": "back1",    // Odds type name
              "otype": "BACK",
              "odds": 1.85,        // Actual odds value
              "size": 50000        // Available volume
            },
            {
              "oname": "lay1",
              "otype": "LAY",
              "odds": 1.87,
              "size": 30000
            }
          ]
        },
        {
          "sid": "67890",
          "nat": "Australia",
          "odds": [
            { "oname": "back1", "odds": 2.10, "size": 40000 },
            { "oname": "lay1", "odds": 2.14, "size": 25000 }
          ]
        }
      ]
    }
  ]
}
```

Match level data (`data` from location state):
```json
{
  "gmid": "31234567",             // Global Match ID (event_id)
  "ename": "India v Australia",   // Event Name
  "stime": "2026-04-08 14:00:00"  // Match Start Time
}
```

---

## betValue Object (Click se banta hai)

Jab user kisi cell pe click karta hai, `buildBetData()` ya `handleBetClick()` yeh object banata hai:

| Field | Source | Example |
|-------|--------|---------|
| `event_id` | `data.gmid` (match ka global ID) | `"31234567"` |
| `event_name` | `data.ename` | `"India v Australia"` |
| `match_id` | `market.mid` (market level ID) | `"1.234567890"` |
| `market_id` | `market.mid` (same as match_id) | `"1.234567890"` |
| `market_name` | `market.mname` | `"Match Odds"` |
| `market_type` | `market.mname` (same as market_name) | `"Match Odds"` |
| `sid` | Route/prop se aata hai (sport ID) | `"4"` (Cricket) |
| `odds` | Clicked cell ka odds value | `1.85` |
| `betType` | `"back"` or `"lay"` (cell type se) | `"back"` |
| `team` | `section.nat` (clicked runner name) | `"India"` |
| `match_start_time` | `data.stime` | `"2026-04-08 14:00:00"` |
| `match_title` | `data.ename` | `"India v Australia"` |
| `team_one` | `ename.split(' v ')[0]` | `"India"` |
| `team_two` | `ename.split(' v ')[1]` | `"Australia"` |
| `sports` | Hardcoded | `"Cricket"` |
| `fancy_name` | FANCY: `section.nat`, else `""` | `"6 Over Runs"` |
| `game_type` | mname se derive: MATCH/BOOKMAKER/FANCY | `"MATCH"` |
| `mname` | `market.mname` (raw market name) | `"Match Odds"` |
| `gtype` | `market.gtype` (API se) | `"match"` |
| `runners` | `market.section.map(s => s.nat)` | `["India", "Australia", "The Draw"]` |
| `runner_odds` | Clicked section ke `odds` array | `[{oname:"back1", odds:1.85, size:50000}, ...]` |
| `back_size` | Back odds ka size | `50000` |
| `lay_size` | Lay odds ka size | `30000` |
| `size` | betType=back ? back_size : lay_size | `50000` |
| `count` | `runners.length` | `3` |
| `nat` | `section.nat` (selected runner) | `"India"` |
| `section` | Full `market.section` array (all runners) | `[{sid, nat, odds: [...]}, ...]` |
| `min_stake` | `market.min` | `100` |
| `max_stake` | `market.maxb || market.max` | `50000` |
| `maxb` | `market.maxb` | `50000` |
| `selectionId` | `section.sid` | `"12345"` |
| `outcomes` | Market runners list (for MATCH_ODDS/BOOKMAKER P&L calc) | `["India","Australia","The Draw"]` |
| `is_cashout` | `true` when slip is opened by cashout flow (auto-submit) | `false` |

> **Note**: `selectionId` aur `sid` alag hain —
> - `selectionId` = selected runner ka `section.sid` (clicked row).
> - `sid` = sport ID (route/prop se, e.g. `"4"` = Cricket).
> `handleBetClick` (`cricketDetails/index.js:678`) me dono set karta hai:
> `selectionId: betContext.selectionId || betContext.sid || section?.sid` aur `sid: String(sid || '')`.

---

## game_type Derivation Logic

```javascript
const marketNameLow = market.mname.toLowerCase();

if (marketNameLow.includes('match') && marketNameLow.includes('odds')) {
  gameType = 'MATCH';
} else if (marketNameLow.includes('bookmaker')) {
  gameType = 'BOOKMAKER';
} else {
  gameType = 'FANCY';  // Default for all other markets
}
```

---

## Final API Payload (`prepareRealBetPayload`)

`realUserUtils.js` mein `betValue` + user input (stake, odds) se final payload banta hai:

```javascript
// POST /api/user/place
{
  // --- Event/Match Info (betValue se) ---
  sports: "Cricket",                        // betValue.sports
  event_name: "India v Australia",          // betValue.event_name
  eventid: "31234567",                      // String(betValue.event_id)
  event_id: "31234567",                     // betValue.event_id
  match_id: "1.234567890",                  // String(betValue.match_id) — MARKET ID hai yeh
  market_id: "1.234567890",                 // betValue.market_id
  match_title: "India v Australia",         // betValue.match_title
  match_start_time: "2026-04-08 14:00:00",  // betValue.match_start_time
  team_one: "India",                        // betValue.team_one
  team_two: "Australia",                    // betValue.team_two
  sid: "4",                                 // betValue.sid (sport id)

  // --- Market Info ---
  market_name: "Match Odds",               // betValue.market_name
  market_type: "Match Odds",               // betValue.market_type
  game_type: "MATCH",                       // String(betValue.game_type)
  mname: "Match Odds",                      // betValue.mname
  gtype: "match",                           // betValue.gtype (API market gtype)
  category: "0",                            // "1" if FANCY, else "0"

  // --- Bet Details (user input + click data) ---
  bet_type: "back",                         // effective bet type
  odds: 1.85,                               // Number(oddsValue) — user final odds
  user_rate: 1.85,                          // same as odds
  stake_amount: 5000,                       // Number(stakeValue)
  amount: 5000,                             // same as stake_amount
  original_amount: 5000,                    // same
  original_currency: "INR",
  usd_amount: 59.00,                        // stake * 0.0118

  // --- Selection Info ---
  selection_name: "India",                  // FANCY: fancy_name, else: team name
  fancy_name: "",                           // FANCY market: runner name, else ""
  nation: "India",                          // betValue.team
  nat: "India",                             // betValue.nat

  // --- Runner/Section Data (API response se) ---
  runners: ["India", "Australia", "The Draw"],  // betValue.runners
  runner_odds: [{oname:"back1", odds:1.85}],    // betValue.runner_odds
  section: [{sid, nat, odds:[...]}],            // Full market section array
  count: 3,                                     // runners count
  back_size: 50000,                             // betValue.back_size
  lay_size: 30000,                              // betValue.lay_size
  size: 50000,                                  // betValue.size

  // --- User Info ---
  user_id: "42",                            // String(user.user_id)
  place_date: "2026-04-08 14:30:00",        // new Date() formatted

  // --- Other ---
  fixed: 0,
  settlened: "pending",
  unmatched: false,
}
```

---

## Kaunsa Field Kahan Se Aata Hai (Summary Table)

| API Payload Field | Kahan se aata hai |
|---|---|
| `sports` | Hardcoded `"Cricket"` |
| `event_name` | `data.ename` (match data) |
| `eventid` / `event_id` | `data.gmid` (match global ID) |
| `match_id` / `market_id` | `market.mid` (market level ID — **NOT gmid**) |
| `match_title` | `data.ename` |
| `match_start_time` | `data.stime` |
| `team_one` | `ename.split(' v ')[0]` |
| `team_two` | `ename.split(' v ')[1]` |
| `sid` | Sport ID from route/prop (`4` = Cricket) |
| `market_name` / `market_type` | `market.mname` |
| `game_type` | Derived from `mname` → MATCH / BOOKMAKER / FANCY |
| `mname` | `market.mname` (raw) |
| `gtype` | `market.gtype` (from API response) |
| `category` | `"1"` if FANCY, `"0"` otherwise |
| `bet_type` | User click: `"back"` / `"lay"` / `"yes"` / `"no"` |
| `odds` / `user_rate` | Clicked cell ka `odds` value (user edit bhi kar sakta hai) |
| `stake_amount` / `amount` | User input stake |
| `selection_name` | FANCY: `fancy_name`, Others: clicked `section.nat` |
| `fancy_name` | FANCY: `section.nat`, Others: `""` |
| `nation` / `nat` | `betValue.team` / `section.nat` |
| `runners` | `market.section.map(s => s.nat)` |
| `runner_odds` | Clicked section ka `odds[]` array |
| `section` | Full `market.section[]` from sportData |
| `count` | `runners.length` |
| `back_size` | `section.odds` mein `back1` ka `size` |
| `lay_size` | `section.odds` mein `lay1` ka `size` |
| `size` | back click → `back_size`, lay click → `lay_size` |
| `user_id` | Redux `user.user_id` |
| `place_date` | `new Date()` formatted |
| `unmatched` | `betValue.unmatched` (default `false`) |

---

## TIED_MATCH Special Case

Tied Match market mein `team_one` aur `team_two` runners se aate hain (na ki ename se):

```javascript
team_one: String((betValue.runners || [])[0] || 'Yes')
team_two: String((betValue.runners || [])[1] || 'No')
```

---

## Constants Inside `prepareRealBetPayload`

`realUserUtils.js` me kuch fields hardcoded hain (backend expect karta hai ye fixed values):

| Field | Value | Reason |
|---|---|---|
| `original_currency` | `"INR"` | Base currency — user ka stake INR me |
| `usd_amount` | `stake * 0.0118` | Hardcoded conversion rate (constant `conversionRate = 0.0118`) |
| `fixed` | `0` | Backend flag — always 0 on client side |
| `settlened` | `"pending"` | Initial settlement status (backend flip karega on result) |
| `place_date` | `new Date().toISOString().slice(0, 19).replace('T', ' ')` | UTC `YYYY-MM-DD HH:mm:ss` format |

### `selection_name` Fallback (FANCY only)

```javascript
market_type.includes('fancy')
  ? fancy_name (if present && !== 'Unknown')
    || effectiveTeam (if !== 'Unknown')
    || (betType === 'yes' ? 'YES' : 'NO')
  : effectiveTeam
```

Taaki fancy bet kabhi empty `selection_name` ke saath na jaaye.

### `section` Coercion

```javascript
Array.isArray(section)  → use as-is
typeof section === 'string' → JSON.parse; if array → use; else []
else → []
```

Backend ko hamesha array milta hai (kabhi stringified JSON nahi).

### `count` Default

```javascript
count: betValue.count || betValue.outcomes?.length || 2
```

---

## Pre-Submit Validation & Guards (`handleSubmit`)

`SportsPlaceBet.js` payload bhejne se pehle ye checks run karta hai — koi bhi fail → abort with toast.

### 1. Min/Max Stake
`stakeNum` `[effectiveMinStake, effectiveMaxStake]` ke beech hona chahiye.
- `effectiveMinStake = betValue.min_stake ?? minStake prop`
- `effectiveMaxStake = betValue.maxb (> 0) ?? betValue.max_stake ?? maxStake prop`

### 2. Odds Range
`1.01 ≤ odds ≤ 1000` (validation memo me).

### 3. User-Modified Odds Guard
Agar user ne odds manually edit kiya (`isUserModifiedOdds = true`):
- `back` / `yes` → new odds `originalOdds` se bada **nahi** ho sakta.
- `lay` / `no`  → new odds `originalOdds` se chhota **nahi** ho sakta.

Violation → `"Bet not allowed."`

### 4. `isOddsLocked` Markets

In markets me odds editable nahi (input readonly, +/- buttons disabled):

```
normal, over by over, fancy1, khado, meter, oddeven
```

Detection: `betValue.mname` / `market_name` / `marketType` me se kisi bhi me ye name ho.

### 5. Strict Live-Odds Match (Critical)

Submit time pe slip odds aur live feed odds compare karte hain. Mismatch `> 0.01` → reject with `"Odds changed"`.

**Lookup strategy** (from `latestSportDataRef.current`):

| Market kind | Key to find runner |
|---|---|
| MATCH_ODDS / BOOKMAKER / BOOKMAKER2 / TIED_MATCH | `(market_id, sid)` |
| FANCY / `isOddsLocked` / fancy-like | `(market_id, section.nat)` — `sid` fancy me unreliable hota hai; fallback: single-section market |

Back side → `back1` / `back` odds. Lay side → `lay1` / `lay` odds. Dashed (`"--"` / `"-"` / empty) → skip check.

### 6. Demo User Short-Circuit

`isDemoUser(user) === true` → API call skip, locally `handleDemoBetSubmission` call karta hai matched bet + exposure update ke liye.

### 7. Buffer Loop (Real User Only)

`buffer_time` config se seconds nikalta hai (default `3`). Har `500ms` pe live odds re-read karke:

- **Favourable change**: back ke liye higher, lay ke liye lower → `latestOddsValue` auto-accept, `oddsValue` update ho jaata hai.
- **Unfavourable change**: reverse → `hasUnfavorableChange = true` → post-buffer reject (`"Bet not allowed."`).
- **Suspension / dashed odds**: `sectionFound.gstatus === 'SUSPENDED'` ya odds unavailable → `hasSuspension = true` → reject (`"Market is suspended or unavailable."`).

**Buffer skip hota hai** jab:
- `is_cashout === true` (cashout auto-bet)
- `isOddsLocked` market
- `isFancyStyleMarket` (game_type FANCY ya known fancy mnames: `fancy`, `session`, `sessions`, `over by over`, `khado`, `meter`, `oddeven`, `wicket`, `fancy1`, `normal`)
- `market_id` ya `selectionId` missing

### 8. Final Odds = `latestOddsValue`

Buffer me jo final odds decide hua wahi payload me `odds` / `user_rate` ke form me jaata hai — original clicked odds nahi.

---

## Cashout Auto-Bet

Jab parent `SportsPlaceBet` ko `autoBet={true}` + `betValue.is_cashout === true` ke saath mount karta hai:

- `useEffect` (`SportsPlaceBet.js:499-509`) stake & odds populate hote hi `handleSubmit()` fire karta hai.
- `effectiveBuffer = 0` → buffer loop skip.
- Strict live-odds match phir bhi apply hota hai.
- `autoBetTriggered` ref dubara fire hone se rokta hai.

---

## Response Handling (`handleRealBetSubmission`)

`POST /api/user/place` success (`apiResult.success === true`) pe:

1. `dispatch(addMatchedBet(betData))` — local matched bets list me add.
2. `apiResult.exposure` present → `updateMatchExposure` + `patchMatchExposure(matchId, teams)`.
3. `apiResult.newBalance` / `totalExposure` → `updateUserBalanceAndExposure`.
4. `apiResult.balanceDelta` → `patchBalance`.
5. Toast: `"Bet placed successfully!"` → `onBetSubmit(betData)` → 2s baad `handleClose()`.

### Error Mapping

| Backend / network error | Toast shown |
|---|---|
| Message contains `fetch` | `"Network error – please check your connection"` |
| Message contains `invalid stake` (stale-odds signal from backend) | `"Odds changed"` |
| Anything else | Raw backend message |

---

## End-to-End Order of Operations

```
User clicks cell
    ↓
handleBetClick builds betValue (market+section ke context ke saath)
    ↓
SportsPlaceBet opens; stake/odds input
    ↓
handleSubmit:
    min/max check → validation → user-modified guard
    → strict live-odds check (0.01 tolerance)
    → demo? local submit : continue
    → buffer loop (accept better / reject worse / reject suspension)
    → prepareBetData(latestOddsValue)    [local matched bet]
    → prepareRealBetPayload(...)          [API body]
    → sportsPlaceBet(payload) → POST /user/place
    ↓
handleRealBetSubmission:
    addMatchedBet + exposure/balance updates
    success toast → onBetSubmit → close
```

---

## Key Points

1. **`match_id` ≠ `gmid`**: `match_id` field mein market ka `mid` jaata hai, match ka `gmid` nahi. `gmid` → `event_id` / `eventid` mein jaata hai.

2. **`section` array**: Puri market ki section array bhejte hain (sabhi runners ke saath), na ki sirf clicked runner.

3. **`game_type` derive hota hai** market name se — backend mein stored game_type match karana zaroori hai.

4. **Odds user edit kar sakta hai**: SportsPlaceBet mein user odds change kar sakta hai, toh final payload mein edited odds jaata hai.

5. **Stake limits**: `min_stake`, `max_stake`, `maxb` market level se aate hain — frontend validate karta hai place karne se pehle.

6. **`category`**: `"1"` = FANCY, `"0"` = others (MATCH_ODDS, BOOKMAKER, etc.)
