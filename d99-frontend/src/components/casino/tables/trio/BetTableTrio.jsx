import { memo } from "react";

// sid → nat mapping for trio
const SESSION_SID = 1;
const JUDGEMENT_SIDS = [2, 3];
const REDBLACK_SIDS = [4, 5, 6, 7];
const BACKONLY_SIDS = [8, 9, 10, 11, 12];

function findBySid(sub, sid) {
  return sub.find((s) => Number(s.sid) === sid);
}

function isSuspended(item) {
  return !item || item.gstatus !== "OPEN";
}

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExposureBook({ nat, exposures }) {
  const val = getExp(exposures, nat);
  if (val === null || val === undefined) return <div className="casino-nation-book text-center w-100" />;
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return <div className="casino-nation-book text-center w-100" />;
  return (
    <div
      className="casino-nation-book text-center w-100"
      style={{
        color: n >= 0 ? "var(--text-success, #00aa00)" : "var(--text-danger, #ff0000)",
        fontSize: "10px",
        fontWeight: "bold",
      }}
    >
      {n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)}
    </div>
  );
}

const BetTableTrio = memo(function BetTableTrio({ tableData = [], onBetClick, exposures = {} }) {
  const sub = tableData;

  const session = findBySid(sub, SESSION_SID);
  const judgements = JUDGEMENT_SIDS.map((sid) => findBySid(sub, sid));
  const redBlackItems = REDBLACK_SIDS.map((sid) => findBySid(sub, sid));
  const backOnlyItems = BACKONLY_SIDS.map((sid) => findBySid(sub, sid));

  function handleBet(item, side) {
    if (!item || isSuspended(item)) return;
    const odds = side === "back" ? item.b : item.l;
    if (!odds || parseFloat(odds) <= 0) return;
    onBetClick?.(parseFloat(odds), item.nat, item, side);
  }

  function renderSessionRow(item) {
    if (!item) return null;
    const susp = isSuspended(item);
    const backSusp = susp || !parseFloat(item.b);
    const laySusp = susp || !parseFloat(item.l);
    const backVol = item.bs ?? 80;
    const layVol = item.ls ?? 100;

    return (
      <div className="casino-odd-box-container">
        <div className="casino-nation-name pointer">
          {item.nat}
          <i className="fas fa-info-circle ms-1"></i>
        </div>
        <div
          className={`casino-odds-box back${backSusp ? " suspended-box" : ""}`}
          onClick={() => !backSusp && handleBet(item, "back")}
          style={{ cursor: backSusp ? "default" : "pointer" }}
        >
          <span className="casino-odds">{item.b || 0}</span>
          <span className="casino-volume">{backVol}</span>
        </div>
        <div
          className={`casino-odds-box lay${laySusp ? " suspended-box" : ""}`}
          onClick={() => !laySusp && handleBet(item, "lay")}
          style={{ cursor: laySusp ? "default" : "pointer" }}
        >
          <span className="casino-odds">{item.l || 0}</span>
          <span className="casino-volume">{layVol}</span>
        </div>
        <ExposureBook nat={item.nat} exposures={exposures} />
      </div>
    );
  }

  function renderBackLayRow(item) {
    if (!item) return null;
    const susp = isSuspended(item);
    const backSusp = susp || !parseFloat(item.b);
    const laySusp = susp || !parseFloat(item.l);

    return (
      <div key={item.sid} className="casino-odd-box-container">
        <div className="casino-nation-name">{item.nat}</div>
        <div
          className={`casino-odds-box back${backSusp ? " suspended-box" : ""}`}
          onClick={() => !backSusp && handleBet(item, "back")}
          style={{ cursor: backSusp ? "default" : "pointer" }}
        >
          <span className="casino-odds">{item.b || 0}</span>
        </div>
        <div
          className={`casino-odds-box lay${laySusp ? " suspended-box" : ""}`}
          onClick={() => !laySusp && handleBet(item, "lay")}
          style={{ cursor: laySusp ? "default" : "pointer" }}
        >
          <span className="casino-odds">{item.l || 0}</span>
        </div>
        <ExposureBook nat={item.nat} exposures={exposures} />
      </div>
    );
  }

  function renderBackOnlyRow(item) {
    if (!item) return null;
    const susp = isSuspended(item);
    const backSusp = susp || !parseFloat(item.b);

    return (
      <div key={item.sid} className="casino-odd-box-container">
        <div className="casino-nation-name">{item.nat}</div>
        <div
          className={`casino-odds-box back${backSusp ? " suspended-box" : ""}`}
          onClick={() => !backSusp && handleBet(item, "back")}
          style={{ cursor: backSusp ? "default" : "pointer" }}
        >
          <span className="casino-odds">{item.b || 0}</span>
        </div>
        <ExposureBook nat={item.nat} exposures={exposures} />
      </div>
    );
  }

  return (
    <div className="casino-table">
      {/* Section 1: Session + 3 Card Judgements */}
      <div className="casino-table-box">
        {renderSessionRow(session)}
        {judgements.map((item) => renderBackLayRow(item))}
      </div>

      {/* Section 2: Red / Black / Odd / Even */}
      <div className="casino-table-box triocards mt-3">
        {redBlackItems.map((item) => renderBackLayRow(item))}
      </div>

      {/* Section 3: Pair / Flush / Straight / Trio / Straight Flush — back only */}
      <div className="casino-table-box trioodds mt-3">
        {backOnlyItems.map((item) => renderBackOnlyRow(item))}
      </div>
    </div>
  );
});

export default BetTableTrio;
