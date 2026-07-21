

import SportsBet from "../../model/user/SportsBet.js"; 
import User from "../../model/user/User.js"; // assuming you have User model

// Currency constants
const CurrencyTypes = {
  USD: "usd",
  INR: "inr",
  CRYPTO: "crypto",
};

// Bet status constants
const BetStatus = {
  PENDING: "pending",
  WON: "won",
  LOST: "lost",
  CANCELLED: "cancelled",
  VOID: "void",
};

// Currency conversion service
const convertToUSD = async (amount, fromCurrency) => {
  const rates = {
    inr: 0.012, // 1 INR = 0.012 USD
    crypto: 45000, // 1 BTC = 45000 USD
  };

  if (fromCurrency === "usd") return amount;
  return amount * (rates[fromCurrency.toLowerCase()] || 1);
};

class SportsBetController {
  // ================== CREATE BET ==================
  async createBet(req, res) {
    try {
      const {
        userId,
        gameType,
        matchTitle,
        teamOne,
        teamTwo,
        selectionName,
        category,
        betType,
        odds,
        stakeAmount,
        currencyType,
        originalAmount,
        matchStartTime,
        matchEndTime,
      } = req.body;

      // Convert to USD
      const usdAmount = await convertToUSD(originalAmount, currencyType);

      // Calculate liability
      const liability =
        betType === "lay" ? (odds - 1) * stakeAmount : stakeAmount;

      const newBet = await SportsBet.create({
        userId,
        gameType,
        matchTitle,
        teamOne,
        teamTwo,
        selectionName,
        category,
        betType,
        odds,
        stakeAmount,
        originalCurrency: currencyType,
        originalAmount,
        usdAmount,
        liability,
        matchStartTime,
        matchEndTime,
        status: BetStatus.PENDING,
      });

      res.status(201).json({ success: true, betId: newBet.id });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ================== GET USER BETS ==================
  async getUserBets(req, res) {
    try {
      const { userId } = req.params;
      const bets = await SportsBet.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });

      // Convert amounts dynamically
      const mappedBets = bets.map((bet) => {
        let convertedAmount = bet.usdAmount;
        if (bet.originalCurrency === "inr")
          convertedAmount = Math.round(bet.usdAmount * 82.5 * 100) / 100;
        if (bet.originalCurrency === "crypto")
          convertedAmount = bet.usdAmount * 0.000022;

        return { ...bet.toJSON(), convertedAmount };
      });

      res.json({ success: true, bets: mappedBets });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ================== UPDATE BET STATUS ==================
  async updateBetStatus(req, res) {
    try {
      const { betId } = req.params;
      const { status, resultDeclaredTime } = req.body;

      const [updated] = await SportsBet.update(
        {
          status,
          resultDeclaredTime,
          updatedAt: new Date(),
        },
        { where: { id: betId }, returning: true }
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, error: "Sports bet not found" });
      }

      const updatedBet = await SportsBet.findByPk(betId);
      res.json({ success: true, bet: updatedBet });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ================== DELETE BET ==================
  async deleteBet(req, res) {
    try {
      const { betId } = req.params;
      const deleted = await SportsBet.destroy({ where: { id: betId } });

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, error: "Sports bet not found" });
      }

      res.json({
        success: true,
        message: "Sports bet deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ================== GET ALL BETS (with pagination) ==================
  async getAllBets(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        gameType,
        startDate,
        endDate,
        currency = "usd",
      } = req.query;

      const where = {};
      if (status) where.status = status;
      if (gameType) where.gameType = gameType;
      if (startDate) where.createdAt = { ...where.createdAt, $gte: startDate };
      if (endDate) where.createdAt = { ...where.createdAt, $lte: endDate };

      const offset = (page - 1) * limit;

      const { count, rows } = await SportsBet.findAndCountAll({
        where,
        include: [{ model: User, attributes: ["id", "name"] }],
        order: [["createdAt", "DESC"]],
        limit: Number(limit),
        offset: Number(offset),
      });

      // Currency conversion
      const mappedRows = rows.map((bet) => {
        let convertedAmount = bet.usdAmount;
        if (currency === "inr")
          convertedAmount = Math.round(bet.usdAmount * 82.5 * 100) / 100;
        if (currency === "crypto")
          convertedAmount = bet.usdAmount * 0.000022;

        return { ...bet.toJSON(), convertedAmount };
      });

      res.json({
        success: true,
        bets: mappedRows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error in getAllBets:", error);
      res.status(500).json({
        success: false,
        error: "An error occurred while fetching bets",
      });
    }
  }

  // ================== GET USER BALANCE (stub) ==================
  async getUserBalance(req, res) {
    res.json({ success: true, balance: 0 }); // implement later
  }
}

export default new SportsBetController();



