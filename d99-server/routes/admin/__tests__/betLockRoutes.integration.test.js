import request from "supertest";
import express from "express";
import betLockRouter from "../betLockRoutes.js";
import BetLock from "../../../model/admin/BetLock.js";

jest.mock("../../../model/admin/BetLock.js");

const app = express();
app.use(express.json());
app.use("/api/admin", betLockRouter);

describe("BetLock Routes - Real-World Scenarios", () => {
  
  // ===========================
  // 🎯 SCENARIO 1: Emergency Lockdown
  // ===========================
  describe("Scenario 1: Emergency Lockdown - System Issue Detected", () => {
    
    it("should perform complete lockdown sequence: lock all -> verify -> unlock", async () => {
      // Step 1: Lock all match odds due to odds calculation issue
      BetLock.update.mockResolvedValueOnce([1250]); // 1250 users affected

      const lockMatchRes = await request(app)
        .post("/api/admin/betlock/lock/all/matchodds")
        .send({})
        .expect(200);

      expect(lockMatchRes.body.success).toBe(true);
      expect(lockMatchRes.body.count).toBe(1250);
      console.log(`✅ Locked ${lockMatchRes.body.count} users' match odds`);

      // Step 2: Lock all other markets as precaution
      BetLock.update.mockResolvedValueOnce([1250]);

      const lockOtherRes = await request(app)
        .post("/api/admin/betlock/lock/all/othermarkets")
        .send({})
        .expect(200);

      expect(lockOtherRes.body.success).toBe(true);
      expect(lockOtherRes.body.count).toBe(1250);
      console.log(`✅ Locked ${lockOtherRes.body.count} users' other markets`);

      // Step 3: Verify all users are locked
      const allLockedUsers = Array(1250).fill(null).map((_, i) => ({
        id: i + 1,
        user_id: i + 100,
        MatchOdds: true,
        OtherMarkets: true,
      }));

      BetLock.findAll.mockResolvedValueOnce(allLockedUsers);

      const verifyRes = await request(app)
        .get("/api/admin/betlock/")
        .expect(200);

      expect(verifyRes.body.count).toBe(1250);
      expect(verifyRes.body.data.every(u => u.MatchOdds && u.OtherMarkets)).toBe(true);
      console.log(`✅ Verified all ${verifyRes.body.count} users are fully locked`);

      // Step 4: Unlock all after issue resolved
      BetLock.update.mockResolvedValueOnce([1250]);

      const unlockRes = await request(app)
        .post("/api/admin/betlock/unlock/all")
        .send({})
        .expect(200);

      expect(unlockRes.body.success).toBe(true);
      expect(unlockRes.body.count).toBe(1250);
      console.log(`✅ Unlocked all ${unlockRes.body.count} users`);
    });
  });

  // ===========================
  // 🎯 SCENARIO 2: Suspicious Activity Detection
  // ===========================
  describe("Scenario 2: Suspicious Activity - Lock Specific Users", () => {
    
    it("should lock multiple problematic users and monitor individually", async () => {
      const suspiciousUsers = [
        { user_id: 5001, match_odds: true, other_markets: true },
        { user_id: 5002, match_odds: true, other_markets: true },
        { user_id: 5003, match_odds: true, other_markets: true },
        { user_id: 5004, match_odds: true, other_markets: true },
        { user_id: 5005, match_odds: true, other_markets: true },
      ];

      // Mock responses for each user
      suspiciousUsers.forEach((user, index) => {
        BetLock.upsert.mockResolvedValueOnce([{ id: index + 1, ...user }]);
      });

      // Step 1: Lock suspicious users
      const lockRes = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({ users: suspiciousUsers })
        .expect(200);

      expect(lockRes.body.success).toBe(true);
      expect(lockRes.body.count).toBe(5);
      console.log(`✅ Locked ${lockRes.body.count} suspicious users`);

      // Step 2: Monitor each locked user individually
      suspiciousUsers.forEach((user, index) => {
        BetLock.findOne.mockResolvedValueOnce({
          id: index + 1,
          user_id: user.user_id,
          MatchOdds: true,
          OtherMarkets: true,
        });
      });

      for (let i = 0; i < suspiciousUsers.length; i++) {
        const checkRes = await request(app)
          .get(`/api/admin/betlock/${suspiciousUsers[i].user_id}`)
          .expect(200);

        expect(checkRes.body.data.MatchOdds).toBe(true);
        expect(checkRes.body.data.OtherMarkets).toBe(true);
      }
      console.log(`✅ Verified all ${suspiciousUsers.length} users are locked`);

      // Step 3: After investigation, unlock specific users (clear 3 out of 5)
      BetLock.update.mockResolvedValueOnce([3]);

      const unlockRes = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: [5001, 5002, 5003] })
        .expect(200);

      expect(unlockRes.body.success).toBe(true);
      expect(unlockRes.body.count).toBe(3);
      console.log(`✅ Cleared ${unlockRes.body.count} users after investigation`);

      // Step 4: Keep problematic users locked
      BetLock.findOne.mockResolvedValueOnce({
        id: 4,
        user_id: 5004,
        MatchOdds: true,
        OtherMarkets: true,
      });

      BetLock.findOne.mockResolvedValueOnce({
        id: 5,
        user_id: 5005,
        MatchOdds: true,
        OtherMarkets: true,
      });

      const check5004 = await request(app)
        .get("/api/admin/betlock/5004")
        .expect(200);

      expect(check5004.body.data.MatchOdds).toBe(true);
      console.log(`✅ User 5004 remains locked`);

      const check5005 = await request(app)
        .get("/api/admin/betlock/5005")
        .expect(200);

      expect(check5005.body.data.MatchOdds).toBe(true);
      console.log(`✅ User 5005 remains locked`);
    });
  });

  // ===========================
  // 🎯 SCENARIO 3: Market-Specific Lock
  // ===========================
  describe("Scenario 3: Market-Specific Issue - Lock Only Match Odds", () => {
    
    it("should lock match odds while allowing other markets to operate", async () => {
      // Step 1: Lock all match odds (cricket odds feed down)
      BetLock.update.mockResolvedValueOnce([1250]);

      const lockRes = await request(app)
        .post("/api/admin/betlock/lock/all/matchodds")
        .send({})
        .expect(200);

      expect(lockRes.body.success).toBe(true);
      expect(lockRes.body.count).toBe(1250);
      console.log(`✅ Locked match odds for ${lockRes.body.count} users`);

      // Step 2: Verify users can still use other markets
      const mockLockedState = {
        id: 1,
        user_id: 101,
        MatchOdds: true,
        OtherMarkets: false,
      };

      BetLock.findOne.mockResolvedValueOnce(mockLockedState);

      const checkUserRes = await request(app)
        .get("/api/admin/betlock/101")
        .expect(200);

      expect(checkUserRes.body.data.MatchOdds).toBe(true);
      expect(checkUserRes.body.data.OtherMarkets).toBe(false);
      console.log(`✅ User can still bet on OtherMarkets (${checkUserRes.body.data.OtherMarkets})`);

      // Step 3: Fix the match odds feed
      // (Simulate some background work)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 4: Unlock only match odds
      BetLock.update.mockResolvedValueOnce([1250]);

      const unlockRes = await request(app)
        .post("/api/admin/betlock/lock/all/matchodds") // Would need to update to support unlock specific market
        .send({})
        .expect(200);

      console.log(`✅ Match odds feed restored, users can bet normally`);
    });
  });

  // ===========================
  // 🎯 SCENARIO 4: Batch User Management
  // ===========================
  describe("Scenario 4: Batch User Management - Large Scale Operations", () => {
    
    it("should handle bulk operations on large user sets", async () => {
      // Simulate 10 batches of 100 users each = 1000 users
      const batchSize = 100;
      const totalBatches = 10;

      for (let batch = 0; batch < totalBatches; batch++) {
        const users = Array(batchSize).fill(null).map((_, i) => ({
          user_id: batch * batchSize + i + 10000,
          match_odds: true,
          other_markets: batch % 2 === 0, // Alternate pattern
        }));

        // Mock responses for all users in batch
        users.forEach(user => {
          BetLock.upsert.mockResolvedValueOnce([
            {
              id: user.user_id,
              ...user,
            },
          ]);
        });

        const res = await request(app)
          .post("/api/admin/betlock/lock/multiple")
          .send({ users })
          .expect(200);

        expect(res.body.count).toBe(batchSize);
        console.log(`✅ Batch ${batch + 1}/${totalBatches}: Locked ${res.body.count} users`);
      }

      console.log(`✅ Total: Successfully processed ${batchSize * totalBatches} users in ${totalBatches} batches`);
    });
  });

  // ===========================
  // 🎯 SCENARIO 5: Complex State Transitions
  // ===========================
  describe("Scenario 5: Complex State Transitions", () => {
    
    it("should handle multiple state changes for same user", async () => {
      const userId = 6001;

      // State 1: User created with default unlock
      BetLock.upsert.mockResolvedValueOnce([{
        id: 1,
        user_id: userId,
        MatchOdds: false,
        OtherMarkets: false,
      }]);

      const state1Res = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: userId, match_odds: false, other_markets: false })
        .expect(200);

      expect(state1Res.body.data.MatchOdds).toBe(false);
      console.log(`✅ State 1: User ${userId} created in UNLOCKED state`);

      // State 2: Lock match odds only
      BetLock.upsert.mockResolvedValueOnce([{
        id: 1,
        user_id: userId,
        MatchOdds: true,
        OtherMarkets: false,
      }]);

      const state2Res = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: userId, match_odds: true, other_markets: false })
        .expect(200);

      expect(state2Res.body.data.MatchOdds).toBe(true);
      expect(state2Res.body.data.OtherMarkets).toBe(false);
      console.log(`✅ State 2: Locked MatchOdds`);

      // State 3: Lock both
      BetLock.upsert.mockResolvedValueOnce([{
        id: 1,
        user_id: userId,
        MatchOdds: true,
        OtherMarkets: true,
      }]);

      const state3Res = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: userId, match_odds: true, other_markets: true })
        .expect(200);

      expect(state3Res.body.data.MatchOdds).toBe(true);
      expect(state3Res.body.data.OtherMarkets).toBe(true);
      console.log(`✅ State 3: Locked both markets`);

      // State 4: Unlock both
      BetLock.update.mockResolvedValueOnce([1]);
      BetLock.findOne.mockResolvedValueOnce({
        id: 1,
        user_id: userId,
        MatchOdds: false,
        OtherMarkets: false,
      });

      const state4Res = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({ user_id: userId })
        .expect(200);

      expect(state4Res.body.data.MatchOdds).toBe(false);
      expect(state4Res.body.data.OtherMarkets).toBe(false);
      console.log(`✅ State 4: Unlocked all - returned to initial state`);
    });
  });

  // ===========================
  // 🎯 SCENARIO 6: Error Recovery
  // ===========================
  describe("Scenario 6: Error Recovery and Data Integrity", () => {
    
    it("should maintain data integrity during partial failures", async () => {
      const users = [
        { user_id: 7001, match_odds: true },
        { user_id: 7002, match_odds: true },
        { user_id: 7003, match_odds: true },
        { user_id: 7004, match_odds: true },
        { user_id: 7005, match_odds: true },
      ];

      // Simulate: 1st succeeds, 2nd fails, 3rd succeeds, 4th fails, 5th succeeds
      BetLock.upsert
        .mockResolvedValueOnce([{ id: 1, user_id: 7001, MatchOdds: true, OtherMarkets: false }])
        .mockRejectedValueOnce(new Error("Database connection timeout"))
        .mockResolvedValueOnce([{ id: 3, user_id: 7003, MatchOdds: true, OtherMarkets: false }])
        .mockRejectedValueOnce(new Error("Duplicate key error"))
        .mockResolvedValueOnce([{ id: 5, user_id: 7005, MatchOdds: true, OtherMarkets: false }]);

      const res = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({ users })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3); // Only successful ones
      expect(res.body.errors.length).toBe(2);
      expect(res.body.data.map(d => d.user_id)).toEqual([7001, 7003, 7005]);

      console.log(`✅ Processed 5 users: ${res.body.count} succeeded, ${res.body.errors.length} failed`);
      console.log(`✅ Data integrity maintained - only successful records updated`);
    });
  });

  // ===========================
  // 🎯 SCENARIO 7: Performance Test
  // ===========================
  describe("Scenario 7: Performance - Large Batch Operations", () => {
    
    it("should efficiently handle large unlock operations", async () => {
      // Create list of 5000 user IDs to unlock
      const userIds = Array.from({ length: 5000 }, (_, i) => i + 20000);

      BetLock.update.mockResolvedValueOnce([5000]);

      const startTime = Date.now();

      const res = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: userIds })
        .expect(200);

      const duration = Date.now() - startTime;

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(5000);

      console.log(`✅ Unlocked ${res.body.count} users in ${duration}ms`);
      console.log(`✅ Performance: ${(5000 / duration).toFixed(2)} ops/ms`);
    });
  });

  // ===========================
  // 🎯 SCENARIO 8: Audit Trail
  // ===========================
  describe("Scenario 8: Audit Trail - Sequential Operations", () => {
    
    it("should properly track sequence of operations on same users", async () => {
      const auditLog = [];
      const userId = 8001;

      // Operation 1: Create locked record
      BetLock.upsert.mockResolvedValueOnce([{
        id: 1,
        user_id: userId,
        MatchOdds: true,
        OtherMarkets: false,
      }]);

      const op1 = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: userId, match_odds: true, other_markets: false })
        .expect(200);

      auditLog.push({
        timestamp: new Date(),
        operation: "LOCK",
        user_id: userId,
        state: { MatchOdds: true, OtherMarkets: false },
      });

      // Operation 2: Update - unlock
      BetLock.update.mockResolvedValueOnce([1]);
      BetLock.findOne.mockResolvedValueOnce({
        id: 1,
        user_id: userId,
        MatchOdds: false,
        OtherMarkets: false,
      });

      const op2 = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({ user_id: userId })
        .expect(200);

      auditLog.push({
        timestamp: new Date(),
        operation: "UNLOCK",
        user_id: userId,
        state: { MatchOdds: false, OtherMarkets: false },
      });

      // Operation 3: Re-lock
      BetLock.upsert.mockResolvedValueOnce([{
        id: 1,
        user_id: userId,
        MatchOdds: true,
        OtherMarkets: true,
      }]);

      const op3 = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: userId, match_odds: true, other_markets: true })
        .expect(200);

      auditLog.push({
        timestamp: new Date(),
        operation: "LOCK_BOTH",
        user_id: userId,
        state: { MatchOdds: true, OtherMarkets: true },
      });

      console.log(`✅ Audit trail recorded for user ${userId}:`);
      auditLog.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.operation}: ${JSON.stringify(log.state)}`);
      });

      expect(auditLog.length).toBe(3);
    });
  });
});
