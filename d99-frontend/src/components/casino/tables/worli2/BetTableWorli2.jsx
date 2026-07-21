import { useState, useEffect } from "react";
import { WorliOddBox, ROW1, ROW2 } from "../../common/WorliGrid.jsx";

const ODDS = 9;
const SID = 1;

const RIGHT_ITEMS = [
  [
    { label: "Line 1", nat: "single-line1", sub: "1|2|3|4|5" },
    { label: "ODD", nat: "single-odd", sub: "1|3|5|7|9" },
  ],
  [
    { label: "Line 2", nat: "single-line2", sub: "6|7|8|9|0" },
    { label: "EVEN", nat: "single-even", sub: "2|4|6|8|0" },
  ],
];

export default function BetTableWorli2({ gameData, onBet, exposures = {}, showPlaceBet }) {
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    if (!showPlaceBet) setSelectedKey("");
  }, [showPlaceBet]);

  const raw = gameData?.data?.data || gameData?.data || gameData || {};
  const sub = Array.isArray(raw.sub) ? raw.sub : [];
  const firstSub = sub[0] || {};
  const suspended = firstSub.gstatus === "SUSPENDED" || firstSub.gstatus === "0";

  const handleClick = (nat) => {
    if (suspended) return;
    setSelectedKey(nat);
    onBet(ODDS, nat, { sid: SID, nat, b: ODDS, gstatus: firstSub.gstatus, min: firstSub.min, max: firstSub.max }, "back");
  };

  return (
    <div className="casino-table">
      <div className="tab-content">
        <div className="fade single tab-pane active show">
          <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
            <div className="worli-left">
              <div className="worli-box-title"><b>{ODDS}</b></div>
              <div className="worli-box-row">
                {ROW1.map((n) => (
                  <WorliOddBox key={n} label={n} selected={selectedKey === `single-${n}`} onClick={() => handleClick(`single-${n}`)} />
                ))}
              </div>
              <div className="worli-box-row">
                {ROW2.map((n) => (
                  <WorliOddBox key={n} label={n} selected={selectedKey === `single-${n}`} onClick={() => handleClick(`single-${n}`)} />
                ))}
              </div>
            </div>
            <div className="worli-right">
              <div className="worli-box-title"><b>{ODDS}</b></div>
              {RIGHT_ITEMS.map((row, ri) => (
                <div className="worli-box-row" key={ri}>
                  {row.map((item) => (
                    <div
                      key={item.nat}
                      className={`worli-odd-box back${selectedKey === item.nat ? " selected" : ""}`}
                      onClick={() => handleClick(item.nat)}
                    >
                      <span className="worli-odd">{item.label}</span>
                      <span className="d-block">{item.sub}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
