const SEVEN_IMG = "/assets/img/dice/trape-seven.png";

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? exposures[nat.trim()] ?? null;
}

function ExpSpan({ value }) {
  if (value === null || value === undefined) return null;
  const n = parseFloat(value);
  if (isNaN(n) || n === 0) return null;
  return (
    <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>
      {n}
    </div>
  );
}

function OddsBox({ item, label, onBet, exposures }) {
  if (!item) return null;
  const sus = item.gstatus !== "OPEN";
  const exp = getExp(exposures, item.nat);
  const displayName = label || item.nat;
  return (
    <div className="doli-odds-box">
      <div className="odd-name">{displayName}</div>
      <div
        className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
        onClick={() => !sus && item.b > 0 && onBet?.(item.b, item.nat, item, "back")}
      >
        <span className="casino-odds">{item.b || 0}</span>
        <span className="casino-volume">
          <ExpSpan value={exp} />
        </span>
      </div>
    </div>
  );
}

export default function BetTableDoliDana({ tableData = [], onBetClick, exposures = {} }) {
  const playerA = tableData.find((d) => d.subtype === "main" && d.nat === "Player A");
  const playerB = tableData.find((d) => d.subtype === "main" && d.nat === "Player B");
  const anyPair = tableData.find((d) => d.subtype === "anypair");
  const odd = tableData.find((d) => d.subtype === "oddeven" && d.nat === "Odd");
  const even = tableData.find((d) => d.subtype === "oddeven" && d.nat === "Even");
  const lucky7 = tableData.find((d) => d.nat === "Lucky 7");
  const gt7 = tableData.find((d) => d.nat === "Greater than 7");
  const lt7 = tableData.find((d) => d.nat === "Less than 7");
  const pairs = tableData.filter((d) => d.subtype === "sumpair").sort((a, b) => a.sr - b.sr);
  const sumTotals = tableData.filter((d) => d.subtype === "sumtotal").sort((a, b) => a.sr - b.sr);

  function renderPlayerRow(item) {
    if (!item) return null;
    const sus = item.gstatus !== "OPEN";
    const exp = getExp(exposures, item.nat);
    return (
      <div className="casino-table-row ">
        <div className="casino-nation-detail">
          <div className="casino-nation-name">{item.nat}</div>
          <div className={`casino-nation-book ${exp && parseFloat(exp) >= 0 ? "text-success" : "text-success"}`}>
            {exp ? <ExpSpan value={exp} /> : ""}
          </div>
        </div>
        <div className="doli-odds-box">
          <div
            className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
            onClick={() => !sus && item.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
          >
            <span className="casino-odds">{item.b || 0}</span>
            <span className="casino-volume">{item.bs || 0}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        <div className="doli-main">
          <div className="players-bet">
            {renderPlayerRow(playerA)}
            {renderPlayerRow(playerB)}
          </div>

          <div className="side-bets">
            <div className="any-pair">
              <OddsBox item={anyPair} onBet={onBetClick} exposures={exposures} />
            </div>

            <div className="odd-even-pair">
              <div className="bets-box">
                <OddsBox item={odd} onBet={onBetClick} exposures={exposures} />
                <OddsBox item={even} onBet={onBetClick} exposures={exposures} />
              </div>
            </div>

            <div className="lucky7-pair">
              <div className="bets-box">
                <OddsBox item={lt7} label="< 7" onBet={onBetClick} exposures={exposures} />
                <div className="doli-odds-box">
                  <div className="seven-box">
                    <img src={SEVEN_IMG} alt="7" />
                  </div>
                </div>
                <OddsBox item={gt7} label="> 7" onBet={onBetClick} exposures={exposures} />
              </div>
            </div>
          </div>
        </div>

        <div className="doli-other-bets">
          <div className="particular-pair">
            <h4>Particular Pair</h4>
            <div className="bets-box">
              {pairs.map((p) => (
                <OddsBox key={p.sid} item={p} onBet={onBetClick} exposures={exposures} />
              ))}
            </div>
          </div>

          <div className="sum-odds">
            <h4>Odds of Sum Total</h4>
            <div className="bets-box">
              {sumTotals.map((s) => (
                <OddsBox key={s.sid} item={s} onBet={onBetClick} exposures={exposures} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
