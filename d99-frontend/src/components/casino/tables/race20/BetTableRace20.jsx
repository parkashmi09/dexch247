function getExp(exposures, nat) {
  if (!nat || !exposures) return null;
  return exposures[nat] ?? exposures[nat.toLowerCase()] ?? null;
}

function NationBook({ value, className = "" }) {
  const n = value !== null && value !== undefined ? parseFloat(value) : NaN;
  const show = !isNaN(n) && n !== 0;
  return (
    <div className={`casino-nation-book ${className}`}>
      {show && <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>}
    </div>
  );
}

const KING_ITEMS = [
  { nat: "K of spade",   img: "/assets/img/cards/KSS.jpg" },
  { nat: "K of heart",   img: "/assets/img/cards/KHH.jpg" },
  { nat: "K of club",    img: "/assets/img/cards/KCC.jpg" },
  { nat: "K of diamond", img: "/assets/img/cards/KDD.jpg" },
];

const WIN_WITH_ITEMS = [
  "Win with 5",
  "Win with 6",
  "Win with 7",
  "Win with 15",
  "Win with 16",
  "Win with 17",
];

const isSus = (item) => !item || item.gstatus !== "OPEN";

export default function BetTableRace20({ tableData = [], onBetClick, exposures = {} }) {
  const find = (name) => tableData.find((d) => d.nat === name);

  const totalPoints = find("Total points");
  const totalCards = find("Total cards");

  return (
    <div className="casino-table">
      {/* Top: 4 Kings */}
      <div className="casino-table-box">
        {KING_ITEMS.map(({ nat, img }) => {
          const item = find(nat);
          const sus = isSus(item);
          const exp = getExp(exposures, nat);
          return (
            <div key={nat} className="casino-odd-box-container">
              <div className="casino-nation-name">
                <img src={img} alt={nat} />
              </div>
              <div
                className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
              >
                <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
                <div className="casino-volume">10000</div>
              </div>
              <div
                className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
                onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, nat, item, "lay")}
              >
                <span className="casino-odds">{sus ? 0 : item?.l || 0}</span>
                <div className="casino-volume">10000</div>
              </div>
              <NationBook value={exp} className="text-center w-100" />
            </div>
          );
        })}
      </div>

      {/* Bottom: Fancy left + Win-with right */}
      <div className="casino-table-box mt-3">
        {/* Left: Total points + Total cards */}
        <div className="casino-table-left-box">
          {/* Total points */}
          <div className="casino-odd-box-container">
            <div className="casino-nation-name"></div>
            <div className="casino-nation-name">No</div>
            <div className="casino-nation-name">Yes</div>
          </div>
          {(() => {
            const item = totalPoints;
            const sus = isSus(item);
            const exp = getExp(exposures, "Total points");
            return (
              <div className="casino-odd-box-container">
                <div className="casino-nation-name">Total points</div>
                <div
                  className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
                  onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, "Total points", item, "lay")}
                >
                  <span className="casino-odds">{sus ? 0 : item?.l || 0}</span>
                  <div className="casino-volume text-center">{sus ? "" : item?.ls || ""}</div>
                </div>
                <div
                  className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                  onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, "Total points", item, "back")}
                >
                  <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
                  <div className="casino-volume text-center">{sus ? "" : item?.bs || ""}</div>
                </div>
                <NationBook value={exp} />
              </div>
            );
          })()}

          {/* Total cards */}
          <div className="casino-odd-box-container">
            <div className="casino-nation-name"></div>
            <div className="casino-nation-name">No</div>
            <div className="casino-nation-name">Yes</div>
          </div>
          {(() => {
            const item = totalCards;
            const sus = isSus(item);
            const exp = getExp(exposures, "Total cards");
            return (
              <div className="casino-odd-box-container">
                <div className="casino-nation-name">Total cards</div>
                <div
                  className={`casino-odds-box lay${sus ? " suspended-box" : ""}`}
                  onClick={() => !sus && item?.l > 0 && onBetClick?.(item.l, "Total cards", item, "lay")}
                >
                  <span className="casino-odds">{sus ? 0 : item?.l || 0}</span>
                  <div className="casino-volume text-center">{sus ? "" : item?.ls || ""}</div>
                </div>
                <div
                  className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                  onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, "Total cards", item, "back")}
                >
                  <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
                  <div className="casino-volume text-center">{sus ? "" : item?.bs || ""}</div>
                </div>
                <NationBook value={exp} />
              </div>
            );
          })()}
        </div>

        {/* Right: Win with 5, 6, 7, 15, 16, 17 */}
        <div className="casino-table-right-box">
          {WIN_WITH_ITEMS.map((nat) => {
            const item = find(nat);
            const sus = isSus(item);
            const exp = getExp(exposures, nat);
            const n = exp !== null && exp !== undefined ? parseFloat(exp) : NaN;
            const showExp = !isNaN(n) && n !== 0;
            return (
              <div key={nat} className="casino-odd-box-container">
                <div className="casino-nation-name">{nat}</div>
                <div
                  className={`casino-odds-box back${sus ? " suspended-box" : ""}`}
                  onClick={() => !sus && item?.b > 0 && onBetClick?.(item.b, nat, item, "back")}
                >
                  <span className="casino-odds">{sus ? 0 : item?.b || 0}</span>
                </div>
                <div className="casino-nation-book text-center w-100 text-danger">
                  {showExp && <span className={n >= 0 ? "text-success" : "text-danger"}>{n}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
