import styles from "./BetTableLucky15.module.css";

// API sub order: 0 Runs, 1 Runs, 2 Runs, 4 Runs, 6 Runs, Wicket (indices 0–5)
const LABELS = ["0 Runs", "1 Runs", "2 Runs", "4 Runs", "6 Runs", "Wicket"];

function isLocked(row) {
  if (!row) return true;
  if (row.gstatus === "SUSPENDED") return true;
  const b = row.b;
  return b === 0 || b === undefined || b === null;
}

function formatMinMax(val) {
  if (val == null || val === "") return null;
  const n = Number(val);
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(val);
}

export default function BetTableLucky15({ data, exposures = {} }) {
  const sub = Array.isArray(data) ? data : [];
  const bets = [0, 1, 2, 3, 4, 5].map((idx) => {
    const row = sub[idx];
    return {
      type: row?.nat || LABELS[idx],
      odds: row?.b,
      limit: row?.bs,
      min: row?.min,
      max: row?.max,
      isLocked: isLocked(row),
      nat: row?.nat,
    };
  });

  const getExposure = (betType, nat) => {
    const keys = [nat, betType, nat?.toLowerCase(), betType?.toLowerCase()];
    for (const key of keys) {
      if (key && exposures[key] !== undefined) return exposures[key];
    }
    return 0;
  };

  return (
    <div className={`bet-table ${styles.betTable}`}>
      <div className="bet-table-header">
        <div className="nation-name">
          <span title="Runs">Runs</span>
        </div>
      </div>
      <div id="market-runs" className="bet-table-body collapse show container-fluid container-fluid-5">
        {/* Header row – 3 Back columns (hidden on mobile) */}
        {/* <div className={`row row5 ${styles.dNoneMobile}`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="col-6 col-md-4">
              <div className="fancy-tripple">
                <div className="bet-table-row">
                  <div className="nation-name"></div>
                  <div className="back bl-title back-title">Back</div>
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Body – 3 columns: Col1: 0 Runs, 4 Runs | Col2: 1 Runs, 6 Runs | Col3: 2 Runs, Wicket */}
        <div className="row row5">
          {[[0, 3], [1, 4], [2, 5]].map((colIndices, colIdx) => (
            <div key={colIdx} className="col-6 col-md-4">
              {colIndices.map((idx) => {
                const bet = bets[idx];
                const exposure = getExposure(bet.type, bet.nat);
                const showExposure = exposure !== 0;
                const minStr = formatMinMax(bet.min) ?? "50";
                const maxStr = formatMinMax(bet.max) ?? "25K";

                return (
                  <div key={idx} className="fancy-tripple">
                    <div className="bet-table-row">
                      <div className={`nation-name ${styles.dNoneMobile}`}>
                        <p>{bet.type}</p>
                        <p className="mb-0 book-red">
                          {showExposure
                            ? exposure < 0
                              ? exposure.toFixed(2)
                              : `+${exposure.toFixed(2)}`
                            : "0"}
                        </p>
                      </div>
                      <div
                        className={`bl-box back ${bet.isLocked ? styles.suspendedBox : ""}`}
                        data-title={bet.isLocked ? "SUSPENDED" : "OPEN"}
                      >
                        {!bet.isLocked && (
                          <>
                            <span className="d-block odds">{bet.odds ?? "–"}</span>
                            <span className="d-block">{bet.limit ?? "–"}</span>
                          </>
                        )}
                      </div>
                      <div className="fancy-min-max">
                        Min:<span>{minStr}</span> Max:<span>{maxStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
