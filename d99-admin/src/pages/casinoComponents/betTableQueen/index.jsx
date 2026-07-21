function getExposure(exposures, nat) {
  if (!nat) return 0;
  return (
    exposures[nat] ??
    exposures[nat.toLowerCase()] ??
    exposures[nat.trim()] ??
    0
  );
}

/**
 * BetTableQueen — Queen Top Open Teenpatti bet table.
 * Structure matches reference HTML exactly:
 *   queen-box > row > col-3 × 4
 *   Each: casino-box-row > casino-nation-name(label) + casino-bl-box[suspended] > back+lay + casino-nation-name(exposure)
 * Parent must have casino-queen + casino-table classes for correct CSS scoping.
 * data: first 4 items of sub (nat="Total X", b=back, l=lay, gstatus)
 */
export default function BetTableQueen({ data = [], onBetClick, exposures = {} }) {
  return (
    <div style={{width:"100%"}} className="queen-box">
      <div className="row">
        {Array.from({ length: 4 }, (_, idx) => {
          const item = data[idx];
          const nat = item?.nat || `Total ${idx}`;
          const back = item?.b ?? 0;
          const lay = item?.l ?? 0;
          const suspended = !item || item?.gstatus === "SUSPENDED";
          const exposure = getExposure(exposures, nat);

          return (
            <div key={idx} className="col-3">
              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <b>{nat}</b>
                </div>
                <div className={`casino-bl-box${suspended ? " suspended" : ""}`}>
                  <div
                    data-toggle="modal"
                    data-target="#casino-betslip"
                    className="back casino-bl-box-item"
                    onClick={() => !suspended && onBetClick(back, nat, "back", item)}
                  >
                    <span className="casino-box-odd">{suspended ? 0 : back}</span>
                  </div>
                  <div
                    className="lay casino-bl-box-item"
                    onClick={() => !suspended && onBetClick(lay, nat, "lay", item)}
                  >
                    <span className="casino-box-odd">{suspended ? 0 : lay}</span>
                  </div>
                </div>
                <div className="casino-nation-name">
                  <span className="casino-book text-danger book-red">{exposure}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
