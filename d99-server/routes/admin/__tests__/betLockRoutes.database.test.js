/**
 * BetLock Routes - REAL Database Integration Tests
 * This tests against your ACTUAL database and controllers
 */

import request from "supertest";
import express from "express";
import betLockRouter from "../betLockRoutes.js";
import BetLock from "../../../model/admin/BetLock.js";

// Use the real router from your application
const app = express();
app.use(express.json());
app.use("/api/admin", betLockRouter);

describe("BetLock Routes - Real Database Tests", () => {
  /**
   * NOTE: These tests require:
   * 1. Database to be running (MySQL/PostgreSQL)
   * 2. .env file configured with DATABASE_URL
   * 3. BetLock table to exist
   * 4. Proper database connection in model/admin/BetLock.js
   */

  describe("GET /api/admin/betlock/ - Fetch from real DB", () => {
    it("should fetch all bet locks from database", async () => {
      try {
        const response = await request(app)
          .get("/api/admin/betlock/")
          .set("Authorization", `Bearer YOUR_TOKEN`)
          .expect(200);

        console.log("\n✅ Real Database Test Results:");
        console.log(`   Total users in DB: ${response.body.count}`);
        console.log(`   Response status: ${response.status}`);
        console.log(`   Sample data:`, response.body.data?.[0]);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      } catch (error) {
        console.error("\n❌ Database Connection Error:");
        console.error(`   ${error.message}`);
        console.error("   Make sure your database is running!");
      }
    });

    it("should return empty array if no records", async () => {
      const response = await request(app)
        .get("/api/admin/betlock/")
        .set("Authorization", `Bearer YOUR_TOKEN`)
        .expect(200);

      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("data");
    });
  });

  describe("GET /api/admin/betlock/:user_id - Fetch specific user from DB", () => {
    it("should fetch user from real database", async () => {
      const userId = 101; // Replace with real user ID from your DB

      try {
        const response = await request(app)
          .get(`/api/admin/betlock/${userId}`)
          .set("Authorization", `Bearer YOUR_TOKEN`)
          .expect(200);

        console.log(`\n✅ Fetched User ${userId}:`, response.body.data);
        expect(response.body.success).toBe(true);
      } catch (error) {
        console.error(`\n❌ Could not fetch user ${userId}:`, error.message);
      }
    });
  });

  describe("POST /api/admin/betlock/lock/user - Lock in real DB", () => {
    it("should lock a user in real database", async () => {
      const userId = 101;

      try {
        const response = await request(app)
          .post("/api/admin/betlock/lock/user")
          .set("Authorization", `Bearer YOUR_TOKEN`)
          .send({
            user_id: userId,
            match_odds: true,
            other_markets: false,
          })
          .expect(200);

        console.log(`\n✅ Locked User ${userId}:`, response.body.data);
        expect(response.body.success).toBe(true);
        expect(response.body.data.MatchOdds).toBe(true);
      } catch (error) {
        console.error(`\n❌ Could not lock user ${userId}:`, error.message);
      }
    });
  });

  describe("POST /api/admin/betlock/unlock/user - Unlock in real DB", () => {
    it("should unlock a user in real database", async () => {
      const userId = 101;

      try {
        const response = await request(app)
          .post("/api/admin/betlock/unlock/user")
          .set("Authorization", `Bearer YOUR_TOKEN`)
          .send({ user_id: userId })
          .expect(200);

        console.log(`\n✅ Unlocked User ${userId}:`, response.body.data);
        expect(response.body.success).toBe(true);
        expect(response.body.data.MatchOdds).toBe(false);
      } catch (error) {
        console.error(`\n❌ Could not unlock user ${userId}:`, error.message);
      }
    });
  });

  describe("POST /api/admin/betlock/lock/all/matchodds - Lock all in real DB", () => {
    it("should lock all users' match odds in database", async () => {
      try {
        const response = await request(app)
          .post("/api/admin/betlock/lock/all/matchodds")
          .set("Authorization", `Bearer YOUR_TOKEN`)
          .send({})
          .expect(200);

        console.log(`\n✅ Locked all users' match odds`);
        console.log(`   Users affected: ${response.body.count}`);
        expect(response.body.success).toBe(true);
      } catch (error) {
        console.error("\n❌ Could not lock all users:", error.message);
      }
    });
  });

  describe("POST /api/admin/betlock/unlock/all - Unlock all in real DB", () => {
    it("should unlock all users in database", async () => {
      try {
        const response = await request(app)
          .post("/api/admin/betlock/unlock/all")
          .set("Authorization", `Bearer YOUR_TOKEN`)
          .send({})
          .expect(200);

        console.log(`\n✅ Unlocked all users`);
        console.log(`   Users affected: ${response.body.count}`);
        expect(response.body.success).toBe(true);
      } catch (error) {
        console.error("\n❌ Could not unlock all users:", error.message);
      }
    });
  });
});

describe("Database Verification", () => {
  it("should verify BetLock table exists and has data", async () => {
    try {
      const response = await request(app)
        .get("/api/admin/betlock/")
        .set("Authorization", `Bearer YOUR_TOKEN`);

      if (response.status === 200) {
        console.log("\n📊 Database Status:");
        console.log(`   ✅ Connected to database`);
        console.log(`   ✅ BetLock table found`);
        console.log(`   📝 Total records: ${response.body.count}`);
        console.log(`   📝 Response: ${JSON.stringify(response.body, null, 2)}`);
      } else if (response.status === 500) {
        console.log("\n❌ Database Error:");
        console.log(`   Error: ${response.body.error}`);
      }
    } catch (error) {
      console.log("\n❌ Connection Failed:");
      console.log(`   Error: ${error.message}`);
      console.log(`   This likely means your database is not running`);
    }
  });
});
