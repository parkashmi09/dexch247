import { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { getUserMatchedBets } from "../../../apiservices/SportsApi.js";

// ─── Run Amount ladder ───────────────────────────────────────────────────────
// A session/fancy bet is a step function on the run-number line: yes/back wins
// when runValue >= line, no/lay wins when runValue < line. The user's net P&L
// at any run value is the sum of every open bet's contribution on this runner.
// We render one row per region boundary — (line-1) and (line) for each distinct
// line — so a single no@80 bet shows as rows 79 (+win) and 80 (-lose).
//
// dexch247 has no dedicated fancy-bets endpoint, so we read the user's open
// bets for the event and filter to THIS runner by name (the same name the bet's
// `selection_name`/`fancy_name` carries).

function buildLadder(bets) {
  const parsed = bets
    .map((b) => {
      const line = Number(b.odds);
      const stake = Number(b.stake_amount ?? b.stake);
      const marketType = String(b.market_type || "").toLowerCase();
      // fancy1/oddeven store market VOLUME in `size`, not a bhav — rebuild the
      // bhav from the price, matching the server's exposure tracker.
      const size =
        marketType === "fancy1" || marketType === "oddeven"
          ? (line - 1) * 100
          : Number(b.size);
      const liability = Number(b.liability);
      const isYes = ["yes", "back"].includes(String(b.bet_type || "").toLowerCase());

      const winAmt = isYes ? (stake * size) / 100 : stake;
      const loseAmt = isYes
        ? stake
        : !isNaN(liability) && liability > 0
          ? liability
          : (stake * size) / 100;

      return { line, isYes, winAmt, loseAmt };
    })
    .filter((b) => !isNaN(b.line) && b.line > 0 && !isNaN(b.winAmt) && !isNaN(b.loseAmt));

  if (!parsed.length) return [];

  const pnlAt = (r) => {
    const total = parsed.reduce((sum, b) => {
      const won = b.isYes ? r >= b.line : r < b.line;
      return sum + (won ? b.winAmt : -b.loseAmt);
    }, 0);
    return Math.round(total * 100) / 100;
  };

  const points = [...new Set(parsed.flatMap((b) => [Math.ceil(b.line) - 1, Math.ceil(b.line)]))]
    .filter((p) => p >= 0)
    .sort((a, b) => a - b);

  return points.map((p) => ({ score: String(p), position: pnlAt(p) }));
}

export default function RunAmountModal({ show, onClose, runnerName, eventId, userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!runnerName || !eventId || !userId) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getUserMatchedBets(eventId, userId);
      const all = Array.isArray(res?.data) ? res.data : [];
      const want = String(runnerName).trim().toLowerCase();
      const mine = all.filter((b) => {
        if (String(b.status || "").toLowerCase() === "cancelled") return false;
        const sel = String(b.selection_name || "").trim().toLowerCase();
        const fancy = String(b.fancy_name || "").trim().toLowerCase();
        return sel === want || fancy === want;
      });
      setRows(buildLadder(mine));
    } catch (err) {
      console.error("[RunAmountModal]", err);
      setError("Failed to load book data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [runnerName, eventId, userId]);

  useEffect(() => {
    if (show) load();
  }, [show, load]);

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Run Amount</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-3">Loading...</div>
        ) : error ? (
          <div className="text-center p-3">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-center p-3">No bets placed on this runner</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Run</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.score}</td>
                    <td className={`text-end ${row.position >= 0 ? "text-success" : "text-danger"}`}>
                      {row.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
