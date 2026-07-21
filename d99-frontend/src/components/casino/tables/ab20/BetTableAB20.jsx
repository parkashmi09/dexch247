import { useMemo } from "react";

const AB_CARD_BASE = "/assets/img/andar-bahar-cards/";

// Single card position box - never shows suspended-box
function CardOddBox({ imgNum, item, onBetClick, exposure }) {
  const imgSrc = `${AB_CARD_BASE}${imgNum}.jpg`;
  const odds = parseFloat(item?.b) || 0;
  const canClick = item?.gstatus === "OPEN" && odds > 0;
  const expN = exposure !== undefined ? parseFloat(exposure) : NaN;

  return (
    <div
      className="card-odd-box"
      onClick={canClick ? () => onBetClick?.(odds, item.nat, item, "back") : undefined}
      style={canClick ? { cursor: "pointer" } : undefined}
    >
      <div className="">
        <img src={imgSrc} alt="" />
      </div>
      <div className="casino-nation-book">
        {!isNaN(expN) && expN !== 0 && (
          <span className={expN >= 0 ? "text-success" : "text-danger"}>{expN}</span>
        )}
      </div>
    </div>
  );
}

function CardSection({ boxClass, title, resArr, items, onBetClick, exposures }) {
  return (
    <div className={boxClass}>
      <div className="ab-title">{title}</div>
      <div className="ab-cards">
        {resArr.map((imgNum, i) => (
          <CardOddBox
            key={i}
            imgNum={imgNum}
            item={items[i]}
            onBetClick={onBetClick}
            exposure={exposures?.[items[i]?.nat]}
          />
        ))}
      </div>
    </div>
  );
}

export default function BetTableAB20({ gameData, onBetClick, exposures = {} }) {
  const raw = gameData?.data?.data || gameData?.data || {};
  const sub = raw.sub || [];

  // ares/bres directly give the image numbers for each position
  const andarRes = useMemo(() => {
    const str = raw.ares || "";
    return str ? str.split(",").map((v) => parseInt(v, 10) || 0) : Array(13).fill(0);
  }, [raw.ares]);

  const baharRes = useMemo(() => {
    const str = raw.bres || "";
    return str ? str.split(",").map((v) => parseInt(v, 10) || 0) : Array(13).fill(0);
  }, [raw.bres]);

  const andarItems = useMemo(() => sub.filter((s) => s.nat?.startsWith("Andar")), [sub]);
  const baharItems = useMemo(() => sub.filter((s) => s.nat?.startsWith("Bahar")), [sub]);

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        <CardSection
          boxClass="andar-box"
          title="ANDAR"
          resArr={andarRes}
          items={andarItems}
          onBetClick={onBetClick}
          exposures={exposures}
        />
        <CardSection
          boxClass="bahar-box"
          title="BAHAR"
          resArr={baharRes}
          items={baharItems}
          onBetClick={onBetClick}
          exposures={exposures}
        />
      </div>
      <div className="casino-remark mt-1">
        <marquee scrollamount="3">{raw.remark || "Payout : Bahar 1st Card 25% and All Other Andar-Bahar Cards 100%."}</marquee>
      </div>
    </div>
  );
}
