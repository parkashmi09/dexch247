# 🧪 BetLock Routes - Manual Postman Testing Guide

**Setup Before Testing:**
1. Open Postman
2. Update these values at top:
   - `base_url` = `http://localhost:5000` (or your server URL)
   - `auth_token` = Your admin token (if needed)

---

## ✅ TEST 1: Get All Bet Locks

**What it does:** Fetches all users' bet lock records from database

```
METHOD: GET
URL: http://localhost:5000/api/admin/betlock/

HEADERS:
Authorization: Bearer YOUR_TOKEN

BODY: (Leave empty - GET request)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "All bet locks retrieved",
  "data": [
    {
      "id": 1,
      "user_id": 101,
      "MatchOdds": true,
      "OtherMarkets": false
    }
  ],
  "count": 5
}
```

---

## ✅ TEST 2: Get Single User Lock Status

**What it does:** Check if user 101 is locked or not

```
METHOD: GET
URL: http://localhost:5000/api/admin/betlock/101

HEADERS:
Authorization: Bearer YOUR_TOKEN

BODY: (Leave empty - GET request)

EXPECTED RESPONSE (If user exists):
{
  "success": true,
  "message": "Bet lock status retrieved",
  "data": {
    "id": 1,
    "user_id": 101,
    "MatchOdds": true,
    "OtherMarkets": false
  }
}

EXPECTED RESPONSE (If user NOT found):
{
  "success": true,
  "message": "No record found. Default lock = false",
  "data": {
    "user_id": 101,
    "MatchOdds": false,
    "OtherMarkets": false
  }
}
```

---

## ✅ TEST 3: Get Non-Existent User (999)

**What it does:** Try to get user that doesn't exist

```
METHOD: GET
URL: http://localhost:5000/api/admin/betlock/999

HEADERS:
Authorization: Bearer YOUR_TOKEN

BODY: (Leave empty)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "No record found. Default lock = false",
  "data": {
    "user_id": "999",
    "MatchOdds": false,
    "OtherMarkets": false
  }
}
```

---

## ✅ TEST 4: Lock Single User (Match Odds Only)

**What it does:** Prevent user 101 from betting on match odds only

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/user

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "user_id": 101,
  "match_odds": true,
  "other_markets": false
}

WHAT THIS MEANS:
- user_id: 101 = Affect user ID 101
- match_odds: true = LOCK match odds (cannot bet)
- other_markets: false = Allow other markets (can bet)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "Bet locked/updated successfully",
  "data": {
    "id": 1,
    "user_id": 101,
    "MatchOdds": true,
    "OtherMarkets": false
  }
}
```

---

## ✅ TEST 5: Lock Single User (Both Markets)

**What it does:** Lock user 102 from ALL betting

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/user

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "user_id": 102,
  "match_odds": true,
  "other_markets": true
}

WHAT THIS MEANS:
- user_id: 102 = Affect user ID 102
- match_odds: true = LOCK match odds
- other_markets: true = LOCK other markets (COMPLETE LOCKDOWN)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "Bet locked/updated successfully",
  "data": {
    "id": 2,
    "user_id": 102,
    "MatchOdds": true,
    "OtherMarkets": true
  }
}
```

---

## ✅ TEST 6: Lock User (Other Markets Only)

**What it does:** Prevent user 103 from betting on other markets only

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/user

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "user_id": 103,
  "match_odds": false,
  "other_markets": true
}

WHAT THIS MEANS:
- user_id: 103 = Affect user ID 103
- match_odds: false = ALLOW match odds (can bet)
- other_markets: true = LOCK other markets (cannot bet)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "Bet locked/updated successfully",
  "data": {
    "id": 3,
    "user_id": 103,
    "MatchOdds": false,
    "OtherMarkets": true
  }
}
```

---

## ✅ TEST 7: Lock User (String Booleans)

**What it does:** Test with different data types ("true" text, "1" number)

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/user

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "user_id": 104,
  "match_odds": "true",
  "other_markets": "1"
}

WHAT THIS MEANS:
- "true" as TEXT still works (converts to boolean)
- "1" as TEXT still works (converts to boolean)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "Bet locked/updated successfully",
  "data": {
    "id": 4,
    "user_id": 104,
    "MatchOdds": true,
    "OtherMarkets": true
  }
}
```

---

## ✅ TEST 8: Unlock Single User

**What it does:** Completely unlock user 101 (allow all betting)

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/unlock/user

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "user_id": 101
}

WHAT THIS MEANS:
- user_id: 101 = Affect user ID 101
- Result: MatchOdds = false, OtherMarkets = false (FULLY UNLOCKED)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "Bet unlocked successfully",
  "data": {
    "id": 1,
    "user_id": 101,
    "MatchOdds": false,
    "OtherMarkets": false
  }
}
```

---

## ✅ TEST 9: Unlock Non-Existent User

**What it does:** Unlock user 999 (doesn't exist - creates new record)

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/unlock/user

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "user_id": 999
}

EXPECTED RESPONSE:
{
  "success": true,
  "message": "User was not locked. Default state applied.",
  "data": {
    "id": 99,
    "user_id": 999,
    "MatchOdds": false,
    "OtherMarkets": false
  }
}
```

---

## ✅ TEST 10: Lock Multiple Users

**What it does:** Lock 3 different users with different configurations at once

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/multiple

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "users": [
    {
      "user_id": 201,
      "match_odds": true,
      "other_markets": false
    },
    {
      "user_id": 202,
      "match_odds": false,
      "other_markets": true
    },
    {
      "user_id": 203,
      "match_odds": true,
      "other_markets": true
    }
  ]
}

WHAT THIS MEANS:
- User 201: Lock match odds only
- User 202: Lock other markets only
- User 203: Lock both (complete lockdown)

EXPECTED RESPONSE:
{
  "success": true,
  "message": "3 users processed",
  "count": 3,
  "data": [
    {
      "id": 10,
      "user_id": 201,
      "MatchOdds": true,
      "OtherMarkets": false
    },
    {
      "id": 11,
      "user_id": 202,
      "MatchOdds": false,
      "OtherMarkets": true
    },
    {
      "id": 12,
      "user_id": 203,
      "MatchOdds": true,
      "OtherMarkets": true
    }
  ]
}
```

---

## ✅ TEST 11: Lock Multiple Users (With Error)

**What it does:** Try to lock 3 users, but one is missing user_id (shows partial success)

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/multiple

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "users": [
    {
      "user_id": 301,
      "match_odds": true
    },
    {
      "match_odds": true
    },
    {
      "user_id": 303,
      "match_odds": true
    }
  ]
}

WHAT THIS MEANS:
- User 301: Will lock successfully ✓
- User (no ID): Will FAIL - missing user_id ✗
- User 303: Will lock successfully ✓

EXPECTED RESPONSE:
{
  "success": true,
  "message": "2 users processed",
  "count": 2,
  "data": [
    {
      "id": 20,
      "user_id": 301,
      "MatchOdds": true,
      "OtherMarkets": false
    },
    {
      "id": 21,
      "user_id": 303,
      "MatchOdds": true,
      "OtherMarkets": false
    }
  ],
  "errors": [
    {
      "index": 1,
      "error": "user_id is required"
    }
  ]
}
```

---

## ✅ TEST 12: Unlock Multiple Users

**What it does:** Unlock users 201, 202, 203

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/unlock/multiple

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{
  "user_ids": [201, 202, 203]
}

WHAT THIS MEANS:
- Unlock users with IDs: 201, 202, 203
- All will have MatchOdds=false, OtherMarkets=false

EXPECTED RESPONSE:
{
  "success": true,
  "message": "Selected users unlocked successfully",
  "count": 3
}
```

---

## ✅ TEST 13: Lock ALL Users' Match Odds (EMERGENCY)

**What it does:** Lock EVERYONE's match odds at once (emergency feature)

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/all/matchodds

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{}

WHAT THIS MEANS:
- Affects ALL users in the system
- Sets MatchOdds = true for everyone
- Everyone else's other markets remain unchanged

EXPECTED RESPONSE:
{
  "success": true,
  "message": "All users' MatchOdds locked successfully",
  "count": 1547
}

⚠️ WARNING: This affects 1547 users!
```

---

## ✅ TEST 14: Lock ALL Users' Other Markets (EMERGENCY)

**What it does:** Lock EVERYONE's other markets at once

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/lock/all/othermarkets

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{}

WHAT THIS MEANS:
- Affects ALL users in the system
- Sets OtherMarkets = true for everyone
- Everyone else's match odds remain unchanged

EXPECTED RESPONSE:
{
  "success": true,
  "message": "All users' OtherMarkets locked successfully",
  "count": 1547
}

⚠️ WARNING: This affects 1547 users!
```

---

## ✅ TEST 15: Unlock ALL Users (RESET)

**What it does:** Unlock EVERYONE (complete reset)

```
METHOD: POST
URL: http://localhost:5000/api/admin/betlock/unlock/all

HEADERS:
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

BODY (Copy & Paste this):
{}

WHAT THIS MEANS:
- Affects ALL users in the system
- Sets MatchOdds = false, OtherMarkets = false
- ALL users can bet on everything

EXPECTED RESPONSE:
{
  "success": true,
  "message": "All users unlocked successfully",
  "count": 1547
}

⚠️ WARNING: This affects 1547 users!
```

---

## 📋 Quick Copy-Paste Examples

### SCENARIO: User complained about not being able to bet

**Step 1:** Check their lock status
```
GET http://localhost:5000/api/admin/betlock/101
```

**Step 2:** If locked, unlock them
```
POST http://localhost:5000/api/admin/betlock/unlock/user
Body: {"user_id": 101}
```

---

### SCENARIO: Emergency - System issue, lock all bets

**Step 1:** Lock match odds
```
POST http://localhost:5000/api/admin/betlock/lock/all/matchodds
Body: {}
```

**Step 2:** Lock other markets
```
POST http://localhost:5000/api/admin/betlock/lock/all/othermarkets
Body: {}
```

**Step 3:** Verify all locked
```
GET http://localhost:5000/api/admin/betlock/
```

**Step 4:** When issue resolved, unlock all
```
POST http://localhost:5000/api/admin/betlock/unlock/all
Body: {}
```

---

### SCENARIO: Lock 3 suspicious users

```
POST http://localhost:5000/api/admin/betlock/lock/multiple
Body:
{
  "users": [
    {"user_id": 1001, "match_odds": true, "other_markets": true},
    {"user_id": 1002, "match_odds": true, "other_markets": true},
    {"user_id": 1003, "match_odds": true, "other_markets": true}
  ]
}
```

---

## 🔑 Understanding Lock States

| State | MatchOdds | OtherMarkets | Meaning |
|-------|-----------|--------------|---------|
| ✅ Unlocked | false | false | User can bet on everything |
| 🔒 Partial 1 | true | false | Cannot bet on match odds |
| 🔒 Partial 2 | false | true | Cannot bet on other markets |
| 🚫 Full Lock | true | true | Cannot bet on anything |

---

## ❌ Error Scenarios to Test

### Missing user_id
```
POST http://localhost:5000/api/admin/betlock/lock/user
Body: {"match_odds": true}

RESPONSE:
{
  "success": false,
  "error": "user_id is required"
}
```

### Empty users array
```
POST http://localhost:5000/api/admin/betlock/lock/multiple
Body: {"users": []}

RESPONSE:
{
  "success": false,
  "error": "users array is required and cannot be empty"
}
```

### Empty user_ids array
```
POST http://localhost:5000/api/admin/betlock/unlock/multiple
Body: {"user_ids": []}

RESPONSE:
{
  "success": false,
  "error": "user_ids array is required and cannot be empty"
}
```

---

## 📝 Notes

- All requests need `Content-Type: application/json` header (except GET)
- Authorization header needed if your API requires auth
- User IDs can be any number (101, 102, 999, etc.)
- Booleans: `true` or `false` (lowercase)
- If user doesn't exist, system creates them with default state
- All responses are consistent JSON format

---

**Ready to test? Start with TEST 1! 🚀**
