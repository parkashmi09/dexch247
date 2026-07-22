import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import { formatSize, formatLimit, getExposureForSelection } from "../../../utils/gameDetailsUtils.js";

function FancyRunnerRows({ runner, showBook = false, marketType, market, onBetClick, exposures, onRunnerClick }) {
  const gs = (runner.gstatus || "").toUpperCase();
  const susp = gs === "SUSPENDED" || gs === "BALL RUNNING" || gs === "BALLRUNNING";
  const exposure = getExposureForSelection(exposures, runner, market.mid);
  const backs = runner.odds?.filter((o) => o.otype?.toLowerCase() === "back") || [];
  const lays = runner.odds?.filter((o) => o.otype?.toLowerCase() === "lay") || [];

  // Group by tno for depth rows
  const maxTno = Math.max(
    0,
    ...backs.map((o) => Number(o.tno) || 0),
    ...lays.map((o) => Number(o.tno) || 0)
  );

  function handleOddClick(betType, oddObj) {
    if (!oddObj || !oddObj.odds || oddObj.odds === "-") return;
    if (susp) return;
    onBetClick({
      market,
      marketType,
      runner,
      betType,
      odds: oddObj.odds,
    });
  }

  const rows = [];
  for (let t = 0; t <= maxTno; t++) {
    const backOdd = backs.find((o) => (Number(o.tno) || 0) === t);
    const layOdd = lays.find((o) => (Number(o.tno) || 0) === t);
    // Treat 0 odds as "-"
    const layVal = layOdd?.odds && Number(layOdd.odds) !== 0 ? layOdd.odds : "-";
    const backVal = backOdd?.odds && Number(backOdd.odds) !== 0 ? backOdd.odds : "-";
    rows.push(
      <div
        key={t}
        className="market-row"
        data-title={susp ? "SUSPENDED" : (runner.gstatus || "")}
      >
        <div className="market-nation-detail">
          {t === 0 && (
            <span
              className="market-nation-name"
              onClick={onRunnerClick ? () => onRunnerClick(runner.nat) : undefined}
              style={onRunnerClick ? { cursor: "pointer" } : undefined}
            >
              {runner.nat}
            </span>
          )}
          {t === 0 && <ExposureValue value={exposure} className="float-end" />}
        </div>
        <BlinkBox
          value={layVal}
          size={layOdd?.size}
          className="market-odd-box lay "
          onClick={t === 0 && layVal !== "-" ? () => handleOddClick("lay", layOdd) : undefined}
        >
          <span className="market-odd">{layVal}</span>
          {layVal !== "-" && layOdd?.size ? <span className="market-volume">{formatSize(layOdd.size)}</span> : null}
        </BlinkBox>
        <BlinkBox
          value={backVal}
          size={backOdd?.size}
          className="market-odd-box back "
          onClick={t === 0 && backVal !== "-" ? () => handleOddClick("back", backOdd) : undefined}
        >
          <span className="market-odd">{backVal}</span>
          {backVal !== "-" && backOdd?.size ? <span className="market-volume">{formatSize(backOdd.size)}</span> : null}
        </BlinkBox>
        {t === 0 ? (
          <div className="fancy-min-max-box">
            <div className="fancy-min-max">
              <span className="w-100 d-block">Min: {formatLimit(runner.min)}</span>
              <span className="w-100 d-block">Max: {formatLimit(runner.max)}</span>
            </div>
          </div>
        ) : (
          <div className="fancy-min-max-box" />
        )}
      </div>
    );
  }

  return rows;
}

export default function FancyGridMarket({ market, exposures, showBook = false, headerLay = "No", headerBack = "Yes", marketType, onBetClick, onRunnerClick, colClass = "col-md-6" }) {
  const isSuspended = market.status === "SUSPENDED";
  const sections = market.section || [];

  const FancyHeader = () => (
    <div className="market-header">
      <div className="market-nation-detail" />
      <div className="market-odd-box lay">
        <b>{headerLay}</b>
      </div>
      <div className="market-odd-box back">
        <b>{headerBack}</b>
      </div>
      <div className="fancy-min-max-box" />
    </div>
  );

  return (
    <div className="game-market market-6">
      <div className="market-title">
        <span>{market.mname}</span>
      </div>

      <div className="row row10">
        <div className={colClass}>
          <FancyHeader />
        </div>
        <div className={`${colClass} d-none d-xl-block`}>
          <FancyHeader />
        </div>
      </div>

      <div className="market-body " data-title={isSuspended ? "SUSPENDED" : (market.status || "OPEN")}>
        <div className="row row10">
          {sections.map((runner) => {
            const gs = (runner.gstatus || "").toUpperCase();
            const allZero = runner.odds?.every((o) => !o.odds || Number(o.odds) === 0);
            const isSusp = gs === "SUSPENDED" || gs === "BALL RUNNING" || gs === "BALLRUNNING" || allZero;
            return (
            <div key={runner.sid || runner.nat} className={colClass}>
              <div className={`fancy-market ${isSusp ? "suspended-row" : ""}`} data-title={runner.gstatus || ""}>
                <FancyRunnerRows
                  runner={runner}
                  showBook={showBook}
                  marketType={marketType}
                  market={market}
                  onBetClick={onBetClick}
                  exposures={exposures}
                  onRunnerClick={onRunnerClick}
                />
                {runner.rem && (
                  <div className="market-row">
                    <p className="market-remark">{runner.rem}</p>
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
}
