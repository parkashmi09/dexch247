import { useState, useMemo, useEffect } from "react";

const AB_CARD_BASE = "/assets/img/andar-bahar-cards/";
const CARD_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function isSuspended(item) {
  return !item || item.gstatus !== "OPEN" || !parseFloat(item.b);
}

export default function BetTableThreeCardJ({ gameData, onBetClick, exposures = {}, showPlaceBet = false }) {
  const raw = gameData?.data?.data || gameData?.data || {};
  const sub = raw.sub || [];
  const remark = raw.remark || "";

  const byId = useMemo(() => {
    const m = {};
    sub.forEach((s) => { m[s.sid] = s; });
    return m;
  }, [sub]);

  const yesItem = byId[1];
  const noItem = byId[2];
  const yesSusp = isSuspended(yesItem);
  const noSusp = isSuspended(noItem);

  // Track selected cards per box (Yes/No)
  const [yesSelected, setYesSelected] = useState([]);
  const [noSelected, setNoSelected] = useState([]);

  // Clear the picks once the bet panel closes (after submit or cancel) so the
  // next bet starts fresh.
  useEffect(() => {
    if (!showPlaceBet) {
      setYesSelected([]);
      setNoSelected([]);
    }
  }, [showPlaceBet]);

  function toggleCard(cardNum, type) {
    const back = type === "back";
    const item = back ? yesItem : noItem;
    if (isSuspended(item)) return;

    const selected = back ? yesSelected : noSelected;
    const setSelected = back ? setYesSelected : setNoSelected;
    const prefix = back ? "Yes" : "No";

    let next;
    if (selected.includes(cardNum)) {
      next = selected.filter((n) => n !== cardNum); // deselect
    } else {
      if (selected.length >= 3) return; // max 3 cards
      next = [...selected, cardNum];
    }
    setSelected(next);

    // Open the bet panel from the FIRST card and keep it in sync as more are
    // picked (up to 3). The panel's selection/label reflects the running picks.
    if (next.length > 0) {
      const odds = parseFloat(item.b) || 0;
      onBetClick?.(odds, `${prefix} ${next.join(",")}`, item, back ? "back" : "lay");
    }
  }

  return (
    <div className="casino-table">
      {/* Yes box */}
      <div className={`threecardjbox back${yesSusp ? " suspended-box" : ""}`}>
        <div className="threecard-title">
          Yes
          <div className="casino-odds"></div>
        </div>
        <div className="threecardj-cards">
          <h4 className="text-center w-100 mb-2">
            <b>{parseFloat(yesItem?.b) || 0}</b>
          </h4>
          {CARD_NUMS.map((n) => (
            <div
              key={n}
              className={`card-odd-box${yesSelected.includes(n) ? " selected" : ""}`}
              onClick={() => toggleCard(n, "back")}
              style={!yesSusp ? { cursor: "pointer" } : undefined}
            >
              <div className="">
                <img src={`${AB_CARD_BASE}${n}.jpg`} alt="" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No box */}
      <div className={`threecardjbox lay${noSusp ? " suspended-box" : ""}`}>
        <div className="threecard-title">
          No
          <div className="casino-odds"></div>
        </div>
        <div className="threecardj-cards">
          <h4 className="text-center w-100 mb-2">
            <b>{parseFloat(noItem?.b) || 0}</b>
          </h4>
          {CARD_NUMS.map((n) => (
            <div
              key={n}
              className={`card-odd-box${noSelected.includes(n) ? " selected" : ""}`}
              onClick={() => toggleCard(n, "lay")}
              style={!noSusp ? { cursor: "pointer" } : undefined}
            >
              <div className="">
                <img src={`${AB_CARD_BASE}${n}.jpg`} alt="" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="casino-remark mt-1">
        <marquee scrollamount="3">{remark || "Select any 3 card and you will win if you will get at least 1 card from the 3 cards you have selected.|Select any 3 card and you will win If you do not get any card from the 3 cards you have selected."}</marquee>
      </div>
    </div>
  );
}
