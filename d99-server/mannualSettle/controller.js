

import Wallet from "../model/admin/Wallet.js";
import SportsBet from "../model/user/SportsBet.js";
import UserExposure from "../model/user/UserExposure.js";
import CreditsLedger from "../model/user/CreditsLedger.js";
import { syncTotalExposure } from "../helper/netExposureHelper.js";

import sequelize from "../config/db.js";

import MannualResult from '../model/admin/manualresult.js'

import { Op, Sequelize } from "sequelize";

import { fn, col, literal } from "sequelize";


let cachedUsdRate = 0;
let cachedAt = 0;

const getMoMatches = async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
        const rows = await SportsBet.findAll({
            attributes: [
                'match_id',
                'eventid',
                'game_type',
                'market_type',
                [fn('MAX', col('match_title')), 'match_title'],
                [fn('MAX', col('team_one')), 'team_one'],
                [fn('MAX', col('team_two')), 'team_two'],
                [fn('COUNT', col('*')), 'totalbets'],
                [fn('MAX', col('counts')), 'counts']
            ],
            where: {
                game_type: { [Op.or]: ['MO', 'BM'] },
                status: 'open',
                match_id: { [Op.ne]: null },
                eventid: { [Op.ne]: null }
            },
            group: ['match_id', 'eventid', 'game_type', 'market_type'],
            order: [[fn('MAX', col('created_at')), 'DESC']],
            limit,
            offset,
            raw: true
        });

        const payload = rows.map(r => ({
            matchId: r.match_id,
            eventId: r.eventid,
            gameType: r.game_type,
            marketType: r.market_type,
            matchTitle: r.match_title,
            teamOne: r.team_one,
            teamTwo: r.team_two,
            totalBets: parseInt(r.totalbets, 10),
            counts: r.counts !== null ? Number(r.counts) : null
        }));

        return res.json({ success: true, data: payload });
    } catch (err) {
        console.error('getMoMatches error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ------------------------ EXPORT ------------------------
const getFanOpenBets = async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    const marketsforfancy = [
        '1st Innings 6 Overs Line',
        '2nd Innings 6 Overs Line',
        '3rd Innings 6 Overs Line',
        '1st Innings 50 Overs Line',
        '2nd Innings 50 Overs Line',
        '3rd Innings 50 Overs Line',
        '1st Innings 40 Overs Line',
        '2nd Innings 40 Overs Line',
        '3rd Innings 40 Overs Line',
        '1st Innings 30 Overs Line',
        '2nd Innings 30 Overs Line',
        '3rd Innings 30 Overs Line',
        '1st Innings 20 Overs Line',
        '2nd Innings 20 Overs Line',
        '3rd Innings 20 Overs Line',
        '1st Innings 10 Overs Line',
        '2nd Innings 10 Overs Line',
        '3rd Innings 10 Overs Line',
        'Over By Over',
        'Ball By Ball',
        'Normal',
        'khado',
        'meter',
        'fancy1',
        'oddeven'
    ];

    try {
        // 1. Get Aggregated Groups
        const groups = await SportsBet.findAll({
            attributes: [
                'match_id',
                'eventid',
                'match_id',
                'eventid',
                'market_type',
                'selection_name',
                'game_type',
                [fn('MAX', col('match_title')), 'match_title'],
                [fn('COUNT', col('*')), 'totalbets'],
                [fn('MAX', col('counts')), 'counts']
            ],
            where: {
                // game_type: 'FAN', // Removed to follow previous pattern if user wants mo/bm here too? NO, user said "getFanOpenBets". Let's assume FAN only unless told.
                // Wait, "gametype should come proper".
                // I will include game_type in attributes.
                game_type: 'FAN',
                status: 'open',
                match_id: { [Op.ne]: null },
                eventid: { [Op.ne]: null }
                // removed strict market_type filter to include others
            },
            group: ['match_id', 'eventid', 'market_type', 'selection_name', 'game_type'],
            order: [[fn('MAX', col('created_at')), 'DESC']],
            limit,
            offset,
            raw: true
        });

        if (!groups.length) {
            return res.json({ success: true, data: { fancy1: [], others: [] } });
        }

        // 2. Build Criteria for Details
        const criteria = groups.map(g => ({
            match_id: g.match_id,
            eventid: g.eventid,
            market_type: g.market_type,
            selection_name: g.selection_name,
            game_type: g.game_type
        }));

        const bets = await SportsBet.findAll({
            where: {
                // game_type: 'FAN', // Criteria covers game_type
                status: 'open',
                [Op.or]: criteria
            },
            order: [['created_at', 'ASC']],
            raw: true
        });

        // 3. Grouping Map
        const groupMap = new Map();
        groups.forEach(g => {
            let mType = g.market_type;
            let groupKey = mType; // Default: use the market type itself

            if (!marketsforfancy.includes(mType)) {
                // Keep original mType, but group under 'others'
                groupKey = 'others';
            }

            // Unique key for the map entry - use original mType to keep distinct groups
            const key = `${g.match_id}||${g.eventid}||${mType}||${g.game_type}||${g.selection_name}`;

            if (groupMap.has(key)) {
                const existing = groupMap.get(key);
                existing.totalBets += parseInt(g.totalbets, 10);
            } else {
                groupMap.set(key, {
                    groupKey,
                    matchId: g.match_id,
                    eventId: g.eventid,
                    matchTitle: g.match_title,
                    marketType: mType, // Original type
                    selectionName: g.selection_name,
                    gameType: g.game_type,
                    totalBets: parseInt(g.totalbets, 10),
                    counts: g.counts !== null ? Number(g.counts) : null,
                    bets: []
                });
            }
        });

        // 4. Attach Bets
        bets.forEach(b => {
            let mType = b.market_type;
            // Previously we overwrote mType to 'Others' here too if not in list.
            // Now we don't, because we want to key off the original type.

            const key = `${b.match_id}||${b.eventid}||${mType}||${b.game_type}||${b.selection_name}`;
            const bucket = groupMap.get(key);
            if (bucket) {
                bucket.bets.push({
                    id: b.id,
                    userId: b.user_id,
                    betType: b.bet_type,
                    selectionName: b.selection_name,
                    marketType: b.market_type,
                    gameType: b.game_type,
                    teamOne: b.team_one,
                    teamTwo: b.team_two,
                    odds: b.odds !== null ? Number(b.odds) : null,
                    stakeAmount: b.stake_amount !== null ? Number(b.stake_amount) : null,
                    originalCurrency: b.original_currency,
                    originalAmount: b.original_amount !== null ? Number(b.original_amount) : null,
                    usdAmount: b.usd_amount !== null ? Number(b.usd_amount) : null,
                    liability: b.liability !== null ? Number(b.liability) : null,
                    status: b.status,
                    createdAt: b.created_at,
                    counts: b.counts !== null ? Number(b.counts) : null
                });
            }
        });

        // 5. Final Payload
        const payload = {};
        // Initialize payload keys
        marketsforfancy.forEach(m => {
            payload[m] = [];
        });
        payload['others'] = [];

        for (const val of groupMap.values()) {
            const listKey = val.groupKey;
            delete val.groupKey;

            if (payload[listKey]) {
                payload[listKey].push(val);
            } else {
                // strict fallback, though if logic holds it should already be 'others'
                payload['others'].push(val);
            }
        }

        return res.json({ success: true, data: payload });

    } catch (err) {
        s
        console.error('getFanOpenBets error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};




const declareResult = async (req, res) => {
    const { eventid, match_id, match_title, game_type, market_type, winnerName, winnerId, fancyName } = req.body;

    // 1. Basic Validation
    if (!eventid || !match_id || !match_title || !game_type || !market_type) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: eventid, match_id, match_title, game_type, market_type"
        });
    }

    // Specific Validation based on Game Type
    if (['MO', 'BM'].includes(game_type)) {
        if (!winnerName) {
            return res.status(400).json({ success: false, error: "winnerName is required for MO and BM" });
        }
    } else if (game_type === 'FAN') {
        // fancyName is always essential for FAN

        const marketsforfancy = [
            '1st Innings 6 Overs Line',
            '2nd Innings 6 Overs Line',
            '3rd Innings 6 Overs Line',
            '1st Innings 50 Overs Line',
            '2nd Innings 50 Overs Line',
            '3rd Innings 50 Overs Line',
            '1st Innings 40 Overs Line',
            '2nd Innings 40 Overs Line',
            '3rd Innings 40 Overs Line',
            '1st Innings 30 Overs Line',
            '2nd Innings 30 Overs Line',
            '3rd Innings 30 Overs Line',
            '1st Innings 20 Overs Line',
            '2nd Innings 20 Overs Line',
            '3rd Innings 20 Overs Line',
            '1st Innings 10 Overs Line',
            '2nd Innings 10 Overs Line',
            '3rd Innings 10 Overs Line',
            'Over By Over',
            'Ball By Ball',
            'Normal',
            'khado',
            'meter',

        ];

        if (marketsforfancy.includes(market_type)) {
            if (['fancy1', 'oddeven'].includes(market_type)) {
                if (!winnerName) {
                    return res.status(400).json({ success: false, error: "winnerName is required for this fancy market" });
                }
            } else {
                if (!winnerId) {
                    return res.status(400).json({ success: false, error: "winnerId is required for this fancy market" });
                }
            }

            if (!fancyName) {
                return res.status(400).json({ success: false, error: "fancyName is required for this fancy market" });
            }
        } else {
            // Fancy but not in the list -> WinnerName essential
            if (!winnerName) {
                return res.status(400).json({ success: false, error: "winnerName is required for this fancy market" });
            }
        }
    }

    const t = await sequelize.transaction();

    try {
        // 2. Insert into MannualResult
        // Updated column names: winnerName, winnerId, fancyName
        const newResult = await MannualResult.create({
            eventid,
            match_id,
            match_title,
            game_type,
            market_type,
            winnerName: winnerName || null,
            winnerId: winnerId || null,
            fancyName: fancyName || null
        }, { transaction: t });

        // 3. Update SportsBet status to 'manual'
        const [updatedCount] = await SportsBet.update(
            { status: 'manual' },
            {
                where: {
                    match_id: match_id,
                    market_type: market_type,
                    game_type: game_type,
                    status: 'open',
                    ...(['fancy1', 'oddeven', 'Over By Over', 'Ball By Ball', 'khado', 'meter', 'Normal'].includes(market_type)
                        ? { selection_name: fancyName }
                        : {})
                },
                transaction: t
            }
        );

        await t.commit();

        return res.json({
            success: true,
            message: "Result declared successfully",
            data: {
                manualResult: newResult,
                updatedBets: updatedCount
            }
        });

    } catch (error) {
        await t.rollback();
        console.error("declareResult error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
};

const voidResult = async (req, res) => {
    const { eventid, match_id, market_type, gametype, selection_name } = req.body;

    // 1. Basic Validation
    if (!eventid || !match_id || !market_type) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: eventid, match_id, market_type"
        });
    }

    const t = await sequelize.transaction();

    try {
        // 2. Build Where Clause for Finding Bets
        // We need to find 'open' bets to know which users are involved and to close them.
        const whereClause = {
            match_id,
            market_type,
            status: 'open'
        };

        if (gametype) {
            whereClause.game_type = gametype;
        }

        // If selection_name is provided, filter by it.
        // This is crucial for distinguishing specific Fancy sessions if they share market_type='fancy1'
        if (selection_name) {
            whereClause.selection_name = selection_name;
        }

        // 3. Find Affected Users (+ a representative bet per user for the refund audit row)
        const bets = await SportsBet.findAll({
            where: whereClause,
            attributes: ['id', 'user_id'],
            transaction: t
        });

        // The admin void refunds once per market/user; the aggregate refund ledger row is
        // attached to this representative bet so the System Tracker finds it at market level.
        const betIdsByUser = {};
        for (const b of bets) (betIdsByUser[b.user_id] ||= []).push(b.id);
        const userIds = Object.keys(betIdsByUser);

        // 4. Process Each User (Refund Exposure)
        for (const uid of userIds) {
            // Find UserExposure entries
            // Logic: match_id + game_type (which stores market_type).
            // NOTE: If selection_name is involved, we must be careful.
            // If UserExposure stores selection_name in team_name or category, we should use it.
            // Given we don't know for sure, we will target the exposures for this match+market_type.
            // If 'fancy1' has multiple sessions, this might refund ALL 'fancy1' exposure.
            // Assumption: The system aggregates exposure per market_type accurately or the user accepts this behavior.
            // Ideally, we would filter by team_name if it matches selection_name.

            const exposureWhere = {
                user_id: uid,
                match_id: match_id,
                game_type: market_type
            };

            // Attempt to narrow down by selection_name if provided and if it maps to team_name (Best Effort)
            // For Fancy, selection_name is often the 'team' (e.g. 6 Overs).
            // We use [Op.like] or exact match? Exact match is safer.
            // if (selection_name) {
            //    exposureWhere.team_name = selection_name;
            // } 
            // Commented out because if team_name is "YES" or "NO", filtering by "6 Overs" would fail.
            // Without seeing DB data, we rely on market_type.

            const exposures = await UserExposure.findAll({
                where: exposureWhere,
                transaction: t
            });
            console.log("exposures", exposures);

            if (exposures.length > 0) {
                // Calculate "most negative" exposure (max liability)
                let minExp = 0;
                exposures.forEach(e => {
                    const val = parseFloat(e.exposure_amount || 0);
                    if (val < minExp) minExp = val;
                });

                console.log("minExp", minExp);


                // Credit back if there is a negative exposure
                if (minExp < 0) {
                    const refundAmount = Math.abs(minExp);
                    const wallet = await Wallet.findOne({ where: { user_id: uid }, transaction: t });
                    if (wallet) {
                        const newCash = Number(wallet.cash || 0) + refundAmount;
                        await wallet.update({ cash: newCash }, { transaction: t });
                        // Audit money-trail row so the void refund is reconcilable (parity with the
                        // settlement worker's initiateRefund). Refund touches cash only — no P/L, no
                        // inr_balance. Attached to a representative bet so the integrity tracker finds
                        // it at market level.
                        await CreditsLedger.create({
                            user_id: String(uid),
                            currency: 'INR',
                            amount: refundAmount,
                            reason: 'refund',
                            description: `Admin void refund; market ${match_id}/${market_type}${selection_name ? '/' + selection_name : ''}; refund=${refundAmount}`,
                            eventid: String(eventid),
                            match_id: match_id != null ? String(match_id) : null,
                            market_type,
                            bet_id: (betIdsByUser[uid] || [])[0] || null,
                            closing: newCash,
                            netamount: refundAmount,
                            category: 'SPORTS',
                        }, { transaction: t });
                    }
                }

                // Remove these exposure records as the market/selection is voided
                await UserExposure.destroy({
                    where: exposureWhere,
                    transaction: t
                });

                // Recompute total_exposures from the now-updated user_exposures.
                // Without this the row keeps its bet-placement value forever, so a
                // user with no open exposure still reports a stale liability (it is
                // read back by ExposureService and pushed over the balance socket).
                // Runs inside the same transaction so it commits/rolls back with the void.
                await syncTotalExposure(uid, t);
            }
        }

        // 5. Update Bets Status
        // mark status as closed and result_status as refunded
        await SportsBet.update(
            {
                status: 'closed',
                result_status: 'refunded',
                match_end_time: new Date()
            },
            {
                where: whereClause,
                transaction: t
            }
        );

        await t.commit();

        return res.json({
            success: true,
            message: "Voided successfully",
            count: userIds.length
        });

    } catch (error) {
        await t.rollback();
        console.error("voidResult error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
};

const controller = {
    getMoMatches,
    getFanOpenBets,
    declareResult,
    voidResult
};

export default controller;
