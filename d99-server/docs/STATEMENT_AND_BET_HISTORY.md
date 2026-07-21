# Account Statement & Bet History — Concepts, Logic, Verification

This document covers the three reporting surfaces that show a user's
financial activity:

| Page | Endpoint | Used by | Source code |
| --- | --- | --- | --- |
| **User Account Statement** | `POST /user/account-statement` | Logged-in user | `services/user/UserStatementService.js` |
| **Admin Account Statement** | `POST /admin/reports/accountstatement` | Admin viewing a user | `services/TransactionReportService.js` |
| **Admin User Bet History** | `GET /admin/reports/user-bet-history` | Admin (Reports → User Bet History) | `controller/admin/reportsController.js` (`getUserBetHistory`) |

All three exist because admins and users want different views of the same
underlying data. The two account-statement endpoints share an algorithm
(closing-delta) and the bet-history endpoint shows a per-bet view (with
event-wise summary).

---

## 1. Data sources and the moving parts

### 1.1 The "wallet" is the source of truth

The user's spendable money lives in `wallets.cash`. Every change to that
column is what we ultimately want to display in a statement.

There are three ways `wallets.cash` is mutated in the codebase:

1. **Transaction table** — `Transaction` rows describe deposits / withdrawals
   / credit ops between staff and users. Each row stores its own
   `new_balance` snapshot.
2. **CreditsLedger table** — `credits_ledger` rows describe sports / casino
   bet activity (placement, hedging release, settlement, refund). Each row
   stores `closing` which is the live `wallets.cash` value at the moment the
   row was inserted.
3. **Direct `wallets.update`** — settlement code occasionally writes
   `wallets.cash` directly (most notably the FAN settlement path which
   does TWO updates per bet: one for stake refund / "exposure release", one
   for the netamount). Only ONE CreditsLedger row gets created per bet
   even though TWO wallet writes happened. **This is the gotcha that
   shapes everything below.**

### 1.2 Why we can't trust `credits_ledger.amount` alone

For a winning FAN/session bet the FAN settlement code in `settlementv2.js`
does, in order:

```js
// (a) release the locked exposure back to wallet
wallet.cash += releaseexposure;       // e.g. +25000 stake refund

// (b) apply the net P/L
wallet.cash += netamount;             // e.g. +22500 profit

// (c) write ONE credits_ledger row, with amount = netamount only
CreditsLedger.create({
  amount: credit,                     // = netamount, e.g. +22500
  reason: "test",                     // hardcoded placeholder, see "Known wart"
  closing: wallet.cash,               // live snapshot AFTER both wallet writes
  ...
});
```

So for a +47500 wallet credit you will see:

- `wallets.cash`: +47500 (correct, real)
- `credits_ledger.amount`: +22500 (only the netamount portion)
- `credits_ledger.closing`: 118500 (real wallet snapshot, correct)

`closing` is the source of truth. `amount` is partial. Anything that
sums `amount` will under-report.

**Same gotcha for hedge bets at placement.** When a new bet reduces the
user's max market liability, `walletUpdate` *releases* cash back. We write
two ledger rows:

| reason | amount | meaning |
| --- | --- | --- |
| `bet_placed` | `0` (since cash was not deducted) | placement marker |
| `exposure_release` | `+release_amount` | the actual cash returned |

Both rows have **the same** `closing` (post-release value), because
`wallet.save()` happens once and both rows are written immediately after.

### 1.3 Known wart: `reason: "test"` in settlement code

Three settlement files (`settlementv2.js`, `settlementnew.js`,
`settlementWorker.js`) hardcode `reason: "test"` for the per-bet FAN
settlement row. It's a developer placeholder that was never renamed to
`"settlement"`. The reporting layers tolerate it by treating
`reason in ('test', 'settlement')` as the settlement-row marker.

---

## 2. The closing-delta principle

> The cash flow that actually happened on a row is
> `row.closing - previous_row.closing`, **not** `row.amount`.

We rely on this in both account statements. The reasoning:

- `closing` is queried from the live wallet at row-creation time, so it
  is *always* a real wallet snapshot.
- The difference between two consecutive snapshots is, by definition,
  the cash that moved during that row.
- This works for hedge bets, batch settlements, win/loss settlements —
  every case — because we never trust the partial `amount` column.

Once we accept this, every row's `(credit, debit)` pair is just the
positive / negative half of the delta:

```
delta = row.closing - prev.closing
credit = max(delta, 0)
debit  = max(-delta, 0)
```

A row with `delta == 0` is dropped (no actual cash moved — usually a
P/L-only settlement entry for a losing bet whose stake was already
deducted at placement).

The very first visible row has no `prev`, so it falls back to its raw
`amount` column for credit/debit. Deposit / `bet_placed` rows have
correct `amount` values, so this anchor is reliable.

---

## 3. User Account Statement (`/user/account-statement`)

### 3.1 Purpose

The end user opens this in their account panel. They see a chronological
list of every cash movement on their wallet — deposits, withdrawals,
sports bets, casino bets, third-party casino — with a running closing
balance that reconciles row-by-row.

### 3.2 Filter handling

`reportType` decides which sources are merged:

| reportType | Transaction table | CreditsLedger |
| --- | --- | --- |
| `''` / `'TRANSACTION'` / `'Deposit/Withdraw'` | ✅ ADD/SUBTRACT_CASH only | ❌ |
| `'SPORTS'` | ❌ | ✅ category=`SPORTS` |
| `'CASINO'` | ❌ | ✅ category=`CASINO` |
| `'THIRD-PARTY-CASINO'` | ❌ | ✅ category=`THIRD_PARTY_CASINO` |

For `Deposit/Withdraw` mode the very first ADD_CASH/ADD_CREDIT row is
labelled "Opening Pts" (the user's first ever credit on the platform);
everything else is "deposit" / "withdrawal".

### 3.3 Per-row formatting

For sports rows the `description` is rebuilt from the linked SportsBet
to read

```
Cricket / <match_title> / <market_type> / <selection or fancy_name>
```

For casino rows we look up `casino_bets` and build

```
<game_name> / R.No : <round_id> / <player_name>
```

Third-party casino rows leave `description` as the source's free text and
put `meta.game_name` in the `fromto` column.

### 3.4 The closing-delta pass

After both transaction rows and ledger rows are formatted, they go
through one chronological pass that overwrites `credit` and `debit`
based on `closing - prevClosing`:

```js
const chronological = [...allRows].sort((a, b) => {
  const diff = a.rawDate - b.rawDate;
  if (diff !== 0) return diff;
  // tiebreak by numeric id from "ld-127" / "tx-42"
  return Number(String(a.id).replace(/\D/g, '')) - Number(String(b.id).replace(/\D/g, ''));
});
let prevClosing = null;
for (const row of chronological) {
  const closing = parseFloat(row.closing) || 0;
  if (prevClosing != null) {
    const delta = closing - prevClosing;
    if (delta > 0)      { row.credit = delta;          row.debit = 0; }
    else if (delta < 0) { row.credit = 0;              row.debit = Math.abs(delta); }
    else                { row.credit = 0;              row.debit = 0; }
  }
  prevClosing = closing;
}
```

After this pass we filter out the `0/0` rows (P/L-only settlement
entries that did not move the wallet) and finally sort DESC for display.

### 3.5 Why row math now reconciles

Suppose a user has these chronological events:

| time | bet | event | closing |
| --- | --- | --- | --- |
| 16:04 | bet 94 placed | -1000 | 4000 |
| 16:06 | bet 95 placed (hedge release) | +1000 | 5000 |
| 16:13 | bet 97 placed | -100 | 4900 |
| 16:25 | bet 99 placed | -100 | 4800 |
| 16:53 | bet 101 settled (won) | +200 | 4759 |
| ... |  |  |  |

Each row's `delta` matches the `closing` jump exactly. The user can
visually confirm: previous closing `+ credit − debit = current closing`,
on every row, no matter what kind of event.

---

## 4. Admin Account Statement (`/admin/reports/accountstatement`)

### 4.1 Purpose

Same idea as the user statement, but the admin can search for any user
in their downline and look at *that* user's statement. The code path
is in `services/TransactionReportService.js` (`getStatement`).

### 4.2 Differences from the user statement

| Aspect | User statement | Admin statement |
| --- | --- | --- |
| Who can call it | logged-in user only | admin/owner only (auth gated) |
| Target | always self | any user in admin's downline |
| `reportType` values | `SPORTS`, `CASINO`, `THIRD-PARTY-CASINO`, `''` | `ALL`, `SPORTS`, `CASINO`, `THIRD-PARTY`, `TRANSACTION`, `''` |
| Default mode | one source at a time | `ALL` merges Transaction + CreditsLedger |
| Date sort | DESC | DESC |

The closing-delta pass and the `0/0` filter work identically. The same
gotchas (FAN settlement, hedge release) are absorbed by the same algorithm.

### 4.3 Hierarchy guard

The admin endpoint resolves the target user via username (case-insensitive)
and the request only proceeds if `req.user.role` is owner or staff.
Non-OWNER admins are restricted to bets from users in their downline tree
via `getUserIdsByHierarchy(role, username)`.

---

## 5. Admin User Bet History (`/admin/reports/user-bet-history`)

This is the page admins use to drill into a specific user's betting
activity. Unlike the account statement (one row per cash event), this
endpoint returns **one row per bet** plus a separate event-wise summary.

### 5.1 Endpoint

```
GET /admin/reports/user-bet-history
  ?username=<downline-username>
  &page=1
  &limit=25
  &fromDate=YYYY-MM-DD
  &toDate=YYYY-MM-DD
  &betType=back|lay|all
  &status=pending|won|loss|all
```

Two safeguards run before any data is fetched:

1. `username` is required (otherwise an empty payload is returned).
2. The target user must be in the caller's downline. The hierarchy is
   resolved by `getUserIdsByHierarchy(req.user.role, req.user.username)`.
   If the target user is not in that set, the response is `403`.

### 5.2 Per-bet enrichment

The endpoint runs `SportsBet.findAndCountAll` over the request window
and then enriches each bet row with derived financials. The
enrichment **does not trust `credits_ledger.amount`** for any P/L
computation — it derives the bet's outcome math from the raw bet fields
(`stake_amount`, `liability`, `odds`, `size`, `bet_type`,
`result_status`).

The shape of each enriched row:

| Field | Source | Meaning |
| --- | --- | --- |
| `stake_amount` | raw bet | what the user placed |
| `liability` | raw bet | the bet's standalone max loss |
| `bet_type` | raw bet | `back` / `lay` / `yes` / `no` |
| `odds` | raw bet | decimal (MO/normal), bps (BM), or run-line (FAN) |
| `size` | raw bet | non-zero only for fancy session bets |
| `result_status` | raw bet | `won` / `loss` / `pending` / `refund` / `void` |
| **`debit`** | derived | the bet's standalone lock (back→stake, lay→liability) |
| **`credit`** | derived | settlement-time return (stake refund + profit, only on wins) |
| **`refund`** | derived | hedge release at placement OR void/cancel refund |
| **`profit_loss`** | derived | `+profit` on win, `-locked` on loss, `0` otherwise |
| **`exposure_held`** | derived | wallet exposure currently locked **after** hedging |
| **`closing_balance`** | first ledger entry's `closing` | wallet snapshot at placement time |

### 5.3 The three odds conventions

This is the tricky bit because the codebase mixes three:

#### a. Decimal odds (MO match-odds, fancy special markets, fancy1)

The stored odds value is already a decimal multiplier: `1.41`, `1.97`,
`3.20`, etc. Profit on a winning back bet:

```
profit = stake × (odds − 1)
```

#### b. Bookmaker bps (`game_type === 'BM'` or market_type contains "Bookmaker")

The stored odds value is bps notation: `42` means decimal 1.42, `110`
means decimal 2.10. The settlement code calls `normalizeOdds()` to
convert. Profit on a winning back bet, equivalent in both branches of
`normalizeOdds`, simplifies to:

```
profit = stake × (odds / 100)
```

#### c. Fancy session run-line (`game_type === 'FAN'` AND `size > 0`)

The stored odds value is the run line — `137` means "the line is 137
runs". Profit is computed from `size` (almost always 100 → even money):

```
profit = stake × (size / 100)
```

#### Lay/no win (any convention)

A winning lay/no bet pays the matched back stake regardless of how the
odds are stored:

```
profit = stake
```

The `computeProfit(bet)` helper inside `getUserBetHistory` chooses the
right branch in this exact order: lay/no first, then BM, then FAN with
non-zero size, then decimal default.

### 5.4 Yes / No resolution rule (FAN session)

Cricket session yes/no bets settle by comparing `final_result` (the
actual run / wicket count) against `odds` (the line) using **strict**
inequality:

```js
// settlementv2.js, "Normal" market_type branch
if (bet_type === 'yes') {
  winnerName = (final_result > odds) ? 'won' : 'loss';
} else if (bet_type === 'no') {
  winnerName = (final_result < odds) ? 'won' : 'loss';
}
```

Implications:

- `actual === line` → **both** YES and NO are marked LOSS. There is no
  push / refund branch for an exact tie. (Verified live: bet 103 was
  `yes @ 137 stake 5000`, RR scored exactly 137 in 10 overs, both
  the platform and the upstream `diamond-result.avrkhub.in/get_result`
  agree the answer is 137; the bet was correctly marked LOSS.)

If the platform ever wants to award a push on equality, this is the only
file that needs to change.

### 5.5 Debit / Credit / Refund / P/L derivation

```js
const standaloneLock = isBack ? stake : (liability || stake);

// hedge release at placement (only when the bet caused exposure to drop)
let placementRelease = 0;
if (placementCash > 0) placementRelease = placementCash;

let settlementCredit = 0;
let voidRefund       = 0;
let profit_loss      = 0;

if (won) {
  const profit = computeProfit(bet);
  settlementCredit = standaloneLock + profit;   // stake refund + profit
  profit_loss = profit;
}
else if (loss) {
  settlementCredit = 0;
  profit_loss = -standaloneLock;
}
else if (refund / void) {
  voidRefund = standaloneLock;
  profit_loss = 0;
}

return {
  debit: standaloneLock,
  credit: settlementCredit,
  refund: placementRelease + voidRefund, // frontend shows as "Released"
  profit_loss,
};
```

#### Why `debit` is always the standalone lock

For an internally consistent row the user expects `Credit − Debit` to
equal `P/L` for settled bets. If a hedge bet's placement released cash
(`placementCash > 0`) we **could** set `debit = 0` and put the release
in `credit`. We did try that briefly. The math then gives
`Credit − Debit = +release_amount`, which contradicts the realised P/L
on a losing hedge bet.

So instead `debit` is always the bet's standalone risk, the hedge
release goes into the separate `refund` ("Released") column, and
`Credit − Debit = P/L` holds row-by-row for every settled bet.

#### `exposure_held` vs `debit`

`exposure_held` is the *wallet-level* lock. For a hedge bet that
released cash at placement, the wallet has zero locked for that bet
(the lock is gone), so `exposure_held = 0`. Showing 360 next to
"Released 1000" would be self-contradictory.

`debit` and `exposure_held` are deliberately different concepts:

- `debit` = bet's standalone risk (used for the `C − D = P/L` math)
- `exposure_held` = currently locked in the wallet for this bet (after
  any hedging effect)

### 5.6 `closing_balance` per bet

We use the **first** ledger entry per bet (chronologically) and read its
`closing` column. This is the wallet snapshot at the moment the bet
was placed.

Why first instead of last? If a settled bet's settlement happens later
(or in a batch), its "latest" closing reflects the wallet at settlement
time, not at placement. With rows sorted by placement time, that
breaks the eye-trail. Placement closing is what you'd expect on a
"bet history sorted by placement date" view.

For hedge bets, both rows that `walletUpdate` writes share the same
post-release closing — the placement-time wallet snapshot is captured
correctly either way.

### 5.7 Float precision rounding

All numeric output fields go through `r2(v) = Math.round(v * 100) / 100`
because the BM lay liability calc occasionally produces values like
`40.99999999999999` from `100 * (41.5/100) - …`.

### 5.8 Event-wise summary

The same response carries a `summary` block grouped by
`(match_id, game_type, market_type)`:

```jsonc
{
  "summary": {
    "by_event": [
      {
        "match_id": "4762313099066",
        "match_title": "Rajasthan Royals vs RC Bengaluru",
        "game_type": "MO",
        "market_type": "MATCH_ODDS",
        "bet_count": 2,
        "won_count": 1,
        "loss_count": 1,
        "pending_count": 0,
        "refund_count": 0,
        "total_stake": 3000,
        "total_pl": 50,           // sum of individual bet P/Ls
        "total_released": 1000,   // hedge releases (informational)
        "total_locked": 0,        // negative for currently-locked pending bets
        "net_wallet_impact": 50,  // = total_pl + total_locked
        "bet_ids": [94, 95]
      }
    ],
    "totals": { /* same fields, summed across events */ }
  }
}
```

#### Why `net_wallet_impact = total_pl + total_locked` (and **not** + released)

A hedge release is the **offset of an earlier bet's lock**, not free
money. Adding it again would double-count. Sum of individual per-bet
P/Ls already equals the actual market net. `released` is exposed
purely for transparency so an admin can see "this market had hedging
activity worth N".

### 5.9 Frontend tabs

The frontend page (`d99-admin/src/pages/reports/user-bet-history.jsx`)
exposes two tabs over the same payload:

- **Bet Wise** — the detailed `data[]` array, one row per bet, with
  pagination
- **Event Wise** — the `summary.by_event` array, one row per
  market, with a TOTAL footer

The backend returns both in a single response, no extra round-trip.

---

## 6. Verification recipes

### 6.1 Sanity check a single user's wallet

For any user, this script verifies that the wallet matches the sum of
ledger amounts plus any unlogged direct wallet writes:

```js
import sequelize from './config/db.js';
import CreditsLedger from './model/user/CreditsLedger.js';
import Wallet from './model/admin/Wallet.js';

const userId = '<id>';
const wallet = await Wallet.findOne({ where: { user_id: userId }, raw: true });
const ledger = await CreditsLedger.findAll({
  where: { user_id: String(userId) },
  order: [['created_at', 'ASC'], ['id', 'ASC']],
  raw: true,
});

let cum = 0;
for (const l of ledger) cum += parseFloat(l.amount) || 0;
console.log('ledger amount sum :', cum);
console.log('wallet.cash       :', wallet.cash);
console.log('diff (positive = unlogged credit, negative = unlogged debit) :',
            (parseFloat(wallet.cash) - cum).toFixed(2));
```

A non-zero diff is **expected** when the user has any winning FAN bets
or any hedge bet — those flow through paths that under-report `amount`.
Use the closing-column trail instead:

```js
const last = ledger[ledger.length - 1];
console.log('last closing      :', last.closing);
console.log('wallet.cash       :', wallet.cash);
// these should match
```

### 6.2 Verify a single bet's lifetime cash impact

For each bet, the bet's true wallet impact is

```
last_closing_for_bet − wallet_just_before_first_entry_for_bet
```

You read `last_closing_for_bet` from the latest CreditsLedger row linked
by `bet_id`. You read the `prev_closing` from the entry immediately
before it in the user's chronological ledger.

### 6.3 Verify a sports session result against the upstream

```bash
curl -sS "https://diamond-result-v2.avrkhub.in/get_result?gmid=<eventid>&sid=4" \
  | jq '.markets[] | select(.marketName | test("<line keyword>"; "i"))
        | {marketName, mname, winnerName, winnerId, status}'
```

`winnerId` is the actual numeric result (runs / wickets). Apply the
strict-inequality rule from §5.4 to know if a yes/no bet should have
won or lost.

### 6.4 Verify the user-bet-history endpoint with a token

```bash
# generate an OWNER token from a node script that has access to JWT_SECRET
node -e "
import jwt from 'jsonwebtoken';
import 'dotenv/config';
console.log(jwt.sign({
  role: 'OWNER', username: '<owner_username>',
  actor:   { type: 'OWNER', id: <owner_id> },
  account: { type: 'OWNER', id: <owner_id> },
}, process.env.JWT_SECRET, { expiresIn: '1h' }));
" > /tmp/tok.txt

TOKEN=$(cat /tmp/tok.txt)
curl -sS "https://apidiamond99.codefactory.games/api/admin/reports/user-bet-history?username=<user>&page=1&limit=25" \
  -H "Authorization: Bearer $TOKEN" | jq '{summary: .summary, data: .data}'
```

For each settled bet in `data`, confirm `credit − debit === profit_loss`.
For each entry in `summary.by_event`, confirm
`net_wallet_impact === total_pl + total_locked`.

---

## 7. Worked example — `testuser` (id 19)

This is the trace we used while building the closing-delta and
event-summary logic. It exercises every special case.

Initial wallet: **5000**.

### 7.1 Chronological CreditsLedger

| id | time | reason | amount | closing | bet |
| --- | --- | --- | --- | --- | --- |
| 116 | 16:04 | `bet_placed` | -1000 | 4000 | 94 — BACK MO 1.41 stake 1000 |
| 117 | 16:06 | `bet_placed` | 0 | 5000 | 95 — LAY MO 1.18 stake 2000 (hedge) |
| 118 | 16:06 | `exposure_release` | +1000 | 5000 | 95 |
| 120 | 16:13 | `bet_placed` | -100 | 4900 | 97 — BACK 6 Over Bookmaker 65 |
| 122 | 16:25 | `bet_placed` | -100 | 4800 | 99 — BACK BM 42 |
| 123 | 16:26 | `bet_placed` | -41 | 4759 | 100 — LAY BM2 41.5 |
| 124 | 16:27 | `bet_placed` | -100 | 4659 | 101 — yes Normal 188 |
| 125 | 16:28 | `bet_placed` | -100 | 4559 | 102 — yes Normal 65 |
| 127 | 16:37 | `test` (settle) | 0 | 4559 | 102 (loss, no cash impact) |
| 129 | 16:53 | `test` (settle) | +100 | 4759 | 101 (won, only profit in `amount`) |
| 138 | 18:37 | `settlement` | +50 | 4809 | 94 (market net for MO bets 94+95) |
| 139 | 18:37 | `settlement` | +142 | 4951 | 99 (won) |
| 140 | 18:37 | `settlement` | 0 | 4951 | 100 (loss) |
| 142 | 20:22 | `bet_placed` | -100 | 4851 | 107 — BACK MO 100 (later bet) |

`sum(amount) = -2249`. `5000 + (-2249) = 2751`. **Wrong** — the wallet
is actually 4851. The 2100 gap is exactly the under-reporting on the
two FAN per-bet rows (129 should have been +200 not +100, and the bulk
exposure releases were never written as ledger rows). Closing-delta
trail recovers the truth: walking the `closing` column step by step
ends at 4851.

### 7.2 Bet Wise tab (per-bet derivation)

| bet | type@odds | market | stake | liab | status | debit | credit | released | P/L | exp_held | closing |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107 | back@100 | MATCH_ODDS | 100 | 100 | pending | 100 | 0 | 0 | 0 | 100 | 4851 |
| 102 | yes@65 | Normal (FAN) | 100 | 100 | loss | 100 | 0 | 0 | -100 | 100 | 4559 |
| 101 | yes@188 | Normal (FAN) | 100 | 100 | won | 100 | 200 | 0 | +100 | 100 | 4659 |
| 100 | lay@41.5 | Bookmaker 2 (BM) | 100 | 41 | loss | 41 | 0 | 0 | -41 | 41 | 4759 |
| 99 | back@42 | Bookmaker (BM) | 100 | 100 | won | 100 | 142 | 0 | +42 | 100 | 4800 |
| 97 | back@65 | 6 Over Bookmaker (BM) | 100 | 100 | pending | 100 | 0 | 0 | 0 | 100 | 4900 |
| 95 | lay@1.18 | MATCH_ODDS | 2000 | 360 | loss | 360 | 0 | **1000** | -360 | **0** | 5000 |
| 94 | back@1.41 | MATCH_ODDS | 1000 | 1000 | won | 1000 | 1410 | 0 | +410 | 1000 | 4000 |

Internal row check: for every settled row, `credit − debit === profit_loss`. ✓

### 7.3 Event Wise tab (`summary.by_event`)

| event | market | bets (W/L/P) | stake | P/L | released | locked | net |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SC AUSTRIA vs St Polt | MATCH_ODDS | 0/0/1 | 100 | 0 | 0 | -100 | -100 |
| RR vs RCB | Normal (FAN) | 1/1/0 | 200 | 0 | 0 | 0 | 0 |
| RR vs RCB | Bookmaker 2 (BM) | 0/1/0 | 100 | -41 | 0 | 0 | -41 |
| RR vs RCB | Bookmaker (BM) | 1/0/0 | 100 | +42 | 0 | 0 | +42 |
| RR1/RCB | 6 Over Bookmaker (BM) | 0/0/1 | 100 | 0 | 0 | -100 | -100 |
| RR vs RCB | MATCH_ODDS | 1/1/0 | 3000 | +50 | **1000** | 0 | **+50** |
| **TOTAL** |  | **3/3/2** | **3600** | **+51** | **1000** | **-200** | **-149** |

Wallet check: `5000 + (-149) === 4851` ✓.

Notice that the MO market row has `released = 1000` (informational —
the hedge that bet 95 caused at placement) but `net_wallet_impact = +50`,
**not** +1050. Released is held back from the net so the hedge offset
isn't double-counted against the per-bet P/Ls.

---

## 8. Known wart roundup

These are intentional debt the reporting layers absorb. Fixing any of
them would require changes in `walletUpdate` / `settlementv2.js` and is
out of scope for the reporting endpoints, which is why everything above
exists.

1. **`reason: "test"`** literal in three settlement files — should be
   `"settlement"` / `"bet_won"` / `"bet_lost"`. Reporting tolerates by
   matching `reason in ('test', 'settlement')`.
2. **FAN per-bet settlement row stores only `netamount` in `amount`** —
   the stake refund half goes through `wallet.cash += releaseexposure`
   without its own ledger row. Closing-delta absorbs it.
3. **Hedge `bet_placed` and `exposure_release` rows share the same
   `closing`** because `wallet.save()` is called once per `walletUpdate`.
   Closing-delta still works because the pair sums to the right delta.
4. **Strict yes/no inequality** at session settlement — equality
   (`actual === line`) marks both yes and no as LOSS. By design but
   worth flagging if a "push" rule is ever requested.
5. **`closing` column on entry 117 in the worked example reads 5000**
   even though the wallet was 4000 at that exact instant. That's
   because the ledger row is written *after* the wallet save. Per-row
   closing values are only meaningful as part of the chronological
   trail; reading a single hedge `bet_placed` row in isolation will
   look weird. The closing-delta pass and the per-bet "first ledger
   entry's closing" lookup both handle this correctly.
