function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function ExpBook({ value }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  if (isNaN(n) || n === 0) return null;
  return <div className={`casino-nation-book ${n >= 0 ? "text-success" : "text-danger"}`}>{n}</div>;
}

// Use Unicode suit symbols for reliable rendering
const SUIT_INFO = { SS: { sym: "♠", cls: "card-black" }, CC: { sym: "♣", cls: "card-black" }, HH: { sym: "♥", cls: "card-red" }, DD: { sym: "♦", cls: "card-red" } };

function parseCardToken(token) {
  if (!token || token === "1" || token === "0") return null;
  const t = token.trim();
  // Double-letter suffix: "ACC", "10HH", "KSS"
  for (const [suffix, info] of Object.entries(SUIT_INFO)) {
    if (t.endsWith(suffix)) {
      return { value: t.slice(0, -2), sym: info.sym, cls: info.cls };
    }
  }
  // Single-letter suffix fallback: "AC", "10H"
  const singleMap = { S: SUIT_INFO.SS, C: SUIT_INFO.CC, H: SUIT_INFO.HH, D: SUIT_INFO.DD };
  const last = t.slice(-1);
  if (singleMap[last]) {
    return { value: t.slice(0, -1), sym: singleMap[last].sym, cls: singleMap[last].cls };
  }
  return null;
}

function CardIcon({ token }) {
  const parsed = parseCardToken(token);
  if (!parsed) return null;
  return (
    <span className="card-icon ms-2">
      {parsed.value}<span className={`${parsed.cls} ms-1`}>{parsed.sym}</span>
    </span>
  );
}

// Parse player open cards from the cardData string
// Format: round-by-round with stride 9 (8 players + 1 separator per round)
// Round 1: idx 0-7, separator: idx 8
// Round 2: idx 9-16, separator: idx 17
// Round 3: idx 18-25
function getPlayerCards(cardData, playerIndex) {
  if (!cardData) return [];
  const cards = cardData.split(",").map((c) => c.trim()).filter(Boolean);
  const valid = (t) => t && t !== "1" && t !== "0";
  const result = [];
  for (let round = 0; round < 3; round++) {
    const idx = round * 9 + playerIndex;
    if (valid(cards[idx])) result.push(cards[idx]);
  }
  return result;
}

export default function BetTableTeen8({ tableData = [], onBetClick, exposures = {}, cardString = "" }) {
  const isSus = (item) => !item || item.gstatus !== "OPEN";

  // sub items: 0-7 = Player 1-8 (Odds), 8-15 = Pair Plus 1-8, 16-23 = Total 1-8
  // OR by nat: "Player 1", "Pair Plus 1", "Total 1"
  const players = Array.from({ length: 8 }, (_, i) => {
    const num = i + 1;
    const playerItem = tableData.find((d) => d.nat === `Player ${num}`) || tableData[i];
    const pairPlusItem = tableData.find((d) => d.nat === `Pair Plus ${num}`) || tableData[i + 8];
    const totalItem = tableData.find((d) => d.nat === `Total ${num}`) || tableData[i + 16];
    const openCards = getPlayerCards(cardString, i);
    return { num, playerItem, pairPlusItem, totalItem, openCards };
  });

  return (
    <div className="casino-table">
      <div className="casino-table-full-box">
        <div className="casino-table-header">
          <div className="casino-nation-detail"></div>
          <div className="casino-odds-box back">Odds</div>
          <div className="casino-odds-box back">Pair Plus</div>
          <div className="casino-odds-box back">Total</div>
        </div>
        <div className="casino-table-body">
          {players.map(({ num, playerItem, pairPlusItem, totalItem, openCards }) => {
            const susPl = isSus(playerItem);
            const susPP = isSus(pairPlusItem);
            const susTo = isSus(totalItem);
            return (
              <div key={num} className="casino-table-row">
                <div className="casino-nation-detail">
                  <div className="casino-nation-name">
                    Player {num}
                    {openCards.length > 0 && (
                      <div className="patern-name">
                        {openCards.map((token, ci) => <CardIcon key={ci} token={token} />)}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`casino-odds-box back${susPl ? " suspended-box" : ""}`}
                  onClick={() => !susPl && playerItem?.b > 0 && onBetClick?.(playerItem.b, playerItem.nat, playerItem, "back")}>
                  <span className="casino-odds">{playerItem?.b || 0}</span>
                  <ExpBook value={getExp(exposures, playerItem?.nat)} />
                </div>
                <div className={`casino-odds-box back${susPP ? " suspended-box" : ""}`}
                  onClick={() => !susPP && pairPlusItem?.b > 0 && onBetClick?.(pairPlusItem.b, pairPlusItem.nat, pairPlusItem, "back")}>
                  <span className="casino-odds">{`Pair Plus ${num}`}</span>
                  <ExpBook value={getExp(exposures, pairPlusItem?.nat)} />
                </div>
                <div className={`casino-odds-box back${susTo ? " suspended-box" : ""}`}
                  onClick={() => !susTo && totalItem?.b > 0 && onBetClick?.(totalItem.b, totalItem.nat, totalItem, "back")}>
                  <span className="casino-odds">{totalItem?.b || 0}</span>
                  <ExpBook value={getExp(exposures, totalItem?.nat)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
