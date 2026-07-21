import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CARD_BASE = "/assets/img/cards/";

function cardSrc(code) {
  if (!code || code === "1") return null;
  return `${CARD_BASE}${code.trim()}.jpg`;
}

export default function AB4ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", rdesc = "", winnat = "" } = t1;

  const allCards = card ? card.split(",").map((c) => c.trim()).filter((c) => c && c !== "1") : [];
  // Even indices (0,2,4...) = Bahar, Odd indices (1,3,5...) = Andar
  const baharCards = allCards.filter((_, i) => i % 2 === 0);
  const andarCards = allCards.filter((_, i) => i % 2 === 1);

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch { /* keep original */ }

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 6,
    slidesToScroll: 6,
    arrows: true,
  };

  function renderCardSlider(cards, startNum) {
    return (
      <div className="casino-result-cards ab-result-slider">
        <Slider {...sliderSettings}>
          {cards.map((code, i) => {
            const src = cardSrc(code);
            const cardNum = startNum + i * 2;
            return (
              <div key={i}>
                <div className="text-center">{cardNum}</div>
                {src && <img src={src} alt="" />}
              </div>
            );
          })}
        </Slider>
      </div>
    );
  }

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>
      <div className="row mt-2 ab-result-container">
        <div className="col-md-12 text-center">
          {renderCardSlider(baharCards, 2)}
        </div>
        <div className="col-md-12 text-center mt-1">
          <div className="mb-2">
            {renderCardSlider(andarCards, 1)}
          </div>
        </div>
      </div>
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{rdesc || winnat || "Win"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
