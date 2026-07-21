function getExposure(exposures, nat) {
  if (!nat || !exposures) return null;
  const keys = [nat, nat.toLowerCase(), nat.trim(), nat.toLowerCase().trim()];
  for (const k of keys) {
    if (exposures[k] !== undefined) return exposures[k];
  }
  return null;
}

function ExposureDisplay({ value, className = "" }) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return null;
  return (
    <div className={`casino-nation-book ${num >= 0 ? "text-success" : "text-danger"}${className ? " " + className : ""}`}>
      {num}
    </div>
  );
}

export default function BetTableTrap({ tableData = [], onBetClick, exposures = {}, remark = "" }) {
  // Player A / Player B main match items
  const playerA = tableData.find((s) => s.nat === "Player A" && s.etype === "Match");
  const playerB = tableData.find((s) => s.nat === "Player B" && s.etype === "Match");

  // High/Low: subtype=highlow, visible=1 or gstatus=OPEN
  const highlowItem = tableData.find(
    (s) => s.subtype === "highlow" && (s.visible === 1 || s.gstatus === "OPEN")
  ) || tableData.find((s) => s.subtype === "highlow");

  // JQK: subtype=jqk, visible=1 or gstatus=OPEN
  const jqkItem = tableData.find(
    (s) => s.subtype === "jqk" && (s.visible === 1 || s.gstatus === "OPEN")
  ) || tableData.find((s) => s.subtype === "jqk");

  // Parse high/low odds
  let lowOdd = null;
  let highOdd = null;
  if (highlowItem?.odds) {
    for (const o of highlowItem.odds) {
      if (o.nat === "Low") lowOdd = o;
      else if (o.nat === "High") highOdd = o;
    }
    // fallback: odds[0]=High, odds[1]=Low per spec
    if (!highOdd && !lowOdd) {
      highOdd = highlowItem.odds[0] || null;
      lowOdd = highlowItem.odds[1] || null;
    }
  }

  // Parse JQK odds
  const jqkOdd = jqkItem?.odds?.[0] || null;

  const highlowSuspended = !highlowItem || highlowItem.gstatus !== "OPEN";
  const jqkSuspended = !jqkItem || jqkItem.gstatus !== "OPEN";
  const playerASuspended = !playerA || playerA.gstatus !== "OPEN";
  const playerBSuspended = !playerB || playerB.gstatus !== "OPEN";

  const expPlayerA = getExposure(exposures, "Player A");
  const expPlayerB = getExposure(exposures, "Player B");
  const expLow = getExposure(exposures, highlowItem ? `${highlowItem.nat} Low` : "Low");
  const expHigh = getExposure(exposures, highlowItem ? `${highlowItem.nat} High` : "High");
  const expJQK = getExposure(exposures, jqkItem ? `${jqkItem.nat} JQK` : "JQK");

  function handlePlayerClick(item, type) {
    if (!item || item.gstatus !== "OPEN") return;
    const odds = type === "back" ? item.b : item.l;
    if (!odds || odds <= 0) return;
    onBetClick?.(odds, item.nat, item, type);
  }

  function handleLowClick() {
    if (highlowSuspended || !lowOdd) return;
    const odds = lowOdd.b || 0;
    if (!odds) return;
    // Include the active card position so settlement knows which card ("Card N Low").
    const sel = `${highlowItem.nat} Low`;
    onBetClick?.(odds, sel, {
      ...highlowItem,
      nat: sel,
      _parentSid: highlowItem.sid,
      sid: lowOdd.sno || lowOdd.sid || highlowItem.sid,
    }, "back");
  }

  function handleHighClick() {
    if (highlowSuspended || !highOdd) return;
    const odds = highOdd.b || 0;
    if (!odds) return;
    const sel = `${highlowItem.nat} High`;
    onBetClick?.(odds, sel, {
      ...highlowItem,
      nat: sel,
      _parentSid: highlowItem.sid,
      sid: highOdd.sno || highOdd.sid || highlowItem.sid,
    }, "back");
  }

  function handleJQKClick(type) {
    if (jqkSuspended || !jqkOdd) return;
    const odds = type === "back" ? (jqkOdd.b || 0) : (jqkOdd.l || jqkItem?.l || 0);
    if (!odds) return;
    const sel = `${jqkItem.nat} JQK`;
    onBetClick?.(odds, sel, {
      ...jqkItem,
      nat: sel,
      _parentSid: jqkItem.sid,
      sid: jqkOdd.sno || jqkOdd.sid || jqkItem.sid,
    }, type);
  }

  return (
    <div className="casino-table">
      {/* Player A / Player B */}
      <div className="casino-table-box">
        <div className="casino-table-left-box">
          <div className="casino-table-body">
            <div className={`casino-table-row${playerASuspended ? "" : ""}`}>
              <div className="casino-nation-detail">
                <div className="casino-nation-name">Player A</div>
                <ExposureDisplay value={expPlayerA} />
              </div>
              <div
                className={`casino-odds-box back${playerASuspended ? " suspended-box" : ""}`}
                onClick={() => handlePlayerClick(playerA, "back")}
              >
                <span className="casino-odds">{playerA?.b || 0}</span>
              </div>
              <div
                className={`casino-odds-box lay${playerASuspended ? " suspended-box" : ""}`}
                onClick={() => handlePlayerClick(playerA, "lay")}
              >
                <span className="casino-odds">{playerA?.l || 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="casino-table-box-divider"></div>
        <div className="casino-table-right-box">
          <div className="casino-table-body">
            <div className={`casino-table-row${playerBSuspended ? "" : ""}`}>
              <div className="casino-nation-detail">
                <div className="casino-nation-name">Player B</div>
                <ExposureDisplay value={expPlayerB} />
              </div>
              <div
                className={`casino-odds-box back${playerBSuspended ? " suspended-box" : ""}`}
                onClick={() => handlePlayerClick(playerB, "back")}
              >
                <span className="casino-odds">{playerB?.b || 0}</span>
              </div>
              <div
                className={`casino-odds-box lay${playerBSuspended ? " suspended-box" : ""}`}
                onClick={() => handlePlayerClick(playerB, "lay")}
              >
                <span className="casino-odds">{playerB?.l || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low/High + JQK */}
      <div className="casino-table-box mt-3 sevenupbox">
        <div className="casino-table-left-box">
          <h4 className="d-md-none mb-2">Player</h4>
          <div className="seven-up-down-box">
            {/* Low */}
            <div
              className={`up-box${highlowSuspended ? " suspended-box" : ""}`}
              onClick={handleLowClick}
              style={{ cursor: highlowSuspended ? "default" : "pointer" }}
            >
              <ExposureDisplay value={expLow} className="up-down-book" />
              <div className="text-end">
                <div className="up-down-odds">{lowOdd?.b || 0}</div>
                <span>Low</span>
              </div>
            </div>
            {/* Seven box */}
            <div className="seven-box">
              <img src="/assets/img/trape-seven.png" alt="seven" />
            </div>
            {/* High */}
            <div
              className={`down-box${highlowSuspended ? " suspended-box" : ""}`}
              onClick={handleHighClick}
              style={{ cursor: highlowSuspended ? "default" : "pointer" }}
            >
              <ExposureDisplay value={expHigh} className="up-down-book" />
              <div className="text-start">
                <div className="up-down-odds">{highOdd?.b || 0}</div>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
        <div className="casino-table-box-divider"></div>
        {/* JQK */}
        <div className="casino-table-right-box">
          <div className="casino-table-body">
            <div className={`casino-table-row`}>
              <div className="casino-nation-detail">
                <div className="casino-nation-name">
                  <img src="/assets/img/cards/J.png" alt="J" />
                  <img src="/assets/img/cards/Q.png" alt="Q" />
                  <img src="/assets/img/cards/K.png" alt="K" />
                </div>
                <ExposureDisplay value={expJQK} />
              </div>
              <div
                className={`casino-odds-box back${jqkSuspended ? " suspended-box" : ""}`}
                onClick={() => handleJQKClick("back")}
              >
                <span className="casino-odds">{jqkOdd?.b || 0}</span>
              </div>
              <div
                className={`casino-odds-box lay${jqkSuspended ? " suspended-box" : ""}`}
                onClick={() => handleJQKClick("lay")}
              >
                <span className="casino-odds">{jqkOdd?.l || jqkItem?.l || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remark */}
      {remark && (
        <div className="casino-remark mt-3">
          <marquee scrollamount="3">{remark}</marquee>
        </div>
      )}
    </div>
  );
}
