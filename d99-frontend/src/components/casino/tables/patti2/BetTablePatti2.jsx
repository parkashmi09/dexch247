function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  const keys = [nat, nat.toLowerCase(), nat.trim(), nat.toLowerCase().trim()];
  for (const k of keys) {
    if (exposures[k] !== undefined) return exposures[k];
  }
  return null;
}

function ExposureDisplay({ value }) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return null;
  return (
    <div className={`casino-nation-book ${num >= 0 ? "text-success" : "text-danger"}`}>
      {num}
    </div>
  );
}

function PlayerMatchRow({ item, onBetClick, exposures }) {
  if (!item) return null;
  const suspended = item.gstatus !== "OPEN";
  const exp = getExp(exposures, item.nat);
  return (
    <div className="casino-table-row ">
      <div className="casino-nation-detail">
        <div className="casino-nation-name">
          {item.nat}
          <ExposureDisplay value={exp} />
        </div>
      </div>
      <div
        className={`casino-odds-box back${suspended ? " suspended-box" : ""}`}
        onClick={() => !suspended && item.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
      >
        <span className="casino-odds">{item.b || 0}</span>
      </div>
      <div
        className={`casino-odds-box lay${suspended ? " suspended-box" : ""}`}
        onClick={() => !suspended && item.l > 0 && onBetClick?.(item.l, item.nat, item, "lay")}
      >
        <span className="casino-odds">{item.l || 0}</span>
      </div>
    </div>
  );
}

function MiniBaccaratRow({ item, onBetClick, exposures }) {
  if (!item) return null;
  const suspended = item.gstatus !== "OPEN";
  const exp = getExp(exposures, item.nat);
  return (
    <div className="casino-table-row mini-baccarat">
      <div className="casino-nation-detail">
        <div className="casino-nation-name">
          {item.nat}
          <ExposureDisplay value={exp} />
        </div>
      </div>
      <div
        className={`casino-odds-box back${suspended ? " suspended-box" : ""}`}
        onClick={() => !suspended && item.b > 0 && onBetClick?.(item.b, item.nat, item, "back")}
      >
        <span className="casino-odds">{item.b || 0}</span>
      </div>
    </div>
  );
}

function TotalRow({ item, onBetClick, exposures }) {
  if (!item) return null;
  // Total A/B is a Fancy2 back/lay market. The rate is carried in bbhav/lbhav
  // (profit-per-100), NOT in bs/ls — those are the max sizes (~300000) and were
  // being shown as the odds by mistake. Display the bhav, but bet/settle at the
  // decimal it implies (bhav/100 + 1): settlement pays stake × (odds − 1), so
  // sending the raw bhav (or the size) would massively overpay.
  const suspended = item.gstatus !== "OPEN";
  const layBhav = parseFloat(item.lbhav) || 0;
  const backBhav = parseFloat(item.bbhav) || 0;
  const laySuspended = suspended || layBhav <= 0;
  const backSuspended = suspended || backBhav <= 0;
  const exp = getExp(exposures, item.nat);
  return (
    <div className="casino-table-row ">
      <div className="casino-nation-detail">
        <div className="casino-nation-name">
          {item.nat}
          <ExposureDisplay value={exp} />
        </div>
      </div>
      <div
        className={`casino-odds-box lay${laySuspended ? " suspended-box" : ""}`}
        onClick={() => !laySuspended && onBetClick?.(layBhav / 100 + 1, item.nat, item, "lay")}
      >
        <span className="casino-volume">{item.l}</span>
        <span className="casino-odds">{layBhav}</span>
      </div>
      <div
        className={`casino-odds-box back${backSuspended ? " suspended-box" : ""}`}
        onClick={() => !backSuspended && onBetClick?.(backBhav / 100 + 1, item.nat, item, "back")}
      >
        <span className="casino-volume">{item.b}</span>
        <span className="casino-odds">{backBhav}</span>
      </div>
    </div>
  );
}

function HalfTable({ playerMatch, miniBaccarat, total, onBetClick, exposures, side }) {
  return (
    <div className={`casino-table-${side}-box`}>
      <div className="casino-table-body">
        <PlayerMatchRow item={playerMatch} onBetClick={onBetClick} exposures={exposures} />
        <MiniBaccaratRow item={miniBaccarat} onBetClick={onBetClick} exposures={exposures} />
        <TotalRow item={total} onBetClick={onBetClick} exposures={exposures} />
      </div>
    </div>
  );
}

export default function BetTablePatti2({ tableData = [], onBetClick, exposures = {}, remark = "" }) {
  // sid=1 Player A Match, sid=2 Player B Match
  // sid=3 Total A (Fancy2/total), sid=4 Total B (Fancy2/total)
  // sid=5 Mini Baccarat A (Fancy1/Baccarat), sid=6 Mini Baccarat B (Fancy1/Baccarat)
  // sid=7 Color Plus (Fancy/plus)
  const playerA = tableData.find((d) => d.sid === 1 || (d.nat === "Player A" && d.etype === "Match"));
  const playerB = tableData.find((d) => d.sid === 2 || (d.nat === "Player B" && d.etype === "Match"));
  const totalA = tableData.find((d) => d.sid === 3 || (d.nat === "Total A" && d.subtype === "total"));
  const totalB = tableData.find((d) => d.sid === 4 || (d.nat === "Total B" && d.subtype === "total"));
  const miniBacA = tableData.find((d) => d.sid === 5 || (d.nat === "Mini Baccarat A" && d.subtype === "Baccarat"));
  const miniBacB = tableData.find((d) => d.sid === 6 || (d.nat === "Mini Baccarat B" && d.subtype === "Baccarat"));
  const colorPlus = tableData.find((d) => d.sid === 7 || (d.nat === "Color Plus" && d.subtype === "plus"));

  const cpSuspended = colorPlus ? colorPlus.gstatus !== "OPEN" : true;
  const cpExp = getExp(exposures, colorPlus?.nat);

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        <HalfTable
          playerMatch={playerA}
          miniBaccarat={miniBacA}
          total={totalA}
          onBetClick={onBetClick}
          exposures={exposures}
          side="left"
        />
        <div className="casino-table-box-divider"></div>
        <HalfTable
          playerMatch={playerB}
          miniBaccarat={miniBacB}
          total={totalB}
          onBetClick={onBetClick}
          exposures={exposures}
          side="right"
        />
      </div>

      {colorPlus && (
        <div className="casino-table-full-box color-plus my-2">
          <div
            className={`casino-odds-box back${cpSuspended ? " suspended-box" : ""}`}
            onClick={() => !cpSuspended && colorPlus.b > 0 && onBetClick?.(colorPlus.b, "Color Plus", colorPlus, "back")}
          >
            <span className="casino-odds">
              Color Plus
            </span>
            <ExposureDisplay value={cpExp} />
          </div>
        </div>
      )}

      {remark && (
        <div className="casino-remark mt-1">
          <marquee scrollAmount="3">{remark}</marquee>
        </div>
      )}
    </div>
  );
}
