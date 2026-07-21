function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function NationBook({ exposures, nat }) {
  const raw = getExp(exposures, nat);
  if (raw === null || raw === undefined) return <div className="casino-nation-book" />;
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return <div className="casino-nation-book" />;
  return (
    <div className="casino-nation-book">
      <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>
    </div>
  );
}

function isSus(item) {
  return !item || item.gstatus !== "OPEN";
}

export default function BetTableQueen({ tableData = [], onBetClick, exposures = {}, remark = "" }) {
  const totals = [
    { nat: "Total 0", sid: 1 },
    { nat: "Total 1", sid: 2 },
    { nat: "Total 2", sid: 3 },
    { nat: "Total 3", sid: 4 },
  ];

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        {totals.map(({ nat, sid }) => {
          const item = tableData.find((d) => d.nat === nat || d.sid === sid);
          const sus = isSus(item);
          const backOdds = sus ? 0 : item?.b || 0;
          const layOdds = sus ? 0 : item?.l || 0;

          return (
            <div key={nat} className="casino-odd-box-container">
              <div className="casino-nation-name">{nat}</div>
              <div
                className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
              >
                <span className="casino-odds">{backOdds}</span>
              </div>
              <div
                className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
                onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, nat, item, "lay")}
              >
                <span className="casino-odds">{layOdds}</span>
              </div>
              <NationBook exposures={exposures} nat={nat} />
            </div>
          );
        })}
      </div>

      {remark && (
        <div className="casino-remark mt-1">
          <marquee scrollamount="3">{remark}</marquee>
        </div>
      )}
    </div>
  );
}
