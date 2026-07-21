import { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import { getLastResults } from "../../../../apiservices/CasionApi.js";

function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  return <div className={`casino-nation-book text-center${!isNaN(n) && n !== 0 ? (n >= 0 ? " text-success" : " text-danger") : ""}`}>{!isNaN(n) && n !== 0 ? n : ""}</div>;
}

const CARD_BASE = "/assets/img/cards";
function getCardImg(token) {
  if (!token || token === "1" || token === "0") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

export default function BetTableBaccarat({ tableData = [], onBetClick, exposures = {}, cardString = "" }) {
  const isSus = (item) => !item || item.gstatus !== "OPEN";
  const find = (name) => tableData.find((d) => d.nat === name);

  const tokens = cardString.split(",").map((t) => t.trim());
  const playerCards = [0, 2, 4].map((i) => getCardImg(tokens[i])).filter(Boolean);
  const bankerCards = [1, 3, 5].map((i) => getCardImg(tokens[i])).filter(Boolean);

  const perfectPair = find("Perfect Pair");
  const big = find("Big");
  const small = find("Small");
  const eitherPair = find("Either Pair");
  const playerPair = find("Player Pair");
  const player = find("Player");
  const tie = find("Tie");
  const banker = find("Banker");
  const bankerPair = find("Banker Pair");

  // Fetch stats from last-results API 'g' field
  const [stats, setStats] = useState({ p: 0, b: 0, t: 0 });
  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const data = await getLastResults("baccarat");
        if (cancelled) return;
        const g = data?.data?.data?.g || data?.data?.g || {};
        setStats({
          p: Math.round(parseFloat(g.p) || 0),
          b: Math.round(parseFloat(g.b) || 0),
          t: Math.round(parseFloat(g.t) || 0),
        });
      } catch { /* ignore */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  function renderOddBox(item, label, className, extraContent) {
    const sus = isSus(item);
    const odds = item?.b || 0;
    return (
      <div className={`${className}-container`}>
        <div className={`${className}${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && odds > 0 && onBetClick?.(odds, item.nat, item, "back")}>
          <div>{label}</div>
          <div>{sus ? "0:1" : `${odds}:1`}</div>
          {extraContent}
        </div>
        <ExpBook value={getExp(exposures, item?.nat)} />
      </div>
    );
  }

  function renderSideOdd(item, label) {
    const sus = isSus(item);
    const odds = item?.b || 0;
    return (
      <div className="baccarat-other-odd-box-container">
        <div className={`baccarat-other-odd-box${sus ? " suspended-box" : ""}`}
          onClick={() => !sus && odds > 0 && onBetClick?.(odds, item.nat, item, "back")}>
          <span>{label}</span>
          <span>{sus ? "0:1" : `${odds}:1`}</span>
        </div>
        <ExpBook value={getExp(exposures, item?.nat)} />
      </div>
    );
  }

  return (
    <div className="casino-table">
      <div className="casino-table-full-box ">
        {/* Statistics Pie Chart */}
        <div className="baccarat-graph text-center">
          <h4>Statistics</h4>
          <div className="baccarat-legend">
            <div><span className="baccarat-legend-dot" style={{ background: "#086cb8" }} /> Player</div>
            <div><span className="baccarat-legend-dot" style={{ background: "#ae2130" }} /> Banker</div>
            <div><span className="baccarat-legend-dot" style={{ background: "#279532" }} /> Tie</div>
          </div>
          <Chart
            chartType="PieChart"
            data={[["P", "Data"], ["Player", stats.p || 1], ["Banker", stats.b || 1], ["Tie", stats.t || 1]]}
            options={{
              legend: "none",
              pieSliceText: "percentage",
              pieSliceTextStyle: { fontSize: 11, color: "#fff" },
              colors: ["#086cb8", "#ae2130", "#279532"],
              backgroundColor: "transparent",
              chartArea: { left: "5%", top: 0, width: "90%", height: "100%" },
              is3D: true,
              pieStartAngle: 0,
            }}
            width="100%"
            height="120px"
          />
        </div>

        {/* Odds Container */}
        <div className="baccarat-odds-container">
          <div className="baccarat-other-odds">
            {renderSideOdd(perfectPair, "Perfect Pair")}
            {renderSideOdd(big, "Big")}
            {renderSideOdd(small, "Small")}
            {renderSideOdd(eitherPair, "Either Pair")}
          </div>

          <div className="baccarat-main-odds mt-3">
            {renderOddBox(playerPair, "Player Pair", "player-pair-box")}

            {renderOddBox(player, "Player", "player-box",
              playerCards.length > 0 && (
                <div>
                  {playerCards.map((src, i) => <img key={i} src={src} alt="" className={i === 0 ? "l-rotate" : ""} />)}
                </div>
              )
            )}

            {renderOddBox(tie, "Tie", "tie-box")}

            {renderOddBox(banker, "Banker", "banker-box",
              bankerCards.length > 0 && (
                <div>
                  {bankerCards.map((src, i) => <img key={i} src={src} alt="" className={i === bankerCards.length - 1 && bankerCards.length === 3 ? "r-rotate" : ""} />)}
                </div>
              )
            )}

            {renderOddBox(bankerPair, "Banker Pair", "banker-pair-box")}
          </div>
        </div>
      </div>
    </div>
  );
}
