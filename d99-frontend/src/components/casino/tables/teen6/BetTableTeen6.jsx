/**
 * Teen6 (Teenpatti 2.0) bet table:
 * - Player A / Player B main (etype=Match) + Under 21 / Over 22 (subtype=uo)
 * - Suit row: spade/heart/club/diamond from visible suit sub-item
 * - Odd/Even row: from visible oddeven sub-item
 * - Card value row (A-K): from visible cards sub-item
 */

const CARD_IMG_MAP = {
  "Card A": "A",
  "Card 2": "2",
  "Card 3": "3",
  "Card 4": "4",
  "Card 5": "5",
  "Card 6": "6",
  "Card 7": "7",
  "Card 8": "8",
  "Card 9": "9",
  "Card 10": "10",
  "Card J": "J",
  "Card Q": "Q",
  "Card K": "K",
};

const CARD_ORDER = ["Card A","Card 2","Card 3","Card 4","Card 5","Card 6","Card 7","Card 8","Card 9","Card 10","Card J","Card Q","Card K"];

function getExposure(exposures, nat) {
  if (!nat || !exposures) return null;
  const keys = [nat, nat.toLowerCase(), nat.trim(), nat.toLowerCase().trim()];
  for (const k of keys) {
    if (exposures[k] !== undefined) return exposures[k];
  }
  return null;
}

function ExposureDisplay({ value }) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return null;
  return (
    <div className={`casino-nation-book ${num >= 0 ? "text-success" : "text-danger"}`}>
      {num}
    </div>
  );
}

function isSuspended(item) {
  return !item || item.gstatus !== "OPEN";
}

export default function BetTableTeen6({ tableData = [], onBetClick, exposures = {} }) {
  // Main match items
  const playerAMain = tableData.find((s) => s.nat === "Player A" && s.etype === "Match");
  const playerBMain = tableData.find((s) => s.nat === "Player B" && s.etype === "Match");

  // Under/Over
  const playerAUnder = tableData.find((s) => s.nat === "Player A Under 21");
  const playerAOver = tableData.find((s) => s.nat === "Player A Over 22");
  const playerBUnder = tableData.find((s) => s.nat === "Player B Under 21");
  const playerBOver = tableData.find((s) => s.nat === "Player B Over 22");

  // Suit: find visible=1 OR (first one with OPEN gstatus)
  const suitItem = tableData.find((s) => s.subtype === "suit" && s.visible === 1)
    || tableData.find((s) => s.subtype === "suit" && s.gstatus === "OPEN")
    || tableData.find((s) => s.subtype === "suit");
  const suitSuspended = isSuspended(suitItem);

  // OddEven
  const oddEvenItem = tableData.find((s) => s.subtype === "oddeven" && s.visible === 1)
    || tableData.find((s) => s.subtype === "oddeven" && s.gstatus === "OPEN")
    || tableData.find((s) => s.subtype === "oddeven");
  const oddEvenSuspended = isSuspended(oddEvenItem);

  // Cards
  const cardsItem = tableData.find((s) => s.subtype === "cards" && s.visible === 1)
    || tableData.find((s) => s.subtype === "cards" && s.gstatus === "OPEN")
    || tableData.find((s) => s.subtype === "cards");
  const cardsSuspended = isSuspended(cardsItem);

  function getSuitOdds(nat) {
    if (!suitItem?.odds) return 0;
    return suitItem.odds.find((o) => o.nat === nat)?.b || 0;
  }

  function getSuitOddItem(nat) {
    return suitItem?.odds?.find((o) => o.nat === nat);
  }

  function getOddEvenOdds(nat) {
    if (!oddEvenItem?.odds) return 0;
    return oddEvenItem.odds.find((o) => o.nat === nat)?.b || 0;
  }

  function getOddEvenOddItem(nat) {
    return oddEvenItem?.odds?.find((o) => o.nat === nat);
  }

  function getCardOdds(nat) {
    if (!cardsItem?.odds) return 0;
    return cardsItem.odds.find((o) => o.nat === nat)?.b || 0;
  }

  function getCardOddItem(nat) {
    return cardsItem?.odds?.find((o) => o.nat === nat);
  }

  function renderPlayerSide(title, mainItem, underItem, overItem, side) {
    const mainSuspended = isSuspended(mainItem);
    const underSuspended = isSuspended(underItem);
    const overSuspended = isSuspended(overItem);

    const mainExp = getExposure(exposures, mainItem?.nat);
    const underExp = getExposure(exposures, underItem?.nat);
    const overExp = getExposure(exposures, overItem?.nat);

    return (
      <div className={`casino-table-${side}-box`}>
        <div className="casino-table-header">
          <div className="casino-nation-detail">{title}</div>
          <div className="casino-odds-box back">Back</div>
          <div className="casino-odds-box lay">Lay</div>
        </div>
        <div className="casino-table-body">
          {/* Main row */}
          <div className="casino-table-row ">
            <div className="casino-nation-detail">
              <div className="casino-nation-name">
                Main
                <ExposureDisplay value={mainExp} />
              </div>
            </div>
            <div
              className={`casino-odds-box back${mainSuspended ? " suspended-box" : ""}`}
              onClick={() => !mainSuspended && mainItem?.b > 0 && onBetClick?.(mainItem.b, mainItem.nat, mainItem, "back")}
            >
              <span className="casino-odds">{mainItem?.b || 0}</span>
            </div>
            <div
              className={`casino-odds-box lay${mainSuspended ? " suspended-box" : ""}`}
              onClick={() => !mainSuspended && mainItem?.l > 0 && onBetClick?.(mainItem.l, mainItem.nat, mainItem, "lay")}
            >
              <span className="casino-odds">{mainItem?.l || 0}</span>
            </div>
          </div>

          {/* Under/Over row */}
          <div className="casino-table-row under-over-row">
            <div className="uo-box">
              <div className="casino-nation-detail">
                <div className="casino-nation-name">
                  Under 21
                  <ExposureDisplay value={underExp} />
                </div>
              </div>
              <div
                className={`casino-odds-box back${underSuspended ? " suspended-box" : ""}`}
                onClick={() => !underSuspended && underItem?.b > 0 && onBetClick?.(underItem.b, underItem.nat, underItem, "back")}
              >
                <span className="casino-odds">{underItem?.b || 0}</span>
              </div>
            </div>
            <div className="uo-box">
              <div className="casino-nation-detail">
                <div className="casino-nation-name">
                  Over 22
                  <ExposureDisplay value={overExp} />
                </div>
              </div>
              <div
                className={`casino-odds-box back${overSuspended ? " suspended-box" : ""}`}
                onClick={() => !overSuspended && overItem?.b > 0 && onBetClick?.(overItem.b, overItem.nat, overItem, "back")}
              >
                <span className="casino-odds">{overItem?.b || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Suit boxes: order is Spade, Heart, Club, Diamond
  const suits = [
    { nat: "Spade",   icon: "/assets/img/icons/spade.png" },
    { nat: "Heart",   icon: "/assets/img/icons/heart.png" },
    { nat: "Club",    icon: "/assets/img/icons/club.png" },
    { nat: "Diamond", icon: "/assets/img/icons/diamond.png" },
  ];

  const oddEvenPairs = [
    { nat: "Odd",  label: "Odd" },
    { nat: "Even", label: "Even" },
  ];

  return (
    <div className="casino-table">
      {/* Player A / Player B main + under/over */}
      <div className="casino-table-box">
        {renderPlayerSide("Player A", playerAMain, playerAUnder, playerAOver, "left")}
        <div className="casino-table-box-divider"></div>
        {renderPlayerSide("Player B", playerBMain, playerBUnder, playerBOver, "right")}
      </div>

      {/* Suit + Odd/Even row */}
      <div className="casino-table-full-box teen2other mt-3">
        {suits.map(({ nat, icon }) => {
          const odds = getSuitOdds(nat);
          const oddItem = getSuitOddItem(nat);
          const susp = suitSuspended || !oddItem;
          // Include the active card position so settlement knows WHICH card, e.g.
          // "Card 6 Spade" (suitItem.nat = "Card N", visible card being bet on).
          const sel = suitItem?.nat ? `${suitItem.nat} ${nat}` : nat;
          const exp = getExposure(exposures, sel);
          return (
            <div
              key={nat}
              className={`casino-odds-box back${susp ? " suspended-box" : ""}`}
              onClick={() => !susp && odds > 0 && onBetClick?.(odds, sel, { ...suitItem, nat: sel, _parentSid: suitItem?.sid, sid: oddItem?.sno || oddItem?.sid }, "back")}
            >
              <div>
                <img src={icon} alt={nat} />
              </div>
              <div>
                <span className="casino-odds">{odds || 0}</span>
                <ExposureDisplay value={exp} />
              </div>
            </div>
          );
        })}
        {oddEvenPairs.map(({ nat, label }) => {
          const odds = getOddEvenOdds(nat);
          const oddItem = getOddEvenOddItem(nat);
          const susp = oddEvenSuspended || !oddItem;
          // e.g. "Card 6 Odd" (oddEvenItem.nat = "Card N", the active card).
          const sel = oddEvenItem?.nat ? `${oddEvenItem.nat} ${nat}` : nat;
          const exp = getExposure(exposures, sel);
          return (
            <div
              key={nat}
              className={`casino-odds-box back${susp ? " suspended-box" : ""}`}
              onClick={() => !susp && odds > 0 && onBetClick?.(odds, sel, { ...oddEvenItem, nat: sel, _parentSid: oddEvenItem?.sid, sid: oddItem?.sno || oddItem?.sid }, "back")}
            >
              <div>
                <b>{label}</b>
              </div>
              <div>
                <span className="casino-odds">{odds || 0}</span>
                <ExposureDisplay value={exp} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Card value row (A through K) */}
      <div className="casino-table-full-box teen2cards mt-3">
        {CARD_ORDER.map((cardNat) => {
          const odds = getCardOdds(cardNat);
          const oddItem = getCardOddItem(cardNat);
          const susp = cardsSuspended || !oddItem;
          const imgKey = CARD_IMG_MAP[cardNat];
          // e.g. "Card 6 K" — active card position + the bet rank.
          const rank = cardNat.replace(/^Card\s+/i, "");
          const sel = cardsItem?.nat ? `${cardsItem.nat} ${rank}` : cardNat;
          const exp = getExposure(exposures, sel);
          return (
            <div
              key={cardNat}
              className={`card-odd-box${susp ? " suspended-box" : ""}`}
              onClick={() => !susp && odds > 0 && onBetClick?.(odds, sel, { ...cardsItem, nat: sel, _parentSid: cardsItem?.sid, sid: oddItem?.sno || oddItem?.sid }, "back")}
            >
              <span className="casino-odds">{odds || 0}</span>
              <div>
                <img src={`/assets/img/cards/${imgKey}.png`} alt={cardNat} />
              </div>
              <ExposureDisplay value={exp} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
