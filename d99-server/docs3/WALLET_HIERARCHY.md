# Wallet Hierarchy — Concept, Logic & Implementation

## Table of Contents
1. [Core Concept — Peer-to-Peer Borrow Model](#1-core-concept)
2. [Wallet Fields](#2-wallet-fields)
3. [Hierarchy Structure](#3-hierarchy-structure)
4. [Dashboard Metrics — Definitions & Formulas](#4-dashboard-metrics)
5. [Transaction Types](#5-transaction-types)
6. [Rules — What Never Changes](#6-rules)
7. [Loss Scenario — Step by Step](#7-loss-scenario)
8. [Win Scenario — Step by Step](#8-win-scenario)
9. [Propagation Through All Layers](#9-propagation-through-all-layers)
10. [Bugs Fixed & Why](#10-bugs-fixed)
11. [Code Locations](#11-code-locations)

---

## 1. Core Concept

The system is a **peer-to-peer borrow model**. Every entity in the hierarchy
borrows money from their parent and lends it downward. No one creates or
destroys money — every rupee is always traceable to a specific wallet.

```
OWNER
  └── COMPANY
        └── SUPERADMIN
              └── ADMIN
                    └── MASTER
                          └── USER  (places bets)
```

Rules of the model: want to update with like topup model 

- A parent gives cash to a child along with a **Credit Reference** (how much
  was given). This is recorded as `cash_received` on the child's wallet.
- The child can keep some cash and distribute the rest to their own children.
- **P&L is always zero** across the entire chain until a bet is won or lost.
- When a **user loses a bet**, money leaves the system. That loss is visible
  as a negative gap at every layer above. because everybody by default share is 0 , 
- When a **user wins a bet**, money enters the system. That gain is visible
  as a positive surplus at every layer above.
- Moving cash between levels (deposit/withdrawal) does **not** create P&L.
  It only redistributes existing money.

---

## 2. Wallet Fields

| Field | Description | Mutated By |
|---|---|---|
| `inr_balance` | Current total balance in the wallet | Every deposit, withdrawal, bet settlement |
| `cash` | Cash portion of the balance (same as inr_balance for most staff) | Every deposit, withdrawal |
| `cash_received` | **Credit Reference** — how much the parent assigned to this entity | Only the **Credit button** (manual). NEVER by deposits or withdrawals. |
| `profit_loss` | `inr_balance - cash_received` (auto-calculated by DB hook) | Recalculated on every save automatically |
| `verdict` | `'profit'` if profit_loss >= 0, else `'loss'` | Recalculated on every save automatically |
| `totalCommission` | Cumulative commission earned | Settlement workers |

### Key rule on `cash_received`
`cash_received` is a **fixed manual field**. It is the credit limit / reference
amount assigned by the parent at the time of account setup or when the parent
explicitly updates it via the Credit button.

It must **NEVER** be touched by:
- `addCash` (deposit)
- `subtractCash` (withdrawal)
- Bet settlement
- Any automated process

---

## 3. Hierarchy Structure

```
OWNER  (owner_id)
  ├── COMPANY    (staff, parent_id = null,  parent_owner_id = owner_id)
  │     └── SUPERADMIN  (staff, parent_id = company.staff_id)
  │           └── ADMIN  (staff, parent_id = superadmin.staff_id)
  │                 └── MASTER  (staff, parent_id = admin.staff_id)
  │                       └── USER  (user, parent_staff_id = master.staff_id)
  └── MASTER  (can also be direct child of owner, parent_id = null)
        └── USER  (user, parent_staff_id = master.staff_id)
```

Each level only knows about its **direct children** in the credit reference
sense. However, for balance calculations a node must account for the entire
subtree beneath it.

---

## 4. Dashboard Metrics — Definitions & Formulas

These are the computed fields returned by profile endpoints and the list API.

### My Own Fields
| Metric | Formula | Meaning |
|---|---|---|
| `UpperLevelCreditReference` | `cash_received` | How much my parent gave me |
| `AvailableBalance` | `cash` | My own wallet's cash right now |
| `MyProfitLoss` | `0` (always for distributors) | Distributors don't win/lose directly |

### Down Level Fields
| Metric | Formula | Meaning |
|---|---|---|
| `DownLevelOccupyBalance` (`DownOb`) | `SUM(all descendants' inr_balance)` | Total money alive across my entire subtree |
| `DownLevelCreditReference` (`DownCredit`) | `SUM(direct children's cash_received ONLY)` | Total credit I personally gave out |
| `DownLevelProfitLoss` (`DownPL`) | `DownOb - DownCredit` | How much my downline is up or down |

### Aggregate Fields
| Metric | Formula | Meaning |
|---|---|---|
| `TotalMasterBalance` | `AvailableBalance + DownOb` | My cash + everything in my subtree |
| `UpperLevel` | `UpperLevelCreditReference - TotalMasterBalance` | Gap between what I was given and what exists in my chain |

### Critical Distinction: DownOb vs DownCredit scope

```
DownOb     → ALL descendants (recursive, every level down)
DownCredit → DIRECT children ONLY (one level down)
```

**Why?**
If SUPER gave ADMIN 500 (`cash_received=500`), and ADMIN sub-distributed 100
to USER (`cash_received=100`), counting both 500 + 100 = 600 as DownCredit
would **double-count** the 100 (it came out of the 500). The correct
DownCredit for SUPER is 500 — only what SUPER directly gave out.

---

## 5. Transaction Types

| Type | Triggered By | Sender Effect | Receiver Effect |
|---|---|---|---|
| `ADD_CASH` | Parent deposits to child | `inr_balance -=`, `cash -=` | `inr_balance +=`, `cash +=` |
| `SUBTRACT_CASH` | Parent withdraws from child | `inr_balance -=`, `cash -=` | — |
| `COLLECT_CASH` | Parent collects from child (subtract receiver side) | — | `inr_balance +=`, `cash +=` |
| `DEBIT_FOR_CASH` | Sender side of ADD_CASH | `inr_balance -=`, `cash -=` | — |
| `CREDIT_INR` | Manual credit/debit via admin tools | `inr_balance +=` | — |
| `DEBIT_INR` | Manual credit/debit via admin tools | `inr_balance -=` | — |

**`cash_received` is NEVER changed by any transaction type.**

---

## 6. Rules

1. **`cash_received` is immutable** during normal operations (deposits, withdrawals, settlements).
2. **`DownCredit` = direct children only** — never sum all descendants.
3. **`DownOb` = all descendants** — recursive sum of every `inr_balance` in the subtree.
4. **`DownPL` = `DownOb - DownCredit`** — never sum raw `profit_loss` fields.
5. **`subtractCash` must credit the receiver** — when a parent withdraws from a child, the parent's wallet must increase. Otherwise the cash disappears.
6. **Staff `inr_balance` in lists = TotalMasterBalance** — a staff node's "displayed balance" in any list view must include all descendants' balances, not just the raw wallet value.

---

## 7. Loss Scenario — Step by Step

### Setup (everyone P&L = 0)
```
company111 : cash=0,   cash_received=1000   (gave all 1000 to super111)
super111   : cash=500, cash_received=1000   (gave 500 to admin111, kept 500)
admin111   : cash=400, cash_received=500    (gave 100 to user111, kept 400)
user111    : cash=100, cash_received=100    (received 100 from admin111)
```

### Step 1 — user111 loses 100 Rs from a bet
```
user111.inr_balance : 100 → 0
```

### Step 2 — admin111 deposits 100 Rs back to user111 (addCash)
```
admin111.inr_balance : 400 → 300
user111.inr_balance  : 0   → 100
```

### Resulting Dashboard Values
```
Layer 1 (admin111 views user111):
  DownOb      = 100       user111.inr_balance
  DownCredit  = 100       user111.cash_received (direct child)
  DownPL      =   0       user is whole
  TotalMaster = 400       300 + 100
  UpperLevel  = 100       500 - 400  ← the 100 Rs that left the system
  AvailBal    = 300

Layer 2 (super111 views admin111):
  DownOb      = 400       admin111(300) + user111(100)  — ALL descendants
  DownCredit  = 500       admin111.cash_received ONLY   — direct child
  DownPL      = -100      400 - 500
  TotalMaster = 900       500 + 400
  UpperLevel  = 100       1000 - 900  ← same 100 Rs missing
  AvailBal    = 500

Layer 3 (company111 views super111):
  DownOb      = 900       super111(500)+admin111(300)+user111(100)
  DownCredit  = 1000      super111.cash_received ONLY
  DownPL      = -100      900 - 1000  ← same 100 Rs missing
  TotalMaster = 900       0 + 900
  UpperLevel  = 100       1000 - 900
  AvailBal    = 0
```

**The 100 Rs loss propagates as -100 DownPL at every layer above the loser.**

---

## 8. Win Scenario — Step by Step

### Starting from the same Setup

### Step 1 — user111 wins 100 Rs from a bet
```
user111.inr_balance : 100 → 200
```

### Step 2 — admin111 subtracts (collects) 100 Rs from user111 (subtractCash)
```
user111.inr_balance  : 200 → 100
admin111.inr_balance : 300 → 400   ← receiver is credited (fixed bug)
```

### Resulting Dashboard Values
```
Layer 1 (admin111):
  DownOb      = 100       user111 back to 100
  DownCredit  = 100       unchanged
  DownPL      =   0       balanced
  TotalMaster = 500       400 + 100
  UpperLevel  =   0       500 - 500  ← profit collected, chain balanced
  AvailBal    = 400

Layer 2 (super111):
  DownOb      = 500       admin111(400) + user111(100)
  DownCredit  = 500       admin111.cash_received
  DownPL      =   0       500 - 500 balanced
  TotalMaster = 1000      500 + 500
  UpperLevel  =   0       1000 - 1000 balanced
  AvailBal    = 500

Layer 3 (company111):
  DownOb      = 1000      super(500)+admin(400)+user(100)
  DownCredit  = 1000      super111.cash_received
  DownPL      =   0       balanced at every layer
  UpperLevel  =   0       balanced
```

**The win clears the loss. Every layer returns to P&L = 0.**

---

## 9. Propagation Through All Layers

The key identity that makes propagation work:

```
UpperLevel at any node = (sum of UpperLevel values of all descendants) = total Rs lost in the subtree
```

Because:
```
UpperLevel = cash_received - TotalMasterBalance
           = cash_received - (own_cash + DownOb)
```

When 100 Rs is lost anywhere in the subtree, `DownOb` drops by 100 at every
ancestor, so `UpperLevel` increases by 100 at every ancestor. The loss
bubbles up automatically without any explicit propagation code.

---

## 10. Bugs Fixed & Why

### Bug 1 — `addCash` was modifying `cash_received`
**File:** `services/walletService.js`
**Problem:** When a parent deposited cash to a child, the child's `cash_received`
was incorrectly incremented. This inflated `DownCredit` at every ancestor by
the deposit amount, making `DownPL` appear worse by that amount.
**Fix:** `cash_received` is never touched inside `addCash`.

### Bug 2 — `subtractCash` did not credit the receiver
**File:** `services/walletService.js`
**Problem:** When a parent withdrew from a child, only the child's wallet was
debited. The parent's wallet was never credited. The withdrawn cash vanished.
This meant wins could never be "collected" — the profit would disappear from
the chain instead of moving up to the parent.
**Fix:** After deducting from the child, the parent's `inr_balance` and `cash`
are incremented by the same amount. A `COLLECT_CASH` transaction is logged.

### Bug 3 — `DownCredit` summed all descendants instead of direct children
**Files:** `controller/admin/userController.js`,
`services/admin/staffAuthService.js`,
`services/admin/ownerAuthService.js`
**Problem:** `DownCredit` was computed by summing `cash_received` of ALL
descendants. This double-counted sub-distributed credit (e.g. if SUPER gave
ADMIN 500 and ADMIN gave USER 100, DownCredit showed 600 instead of 500).
**Fix:** `DownCredit` only sums `cash_received` of **direct children**.
`DownOb` continues to sum `inr_balance` of all descendants (this was correct).

### Bug 4 — `DownOb` in staffAuthService/ownerAuthService only used direct children
**Files:** `services/admin/staffAuthService.js`,
`services/admin/ownerAuthService.js`
**Problem:** `DownOb` was computed by summing `inr_balance` of direct children
only, missing all deeper descendants.
**Fix:** A recursive BFS collects all descendant staff IDs and their users,
then sums all their `inr_balance` values.

### Bug 5 — List API showed raw staff wallet balance instead of TotalMasterBalance
**File:** `controller/admin/userController.js` — `getUserAllDetails`
**Problem:** The wallet list returned `inr_balance = raw_own_wallet` for staff
entries. This gave a misleading picture (e.g. admin111 showed 300 instead of
400, because the 100 held by user111 was invisible).
**Fix:** For every staff entry in the list result, a BFS computes
TotalMasterBalance (own + all descendants). The returned `inr_balance` and
`profit_loss` reflect this effective balance.

---

## 11. Code Locations

| Feature | File | Function / Section |
|---|---|---|
| Add cash (deposit) | `services/walletService.js` | `addCash` |
| Subtract cash (withdrawal + collect) | `services/walletService.js` | `subtractCash` |
| Wallet creation | `services/walletService.js` | `createWallet` |
| Staff profile / dashboard metrics | `services/admin/staffAuthService.js` | `getProfile` |
| Owner profile / dashboard metrics | `services/admin/ownerAuthService.js` | `getProfile` |
| Staff detail page metrics | `controller/admin/userController.js` | `getStaffDetails` (Step 3 block) |
| Wallet list (all-details) | `controller/admin/userController.js` | `getUserAllDetails` |
| Credit Reference update | `controller/walletController.js` | `updateCreditReference` |
| Wallet model + profit_loss hook | `model/admin/Wallet.js` | `calculateProfitLoss` hook |
| Hierarchy ancestor decrement | `wallet_utility/hierarchyUtility.js` | `decrementAncestorCashReceived` |
