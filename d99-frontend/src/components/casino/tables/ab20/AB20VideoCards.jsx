import { useMemo, useRef, useEffect, memo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CARD_BASE = "/assets/img/cards/";
const CARD_BACK = "/assets/img/cards/1.jpg";

function cardSrc(code) {
  if (!code || code === "1") return CARD_BACK;
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

export default function AB20VideoCards({ cardString = "" }) {
  const allCards = useMemo(() => {
    if (!cardString) return [];
    return cardString.split(",").map((c) => c.trim()).filter((c) => c && c !== "1");
  }, [cardString]);

  // Cards alternate: first=Bahar, second=Andar, third=Bahar...
  const andarCards = useMemo(() => allCards.filter((_, i) => i % 2 === 1), [allCards]);
  const baharCards = useMemo(() => allCards.filter((_, i) => i % 2 === 0), [allCards]);

  return (
    <div className="casino-video-cards">
      <div className="ab-cards-container">
        <h5>Andar</h5>
        <CardStrip cards={andarCards} />
        <h5>Bahar</h5>
        <CardStrip cards={baharCards} />
      </div>
    </div>
  );
}
