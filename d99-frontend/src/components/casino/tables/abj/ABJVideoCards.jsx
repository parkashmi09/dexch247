import { useMemo, useRef, useEffect, useState, memo } from "react";
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
    arrows: cards.length > 3,
  };

  if (cards.length === 0) return null;

  return (
    <Slider ref={sliderRef} {...settings}>
      {cards.map((code, i) => (
        <div key={i}>
          <img src={cardSrc(code)} alt="" style={{ width: "100%", display: "inline-block" }} />
        </div>
      ))}
    </Slider>
  );
});

export default function ABJVideoCards({ cardString = "" }) {
  const allCards = useMemo(() => {
    if (!cardString) return [];
    return cardString.split(",").map((c) => c.trim());
  }, [cardString]);

  // First card is the joker/trump card
  const trumpCard = allCards[0] && allCards[0] !== "1" && allCards[0] !== "0" ? allCards[0] : null;
  // Remaining cards: even index (0) = B, odd index (1) = A
  const dealt = useMemo(
    () => allCards.slice(1).filter((c) => c !== "1" && c !== "0"),
    [allCards]
  );
  const aCards = useMemo(() => dealt.filter((_, i) => i % 2 === 1), [dealt]);
  const bCards = useMemo(() => dealt.filter((_, i) => i % 2 === 0), [dealt]);

  if (!trumpCard && aCards.length === 0 && bCards.length === 0) return null;

  return (
    <div className="casino-video-cards">
      <div className="ab-cards-container">
        <div className="row row5 align-items-center">
          <div className="col-1">
            <div className="row row5">
              <div className="col-12"><b>A</b></div>
            </div>
            <div className="row row5 mt-1">
              <div className="col-12"><b>B</b></div>
            </div>
          </div>
          <div className="col-2">
            {trumpCard && (
              <img src={cardSrc(trumpCard)} alt="trump" style={{ width: "100%" }} />
            )}
          </div>
          <div className="col-9">
            {/* Row A */}
            <div className="row row5 mb-1">
              <div className="col-3">
                {aCards[0] && (
                  <img src={cardSrc(aCards[0])} alt="" style={{ width: "100%" }} />
                )}
              </div>
              <div className="col-9">
                {aCards.length > 1 && <CardStrip cards={aCards.slice(1)} />}
              </div>
            </div>
            {/* Row B */}
            <div className="row row5">
              <div className="col-3">
                {bCards[0] && (
                  <img src={cardSrc(bCards[0])} alt="" style={{ width: "100%" }} />
                )}
              </div>
              <div className="col-9">
                {bCards.length > 1 && <CardStrip cards={bCards.slice(1)} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
