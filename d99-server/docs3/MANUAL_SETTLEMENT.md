# Manual Settlement — Concept & Implementation

## Overview

Manual settlement ka matlab: **jab upstream results feed (AVRKHUB) se result nahi aata — ya admin use override karna chahta hai — admin panel se seedha winner declare karte hain ya market void karte hain.**

Ye path **automatic settlement** se alag hai (jo `newjobv2.js` cron se AVRKHUB `get_result` API fetch karta hai), par same settlement worker hi final payout karta hai. Admin sirf **intent record** karta hai (winner ya void); actual wallet / exposure update settlement daemon karta hai.

Two admin actions hote hain:

1. **Declare Result** — admin winner input karta hai → bets `status='manual'` ho jaati hain → settlement worker `mannual_result` table se result padhke payout karta hai.
2. **Void (Refund)** — admin market void karta hai → admin controller hi inline refund karta hai (worker involve nahi) → bets `status='closed'`, `result_status='refunded'`.

---

## Architecture

```
                   ┌─────────────────────────────┐
                   │   Admin UI (d99-admin)      │
                   │  match-settlement.jsx       │
                   │  fancy-settlement.jsx       │
                   └──────────────┬──────────────┘
                                  │
                 ┌────────────────┼─────────────────┐
                 │                │                 │
          "Declare"          (polling list)        "Void"
                 │                │                 │
                 ▼                ▼                 ▼
       POST /declareresult   GET /momatches    POST /void
       POST /declareresult   GET /fanmatches
                 │                                  │
                 ▼                                  ▼
       ┌────────────────────────────────────────────────┐
       │   d99-server/mannualSettle/controller.js       │
       │  • declareResult  → INSERT MannualResult       │
       │                   → UPDATE SportsBet           │
       │                     status: open → manual      │
       │  • voidResult     → Refund + cleanup inline    │
       │                     (no worker involved)       │
       └────────────────────────────────────────────────┘
                 │
                 ▼ (bets now status='manual')
       ┌────────────────────────────────────────────────┐
       │   Settlement Worker (settlementv2.js /         │
       │                      settlementnew.js)         │
       │   Picks queued jobs → sees bet.status==='manual'│
       │   → fetchManualResult() (MannualResult table)  │
       │     instead of AVRKHUB fetchResultForEvent()   │
       │   → resolveMobmWinner / resolveFancyWinner     │
       │   → wallet credit + ledger + exposure clear    │
       │   → bet status: manual → closed                │
       └────────────────────────────────────────────────┘
```

---

## Files At A Glance

| Layer | File |
|---|---|
| Admin UI — MO/BM | `d99-admin/src/pages/settlement/match-settlement.jsx` |
| Admin UI — FAN | `d99-admin/src/pages/settlement/fancy-settlement.jsx` |
| Admin modals | `d99-admin/src/components/SettlementModal.jsx`, `FancySettlementModal.jsx` |
| Routes | `d99-server/mannualSettle/routes.js` |
| Controller | `d99-server/mannualSettle/controller.js` |
| Manual result model | `d99-server/model/admin/manualresult.js` |
| Worker (v2 / AVRKHUB) | `d99-server/sportsbet/betresult/settlementv2.js` |
| Worker (v1 / Diamond) | `d99-server/sportsbet/betresult/settlementnew.js` |
| Jobs cron | `d99-server/sportsbet/betresult/newjobv2.js` |
| Custom H2H resolver | `d99-server/sportsbet/betresult/customMarketResolvers.js` |
| API Docs | `d99-server/mannualSettle/API_DOCS.md` |

Active worker is selected via env `SETTLEMENT_VERSION` (see `d99-server/docs/SETTLEMENT_API_V2.md`). Manual settlement path (branching on `status === 'manual'`) exists in **both** v1 and v2.

---

## Routes (`mannualSettle/routes.js`)

Base mount: `/api/internalsettle` — all protected with `authMiddleware`.

```js
router.get('/momatches',     authMiddleware, controller.getMoMatches);
router.get('/fanmatches',    authMiddleware, controller.getFanOpenBets);
router.post('/declareresult',authMiddleware, controller.declareResult);
router.post('/void',         authMiddleware, controller.voidResult);
```

---

## 1. Listing Open Markets For Admin

### `GET /momatches` (`controller.js:19-66`)

MO/BM markets ka aggregated list jo abhi open hain.

- **Filter**: `game_type IN ('MO','BM')`, `status='open'`, `match_id` & `eventid` non-null.
- **Group by**: `(match_id, eventid, game_type, market_type)`.
- **Returns**: `{ matchId, eventId, gameType, marketType, matchTitle, teamOne, teamTwo, totalBets, counts }[]`.
- Admin UI har 2 seconds pe poll karta hai (match-settlement.jsx:39).

### `GET /fanmatches` (`controller.js:69-247`)

FAN markets ko market_type ke hisaab se bucketize karke bhejta hai.

- **Filter**: `game_type='FAN'`, `status='open'`.
- **Group by**: `(match_id, eventid, market_type, selection_name, game_type)`.
- **Predefined buckets** (23 markets) ka apna key:
  - `1st/2nd/3rd Innings {6,10,20,30,40,50} Overs Line`
  - `Over By Over`, `Ball By Ball`, `Normal`, `khado`, `meter`, `fancy1`, `oddeven`
- Jo predefined list me nahi wo `others` bucket me.
- Har bucket me full bet objects (odds, stake, liability, etc.) taaki modal me dikhaye.

---

## 2. Declare Result — `POST /declareresult`

### Request Body

Mandatory for all:

```json
{
  "eventid": "31234567",
  "match_id": "1.234567890",
  "match_title": "India v Australia",
  "game_type": "MO" | "BM" | "FAN",
  "market_type": "MATCH_ODDS" | "BookMaker" | "Normal" | "fancy1" | ...
}
```

Plus, **game_type-wise** requirements (`controller.js:263-318`):

| `game_type` | `market_type` | Required extra fields |
|---|---|---|
| `MO` | any | `winnerName` (e.g. `"India"`, `"The Draw"`) |
| `BM` | any | `winnerName` |
| `FAN` | in predefined list → `fancy1` / `oddeven` | `winnerName` + `fancyName` |
| `FAN` | in predefined list → others (Normal, Over By Over, Ball By Ball, Line markets, khado, meter) | `winnerId` (numeric run/score) + `fancyName` |
| `FAN` | not in predefined list (custom "others") | `winnerName` |

> `fancyName` = selection_name of the fancy session (e.g. `"6 Overs"`, `"Khado 1st inn"`). Settlement worker ise use karta hai exact session match karne ke liye.

### What It Does (`controller.js:320-372`)

Single transaction me:

1. **Insert** into `mannual_result` table:
   ```
   { eventid, match_id, match_title, game_type, market_type,
     winnerName  (nullable),
     winnerId    (nullable),
     fancyName   (nullable) }
   ```

2. **Update SportsBet** from `status='open'` → `status='manual'`:
   ```sql
   UPDATE sports_bets
      SET status = 'manual'
    WHERE match_id    = :match_id
      AND market_type = :market_type
      AND game_type   = :game_type
      AND status      = 'open'
      -- Additional narrow for session-level fancy markets:
      AND (selection_name = :fancyName
           IF market_type IN ('fancy1','oddeven',
                              'Over By Over','Ball By Ball',
                              'khado','meter','Normal'))
   ```

3. Commit → response `{ success, message, data: { manualResult, updatedBets: <count> } }`.

> **Important**: `declareResult` sirf **intent** record karta hai. Na wallet touch hota hai, na exposure. Actual payout settlement daemon karta hai jab `status='manual'` bet pick hoti hai.

### Key Design Choices

- **Audit trail**: `mannual_result` row persist rehti hai even after settlement — admin ne kya declare kiya ye traceable.
- **Fancy session narrowing**: FAN markets me same `market_type` (e.g. `Normal`) ke multiple sessions hote hain (`fancyName` different). Isiliye update me `selection_name = fancyName` narrow hota hai, warna ek session declare karne se saare `Normal` bets lag jaati.
- **Idempotency by bet status**: agar `declareResult` dubara same market ke liye call hua, second call me zero bets update honge (sabhi already `manual`). Nayi `mannual_result` row zarur insert hogi — latest wali DESC order me settlement padhega (`fetchManualResult` me `order: [['created_at','DESC']]`).

---

## 3. Void Market — `POST /void`

### Request Body

```json
{
  "eventid":        "31234567",
  "match_id":       "1.234567890",
  "market_type":    "MATCH_ODDS",  // or fancy session market_type
  "gametype":       "MO",          // optional — narrow further
  "selection_name": "6 Overs"      // optional — for fancy session
}
```

### What It Does (`controller.js:374-507`)

Declare ke ulta, ye inline hi refund kar deta hai (settlement worker involve nahi). Single transaction:

1. **Find bets** (`status='open'`) matching `(match_id, market_type)` + optional `game_type` + optional `selection_name`. `user_id` unique list nikalta hai.

2. **Per-user refund loop**:
   ```js
   for (const uid of userIds) {
     const exposures = await UserExposure.findAll({
       where: { user_id: uid, match_id, game_type: market_type }
     });
     // most-negative exposure = max liability
     const minExp = Math.min(0, ...exposures.map(e => +e.exposure_amount));
     if (minExp < 0) {
       Wallet.increment('cash', { by: Math.abs(minExp), where: { user_id: uid } });
     }
     UserExposure.destroy({ where: { user_id: uid, match_id, game_type: market_type } });
   }
   ```

3. **Close bets**:
   ```sql
   UPDATE sports_bets
      SET status         = 'closed',
          result_status  = 'refunded',
          match_end_time = NOW()
    WHERE match_id    = :match_id
      AND market_type = :market_type
      AND status      = 'open'
      [AND game_type  = :gametype]
      [AND selection_name = :selection_name]
   ```

4. Commit → `{ success, message, count: <usersRefunded> }`.

### Void Refund Semantics

- Refund amount = `|min(exposure_amount)|` across the user's exposure rows for that `(match_id, market_type)`. Yehi user ka locked liability tha placement time pe — iska absolute value wapas milta hai.
- `UserExposure` rows **delete** ho jaati hain — future exposure calc me count nahi hogi.
- Positive exposure (profit-leaning side) ka alag se kuch refund nahi — wallet already untouched thi placement pe uss side ke liye (wallet model: cash liability-locked at placement, profit side ledger-invisible).

### Known Limits (Documented in code)

Controller me comment (`controller.js:417-440`) warn karta hai:
- `UserExposure` narrow-by-`selection_name` attempt nahi hoti (line team_name mapping reliable nahi). Agar single `market_type` ke multiple sessions chal rahe hain (e.g. do alag "Normal" sessions), to ek ko void karne se dono ke exposures delete ho sakte hain.
- Workaround: `selection_name` parameter pass karne se bet-side narrowing hoti hai (bets only `selection_name` wali close hongi), par exposure cleanup abhi bhi market-wide hoti hai.

Agar ye edge-case relevant ho, UserExposure schema me `fancy_name` / `selection_name` add karke filter tighten karna padega.

---

## 4. Settlement Worker — Manual Result Consumption

Declared `status='manual'` bets ka payout settlement worker karta hai. Relevant entry points:

### Branch at job processing (`settlementv2.js:1399` / `:1831`)

```js
// MO / BM group processing
if (any.status === 'manual') {
    result = await fetchManualResult(eventid, match_id, game_type, market_type);
} else {
    result = await fetchResultForEvent(eventid, eventName, marketId, marketName,
                                       sport_id, market_type, game_type,
                                       team_one, team_two);
}
```

```js
// FAN bet processing
if (status === 'manual') {
    result = await fetchManualResult(eventid, match_id, game_type,
                                     market_type, selection_name);
} else {
    result = await fetchResultForEventFancy(eventid, eventName, marketId,
                                            selection_name, sport_id, market_type);
}
```

Worker ka rest of pipeline same hai — manual vs upstream sirf **result ka source** badalta hai.

### `fetchManualResult` (`settlementv2.js:582-672`)

```js
const whereClause = {
    eventid:     String(eventid),
    match_id:    String(match_id),
    game_type:   String(game_type),
    market_type: String(market_type)
};

// FAN + predefined fancy list → narrow by fancyName = selection_name
if (game_type === 'FAN' && marketsforfancyCheck.includes(market_type) && selection_name) {
    whereClause.fancyName = selection_name;
}

const manualRes = await MannualResult.findOne({
    where: whereClause,
    order: [['created_at', 'DESC']]   // latest declaration wins
});

if (!manualRes) return { declared: false, items: [] };

return {
    declared: true,
    items: [{
        winnerName:   manualRes.winnerName,
        winnerId:     manualRes.winnerId,
        final_result: manualRes.winnerName   // MO/BM resolver uses this
    }],
    meta: { source: 'manual', manual_result_id: manualRes.id }
};
```

### End-to-End Payout Steps (after manual result fetched)

1. `resolveMobmWinner` / `resolveFancyWinner` → winner decide, per-bet `won`/`lost` flag.
2. `getMatchExposures(user_id, match_id, market_type)` → UserExposure snapshot.
3. Per bet:
   - Calculate **credit** (winnings OR exposure release for losing side) based on `bet_type` + `odds` + winner.
   - `Wallet.increment('cash', { by: credit })` + `CreditsLedger` entry (`reason='settlement'` ya `'exposure_release'`).
   - `SportsBet.update({ status: 'closed', result_status: 'won'|'lost'|'refund' })`.
   - MO/BM → `MarketWin` record; FAN → `FanWin` record (analytics).
4. `clearExposuresForMatch(user_id, match_id, market_type)` → DELETE UserExposure rows for the (user, match, market).
5. Job row → `status='done'`.

If the resolver returns `SUSPENDED` (or result says void), worker calls `initiateRefund(...)` per bet — same ledger-aware refund as automatic VOID path.

### Idempotency

- Worker pickup: `status IN ('open','manual')` only → already-closed bets skip.
- Latest `mannual_result` by `created_at DESC` — agar admin ne re-declare kiya, worker ko updated winner milega (as long as bets still `manual`).
- Once bet `status='closed'`, dobara process nahi hoti even if job requeue hota hai.

---

## 5. Result Input Formats (Summary)

| Admin Action | game_type | market_type | Required fields |
|---|---|---|---|
| Declare | `MO` / `BM` | any | `winnerName` |
| Declare | `FAN` | `fancy1`, `oddeven` | `winnerName` + `fancyName` |
| Declare | `FAN` | `Normal`, `Over By Over`, `Ball By Ball`, `khado`, `meter`, `Nth Innings Y Overs Line` | `winnerId` + `fancyName` |
| Declare | `FAN` | custom / others | `winnerName` |
| Void | any | any | `match_id`, `market_type` (+ optional `gametype`, `selection_name`) |

`winnerName` formats:
- MO/BM 2-way → exact team name (`"India"`, `"Australia"`) ya `"The Draw"` (3-way).
- fancy1/oddeven → `"Yes"` / `"No"` (resolver string match karega).
- Custom fancy → team name ya custom token — resolver `selection_name`/`bet_type` ke against match karega.

`winnerId` format (numeric) — actual run count / score / metric. Resolver ise odd logic me plug karta hai (e.g. session Normal me `winnerId` = runs scored, bet_type=yes → `won` if runs ≥ odds_line, else `lost`).

---

## 6. Database Footprint

### Tables Touched

| Table | On Declare | On Void | During Worker Payout |
|---|---|---|---|
| `mannual_result` | INSERT | — | — (read-only) |
| `sports_bets` | UPDATE status: open → manual | UPDATE status: open → closed, result_status=refunded | UPDATE status: manual → closed, result_status=won/lost/refund |
| `user_exposures` | — | DELETE (per user, per match+market_type) | DELETE (`clearExposuresForMatch`) |
| `wallet` | — | `cash += |minExposure|` | `cash += credit` (winners) / unchanged (losers; exposure already locked) |
| `credits_ledger` | — | — (void me ledger entry controller me create nahi hoti, only wallet increment) | INSERT settlement / exposure_release / refund entries |
| `market_wins` / `fan_wins` | — | — | INSERT (analytics) |
| `sports_event_settlement_jobs` | — (cron will queue) | — | UPDATE status=processing → done |

### Bet Status State Machine

```
   PLACED
     │
     ▼
   open ─────────(admin declare)────────▶ manual
     │                                       │
     │                                       │
     │◀─ (cron fetches upstream result) ◀────┘ (worker finds manual_result)
     │                                       │
     ▼                                       ▼
   closed  (result_status: won | lost | refund | refunded)
```

- `open` → `closed` directly happens when worker processes via AVRKHUB (no manual declaration).
- `open` → `manual` → `closed` is the manual path.
- `open` → `closed` with `result_status='refunded'` is the admin **void** path (skips `manual`).

---

## 7. Auto vs Manual Settlement — Quick Contrast

| Aspect | Automatic | Manual Declare | Manual Void |
|---|---|---|---|
| Trigger | `newjobv2.js` cron polls AVRKHUB every minute | Admin click `/declareresult` | Admin click `/void` |
| Result source | AVRKHUB `get_result` API | `mannual_result` table | N/A — admin intent is "refund all" |
| Bet status path | `open` → `closed` | `open` → `manual` → `closed` | `open` → `closed` (`refunded`) |
| Who credits wallet | Settlement worker | Settlement worker | Admin controller (inline) |
| Who clears UserExposure | Settlement worker | Settlement worker | Admin controller (inline) |
| CreditsLedger entries | Yes (settlement / exposure_release / refund) | Yes (settlement / exposure_release) | **No** — only `Wallet.increment` (see Gotchas) |
| Audit record | `sports_event_result_scan`, job rows | `mannual_result` row (persistent) | None (beyond bet status) |

---

## 8. Gotchas & Sharp Edges

1. **Void doesn't write CreditsLedger**
   `voidResult` sirf `Wallet.increment('cash', ...)` karta hai — koi `credits_ledger` refund entry nahi banti. Ledger-based reports (user statement, bet history with ledger-first financials) me ye refund "invisible" rahega. Agar ledger parity zaroori ho, controller me `CreditsLedger.create({ reason: 'refund', ... })` add karna padega.

2. **Void refund uses exposure-snapshot, not bet-sum**
   Refund = `|min(exposure_amount)|`. Agar exposure kisi aur market ke saath combined ho ya user ne partial hedge kiya ho, ye approach placement-time locked cash reflect karega (wallet model ke hisaab se correct) — par bet-level stake total se mel nahi khaata.

3. **Fancy session bleed on void**
   `UserExposure` me `selection_name` filter nahi hota (controller.js:436 ka commented block dekho). Multiple fancy sessions under same `market_type` → ek ko void karne se doosri ki exposure bhi delete ho sakti hai. Low-risk production me (ek session at a time) kam hota hai, par high-volume par watch karo.

4. **Manual declare idempotency**
   Agar admin galat winner declare kar de aur re-declare kare — doosri `mannual_result` row insert hogi. Worker latest `DESC` padhega, **but only if bets still `manual`**. Jo bets already `closed` ho chuki unhe fix karne ke liye separate resettle tool chahiye — abhi nahi hai.

5. **Cron can also re-queue manual bets**
   `newjobv2.js` job create karta hai jab `status IN ('open','manual')` dono bets hain. Manual bets ka job create ho sakta hai wahi flow se, ya purana `open` job already queue me ho sakta hai — dono case me worker ka `if (status === 'manual')` branch sahi source choose karega.

6. **Predefined list sync**
   Controller (`controller.js:73-99`, `:271-296`), settlement worker (`settlementv2.js:592-618`), aur admin UI teeno me `marketsforfancy` list maintain karni padti hai. Ek me add karke doosre me miss mat karna — warna validation & payout out-of-sync ho jayenge.

7. **v1 vs v2 worker**
   `SETTLEMENT_VERSION=v1` hai to `settlementnew.js` run hota hai; dono me manual branching identical hai (both import `MannualResult`). Prod par check: `d99-server/backend.config.cjs` + `.env SETTLEMENT_VERSION` + `docs/SETTLEMENT_API_V2.md`.

---

## 9. End-to-End Example — MO Declare

```
T0   Admin opens match-settlement page
     ├─ Frontend polls GET /momatches (every 2s)
     └─ Sees "India v Australia  MATCH_ODDS  MO  42 bets"

T1   Admin clicks "Declare" → SettlementModal opens
     ├─ Selects winner "India"
     └─ Submit → POST /declareresult
         {
           eventid:"31234567", match_id:"1.234...", match_title:"India v Australia",
           game_type:"MO", market_type:"MATCH_ODDS", winnerName:"India"
         }

T1.1 controller.declareResult
     ├─ Validates (MO → winnerName present ✓)
     ├─ BEGIN TX
     ├─ INSERT mannual_result(...)
     ├─ UPDATE sports_bets SET status='manual'
     │         WHERE match_id, market_type, game_type, status='open'
     │         → 42 bets updated
     └─ COMMIT → { success:true, updatedBets:42 }

T2   newjobv2.js cron (next minute)
     ├─ Finds bets with status IN ('open','manual')
     └─ Ensures settlement jobs queued for (user,event) pairs
         (existing ones may already be in 'queued')

T3   settlementv2.js pollOnce (every minute)
     ├─ Pulls queued jobs, marks 'processing'
     ├─ processJob → processMobmGroup(user_id=U1, match_id, ...)
     │   ├─ any.status === 'manual' → fetchManualResult(...)
     │   │   └─ MannualResult.findOne(...) → { winnerName:"India" }
     │   ├─ resolveMobmWinner → winner="India"
     │   ├─ getMatchExposures(U1, match_id, "MATCH_ODDS")
     │   ├─ For each U1 bet:
     │   │   ├─ compute credit (winner India → long-India bets get payout)
     │   │   ├─ Wallet.cash += credit
     │   │   ├─ CreditsLedger.create({ reason:'settlement', ... })
     │   │   ├─ SportsBet.update({ status:'closed', result_status:'won'|'lost' })
     │   │   └─ MarketWin.create(...)
     │   └─ clearExposuresForMatch(U1, match_id, "MATCH_ODDS")
     └─ Job → status='done'

T4   GET /momatches no longer returns this match (all bets closed).
```

---

## 10. Related Docs

- `d99-server/docs/SETTLEMENT_API_V2.md` — automatic settlement pipeline (AVRKHUB), v1/v2 selection, queue mechanics.
- `d99-server/mannualSettle/API_DOCS.md` — endpoint-level field reference.
- `d99-server/docs3/SPORTS_PLACEBET_PAYLOAD.md` — how bets get created (upstream of settlement).
- Memory: `project_wallet_model.md` — why void refund uses cash (liability-locked) not inr_balance.
