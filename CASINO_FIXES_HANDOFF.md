# Casino fixes — portable handoff

Every fix below was found and verified on a live Diamond-family casino feed on
2026-07-27, each one confirmed with real bets settled end-to-end (placement →
exposure rows → settlement → credits ledger), not by code review alone.

**UI/layout fixes are deliberately excluded** — only logic, money and data-contract
changes are here. Component names are given as *examples of where the logic lived*;
port the rule, not the file.

Assumed architecture (adjust names to your codebase):

| role | file here |
|---|---|
| per-runner exposure registry | `helper/casinoMarketBook.js` |
| bet placement + exposure writing | `services/CasinoService.js` → `placeBet` |
| placement validation / odds pinning | `controller/casino/casinoController.js` → `placeBet` |
| settlement resolvers | `casinobet/settlementCasinoWorker.js` |

---

## 0. Two diagnostics that find most of this quickly

**A. "A figure shows under the runner I backed, but nothing on the other runner."**
That is the legacy single-row exposure path — the game is simply missing from the
market registry. It is a one-line registration, never a frontend bug.

**B. "The odds shown / used look like a count, a flag, or a line."**
Several Diamond tables ship **no price at all** in the obvious field. Check what the
number actually means before trusting it as decimal odds (see §3). Getting this wrong
is always a money bug, in one direction or the other.

---

## 1. Per-runner exposure book — games to register

### The mechanism

Instead of one exposure row holding the backed runner's worst case, write **one row
per runner of the market**:

```
back:  backed runner  +stake*(odds-1)      every other runner  -stake
lay:   laid   runner  -stake*(odds-1)      every other runner  +stake
```

Tag all rows of a market with a shared `game_type` of `` `${game}:${marketKey}` `` so
net exposure takes `MIN(exposure)` **within** a market (worst case) and **sums across**
markets. The wallet lock becomes the *marginal* worst case — `|worstAfter| - |worstBefore|`
— which also makes hedges release cash correctly instead of double-locking.

### ⚠️ The exhaustiveness rule — read before registering anything

**Only register a market whose runners are exhaustive** (some runner always wins).
The lock is `MIN` across the rows, so if a real outcome has *no runner*, every row can
look survivable while the punter still loses, and the lock silently under-states risk.

Concrete example — Doli Dana `sumpair` (1-1 … 6-6 Pair). "No pair" is a real outcome
with no runner. Backing all six would book `min(row) = -stake` and lock that, while a
non-pair roll actually loses **6 × stake**. It must stay on the legacy path.

Same reason single Yes/No runners with no complement on the table (e.g. "Any Pair")
stay legacy — the one row they get is already the correct display.

### Registrations

Runner names must be the feed's **exact `nat` values**.

| game id | display name | market key | runners |
|---|---|---|---|
| `teen33` | Instant Teenpatti 3.0 | main | Player A, Player B |
| `teen3` | Instant Teenpatti | main | Player A, Player B |
| `teen41` | Queen Top Open Teenpatti | main | Player A, Player B |
| `teen42` | Jack Top Open Teenpatti | main | Player A, Player B |
| `joker1` | Unlimited Joker One Day | main | Player A, Player B |
| `joker120` | Unlimited Joker 20-20 | main | Player A, Player B |
| `race2` | Race to 2nd | main | Player A, Player B, Player C, Player D |
| `lucky15` | Lucky 15 | main | 0 Runs, 1 Runs, 2 Runs, 4 Runs, 6 Runs, Wicket |
| `btable2` | Bollywood Casino 2 | main | Don, Amar Akbar Anthony, Sahib Bibi Aur Ghulam, Dharam Veer, **Kis Kis ko Pyaar Karoon**, Ghulam |
| `poison` | Teenpatti Poison One Day | main / oddeven / colour / suit | see below |
| `dolidana` | Doli Dana | main / sumtotal / oddeven / lucky7 | see below |

**`poison`** — four independent markets on one table (feed separates by `subtype`;
result is `"Player A#Odd#Red#Diamond"`). Register as four separate keys so each gets
its own `game_type`; they settle independently and their liabilities must **sum**:

- `main` — Player A, Player B
- `oddeven` — Poison Even, Poison Odd
- `colour` — Poison Red, Poison Black
- `suit` — Poison Spade, Poison Heart, Poison Diamond, Poison Club
- **not registered:** the `sumpair`-style groups and any single Yes/No runner

**`dolidana`** — two dice; result `"Player B#No#-#8#Even#Greater than 7"`:

- `main` — Player A, Player B
- `sumtotal` — Sum Total 2 … Sum Total 12 (all 11 — exhaustive)
- `oddeven` — Odd, Even
- `lucky7` — Lucky 7, Greater than 7, Less than 7
- **not registered:** `sumpair` (1-1 … 6-6 Pair) and `anypair` — see the rule above

**`btable2` casing gotcha:** `btable` sends `Kis Kis **Ko** Pyaar Karoon`, `btable2`
sends `Kis Kis **ko**`. Matching is case-insensitive, but the row is *written* under
the registry's spelling — so give btable2 its own list with its own feed casing rather
than sharing btable's, or the book only displays via a `toLowerCase()` fallback.

### Games verified as already correct — do not "fix"

`teen32` (Instant Teenpatti 2.0), `teen6`, `sicbo`/`sicbo2`.

**Name-collision trap:** three different tables read as "Instant Teenpatti" —
`teen3` = "Instant Teenpatti", `teen32` = "…2.0", `teen33` = "…3.0". `teen6` renders as
"Teenpatti - 2.0", a fourth game. Always map the **exact header text** to a game id
before touching anything.

---

## 2. Duplicate runner names on one table (`teen`, `teen62`)

`teen` (Teenpatti 1-day) and `teen62` (V VIP Teenpatti 1-day) quote **"Player A" /
"Player B" twice**: Main (`subtype: teen`, sids 1/2, `etype: match`) and Consecutive
(`subtype: con`, sids 17/18, `etype: fancy1`). They are distinguished only by mtype.

This one fact causes three separate symptoms. Fix all three:

**(a) Exposure collision.** Both markets wrote to the same `team_name: "Player A"` row,
so a Main bet and a Consecutive bet on the same player merged into one figure. In
`placeBet`, for these games only:

- `mtype === "match"` → treat as the two-way book `["Player A", "Player B"]`
- otherwise (Consecutive) → keep the legacy single row, but **namespace the
  `team_name` as `"<runner> Consecutive"`**

Consecutive is an independent Yes/No *per player*, **not** a two-way book — both
players can be consecutive or not independently, so it must not be booked.

**(b) The book lookup must not fall back.** The Consecutive display must read
`"<runner> Consecutive"` and **must not** fall back to the bare runner name — that
fallback is what makes both rows show the Main market's figure.

**(c) False "Game Suspended" on an open market.** Placement buffers typically resolve
the live row as `find(s => s.sid === selSid) || find(s => s.nat === selName)`. With a
duplicated nat, that fallback can land on the *other* market's row, which is often in
the opposite state — reporting suspended for a market that is open. Make the fallback
also match `subtype`.

---

## 3. Price / data-contract bugs (the expensive ones)

For each, the field being used as "decimal odds" was not a price at all.

### 3.1 `ab3` — ANDAR BAHAR 50 CARDS · every win paid **0 profit**

Per-card `child[]` entries carry **no price**:
- `child[].b` = 0/1 flag, "is this side currently bettable"
- `child[].l` = how many of that rank remain in the shoe

The table sent `b` (the flag) as odds → bets booked at odds 1 → win paid
`stake × (1-1)` = **0**. Player got the stake back and nothing else.

**Fix:** price is a flat **2.0** (rules pay "100% of the bet amount"). Confirmed in the
feed: `sub[0].b` reads `2` whenever the market is OPEN, `0` while suspended. Keep `b`
as the availability gate and keep displaying `l` (the shoe count) on the card.

### 3.2 `ab4` — ANDAR BAHAR 150 CARDS · wins paid **up to 11× too much**

Same table shape; here the client sent `l` (the shoe count, 12 at a fresh shoe) as the
odds → a win early in the shoe paid `stake × (12-1)`. A 100 bet returned **1100**
instead of 100.

**Fix:** same flat **2.0**. Card boxes should still display `l` — that is the shoe
count the real site shows (e.g. `8 9 8 9 7 6 7 8 7 10 8 9 8`), and it is *not* the price.

**Also pin server-side** for both games — `if (['ab3','ab4'].includes(gameName)) odds = 2;`
before computing exposure — so a cached browser cannot book a bogus price. Verified by
posting `odds: 9` and seeing `2.00` stored.

A rank with `l === 0` is exhausted and must not accept a bet.

### 3.3 SuperOver family fancy — the run **line** used as the price

Affects `superover`, `superover2`, `superover3`, `cricketv3` (shared market component).

A Fancy (session) section quotes a **line** and a **rate**, not a decimal:
- `odds` (in the odds array) = the LINE, e.g. `12` runs — **not a price**
- `size` = the RATE in bps, e.g. back `75` / lay `85`

Passing the line through booked a bet at odds 12: a **100 lay locked 600** instead of
the ~85 the rate quotes; a winning back would have paid 1100.

**Fix:** convert the rate to a decimal — `decimal = rate/100 + 1`. That keeps the whole
existing back/lay pipeline correct with no settlement special-casing, because
`stake × (decimal-1) === stake × rate/100`:

```
back wins → +stake × rate/100     lay loses → -stake × rate/100
lay  wins → +stake                back loses → -stake
```

Display convention is unchanged: **line big, rate small**.

**Critical companion fix:** any placement buffer that re-reads odds during its
confirmation window will overwrite your converted decimal with the raw line again.
It must know this is a session-rate market and re-derive from `size`. Mark the bet
item (e.g. `_sessionRate: true`) and branch on it.

### 3.4 `mogambo` — "3 Card Total": **three compounding bugs**

The main Mogambo vs Daga/Teja market is fine (genuine decimal odds). The Fancy2 line
market was broken three ways at once:

- feed: `b`/`l` = the **line** (e.g. 27), `bbhav`/`lbhav` = the **rates** (95 / 115)

1. The **line was sent as the price** → back would pay `stake × 26`.
2. The selection was **tagged with the rate**, storing `"3 Card Total 95"` when it meant
   `"3 Card Total 27"`. (The tag records the line so settlement can compare against it.)
3. Settlement tested for an **exact hit** (`want === total`).

Combined these were deterministic, not merely inaccurate: `want` was 95, a 3-card total
can never exceed 39, so the equality was always false — **every back lost and every lay
won, every round**. A lay of 100 locked 2600 and won 100 every time.

**Fix:**
- price = `bhav/100 + 1` (back from `bbhav`, lay from `lbhav`)
- tag the selection with the **line** from `b`/`l`
- settlement becomes an over/under: **back wins when `total >= line`**, lay when below
- add the same placement-buffer guard as §3.3

**How the direction was established** (do the same check if your feed differs): the line
tracks the cards already showing. With `9SS,JDD` on the table (9 + 11 = 20) the line was
27 — exactly the midpoint of `20 + (1..13)` — which is why the rates sit near even money.
That round finished at 29. Card values are A=1 … K=13, confirmed against results
(`QSS,3HH,6HH` → `rdesc "Daga/Teja#21"` = 12+3+6).

---

## 4. Settlement resolver bugs

### 4.1 `teenunique` — Unique Teenpatti · **every bet paid out unconditionally**

The resolver settled on `rdesc === "Won"`. That field is a **constant** — verified
across a dozen rounds, every one returns `rdesc "Won"`, `win "0"`, `winnat "Result"`.
So every back bet won regardless of the cards.

It also cannot work in principle: the player picks 3 of 6 positions and the other 3 go
to the opponent, so two players holding complementary halves of the same six cards must
get **opposite** results. No round-level Won/Lost can express that.

**Fix:** compute the winner from `card` + the player's selected positions (both already
stored — selection is the positions as digits, e.g. `"234"`). Split the six dealt cards
on those positions and compare two 3-card Teenpatti hands.

Ranking used (this vendor's published chart — **confirm against yours**, it differs from
the common international order which puts Trail highest):

```
Straight Flush (pure sequence)  >  Trail  >  Straight  >  Flush  >  Pair  >  High Card
```

Tie-breaks: pair rank then kicker; flush/high-card compared high→low; **A-2-3 is the
LOWEST straight** (score it on a top card of 3); Ace is otherwise high (14).
A dead heat (identical scores — reachable, ranks repeat across suits) → **push/void**.

Impact on this site: 3 of 5 bets ever placed were wrongly paid, ~792 wrongly credited.

### 4.2 `teen41` / `teen42` — exactly-21 push settled as a **double loss**

The Under 21 / Over 21 side line returns three shapes:

```
"B : UNDER 21(16)"   below
"B : OVER 21(22)"    above
"B : (21)"           EXACTLY 21 — no Under/Over word at all
```

The regex required `UNDER|OVER`, so on a 21 it failed to match and returned false for
**both** sides — a push settled as a double loss, taking money from players either way.

**Fix:** make the Under/Over word optional and decide on the **number**:
`total === 21 → void (push)`, else `total < 21` / `total > 21`. Real example round on
this site: `160260724161356`.

**Related:** an unreadable side line used to return "loss". Booking a loss off data you
could not parse is the same class of mistake — return "retry" instead.

### 4.3 `ab20` / `ab3` / `ab4` — bet stuck open forever

When the backed rank never appears in the completed deal, the resolver returned `null`,
which sends the bet back to OPEN to be retried **forever** — permanently stuck with the
stake locked.

**Fix:** return a **push/void**. Safe to decide because the results endpoint **404s while
a round is still running**, so a successful fetch always carries the full deal — a
missing rank is genuinely absent, never "not dealt yet". Confirm that property on your
feed before copying this.

(In practice every rank does get dealt — across real ab4 rounds the last rank to appear
did so by card 25 — so this is a safety net. It also means the published 149th/150th-card
push rules are structurally unreachable.)

### 4.4 `mogambo` — face-down card counted as a value

`parse3Cards` treated the placeholder token `"1"` (an undealt slot) as the **value 1**,
silently under-counting the total. Reject any placeholder and fall back to the reliable
`rdesc` total. Also push (not retry-forever) when a completed round's total is unreadable.

---

## 5. Optional: player-facing undo / void

Only relevant if your tables place bets **immediately on click** (chip = stake, no
confirm step). If so, any "Undo"/"Clear" button that only mutates local state is a lie —
the money is already locked.

**Endpoint:** `POST /casino/casino/undobet`, body `{ gameName, roundId, all }`.

- **Authenticated.** Take `user_id` from the **token, never the body**, and reject a
  non-player account — this moves money.
- Reverse mirrors the settlement void path exactly: `cash -= exposer`, back the bet's
  delta out of its exposure row, close it `status=closed / result_status=void /
  credit_amt=0`. `inr_balance` and P&L untouched; no ledger row.
- `all: true` (Clear) reverses **every** open bet on the round in **one transaction** —
  a half-failed Clear leaves the wallet and exposure rows disagreeing.
- Unwind **bet by bet**, never a blanket `DELETE` of the round's exposure rows (the
  existing one-off void scripts do that; correct for bulk cleanup, destructive here).
- Restrict to the **legacy single-row path** — refuse book-managed markets. A two-way
  market's row is a `min()` over both sides and cannot be un-applied by reversing one
  delta.

### The exploit guard — do not skip this

Refuse the undo unless the round is **still open for betting** (re-fetch the live feed;
require `mid` still matches and `lt > 0`).

Justify it for *your* game before enabling: on Unique Roulette the deck state is fixed
for the whole betting window (the card is drawn only at `lt = 0`), verified by watching
the open-spot count stay constant across a round. So no information reaches the player
between placing and undoing, making an undo exactly as informed as the original bet.
**If your game reveals information mid-round, an undo lets players cancel known losers.**

---

## 6. How to verify (do not trust code review alone)

Every fix above was confirmed this way, and several "obvious" diagnoses turned out wrong
until tested:

1. Place a real bet through the actual placement endpoint.
2. Assert the `user_exposures` rows: correct `team_name`s, correct signs, correct `game_type`.
3. Assert the wallet lock equals the market's worst case (not the sum of stakes).
4. Wait for settlement; assert `result_status` and the `credits_ledger` `profit`/`loss`.
5. For books, bet **both sides** in one round — that catches netting/lock errors a
   single bet hides.
6. For a "deterministic" bug (always wins / always loses), replay historical bets against
   the real result data to quantify the damage before changing anything.

Useful sanity check for a payout table: compute the implied house edge. A blanket 20%
refund on every loss at even money would be +10% EV **to the player** — impossible for a
casino, which is how one misreading of the ab4 rules was caught before shipping.
