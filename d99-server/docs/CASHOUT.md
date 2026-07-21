# Cashout System

## 1. Overview

Cashout lets a user hedge their existing position in a sports market at current
live odds. In this platform cashout is **not** a special settlement flow — it
is literally a normal opposite-side bet that the system pre-calculates on the
user's behalf so their worst-case loss is reduced (or eliminated, or flipped
into a locked profit).

**Key properties:**

- Implemented **frontend-only**. The backend has no cashout-specific branch:
  once the user confirms, the calculated bet is submitted through the normal
  `POST /user/place` flow and hits the existing `placeBet` controller
  (`d99-server/sportsbet/sportbetscontroller.js:528`).
- Computes the hedge from live **`UserExposure`** rows (not from matched bet
  history). The single source of truth for the user's current net position in
  a market is the `user_exposures` table.
- Scope is limited to **2-runner head-to-head markets** (see §2). Fancy /
  session / multi-outcome markets are explicitly out of scope.
- Original bets are **never** marked, closed, or settled. The old and the new
  hedge bet co-exist; the settlement worker later settles both on match
  result like any other pair of bets.

## 2. Scope — Supported Markets

Cashout is only offered on the following 2-runner markets:

| Market            | `mname` patterns matched (case-insensitive)         |
| ----------------- | ---------------------------------------------------- |
| Match Odds        | contains both `match` and `odds`                     |
| Tied Match        | contains `tied`                                      |
| Bookmaker         | contains `bookmaker`                                 |
| Bookmaker 2       | contains `bookmaker` (same substring rule)           |
| 6 Over Bookmaker  | contains `bookmaker` (same substring rule)           |

The gating happens in
`d99-frontend/src/pages/sports/cricket/cricketDetails/index.js` inside
`shouldShowCashout(market)`. Any market whose `section.length !== 2` is
additionally rejected, even if its name matches — this keeps the button off
3-runner Match Odds (with "The Draw") and any unexpected shapes.

Fancy, session, over-by-over yes/no, Odd/Even, Khado, Meter and similar
markets are deliberately excluded because their exposure math is different
(fixed-odds vs. decimal odds, or yes/no runner structure).

## 3. Data Sources

### 3.1 UserExposure (`user_exposures` table)

Model: `d99-server/model/user/UserExposure.js`

| Column             | Notes                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `user_id`          | Owning user.                                                          |
| `match_id`         | Market-level `mid` (not global match gmid).                           |
| `event_id`         | Global match gmid (for cross-lookup).                                 |
| `team_name`        | Runner name — exactly the `nat` sent when the original bet was placed. |
| `exposure_amount`  | Signed decimal. Positive = user wins this much if runner wins, negative = user loses this much if runner wins. |
| `game_type`        | **Raw market name** — stores `market.mname` verbatim, e.g. `"Match Odds"`, `"Bookmaker"`, `"Bookmaker2"`, `"Tied Match"`, `"6 Over Bookmaker"`. |
| `match_title`      | Event name.                                                            |
| `category`         | `"sports"` for all sports exposures.                                   |

Unique index: `(user_id, match_id, team_name, game_type)`.

**Critical detail:** `UserExposure.game_type` holds the **full market name**
(e.g. `"Bookmaker2"`), not the normalized `MO`/`BM`/`FAN` codes the
`SportsBet` table uses. This is set in
`sportbetscontroller.js:784` via `const exposureGameType = market_type;` and
upserted at line 2086.

### 3.2 Exposure Fetch Endpoint

- **Route:** `POST /user/matchexposures/match`
  (`d99-server/sportsbet/routes.js:26`)
- **Controller:** `ExposureController.getExposureById`
  (`d99-server/controller/user/userExposureController.js:38`)
- **Body:** `{ user_id, match_id }`
- **Behaviour:** returns `{ success, data: [UserExposure] }` where `data` is
  all rows for the user whose `match_id` **or** `event_id` equals the provided
  id. In practice the frontend sends the global `gmid`, so it receives every
  exposure row across every market for that match — one response covers all
  cashout-eligible markets.

### 3.3 Frontend Polling

`d99-frontend/src/pages/sports/cricket/cricketDetails/index.js` polls exposure
every 2 seconds into state `exposuresArray`
(see the `useEffect` at ~line 776 / `fetchExposure`).

`exposuresArray` row shape (as stored in state):

```js
{ team_name, exposure_amount, game_type, match_id, event_id, match_title, category }
```

### 3.4 Live Odds Source

Live prices come from the same `marketData` object the Market component
already renders. For each runner, `marketData.section[i]` has:

```js
{
  nat: "Team A",          // runner name — matches team_name in UserExposure
  sid: "...",             // selection id
  odds: [
    { oname: "back3", odds: 1.48 },
    { oname: "back2", odds: 1.49 },
    { oname: "back1", odds: 1.50 },   // best back (highest)
    { oname: "lay1",  odds: 1.51 },   // best lay  (lowest)
    { oname: "lay2",  odds: 1.52 },
    { oname: "lay3",  odds: 1.53 },
  ],
}
```

The cashout util reads `back1` / `lay1` first, and falls back to scanning all
back/lay entries if the canonical slot is missing (max for back, min for lay).

## 4. Algorithm

For a 2-runner market with runners A and B, current exposures `E_A` and `E_B`,
the cashout's job is to rebalance them.

### 4.1 Backend exposure math (reference)

These are the rules the backend uses in `sportbetscontroller.js` around lines
1942–1987 for a non-fancy, non-draw 2-runner market. The cashout util mirrors
them exactly so its projection equals what the server will compute.

| Bet side      | Multiplier `M`        | Selected runner delta | Other runner delta |
| ------------- | --------------------- | ---------------------- | ------------------- |
| **Back**      | `odds − 1`            | `+ stake × M`          | `− stake`           |
| **Lay**       | `odds − 1`            | `− stake × M`          | `+ stake`           |
| **Tied Back** | `odds ÷ 100`          | `+ stake × M`          | `− stake`           |
| **Tied Lay**  | `odds ÷ 100`          | `− stake × M`          | `+ stake`           |

(Tied Match uses the `oddN / 100` multiplier instead of `oddN − 1`; everything
else is the same.)

### 4.2 Hedge derivation

Let `H` = runner with the higher current exposure, `L` = the other runner.
Define `diff = E_H − E_L` (always positive because H is the higher one).

**Primary strategy — Lay H.** Place a Lay bet on H with stake `S` at lay odds
`O`. After the bet:

```
E_H' = E_H − S × (O − 1)
E_L' = E_L + S
```

Full rebalance (`E_H' == E_L'`) gives:

```
E_H − S × (O − 1) = E_L + S
E_H − E_L         = S × (O − 1) + S
diff              = S × O
S                 = diff / O
```

For Tied Match the derivation is the same but with `M = O/100`, leading to
`S = diff / (M + 1) = diff / (O/100 + 1)`.

**Fallback strategy — Back L.** If the higher runner has no lay price
currently available, the util also tries backing the lower runner at its back
price. The derivation is symmetric:

```
E_L + S × (O − 1) = E_H − S
S                 = diff / O
```

### 4.3 Post-hedge property

After applying the chosen stake `S` at odds `O`, both runners land on the
same exposure value:

```
E_final = E_L + S = E_H − S × (O − 1)
```

Because `S` is derived from the live opposite-side odds and not from the
original bet's odds:

- If live odds equal the original's odds: both runners go to **0** — a
  perfect, zero-liability hedge.
- If live odds are **in the user's favour** (e.g. lay price lower than the
  original back price): both runners go **positive** — a locked-in profit.
- If live odds are **against the user**: both runners remain negative but the
  absolute loss is smaller than the original worst-case.

### 4.4 Worst-case guard

The util computes `worstBefore = min(E_A, E_B)` and
`worstAfter = min(E_A', E_B')`. If `worstAfter < worstBefore − 0.01`, the
cashout would make things worse and is rejected with `reason: 'worsens'`. In
the normal case (hedging from a one-sided position) `worstAfter ≥ worstBefore`
by construction.

### 4.5 Candidate selection

Both candidates (Lay H, Back L) are computed when their respective prices are
available, then sorted by the resulting worst-case floor (highest wins). The
best candidate is returned. If neither can be built the util returns
`reason: 'no_odds'`.

## 5. Files

### 5.1 `d99-frontend/src/utils/cahoutUtil.js`

Pure functions, no React, no state. Exports:

- `buildMarketCashout({ marketData, exposuresArray })`
  Main entry point. Returns either `{ ok: true, ... }` or
  `{ ok: false, reason, ... }`.

Internal helpers:

- `pickBestPrices(sectionOdds)` — returns `{ bestBack, bestLay }` for a
  runner's odds list. Prefers `back1` / `lay1`; falls back to max-back /
  min-lay across all entries.
- `projectExposures({ exposures, sel, other, betType, odds, stake, isTied })`
  — projects post-bet exposures using the backend's own formula.
- `resolveMarketLimits(marketData)` — returns `{ min, max }` using the same
  rule as `buildPlaceBetPayload`: `min = market.min`,
  `max = market.maxb > 0 ? market.maxb : market.max`.

### 5.2 `d99-frontend/src/pages/sports/cricket/cricketDetails/index.js`

- `shouldShowCashout(market)` — the gate that decides which markets render the
  Cashout button. Checks 2-runner shape + market name patterns.
- `handleSectionCashout(marketData)` — the click handler. Calls
  `buildMarketCashout`, maps error reasons to toasts, otherwise builds the
  bet-slip payload and calls `onBetClick(cashoutPayload)`.

### 5.3 `d99-frontend/src/pages/sports/cricket/index.js`

- Line ~140: `setAutoBet(!!betContext?.is_cashout)` — auto-submit hook. Only
  fires when the payload explicitly sets `is_cashout: true`. Currently the
  cashout handler sets it to `false` (see §8).

### 5.4 `d99-frontend/src/components/sportsPlaceBet/SportsPlaceBet.js`

- Line ~480: reads `betValue.stake` into `stakeValue` and `betValue.odds` into
  `oddsValue` — this is how the pre-filled bet slip shows the calculated
  hedge.
- Line ~486: auto-submit `useEffect` for cashout. Fires only when `autoBet &&
  betValue?.is_cashout && stakeValue > 0 && oddsValue >= 1.01`. Cashout bets
  also **skip the buffer delay** (line 787) to avoid 3-second odds drift
  before placement.

## 6. End-to-End Flow

```
┌─ User ─────────────────────────────────────────────────────────────┐
│ 1. Clicks "Cashout" on a Match Odds / Tied / Bookmaker* section.   │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─ cricketDetails/index.js ──────────────────────────────────────────┐
│ 2. handleSectionCashout(marketData)                                │
│    └─> buildMarketCashout({ marketData, exposuresArray })          │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─ cahoutUtil.js ────────────────────────────────────────────────────┐
│ 3. Filter exposuresArray by game_type === marketData.mname         │
│ 4. Build { teamA, teamB } -> { E_A, E_B }                          │
│ 5. Identify higher/lower runner, compute diff                      │
│ 6. Compute Lay-H and/or Back-L candidates                          │
│ 7. Pick best, validate worst-case, validate min/max stake          │
│ 8. Return { ok, betType, team, odds, stake, ... }                  │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─ cricketDetails/index.js ──────────────────────────────────────────┐
│ 9. Build cashoutPayload (same shape as normal placeBetPayload)     │
│ 10. Call parent onBetClick(cashoutPayload)                         │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─ cricket/index.js (parent page) ───────────────────────────────────┐
│ 11. setBetValue(betContext)                                        │
│ 12. setShowPlaceBet(true)                                          │
│ 13. setAutoBet(!!betContext?.is_cashout)  — currently false        │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─ SportsPlaceBet ───────────────────────────────────────────────────┐
│ 14. Pre-fills stakeValue/oddsValue from payload                    │
│ 15. User reviews and clicks "Place Bet"                            │
│ 16. handleSubmit() validates min/max, odds integrity, then calls   │
│     realUserUtils.handleRealBetSubmission → POST /user/place       │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─ d99-server/sportsbet/sportbetscontroller.js placeBet() ───────────┐
│ 17. Standard placeBet flow — no cashout branch.                    │
│ 18. Reads old UserExposure rows, computes new exposures using the  │
│     same Back/Lay formula the util projected, upserts rows,        │
│     updates wallet, writes SportsBet + ledger entry.               │
└────────────────────────────────────────────────────────────────────┘
```

**Result:** two bets exist on the market — the original and the hedge — and
`user_exposures` reflects the rebalanced position. When the match settles,
the settlement worker processes both like any other bets.

## 7. Error Reasons

`buildMarketCashout` returns a discriminated `{ ok: false, reason, ... }`
object on failure. `handleSectionCashout` maps each to a user-visible toast.

| `reason`            | Meaning                                                                             | Toast                                                          |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `invalid_market`    | marketData missing, has fewer than 2 runners, or has no name                         | "Cashout not available"                                        |
| `no_position`       | No UserExposure rows for this market — user has nothing to hedge                    | "No active bets to cashout"                                    |
| `already_balanced`  | `|E_A − E_B| < 0.01` — position is already flat, nothing to rebalance               | "Position already balanced"                                    |
| `no_odds`           | Neither a valid best-lay nor a valid best-back price could be read from the feed    | "Cashout not possible at this odds"                            |
| `worsens`           | Best candidate's projected worst-case is lower than the current worst-case          | "Cashout not possible at this odds"                            |
| `below_min`         | Calculated hedge stake is lower than `market.min`                                   | "Check limit: cashout stake S below min M" (with actual values) |
| `above_max`         | Calculated hedge stake is higher than `market.maxb` (or `market.max`)               | "Check limit: cashout stake S above max M" (with actual values) |

On `below_min` and `above_max` the `result` object includes the offending
`stake` and the threshold (`min` / `max`) so the toast can show concrete
numbers.

## 8. Auto-Submit Gate

`cricketDetails/index.js` sets `is_cashout: false` on the cashout payload by
default. This means:

1. The payload travels through `cricket/index.js → setAutoBet(false)` — no
   auto-submit.
2. `SportsPlaceBet` opens the bet slip fully pre-filled (team, side, odds,
   stake).
3. The user reviews the hedge and taps **Place Bet** manually.

To enable one-tap cashout, change `is_cashout: false` → `is_cashout: true` in
the `cashoutPayload` block of `handleSectionCashout`. The wiring is already in
place:

- `cricket/index.js` line ~140: `setAutoBet(!!betContext?.is_cashout)` will
  flip `autoBet` to `true`.
- `SportsPlaceBet.js` line ~488: the auto-submit `useEffect` will call
  `handleSubmit()` as soon as `stakeValue > 0 && oddsValue >= 1.01`, and will
  skip the 3-second buffer delay.

No other changes are required.

## 9. Stake Limit Validation

Two layers of validation guard the cashout stake:

### 9.1 Util layer (pre-emptive)

`buildMarketCashout` reads `marketData.min` / `marketData.maxb` / `marketData.max`
and rejects the hedge with `below_min` / `above_max` **before** the bet slip
opens. This gives the user an explicit error message naming both the
calculated stake and the market limit.

### 9.2 Bet slip layer (defensive)

The cashout payload also forwards `min_stake`, `maxb`, and `max_stake` on the
payload object. `SportsPlaceBet` has its own range check in `handleSubmit`
(line ~729: *"Check min and max bet limit"*) which will refuse to submit if
the pre-filled stake is outside the market range — a second line of defence
in case the util's copy of the limits drifts from the bet slip's.

Both layers use the exact same rule the normal bet placement uses
(see `buildPlaceBetPayload` at `cricketDetails/index.js` line ~680):

```js
min_stake:  market.min
maxb:       market.maxb
max_stake:  (market.maxb > 0) ? market.maxb : market.max
```

## 10. Edge Cases & Notes

- **No position on one runner.** If only one runner has a `UserExposure` row,
  the other is treated as `0`. Cashout still runs normally.
- **All-positive exposures.** Possible after an earlier partial hedge. The
  util will still rebalance toward equal exposures, but the `worsens` guard
  may reject if the proposed bet would reduce the lower side below the
  current minimum.
- **Tied Match semantics.** Detected via `mname.toLowerCase().includes('tied')`.
  The util switches to the `odds/100` multiplier so the projection matches
  the backend.
- **Bookmaker odds.** Bookmaker markets use decimal odds in the feed (e.g.
  `1.85`), not percentage values, for cashout purposes. The backend's
  non-fancy branch (the `else if (isNonFancyMarket(market_type))` block at
  line 1942) uses `(odds − 1)`, same as match odds. The util mirrors this.
  The special `odds/100` BM handling in `SportsPlaceBet.calculateSingleBetPLValue`
  is a display concern and does not affect the on-server exposure math.
- **Multiple cashouts in sequence.** Each cashout is a new bet. After the
  first cashout, `user_exposures` reflects the new (rebalanced) position and
  the next cashout click computes a fresh hedge from that new baseline. There
  is no accumulator or history — the util is stateless.
- **External odds feed.** `placeBet` still forwards every bet (cashout or not)
  to the turnkeyxgaming `post-market` endpoint in its normal best-effort
  non-blocking manner (controller line 682-710). No special handling needed.

## 11. Extending to a New 2-Runner Market

If a new 2-runner head-to-head market is introduced (e.g. "1st Innings
Winner") and should support cashout:

1. Confirm the market's `mname` — it will be stored in `UserExposure.game_type`
   as this exact string when bets land on it (no code change required on the
   backend).
2. Open `cricketDetails/index.js` → `shouldShowCashout(market)` and add a
   substring check, e.g.:

   ```js
   const isInningsWinner = m.includes("innings") && m.includes("winner");
   return isMatchOdds || isTied || isBookmaker || isInningsWinner;
   ```

3. Verify `section.length === 2` holds for the new market (the shape guard
   blocks any market with a different number of runners).
4. Test: place a bet, poll exposure, click Cashout, verify the projected
   exposures match the bet slip preview.

No changes are needed to `cahoutUtil.js`, the backend controllers, or the
`UserExposure` model — the util is market-name-agnostic as long as the market
is 2-runner and stores exposure the same way the existing ones do.

## 12. Testing Checklist

### Happy-path

- [ ] Place a Back bet on Team A in Match Odds. Wait for exposure poll (~2s).
      Click Cashout. Confirm the bet slip is pre-filled with:
      - side: Lay
      - team: Team A
      - odds: current best Lay price on Team A
      - stake: `(E_A − E_B) / odds` rounded to 2dp
- [ ] Click Place Bet. After submission, refresh exposure — both runners
      should be at the same projected value (matches console
      `[Cashout] placing hedge` `projected` object).
- [ ] Repeat for each supported market: Tied Match, Bookmaker, Bookmaker2,
      6 Over Bookmaker. Formula math should match each market's backend
      branch.

### Error toasts

- [ ] Click Cashout with no bets on the market → "No active bets to cashout".
- [ ] Click Cashout on a perfectly balanced position (e.g. matched Back + Lay
      at the same odds) → "Position already balanced".
- [ ] Click Cashout when best-back and best-lay are both suspended / missing
      → "Cashout not possible at this odds".
- [ ] Provoke `below_min` by creating a tiny one-sided position so that
      `diff / odds < market.min` → "Check limit: cashout stake … below min …".
- [ ] Provoke `above_max` by creating a large one-sided position so that
      `diff / odds > market.max` → "Check limit: cashout stake … above max …".

### Edge cases

- [ ] Cashout when only one runner has an exposure row (e.g. placed on Team A
      only) — should still project a rebalance to the correct value.
- [ ] Run two cashouts in sequence on the same market and verify the second
      computes off the post-first baseline, not the original.
- [ ] Console shows one `[Cashout] placing hedge` log per click with
      `current`, `worstBefore`, `projected`, `worstAfter`, and `bet` fields
      populated.

### Auto-submit (when enabled)

- [ ] Flip `is_cashout` to `true` in `handleSectionCashout`.
- [ ] Click Cashout → bet slip should submit without manual Place Bet tap.
- [ ] Buffer delay should be skipped (no 3-second countdown).
- [ ] Toast sequence and final exposure match the manual-submit path.

## 13. Known Non-Issues

- The backend `placeBet` controller contains no `cashout` branch and no
  `is_cashout` flag handling. This is intentional — cashout is indistinguishable
  from a regular opposite-side bet at the server level, by design.
- The `UserExposure` model has no cashout-specific columns. Also intentional.
- The `SportsBet` row inserted for a cashout has no `is_cashout` marker; it
  looks exactly like any other back/lay bet. If cashout ever needs to be
  reported separately (admin analytics, user statement label, etc.), a
  lightweight `is_cashout` column on `SportsBet` plus a server-side read of
  the payload flag would be the minimum change — but this is out of scope
  for the current feature as defined.
