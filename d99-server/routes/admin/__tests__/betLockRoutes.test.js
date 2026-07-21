import request from "supertest";
import express from "express";
import betLockRouter from "../betLockRoutes.js";
import BetLock from "../../../model/admin/BetLock.js";

// Mock the BetLock model
jest.mock("../../../model/admin/BetLock.js");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/admin", betLockRouter);

describe("BetLock Routes - Comprehensive Tests", () => {
  
  // ===========================
  // 🧪 TEST 1: GET ALL BET LOCKS
  // ===========================
  describe("GET /api/admin/betlock/ - Get All Bet Locks", () => {
    
    it("should return all bet locks with count", async () => {
      const mockData = [
        { id: 1, user_id: 101, MatchOdds: true, OtherMarkets: false },
        { id: 2, user_id: 102, MatchOdds: false, OtherMarkets: true },
        { id: 3, user_id: 103, MatchOdds: true, OtherMarkets: true },
      ];

      BetLock.findAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/admin/betlock/")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("retrieved");
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    it("should return empty array if no bet locks exist", async () => {
      BetLock.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/admin/betlock/")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it("should handle database errors gracefully", async () => {
      BetLock.findAll.mockRejectedValue(new Error("Database connection failed"));

      const response = await request(app)
        .get("/api/admin/betlock/")
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Failed to fetch");
    });
  });

  // ===========================
  // 🧪 TEST 2: GET SINGLE USER BET LOCK
  // ===========================
  describe("GET /api/admin/betlock/:user_id - Get Single User Bet Lock", () => {
    
    it("should return existing user bet lock status", async () => {
      const mockUser = {
        id: 1,
        user_id: 101,
        MatchOdds: true,
        OtherMarkets: false,
      };

      BetLock.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/admin/betlock/101")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_id).toBe(101);
      expect(response.body.data.MatchOdds).toBe(true);
      expect(response.body.data.OtherMarkets).toBe(false);
    });

    it("should return default lock status if user not found", async () => {
      BetLock.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/admin/betlock/999")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("No record found");
      expect(response.body.data.MatchOdds).toBe(false);
      expect(response.body.data.OtherMarkets).toBe(false);
    });

    it("should return error if user_id is missing", async () => {
      const response = await request(app)
        .get("/api/admin/betlock/")
        .expect(404);
    });
  });

  // ===========================
  // 🧪 TEST 3: LOCK SINGLE USER
  // ===========================
  describe("POST /api/admin/betlock/lock/user - Lock Single User", () => {
    
    it("should lock match odds for a user", async () => {
      const mockLocked = {
        id: 1,
        user_id: 101,
        MatchOdds: true,
        OtherMarkets: false,
      };

      BetLock.upsert.mockResolvedValue([mockLocked]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: 101, match_odds: true, other_markets: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("locked/updated");
      expect(response.body.data.MatchOdds).toBe(true);
    });

    it("should lock both match odds and other markets", async () => {
      const mockLocked = {
        id: 2,
        user_id: 102,
        MatchOdds: true,
        OtherMarkets: true,
      };

      BetLock.upsert.mockResolvedValue([mockLocked]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({
          user_id: 102,
          match_odds: true,
          other_markets: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.MatchOdds).toBe(true);
      expect(response.body.data.OtherMarkets).toBe(true);
    });

    it("should use default values (false) if not specified", async () => {
      const mockLocked = {
        id: 3,
        user_id: 103,
        MatchOdds: false,
        OtherMarkets: false,
      };

      BetLock.upsert.mockResolvedValue([mockLocked]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: 103 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.MatchOdds).toBe(false);
      expect(response.body.data.OtherMarkets).toBe(false);
    });

    it("should return error if user_id is missing", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ match_odds: true })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("user_id is required");
    });

    it("should handle string boolean values", async () => {
      const mockLocked = {
        id: 4,
        user_id: 104,
        MatchOdds: true,
        OtherMarkets: true,
      };

      BetLock.upsert.mockResolvedValue([mockLocked]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({
          user_id: 104,
          match_odds: "true",
          other_markets: "1",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.MatchOdds).toBe(true);
      expect(response.body.data.OtherMarkets).toBe(true);
    });
  });

  // ===========================
  // 🧪 TEST 4: UNLOCK SINGLE USER
  // ===========================
  describe("POST /api/admin/betlock/unlock/user - Unlock Single User", () => {
    
    it("should unlock an existing user", async () => {
      const mockUnlocked = {
        id: 1,
        user_id: 101,
        MatchOdds: false,
        OtherMarkets: false,
      };

      BetLock.update.mockResolvedValue([1]); // 1 row updated
      BetLock.findOne.mockResolvedValue(mockUnlocked);

      const response = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({ user_id: 101 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("unlocked");
      expect(response.body.data.MatchOdds).toBe(false);
      expect(response.body.data.OtherMarkets).toBe(false);
    });

    it("should create default record if user doesn't exist", async () => {
      const mockCreated = {
        id: 99,
        user_id: 999,
        MatchOdds: false,
        OtherMarkets: false,
      };

      BetLock.update.mockResolvedValue([0]); // 0 rows updated
      BetLock.findOrCreate.mockResolvedValue([mockCreated]);

      const response = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({ user_id: 999 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Default state applied");
    });

    it("should return error if user_id is missing", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("user_id is required");
    });
  });

  // ===========================
  // 🧪 TEST 5: LOCK MULTIPLE USERS
  // ===========================
  describe("POST /api/admin/betlock/lock/multiple - Lock Multiple Users", () => {
    
    it("should lock multiple users successfully", async () => {
      const mockUsers = [
        { id: 1, user_id: 201, MatchOdds: true, OtherMarkets: false },
        { id: 2, user_id: 202, MatchOdds: false, OtherMarkets: true },
        { id: 3, user_id: 203, MatchOdds: true, OtherMarkets: true },
      ];

      BetLock.upsert
        .mockResolvedValueOnce([mockUsers[0]])
        .mockResolvedValueOnce([mockUsers[1]])
        .mockResolvedValueOnce([mockUsers[2]]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({
          users: [
            { user_id: 201, match_odds: true, other_markets: false },
            { user_id: 202, match_odds: false, other_markets: true },
            { user_id: 203, match_odds: true, other_markets: true },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].user_id).toBe(201);
      expect(response.body.data[1].user_id).toBe(202);
    });

    it("should handle partial failures and return errors", async () => {
      BetLock.upsert
        .mockResolvedValueOnce([{ id: 1, user_id: 301, MatchOdds: true, OtherMarkets: false }])
        .mockRejectedValueOnce(new Error("Database error"))
        .mockResolvedValueOnce([{ id: 3, user_id: 303, MatchOdds: true, OtherMarkets: false }]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({
          users: [
            { user_id: 301, match_odds: true },
            { user_id: 302, match_odds: true },
            { user_id: 303, match_odds: true },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBe(1);
    });

    it("should reject empty users array", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({ users: [] })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("cannot be empty");
    });

    it("should reject if users is not an array", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({ users: "not an array" })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("array");
    });

    it("should skip users without user_id", async () => {
      BetLock.upsert
        .mockResolvedValueOnce([{ id: 1, user_id: 401, MatchOdds: true, OtherMarkets: false }])
        .mockResolvedValueOnce([{ id: 3, user_id: 403, MatchOdds: true, OtherMarkets: false }]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({
          users: [
            { user_id: 401, match_odds: true },
            { match_odds: true }, // missing user_id
            { user_id: 403, match_odds: true },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].index).toBe(1);
    });
  });

  // ===========================
  // 🧪 TEST 6: UNLOCK MULTIPLE USERS
  // ===========================
  describe("POST /api/admin/betlock/unlock/multiple - Unlock Multiple Users", () => {
    
    it("should unlock multiple users", async () => {
      BetLock.update.mockResolvedValue([3]); // 3 rows updated

      const response = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: [101, 102, 103] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("unlocked");
      expect(response.body.count).toBe(3);
    });

    it("should return 0 if no users found", async () => {
      BetLock.update.mockResolvedValue([0]);

      const response = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: [999, 998, 997] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
    });

    it("should reject empty user_ids array", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: [] })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("cannot be empty");
    });

    it("should reject if user_ids is not an array", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: "101" })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("array");
    });
  });

  // ===========================
  // 🧪 TEST 7: LOCK ALL MATCH ODDS
  // ===========================
  describe("POST /api/admin/betlock/lock/all/matchodds - Lock All Match Odds", () => {
    
    it("should lock all users' match odds", async () => {
      BetLock.update.mockResolvedValue([500]); // 500 users updated

      const response = await request(app)
        .post("/api/admin/betlock/lock/all/matchodds")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("MatchOdds locked");
      expect(response.body.count).toBe(500);
    });

    it("should handle zero users", async () => {
      BetLock.update.mockResolvedValue([0]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/all/matchodds")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
    });
  });

  // ===========================
  // 🧪 TEST 8: LOCK ALL OTHER MARKETS
  // ===========================
  describe("POST /api/admin/betlock/lock/all/othermarkets - Lock All Other Markets", () => {
    
    it("should lock all users' other markets", async () => {
      BetLock.update.mockResolvedValue([500]); // 500 users updated

      const response = await request(app)
        .post("/api/admin/betlock/lock/all/othermarkets")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("OtherMarkets locked");
      expect(response.body.count).toBe(500);
    });

    it("should handle zero users", async () => {
      BetLock.update.mockResolvedValue([0]);

      const response = await request(app)
        .post("/api/admin/betlock/lock/all/othermarkets")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
    });
  });

  // ===========================
  // 🧪 TEST 9: UNLOCK ALL USERS
  // ===========================
  describe("POST /api/admin/betlock/unlock/all - Unlock All Users", () => {
    
    it("should unlock all users' bets", async () => {
      BetLock.update.mockResolvedValue([500]); // 500 users updated

      const response = await request(app)
        .post("/api/admin/betlock/unlock/all")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("All users unlocked");
      expect(response.body.count).toBe(500);
    });

    it("should handle zero users", async () => {
      BetLock.update.mockResolvedValue([0]);

      const response = await request(app)
        .post("/api/admin/betlock/unlock/all")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
    });
  });

  // ===========================
  // 🧪 INTEGRATION TESTS
  // ===========================
  describe("Integration Tests - Multiple Operations", () => {
    
    it("should perform lock -> get -> unlock sequence", async () => {
      const user = {
        id: 1,
        user_id: 501,
        MatchOdds: false,
        OtherMarkets: false,
      };

      // 1. Lock user
      BetLock.upsert.mockResolvedValueOnce([
        { ...user, MatchOdds: true, OtherMarkets: true },
      ]);

      const lockRes = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: 501, match_odds: true, other_markets: true })
        .expect(200);

      expect(lockRes.body.data.MatchOdds).toBe(true);

      // 2. Get user
      BetLock.findOne.mockResolvedValueOnce({
        ...user,
        MatchOdds: true,
        OtherMarkets: true,
      });

      const getRes = await request(app)
        .get("/api/admin/betlock/501")
        .expect(200);

      expect(getRes.body.data.MatchOdds).toBe(true);

      // 3. Unlock user
      BetLock.update.mockResolvedValueOnce([1]);
      BetLock.findOne.mockResolvedValueOnce(user);

      const unlockRes = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({ user_id: 501 })
        .expect(200);

      expect(unlockRes.body.data.MatchOdds).toBe(false);
    });
  });
});
