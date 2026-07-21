# BetLock Routes - Manual Testing Guide

This file contains dummy data and cURL commands to manually test all bet lock routes.

## Setup
1. Ensure the d247-server is running on `http://localhost:5000` (or your configured port)
2. Admin authentication token should be included in the `Authorization` header

---

## 🧪 Test Scenarios with Dummy Data

### Test 1: Get All Bet Locks
**Endpoint:** `GET /api/admin/betlock/`
**Description:** Fetch all users' bet lock records

```bash
curl -X GET http://localhost:5000/api/admin/betlock/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "All bet locks retrieved",
  "data": [
    {
      "id": 1,
      "user_id": 101,
      "MatchOdds": true,
      "OtherMarkets": false,
      "createdAt": "2025-01-10T10:30:00Z",
      "updatedAt": "2025-01-10T10:30:00Z"
    },
    {
      "id": 2,
      "user_id": 102,
      "MatchOdds": false,
      "OtherMarkets": true,
      "createdAt": "2025-01-10T10:31:00Z",
      "updatedAt": "2025-01-10T10:31:00Z"
    }
  ],
  "count": 2
}
```

---

### Test 2: Get Single User's Bet Lock Status
**Endpoint:** `GET /api/admin/betlock/:user_id`
**Description:** Get a specific user's lock status

```bash
# Example: Get lock status for user 101
curl -X GET http://localhost:5000/api/admin/betlock/101 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Expected Response (200) - User Found:**
```json
{
  "success": true,
  "message": "Bet lock status retrieved",
  "data": {
    "id": 1,
    "user_id": 101,
    "MatchOdds": true,
    "OtherMarkets": false,
    "createdAt": "2025-01-10T10:30:00Z",
    "updatedAt": "2025-01-10T10:30:00Z"
  }
}
```

**Expected Response (200) - User Not Found:**
```json
{
  "success": true,
  "message": "No record found. Default lock = false",
  "data": {
    "user_id": 999,
    "MatchOdds": false,
    "OtherMarkets": false
  }
}
```

---

### Test 3: Lock Single User (Match Odds Only)
**Endpoint:** `POST /api/admin/betlock/lock/user`
**Description:** Lock match odds for a single user

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "user_id": 101,
    "match_odds": true,
    "other_markets": false
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Bet locked/updated successfully",
  "data": {
    "id": 1,
    "user_id": 101,
    "MatchOdds": true,
    "OtherMarkets": false,
    "updatedAt": "2025-01-10T10:35:00Z"
  }
}
```

---

### Test 4: Lock Single User (Both Markets)
**Endpoint:** `POST /api/admin/betlock/lock/user`
**Description:** Lock both match odds and other markets

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "user_id": 102,
    "match_odds": true,
    "other_markets": true
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Bet locked/updated successfully",
  "data": {
    "id": 2,
    "user_id": 102,
    "MatchOdds": true,
    "OtherMarkets": true,
    "updatedAt": "2025-01-10T10:36:00Z"
  }
}
```

---

### Test 5: Lock Single User (Using String Booleans)
**Endpoint:** `POST /api/admin/betlock/lock/user`
**Description:** Lock with string boolean values "true"/"false" or numeric 0/1

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "user_id": 103,
    "match_odds": "true",
    "other_markets": "1"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Bet locked/updated successfully",
  "data": {
    "id": 3,
    "user_id": 103,
    "MatchOdds": true,
    "OtherMarkets": true,
    "updatedAt": "2025-01-10T10:37:00Z"
  }
}
```

---

### Test 6: Lock Single User (Error - Missing user_id)
**Endpoint:** `POST /api/admin/betlock/lock/user`
**Description:** Error case - user_id is required

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "match_odds": true
  }'
```

**Expected Response (200 with error):**
```json
{
  "success": false,
  "error": "user_id is required"
}
```

---

### Test 7: Unlock Single User
**Endpoint:** `POST /api/admin/betlock/unlock/user`
**Description:** Unlock both match odds and other markets for one user

```bash
curl -X POST http://localhost:5000/api/admin/betlock/unlock/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "user_id": 101
  }'
```

**Expected Response (200) - User Updated:**
```json
{
  "success": true,
  "message": "Bet unlocked successfully",
  "data": {
    "id": 1,
    "user_id": 101,
    "MatchOdds": false,
    "OtherMarkets": false,
    "updatedAt": "2025-01-10T10:40:00Z"
  }
}
```

**Expected Response (200) - User Not Found (Creates Default):**
```json
{
  "success": true,
  "message": "User was not locked. Default state applied.",
  "data": {
    "id": 99,
    "user_id": 999,
    "MatchOdds": false,
    "OtherMarkets": false,
    "createdAt": "2025-01-10T10:41:00Z"
  }
}
```

---

### Test 8: Lock Multiple Users
**Endpoint:** `POST /api/admin/betlock/lock/multiple`
**Description:** Lock multiple users in a single request

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
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
  }'
```

**Expected Response (200):**
```json
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

### Test 9: Lock Multiple Users (With Partial Failures)
**Endpoint:** `POST /api/admin/betlock/lock/multiple`
**Description:** Lock multiple users - some fail, some succeed

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
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
  }'
```

**Expected Response (200 - with errors):**
```json
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

### Test 10: Lock Multiple Users (Error - Empty Array)
**Endpoint:** `POST /api/admin/betlock/lock/multiple`
**Description:** Error case - empty users array

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "users": []
  }'
```

**Expected Response (200 with error):**
```json
{
  "success": false,
  "error": "users array is required and cannot be empty"
}
```

---

### Test 11: Unlock Multiple Users
**Endpoint:** `POST /api/admin/betlock/unlock/multiple`
**Description:** Unlock multiple users in a single request

```bash
curl -X POST http://localhost:5000/api/admin/betlock/unlock/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "user_ids": [101, 102, 103, 201, 202, 203]
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Selected users unlocked successfully",
  "count": 6
}
```

---

### Test 12: Unlock Multiple Users (Error - Empty Array)
**Endpoint:** `POST /api/admin/betlock/unlock/multiple`
**Description:** Error case - empty user_ids array

```bash
curl -X POST http://localhost:5000/api/admin/betlock/unlock/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "user_ids": []
  }'
```

**Expected Response (200 with error):**
```json
{
  "success": false,
  "error": "user_ids array is required and cannot be empty"
}
```

---

### Test 13: Lock All Users' Match Odds
**Endpoint:** `POST /api/admin/betlock/lock/all/matchodds`
**Description:** Lock match odds for ALL users in the system

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/all/matchodds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "All users' MatchOdds locked successfully",
  "count": 1547
}
```

---

### Test 14: Lock All Users' Other Markets
**Endpoint:** `POST /api/admin/betlock/lock/all/othermarkets`
**Description:** Lock other markets for ALL users in the system

```bash
curl -X POST http://localhost:5000/api/admin/betlock/lock/all/othermarkets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "All users' OtherMarkets locked successfully",
  "count": 1547
}
```

---

### Test 15: Unlock All Users
**Endpoint:** `POST /api/admin/betlock/unlock/all`
**Description:** Unlock all users - reset all locks to false

```bash
curl -X POST http://localhost:5000/api/admin/betlock/unlock/all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{}'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "All users unlocked successfully",
  "count": 1547
}
```

---

## 📊 Testing Workflow

### Scenario 1: Emergency Lockdown
```bash
# 1. Lock all match odds
curl -X POST http://localhost:5000/api/admin/betlock/lock/all/matchodds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{}'

# 2. Lock all other markets
curl -X POST http://localhost:5000/api/admin/betlock/lock/all/othermarkets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{}'

# 3. Verify all locked
curl -X GET http://localhost:5000/api/admin/betlock/ \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# 4. Unlock when issue resolved
curl -X POST http://localhost:5000/api/admin/betlock/unlock/all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{}'
```

### Scenario 2: Selective User Lockdown
```bash
# 1. Lock multiple problematic users
curl -X POST http://localhost:5000/api/admin/betlock/lock/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "users": [
      { "user_id": 401, "match_odds": true, "other_markets": false },
      { "user_id": 402, "match_odds": true, "other_markets": false },
      { "user_id": 403, "match_odds": true, "other_markets": false }
    ]
  }'

# 2. Check individual user status
curl -X GET http://localhost:5000/api/admin/betlock/401 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# 3. Unlock specific users
curl -X POST http://localhost:5000/api/admin/betlock/unlock/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "user_ids": [401, 402, 403]
  }'
```

### Scenario 3: Market-Specific Lock
```bash
# 1. Lock only match odds for all users
curl -X POST http://localhost:5000/api/admin/betlock/lock/all/matchodds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{}'

# 2. Users can still bet on other markets
# Verify one user
curl -X GET http://localhost:5000/api/admin/betlock/101 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Expected: MatchOdds = true, OtherMarkets = false
```

---

## ✅ Expected HTTP Status Codes

| Endpoint | Method | Success | Error |
|----------|--------|---------|-------|
| `/betlock/` | GET | 200 | 500 |
| `/betlock/:user_id` | GET | 200 | 500 |
| `/betlock/lock/user` | POST | 200 | 400/500 |
| `/betlock/unlock/user` | POST | 200 | 400/500 |
| `/betlock/lock/multiple` | POST | 200 | 400/500 |
| `/betlock/unlock/multiple` | POST | 200 | 400/500 |
| `/betlock/lock/all/matchodds` | POST | 200 | 500 |
| `/betlock/lock/all/othermarkets` | POST | 200 | 500 |
| `/betlock/unlock/all` | POST | 200 | 500 |

---

## 🔍 Validation Checklist

- [ ] GET all bet locks returns array with count
- [ ] GET single user returns data or default state
- [ ] Lock single user updates/creates record
- [ ] Lock supports string booleans and numbers
- [ ] Unlock single user sets both to false
- [ ] Lock multiple users processes all valid records
- [ ] Lock multiple users reports errors for invalid records
- [ ] Unlock multiple users reduces count correctly
- [ ] Lock all match odds affects all users
- [ ] Lock all other markets affects all users
- [ ] Unlock all resets all locks to false
- [ ] All endpoints return standardized response format
- [ ] Error handling is consistent
- [ ] Response counts are accurate

---

## Notes

- All endpoints use JSON request/response format
- Authentication token required in `Authorization` header
- Timestamps are in ISO 8601 format
- Boolean fields are: `MatchOdds`, `OtherMarkets`
- User IDs should be valid integers
