import { useMemo } from "react";

const CARD_FACES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const CARD_IMG_BASE = "/assets/img/cards/";
const ICON_BASE = "/assets/img/icons/";

const SUITS = [
  { name: "spade", img: "spade.png", sid: 20 },
  { name: "club", img: "club.png", sid: 21 },
  { name: "heart", img: "heart.png", sid: 22 },
  { name: "diamond", img: "diamond.png", sid: 23 },
];

function isSuspended(item) {
  if (!item) return true;
  return item.gstatus === "SUSPENDED" || item.b === 0 || item.b === "0";
}

function ExposureBook({ value }) {
  if (value === undefined || value === null || value === 0) return null;
  const n = parseFloat(value);
  if (isNaN(n) || n === 0) return null;
  return (
    <div className="casino-nation-book text-center">
      <span className={n >= 0 ? "text-success" : "text-danger"}>
        {n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)}
      </span>
    </div>
  );
}

function PlayerBets({ title, items, onBetClick, exposures }) {
  // title is "A" or "B"
  const suffix = title === "A" ? "SA" : "SB";

  return (
    <div className="playera-bets">
      <div className="playera-title">{title}</div>

      {items.map((item) => {
        const susp = isSuspended(item);
        const isSaSb = item.nat === "SA" || item.nat === "SB";
        const label = isSaSb
          ? item.nat
          : item.nat === "1st Bet"
          ? "First Bet"
          : item.nat === "2nd Bet"
          ? "Second Bet"
          : item.nat;
        // For 1st/2nd Bet, append SA/SB so backend knows which side
        const apiNat = isSaSb ? item.nat : `${item.nat} ${suffix}`;

        if (isSaSb) {
          return (
            <div key={item.sid} className="player-sa">
              <div
                className={`player-sa-box${susp ? " suspended-box" : ""}`}
                onClick={susp ? undefined : () => onBetClick?.(item.b, apiNat, { ...item, nat: apiNat }, "back")}
                style={susp ? undefined : { cursor: "pointer" }}
              >
                <div className="casino-odds">{label}</div>
                <div className="casino-volume">{item.b || 0}</div>
              </div>
              <ExposureBook value={exposures?.[apiNat]} />
            </div>
          );
        }

        return (
          <div key={item.sid} className="player-bet">
            <div
              className={`player-bet-box${susp ? " suspended-box" : ""}`}
              onClick={susp ? undefined : () => onBetClick?.(item.b, apiNat, { ...item, nat: apiNat }, "back")}
              style={susp ? undefined : { cursor: "pointer" }}
            >
              <div className="casino-odds">{label}</div>
              <div className="casino-volume">{item.b || 0}</div>
            </div>
            <ExposureBook value={exposures?.[apiNat]} />
          </div>
        );
      })}

      <div className="playera-title">{title}</div>
    </div>
  );
}

export default function BetTableABJ({ gameData, onBetClick, exposures = {} }) {
  const raw = gameData?.data?.data || gameData?.data || {};
  const sub = raw.sub || [];

  const byId = useMemo(() => {
    const m = {};
    sub.forEach((s) => { m[s.sid] = s; });
    return m;
  }, [sub]);

  // A side: sid 1=SA, 2=1st Bet, 3=2nd Bet
  const aItems = [byId[1], byId[2], byId[3]].filter(Boolean);
  // B side: sid 4=SB, 5=1st Bet, 6=2nd Bet
  const bItems = [byId[4], byId[5], byId[6]].filter(Boolean);

  const oddItem = byId[24];
  const evenItem = byId[25];

  const jokerOdds = byId[7]?.b || 0;

  return (
    <div className="casino-table ab2">
      {/* Section 1: Player A/B bets */}
      <div className="casino-table-full-box">
        <PlayerBets title="A" items={aItems} onBetClick={onBetClick} exposures={exposures} />
        <PlayerBets title="B" items={bItems} onBetClick={onBetClick} exposures={exposures} />
      </div>

      {/* Section 2: Odd/Even + Suits */}
      <div className="casino-table-box mt-3">
        <div className="casino-table-left-box">
          {/* Odd */}
          <div className="ab2-box">
            <div className="casino-odds text-center">ODD</div>
            <div
              className={`casino-odds-box back${isSuspended(oddItem) ? " suspended-box" : ""}`}
              onClick={isSuspended(oddItem) ? undefined : () => onBetClick?.(oddItem.b, oddItem.nat, oddItem, "back")}
              style={isSuspended(oddItem) ? undefined : { cursor: "pointer" }}
            >
              <span className="casino-odds">{oddItem?.b || 0}</span>
            </div>
            <ExposureBook value={exposures?.[oddItem?.nat]} />
          </div>
          {/* Even */}
          <div className="ab2-box">
            <div className="casino-odds text-center">EVEN</div>
            <div
              className={`casino-odds-box back${isSuspended(evenItem) ? " suspended-box" : ""}`}
              onClick={isSuspended(evenItem) ? undefined : () => onBetClick?.(evenItem.b, evenItem.nat, evenItem, "back")}
              style={isSuspended(evenItem) ? undefined : { cursor: "pointer" }}
            >
              <span className="casino-odds">{evenItem?.b || 0}</span>
            </div>
            <ExposureBook value={exposures?.[evenItem?.nat]} />
          </div>
        </div>

        <div className="casino-table-right-box">
          {SUITS.map((suit) => {
            const item = byId[suit.sid];
            const susp = isSuspended(item);
            return (
              <div key={suit.name} className="ab2-box">
                <div className="casino-odds text-center">
                  <img src={`${ICON_BASE}${suit.img}`} alt={suit.name} style={{ width: 20, height: 20 }} />
                </div>
                <div
                  className={`casino-odds-box back${susp ? " suspended-box" : ""}`}
                  onClick={susp || !item ? undefined : () => onBetClick?.(item.b, item.nat, item, "back")}
                  style={susp || !item ? undefined : { cursor: "pointer" }}
                >
                  <span className="casino-odds">{item?.b || 0}</span>
                </div>
                <ExposureBook value={exposures?.[item?.nat]} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: 13 card grid */}
      <div className="casino-table-full-box ab2cards mt-3">
        <div className="casino-bl-box casino-cards-odds-title w-100 text-center mb-1">
          <b>{jokerOdds}</b>
        </div>
        {CARD_FACES.map((face, i) => {
          const item = byId[7 + i];
          const susp = isSuspended(item);
          return (
            <div
              key={face}
              className="card-odd-box"
              onClick={susp ? undefined : () => onBetClick?.(item.b, item.nat, item, "back")}
              style={susp ? undefined : { cursor: "pointer" }}
            >
              <div className={susp ? "suspended-box" : ""}>
                <img src={`${CARD_IMG_BASE}${face}.png`} alt={face} />
              </div>
              <ExposureBook value={exposures?.[item?.nat]} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
