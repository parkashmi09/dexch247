import { useState } from "react";
import BlinkBox, { ExposureValue } from "./BlinkBox.jsx";
import {
  MARKET_TYPE,
  formatSize,
  formatLimit,
  getOddByTier,
  getExposureForSelection,
} from "../../../utils/gameDetailsUtils.js";

const SILK_BASE = "https://sitethemedata.com/race_icons/";
const GREYHOUND_IMG_BASE = "https://versionobj.ecoassetsservice.com/v104/static/front/img/greyhound/";

function getMarketClass(market, isGreyhound) {
  if (isGreyhound) return "market-13";
  const mname = (market.mname || "").toLowerCase();
  if (mname === "top 3 finish") return "market-12 market-16";
  return "market-12";
}

function OddsCell({ odd, betType, className, onClick }) {
  return (
    <BlinkBox
      value={odd.odds}
      size={odd.size}
      className={className}
      onClick={odd.odds !== "-" && odd.odds ? onClick : undefined}
    >
      <span className="market-odd">{odd.odds}</span>
      {odd.size ? <span className="market-volume">{formatSize(odd.size)}</span> : null}
    </BlinkBox>
  );
}

// --- Greyhound runner row (simple: image + name + odds) ---
function GreyhoundRunnerRow({ runner, market, onBetClick, exposures }) {
  const gs = (runner.gstatus || "").toUpperCase();
  const susp = gs === "SUSPENDED";
  const back1 = getOddByTier(runner.odds, "back", 0);
  const back2 = getOddByTier(runner.odds, "back", 1);
  const back3 = getOddByTier(runner.odds, "back", 2);
  const lay1 = getOddByTier(runner.odds, "lay", 0);
  const lay2 = getOddByTier(runner.odds, "lay", 1);
  const lay3 = getOddByTier(runner.odds, "lay", 2);
  const exposure = getExposureForSelection(exposures, runner, market.mid);

  function handleClick(betType, oddObj) {
    if (!oddObj || oddObj.odds === "-" || susp) return;
    onBetClick({ market, marketType: MARKET_TYPE.MATCH_ODDS, runner, betType, odds: oddObj.odds });
  }

  // Greyhound image: {eventid}/{sno}.png
  const sno = runner.sno || runner.cno || "";
  const imgUrl = `${GREYHOUND_IMG_BASE}${market.eid || market.mid}/${sno}.png`;

  return (
    <div className="market-row" data-title={susp ? "SUSPENDED" : gs || "ACTIVE"}>
      <div className="market-nation-detail">
        <span className="market-nation-name">
          <img
            src={imgUrl}
            alt=""
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          {runner.nat}
        </span>
        <div className="market-nation-book">
          <ExposureValue value={exposure} />
        </div>
      </div>
      <OddsCell odd={back3} betType="back" className="market-odd-box back2 d-none d-md-flex" onClick={() => handleClick("back", back3)} />
      <OddsCell odd={back2} betType="back" className="market-odd-box back1 d-none d-md-flex" onClick={() => handleClick("back", back2)} />
      <OddsCell odd={back1} betType="back" className="market-odd-box back" onClick={() => handleClick("back", back1)} />
      <OddsCell odd={lay1} betType="lay" className="market-odd-box lay" onClick={() => handleClick("lay", lay1)} />
      <OddsCell odd={lay2} betType="lay" className="market-odd-box lay1 d-none d-md-flex" onClick={() => handleClick("lay", lay2)} />
      <OddsCell odd={lay3} betType="lay" className="market-odd-box lay2 d-none d-md-flex" onClick={() => handleClick("lay", lay3)} />
    </div>
  );
}

// --- Horse runner row (checkbox + silk + jockey details + odds) ---
function HorseRunnerRow({ runner, market, onBetClick, exposures }) {
  const [expanded, setExpanded] = useState(false);
  const gs = (runner.gstatus || "").toUpperCase();
  const susp = gs === "SUSPENDED" || gs === "BALL RUNNING";
  const back1 = getOddByTier(runner.odds, "back", 0);
  const back2 = getOddByTier(runner.odds, "back", 1);
  const back3 = getOddByTier(runner.odds, "back", 2);
  const lay1 = getOddByTier(runner.odds, "lay", 0);
  const lay2 = getOddByTier(runner.odds, "lay", 1);
  const lay3 = getOddByTier(runner.odds, "lay", 2);
  const exposure = getExposureForSelection(exposures, runner, market.mid);

  function handleClick(betType, oddObj) {
    if (!oddObj || oddObj.odds === "-" || susp) return;
    onBetClick({ market, marketType: MARKET_TYPE.MATCH_ODDS, runner, betType, odds: oddObj.odds });
  }

  const gateNo = runner.cno || runner.sdraw || runner.sno || "";
  const runnerName = runner.nat || "";
  const jname = runner.jname || "";
  const tname = runner.tname || "";
  const hage = runner.hage || "";
  const silkUrl = `${SILK_BASE}${market.mid}/${runner.sid}.png`;

  return (
    <>
      <div className={`market-row${susp ? " suspended-row" : ""}`} data-title={susp ? "SUSPENDED" : gs || "ACTIVE"}>
        <div className="market-nation-detail">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id={`checkbox-runner-${runner.sid}`} readOnly />
            <label className="form-check-label" htmlFor={`checkbox-runner-${runner.sid}`}>
              <div>{gateNo}<br />({gateNo})</div>
              <div>
                <img src={silkUrl} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <div>
                <span className="market-nation-name">
                  <span>{runnerName}</span>
                  <span className="d-md-none horse-detail-arrow ms-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded((v) => !v); }} style={{ cursor: "pointer" }}>
                    <i className={`fas fa-angle-${expanded ? "up" : "down"}`}></i>
                  </span>
                </span>
                <div className="jockey-detail d-none d-md-flex">
                  {jname && <span className="jockey-detail-box"><b>Jockey:</b><span>{jname}</span></span>}
                  {tname && <span className="jockey-detail-box"><b>Trainer:</b><span>{tname}</span></span>}
                  {hage && <span className="jockey-detail-box"><b>Age:</b><span>{hage}</span></span>}
                </div>
              </div>
            </label>
          </div>
        </div>
        <OddsCell odd={back3} betType="back" className="market-odd-box back2 d-none d-md-flex" onClick={() => handleClick("back", back3)} />
        <OddsCell odd={back2} betType="back" className="market-odd-box back1 d-none d-md-flex" onClick={() => handleClick("back", back2)} />
        <OddsCell odd={back1} betType="back" className="market-odd-box back" onClick={() => handleClick("back", back1)} />
        <OddsCell odd={lay1} betType="lay" className="market-odd-box lay" onClick={() => handleClick("lay", lay1)} />
        <OddsCell odd={lay2} betType="lay" className="market-odd-box lay1 d-none d-md-flex" onClick={() => handleClick("lay", lay2)} />
        <OddsCell odd={lay3} betType="lay" className="market-odd-box lay2 d-none d-md-flex" onClick={() => handleClick("lay", lay3)} />
      </div>
      {/* Mobile jockey details — collapsible */}
      <div className={`jockey-detail d-md-none${expanded ? "" : " collapse"}`}>
        {jname && <span className="jockey-detail-box"><b>Jockey:</b><span>{jname}</span></span>}
        {tname && <span className="jockey-detail-box"><b>Trainer:</b><span>{tname}</span></span>}
        {hage && <span className="jockey-detail-box"><b>Age:</b><span>{hage}</span></span>}
      </div>
    </>
  );
}

export default function RacingMarket({ market, onBetClick, exposures, isGreyhound = false }) {
  const isSuspended = market.status === "SUSPENDED";
  const marketClass = getMarketClass(market, isGreyhound);
  const label = market.mname || "MATCH_ODDS";
  const minMax = `Max: ${formatLimit(market.maxb || market.max)}`;

  // Greyhound header uses d-none d-md-block for outer columns, horse uses d-none d-md-flex
  const hiddenClass = isGreyhound ? "d-none d-md-flex" : "d-none d-md-flex";

  return (
    <div className={`game-market ${marketClass}`}>
      <div className="market-title">
        <span>{label}</span>
      </div>
      <div className="market-header">
        <div className="market-nation-detail">
          <span className="market-nation-name">{minMax}</span>
        </div>
        <div className={`market-odd-box no-border ${hiddenClass}`} />
        <div className={`market-odd-box no-border ${hiddenClass}`} />
        <div className="market-odd-box back"><b>Back</b></div>
        <div className="market-odd-box lay"><b>Lay</b></div>
        <div className={`market-odd-box ${hiddenClass}`} />
        <div className={`market-odd-box no-border ${hiddenClass}`} />
      </div>
      <div className={`market-body${isSuspended ? " suspended-table" : ""}`} data-title={isSuspended ? "SUSPENDED" : market.status || "OPEN"}>
        {market.section?.map((runner) =>
          isGreyhound ? (
            <GreyhoundRunnerRow
              key={runner.sid || runner.nat}
              runner={runner}
              market={market}
              onBetClick={onBetClick}
              exposures={exposures}
            />
          ) : (
            <HorseRunnerRow
              key={runner.sid || runner.nat}
              runner={runner}
              market={market}
              onBetClick={onBetClick}
              exposures={exposures}
            />
          )
        )}
      </div>
    </div>
  );
}
