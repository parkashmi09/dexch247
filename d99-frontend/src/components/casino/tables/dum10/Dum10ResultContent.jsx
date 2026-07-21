import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CARD_BASE = "/assets/img/cards";
const CARD_VALUES = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13 };
const SUIT_NAMES = { SS: "Spade", HH: "Heart", CC: "Club", DD: "Diamond" };

function getCardImg(token) {
  if (!token || token === "1") return null;
  return `${CARD_BASE}/${token.trim()}.jpg`;
}

function getRank(token) {
  if (!token || token === "1") return "";
  return token.replace(/[HDCS]{2}$/i, "").toUpperCase();
}

function getSuitName(token) {
  if (!token || token === "1") return "";
  const s = token.slice(-2).toUpperCase();
  return SUIT_NAMES[s] || "";
}

function getSuitColor(token) {
  const s = token?.slice(-2)?.toUpperCase();
  return s === "HH" || s === "DD" ? "Red" : "Black";
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

const sliderSettings = { dots: false, infinite: false, speed: 300, slidesToShow: 6, slidesToScroll: 6, initialSlide: 0, arrows: true };

export default function Dum10ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", win = "", rdesc = "" } = t1;

  const allTokens = card ? card.split(",").map((c) => c.trim()).filter((c) => c && c !== "1") : [];
  const lastCard = allTokens[allTokens.length - 1] || "";
  const historyCards = allTokens.slice(0, -1);

  const lastRank = getRank(lastCard);
  const lastVal = CARD_VALUES[lastRank] || 0;
  const lastSuit = getSuitName(lastCard);
  const lastColor = getSuitColor(lastCard);
  const isOdd = lastVal % 2 !== 0;

  // Parse rdesc for totals or compute
  let currTotal = 0;
  let mainNat = "";
  if (rdesc) {
    const parts = rdesc.split("#");
    if (parts[0]) mainNat = parts[0];
  }
  currTotal = historyCards.reduce((s, t) => s + (CARD_VALUES[getRank(t)] || 0), 0);
  const newTotal = currTotal + lastVal;
  const isYes = String(win) === "1";

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2 ab-result-container">
        <div className="col-md-10 text-center">
          <div className="casino-result-cards ab-result-slider">
            <Slider {...sliderSettings}>
              {historyCards.map((token, i) => (
                <div key={i}>
                  <img src={getCardImg(token)} alt={token} style={{ width: "100%", display: "inline-block" }} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
        <div className="col-md-2 text-center">
          <div className="casino-result-cards">
            {getCardImg(lastCard) && <img src={getCardImg(lastCard)} alt={lastCard} />}
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Card</div>
              <div>{lastRank} {lastSuit}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Curr. Total</div>
              <div>{currTotal} | {mainNat || `Next Total ${Math.ceil((currTotal + 1) / 10) * 10} or More`}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Total</div>
              <div>{currTotal} + {lastVal} = {newTotal} | {isYes ? "Yes" : "No"}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Odd/Even</div>
              <div>{isOdd ? "Odd" : "Even"}</div>
            </div>
            <div className="casino-result-desc-item">
              <div>Red/Black</div>
              <div>{lastColor}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
