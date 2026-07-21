import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CARD_BASE = "/assets/img/cards/";

function cardSrc(code) {
  if (!code || code === "1") return null;
  return `${CARD_BASE}${code.trim()}.jpg`;
}

function CardSlider({ cards }) {
  const settings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 12,
    slidesToScroll: 12,
    arrows: false,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 8, slidesToScroll: 8 } },
      { breakpoint: 480, settings: { slidesToShow: 6, slidesToScroll: 6 } },
    ],
  };

  return (
    <Slider {...settings}>
      {cards.map((code, i) => (
        <div key={i}>
          <img src={cardSrc(code)} alt="" />
        </div>
      ))}
    </Slider>
  );
}

export default function AB20ResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", rdesc = "" } = t1;

  const allCards = card ? card.split(",").map((c) => c.trim()).filter((c) => c && c !== "1") : [];
  // Split into two rows of 12
  const row1 = allCards.slice(0, 12);
  const row2 = allCards.slice(12, 24);

  let formattedTime = mtime;
  try {
    const d = new Date(mtime);
    if (!isNaN(d)) {
      formattedTime = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
  } catch {}

  return (
    <div className="casino-result-modal">
      <div className="casino-result-round-id">
        <span><b>Round Id: </b> {rid}</span>
        <span><b>Match Time: </b>{formattedTime}</span>
      </div>
      <div className="row mt-2 ab-result-container">
        <div className="col-md-12 text-center">
          <div className="casino-result-cards ab-result-slider">
            {row1.length > 0 && <CardSlider cards={row1} />}
          </div>
        </div>
        <div className="col-md-12 text-center mt-1">
          <div className="casino-result-cards ab-result-slider mb-2">
            {row2.length > 0 && <CardSlider cards={row2} />}
          </div>
        </div>
      </div>
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            <div className="casino-result-desc-item">
              <div>Winner</div>
              <div>{rdesc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
