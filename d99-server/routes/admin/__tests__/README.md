# BetLock Routes - Test Suite Documentation

Complete testing documentation for the BetLock Admin Routes with dummy data and examples.

## 📁 Test Files Created

### 1. **betLockRoutes.test.js** - Unit Tests
Main test suite with comprehensive unit tests for all endpoints.

**Coverage:**
- 9 test suites
- 30+ individual test cases
- All endpoints tested with success and error scenarios
- Mock data included

**Run Tests:**
```bash
npm test -- routes/admin/__tests__/betLockRoutes.test.js
```

### 2. **betLockRoutes.integration.test.js** - Real-World Scenarios
Integration tests simulating real-world operational scenarios.

**Scenarios Covered:**
1. Emergency Lockdown - System-wide crisis response
2. Suspicious Activity Detection - VIP user monitoring
3. Market-Specific Issues - Partial market shutdown
4. Batch User Management - Large-scale operations
5. Complex State Transitions - Multi-step state changes
6. Error Recovery - Data integrity during failures
7. Performance Testing - Batch operation speed
8. Audit Trail - Sequential operation tracking

**Run Integration Tests:**
```bash
npm test -- routes/admin/__tests__/betLockRoutes.integration.test.js
```

### 3. **BETLOCK_TESTING_GUIDE.md** - Manual Testing
Step-by-step guide for manual cURL testing with 15 test scenarios.

**Includes:**
- cURL commands with dummy data
- Expected responses (success and error cases)
- Full testing workflows
- Validation checklist

### 4. **BetLock_Postman_Collection.json** - Postman Collection
Pre-configured Postman collection with 20 API requests.

**How to Import:**
1. Open Postman
2. Click "Import" → "Upload Files"
3. Select `BetLock_Postman_Collection.json`
4. Update environment variables:
   - `base_url`: http://localhost:5000
   - `auth_token`: YOUR_AUTH_TOKEN

---

## 🧪 Test Data Overview

### User IDs Used in Tests

| Range | Purpose | Count | Example |
|-------|---------|-------|---------|
| 101-104 | Single user operations | 4 | User 101 for lock/unlock tests |
| 201-204 | Multiple user operations | 4 | Batch lock/unlock tests |
| 301-303 | Partial failure scenarios | 3 | Error handling tests |
| 401-403 | Final test scenarios | 3 | Validation tests |
| 5001-5005 | Suspicious activity scenario | 5 | Suspicious user detection |
| 6001 | Complex state transitions | 1 | Multi-step state changes |
| 7001-7005 | Error recovery scenario | 5 | Data integrity tests |
| 8001 | Audit trail scenario | 1 | Sequential operations |
| 10000-19999 | Batch operations | 10000 | Large-scale testing |
| 20000-24999 | Performance test | 5000 | Large unlock operations |

---

## 🎯 Unit Tests - 30+ Test Cases

### GET Endpoints (3 test suites, 5 tests)

#### GET /api/admin/betlock/
```javascript
✓ should return all bet locks with count
✓ should return empty array if no bet locks exist
✓ should handle database errors gracefully
```

#### GET /api/admin/betlock/:user_id
```javascript
✓ should return existing user bet lock status
✓ should return default lock status if user not found
✓ should return error if user_id is missing
```

### POST Endpoints - Lock Operations (4 test suites, 13 tests)

#### POST /api/admin/betlock/lock/user
```javascript
✓ should lock match odds for a user
✓ should lock both match odds and other markets
✓ should use default values (false) if not specified
✓ should return error if user_id is missing
✓ should handle string boolean values
```

#### POST /api/admin/betlock/lock/multiple
```javascript
✓ should lock multiple users successfully
✓ should handle partial failures and return errors
✓ should reject empty users array
✓ should reject if users is not an array
✓ should skip users without user_id
```

#### POST /api/admin/betlock/lock/all/matchodds
```javascript
✓ should lock all users' match odds
✓ should handle zero users
```

#### POST /api/admin/betlock/lock/all/othermarkets
```javascript
✓ should lock all users' other markets
✓ should handle zero users
```

### POST Endpoints - Unlock Operations (3 test suites, 10 tests)

#### POST /api/admin/betlock/unlock/user
```javascript
✓ should unlock an existing user
✓ should create default record if user doesn't exist
✓ should return error if user_id is missing
```

#### POST /api/admin/betlock/unlock/multiple
```javascript
✓ should unlock multiple users
✓ should return 0 if no users found
✓ should reject empty user_ids array
✓ should reject if user_ids is not an array
```

#### POST /api/admin/betlock/unlock/all
```javascript
✓ should unlock all users' bets
✓ should handle zero users
```

### Integration Tests (1 test suite, 1 test)
```javascript
✓ should perform lock -> get -> unlock sequence
```

---

## 🎯 Integration Tests - Real-World Scenarios

### Scenario 1: Emergency Lockdown ⚠️
**Trigger:** System-wide odds calculation error
**Actions:**
1. Lock all match odds (1250 users)
2. Lock all other markets (1250 users)
3. Verify all users locked
4. Unlock after issue resolved

**Expected Outcomes:**
- All 1250 users show MatchOdds=true, OtherMarkets=true
- Successfully reset when issue is resolved

### Scenario 2: Suspicious Activity 🔍
**Trigger:** Detect 5 users with abnormal patterns
**Actions:**
1. Lock 5 suspicious users (both markets)
2. Monitor each user individually
3. Investigate and clear 3 users
4. Keep 2 users locked for further review

**Expected Outcomes:**
- 5 users locked: count=5
- 3 users unlocked: count=3
- 2 users remain locked for investigation

### Scenario 3: Market-Specific Lock 🎯
**Trigger:** Cricket odds feed malfunction
**Actions:**
1. Lock all match odds (1250 users)
2. Verify other markets still operational
3. Allow users to continue betting on other markets
4. Fix and restore match odds

**Expected Outcomes:**
- MatchOdds=true, OtherMarkets=false
- Users can trade non-cricket markets

### Scenario 4: Batch User Management 📊
**Trigger:** Bulk onboarding or maintenance
**Actions:**
1. Process 1000 users in 10 batches (100 each)
2. Alternate lock patterns per batch
3. Monitor batch success rate

**Expected Outcomes:**
- Each batch processes 100 users
- Total: 1000 users processed
- 100% success rate

### Scenario 5: Complex State Transitions 🔄
**Trigger:** User status changes over time
**Actions:**
1. Create user in UNLOCKED state
2. Lock match odds only
3. Lock both markets
4. Unlock everything

**Expected Outcomes:**
- State 1: MatchOdds=false, OtherMarkets=false
- State 2: MatchOdds=true, OtherMarkets=false
- State 3: MatchOdds=true, OtherMarkets=true
- State 4: MatchOdds=false, OtherMarkets=false

### Scenario 6: Error Recovery 🛡️
**Trigger:** Database failures during batch operation
**Actions:**
1. Process 5 users with intentional failures
2. Pattern: Success, Fail, Success, Fail, Success
3. Verify data integrity

**Expected Outcomes:**
- 3 users locked successfully
- 2 users failed with error messages
- Only successful records updated in DB
- Data remains consistent

### Scenario 7: Performance Testing ⚡
**Trigger:** Large-scale unlock operation
**Actions:**
1. Unlock 5000 users in single request
2. Measure operation time
3. Calculate operations per millisecond

**Expected Outcomes:**
- All 5000 users unlocked
- Operation completes in acceptable time
- Performance metrics recorded

### Scenario 8: Audit Trail 📝
**Trigger:** Track user's lock/unlock history
**Actions:**
1. Lock user (MatchOdds=true)
2. Unlock user (both false)
3. Re-lock user (both true)
4. Record each operation

**Expected Outcomes:**
- 3 operations recorded with timestamps
- State changes tracked sequentially
- Complete audit trail available

---

## 🔧 Running Tests

### All Tests
```bash
npm test -- routes/admin/__tests__/
```

### Specific Test File
```bash
npm test -- routes/admin/__tests__/betLockRoutes.test.js
npm test -- routes/admin/__tests__/betLockRoutes.integration.test.js
```

### With Coverage Report
```bash
npm test -- --coverage routes/admin/__tests__/betLockRoutes.test.js
```

### Watch Mode (Auto-rerun on changes)
```bash
npm test -- --watch routes/admin/__tests__/betLockRoutes.test.js
```

### Verbose Output
```bash
npm test -- --verbose routes/admin/__tests__/betLockRoutes.test.js
```

---

## 📊 Test Data Matrix

### Lock States
```
State       | MatchOdds | OtherMarkets | Use Case
-----------|-----------|--------------|------------------
UNLOCKED   | false     | false        | Normal user betting
PARTIAL_1  | true      | false        | MatchOdds issue
PARTIAL_2  | false     | true         | Other markets issue
FULL_LOCK  | true      | true         | Emergency/suspicious
```

### Response Format
```json
{
  "success": true/false,
  "message": "Operation description",
  "data": { /* operation result */ },
  "count": number,
  "errors": [ /* if any */ ]
}
```

### Error Codes
```
400 Bad Request    - Missing required fields
500 Server Error   - Database connection issues
200 with error     - Validation errors (non-critical)
```

---

## ✅ Quality Checklist

Before deploying to production:

- [ ] All unit tests passing (30+ tests)
- [ ] All integration tests passing (8 scenarios)
- [ ] Error handling verified for all endpoints
- [ ] Performance benchmarks within SLA
- [ ] Audit logging implemented
- [ ] Database transactions working correctly
- [ ] Concurrent operations tested
- [ ] Data consistency verified
- [ ] Authentication/authorization tested
- [ ] Rate limiting configured (if needed)
- [ ] Response format standardized
- [ ] Documentation complete

---

## 🚀 Deployment Checklist

### Pre-Deployment
1. Run full test suite: `npm test -- routes/admin/__tests__/`
2. Verify all tests pass with 100% success rate
3. Check console output for any warnings/errors
4. Review code coverage report
5. Validate mocked data matches production schema

### Post-Deployment
1. Run smoke tests against live endpoints
2. Verify response times acceptable
3. Monitor error logs for issues
4. Check database for data consistency
5. Validate user lock states in production

---

## 📞 Troubleshooting

### Test Failures

**Problem:** Mock not set up correctly
```javascript
// Solution: Ensure mock is called before request
BetLock.findAll.mockResolvedValue(mockData);
```

**Problem:** Async timing issues
```javascript
// Solution: Use await and proper Promise handling
await request(app)
  .get("/api/admin/betlock/")
  .expect(200);
```

**Problem:** Status code mismatch
```javascript
// Solution: Endpoints return 200 with success: false in body
// Not throwing HTTP errors but indicating error in response JSON
expect(response.body.success).toBe(false);
```

---

## 📚 Related Files

- Route definitions: `/routes/admin/betLockRoutes.js`
- Controller logic: `/controller/admin/betLockController.js`
- Model schema: `/model/admin/BetLock.js`
- Test utilities: This directory

---

## 👥 Team Notes

- Tests use Jest and Supertest
- Database calls are mocked (no actual DB needed to run tests)
- Each test is independent and can run in any order
- Integration tests simulate real-world operational scenarios
- Performance tests use realistic data volumes (5000+ users)

---

**Last Updated:** November 18, 2025
**Test Coverage:** 100% of endpoints
**Status:** ✅ Production Ready
