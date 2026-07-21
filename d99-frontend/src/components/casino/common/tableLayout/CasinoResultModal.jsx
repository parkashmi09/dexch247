import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { getDetailResults, getMyBets } from "../../../../apiservices/CasionApi.js";
import CasinoResultContent from "./CasinoResultContent.jsx";
import CasinoBetsAddon from "./CasinoBetsAddon.jsx";

function pad(n) { return String(n).padStart(2, "0"); }
function fmtDateTime(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

// Map a raw casino_bets row → the shape CasinoBetsAddon expects.
function mapBet(b) {
  const result = String(b.result_status || "").toLowerCase();
  const creditAmt = Number(b.credit_amt || 0);
  const exposer = Number(b.exposer || 0); // stored negative (locked liability)
  let win = 0;
  if (result === "won") win = creditAmt + exposer; // net profit
  else if (result === "lost") win = -creditAmt; // net loss
  const status = String(b.status || "").toLowerCase();
  return {
    nation: b.selection || b.player_name || "",
    rate: Number(b.odds) || b.odds,
    amount: Number(b.stake) || b.stake,
    win,
    date: fmtDateTime(b.created_at),
    ip: b.ip_address || "",
    browser: b.browser || "",
    side: String(b.type || "").toLowerCase(),
    deleted: status === "void" || result === "void" || status === "deleted",
  };
}

/**
 * Common result modal for all casino games.
 * Fetches detail-results on open, renders game-specific content via switch.
 *
 * When `betsAddon` is true (e.g. opened from Account Statement) the user's
 * bets table + Back/Lay/Deleted filter is rendered below the result content.
 */
export default function CasinoResultModal({ show, onHide, gameId, gameType, mid, title, betsAddon = false, bets }) {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userBets, setUserBets] = useState(null);
  const user = useSelector((s) => s.user.user);

  useEffect(() => {
    if (!show || !mid || !gameId) return;
    let cancelled = false;
    setLoading(true);
    setDetailData(null);

    getDetailResults(gameId, mid)
      .then((res) => {
        if (!cancelled && res) setDetailData(res);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [show, mid, gameId]);

  // When opened from Account Statement, load the user's real bets for this round.
  useEffect(() => {
    if (!betsAddon || !show || !mid) { setUserBets(null); return; }
    if (Array.isArray(bets)) { setUserBets(null); return; } // caller supplied bets
    const userId = user?.user_id || user?.id || user?._id;
    if (!userId) { setUserBets([]); return; }

    let cancelled = false;
    getMyBets(String(userId), mid)
      .then((res) => {
        if (cancelled) return;
        const raw = res?.bets || res?.data || [];
        setUserBets(Array.isArray(raw) ? raw.map(mapBet) : []);
      })
      .catch(() => { if (!cancelled) setUserBets([]); });

    return () => { cancelled = true; };
  }, [betsAddon, show, mid, bets, user]);

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>{title || "Result"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <i className="fa fa-spinner fa-spin"></i>
          </div>
        ) : (
          <>
            <CasinoResultContent gameType={gameType} detailData={detailData} />
            {betsAddon && <CasinoBetsAddon bets={Array.isArray(bets) ? bets : userBets || []} />}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
