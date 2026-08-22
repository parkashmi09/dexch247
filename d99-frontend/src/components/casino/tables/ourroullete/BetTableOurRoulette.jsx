import { memo, useMemo } from "react";

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

const NUMBERS = [
  [0,0,1,0,0],[1,38,2,110,74],[2,39,3,145,75],[3,40,4,146,98],
  [4,41,5,0,76],[5,52,6,111,77],[6,63,7,112,99],[7,42,8,0,78],
  [8,53,9,113,79],[9,64,10,114,100],[10,43,11,0,80],[11,54,12,115,81],
  [12,65,13,116,101],[13,44,14,0,82],[14,55,15,117,83],[15,66,16,118,102],
  [16,45,17,0,84],[17,56,18,119,85],[18,67,19,120,103],[19,46,20,0,86],
  [20,57,21,121,87],[21,68,22,122,104],[22,47,23,0,88],[23,58,24,123,89],
  [24,69,25,124,105],[25,48,26,0,90],[26,59,27,125,91],[27,70,28,126,106],
  [28,49,29,0,92],[29,60,30,127,93],[30,71,31,128,107],[31,50,32,0,94],
  [32,61,33,129,95],[33,72,34,130,108],[34,51,35,0,96],[35,62,36,131,97],
  [36,73,37,132,109],
];

const RIGHT_BETS = [
  { id: 138, label: "2to1" },
  { id: 137, label: "2to1" },
  { id: 136, label: "2to1" },
];

const BOTTOM_BETS = [
  { id: 133, label: "1st12" },
  { id: 134, label: "2nd12" },
  { id: 135, label: "3rd12" },
  { id: 139, label: "1 - 18" },
  { id: 144, label: "Even" },
  { id: 141, label: "Red" },
  { id: 142, label: "Black" },
  { id: 143, label: "Odd" },
  { id: 140, label: "19 - 36" },
];

function getColor(n) {
  if (n === 0) return "green";
  return RED.has(n) ? "red" : "black";
}

function chipLabel(n) {
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${Math.round((n / 1000) * 10) / 10}K`;
  return String(n);
}

// Colour tiers mirror the denomination selector in OurRoulettePage.
function chipColor(n) {
  if (n >= 1000) return "#aa66cc";
  if (n >= 200) return "#99cc00";
  return "#00ddff";
}

/** A chip sitting on a board spot — same markup as the denomination chips, so
 *  the existing .board-cell-in .casino-coin .bet-chip-holder sizing applies. */
function PlacedChip({ amount }) {
  return (
    <div className="casino-coin">
      <div className="bet-chip-holder" style={{ "--g-chip-inner-color": chipColor(amount) }}>
        <div className="bet-chip">
          <div className="bet-chip-front" />
          <div className="bet-chip-top" />
          <div className="bet-chip-amount">
            <svg className="bet-chip-amount-in" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 108 108">
              <text x="50%" y="53.5%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="700">
                {chipLabel(amount)}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const BetTableOurRoulette = memo(function BetTableOurRoulette({ gameData, onBet, latestWinNumber = -1, myBets = [] }) {
  const lt = gameData?.lt ?? 0;
  const sub = gameData?.sub;
  const mid = gameData?.mid ?? "";

  const statusMap = useMemo(() => {
    const map = {};
    if (sub) sub.forEach((item) => { map[item.i] = item; });
    return map;
  }, [sub]);

  // Total staked per board spot, so a placed bet actually shows up as a chip on
  // the table. Derived from myBets (the server's own list for this round) rather
  // than a local array, so the chips survive a page refresh and disappear by
  // themselves when a bet is undone — the 2s My Bet poll is the single source of
  // truth. The feed's `n` (spot name, e.g. "0", "20,21", "3rd Column") maps back
  // to the board id `i`.
  const stakeBySpot = useMemo(() => {
    const idByName = {};
    (sub || []).forEach((item) => { if (item?.n != null) idByName[String(item.n)] = item.i; });
    const totals = {};
    myBets.forEach((b) => {
      const id = idByName[String(b.matchedBet ?? "").trim()];
      if (id == null) return;
      totals[id] = (totals[id] || 0) + (parseFloat(b.stake) || 0);
    });
    return totals;
  }, [sub, myBets]);

  const winnerStraightId = useMemo(() => {
    if (lt > 0) return -1;
    if (latestWinNumber >= 0 && latestWinNumber <= 36) return latestWinNumber + 1;
    for (let id = 1; id <= 37; id++) {
      if (statusMap[id]?.s === 1) return id;
    }
    return -1;
  }, [lt, latestWinNumber, statusMap]);

  // Per-SPOT availability. Unique Roulette deals cards out of the deck, so a spot
  // closes the moment its numbers are gone: the feed flags that per entry with
  // `s` (1 = still in the deck, 0 = drawn) and zeroes `b`. Only ~11 of the 146
  // spots are typically live late in a round.
  //
  // This gate used to be missing entirely: while betting was open (lt > 0) NO
  // cell was ever marked suspended, so every drawn number stayed clickable. The
  // click then sent odds 0, which the server rejects outright
  // (controller/casino/casinoController.js validates `!odds`), returning HTTP 400
  // — and placeCasinoBet throws on non-2xx, so the page's catch fired the generic
  // "Error placing bet" toast. Verified live: a spot with s:0 → HTTP 400.
  //
  // Checked per chip-area id, NOT per cell: one number cell hosts up to four
  // separate spots (split-left, straight, corner, split-top), each with its own
  // `s`/`b`.
  const isAvailable = (id) => {
    const it = statusMap[id];
    return !!it && Number(it.s) === 1 && Number(it.b) > 0;
  };

  const isCellSuspended = (straightId) => lt > 0 ? !isAvailable(straightId) : straightId !== winnerStraightId;
  const isOutsideSuspended = lt <= 0;
  const isOutsideCellSuspended = (id) => isOutsideSuspended || !isAvailable(id);
  const isWinner = (straightId) => lt <= 0 && straightId === winnerStraightId;

  // Never emit a bet for a spot that is out of play — the server would 400 it.
  const click = (id) => { if (lt > 0 && isAvailable(id)) onBet?.(id); };
  const chipProps = (id) => (lt > 0 && isAvailable(id)
    ? { onClick: () => click(id), style: { cursor: "pointer" } }
    : { style: { pointerEvents: "none" } });

  // Get rate for outside bets from sub item
  const getRate = (id) => {
    const item = statusMap[id];
    if (!item || isOutsideSuspended) return 0;
    return item.b || 0;
  };

  return (
    <div className="roulette-box-container">
      <div className="board-in">
        <div className="board-right">
          {RIGHT_BETS.map((bet) => (
            <div key={bet.id} className={`board-cell yellow${isOutsideCellSuspended(bet.id) ? " suspended-box" : ""}`}>
              <div className="board-cell-in">
                <span className="board-text">{bet.label}</span>
                {!isOutsideSuspended && <span className="rate"><b>{getRate(bet.id)}</b></span>}
                {isOutsideSuspended && "0"}
                <div id={String(bet.id)} className="bet-chip-area center-center coin-place" {...chipProps(bet.id)}>{stakeBySpot[bet.id] > 0 && <PlacedChip amount={stakeBySpot[bet.id]} />}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="board-bottom">
          {BOTTOM_BETS.map((bet) => (
            <div key={bet.id} className={`board-cell yellow${isOutsideCellSuspended(bet.id) ? " suspended-box" : ""}`}>
              <div className="board-cell-in">
                <span className="board-text">{bet.label}</span>
                {!isOutsideSuspended && <span className="rate"><b>{getRate(bet.id)}</b></span>}
                {isOutsideSuspended && "0"}
                <div id={String(bet.id)} className="bet-chip-area center-center coin-place" {...chipProps(bet.id)}>{stakeBySpot[bet.id] > 0 && <PlacedChip amount={stakeBySpot[bet.id]} />}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="board-center">
          {NUMBERS.map(([num, splitLeft, straight, corner, splitTop]) => {
            const color = getColor(num);
            const susp = isCellSuspended(straight);
            const cls = `board-cell ${color}${susp ? " suspended-box" : ""}`;
            const won = isWinner(straight);
            const numCls = `board-number${won ? " pop-outin" : ""}`;
            const spanKey = won ? `${num}-win-${mid}` : num;

            if (num === 0) {
              return (
                <div key={num} className={cls}>
                  <div className="board-cell-in">
                    <span key={spanKey} className={numCls}>0</span>
                    <div id="1" className="bet-chip-area center-center coin-place" {...chipProps(1)}>{stakeBySpot[1] > 0 && <PlacedChip amount={stakeBySpot[1]} />}</div>
                  </div>
                </div>
              );
            }

            return (
              <div key={num} className={cls}>
                <div className="board-cell-in">
                  <span key={spanKey} className={numCls}>{num}</span>
                  <div id={String(splitLeft)} className="bet-chip-area center-left coin-place" {...chipProps(splitLeft)}>{stakeBySpot[splitLeft] > 0 && <PlacedChip amount={stakeBySpot[splitLeft]} />}</div>
                  <div id={String(straight)} className="bet-chip-area center-center coin-place" {...chipProps(straight)}>{stakeBySpot[straight] > 0 && <PlacedChip amount={stakeBySpot[straight]} />}</div>
                  {corner > 0 && <div id={String(corner)} className="bet-chip-area bottom-left coin-place" {...chipProps(corner)}>{stakeBySpot[corner] > 0 && <PlacedChip amount={stakeBySpot[corner]} />}</div>}
                  <div id={String(splitTop)} className="bet-chip-area top-center coin-place" {...chipProps(splitTop)}>{stakeBySpot[splitTop] > 0 && <PlacedChip amount={stakeBySpot[splitTop]} />}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default BetTableOurRoulette;
