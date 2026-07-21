import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CARD_BASE = "/assets/img/cards/";

function cardSrc(code) {
  if (!code || code === "1" || code === "0") return null;
  return `${CARD_BASE}${code.trim()}.jpg`;
}

function CardSlider({ cards }) {
  const settings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: false,
  };
  if (cards.length === 0) return null;
  return (
    <Slider {...settings}>
      {cards.map((code, i) => (
        <div key={i}>
          <img src={cardSrc(code)} alt="" style={{ width: "100%", display: "inline-block" }} />
        </div>
      ))}
    </Slider>
  );
}

export default function ABJResultContent({ detailData }) {
  const t1 = detailData?.data?.data?.t1 || detailData?.data?.t1 || {};
  const { card = "", mtime = "", rid = "", rdesc = "", winnat = "" } = t1;

  const allTokens = card ? card.split(",").map((c) => c.trim()) : [];
  const dealt = allTokens.filter((c) => c && c !== "1" && c !== "0");

  // Token 0 = Joker, then alternating: B(1), A(2), B(3), A(4), ...
  const jokerCard = dealt[0] || null;
  const afterJoker = dealt.slice(1);
  const bCards = afterJoker.filter((_, i) => i % 2 === 0); // indices 0,2,4 = B
  const aCards = afterJoker.filter((_, i) => i % 2 === 1); // indices 1,3,5 = A

  // rdesc: "Bahar#Spade#Even#8"
  const descParts = rdesc ? rdesc.split("#") : [];
  const winner = descParts[0] || winnat || "";
  const suit = descParts[1] || "";
  const oddEven = descParts[2] || "";
  const jokerVal = descParts[3] || "";

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
      <div className="row row5 ab2-result-container">
        <div className="col-1">
          <div className="row row5"><div className="col-12"><b>A</b></div></div>
          <div className="row row5"><div className="col-12"><b>B</b></div></div>
        </div>
        <div className="col-2">
          {jokerCard && <img src={cardSrc(jokerCard)} alt="" />}
        </div>
        <div className="col-9">
          {/* A row */}
          <div className="row row5">
            <div className="col-3">
              {aCards[0] && <img src={cardSrc(aCards[0])} alt="" />}
            </div>
            <div className="col-9 ab-result-slider">
              {aCards.length > 1 && <CardSlider cards={aCards.slice(1)} />}
            </div>
          </div>
          {/* B row */}
          <div className="row row5">
            <div className="col-3">
              {bCards[0] && <img src={cardSrc(bCards[0])} alt="" />}
            </div>
            <div className="col-9 ab-result-slider">
              {bCards.length > 1 && <CardSlider cards={bCards.slice(1)} />}
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-2 justify-content-center">
        <div className="col-md-6">
          <div className="casino-result-desc">
            {winner && (
              <div className="casino-result-desc-item">
                <div>Winner</div>
                <div>{winner}</div>
              </div>
            )}
            {suit && (
              <div className="casino-result-desc-item">
                <div>Suit</div>
                <div>{suit}</div>
              </div>
            )}
            {oddEven && (
              <div className="casino-result-desc-item">
                <div>Odd/Even</div>
                <div>{oddEven}</div>
              </div>
            )}
            {jokerVal && (
              <div className="casino-result-desc-item">
                <div>Joker</div>
                <div>{jokerVal}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
