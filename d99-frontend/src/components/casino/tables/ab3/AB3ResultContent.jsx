import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CARD_BASE = "/assets/img/cards/";

function cardSrc(code) {
  if (!code || code === "1") return null;
  return `${CARD_BASE}${code.trim()}.jpg`;
}

function formatTime(mtime) {
  if (!mtime) return "";
  try {
    const d = new Date(mtime);
    if (isNaN(d)) return mtime;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch { return mtime; }
}

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 300,
  slidesToShow: 5,
  slidesToScroll: 5,
  initialSlide: 0,
  arrows: true,
};

export default function AB3ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", rdesc = "", winnat = "" } = t1;

  const allTokens = card ? card.split(",").map((c) => c.trim()) : [];
  const dealt = allTokens.filter((c) => c && c !== "1");

  // Even positions (0-indexed) = row 1 (shown with even card numbers: 2,4,6...)
  // Odd positions = row 2 (shown with odd card numbers: 1,3,5...)
  const row1 = []; // even index cards with even card numbers
  const row2 = []; // odd index cards with odd card numbers
  dealt.forEach((code, i) => {
    const cardNum = i + 1;
    if (cardNum % 2 === 0) {
      row1.push({ num: cardNum, code });
    } else {
      row2.push({ num: cardNum, code });
    }
  });

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formatTime(mtime)}</span>
      </div>

      <div className="row mt-2 ab-result-container">
        <div className="col-md-12 text-center">
          <div className="casino-result-cards ab-result-slider">
            <Slider {...sliderSettings}>
              {row1.map((c, i) => (
                <div key={i}>
                  <div className="text-center">{c.num}</div>
                  <img src={cardSrc(c.code)} alt={c.code} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
        <div className="col-md-12 text-center mt-1">
          <div className="casino-result-cards ab-result-slider mb-2">
            <Slider {...sliderSettings}>
              {row2.map((c, i) => (
                <div key={i}>
                  <div className="text-center">{c.num}</div>
                  <img src={cardSrc(c.code)} alt={c.code} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{winnat || rdesc || "Win"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
