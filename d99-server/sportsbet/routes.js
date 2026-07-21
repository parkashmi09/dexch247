
import express from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();



import controller from "./sportbetscontroller.js";
import SportsBet from "../model/user/SportsBet.js";
import ExposureController from "../controller/user/userExposureController.js";





router.get('/test', (req, res) => {
  res.send("sports bet new api working ")

});

router.post('/place', authMiddleware, controller.placeBet);
router.get('/buffer-time', controller.getBufferTime);
router.get('/exposures/:user_id', controller.getUserExposures);

router.post('/matchexposures/match', authMiddleware, ExposureController.getExposureById);
router.get('/matchexposures/match', authMiddleware, ExposureController.getExposureByQuery);



router.get('/wallet/:uuid', controller.getWalletBalance);
// GET /open/:userId/:matchId
// 1) Existing: open bets for a single match
router.get('/open/:userUuid/:matchId', async (req, res) => {
  const { userUuid, matchId } = req.params;
  try {

    const uid = userUuid;

    // fetch only open bets for that match
    const { rows: bets } = await db.query(
      `SELECT
         id,
         selection_name,
         odds,
         stake_amount AS stake,
         liability,
         bet_type AS type
       FROM sports_bets
       WHERE user_id = $1
         AND match_id = $2
         AND status   = 'open'`,
      [uid, matchId]
    );

    return res.json({ success: true, bets });
  } catch (err) {
    console.error('Error fetching open bets by match:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch open bets' });
  }
});

// 2) get ALL open bets for that user
//    GET /sportsbetting/open/:userUuid
router.get('/history/:userUuid', async (req, res) => {
  const { userUuid } = req.params;
  try {

    const uid = userUuid;

    // fetch only open bets across all matches
    const { rows: bets } = await db.query(
      `SELECT
  id, match_id, selection_name, odds, stake_amount AS stake, status,match_title,bet_type,game_type,
  liability, created_at, updated_at,result_status
FROM sports_bets
WHERE user_id = $1
ORDER BY created_at DESC;`,
      [uid]
    );

    return res.json({ success: true, bets });
  } catch (err) {
    console.error('Error fetching all open bets:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch open bets' });
  }
});

// GET /sportsbetting/open/count/:userUuid
router.get('/opencount/:userUuid', async (req, res) => {
  const { userUuid } = req.params;
  console.log(userUuid);
  try {
    // look up internal users.id by uuid
    const { rows: uRows } = await db.query(
      `SELECT id FROM users WHERE uuid = $1 LIMIT 1`,
      [userUuid]
    );
    console.log(uRows);
    if (!uRows.length) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const uid = uRows[0].id;

    // 2) Count open bets
    const { rows } = await db.query(
      `SELECT COUNT(*) AS count
         FROM sports_bets
         WHERE user_id = $1
           AND status  = 'open'`,
      [uid]
    );
    const count = parseInt(rows[0].count, 10);
    console.log(count);
    return res.json({ success: true, count });
  } catch (err) {
    console.error('Error fetching open bets count:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch count' });
  }
});

// GET /sportsbetting/transfers/:userUuid
router.get('/transfers/:userUuid', async (req, res) => {
  const { userUuid } = req.params;
  try {
    // 1) resolve internal user.id from uuid
    const { rows: uRows } = await db.query(
      `SELECT id FROM users WHERE uuid = $1 LIMIT 1`,
      [userUuid]
    );
    if (!uRows.length) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const uid = uRows[0].id;

    // 2) fetch all transfers involving that user
    //    if they are the “to” → credit; if they are the “from” → debit
    const { rows: transfers } = await db.query(
      `SELECT
         id,
         amount,
         created_at AS date,
         CASE
           WHEN from_type = 'staff' AND to_type = 'user' AND to_id = $1 THEN 'credit'
           WHEN from_type = 'user'  AND to_type = 'staff' AND from_id = $1 THEN 'debit'
           ELSE direction  -- fallback to whatever is in your 'direction' column
         END AS type
       FROM staff_transfers
       WHERE
         (to_type   = 'user' AND to_id   = $1)
         OR
         (from_type = 'user' AND from_id = $1)
       ORDER BY created_at DESC`,
      [uid]
    );

    return res.json({ success: true, transfers });
  } catch (err) {
    console.error('Error fetching transfers:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch transfers' });
  }
});
router.put('/password/:userUuid', async (req, res) => {
  const { userUuid } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Both oldPassword and newPassword are required'
    });
  }

  try {
    // 1) lookup internal ID + current hash
    const { rows: uRows } = await db.query(
      `SELECT id, password FROM users WHERE uuid = $1 LIMIT 1`,
      [userUuid]
    );
    if (!uRows.length) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { id: uid, password: currentHash } = uRows[0];

    // 2) verify old password
    const matches = await bcrypt.compare(oldPassword, currentHash);
    if (!matches) {
      return res.status(401).json({ success: false, error: 'Old password incorrect' });
    }

    // 3) hash + update new password in Postgres (and store plaintext in password2)
    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE users
          SET password  = $1,
              password2 = $2
        WHERE uuid = $3`,
      [newHash, newPassword, userUuid]
    );

    // 4) propagate to Mongo via your /profile/:id endpoint
    try {
      await axios.put(
        `https://apisky.codefactory.games/users/profile/${userUuid}`,
        {
          password: newPassword,
          password2: newPassword,
          updatedAt: new Date()
        },
        { timeout: 5000 }
      );
    } catch (err) {
      console.error('Failed to update Mongo profile:', err.message);
      // choosing to log & continue
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

const getTreeIdsSql = `
WITH RECURSIVE tree AS (
  SELECT id FROM staff WHERE id = $1
  UNION ALL
  SELECT s.id
  FROM staff s
  JOIN tree t ON s.parent_id = t.id
)
SELECT array_agg(id) AS ids FROM tree
`;
async function visibleIds(staffId) {
  const { rows: [{ ids }] } = await db.query(getTreeIdsSql, [staffId]);
  return ids;
}
const getAdminBets = async (req, res) => {
  try {
    console.log("Filters from frontend:", req.query);

    // parse & sanitize pagination
    let page = Number(req.query.page || 1);
    let limit = Number(req.query.limit || 10);
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = 10;

    const {
      search,
      status,
      gameResult,
      betType,
      startDate,
      endDate,
      currency = "usd",
      userIds,
    } = req.query;

    // staff visibility
    let ids = await visibleIds(req.headers["x-staff-id"]);
    ids = (Array.isArray(ids) ? ids : ids).map((x) => Number(x)); // ensure numbers

    let where = "WHERE 1=1";
    const params = [];

    // Staff visibility filter (supports super-admin id === 1)
    if (ids.includes(1)) {
      where +=
        " AND (u.parent_staff_id = ANY($" +
        (params.length + 1) +
        "::bigint[]) OR u.parent_staff_id IS NULL)";
    } else {
      where += " AND u.parent_staff_id = ANY($" + (params.length + 1) + "::bigint[])";
    }
    params.push(ids);

    // status filter
    if (status) {
      where += " AND sb.status = $" + (params.length + 1);
      params.push(status);
    }

    // ----------------------------
    // SIMPLE gameResult filter (case-insensitive exact)
    // ----------------------------
    if (gameResult) {
      // ensure we use the exact value the frontend sent, lowercased
      const val = String(gameResult).toLowerCase();
      where += " AND LOWER(sb.result_status) = $" + (params.length + 1);
      params.push(val);
    }

    // betType filter
    if (betType) {
      where += " AND sb.bet_type = $" + (params.length + 1);
      params.push(betType);
    }

    // date filters — compare against match_start_time
    if (startDate) {
      where += " AND sb.match_start_time >= $" + (params.length + 1);
      params.push(String(startDate) + " 00:00:00");
    }
    if (endDate) {
      where += " AND sb.match_start_time <= $" + (params.length + 1);
      params.push(String(endDate) + " 23:59:59");
    }

    // search across multiple columns (ILIKE)
    if (search) {
      const searchLike = `%${search}%`;
      where +=
        " AND (sb.match_title ILIKE $" +
        (params.length + 1) +
        " OR sb.team_one ILIKE $" +
        (params.length + 2) +
        " OR sb.team_two ILIKE $" +
        (params.length + 3) +
        " OR sb.selection_name ILIKE $" +
        (params.length + 4) +
        " OR u.name ILIKE $" +
        (params.length + 5) +
        ")";
      params.push(searchLike, searchLike, searchLike, searchLike, searchLike);
    }

    // userIds filter (comma separated or array)
    if (userIds) {
      const idsArr = Array.isArray(userIds) ? userIds : String(userIds).split(",");
      const placeholders = idsArr.map((_, i) => `$${params.length + i + 1}`).join(", ");
      where += ` AND sb.user_id IN (${placeholders})`;
      params.push(...idsArr.map((v) => Number(v)));
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT sb.*, u.name as username, COALESCE(sc.game_name, 'Unknown') as game_name
      FROM sports_bets sb
      LEFT JOIN users u ON sb.user_id = u.id
      LEFT JOIN sports_config sc ON sb.category::integer = sc.game_id
      ${where}
      ORDER BY sb.stake_amount DESC, sb.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const paramsForQuery = params.slice();
    paramsForQuery.push(limit, offset);

    // LOGGING: show the built where clause, the final query and params used
    console.log("Built WHERE:", where);
    console.log("Final SQL (preview):", query.replace(/\s+/g, " "));
    console.log("Params for main query:", paramsForQuery);
    console.log("Params for count query:", params);

    const { rows } = await db.query(query, paramsForQuery);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM sports_bets sb
      LEFT JOIN users u ON sb.user_id = u.id
      LEFT JOIN sports_config sc ON sb.category::integer = sc.game_id
      ${where}
    `;
    const { rows: countRows } = await db.query(countQuery, params);
    const total = Number(countRows[0].total || 0);

    res.json({
      success: true,
      bets: rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        page: page,
        limit: limit,
      },
    });
  } catch (err) {
    console.error("getAdminBets error:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
};




const updateBetStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resultDeclaredTime } = req.body;

  if (!['open', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  const query = `
    UPDATE sports_bets
    SET status = $1, match_end_time = $2
    WHERE id = $3
  `;

  try {
    await db.query(query, [status, resultDeclaredTime, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteBet = async (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM sports_bets WHERE id = $1`;

  try {
    await db.query(query, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



router.get('/admin/bets', getAdminBets);
router.put('/admin/bets/:id/status', updateBetStatus);
router.delete('/admin/bets/:id', deleteBet);
router.get('/settle', controller.settleBets);
// module.exports = router;
export default router;
