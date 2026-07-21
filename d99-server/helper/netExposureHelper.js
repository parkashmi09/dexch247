
import UserExposure from "../model/user/UserExposure.js";
import sequelize from "../config/db.js";

/**
 * Calculates the net exposure for all users present in the UserExposure table.
 * Logic:
 * 1. Group by user_id and match_id (market).
 * 2. Find the MIN(exposure_amount) for each market (worst-case scenario).
 * 3. Sum these minimums for each user to get total net exposure.
 * 
 * @returns {Promise<Object>} A map of user_id -> net_exposure
 */
export const calculateNetExposure = async () => {
  try {
    // 1. Get all exposures grouped by user and match/market
    // We need to fetch all rows to perform the logic correctly in JS, 
    // or use a complex SQL query. Given the complexity, a raw query is best.

    // Query:
    // SELECT user_id, SUM(market_exposure) as total_exposure
    // FROM (
    //   SELECT user_id, match_id, game_type, event_id, MIN(exposure_amount) as market_exposure
    //   FROM user_exposures
    //   GROUP BY user_id, match_id, game_type, event_id
    // ) as subquery
    // GROUP BY user_id

    // ── LIABILITY-ONLY net exposure ──────────────────────────────────────
    // We clamp positive market_exposure to 0 with LEAST(..., 0). Rationale:
    // "net_exposure" is a *liability* metric — it should reflect the worst
    // case LOSS the user can take (a negative number) so the admin UI can
    // show how much of the user's wallet is at risk. When a user has hedged
    // / profit-booked, every team's exposure is positive (guaranteed P/L),
    // there is no liability, so the value must be 0 — not the smaller
    // positive (which previously made the UI display "+50" instead of "0"
    // for fully-locked profit markets).
    //
    // Locked profits intentionally do NOT inflate this number. There is no
    // GT/balance formula in the codebase that uses net_exposure
    // arithmetically — it is read purely for display in admin lists.
    const query = `
    SELECT user_id, SUM(market_exposure) AS total_exposure
FROM (

  /* 1️⃣ GROUPED SPORTS MARKETS (Worst-case per market, clamped to ≤ 0) */
  SELECT
    user_id,
    match_id,
    game_type,
    event_id,
    LEAST(MIN(exposure_amount), 0) AS market_exposure
  FROM user_exposures
  WHERE
    category <> 'casino'
    AND game_type IS NOT NULL
    AND game_type NOT IN ('Normal', 'Ball By Ball', 'Over By Over', 'khado', 'meter' , 'fancy1')
    AND game_type NOT LIKE '%Overs Line%'
    AND NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay' OR team_name ILIKE '%totalstake')
  GROUP BY user_id, match_id, game_type, event_id

  UNION ALL

  /* 2️⃣ INDEPENDENT MARKETS (Additive Exposure, clamped to ≤ 0) */
  SELECT
    user_id,
    NULL AS match_id,
    game_type,
    event_id,
    LEAST(exposure_amount, 0) AS market_exposure
  FROM user_exposures
  WHERE
    (
      category = 'casino'
      OR game_type IS NULL
      OR game_type IN ('Normal', 'Ball By Ball', 'Over By Over', 'khado', 'meter', 'fancy1')
      OR game_type LIKE '%Overs Line%'
    )
    AND NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay' OR team_name ILIKE '%totalstake')

) subquery
GROUP BY user_id;

    `;

    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    // Transform into a map
    const exposureMap = {};
    for (const record of results) {
      // Ensure we only sum negative exposures (losses). 
      // Usually exposure is negative. If min is positive, it means guaranteed profit, so exposure is 0.
      // However, standard practice is often just sum(min). Let's stick to sum(min).
      // If min is positive, it adds to "exposure" which might be wrong if exposure means "liability".
      // But usually "Net Exposure" includes locked profit. 
      // Let's assume standard behavior: Sum of worst case scenarios.
      // If worst case is +100, then it contributes +100 to "Available Balance" calculation?
      // Wait, User GT = Credit - Limit + NetExposure.
      // If NetExposure is -100, GT decreases.
      // If NetExposure is +100 (guaranteed win), GT increases.
      // So Sum(Min) is correct.

      let net = parseFloat(record.total_exposure) || 0;

      // Safety check: Exposure should generally not exceed 0 (be positive) unless it's a guaranteed win across all markets.
      // But usually we only care about liability. 
      // Let's keep it as is.

      exposureMap[record.user_id] = net;
    }

    // console.log("exposureMap from net exposure helper", exposureMap);

    return exposureMap;
  } catch (error) {
    console.error("Error calculating net exposure:", error);
    throw error;
  }
};

/**
 * Net exposure (worst-case liability, clamped to ≤ 0) for a SINGLE user.
 * Uses the identical grouping/clamping logic as calculateNetExposure so the
 * value pushed over the socket after a bet matches what /net-exposures (and a
 * page refresh) would show.
 *
 * @param {number|string} user_id
 * @returns {Promise<number>} negative liability, or 0 when fully hedged
 */
export const calculateUserNetExposure = async (user_id, transaction = null) => {
  const query = `
    SELECT SUM(market_exposure) AS total_exposure
    FROM (

      /* 1️⃣ GROUPED SPORTS MARKETS (Worst-case per market, clamped to ≤ 0) */
      SELECT LEAST(MIN(exposure_amount), 0) AS market_exposure
      FROM user_exposures
      WHERE
        user_id = :user_id
        AND category <> 'casino'
        AND game_type IS NOT NULL
        AND game_type NOT IN ('Normal', 'Ball By Ball', 'Over By Over', 'khado', 'meter', 'fancy1')
        AND game_type NOT LIKE '%Overs Line%'
        AND NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay' OR team_name ILIKE '%totalstake')
      GROUP BY match_id, game_type, event_id

      UNION ALL

      /* 2️⃣ INDEPENDENT MARKETS (Additive Exposure, clamped to ≤ 0) */
      SELECT LEAST(exposure_amount, 0) AS market_exposure
      FROM user_exposures
      WHERE
        user_id = :user_id
        AND (
          category = 'casino'
          OR game_type IS NULL
          OR game_type IN ('Normal', 'Ball By Ball', 'Over By Over', 'khado', 'meter', 'fancy1')
          OR game_type LIKE '%Overs Line%'
        )
        AND NOT (team_name ILIKE '%back' OR team_name ILIKE '%lay' OR team_name ILIKE '%totalstake')

    ) subquery;
  `;

  const rows = await sequelize.query(query, {
    replacements: { user_id },
    type: sequelize.QueryTypes.SELECT,
    ...(transaction ? { transaction } : {}),
  });

  return parseFloat(rows[0]?.total_exposure) || 0;
};

/**
 * Recompute a user's total exposure from user_exposures and persist it to
 * total_exposures.
 *
 * WHY THIS EXISTS: total_exposures used to be written ONLY at bet placement
 * (placeBet STEP 10). The active settlement worker (settlementv2) and the
 * manual-settle controller both clear user_exposures without recomputing the
 * total, so the row kept its placement-time value forever — a user with no open
 * bets still showed a stale liability (and it is read back by ExposureService
 * and pushed over the balance socket). Call this anywhere exposures are cleared
 * or rewritten so the two tables cannot drift.
 *
 * Safe by construction: with no exposure rows the SUM is NULL -> 0.
 *
 * @param {number|string} user_id
 * @param {import('sequelize').Transaction} [transaction] optional, to join a caller's tx
 * @returns {Promise<number>} the persisted total (<= 0)
 */
export const syncTotalExposure = async (user_id, transaction = null) => {
  const TotalExposure = (await import('../model/user/TotalExposure.js')).default;
  const total = await calculateUserNetExposure(user_id, transaction);
  await TotalExposure.upsert(
    { user_id: Number(user_id), total_exposure: total },
    transaction ? { transaction } : {}
  );
  return total;
};
