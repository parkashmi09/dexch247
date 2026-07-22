import axios from "axios";

import dotenv from "dotenv";
dotenv.config();
import CasinoService from "../../services/CasinoService.js";
import { placeBet } from "../../sportsbet/sportbetscontroller.js";
import TableCasino from "../../model/admin/TableCasino.js";
import UserTableLock from "../../model/admin/UserTableLock.js";
import StaffTableLock from "../../model/admin/StaffTableLock.js";
import User from "../../model/user/User.js";
import Staff from "../../model/admin/Staff.js";
import { Op } from "sequelize";

// Games whose payout is a MULTIPLE of the stake rather than decimal odds.
// Value = the highest multiple the punter can lose, which is what placement must
// lock. 1 Card Meter pays the point difference between the two cards, max 12x.
// Keep in sync with the settlement worker's payoutRate handling.
const CASINO_MULTIPLIER_GAMES = {
    cmeter1: 12,
};

const CasinoController = {
    fetchAllData: async (req, res) => {
        const { type} = req.body;

        if (!type ) {
            return res.status(400).json({ 
                success: false,
                error: "Type and data are required" 
            });
        }

        try {
            const casinoData = await CasinoService.fetchAllData(type);

            // console.log('✅ Casino Data:', casinoData);

            return res.status(200).json({
                success: true,
                data: casinoData
            });
        } catch (error) {
            console.error('❌ Error:', error.message);

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    fetchLastResults: async (req, res) => {
        const { type } = req.body;  
        if (!type) {
            return res.status(400).json({ 
                success: false,
                error: "Type is required to fetch casino results" 
            });
        }       

        try {
            const lastResults = await CasinoService.fetchCasinolastResults(type);
            // console.log('✅ Casino Last Results:', lastResults);
            return res.status(200).json({
                success: true,
                data: lastResults
            });
        } catch (error) {               
            console.error('❌ Error:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    fetchDetailResults: async (req, res) => {
        const { type, mid } = req.body;

        if (!type || !mid) {
            return res.status(400).json({ 
                success: false,
                error: "Type and ID are required to fetch casino results" 
            });
        }

        try {
            const detailResults = await CasinoService.fetchCasionDetailResults(type, mid);
            // console.log('✅ Casino Detail Results:', detailResults);
            return res.status(200).json({
                success: true,
                data: detailResults
            });
        } catch (error) {
            console.error('❌ Error:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    fetchCasionDetailsData: async (req, res) => {
        const { gmid, sid } = req.body;

        if (!gmid || !sid) {
            return res.status(400).json({ 
                success: false,
                error: "Type and ID are required to fetch casino details" 
            });
        }

        try {
            const detailData = await CasinoService.fetchCasionDetailsData(gmid, sid);
            // console.log('✅ Casino Detail Data:', detailData);
            return res.status(200).json({
                success: true,
                data: detailData
            });
        } catch (error) {
            console.error('❌ Error:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    ,
    placeBet: async (req, res) => {
    const {
        userId,
        player_name,
        gameId,
        gameName,
        amount,        // stake
        odds,
        selection ,       // selection
        roundId =0,
        type,
        mtype, // fancy or normal
        browser // client-sent user-agent / geodata
    } = req.body;

    // 🌐 Geodata: capture client IP (honour proxy headers) + browser user-agent
    const ipAddress = (
        (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        ''
    ).replace(/^::ffff:/, '');
    const browserInfo = browser || req.headers['user-agent'] || '';

    // ✅ Validation
    if (!userId || !gameId || !amount || !selection || !odds ||  !player_name) {
        return res.status(400).json({
            success: false,
            error: "userId, gameId, amount, odds, and selection are required"
        });
    }
   let  exposer =0;
   let libality =0;
    // LAY liability is always stake*(odds-1). There used to be an
    // `mtype == 'fancy' → exposer = -amount` shortcut here, borrowed from the
    // sports session lines where the stake IS the liability. Casino tables are
    // not session lines: the vendor tags plenty of them "Fancy"/"Fancy1"
    // (notenum, race17, cricketv3 …) while `l` stays a true decimal price, so
    // the shortcut under-locked every one of them — a lay of 100 at 4.32 held
    // 100 instead of 332. Same mistake the BACK side already corrected, see
    // casinobet/settlementCasinoWorker.js → settleBetCommon.
    if(type == 'lay'){
       let value = odds -1;
       exposer = -value * amount
       libality = -amount;
    }
    else{

    exposer = -1 * amount;
    libality = -amount;
    }

    // 1 Card Meter settles at a MULTIPLE of the stake — the point difference
    // between the two cards, up to 12x — so a 100 bet can lose 1200. Locking the
    // flat stake let a punter take on 12x more risk than their balance covered;
    // the worst case must be held, and settlement returns whatever the actual
    // point difference does not consume.
    if (CASINO_MULTIPLIER_GAMES[gameName]) {
        const maxRate = CASINO_MULTIPLIER_GAMES[gameName];
        exposer = -maxRate * amount;
        libality = -maxRate * amount;
    }
    let eventId = gameId;
   
    // 🔒 Start: Lock Check Logic
    try {
        // 1. Resolve TableCasino entity
        // gameId in payload corresponds to tableid in TableCasino
        // Note: verify if gameId matches tableid (e.g. 'teen', 'poker')
        const table = await TableCasino.findOne({ 
            where: { 
                [Op.or]: [
                    { tableid: gameId }, 
                    { tableid: gameName } // Fallback if gameId is numeric or different
                ]
            } 
        });

        if (table) { // Only check if we manage this table
            const tableId = table.id;

            // 2. Check User Lock (Direct)
            const userLock = await UserTableLock.findOne({
                where: {
                    user_id: userId,
                    table_casino_id: tableId,
                    is_locked: true
                }
            });

            if (userLock) {
                return res.status(403).json({
                    success: false,
                    error: "This game is locked for you."
                });
            }

            // 3. Hierarchy Check (Staff/Owner)
            // We need to traverse up from the user to the top owner
            const user = await User.findByPk(userId);
            if (user) {
                let currentStaffId = user.parent_staff_id;
                let currentOwnerId = user.parent_owner_id;

                // Helper to check staff/owner lock
                const checkPrivilegedLock = async (staffId, ownerId) => {
                    const whereClause = {
                        table_casino_id: tableId,
                        is_locked: true
                    };
                    if (staffId) whereClause.staff_id = staffId;
                    if (ownerId) whereClause.owner_id = ownerId;

                    return await StaffTableLock.findOne({ where: whereClause });
                };

                // Check direct parent owner if exists (User -> Owner)
                if (currentOwnerId) {
                    const ownerLock = await checkPrivilegedLock(null, currentOwnerId);
                    if (ownerLock) {
                        return res.status(403).json({
                            success: false,
                            error: "This game is locked by your upline."
                        });
                    }
                }

                // Traverse Staff Chain
                while (currentStaffId) {
                    // Check current staff lock
                    const staffLock = await checkPrivilegedLock(currentStaffId, null);
                    if (staffLock) {
                         return res.status(403).json({
                            success: false,
                            error: "This game is locked by your upline."
                        });
                    }

                    // Move up to next parent
                    const currentStaff = await Staff.findByPk(currentStaffId);
                    if (!currentStaff) break; // Should not happen if data integrity is good

                    if (currentStaff.parent_owner_id) {
                         // Check the owner of this staff
                         const ownerLock = await checkPrivilegedLock(null, currentStaff.parent_owner_id);
                         if (ownerLock) {
                            return res.status(403).json({
                                success: false,
                                error: "This game is locked by your upline."
                            });
                         }
                    }
                    
                    // Continue up the staff chain
                    currentStaffId = currentStaff.parent_id;
                }
            }
        }
    } catch (lockError) {
        console.error('❌ Lock Check Error:', lockError);
        // assert safe default: if check fails, should we block or allow?
        // Usually safer to block or log and allow. Let's log and allow for now to prevent total outage on minor error.
    }
    // 🔒 End: Lock Check Logic

    try {
        const betResult = await CasinoService.placeBet({
            userId,
            player_name,
            gameName,
            amount,
            odds,
            selection,
            exposer,
            libality,
            eventId,
            roundId,
            type,
            mtype,
            ip_address: ipAddress,
            browser: browserInfo
        });

        console.log('✅ Bet Placed Successfully:', betResult);

        return res.status(200).json({
            success: true,
            message: "Bet placed successfully",
            data: betResult
        });

    } catch (error) {
        console.error('❌ Place Bet Error:', error.message);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
,

getUserBets: async (req, res) => {
    try {
      const { user_id ,match_id } = req.body;
      const userId = user_id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const bets = await CasinoService.UserBets(userId,match_id);

      return res.status(200).json({
        success: true,
        bets,
      });
    } catch (error) {
      console.error('❌ getUserBets error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  ,

UserBets: async (req, res) => {
    try {
      const { user_id } = req.body;
      const userId = user_id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const bets = await CasinoService.UserBetsHistory(userId);

      return res.status(200).json({
        success: true,
        bets,
      });
    } catch (error) {
      console.error('❌ getUserBets error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  
};

export default CasinoController;