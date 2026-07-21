import SportsBet from "../../model/user/SportsBet.js";
import sequelize from "../../config/db.js";
import { Op } from "sequelize";

export const getRiskBets = async (req, res) => {
  try {
    const { eventid, status, page = 1, limit = 10 } = req.query;

    if (!eventid) {
      return res.status(400).json({ success: false, error: "eventid is required" });
    }

    const where = {
      eventid: eventid,
    };

    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.or]: ["open"] };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await SportsBet.findAndCountAll({
      where,
      order: [["stake_amount", "DESC"], ["created_at", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("getRiskBets error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBetsStatus = async (req, res) => {
  try {
    const { betIds, status } = req.body;

    if (!betIds || !Array.isArray(betIds) || betIds.length === 0) {
      return res.status(400).json({ success: false, error: "betIds array is required" });
    }

    if (!status) {
      return res.status(400).json({ success: false, error: "status is required" });
    }

    // Update status
    await SportsBet.update(
      { status: status },
      {
        where: {
          id: { [Op.in]: betIds },
        },
      }
    );

    res.json({ success: true, message: `${betIds.length} bets updated successfully` });
  } catch (error) {
    console.error("updateBetsStatus error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOpenBetsByEvent = async (req, res) => {
  try {
    const bets = await SportsBet.findAll({
      attributes: [
        "eventid",
        "match_title",
        [sequelize.fn("COUNT", sequelize.col("id")), "open_bets_count"],
        [sequelize.fn("SUM", sequelize.col("stake_amount")), "total_stake"],
      ],
      where: {
        status: "open",
      },
      group: ["eventid", "match_title"],
      order: [[sequelize.literal("total_stake"), "DESC"]],
    });

    res.json({
      success: true,
      data: bets,
    });
  } catch (error) {
    console.error("getOpenBetsByEvent error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

import DeactivatedMatch from "../../model/user/DeactivatedMatch.js";

export const getDeactivatedMatches = async (req, res) => {
  try {
    const matches = await DeactivatedMatch.findAll();
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("getDeactivatedMatches error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addDeactivatedMatch = async (req, res) => {
  try {
    const { eventid, match_title, sport_id, status } = req.body;

    if (!eventid || !match_title || !sport_id) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const matchStatus = status !== undefined ? status : "INACTIVE"; // Default "INACTIVE"

    await DeactivatedMatch.upsert({
      eventid,
      match_title,
      sport_id,
      status: matchStatus,
    });

    res.json({ success: true, message: "Match status updated successfully" });
  } catch (error) {
    console.error("addDeactivatedMatch error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeDeactivatedMatch = async (req, res) => {
  try {
    const { eventid, status } = req.body;

    if (!eventid) {
      return res.status(400).json({ success: false, error: "eventid is required" });
    }

    const matchStatus = status !== undefined ? status : "ACTIVE"; // Default "ACTIVE"

    await DeactivatedMatch.update(
      { status: matchStatus },
      { where: { eventid } }
    );

    res.json({ success: true, message: "Match status updated successfully" });
  } catch (error) {
    console.error("removeDeactivatedMatch error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
