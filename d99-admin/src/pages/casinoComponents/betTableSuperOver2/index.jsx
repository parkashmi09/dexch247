/**
 * BetTableSuperOver2 – Bet table for Super Over 2 game.
 * HTML structure and class names match reference UI exactly.
 * Uses global classes from style.css (market-container, market-2, market-6,
 * bet-table, bet-table-header, bet-table-body, bet-table-row, nation-name,
 * bl-box, bl-title, fancy-tripple, suspendedtext, etc.)
 *
 * API t2 array has 3 market types:
 *   gtype "match1" → Bookmaker (market-2, Back/Lay)
 *   gtype "fancy"  → Fancy (market-6, No/Yes)
 *   gtype "fancy1" → Fancy1 (market-6, Back/Lay + Bet Lock)
 */

const formatSize = (val) => {
  if (val == null || val === "" || val === 0) return "";
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (n >= 100000) return n / 100000 + "L";
  if (n >= 1000) return n / 1000 + "K";
  return String(n);
};

const BetTableSuperOver2 = ({ data = [], onBetClick, exposures = {}, myBets = [] }) => {
  const bookmakerMarket = data.find((item) => item.gtype === "match1");
  const fancyMarket = data.find((item) => item.gtype === "fancy");
  const fancy1Market = data.find((item) => item.gtype === "fancy1");

  const getExposure = (selectionName) => {
    if (!selectionName) return 0;
    const keys = [
      selectionName,
      selectionName.trim(),
      selectionName.toLowerCase(),
      selectionName.toLowerCase().trim(),
      selectionName.toUpperCase(),
      selectionName.toUpperCase().trim(),
    ];
    for (const key of keys) {
      if (key && exposures[key] !== undefined) return exposures[key];
    }
    return 0;
  };

  const renderBookmaker = () => {
    const market = bookmakerMarket;
    const sections = market?.section || [];
    const marketStatus = market?.status || "OPEN";

    return (
      <div className="market-2">
        <div className="bet-table">
          <div className="bet-table-header">
            <div data-toggle="collapse" data-target="#market0" aria-expanded="true" className="nation-name">
              <span title="Bookmaker">Bookmaker</span>
            </div>
          </div>
          <div id="market0" data-title={marketStatus} className="bet-table-body collapse show">
            {/* Header row */}
            <div className="bet-table-row">
              <div className="text-right nation-name">
                <span className="max-bet"></span>
              </div>
              <div className="back bl-title d-none-mobile">Back</div>
              <div className="lay bl-title d-none-mobile">Lay</div>
            </div>
            {/* Data rows */}
            {sections.map((item, idx) => {
              const backObj = item.odds?.find((o) => o.otype === "back");
              const layObj = item.odds?.find((o) => o.otype === "lay");
              const backOdds = backObj?.odds ?? 0;
              const layOdds = layObj?.odds ?? 0;
              const isSuspended = item.gstatus === "SUSPENDED" || (backOdds === 0 && layOdds === 0);
              const exposure = getExposure(item.nat);

              return (
                <div
                  key={idx}
                  data-title={isSuspended ? "SUSPENDED" : "ACTIVE"}
                  className="bet-table-row"
                >
                  <div className="nation-name d-none-mobile">
                    <p>{item.nat}</p>
                    <p className="mb-0 float-left" style={{ color: "red" }}>
                      {exposure || 0}
                    </p>
                    <p className="mb-0 float-right d-none">0</p>
                  </div>
                  {isSuspended ? (
                    <>
                      <div className="bl-box back back no-val">
                        <span className="d-block odds">&mdash;</span>
                      </div>
                      <div className="bl-box lay lay no-val">
                        <span className="d-block odds">&mdash;</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="bl-box back back"
                        onClick={() => onBetClick?.(backOdds, item.nat, "back", item)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="d-block odds">{backOdds}</span>
                        <span className="d-block">{formatSize(backObj?.size)}</span>
                      </div>
                      <div
                        className="bl-box lay lay"
                        onClick={() => onBetClick?.(layOdds, item.nat, "lay", item)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="d-block odds">{layOdds}</span>
                        <span className="d-block">{formatSize(layObj?.size)}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFancy = () => {
    const market = fancyMarket;
    if (!market?.section?.length) return null;
    const sections = market.section;
    const marketStatus = market.status || "OPEN";

    return (
      <div className="market-6">
        <div className="bet-table">
          <div className="bet-table-header">
            <div data-toggle="collapse" data-target="#market1" aria-expanded="true" className="nation-name">
              <span title="Fancy">Fancy</span>
            </div>
          </div>
          <div id="market1" data-title={marketStatus} className="bet-table-body collapse show">
            {/* Header row */}
            <div className="bet-table-row">
              <div className="text-right nation-name"></div>
              <div className="lay bl-title d-none-mobile">No</div>
              <div className="back bl-title d-none-mobile">Yes</div>
            </div>
            {/* Data rows */}
            {sections.map((item, idx) => {
              const backObj = item.odds?.find((o) => o.otype === "back");
              const layObj = item.odds?.find((o) => o.otype === "lay");
              const backOdds = backObj?.odds ?? 0;
              const layOdds = layObj?.odds ?? 0;
              const isSuspended = item.gstatus === "SUSPENDED" || (backOdds === 0 && layOdds === 0);
              const exposure = getExposure(item.nat);

              return (
                <div className="fancy-tripple" key={idx}>
                  <div
                    data-title={isSuspended ? "SUSPENDED" : "ACTIVE"}
                    className="bet-table-row"
                  >
                    <div className="nation-name d-none-mobile">
                      <p>{item.nat}</p>
                      <p className="mb-0" style={{ color: "red" }}>
                        {exposure || 0}
                      </p>
                    </div>
                    {isSuspended ? (
                      <>
                        <div className="bl-box lay no-val">
                          <span className="d-block odds">&mdash;</span>
                        </div>
                        <div className="bl-box back no-val">
                          <span className="d-block odds">&mdash;</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="bl-box lay"
                          onClick={() => onBetClick?.(layOdds, item.nat, "lay", item)}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="d-block odds">{layOdds}</span>
                          <span className="d-block">{formatSize(layObj?.size)}</span>
                        </div>
                        <div
                          className="bl-box back"
                          onClick={() => onBetClick?.(backOdds, item.nat, "back", item)}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="d-block odds">{backOdds}</span>
                          <span className="d-block">{formatSize(backObj?.size)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFancy1 = () => {
    const market = fancy1Market;
    if (!market?.section?.length) return null;
    const sections = market.section;
    const marketStatus = market.status || "OPEN";

    return (
      <div className="market-6">
        <div className="bet-table">
          <div className="bet-table-header">
            <div data-toggle="collapse" data-target="#market2" aria-expanded="true" className="nation-name">
              <span title="Fancy1">
                Fancy1
              </span>
            </div>
            <div className="float-right">
              <a href="javascript:void(0)" className="btn btn-back">Bet Lock</a>
            </div>
          </div>
          <div id="market2" data-title={marketStatus} className="bet-table-body collapse show">
            {/* Header row */}
            <div className="bet-table-row">
              <div className="text-right nation-name"></div>
              <div className="back bl-title d-none-mobile">Back</div>
              <div className="lay bl-title d-none-mobile">Lay</div>
            </div>
            {/* Data rows */}
            {sections.map((item, idx) => {
              const backObj = item.odds?.find((o) => o.otype === "back");
              const layObj = item.odds?.find((o) => o.otype === "lay");
              const backOdds = backObj?.odds ?? 0;
              const layOdds = layObj?.odds ?? 0;
              const backSuspended = item.gstatus === "SUSPENDED" || backOdds === 0;
              const laySuspended = item.gstatus === "SUSPENDED" || layOdds === 0;
              const isSuspended = item.gstatus === "SUSPENDED" || (backOdds === 0 && layOdds === 0);
              const exposure = getExposure(item.nat);

              return (
                <div className="fancy-tripple" key={idx}>
                  <div
                    data-title={isSuspended ? "SUSPENDED" : "ACTIVE"}
                    className="bet-table-row"
                  >
                    <div className="nation-name d-none-mobile">
                      <p>{item.nat}</p>
                      <p className="mb-0" style={{ color: "red" }}>
                        {exposure || 0}
                      </p>
                    </div>
                    {backSuspended ? (
                      <div className="bl-box back no-val">
                        <span className="d-block odds">&mdash;</span>
                      </div>
                    ) : (
                      <div
                        className="bl-box back"
                        onClick={() => onBetClick?.(backOdds, item.nat, "back", item)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="d-block odds">{backOdds}</span>
                        <span className="d-block">{formatSize(backObj?.size)}</span>
                      </div>
                    )}
                    {laySuspended ? (
                      <div className="bl-box lay no-val">
                        <span className="d-block odds">&mdash;</span>
                      </div>
                    ) : (
                      <div
                        className="bl-box lay"
                        onClick={() => onBetClick?.(layOdds, item.nat, "lay", item)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="d-block odds">{layOdds}</span>
                        <span className="d-block">{formatSize(layObj?.size)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="market-container">
      {renderBookmaker()}
      {renderFancy()}
      {renderFancy1()}
    </div>
  );
};

export default BetTableSuperOver2;
