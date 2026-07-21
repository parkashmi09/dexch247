# Platform Commission Implementation

## Overview
Added a 2% platform commission deduction system for all user winning amounts in the settlement worker. When users win bets, the commission is calculated and deducted before settling the final amount to their wallet.

## Configuration
```javascript
const PLATFORM_COMMISSION_PERCENT = 2; // 2% platform commission on winning amount
```

## How It Works

### Step 1: Commission Calculation
A new utility function `calculateCommission()` handles all commission calculations:

```javascript
function calculateCommission(winningAmount) {
  const commission = winningAmount * (PLATFORM_COMMISSION_PERCENT / 100);
  const finalAmount = winningAmount - commission;
  return {
    winningAmount: Math.floor(winningAmount * 100) / 100,  // Gross winning amount
    commission: Math.floor(commission * 100) / 100,         // 2% commission
    finalAmount: Math.floor(finalAmount * 100) / 100        // Final amount after deduction
  };
}
```

### Step 2: Settlement Flow for Winning Bets

#### Before (Old Flow):
```
Winning Amount → Settle to Wallet → Ledger Entry
```

#### After (New Flow):
```
Winning Amount
    ↓
Calculate Commission (2%)
    ↓
├─ Settle Final Amount (98%) to Wallet → Ledger Entry (settlement reason)
└─ Deduct Commission Amount (2%) → Ledger Entry (commission reason)
```

### Step 3: Ledger Entries

Two separate ledger entries are created:

1. **Settlement Entry** (Positive amount)
   - Reason: `settlement`
   - Amount: Final amount after commission deduction
   - Description includes: gross_winning, commission, final_settled
   - Example: Win 1000 → Settle 980, Commission 20

2. **Commission Entry** (Negative amount)
   - Reason: `commission`
   - Amount: Negative commission value
   - Description: Clearly identifies it as platform commission
   - Example: Amount -20 for 2% on 1000

## Affected Functions

### 1. processMobmGroup() - Match Odds/Bookmaker Bets
- Applies commission when `finalCredit > 0`
- Updates both wallet and ledger with commission breakdown
- Logs detailed information about gross/net amounts

### 2. processFanBet() - Fancy Bets
- Applies commission when `credit > 0`
- Same ledger entry pattern as MO/BM
- Tracks commission separately for audit trail

## Example Transaction

### Scenario: User Wins 1000 INR

**Before Settlement:**
- Wallet Balance: 5000

**Calculation:**
- Gross Winning: 1000
- Commission (2%): 20
- Final Amount: 980

**After Settlement:**
- Wallet Balance: 5000 + 980 = 5980

**Ledger Entries Created:**
1. `CreditsLedger` (Settlement):
   - amount: 980
   - reason: "settlement"
   - description: "...gross_winning=1000, commission=20, final_settled=980"

2. `CreditsLedger` (Commission):
   - amount: -20
   - reason: "commission"
   - description: "MO/BM platform commission (2%); bet_id=...; gross_amount=1000; commission=20"

## Logging

Both processes log detailed information at settlement time:

```javascript
log.info(`[Settlement] MO/BM credited with commission`, { 
  bet_id, user_id, 
  gross_winning: 1000,
  commission: 20,
  final_settled: 980,
  balance: 5980  // New wallet balance
});
```

## Database Impact

### CreditsLedger Table
- Additional commission entries with negative amounts
- All entries traceable back to bet via `meta.bet_id`
- Easy to audit: filter by `reason: 'commission'`

### Wallet Table
- Only receives final amount (after commission)
- No change to update logic

### SportsSettlementReport Table
- `credit_amount` continues to reflect gross winning (for reporting purposes)
- Commission details available in ledger entries

## Advantages

✅ **Accurate Commission Tracking**: Every commission is logged separately
✅ **Audit Trail**: Clear record of all deductions
✅ **User Transparency**: Commission details in ledger descriptions
✅ **Flexible**: Easy to change commission percentage from one location
✅ **Isolated Logic**: Centralized calculateCommission() function
✅ **Backwards Compatible**: Doesn't affect loss scenarios or refunds

## Refinement Options

If needed in the future:

1. **Variable Commission Rates**: Pass percentage as parameter
   ```javascript
   calculateCommission(winningAmount, commissionPercent)
   ```

2. **Commission Caps**: Limit maximum commission per bet
   ```javascript
   const maxCommission = 1000; // INR
   const commission = Math.min(calculated, maxCommission);
   ```

3. **User Tiers**: Different commissions for VIP users
   ```javascript
   const commissionRate = getUserCommissionRate(user_id);
   ```

4. **Event-Based Exemptions**: Skip commission for certain markets
   ```javascript
   if (market_type === 'promo') return { winningAmount, commission: 0, finalAmount: winningAmount };
   ```

## Testing

To test the commission system:

1. **Create a winning bet** in test database
2. **Run settlement worker** to process the bet
3. **Check wallet balance** should be increased by (winning - commission)
4. **Check ledger entries**:
   - Find settlement entry with winning amount
   - Find commission entry with negative amount
5. **Verify math**: `final_amount + commission = gross_winning`

### Sample Query
```sql
-- Find all commission entries for a user
SELECT * FROM creditsledgers 
WHERE user_id = 'USER_ID' 
  AND reason = 'commission' 
  AND created_at >= '2025-11-18'
ORDER BY created_at DESC;

-- Calculate total commission deducted
SELECT SUM(ABS(amount)) as total_commission 
FROM creditsledgers 
WHERE user_id = 'USER_ID' 
  AND reason = 'commission';

-- Verify wallet updates
SELECT wallet.inr as current_balance, 
  (SELECT SUM(amount) FROM creditsledgers WHERE user_id = 'USER_ID') as total_transactions
FROM wallet 
WHERE user_id = 'USER_ID';
```

## Notes

- Commission is only deducted on winning bets
- Losing bets are not affected
- Refunded bets bypass commission logic (no commission on refunds)
- Commission percentage is configurable via `PLATFORM_COMMISSION_PERCENT`
- All amounts are rounded to 2 decimal places
