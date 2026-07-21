import { Op, fn, col, cast, where } from "sequelize";
import CreditsLedger from "../../model/user/CreditsLedger.js";
import Transaction from "../../model/admin/Transaction.js"; 
import User from "../../model/user/User.js"; 
import Staff from "../../model/admin/Staff.js"; 

/**
 * Helper: Calculate total credits for a user
 */
const getUserTotalCredits = async (userId) => {
  const result = await CreditsLedger.findOne({
    where: { user_id: userId },
    attributes: [
      [sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("amount")), 0), "total_credits"],
    ],
    raw: true,
  });
  return parseFloat(result.total_credits) || 0;
};

/**
 * @desc    Get total credits for a user
 * @access  Private (assumes auth middleware)
 */
const getUserTotalCreditsController = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || userId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const totalCredits = await getUserTotalCredits(userId);

    return res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        total_credits: totalCredits,
        currency: "INR", // Default as per model
      },
    });
  } catch (error) {
    console.error("Error in getUserTotalCreditsController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get credit history for a specific user (paginated) - Includes both CreditsLedger and Transactions
 * @access  Private
 */
const getUserCreditHistory = async (req, res) => {
  try {
    const {
      user_id,
      page = 1,
      limit = 25,
      sort = "created_at",
      order = "DESC",
    } = req.body;

    // --- ✅ Validation ---
    if (!user_id || user_id.toString().trim() === "") {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch credit history",
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    // --- ✅ Sorting Validation ---
    const validSortFields = [
      "id",
      "amount",
      "reason",
      "created_at",
      "eventid",
      "job_id",
      "match_id",
    ];
    const sortField = validSortFields.includes(sort) ? sort : "created_at";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // --- ✅ Fetch CreditsLedger Data ---
    const ledgerWhere = where(
      cast(col("user_id"), "TEXT"),
      { [Op.eq]: String(user_id) }
    );

    const { count: ledgerCount, rows: ledgerRows } = await CreditsLedger.findAndCountAll({
      where: ledgerWhere,
      attributes: {
        exclude: ["meta"],
      },
      raw: true,
    });

    // --- ✅ Fetch Transaction Data ---
    const { count: transactionCount, rows: transactionRows } = await Transaction.findAndCountAll({
      where: { user_id: parseInt(user_id) },
      attributes: [
        "id",
        "user_id",
        "amount",
        "balance",
        "type",
        "createdAt",
      ],
      raw: true,
    });

    // --- ✅ Format CreditsLedger Records ---
    const formattedLedger = ledgerRows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      amount: parseFloat(row.amount),
      balance: parseFloat(row.balance) || null,
      description: row.description,
      reason: row.reason,
      type: row.reason, // Map reason to type field for consistency
      eventid: row.eventid,
      job_id: row.job_id,
      match_id: row.match_id,
      market_type: row.market_type,
      source: "creditledger",
      created_at: row.created_at,
    }));

    // --- ✅ Format Transaction Records ---
    const formattedTransactions = transactionRows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      amount: parseFloat(row.amount),
      balance: parseFloat(row.balance),
      description: row.type || "Transaction", // Use transaction type as description
      reason: row.type,
      type: row.type,
      source: "transaction",
      created_at: row.createdAt,
    }));

    // --- ✅ Merge and Sort All Records ---
    const allRecords = [...formattedLedger, ...formattedTransactions];
    
    // Sort by created_at (or specified field) and order
    allRecords.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (sortField === "created_at") {
        const dateA = new Date(fieldA).getTime();
        const dateB = new Date(fieldB).getTime();
        return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
      }
      
      if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortOrder === "DESC" ? fieldB - fieldA : fieldA - fieldB;
      }
      
      return 0;
    });

    // --- ✅ Apply Pagination ---
    const totalRecords = allRecords.length;
    const paginatedData = allRecords.slice(offset, offset + limitNum);

    // --- ✅ Response ---
    return res.status(200).json({
      success: true,
      user_id: user_id,
      pagination: {
        total_records: totalRecords,
        current_page: pageNum,
        total_pages: Math.ceil(totalRecords / limitNum),
        per_page: limitNum,
      },
      data: paginatedData,
    });
  } catch (error) {
    console.error("Error in getUserCreditHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



/**
 * @desc    Get all users' credit history (paginated, filterable)
 * @access  Private (Admin)
 */
const getAllUsersCreditHistory  = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      sort = "created_at",
      order = "DESC",
    } = req.body;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 25;
    const offset = (pageNumber - 1) * pageSize;

    // ✅ Valid sort fields
    const validSortFields = [
      "id",
      "user_id",
      "amount",
      "reason",
      "created_at",
      "eventid",
      "job_id",
      "match_id",
    ];

    const sortField = validSortFields.includes(sort) ? sort : "created_at";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // ✅ Fetch all records with pagination
    const { count, rows } = await CreditsLedger.findAndCountAll({
      order: [[sortField, sortOrder]],
      limit: pageSize,
      offset,
      attributes: {
        exclude: ["meta"],
      },
    });

    return res.status(200).json({
      success: true,
      pagination: {
        page: pageNumber,
        per_page: pageSize,
        total_records: count,
        total_pages: Math.ceil(count / pageSize),
      },
      data: rows.map((entry) => ({
        id: entry.id,
        user_id: entry.user_id,
        amount: parseFloat(entry.amount),
        currency: entry.currency || "INR",
        reason: entry.reason,
        description: entry.description,
        eventid: entry.eventid,
        job_id: entry.job_id,
        match_id: entry.match_id,
        market_type: entry.market_type,
        created_at: entry.created_at,
      })),
    });
  } catch (error) {
    console.error("Error in getAllCreditHistoryWithPagination:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



/**
 * @desc    Get commission report (total for specific user + total for all users)
 * @access  Private (Admin)
 */

// Helper to get all descendant staff IDs recursively
const getAllDescendantStaffIds = async (staffId) => {
  let allIds = [staffId];
  let currentIds = [staffId];

  while (currentIds.length > 0) {
    const children = await Staff.findAll({
      where: { parent_id: { [Op.in]: currentIds } },
      attributes: ['staff_id'],
      raw: true
    });

    if (children.length === 0) break;

    const childIds = children.map(c => c.staff_id);
    allIds = [...allIds, ...childIds];
    currentIds = childIds;
  }
  return allIds;
};


import SportsBet from '../../model/user/SportsBet.js';
import PlatformGames from '../../model/admin/PlatformGames.js';

const getCommissionReport = async (req, res) => {
  try {
    const { user_id, view_type = 'USER_LIST', target_user_id, target_sport_id } = req.body;
    const loggedInAdminId = req.user.account.id; 
    const loggedInRole = req.user.role?.toUpperCase();

    // ---------------------------------------------------------
    // CASE 1: USER LIST (Default) - Show all downline users
    // ---------------------------------------------------------
    if (view_type === 'USER_LIST') {
      // 1. Determine Allowed Users (Downline Filtering)
      let allowedUserIds = [];
      let isOwner = loggedInRole === 'OWNER';

      if (isOwner) {
        // Owner sees everyone
      } else {
        const allowedStaffIds = await getAllDescendantStaffIds(loggedInAdminId);
        const usersUnderStaff = await User.findAll({
            where: { parent_staff_id: { [Op.in]: allowedStaffIds } },
            attributes: ['user_id'],
            raw: true
        });
        allowedUserIds = usersUnderStaff.map(u => String(u.user_id));
        
        if (allowedUserIds.length === 0) {
           return res.status(200).json({
              success: true,
              data: { all_users: [], total_users: 0 }
           });
        }
      }

      // 2. Fetch commissions (Filtered)
      const commissionWhere = {
        commission: { [Op.ne]: null }
      };
      
      if (!isOwner) {
        commissionWhere.user_id = { [Op.in]: allowedUserIds };
      }

      const allCommissions = await CreditsLedger.findAll({
        attributes: [
          "user_id",
          [fn("COALESCE", fn("SUM", col("commission")), 0), "total_commission"],
        ],
        where: commissionWhere,
        group: ["user_id"],
        raw: true,
      });

      // 3. Fetch User Details
      const userIdsWithCommission = allCommissions.map(c => c.user_id);
      const usersDetails = await User.findAll({
        where: { user_id: { [Op.in]: userIdsWithCommission } },
        attributes: ['user_id', 'username'],
        raw: true
      });

      const userMap = {};
      usersDetails.forEach(u => userMap[u.user_id] = u);

      // 4. Format Result
      const resultData = allCommissions.map(comm => {
        const user = userMap[comm.user_id];
        return {
          user_id: comm.user_id,
          username: user ? user.username : `User ${comm.user_id}`,
          total_commission: parseFloat(comm.total_commission || 0).toFixed(2)
        };
      });

      resultData.sort((a, b) => parseFloat(b.total_commission) - parseFloat(a.total_commission));

      return res.status(200).json({
        success: true,
        data: {
          all_users: resultData, 
          total_users: resultData.length
        }
      });
    }

    // ---------------------------------------------------------
    // CASE 2: SPORT WISE - Show sports for a specific user
    // ---------------------------------------------------------
    if (view_type === 'SPORT_WISE') {
      if (!target_user_id) return res.status(400).json({ success: false, message: "target_user_id required" });

      // Fetch all commissions for this user
      const commissions = await CreditsLedger.findAll({
        where: { 
          user_id: String(target_user_id),
          commission: { [Op.ne]: null }
        },
        attributes: ['amount', 'commission', 'match_id', 'sport_id', 'market_type', 'created_at'],
        raw: true
      });

      if (commissions.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      // Fetch Game Names from PlatformGames
      const games = await PlatformGames.findAll({ raw: true });
      const gameMap = {}; // sport_id -> name
      games.forEach(g => {
        if (g.sport_id) gameMap[g.sport_id] = g.name;
      });

      // Aggregate by Sport
      const sportAgg = {};

      commissions.forEach(comm => {
        const sid = comm.sport_id || 'UNKNOWN';
        const sName = gameMap[sid] || (sid === 'UNKNOWN' ? 'Other' : `Sport ${sid}`);

        if (!sportAgg[sName]) {
          sportAgg[sName] = { sport_name: sName, sport_id: sid, total_commission: 0 };
        }
        sportAgg[sName].total_commission += parseFloat(comm.commission || 0);
      });

      const resultData = Object.values(sportAgg).map(item => ({
        ...item,
        total_commission: item.total_commission.toFixed(2)
      }));

      return res.status(200).json({ success: true, data: resultData });
    }

    // ---------------------------------------------------------
    // CASE 3: MATCH WISE - Show matches for a specific user and sport
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // CASE 3: MATCH WISE (Detailed Bet List) - Show bets for a specific user and sport
    // ---------------------------------------------------------
    if (view_type === 'MATCH_WISE') {
      if (!target_user_id) return res.status(400).json({ success: false, message: "target_user_id required" });

      const whereClause = { 
        user_id: String(target_user_id),
        commission: { [Op.ne]: null }
      };

      if (target_sport_id && target_sport_id !== 'UNKNOWN') {
        whereClause.sport_id = target_sport_id;
      }

      // Fetch Ledger Entries
      const commissions = await CreditsLedger.findAll({
        where: whereClause,
        attributes: ['id', 'amount', 'commission', 'match_id', 'created_at', 'meta', 'description', 'market_type'],
        order: [['created_at', 'DESC']],
        raw: true
      });

      if (commissions.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      // Extract bet_ids from meta
      const betIds = commissions.map(c => c.meta?.bet_id).filter(Boolean);
      
      // Fetch SportsBet details
      let bets = [];
      if (betIds.length > 0) {
        bets = await SportsBet.findAll({
          where: { id: { [Op.in]: betIds } },
          attributes: ['id', 'match_title', 'selection_name', 'fancy_name', 'game_type'],
          raw: true
        });
      }

      const betMap = {};
      bets.forEach(b => betMap[b.id] = b);

      // Map Ledger to Result Data
      const resultData = commissions.map(comm => {
        const betId = comm.meta?.bet_id;
        const bet = betMap[betId];
        
        let eventName = '';
        
        if (bet) {
          // Found in SportsBet: Use Match Title - Selection Name
          eventName = `${bet.match_title} - ${bet.selection_name}`;
        } else {
          // Not found in SportsBet: Fallback to Ledger Description
          // User requested: "use credit ledger description for event but as fallback"
          // We'll try to make it slightly readable if possible, otherwise raw description
          const desc = comm.description || '';
          // If description is the long formatted string, try to grab the first part or just return it
          // Example: "MO/BM per-bet; winner=..." -> "MO/BM per-bet" is too generic.
          // Let's return the full description or a substantial part of it to be safe/informative
          eventName = desc; 
        }

        return {
          match_id: comm.match_id, // Keep for reference
          event: eventName,
          date: comm.created_at,
          total_commission: parseFloat(comm.commission || 0).toFixed(2)
        };
      });

      return res.status(200).json({ success: true, data: resultData });
    }

    return res.status(400).json({ success: false, message: "Invalid view_type" });

  } catch (error) {
    console.error("Error in getCommissionReport:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  getUserTotalCreditsController,
  getUserCreditHistory,
  getAllUsersCreditHistory,
  getCommissionReport
};