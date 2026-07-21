const AB_CARD_BASE = "/assets/img/andar-bahar-cards/";

const CARD_POSITIONS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardOddBox({ pos, item, onBetClick, exposure }) {
  // When l > 0, show the card image (pos 1-13); when l === 0, show blank (0.jpg)
  const imgNum = item && item.l > 0 ? pos : 0;
  const imgSrc = `${AB_CARD_BASE}${imgNum}.jpg`;
  const odds = item?.b || 0;
  const canClick = odds > 0;
  const expN = exposure !== undefined ? parseFloat(exposure) : NaN;

  return (
    <div
      className="card-odd-box"
      onClick={canClick ? () => onBetClick?.(odds, item.nat, item, "back") : undefined}
      style={canClick ? { cursor: "pointer" } : undefined}
    >
      <div className="casino-odds">{item?.l || 0}</div>
      <div className={odds === 0 ? "" : ""}>
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

function CardSection({ boxClass, title, items, onBetClick, exposures, isSuspended }) {
  return (
    <div className={`${boxClass}${isSuspended ? " suspended-box" : ""}`}>
      <div className="ab-title">{title}</div>
      <div className="ab-cards">
        {CARD_POSITIONS.map((rank, i) => {
          const item = items.find((it) => it.nat?.endsWith(` ${rank}`));
          return (
            <CardOddBox
              key={rank}
              pos={i + 1}
              item={item}
              onBetClick={onBetClick}
              exposure={exposures?.[item?.nat]}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function BetTableAB3({ gameData, onBetClick, exposures = {} }) {
  const raw = gameData?.data?.data || gameData?.data || {};
  const child = raw.child || [];
  const sub = raw.sub || [];

  const andarItems = child.filter((c) => c.nat?.startsWith("Andar"));
  const baharItems = child.filter((c) => c.nat?.startsWith("Bahar"));

  // Suspended when the current sub item (Card N) is SUSPENDED
  const currentSub = sub[0];
  const isSuspended = !currentSub || currentSub.gstatus !== "OPEN";

  return (
    <div className="casino-table">
      <div className="casino-table-box">
        <CardSection
          boxClass="andar-box"
          title="ANDAR"
          items={andarItems}
          onBetClick={onBetClick}
          exposures={exposures}
          isSuspended={isSuspended}
        />
        <CardSection
          boxClass="bahar-box"
          title="BAHAR"
          items={baharItems}
          onBetClick={onBetClick}
          exposures={exposures}
          isSuspended={isSuspended}
        />
      </div>
      <div className="casino-remark mt-1">
        <marquee scrollamount="3">{raw.remark || ": Bahar 1st Card 25% and All Other Andar-Bahar Cards 100%."}</marquee>
      </div>
    </div>
  );
}
