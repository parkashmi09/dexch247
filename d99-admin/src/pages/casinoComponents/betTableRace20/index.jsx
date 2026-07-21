import React, { useState, useCallback } from "react";
import KSS from "../../../assets/img/race20/KSS.jpg";
import KHH from "../../../assets/img/race20/KHH.jpg";
import KCC from "../../../assets/img/race20/KCC.jpg";
import KDD from "../../../assets/img/race20/KDD.jpg";

const CARD_IMGS = {
  "K of spade": KSS,
  "K of heart": KHH,
  "K of club": KCC,
  "K of diamond": KDD,
};

function formatMax(max) {
  if (max == null) return "—";
  const n = Number(max);
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
}

function getExposureForNat(exposures, nat) {
  if (!nat) return 0;
  return (
    exposures[nat] ??
    exposures[nat.toLowerCase()] ??
    exposures[nat.trim()] ??
    0
  );
}

const BetTableRace20 = ({
  data = [],
  onBetClick,
  exposures = {},
  myBets = [],
}) => {
  const [openCollapse, setOpenCollapse] = useState(new Set());
  const toggleCollapse = useCallback((id) => {
    setOpenCollapse((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const kings = data.slice(0, 4);
  const totalPoints = data[4];
  const totalCards = data[5];
  const winWith = data.slice(6, 12);

  return (
    <div style={{width:'100%'}} className="casino-detail">
      {/* Row 1: K of spade, heart, club, diamond */}
      <div className="row row5">
        {kings.map((item, idx) => {
          const nat = item?.nat || "";
          const imgSrc = CARD_IMGS[nat] || KSS;
          const suspended = item?.gstatus === "SUSPENDED";
          const backVal = item?.b ?? 0;
          const layVal = item?.l ?? 0;
          const min = item?.min ?? 100;
          const maxStr = formatMax(item?.max);
          const exposure = getExposureForNat(exposures, nat);
          const id = `demo${idx}`;

          return (
            <div key={idx} className="col-6 col-md-3">
              <div className="casino-box-row">
                <div className="casino-nation-name">
                  <img src={imgSrc} alt="" />
                  <div className="range-icon d-inline-block ml-2">
                    <i
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.preventDefault(); toggleCollapse(id); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse(id); } }}
                      className="fas fa-info-circle float-right"
                      aria-expanded={openCollapse.has(id)}
                      aria-controls={id}
                      aria-label="Toggle range"
                    />
                    <div
                      id={id}
                      className={`collapse icon-range ${openCollapse.has(id) ? "show" : ""}`}
                      role="region"
                      aria-label="Range"
                    >
                      R:<span>{min}</span>-<span>{maxStr}</span>
                    </div>
                  </div>
                </div>
                <div className="casino-bl-box">
                  <div
                    className={`back casino-bl-box-item ${suspended ? "suspended" : ""}`}
                    onClick={() =>
                      !suspended && onBetClick(backVal, nat, "back", item)
                    }
                    data-title={suspended ? "SUSPENDED" : "OPEN"}
                  >
                    <span className="casino-box-odd">
                      {suspended ? "0" : backVal || "0"}
                    </span>
                  </div>
                  <div
                    className={`lay casino-bl-box-item ${suspended ? "suspended" : ""}`}
                    onClick={() =>
                      !suspended && onBetClick(layVal, nat, "lay", item)
                    }
                    data-title={suspended ? "SUSPENDED" : "OPEN"}
                  >
                    <span className="casino-box-odd">
                      {suspended ? "0" : layVal || "0"}
                    </span>
                  </div>
                </div>
                <div className="casino-nation-name book-red">{exposure}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Total points, Total cards (Yes/No) */}
      <div className="row mt-2">
        <div className="col-12 col-md-4">
          {/* Total points */}
          <div>
            <div className="casino-yn">
              <div />
              <div className="casino-bl-box">
                <div className="casino-bl-box-item yn-header">
                  <b>No</b>
                </div>
                <div className="casino-bl-box-item yn-header">
                  <b>Yes</b>
                </div>
              </div>
            </div>
            <div className="casino-odds-box casino-yn">
              <div className="casino-odds-box-bhav">
                <b>Total points</b>
                <div className="range-icon d-inline-block">
                  <i
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.preventDefault(); toggleCollapse("tp0"); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("tp0"); } }}
                    className="fas fa-info-circle float-right"
                    aria-expanded={openCollapse.has("tp0")}
                    aria-label="Toggle range"
                  />
                  <div
                    id="tp0"
                    className={`collapse icon-range ${openCollapse.has("tp0") ? "show" : ""}`}
                  >
                    R:<span>{totalPoints?.min ?? 100}</span>-<span>{formatMax(totalPoints?.max)}</span>
                  </div>
                </div>
              </div>
              <div className="casino-bl-box">
                <div
                  className={`lay casino-bl-box-item ${totalPoints?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                  onClick={() =>
                    totalPoints?.gstatus !== "SUSPENDED" &&
                    onBetClick(totalPoints?.l, "Total points No", "lay", totalPoints)
                  }
                >
                  <span className="casino-box-odd">
                    {totalPoints?.gstatus === "SUSPENDED"
                      ? "0"
                      : totalPoints?.l ?? "0"}
                  </span>{" "}
                  <span>{totalPoints?.ls ?? "0"}</span>
                </div>
                <div
                  className={`back casino-bl-box-item ${totalPoints?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                  onClick={() =>
                    totalPoints?.gstatus !== "SUSPENDED" &&
                    onBetClick(totalPoints?.b, "Total points Yes", "back", totalPoints)
                  }
                >
                  <span className="casino-box-odd">
                    {totalPoints?.gstatus === "SUSPENDED"
                      ? "0"
                      : totalPoints?.b ?? "0"}
                  </span>{" "}
                  <span>{totalPoints?.bs ?? "0"}</span>
                </div>
              </div>
            </div>
            <div className="casino-yn">
              <div />
              <div className="casino-bl-box">
                <div className="casino-nation-name book-red">
                  {getExposureForNat(exposures, totalPoints?.nat)}
                </div>
              </div>
            </div>
          </div>

          {/* Total cards */}
          <div>
            <div className="casino-yn">
              <div />
              <div className="casino-bl-box">
                <div className="casino-bl-box-item yn-header">
                  <b>No</b>
                </div>
                <div className="casino-bl-box-item yn-header">
                  <b>Yes</b>
                </div>
              </div>
            </div>
            <div className="casino-odds-box casino-yn">
              <div className="casino-odds-box-bhav">
                <b>Total cards</b>
                <div className="range-icon d-inline-block">
                  <i
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.preventDefault(); toggleCollapse("tp1"); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("tp1"); } }}
                    className="fas fa-info-circle float-right"
                    aria-expanded={openCollapse.has("tp1")}
                    aria-label="Toggle range"
                  />
                  <div
                    id="tp1"
                    className={`collapse icon-range ${openCollapse.has("tp1") ? "show" : ""}`}
                  >
                    R:<span>{totalCards?.min ?? 100}</span>-<span>{formatMax(totalCards?.max)}</span>
                  </div>
                </div>
              </div>
              <div className="casino-bl-box">
                <div
                  className={`lay casino-bl-box-item ${totalCards?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                  onClick={() =>
                    totalCards?.gstatus !== "SUSPENDED" &&
                    onBetClick(totalCards?.l, "Total cards No", "lay", totalCards)
                  }
                >
                  <span className="casino-box-odd">
                    {totalCards?.gstatus === "SUSPENDED"
                      ? "0"
                      : totalCards?.l ?? "0"}
                  </span>{" "}
                  <span>{totalCards?.ls ?? "0"}</span>
                </div>
                <div
                  className={`back casino-bl-box-item ${totalCards?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                  onClick={() =>
                    totalCards?.gstatus !== "SUSPENDED" &&
                    onBetClick(totalCards?.b, "Total cards Yes", "back", totalCards)
                  }
                >
                  <span className="casino-box-odd">
                    {totalCards?.gstatus === "SUSPENDED"
                      ? "0"
                      : totalCards?.b ?? "0"}
                  </span>{" "}
                  <span>{totalCards?.bs ?? "0"}</span>
                </div>
              </div>
            </div>
            <div className="casino-yn">
              <div />
              <div className="casino-bl-box">
                <div className="casino-nation-name book-red">
                  {getExposureForNat(exposures, totalCards?.nat)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Win with 5,6,7 and 15,16,17 */}
        <div className="col-12 col-md-8 win-with">
          <div className="row row5">
            <div className="col-4">
              {winWith[0] && (
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Win with 5</b>
                    <div className="range-icon d-inline-block ml-2">
                      <i
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.preventDefault(); toggleCollapse("fancy2"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("fancy2"); } }}
                        className="fas fa-info-circle float-right"
                        aria-expanded={openCollapse.has("fancy2")}
                        aria-label="Toggle range"
                      />
                      <div id="fancy2" className={`collapse icon-range ${openCollapse.has("fancy2") ? "show" : ""}`}>
                        R:<span>{winWith[0]?.min ?? 100}</span>-<span>{formatMax(winWith[0]?.max)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${winWith[0]?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                      onClick={() =>
                        winWith[0]?.gstatus !== "SUSPENDED" &&
                        onBetClick(winWith[0]?.b, "Win with 5", "back", winWith[0])
                      }
                    >
                      <span className="casino-box-odd">
                        {winWith[0]?.gstatus === "SUSPENDED"
                          ? "0"
                          : winWith[0]?.b ?? "0"}
                      </span>
                    </div>
                  </div>
                  <div className="casino-nation-name rf-minheight book-red">
                    {getExposureForNat(exposures, winWith[0]?.nat)}
                  </div>
                </div>
              )}
              {winWith[3] && (
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Win with 15</b>
                    <div className="range-icon d-inline-block ml-2">
                      <i
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.preventDefault(); toggleCollapse("fancy5"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("fancy5"); } }}
                        className="fas fa-info-circle float-right"
                        aria-expanded={openCollapse.has("fancy5")}
                        aria-label="Toggle range"
                      />
                      <div id="fancy5" className={`collapse icon-range ${openCollapse.has("fancy5") ? "show" : ""}`}>
                        R:<span>{winWith[3]?.min ?? 100}</span>-<span>{formatMax(winWith[3]?.max)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${winWith[3]?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                      onClick={() =>
                        winWith[3]?.gstatus !== "SUSPENDED" &&
                        onBetClick(winWith[3]?.b, "Win with 15", "back", winWith[3])
                      }
                    >
                      <span className="casino-box-odd">
                        {winWith[3]?.gstatus === "SUSPENDED"
                          ? "0"
                          : winWith[3]?.b ?? "0"}
                      </span>
                    </div>
                  </div>
                  <div className="casino-nation-name rf-minheight book-red">
                    {getExposureForNat(exposures, winWith[3]?.nat)}
                  </div>
                </div>
              )}
            </div>
            <div className="col-4">
              {winWith[1] && (
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Win with 6</b>
                    <div className="range-icon d-inline-block ml-2">
                      <i
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.preventDefault(); toggleCollapse("fancy3"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("fancy3"); } }}
                        className="fas fa-info-circle float-right"
                        aria-expanded={openCollapse.has("fancy3")}
                        aria-label="Toggle range"
                      />
                      <div id="fancy3" className={`collapse icon-range ${openCollapse.has("fancy3") ? "show" : ""}`}>
                        R:<span>{winWith[1]?.min ?? 100}</span>-<span>{formatMax(winWith[1]?.max)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${winWith[1]?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                      onClick={() =>
                        winWith[1]?.gstatus !== "SUSPENDED" &&
                        onBetClick(winWith[1]?.b, "Win with 6", "back", winWith[1])
                      }
                    >
                      <span className="casino-box-odd">
                        {winWith[1]?.gstatus === "SUSPENDED"
                          ? "0"
                          : winWith[1]?.b ?? "0"}
                      </span>
                    </div>
                  </div>
                  <div className="casino-nation-name rf-minheight book-red">
                    {getExposureForNat(exposures, winWith[1]?.nat)}
                  </div>
                </div>
              )}
              {winWith[4] && (
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Win with 16</b>
                    <div className="range-icon d-inline-block ml-2">
                      <i
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.preventDefault(); toggleCollapse("fancy6"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("fancy6"); } }}
                        className="fas fa-info-circle float-right"
                        aria-expanded={openCollapse.has("fancy6")}
                        aria-label="Toggle range"
                      />
                      <div id="fancy6" className={`collapse icon-range ${openCollapse.has("fancy6") ? "show" : ""}`}>
                        R:<span>{winWith[4]?.min ?? 100}</span>-<span>{formatMax(winWith[4]?.max)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${winWith[4]?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                      onClick={() =>
                        winWith[4]?.gstatus !== "SUSPENDED" &&
                        onBetClick(winWith[4]?.b, "Win with 16", "back", winWith[4])
                      }
                    >
                      <span className="casino-box-odd">
                        {winWith[4]?.gstatus === "SUSPENDED"
                          ? "0"
                          : winWith[4]?.b ?? "0"}
                      </span>
                    </div>
                  </div>
                  <div className="casino-nation-name rf-minheight book-red">
                    {getExposureForNat(exposures, winWith[4]?.nat)}
                  </div>
                </div>
              )}
            </div>
            <div className="col-4">
              {winWith[2] && (
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Win with 7</b>
                    <div className="range-icon d-inline-block ml-2">
                      <i
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.preventDefault(); toggleCollapse("fancy4"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("fancy4"); } }}
                        className="fas fa-info-circle float-right"
                        aria-expanded={openCollapse.has("fancy4")}
                        aria-label="Toggle range"
                      />
                      <div id="fancy4" className={`collapse icon-range ${openCollapse.has("fancy4") ? "show" : ""}`}>
                        R:<span>{winWith[2]?.min ?? 100}</span>-<span>{formatMax(winWith[2]?.max)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${winWith[2]?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                      onClick={() =>
                        winWith[2]?.gstatus !== "SUSPENDED" &&
                        onBetClick(winWith[2]?.b, "Win with 7", "back", winWith[2])
                      }
                    >
                      <span className="casino-box-odd">
                        {winWith[2]?.gstatus === "SUSPENDED"
                          ? "0"
                          : winWith[2]?.b ?? "0"}
                      </span>
                    </div>
                  </div>
                  <div className="casino-nation-name rf-minheight book-red">
                    {getExposureForNat(exposures, winWith[2]?.nat)}
                  </div>
                </div>
              )}
              {winWith[5] && (
                <div className="casino-box-row">
                  <div className="casino-nation-name">
                    <b>Win with 17</b>
                    <div className="range-icon d-inline-block ml-2">
                      <i
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.preventDefault(); toggleCollapse("fancy7"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCollapse("fancy7"); } }}
                        className="fas fa-info-circle float-right"
                        aria-expanded={openCollapse.has("fancy7")}
                        aria-label="Toggle range"
                      />
                      <div id="fancy7" className={`collapse icon-range ${openCollapse.has("fancy7") ? "show" : ""}`}>
                        R:<span>{winWith[5]?.min ?? 100}</span>-<span>{formatMax(winWith[5]?.max)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="casino-bl-box">
                    <div
                      className={`back casino-bl-box-item ${winWith[5]?.gstatus === "SUSPENDED" ? "suspended" : ""}`}
                      onClick={() =>
                        winWith[5]?.gstatus !== "SUSPENDED" &&
                        onBetClick(winWith[5]?.b, "Win with 17", "back", winWith[5])
                      }
                    >
                      <span className="casino-box-odd">
                        {winWith[5]?.gstatus === "SUSPENDED"
                          ? "0"
                          : winWith[5]?.b ?? "0"}
                      </span>
                    </div>
                  </div>
                  <div className="casino-nation-name rf-minheight book-red">
                    {getExposureForNat(exposures, winWith[5]?.nat)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetTableRace20;
