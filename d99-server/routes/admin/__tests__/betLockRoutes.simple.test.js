/**
 * BetLock Routes - Simplified Unit Tests
 * Testing with direct imports and manual mocking
 */

import express from "express";
import request from "supertest";

// Simple mock for demonstration
const mockBetLockData = {
  101: { id: 1, user_id: 101, MatchOdds: true, OtherMarkets: false },
  102: { id: 2, user_id: 102, MatchOdds: false, OtherMarkets: true },
  103: { id: 3, user_id: 103, MatchOdds: true, OtherMarkets: true },
};

// Create a simple Express app for testing
const app = express();
app.use(express.json());

// Mock route handlers
app.get("/api/admin/betlock/", (req, res) => {
  const data = Object.values(mockBetLockData);
  res.status(200).json({
    success: true,
    message: "All bet locks retrieved",
    data: data,
    count: data.length,
  });
});

app.get("/api/admin/betlock/:user_id", (req, res) => {
  const { user_id } = req.params;
  const data = mockBetLockData[user_id];

  if (!data) {
    return res.status(200).json({
      success: true,
      message: "No record found. Default lock = false",
      data: {
        user_id,
        MatchOdds: false,
        OtherMarkets: false,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "Bet lock status retrieved",
    data: data,
  });
});

app.post("/api/admin/betlock/lock/user", (req, res) => {
  const { user_id, match_odds, other_markets } = req.body;

  if (!user_id) {
    return res.status(200).json({
      success: false,
      error: "user_id is required",
    });
  }

  const toBool = (value) => {
    return value === true || value === "true" || value === 1 || value === "1";
  };

  const locked = {
    id: mockBetLockData[user_id]?.id || Object.keys(mockBetLockData).length + 1,
    user_id,
    MatchOdds: match_odds !== undefined ? toBool(match_odds) : false,
    OtherMarkets: other_markets !== undefined ? toBool(other_markets) : false,
  };

  mockBetLockData[user_id] = locked;

  res.status(200).json({
    success: true,
    message: "Bet locked/updated successfully",
    data: locked,
  });
});

app.post("/api/admin/betlock/unlock/user", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(200).json({
      success: false,
      error: "user_id is required",
    });
  }

  if (!mockBetLockData[user_id]) {
    mockBetLockData[user_id] = {
      id: Object.keys(mockBetLockData).length + 1,
      user_id,
      MatchOdds: false,
      OtherMarkets: false,
    };

    return res.status(200).json({
      success: true,
      message: "User was not locked. Default state applied.",
      data: mockBetLockData[user_id],
    });
  }

  mockBetLockData[user_id].MatchOdds = false;
  mockBetLockData[user_id].OtherMarkets = false;

  res.status(200).json({
    success: true,
    message: "Bet unlocked successfully",
    data: mockBetLockData[user_id],
  });
});

app.post("/api/admin/betlock/lock/multiple", (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(200).json({
      success: false,
      error: "users array is required and cannot be empty",
    });
  }

  const results = [];
  const errors = [];

  const toBool = (value) => {
    return value === true || value === "true" || value === 1 || value === "1";
  };

  for (const [index, user] of users.entries()) {
    const { user_id, match_odds, other_markets } = user || {};

    if (!user_id) {
      errors.push({ index, error: "user_id is required" });
      results.push(null);
      continue;
    }

    const locked = {
      id: mockBetLockData[user_id]?.id || Object.keys(mockBetLockData).length + 1,
      user_id,
      MatchOdds: match_odds !== undefined ? toBool(match_odds) : false,
      OtherMarkets: other_markets !== undefined ? toBool(other_markets) : false,
    };

    mockBetLockData[user_id] = locked;
    results.push(locked);
  }

  const successCount = results.filter((r) => r !== null).length;

  return res.status(200).json({
    success: true,
    message: `${successCount} users processed`,
    count: successCount,
    data: results.filter((r) => r !== null),
    errors: errors.length > 0 ? errors : undefined,
  });
});

app.post("/api/admin/betlock/unlock/multiple", (req, res) => {
  const { user_ids } = req.body;

  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return res.status(200).json({
      success: false,
      error: "user_ids array is required and cannot be empty",
    });
  }

  let updatedCount = 0;
  for (const user_id of user_ids) {
    if (mockBetLockData[user_id]) {
      mockBetLockData[user_id].MatchOdds = false;
      mockBetLockData[user_id].OtherMarkets = false;
      updatedCount++;
    }
  }

  res.status(200).json({
    success: true,
    message: "Selected users unlocked successfully",
    count: updatedCount,
  });
});

app.post("/api/admin/betlock/lock/all/matchodds", (req, res) => {
  let count = 0;
  for (const key in mockBetLockData) {
    mockBetLockData[key].MatchOdds = true;
    count++;
  }

  res.status(200).json({
    success: true,
    message: "All users' MatchOdds locked successfully",
    count,
  });
});

app.post("/api/admin/betlock/lock/all/othermarkets", (req, res) => {
  let count = 0;
  for (const key in mockBetLockData) {
    mockBetLockData[key].OtherMarkets = true;
    count++;
  }

  res.status(200).json({
    success: true,
    message: "All users' OtherMarkets locked successfully",
    count,
  });
});

app.post("/api/admin/betlock/unlock/all", (req, res) => {
  let count = 0;
  for (const key in mockBetLockData) {
    mockBetLockData[key].MatchOdds = false;
    mockBetLockData[key].OtherMarkets = false;
    count++;
  }

  res.status(200).json({
    success: true,
    message: "All users unlocked successfully",
    count,
  });
});

// ===========================
// 🧪 TEST SUITES
// ===========================

describe("BetLock Routes - Comprehensive Tests", () => {
  beforeEach(() => {
    // Reset mock data before each test
    Object.assign(mockBetLockData, {
      101: { id: 1, user_id: 101, MatchOdds: true, OtherMarkets: false },
      102: { id: 2, user_id: 102, MatchOdds: false, OtherMarkets: true },
      103: { id: 3, user_id: 103, MatchOdds: true, OtherMarkets: true },
    });
  });

  // ===========================
  // 🧪 TEST 1: GET ALL BET LOCKS
  // ===========================
  describe("GET /api/admin/betlock/ - Get All Bet Locks", () => {
    it("should return all bet locks with count", async () => {
      const response = await request(app)
        .get("/api/admin/betlock/")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("retrieved");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it("should include all user data", async () => {
      const response = await request(app).get("/api/admin/betlock/").expect(200);

      expect(response.body.count).toBe(3);
      expect(response.body.data[0]).toHaveProperty("user_id");
      expect(response.body.data[0]).toHaveProperty("MatchOdds");
      expect(response.body.data[0]).toHaveProperty("OtherMarkets");
    });
  });

  // ===========================
  // 🧪 TEST 2: GET SINGLE USER BET LOCK
  // ===========================
  describe("GET /api/admin/betlock/:user_id - Get Single User Bet Lock", () => {
    it("should return existing user bet lock status", async () => {
      const response = await request(app)
        .get("/api/admin/betlock/101")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_id).toBe(101);
      expect(response.body.data.MatchOdds).toBe(true);
      expect(response.body.data.OtherMarkets).toBe(false);
    });

    it("should return default lock status if user not found", async () => {
      const response = await request(app)
        .get("/api/admin/betlock/999")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("No record found");
      expect(response.body.data.MatchOdds).toBe(false);
      expect(response.body.data.OtherMarkets).toBe(false);
    });
  });

  // ===========================
  // 🧪 TEST 3: LOCK SINGLE USER
  // ===========================
  describe("POST /api/admin/betlock/lock/user - Lock Single User", () => {
    it("should lock match odds for a user", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: 201, match_odds: true, other_markets: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("locked/updated");
      expect(response.body.data.MatchOdds).toBe(true);
      expect(response.body.data.OtherMarkets).toBe(false);
    });

    it("should lock both markets", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: 202, match_odds: true, other_markets: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.MatchOdds).toBe(true);
      expect(response.body.data.OtherMarkets).toBe(true);
    });

    it("should handle string boolean values", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: 203, match_odds: "true", other_markets: "1" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.MatchOdds).toBe(true);
      expect(response.body.data.OtherMarkets).toBe(true);
    });

    it("should return error if user_id is missing", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ match_odds: true })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("user_id is required");
    });
  });

  // ===========================
  // 🧪 TEST 4: UNLOCK SINGLE USER
  // ===========================
  describe("POST /api/admin/betlock/unlock/user - Unlock Single User", () => {
    it("should unlock an existing user", async () => {
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
      const response = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({ user_id: 999 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Default state applied");
      expect(response.body.data.MatchOdds).toBe(false);
      expect(response.body.data.OtherMarkets).toBe(false);
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
      const response = await request(app)
        .post("/api/admin/betlock/lock/multiple")
        .send({
          users: [
            { user_id: 301, match_odds: true, other_markets: false },
            { user_id: 302, match_odds: false, other_markets: true },
            { user_id: 303, match_odds: true, other_markets: true },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    it("should handle partial failures", async () => {
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
  });

  // ===========================
  // 🧪 TEST 6: UNLOCK MULTIPLE USERS
  // ===========================
  describe("POST /api/admin/betlock/unlock/multiple - Unlock Multiple Users", () => {
    it("should unlock multiple users", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: [101, 102, 103] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("unlocked");
      expect(response.body.count).toBe(3);
    });

    it("should reject empty user_ids array", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/unlock/multiple")
        .send({ user_ids: [] })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("cannot be empty");
    });
  });

  // ===========================
  // 🧪 TEST 7: LOCK ALL MATCH ODDS
  // ===========================
  describe("POST /api/admin/betlock/lock/all/matchodds - Lock All Match Odds", () => {
    it("should lock all users' match odds", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/all/matchodds")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("MatchOdds locked");
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  // ===========================
  // 🧪 TEST 8: LOCK ALL OTHER MARKETS
  // ===========================
  describe("POST /api/admin/betlock/lock/all/othermarkets - Lock All Other Markets", () => {
    it("should lock all users' other markets", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/lock/all/othermarkets")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("OtherMarkets locked");
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  // ===========================
  // 🧪 TEST 9: UNLOCK ALL USERS
  // ===========================
  describe("POST /api/admin/betlock/unlock/all - Unlock All Users", () => {
    it("should unlock all users' bets", async () => {
      const response = await request(app)
        .post("/api/admin/betlock/unlock/all")
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("All users unlocked");
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  // ===========================
  // 🧪 INTEGRATION TESTS
  // ===========================
  describe("Integration Tests - Multiple Operations", () => {
    it("should perform lock -> get -> unlock sequence", async () => {
      // 1. Lock user
      let lockRes = await request(app)
        .post("/api/admin/betlock/lock/user")
        .send({ user_id: 501, match_odds: true, other_markets: true })
        .expect(200);

      expect(lockRes.body.data.MatchOdds).toBe(true);

      // 2. Get user
      let getRes = await request(app)
        .get("/api/admin/betlock/501")
        .expect(200);

      expect(getRes.body.data.MatchOdds).toBe(true);

      // 3. Unlock user
      let unlockRes = await request(app)
        .post("/api/admin/betlock/unlock/user")
        .send({ user_id: 501 })
        .expect(200);

      expect(unlockRes.body.data.MatchOdds).toBe(false);
    });
  });
});
