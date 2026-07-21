import { useMemo, useRef, useEffect, memo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CARD_BASE = "/assets/img/cards/";
const CARD_BACK = "/assets/img/cards/1.jpg";

function cardSrc(code) {
  if (!code || code === "1" || code === "0") return CARD_BACK;
  return `${CARD_BASE}${code}.jpg`;
}

const CardStrip = memo(function CardStrip({ cards }) {
  const sliderRef = useRef(null);
  const prevLen = useRef(cards.length);

  useEffect(() => {
    if (cards.length !== prevLen.current && sliderRef.current) {
      prevLen.current = cards.length;
      sliderRef.current.slickGoTo(Math.max(0, cards.length - 3));
    }
  }, [cards.length]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: Math.max(0, cards.length - 3),
    arrows: true,
  };

  if (cards.length === 0) return null;

  return (
    <div className="ms-4">
      <Slider ref={sliderRef} {...settings}>
        {cards.map((code, i) => (
          <div key={i}>
            <img src={cardSrc(code)} alt="" style={{ width: "100%", display: "inline-block" }} />
          </div>
        ))}
      </Slider>
    </div>
  );
});

export default function Dum10VideoCards({ cardString = "", tableData: gameData }) {
  const raw = gameData?.data?.data || gameData?.data || gameData || {};

  // Use lcard for history cards, csum for total
  const lcard = raw.lcard || "";
  const csum = raw.csum || 0;
  const currentCard = cardString && cardString !== "1" ? cardString.split(",")[0]?.trim() : null;

  const historyCards = useMemo(() => {
    if (!lcard) return [];
    return lcard.split(",").map((c) => c.trim()).filter((c) => c && c !== "1");
  }, [lcard]);

  const cardCount = historyCards.length;

  // Main bet nat
  const sub = raw.sub || [];
  const mainBet = sub.find((s) => s.subtype === "dum10");
  const mainNat = mainBet?.nat || "";

  return (
    <>
      <div className="casino-video-cards">
        <div className="dkd-total mb-1 mt-1">
          <div>
            <div>
              <div>Curr. Total:</div>
              <div className="numeric text-playerb">{csum}</div>
            </div>
            <div>Card #: {cardCount}</div>
          </div>
          <div>{mainNat}</div>
        </div>

        <div className="ab-cards-container">
          <CardStrip cards={historyCards} />
        </div>
      </div>

      <div className="casino-video-current-card">
        <div className="flip-card">
          <div className="flip-card-inner ">
            <div className="flip-card-front">
              <img src={currentCard ? cardSrc(currentCard) : CARD_BACK} alt="" />
            </div>
            <div className="flip-card-back">
              <img src={currentCard ? cardSrc(currentCard) : CARD_BACK} alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
