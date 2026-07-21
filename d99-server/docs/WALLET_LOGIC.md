# Wallet System Logic

This document details the internal logic, calculations, and flows used in the Wallet Service (`d247-server/services/walletService.js`).

## 1. Overview

The Wallet System manages financial balances for Users, Staff, and Owners. It handles three main types of value:
1.  **INR Balance**: The main usable balance.
2.  **Cash**: Represents actual cash deposits.
3.  **Credit**: Represents credit lines given to users.

**Key Principle**: `INR Balance` is often a derived or aggregate value, but in this system, it is explicitly updated alongside Cash and Credit operations.

## 2. User Types & ID Mapping

The system supports multiple user roles. The `WalletService` maps these roles to specific foreign keys in the `Wallets` table.

| User Role | Mapped Field |
|-----------|--------------|
| `USER` | `user_id` |
| `OWNER` | `owner_id` |
| `SUPERADMIN`, `ADMIN`, `COMPANY`, `SUPERMASTER`, `MASTER` | `staff_id` |

*Helper Method*: `getWalletQueryField(userType)`

## 3. Core Operations & Logic

### 3.1 Cash Operations (Recommended)

Used when a user deposits or withdraws actual money.

#### **Add Cash (`addCash`)**
*Flow*: Sender (Staff/Owner) -> Receiver (User)
1.  **Identify Receiver**: Find receiver's wallet using `receiverId` and `userType`.
2.  **Identify Sender**: Find sender's wallet using `senderId` and `senderType`.
3.  **Sender Check (If not OWNER)**:
    *   Check if Sender has sufficient `inr_balance`.
    *   Check if Sender has sufficient `cash`.
    *   **Deduct**: `inr_balance` and `cash` are decreased by `amount`.
    *   *Log*: Record `DEBIT_FOR_CASH` transaction for Sender.
4.  **Receiver Credit**:
    *   **Add**: `inr_balance` and `cash` are increased by `amount`.
    *   *Log*: Record `ADD_CASH` transaction for Receiver.
5.  **Owner Privilege**: If Sender is `OWNER`, no deduction occurs (Unlimited liquidity).

#### **Subtract Cash (`subtractCash`)**
*Flow*: User -> Admin/Staff (Withdrawal)
1.  **Identify Wallet**: Find the target wallet.
2.  **Balance Check**: Ensure `cash` >= `amount`.
3.  **Deduct**: Decrease `cash` and `inr_balance` by `amount`.
4.  **Log**: Record `SUBTRACT_CASH` transaction.

---

### 3.2 Credit Operations (Recommended)

Used when extending credit lines to users.

#### **Add Credit (`addCredit`)**
*Flow*: Sender (Staff/Owner) -> Receiver (User)
1.  **Identify Receiver**: Find receiver's wallet.
2.  **Identify Sender**: Find sender's wallet.
3.  **Sender Check (If not OWNER)**:
    *   Check if Sender has sufficient `inr_balance`.
    *   Check if Sender has sufficient `credit`.
    *   **Deduct**: `inr_balance` and `credit` are decreased by `amount`.
    *   *Log*: Record `DEBIT_FOR_CREDIT` transaction for Sender.
4.  **Receiver Credit**:
    *   **Add**: `inr_balance` and `credit` are increased by `amount`.
    *   *Log*: Record `ADD_CREDIT` transaction for Receiver.
5.  **Owner Privilege**: If Sender is `OWNER`, no deduction occurs.

#### **Subtract Credit (`subtractCredit`)**
*Flow*: User -> Admin/Staff (Revoking Credit)
1.  **Identify Wallet**: Find the target wallet.
2.  **Balance Check**: Ensure `credit` >= `amount`.
3.  **Deduct**: Decrease `credit` and `inr_balance` by `amount`.
4.  **Log**: Record `SUBTRACT_CREDIT` transaction.

---

### 3.3 Direct Balance Operations (Legacy / Not Recommended)

These methods directly manipulate the `inr_balance` without affecting Cash or Credit components. Use with caution.

#### **Credit Balance (`creditBalance`)**
*   **Logic**: `inr_balance = inr_balance + amount`
*   **Transaction Type**: `CREDIT_INR`
*   **Warning**: Does not track source (Cash vs Credit).

#### **Debit Balance (`debitBalance`)**
*   **Logic**: `inr_balance = inr_balance - amount`
*   **Check**: Ensures `inr_balance` >= `amount`.
*   **Transaction Type**: `DEBIT_INR`

## 4. Transaction Types

The system records the following transaction types in the `Transactions` table:

| Type | Description |
|------|-------------|
| `ADD_CASH` | Cash added to wallet. |
| `SUBTRACT_CASH` | Cash removed from wallet. |
| `DEBIT_FOR_CASH` | Sender debited for adding cash to another. |
| `ADD_CREDIT` | Credit added to wallet. |
| `SUBTRACT_CREDIT` | Credit removed from wallet. |
| `DEBIT_FOR_CREDIT` | Sender debited for adding credit to another. |
| `CREDIT_INR` | Direct INR addition (Legacy). |
| `DEBIT_INR` | Direct INR deduction (Legacy). |

## 5. Owner Privileges

The `OWNER` role is special in the Wallet System:
*   **Unlimited Source**: When an Owner adds Cash or Credit to a user, the Owner's wallet is **NOT** debited.
*   **Logic**: The code explicitly checks `if (senderType !== 'OWNER')` before performing sender deductions.
