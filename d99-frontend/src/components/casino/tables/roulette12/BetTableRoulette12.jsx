import { memo, useMemo } from "react";

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

// [number, splitLeftId, straightId, cornerId, splitTopId]
const NUMBERS = [
  [0, 0, 1, 0, 0],
  [1, 38, 2, 110, 74],
  [2, 39, 3, 145, 75],
  [3, 40, 4, 146, 98],
  [4, 41, 5, 0, 76],
  [5, 52, 6, 111, 77],
  [6, 63, 7, 112, 99],
  [7, 42, 8, 0, 78],
  [8, 53, 9, 113, 79],
  [9, 64, 10, 114, 100],
  [10, 43, 11, 0, 80],
  [11, 54, 12, 115, 81],
  [12, 65, 13, 116, 101],
  [13, 44, 14, 0, 82],
  [14, 55, 15, 117, 83],
  [15, 66, 16, 118, 102],
  [16, 45, 17, 0, 84],
  [17, 56, 18, 119, 85],
  [18, 67, 19, 120, 103],
  [19, 46, 20, 0, 86],
  [20, 57, 21, 121, 87],
  [21, 68, 22, 122, 104],
  [22, 47, 23, 0, 88],
  [23, 58, 24, 123, 89],
  [24, 69, 25, 124, 105],
  [25, 48, 26, 0, 90],
  [26, 59, 27, 125, 91],
  [27, 70, 28, 126, 106],
  [28, 49, 29, 0, 92],
  [29, 60, 30, 127, 93],
  [30, 71, 31, 128, 107],
  [31, 50, 32, 0, 94],
  [32, 61, 33, 129, 95],
  [33, 72, 34, 130, 108],
  [34, 51, 35, 0, 96],
  [35, 62, 36, 131, 97],
  [36, 73, 37, 132, 109],
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

const BetTableRoulette12 = memo(function BetTableRoulette12({ gameData, onBet, latestWinNumber = -1 }) {
  const lt = gameData?.lt ?? 0;
  const sub = gameData?.sub;
  const mid = gameData?.mid ?? "";

  const statusMap = useMemo(() => {
    const map = {};
    if (sub) sub.forEach((item) => { map[item.i] = item.s; });
    return map;
  }, [sub]);

  const winnerStraightId = useMemo(() => {
    if (lt > 0) return -1;
    if (latestWinNumber >= 0 && latestWinNumber <= 36) return latestWinNumber + 1;
    for (let id = 1; id <= 37; id++) {
      if (statusMap[id] === 1) return id;
    }
    return -1;
  }, [lt, latestWinNumber, statusMap]);

  const isCellSuspended = (straightId) => {
    if (lt > 0) return false;
    return straightId !== winnerStraightId;
  };

  const outsideSuspended = lt <= 0;
  const isWinner = (straightId) => lt <= 0 && straightId === winnerStraightId;

  const click = (id) => {
    if (!onBet) return;
    onBet(id);
  };

  const osc = outsideSuspended ? " suspended-box" : "";

  return (
    <div className="roulette-box-container">
      <div className="board-in">
        <div className="board-right">
          {RIGHT_BETS.map((bet) => (
            <div key={bet.id} className={`board-cell yellow${osc}`}>
              <div className="board-cell-in">
                <span className="board-text">{bet.label}</span>
                <div id={String(bet.id)} className="bet-chip-area center-center coin-place" onClick={() => click(bet.id)} />
              </div>
            </div>
          ))}
        </div>

        <div className="board-bottom">
          {BOTTOM_BETS.map((bet) => (
            <div key={bet.id} className={`board-cell yellow${osc}`}>
              <div className="board-cell-in">
                <span className="board-text">{bet.label}</span>
                <div id={String(bet.id)} className="bet-chip-area center-center coin-place" onClick={() => click(bet.id)} />
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
                    <div id="1" className="bet-chip-area center-center coin-place" onClick={() => click(1)} />
                  </div>
                </div>
              );
            }

            return (
              <div key={num} className={cls}>
                <div className="board-cell-in">
                  <span key={spanKey} className={numCls}>{num}</span>
                  <div id={String(splitLeft)} className="bet-chip-area center-left coin-place" onClick={() => click(splitLeft)} />
                  <div id={String(straight)} className="bet-chip-area center-center coin-place" onClick={() => click(straight)} />
                  {corner > 0 && (
                    <div id={String(corner)} className="bet-chip-area bottom-left coin-place" onClick={() => click(corner)} />
                  )}
                  <div id={String(splitTop)} className="bet-chip-area top-center coin-place" onClick={() => click(splitTop)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default BetTableRoulette12;
